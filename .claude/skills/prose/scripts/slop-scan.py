#!/usr/bin/env python3
"""Deterministic AI-pattern scanner for prose.

Scans text for mechanical AI-writing tells: chat debris, typography
conventions, formula phrases, and structural regularity metrics. Output is
stable and sorted, so repeated runs on the same input produce identical
results — usable as a gate in a rewrite loop.

A hit is a place to look, not an automatic rewrite. Every phrase and
typography hit must be verified against the false-positive rules
(references/ai-patterns-universal.md, "What NOT to Flag") before editing.
Only DEBRIS hits are unconditional.

Usage:
    slop-scan.py FILE [FILE...]          scan files
    cat draft.md | slop-scan.py          scan stdin
    slop-scan.py --channel im FILE       skip checks that don't apply to IM
    slop-scan.py --allow em-dash FILE    suppress a rule (e.g. voice profile
                                         permits em dashes)

Each channel suppresses the rules that its medium legitimately breaks — see
CHANNEL_SUPPRESS. Procedures are meant to be uniform; dialogue is meant to
use dashes. DEBRIS is never suppressed, by channel or by --allow.

Exit codes: 0 clean (structure notes only), 1 phrase/typography hits,
2 debris present.
"""

import argparse
import re
import sys
import unicodedata

# --- Rule tables ------------------------------------------------------------
# Each rule: (rule-id, severity, compiled-regex, hint)
# severity: DEBRIS (always fix) | FLAG (verify, then fix) | NOTE (judgment)

DEBRIS = [
    ("chat-closer", r"\b(I hope this helps|Let me know if you|Would you like me to)\b",
     "chat-session phrase leaked into the text"),
    ("chat-opener", r"\b(Certainly!|Of course!|Great question|You're absolutely right)",
     "chat-session phrase leaked into the text"),
    ("cutoff", r"\b[Aa]s of my (last (training )?update|knowledge cutoff)\b",
     "model self-reference"),
    ("search-residue", r"\b(in the provided search results|based on available information)\b",
     "retrieval residue"),
    ("citation-debris", r"(utm_source=(chatgpt\.com|openai)|referrer=grok\.com|turn\d+search\d+|oaicite|oai_citation|attributableIndex|\[cite:)",
     "machine citation debris in links or text"),
    ("placeholder", r"\[(Your Name|Your Company|Insert [^\]]+|Describe [^\]]+|ADD [^\]]+)\]|20\d\d-XX-XX",
     "unfilled placeholder"),
]

TYPOGRAPHY = [
    ("em-dash", r"—|–| -- ",
     "em/en dash: allowed only if the voice profile or medium permits it"),
    ("mixed-quotes", None,  # handled specially: both curly and straight in one text
     "curly and straight quotes mixed in one text"),
    ("arrows", r"[→⇒←↔⟶⟹]",
     "unicode arrow in prose: type -> or write the verb"),
]

# Formula phrases. Grouped by the habit behind them; the regexes are literal.
PHRASES = [
    # inflated significance
    ("inflation", r"\b(stands|serves) as a (testament|reminder)\b", "inflated significance"),
    ("inflation", r"\bplays? a (vital|significant|crucial|pivotal|key) role\b", "inflated significance"),
    ("inflation", r"\bunderscor(es|ing) (its|the) (importance|significance)\b", "inflated significance"),
    ("inflation", r"\b(left an indelible mark|enduring legacy|cannot be overstated|a pivotal moment|key turning point)\b", "inflated significance"),
    # stakes inflated to world-historical scale
    ("inflation", r"\bdefine the (next|coming) (era|decade|generation|chapter)\b", "grandiose stakes"),
    ("inflation", r"\bfundamentally (reshap\w+|alter\w+|transform\w+|chang\w+)\b", "grandiose stakes"),
    ("inflation", r"\bchanges everything\b|\breshape how we think about\b", "grandiose stakes"),
    # promotional tone
    ("promo", r"\b(boasts? a|nestled in|in the heart of|breathtaking|state-of-the-art|cutting-edge|commitment to excellence|rich (heritage|history|tapestry))\b", "promotional tone"),
    ("promo", r"\b(seamlessly|effortlessly|groundbreaking|must-visit|renowned)\b", "promotional tone"),
    # negative parallelism family
    ("parallelism", r"\bnot (just|only|merely) \w+[^.!?]{0,60}\bbut\b", "negative parallelism"),
    ("parallelism", r"\b[Ii]t'?s not (about )?\w+[^.!?]{0,40}[,;] it'?s\b", "negative parallelism"),
    ("parallelism", r"\bThat'?s not [a-z][^.!?]*\. That'?s\b", "upgraded negative parallelism"),
    ("parallelism", r"\b[Tt]his isn'?t \w+[^.!?]{0,40}[,;] it'?s\b", "negative parallelism"),
    # Countdown negation: two negated fragments before the reveal. The rules
    # above all need a 'but' or a comma splice, so this shape slips past them.
    ("parallelism", r"\bNot\b[^.!?]{1,40}\.\s+Not\b", "countdown negation"),
    ("parallelism", r"\bnot \w+ly, not \w+ly\b", "countdown negation"),
    # A question nobody asked, answered on the spot. The tell is the shape:
    # a bare determiner-led noun phrase, a question mark, then the payoff.
    ("rhetorical-fragment", r"(?:^|[.!?]\s+)(?:The|Their|His|Her|Its|Our|My) (?:\w+ ){0,2}\w+\?(?=\s+[A-Z])",
     "self-posed question answered on the spot"),
    # didactic disclaimers
    ("disclaimer", r"\b[Ii]t('?s| is) (important|crucial|critical|worth) (to note|to remember|noting|mentioning)\b", "didactic disclaimer"),
    ("disclaimer", r"\b[Ii]t should be noted that\b|\b[Kk]eep in mind that\b", "didactic disclaimer"),
    # mechanical connectives
    ("connective", r"(?:^|[.!?]\s+)(Additionally|Moreover|Furthermore|Consequently),", "mechanical connective (sentence-initial)"),
    ("connective", r"\b[Ii]n today'?s (fast-paced|digital|ever-evolving|modern) (world|landscape|environment)\b", "stock opener"),
    ("connective", r"\b[Ww]hen it comes to\b|\b[Aa]t the end of the day\b|\b[Ii]n the (realm|landscape) of\b", "stock connective"),
    # AI vocabulary (era-dependent; literal hits only)
    ("vocab", r"\b(delve|delves|delving)\b", "AI vocabulary"),
    ("vocab", r"\btapestry\b|\btestament to\b|\bintricacies\b|\bmeticulous(ly)?\b", "AI vocabulary"),
    ("vocab", r"\b(garner(ed|s)?|bolster(ed|s)?|foster(ing|ed|s)?|interplay|multifaceted|holistic)\b", "AI vocabulary"),
    ("vocab", r"\b(game-chang\w+|revolutioniz\w+|paradigm shift|unlock the full potential|take .{0,20}to the next level)\b", "dramatization"),
    # copula avoidance
    ("copula", r"\b(serves|stands|acts|functions) as\b", "copula avoidance: try plain 'is'"),
    ("copula", r"\brefers to (a|an|the)\b", "definition dodge: try 'X is'"),
    ("copula", r"\bholds the distinction of\b", "copula avoidance"),
    # vague attribution
    ("attribution", r"\b([Ee]xperts (argue|believe|note|say)|[Oo]bservers have (cited|noted)|[Ii]ndustry reports (show|suggest)|widely (regarded|recognized) as|[Mm]any believe)\b", "vague attribution: name the source or cut"),
    ("attribution", r"\b[Rr]esearch (shows|suggests) that\b", "unnamed research: name it or cut"),
    # fake casualness and recycled hooks
    ("hook", r"\b[Hh]ere'?s the thing[:.]|\b[Ll]et'?s be (honest|real)\b|\bSpoiler( alert)?:|\bPlot twist:|\bthe secret sauce\b", "fake casualness"),
    ("hook", r"\bThe real question is\b|\bHere'?s what that means( in practice)?\b|\bThe part that got me\b", "recycled hook (post-cleanup tell)"),
    ("hook", r"\b[Ll]et'?s (dive|delve) in(to)?\b|\b[Ww]ithout further ado\b|\bhere'?s what you need to know\b", "signposting"),
    # suspense promised, revelation not delivered
    ("hook", r"\b[Hh]ere'?s (the kicker|the deal|the twist|the catch)\b", "manufactured suspense"),
    ("hook", r"\b[Hh]ere'?s (where it gets \w+|what (most people|nobody|everyone) \w+)", "manufactured suspense"),
    ("hook", r"\b[Tt]he real story is\b|\bnone of (them|that) is the real\b", "dramatic reveal"),
    # the point asserted instead of argued
    ("asserted-obvious", r"\b[Tt]he (truth|reality|answer|math) is (simple|simpler|clear|obvious|unambiguous)\b",
     "asserted rather than shown"),
    ("asserted-obvious", r"\b[Hh]istory is (clear|unambiguous)\b|\b[Tt]he (metrics|numbers|examples|data) are clear\b",
     "asserted rather than shown"),
    # explainer reflex: the reader is assumed to need a metaphor
    ("analogy-framing", r"\b[Tt]hink of (it|this|them|these) (as|like)\b", "patronizing analogy frame"),
    # futurism invitation
    ("futurism", r"\b[Ii]magine (a world|a future|a version of|if every)\b", "futurism invitation"),
    # Significance supplied by adverb. The verb is required: without it the rule
    # eats 'she answered quietly' and 'a deeply nested config', which are fine.
    # 'fundamentally' is deliberately absent — the inflation rule owns it.
    ("adverb", r"\b(quietly|deeply|profoundly|radically|remarkably|subtly)\s+"
               r"(reshap|transform|redefin|orchestrat|disrupt|alter|rewrit|reinvent|reimagin|upend|reconfigur)\w*",
     "significance supplied by adverb"),
    # self-summary and template endings
    ("summary", r"\b[Ii]n (summary|conclusion)\b|\bTo sum up\b|\bAll in all\b|^Overall,", "self-summary"),
    ("summary", r"\bDespite these challenges\b|\bChallenges and Future (Outlook|Prospects|Directions)\b", "challenges-and-prospects template"),
    ("summary", r"\b[Tt]he future (of \w+ )?(looks bright|is here)\b|\b[Ee]xciting times (lie )?ahead\b", "vague hopeful ending"),
    # empty merisms
    ("merism", r"\bfrom (startups to enterprises|concept to launch|beginners to (professionals|experts))\b", "empty merism"),
    # verdict verbs
    ("verdict", r"\b(quietly kills|demolishes|buries|eviscerates) \b", "verdict verb (post-cleanup tell)"),
    # verb buried in a noun: the action is the noun, so the verb goes empty
    ("nominalization", r"\b([Pp]erform|[Cc]onduct|[Uu]ndertake|[Ee]xecute|[Cc]arry out)s?\b[^.!?]{0,12}\b\w+(tion|sion|ment|sis|ance|ence)\b", "nominalization: use the verb"),
    ("nominalization", r"\b([Mm]akes?|[Mm]ade)\s+an?\s+(determination|assessment|decision|assumption|recommendation|contribution|comparison|selection)\b", "nominalization: use the verb"),
    ("nominalization", r"\b[Pp]rovide(s|d)?\s+(an?|the)\s+(explanation|description|indication|overview|assessment|summary)\s+of\b", "nominalization: use the verb"),
    ("nominalization", r"\b[Tt]ake into consideration\b|\b[Gg]ive consideration to\b|\b[Ii]s an indication of\b|\b[Rr]each a conclusion\b", "nominalization: use the verb"),
    # words that can be cut without losing anything
    ("wordiness", r"\b[Ii]n order to\b|\b[Dd]ue to the fact that\b|\b[Ff]or the purpose of\b", "wordy: cut to a shorter form"),
    ("wordiness", r"\b[Aa]t (this|that) point in time\b|\b[Ii]n the event that\b|\b[Hh]as the ability to\b", "wordy: cut to a shorter form"),
]

# Words that cannot head a noun stack. A run of content words with none of
# these in it is a pile of nouns doing a preposition's job.
FUNCTION_WORDS = frozenset("""
a an the this that these those and or but nor so yet for of in on at to from
by with without within into onto over under is are was were be been being am
has have had do does did will would shall should can could may might must not
no if then than as such it its he she they them their his her our your my we
you i us me him there here when where while which who whom whose what how why
each every all any some both few many most other another same per via across
after before between during through upon about against because although since
""".split())

# High-frequency verbs and adverbs that look like nouns to a tokenizer.
# Excluding them costs a few true positives and prevents a lot of false ones.
VERBISH = frozenset("""
need needs make makes take takes use uses using get gets give gives help helps
show shows keep keeps find finds know knows want wants see sees say says go
goes come comes run runs work works build builds add adds set sets put puts
let lets try tries move moves send sends read reads write writes call calls
feel feels look looks stay stays turn turns start starts stop stops leave
leaves means mean pick picks name names state states check checks cut cuts
carry carries hide hides hiding hold holds break breaks bring brings drop
drops treat treats apply applies count counts mark marks note notes
still just only also even more less very too well back off out up down again
always never often once now soon already instead rather quite enough ahead
""".split())

# A noun stack sits inside a noun phrase, so it opens with a determiner or a
# preposition. Requiring that anchor keeps verb phrases out of the results.
NOUN_STACK_ANCHOR = frozenset("""
the a an this that these those each every any our your its their his her my
of for in with to on by from at about across
""".split())

# A real stack is mostly derived nouns. Requiring two of them separates
# 'customer data retention policy update process' from 'at least one concrete
# anchor', which is four plain words in a row and perfectly readable.
NOMINAL_SUFFIX = ("tion", "sion", "ment", "ance", "ence", "ity", "ness",
                  "ship", "ure", "ing", "ism", "ology", "ency", "ancy",
                  "ery", "er", "or", "age")

NOUN_STACK_MIN = 4
NOUN_STACK_MIN_NOMINAL = 2

INLINE_CODE = re.compile(r"`[^`]*`")
MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
# Any punctuation ends a run. Without this, a comma list reads as one pile.
PUNCT_BREAK = re.compile(r"[^A-Za-z\s'’-]+")

HEDGE_WORDS = re.compile(
    r"\b(probably|perhaps|maybe|I think|seems?|appears?|arguably|likely|"
    r"unclear|not sure|hypothesis|might|may\b|could be|I suspect|hard to say)\b",
    re.IGNORECASE)

EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")

SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")

# A list wearing paragraph clothes. The verb has to sit right behind the noun:
# 'The first wall is' is a labelled list item, 'The first one needs a slope' is
# a sentence. Without that anchor the rule eats ordinary ordinal prose.
# \s+ rather than a literal space: this runs over the whole text, where a
# wrapped line puts a newline in the middle of the phrase.
ORDINAL_LEAD = re.compile(
    r"\bThe\s+(first|second|third|fourth|fifth)\s+\w+\s+(is|was|comes|involves)\b")

# Repeating the opening of a sentence is a device; repeating it three times in
# a row is a machine finding a groove.
ANAPHORA_MIN_RUN = 3

# Word floors for duplicate detection. Short repeats are ordinary — headings,
# list stubs, 'See below.' — so only substantial blocks count as duplication.
DUP_PARA_MIN_WORDS = 15
DUP_SENT_MIN_WORDS = 12

NORMALIZE_STRIP = re.compile(r"[^a-z0-9 ]+")

# An abstract problem-noun welded to a domain word and used as if it were an
# established term. One is usually a real term of art; a cluster is the tell,
# so this reports only when two distinct labels share a text.
CONCEPT_LABEL = re.compile(
    r"\b(?:the\s+)?([a-z][a-z-]{2,})\s+"
    r"(paradox|trap|fallacy|inversion|vacuum|divide|creep|dilemma)\b")

# Terms that fit the shape but are genuinely established. Naming them here is
# cheaper than trying to write a regex that can tell coinage from convention.
CONCEPT_LABEL_ALLOW = frozenset(t.strip() for t in """
scope creep, feature creep, mission creep, requirement creep, requirements creep,
digital divide, great divide, cultural divide, partisan divide, racial divide,
cost fallacy, naturalistic fallacy, logical fallacy, common fallacy, gamblers fallacy,
productivity paradox, fermi paradox, liar paradox, birthday paradox, simpsons paradox,
poverty trap, liquidity trap, value trap, tourist trap, speed trap, death trap,
population inversion, yield inversion, curve inversion, temperature inversion,
power vacuum, security vacuum, policy vacuum, leadership vacuum,
security dilemma, ethical dilemma, moral dilemma, false dilemma, prisoners dilemma,
innovators dilemma, social dilemma
""".split(",") if t.strip())


# Rules each channel legitimately breaks. Suppressed by default; --allow adds
# to this, never subtracts. DEBRIS ignores both.
#
# docs — a procedure is supposed to be uniform. Steady sentence length and
#   matching paragraph shapes are what make steps followable, and a runbook
#   that hedges is a defective runbook. Procedures also enumerate steps, repeat
#   warning blocks on purpose, and write menu paths as 'File > Save'.
# creative — dashes mark interrupted speech, and the hook and parallelism
#   patterns fire on things a character can plausibly say. Vocabulary,
#   promotional, and self-summary rules still apply: those are slop in any
#   genre. Anaphora is a deliberate device in verse, not a groove.
CHANNEL_SUPPRESS = {
    "blog": frozenset(),
    "social": frozenset({"emoji"}),
    "email": frozenset(),
    "im": frozenset({"monotony", "no-short-sentences", "uniform-paragraphs",
                     "uniform-confidence", "aphorism-budget",
                     "title-case-heading", "emoji",
                     "anaphora", "ordinal-listicle", "duplicate-block"}),
    "docs": frozenset({"monotony", "no-short-sentences", "uniform-paragraphs",
                       "uniform-confidence", "aphorism-budget",
                       "anaphora", "ordinal-listicle", "duplicate-block",
                       "arrows"}),
    "creative": frozenset({"em-dash", "monotony", "no-short-sentences",
                           "uniform-confidence", "aphorism-budget",
                           "title-case-heading", "hook", "parallelism",
                           "noun-stack",
                           "anaphora", "rhetorical-fragment",
                           "analogy-framing", "futurism", "concept-label"}),
}


def normalize_block(text):
    """Lowercase, strip punctuation, collapse whitespace — for equality only."""
    return " ".join(NORMALIZE_STRIP.sub(" ", text.lower()).split())


def first_words(sentence, n=2):
    """The first n words, lowercased and stripped, or None if too short."""
    words = normalize_block(sentence).split()
    return " ".join(words[:n]) if len(words) >= n else None


def noun_stack_hits(line):
    """Runs of content words with no function word to join them.

    'the customer data retention policy update process' asks the reader to
    infer every relationship the prepositions would have stated.
    """
    stripped = MD_LINK.sub(r"\1", INLINE_CODE.sub(" ", line))
    out = []
    for segment in PUNCT_BREAK.split(stripped):
        words = segment.split()
        i = 0
        while i < len(words):
            if words[i].lower() not in NOUN_STACK_ANCHOR:
                i += 1
                continue
            run = []
            j = i + 1
            while j < len(words):
                w = words[j].lower().strip("'’-")
                # -ly is an adverb, -ed a participle: neither heads a noun stack.
                if (not w or w in FUNCTION_WORDS or w in VERBISH
                        or w.endswith("ly") or w.endswith("ed")):
                    break
                run.append(words[j])
                j += 1
            nominal = sum(1 for w in run if w.lower().endswith(NOMINAL_SUFFIX))
            if len(run) >= NOUN_STACK_MIN and nominal >= NOUN_STACK_MIN_NOMINAL:
                out.append(" ".join([words[i]] + run))
                i = j
            else:
                i += 1
    return out


def compile_rules():
    rules = []
    for rid, pat, hint in DEBRIS:
        rules.append((rid, "DEBRIS", re.compile(pat), hint))
    for rid, pat, hint in TYPOGRAPHY:
        if pat:
            rules.append((rid, "FLAG", re.compile(pat), hint))
    for rid, pat, hint in PHRASES:
        rules.append((rid, "FLAG", re.compile(pat, re.MULTILINE), hint))
    return rules


def is_prose_line(line):
    s = line.strip()
    if not s or s.startswith(("#", "|", ">", "```", "    ")):
        return False
    return True


def sentences(text):
    out = []
    for para in re.split(r"\n\s*\n", text):
        lines = [l for l in para.splitlines() if is_prose_line(l)]
        if not lines:
            continue
        for s in SENT_SPLIT.split(" ".join(lines)):
            s = s.strip()
            if s:
                out.append(s)
    return out


def paragraphs(text):
    out = []
    for para in re.split(r"\n\s*\n", text):
        lines = [l for l in para.splitlines() if is_prose_line(l)]
        if lines:
            out.append(" ".join(lines))
    return out


def structure_notes(text):
    """Every structural note the text earns. Channel filtering happens in scan()."""
    notes = []
    sents = sentences(text)
    words = sum(len(s.split()) for s in sents)

    # Sentence-length monotony: any window of 5 consecutive sentences whose
    # lengths all sit in a narrow mid band reads machine-regular.
    lengths = [len(s.split()) for s in sents]
    flagged_windows = 0
    for i in range(len(lengths) - 4):
        window = lengths[i:i + 5]
        if max(window) - min(window) <= 5 and all(8 <= n <= 28 for n in window):
            flagged_windows += 1
    if flagged_windows:
        notes.append(("monotony", f"{flagged_windows} window(s) of 5 consecutive "
                      "sentences with near-identical mid-band lengths — vary the rhythm"))

    if lengths and words > 200 and not any(n < 6 for n in lengths):
        notes.append(("no-short-sentences", "no sentence under 6 words in the whole "
                      "text — good prose usually has a few"))

    # Paragraph uniformity
    paras = paragraphs(text)
    counts = [len(SENT_SPLIT.split(p)) for p in paras]
    if len(counts) >= 5 and max(counts) - min(counts) <= 1:
        notes.append(("uniform-paragraphs", f"all {len(counts)} paragraphs have "
                      f"{min(counts)}–{max(counts)} sentences — pre-computed shape"))

    # Uniform confidence: long text, zero hedges anywhere
    if words > 600 and not HEDGE_WORDS.search(text):
        notes.append(("uniform-confidence", "no hedge anywhere in a long text — "
                      "confidence should be uneven; put one where the claim is soft"))

    # Aphorism-close heuristic: many paragraphs ending on a short punchy line
    punchy = 0
    for p in paras:
        last = SENT_SPLIT.split(p)[-1].strip()
        if 0 < len(last.split()) <= 7 and "," not in last and last.endswith("."):
            punchy += 1
    if punchy >= 3:
        notes.append(("aphorism-budget", f"{punchy} paragraphs close on a short "
                      "punchy line — budget is one per text"))

    # Anaphora: three or more consecutive sentences opening the same way.
    run_prefix, run_len = None, 0
    for s in sents + [""]:
        prefix = first_words(s)
        if prefix is not None and prefix == run_prefix:
            run_len += 1
            continue
        if run_prefix and run_len >= ANAPHORA_MIN_RUN:
            notes.append(("anaphora", f"{run_len} consecutive sentences open with "
                          f"{run_prefix!r} — vary the opening"))
        run_prefix, run_len = prefix, 1

    # A numbered list rewritten as paragraphs to look like prose.
    ordinals = {m.group(1) for m in ORDINAL_LEAD.finditer(text)}
    if len(ordinals) >= 2:
        notes.append(("ordinal-listicle", f"{len(ordinals)} ordinal-labelled sentence "
                      "openings — this is a list wearing paragraph clothes"))

    # Verbatim duplication: the same block of text twice in one piece.
    # Paragraphs and sentences are counted in separate passes, because a
    # one-sentence paragraph appears in both lists and counting them together
    # would report every such paragraph as a duplicate of itself. A duplicated
    # paragraph also duplicates its own sentences, so a sentence already inside
    # a reported block is skipped rather than reported a second time.
    reported = []
    for blocks, floor in ((paras, DUP_PARA_MIN_WORDS), (sents, DUP_SENT_MIN_WORDS)):
        counts = {}
        for block in blocks:
            norm = normalize_block(block)
            if len(norm.split()) >= floor:
                counts[norm] = counts.get(norm, 0) + 1
        for norm, count in sorted(counts.items()):
            if count < 2 or any(norm in seen for seen in reported):
                continue
            reported.append(norm)
            excerpt = norm[:60] + ("..." if len(norm) > 60 else "")
            notes.append(("duplicate-block", f"a block appears {count} times "
                          f"verbatim: {excerpt!r}"))

    # Invented concept labels: coined terms used as if already defined.
    labels = set()
    for m in CONCEPT_LABEL.finditer(text.lower()):
        label = f"{m.group(1)} {m.group(2)}"
        if label not in CONCEPT_LABEL_ALLOW:
            labels.add(label)
    if len(labels) >= 2:
        listed = ", ".join(sorted(labels)[:4])
        notes.append(("concept-label", f"{len(labels)} coined concept labels "
                      f"({listed}) — name the thing or make the argument"))

    # Title-case headings
    for m in re.finditer(r"^(#{1,6})\s+(.+)$", text, re.MULTILINE):
        title = m.group(2).strip()
        ws = [w for w in title.split() if w.isalpha()]
        if len(ws) >= 3 and sum(1 for w in ws if w[0].isupper()) / len(ws) > 0.7:
            notes.append(("title-case-heading", f"heading looks Title Cased: {title!r}"))

    if EMOJI.search(text):
        notes.append(("emoji", "emoji present — justified only if the medium demands it"))

    return notes


def scan(text, name, channel, allowed):
    rules = compile_rules()
    allowed = set(allowed) | set(CHANNEL_SUPPRESS.get(channel, frozenset()))
    hits = []
    lines = text.splitlines()
    for lineno, line in enumerate(lines, 1):
        is_heading = line.strip().startswith("#")
        if not is_prose_line(line) and not is_heading:
            # still scan headings for phrases; skip code/tables/quotes
            continue
        for rid, sev, rx, hint in rules:
            # DEBRIS is unconditional: no channel and no --allow suppresses it.
            if sev != "DEBRIS" and rid in allowed:
                continue
            for m in rx.finditer(line):
                hits.append((lineno, sev, rid, m.group(0).strip(), hint))

        # Headings are legitimately noun-dense; only stack-check prose.
        if not is_heading and "noun-stack" not in allowed:
            for stack in noun_stack_hits(line):
                hits.append((lineno, "FLAG", "noun-stack", stack,
                             "noun stack: use prepositions to show the relationship"))

    # mixed quotes: text-wide check
    if "mixed-quotes" not in allowed:
        curly = len(re.findall(r"[“”‘’]", text))
        straight = len(re.findall(r'["\']', text))
        if curly and straight:
            hits.append((0, "FLAG", "mixed-quotes",
                         f"{curly} curly / {straight} straight",
                         "pick one quote style and hold it"))

    notes = [(rid, msg) for rid, msg in structure_notes(text) if rid not in allowed]

    # Report, deterministically ordered
    hits.sort(key=lambda h: (h[0], h[2], h[3]))
    out = []
    for lineno, sev, rid, match, hint in hits:
        loc = f"{name}:{lineno}" if lineno else name
        out.append(f"{loc}: [{sev}/{rid}] {match!r} — {hint}")
    for rid, msg in notes:
        out.append(f"{name}: [NOTE/{rid}] {msg}")

    n_debris = sum(1 for h in hits if h[1] == "DEBRIS")
    n_flag = sum(1 for h in hits if h[1] == "FLAG")
    out.append(f"{name}: summary — {n_debris} debris, {n_flag} flags, {len(notes)} structure notes")
    return out, n_debris, n_flag


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*", help="files to scan (default: stdin)")
    ap.add_argument("--channel",
                    choices=["blog", "social", "email", "im", "docs", "creative"],
                    default="blog")
    ap.add_argument("--allow", action="append", default=[], metavar="RULE-ID",
                    help="suppress a rule id (repeatable), e.g. --allow em-dash")
    args = ap.parse_args()

    allowed = set(args.allow)
    total_debris = total_flags = 0
    inputs = [(f, open(f, encoding="utf-8").read()) for f in args.files] \
        if args.files else [("<stdin>", sys.stdin.read())]

    for name, text in inputs:
        text = unicodedata.normalize("NFC", text)
        report, n_debris, n_flags = scan(text, name, args.channel, allowed)
        print("\n".join(report))
        total_debris += n_debris
        total_flags += n_flags

    if total_debris:
        sys.exit(2)
    if total_flags:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
