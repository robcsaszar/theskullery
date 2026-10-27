# Drafting Core Rules

Rules for writing new content. Load when drafting anything longer than 200 words.

## Contents

- [Default Voice](#default-voice) — used when no sample and no saved profile exist
- [Precedence](#precedence) — which rule wins when two conflict
- [Medium Routing](#medium-routing) — per-channel shape and length
- [Core Rules](#core-rules) — the bulk of this file
- [Structural Techniques (Posts and Articles)](#structural-techniques-posts-and-articles)
- [Safety Rails](#safety-rails)

---

## Default Voice

Use when no voice sample is provided.

**Style:** Declarative sentences. One idea per sentence. Subject before verb. No throat-clearing.
**Sentence length:** Short-to-medium (10–20 words typical). Occasional short punchy line for emphasis.
**Openings:** Claim or fact first — not "In today's world…" or "It's important to…"
**Endings:** Principle or consequence — not a restatement of what was just said.
**Words to avoid:** leverage, robust, seamless, comprehensive, innovative, impactful, streamline, ecosystem.
**Example tone:** "The deadline moved. That changes what we build first, not whether we build it."

---

## Precedence

When rules conflict:
1. Truth, safety, accessibility, and platform/legal requirements
2. Explicit user instructions
3. Genre and medium norms
4. Rules below

If the user asks for bullets, use bullets. If the medium requires structure, use structure.

---

## Medium Routing

Choose format and register to match the channel, not a global preference.

**Chat / comments / replies / DMs / forum posts:**
- Running prose by default
- Lists only when the information is naturally list-like or the user asked for one
- No decorative formatting or canned support tone
- Prefer straight ASCII quotes and apostrophes (curly quotes read as pasted/auto-formatted text)
- Prefer commas, colons, conjunctions, or full stops over em dashes unless the dash clearly earns its keep

**Email between colleagues:**
- Prose first; lists are fine for discrete items, decisions, or action points

**Documents / specs / reports / technical writing** (the Documentation channel):
- Structure is expected: headings, bullets, and sequence when they help scanning and precision
- One action per sentence; steps state their expected result
- Uniform paragraph shape and steady sentence length are correct here — see `channel-rules.md → Documentation`

**Web pages / help centers / UI text / public docs** (the Documentation channel):
- Answer or next action goes early
- Preserve scannability and accessibility: descriptive headings, lists for steps, descriptive link text
- Do not flatten useful structure to avoid looking templated

**Long-form posts / articles / criticism / retrospectives:**
- Structure on purpose; pick an angle
- Do not let dates, named milestones, or neat category buckets become the spine unless the user asked for that

**Fiction / poetry / memoir / scripts / lyrical prose** (the Creative channel):
- Form is the user's call; do not impose article structure on a scene or a poem
- The em-dash rule is suspended inside dialogue and verse
- Intentional ambiguity, fragments, repetition, and uneven cadence are craft — see `channel-rules.md → Creative`
- Everything else still applies: no invented facts, no inherited phrasing, no closing line that explains the piece

---

## Core Rules

Rules 5, 14, and 17 restate points Orwell made in "Politics and the English Language" (1946): prefer the short word, cut the word that does no work, prefer the active verb, and prefer the everyday equivalent to the jargon term. He closed his own list by saying to break any of the rules sooner than write something outright barbarous, which is the same instruction as rule 10 in `required-checks.md` — a rule followed past the point of sense produces its own kind of bad writing.

### 1. Anchor to the actual context before drafting

Decide what the text is, who it is for, what register it uses, what the reader needs, and — in replies — what specific thread or person it is responding to. A reply that could be pasted into any thread on the same topic reads as generic even if the prose is clean.

### 2. Fit the format to the medium

Over-structuring casual writing makes it feel templated. Under-structuring technical writing makes it harder to use. Format is part of register.

### 3. Prefer concrete specificity over polished generality

Each substantial paragraph should carry at least one concrete anchor:
- A proper noun the reader could look up
- A specific number that is not only a date or version
- A direct quote
- A named decision, moment, or thread
- A checkable detail

What does **not** count:
- "many", "various", "several", "a lot of"
- "in ways that mattered", "meaningful changes", "broad implications"
- "the standard X arc", "the usual pattern", "as is often the case"
- Vague intensifiers in place of claims: "essentially", "fundamentally", "ultimately"
- Milestone names, dates, or feature labels standing alone with no material consequence attached

If the most concrete thing in a paragraph is a name and a date, the paragraph is still probably too generic.

### 4. Specificity must be earned

Prefer fewer verified facts over many guessed ones. Do not use specificity theater:
- Invented milestone names or synthetic quotes
- Suspiciously exact claims that cannot be sourced
- Hidden-mechanism claims (internal logic, unseen motives, back-end behavior) presented as fact
- Invented norms and thresholds: no "healthy", "strong", "well within range", "realistic" without a named baseline (plan, prior period, cost, industry reference)

If you cannot verify a claim, attribute it, soften it, or cut it. An invented specific does more damage than a cliché: readers discount the cliché as filler, but they believe the invented fact.

### 5. Use plain words; allow ordinary repetition; prefer verbs

Do not chase synonyms for basic words like "problem", "change", "system", "work", or "people".
Repeat the ordinary word when it is the right word.

Prefer:
- "we changed it" → not "the implementation of the change"
- "latency dropped" → not "a reduction in latency was observed"
- "applying the rule" → not "the application of the rule"

Prefer actions happening to people over abstractions being observed by systems.

Two habits bury the verb. Both cost words and hide who did what.

**Nominalization** — the action becomes a noun and the verb goes empty:

❌ "The team will perform an analysis of the logs."
✅ "The team will analyze the logs."

❌ "The board made a determination about the cause."
✅ "The board decided the cause."

❌ "This section provides an explanation of the escalation path."
✅ "This section explains how to escalate."

**Noun stacks** — four or more nouns in a row, with the relationships between them left for the reader to guess:

❌ "the customer data retention policy update process"
✅ "the process for updating how long we keep customer data"

❌ "the database connection pool timeout setting"
✅ "the timeout setting for the database connection pool"

Two or three nouns together are usually fine and often the real name of the thing. At four, put the prepositions back.

When a piece needs a term, define it flat and immediately: one plain sentence with "is" or "means", edges included ("A soft launch means shipping to a small group before announcing anything — it does not mean the feature is unfinished"). No "refers to", no italicized mystique, no definition deferred to paragraph three.

### 6. Cohere through reference and sentence shape

Use pronouns and continued reference when the reader can track them. Do not restate the full frame in every paragraph. Treat "Furthermore", "Moreover", "Additionally", "Importantly", "Notably" as things to justify, not default sentence starters.

A period should mark a real pause, shift, or emphasis — not merely the place where an adjacent thought arrived.

**Combining related thoughts:**
- "The term works. It names the pattern." → weaker
- "The term works: it names the pattern." → stronger (carries the relationship)

Do not turn every idea into its own sentence for crispness.

### 7. Do not perform

Avoid keynote cadence, mission-statement phrasing, and applause-line endings. Also avoid:
- "Great question", "Absolutely", "That's an excellent point"
- "I hope this helps", "Feel free to reach out"
- Canned praise or canned closers unless the situation clearly calls for them

Start where the answer starts. Stop where the answer stops.

### 8. Calibrate confidence, stance, and voice to genre

Be confident where evidence is strong. Be explicit where it is weak or interpretive.

Hedge economy: insure a fragile point once — "this looks like", "still a hypothesis" — at the exact claim it applies to, usually near the end. A qualifier after every sentence is its own AI pattern; so is uniform confidence with no hedge anywhere. Confidence should be uneven across the text, because knowledge is.

- If the genre normally carries a visible writer (review, opinion, comment), let the writer appear
- If the genre normally aims at neutrality (summary, docs, news), do not inject attitude or first person
- Do not manufacture a view when the subject does not require one
- Do not sand everything to polite neutrality when the subject naturally invites a view

### 9. Show concrete things before generalizing

Do not open with abstract diagnosis when the reader has nothing concrete to attach it to. Exception: in web, docs, email, and task-oriented writing, leading with the conclusion is fine if the conclusion is concrete enough to be useful.

Preferred order:
1. What happened
2. Where the pattern appeared
3. What constraint mattered
4. What failed or changed
5. What that seems to mean

### 10. Watch regularity

Suspect: when the most visible feature of the writing is its own regularity.

Watch for:
- Parallel enumeration and reflexive three-part cadence inside sentences
- Multiple sentences doing hidden list work without bullets
- Concession-plus-positive rhythm ("not X, but Y")
- Paragraph-closing type definitions ("the kind of X where Y")
- Identical paragraph arcs
- The same punctuation move in every paragraph
- Stacked mini-sentences for impact where each sentence carries one adjacent thought

Three-item parallel lists still count as regularity. The fix is to break the repeated pattern, not just vary the count.

### 11. Let the thought develop

Longer pieces should not feel pre-solved. Let the thought develop through a concrete example, a noticed detail, or a brief doubling-back when the material allows it.

Development can happen inside a sentence. A cumulative sentence starts with the main claim and adds the reason, qualification, or consequence that belongs with it.

### 12. Choose structure consciously for longer pieces

Default genre shapes are not wrong — they are only a problem when used by reflex.

For task pages, procedures, reference docs, news briefs: predictable structure is often the clearest. Do not avoid it for novelty.

For retrospectives, criticism, feature writing, and developmental pieces — avoid these defaults unless the user asked for them:
- Starting state → changes → verdict
- One topic bucket per paragraph
- One paragraph per named milestone

Choose a through-line instead: one complaint that stopped mattering, one system that changed the rest, one shift in what people actually had to do.

Useful alternatives: thematic, reverse-chronological, perspective-led, counterfactual, opinion-first, single-example-led.

### 13. Do not make catalog prose or system-tour prose

**Catalog prose:** paragraph mainly names milestones, categories, feature nouns, or system labels. Fix: pick one change and trace its consequence.

**System-tour prose:** each paragraph can be summarized with a single label (background, mechanism, impact, response, ending). Fix: cross-wire paragraphs so they depend on each other instead of sitting like labeled boxes.

### 14. Revise by reading and cutting

Re-read as a first-time reader. Cut:
- Anything that is auditioning
- Sentences whose only job is to announce the next sentence
- Paragraphs that restate each other

Replace the most generic clause with something specific, or delete it. Most edits should make the text shorter — but do not confuse concision with chopping. Combining two tightly related sentences is sometimes the cleaner edit. Do not keep a passage because it cost effort.

### 15. Leave slack; budget the punch

Do not squeeze every sentence for maximum effect. One or two sentences per text are allowed to be ordinary: an aside that trails off, a flat statement, a plain "we'll see". A person's attention is uneven and honest prose shows it; a text where every line is polished to the same shine reads as manufactured. Slack is not a staged typo or inserted filler — those are props, and they read as props.

Aphorism budget: at most one punchy one-liner closing a paragraph per text. If every paragraph lands with a beat, ease a few back into plain statements.

### 16. Render emotion as event and cost

Prefer the fact and its consequences over stock body metaphors. Not "the news hit the team hard" but "three people quit within the week". Physical description is fine when it is specific and real; generic sensation standing in for a nameable consequence is a tell.

### 17. Use the same term for the same thing

In technical, instructional, and reference writing, name a thing once and keep that name. Do not reach for a synonym to avoid repeating yourself: a reader who meets "token", then "credential", then "auth object" has to work out whether those are three things or one, and the answer is not on the page.

This is the positive form of the elegant-variation pattern flagged in review. Rule 5 already permits ordinary repetition; here it is mandatory. Where a term genuinely has two names in the field, say so once and then pick one.

Ordinary prose is looser. In an essay or a post, varying a word for rhythm is fine as long as the referent never becomes ambiguous.

### 18. Preserve what is not prose

Code, commands, flags, file paths, identifiers, product names, error strings, legal wording, quoted material, and defined terms are not yours to improve. They are fixed strings, and editing one breaks the thing it names or misquotes the person who said it.

This holds even when the fixed string contains something you would otherwise cut: a product genuinely called Seamless, an error message that reads `utilize`, a contract clause written in the passive. Leave it. Fix the prose around it.

If one has to change — a renamed flag, an outdated command — say so in your response rather than doing it silently. A rewrite that quietly alters a command is worse than one that leaves it alone, because the reader has no reason to check.

---

## Structural Techniques (Posts and Articles)

### Start with the punchline

For most post types: lead with the specific insight, not the journey to it.

❌ "In this article, we'll explore the challenges of migrations..."
✅ "Codemods automate 70% of migrations. Here's how to get to 95%."

### Use subheadings as scannable statements

❌ `## Introduction` / `## Background` / `## Results`
✅ `## Why docs go stale` / `## What codemods miss` / `## The real fix`

### Show, don't just tell

Code examples, performance numbers, expected output, concrete steps. If you can't picture it happening in real life, rewrite it.

❌ "The conversion process is simple and efficient."
✅ "Here's the conversion: `$ prpm install @nextjs/migration` — 47 files migrated in 90 seconds, 3 flagged for manual review."

### Honest limitations earn trust

❌ "Our comprehensive solution handles all use cases."
✅ "This won't catch dynamic imports. You'll need to fix those manually — expect about 5% of files."

### End with action, not summary

❌ "In conclusion, we've discussed how X works and why it's useful."
✅ A specific CTA, a challenge, an open question, or the actual next step.

---

## Safety Rails

These are not AI tells by themselves: em dashes, semicolons, "however", competent punctuation, and the right word even if it appears on somebody's banned list.

Do not:
- Invent typos
- Break grammar on purpose
- Inject slang, profanity, fake uncertainty, or staged messiness to simulate humanity
- Alternate sentence lengths by formula
- Remove needed structure in the name of sounding less AI-written
