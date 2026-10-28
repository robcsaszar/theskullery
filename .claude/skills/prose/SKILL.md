---
name: prose
description: "Drafts, revises, and humanizes prose. Use when writing or revising anything human-facing — blog posts, articles, documentation, runbooks, specs, emails, social media posts, IM, marketing copy, or UI text, and for fiction, poetry, scripts, and memoir. Also use when a draft needs checking or fixing for AI writing patterns, or rewriting to match a stated voice. Detects the channel and applies channel-specific rules, and calibrates to a writing sample when one is supplied. Triggers are humanize, sounds like AI, voice check, blog review, rewrite in the user's voice, email review, draft this, remove AI patterns, write an email, write a social media post, review this doc, edit this scene. Don't use for code comments, commit messages, or private notes."
---

# Prose

Two modes. Detect the correct one before doing anything else.

## Mode Detection

**Draft mode** — user has a topic, brief, or outline and wants new content written.
**Review mode** — user has existing text and wants it improved, humanized, or scored.

If ambiguous: ask — "Do you want me to write new content, or review/rewrite something you already have?"
If the user does not respond, default to Draft Mode.

---

## Voice Calibration

Before drafting or rewriting, ask for a voice sample if the user hasn't provided one.
For short-form targets (IM, emails under 200 words): skip voice calibration unless the user has already provided a sample.

> "Share 1–3 paragraphs of your own writing that feel most like you. I'll match your
> sentence rhythm, word choice, and structural habits."

Analyze the sample for:
- Sentence length tendency (punchy / analytical / mixed)
- How they open (claim-first, story-first, data-first, context-first)
- Punctuation habits (parentheticals, colons, semicolons)
- Recurring phrases or verbal tics
- How they end (principle, challenge, open question, action)
- Words they never use

**Persisting the profile.** After analyzing a sample, offer to save the result so future sessions skip recalibration: fill in `references/voice-profile-template.md` and write it to `references/voice-profile.md` inside the skill folder (if the folder is read-only, output the completed profile for the user to save). If `references/voice-profile.md` already exists, read it in full before drafting or rewriting — it overrides default conventions (em dash tolerance, quote style, pet phrases, registers). On "learn from this text too": append dated observations to the existing profile; conflicts resolve toward the fresher sample. A profile can never override fact discipline, accessibility, or the NEVER rules.

If no sample and no saved profile: proceed with the default voice — see `references/drafting-core.md` § "Default Voice". For blog, essay, opinion, or personal writing, also see `references/personality-and-soul.md` — a clean default voice can still read as soulless without it. If the text will be published under the user's name, mention that uncalibrated output carries a generic default voice and offer calibration — once per conversation, then drop it.

---

## Draft Mode

### Phase 0 — Understand before writing

Ask before drafting:
1. What does the reader need to do or feel after reading? *(determines medium and audience fit)*
2. What would actually surprise this reader — what do they already think they know that's incomplete?
3. What is the single job of this text — inform, persuade, instruct, entertain, or convert?
4. What register fits the context — formal, casual, technical, conversational — and will it stay stable?
5. **Through-line** — one concrete example, case, or consequence that can carry real weight

If task-oriented: answer or next action goes first.
If long-form: pick the through-line and one concrete anchor before drafting.

Before drafting, ask: what is the one concrete example or consequence that could carry this piece? If you can't name it, you are not ready to draft.

MANDATORY READ before drafting anything longer than 200 words:
→ [`references/drafting-core.md`](references/drafting-core.md) — core rules and medium-specific patterns

For Documentation or Creative targets, also read that channel's rewrite rules before drafting — both suspend defaults that apply everywhere else:
→ [`references/channel-rules.md`](references/channel-rules.md) § Documentation / § Creative

Do NOT load `references/ai-patterns-universal.md` during drafting — it is for review only.

### Phase 1 — Draft

Write to fit the actual context, not an abstract ideal of "good writing."

Active principles:
- Each substantial paragraph carries at least one concrete anchor (proper noun, specific number, direct quote, named decision, checkable detail). *For blog, article, and social media. For IM and short email: one anchor per message suffices.*
- No vague claims: "many", "various", "broad implications", "meaningful changes" fail the anchor test
- Use plain words; repeat the ordinary word when it is the right word; prefer verbs over nominalizations
- Keep register stable; match format to medium

### Phase 2 — Revise

MANDATORY: Run required checks after drafting.
→ [`references/required-checks.md`](references/required-checks.md)

If a shell is available, also run the deterministic scanner on the draft — anti-slop applies to new writing, not just reviews:

```bash
python3 scripts/slop-scan.py --channel <medium> draft.md
```

Every script and reference path in this skill is relative to the skill directory, not the working directory. Installed as a plugin, the two are rarely the same: resolve `scripts/slop-scan.py` against the directory this `SKILL.md` was loaded from. Treat "file not found" as a path problem to fix once, not as "no shell" — falling through to the manual layer silently drops the whole deterministic pass.

Fix debris unconditionally. Verify each phrase flag against the false-positive rules before changing it (the flagged word may simply be the right word). Structure notes feed the same judgment as required check 5.

If the piece still feels off after required checks (longer work only):
→ [`references/long-form-diagnostics.md`](references/long-form-diagnostics.md)

When revision examples would help:
→ [`references/examples.md`](references/examples.md)

---

## Review / Humanize Mode

Do NOT load `references/drafting-core.md` during Review/Humanize Mode — it is for drafting only.

### Step 0 — Auto-detect content type

Classify the channel before running any checks. State the detection at the top of the review.

**Email** — has: subject line / greeting formula (Hi Name, Dear Name) / explicit ask + sign-off structure
**social media** — has: one-sentence-per-line throughout / hashtags / engagement CTA at end / under 3,000 chars with no headings
**IM** — has: @mentions / channel refs / casual tone / under 500 chars / no greeting or sign-off
**Documentation** — has: numbered procedures / imperative step verbs / code blocks, CLI commands, or config keys / API, parameter, or option tables / no first-person narration
**Creative** — has: dialogue with speech punctuation / scene, stanza, or script structure / narration with named characters / line breaks used for rhythm rather than list structure
**Blog post** — has: headings / 3,000+ chars of structured prose / multiple developed paragraphs

Check Documentation and Creative before Blog. Both have headings and developed paragraphs, so a runbook or a scene will match the Blog signals too, and Blog is the wrong default for either.

If one channel matches clearly: state the detection and proceed.
If ambiguous (signals conflict or none fire): ask — "What format is this? Blog post, social media, Email, IM, Documentation, or Creative?" Do not proceed until answered.

### Step 1 — AI pattern scan

**Deterministic pass first.** If a shell is available, save the text to a file and run:

```bash
python3 scripts/slop-scan.py --channel <detected> file.md
```

Channel names map to flag values: Blog post → `blog`, social media → `social`, Email → `email`, IM → `im`, Documentation → `docs`, Creative → `creative`. Each channel suppresses the rules its medium legitimately breaks, so passing the wrong one produces both false positives and missed tells.

The scanner reports mechanical tells (debris, formula phrases, typography) and structure metrics (sentence monotony, uniform paragraphs, uniform confidence, aphorism budget, anaphora runs, ordinal-labelled paragraphs, coined concept labels, verbatim duplication) with stable, repeatable output. Pass `--allow <rule-id>` for anything the voice profile or medium legitimately permits. No shell: apply `references/formula-watchlist.md` manually as the mechanical layer.

**Judgment pass second.** MANDATORY READ — universal markers first:
→ [`references/ai-patterns-universal.md`](references/ai-patterns-universal.md)

Then load channel-specific markers:
→ [`references/ai-patterns-channels.md`](references/ai-patterns-channels.md)

Apply universal markers to ALL content. Apply channel-specific markers only for the detected type.
List every flagged item — scanner hits and judgment flags — with the exact quote and its location.

### Step 2 — Adversarial verification

Every flag from Step 1 must survive a defense before it enters the report. For each flag, argue the strongest case that it is a FALSE POSITIVE, using the "What NOT to Flag" rules in `ai-patterns-universal.md`:

- Is the phrase inside a quotation, title, proper name, or an example being discussed rather than used?
- Is it plainly the right word here, appearing once, with no cluster of other tells around it?
- Is it a medium convention (structure in docs, salutations in email) or explicitly allowed by the voice profile?
- Is the "structural" flag actually the correct shape for this genre (spec, runbook, reference page)?

Verdict per flag: **CONFIRMED** (the defense fails) or **DISMISSED** (one-line reason). Only confirmed flags proceed. Debris hits (chat artifacts, placeholders, tracking fragments) are always confirmed — there is no legitimate use.

This step exists to protect real prose: over-editing text that was fine is as much a failure as missing a tell.

### Step 3 — Originality check

Flag if the content:
- Could have been written by anyone with a search engine (no earned authority, no specific experience)
- Has no firsthand experience, customer story, or concrete evidence anywhere
- Makes the same point twice without adding depth
- Recycles industry framing ("the future of X is Y")
- Missing the "only I could write this" factor

social media extra: flag product plugs dressed as lessons; personal stories with fortune-cookie takeaways.

### Step 4 — Score

MANDATORY READ for scoring dimensions per channel:
→ [`references/channel-rules.md`](references/channel-rules.md)

Provide a one-sentence justification for each score.
If AI-Likeness is low but the substance dimension is also low — Domain Credibility (blog/social), Clarity (email/IM), Task Completion (documentation), or Restraint (creative) — flag explicitly. Content is clean but hollow.

### Step 5 — Structured review report

MANDATORY READ for report structure:
→ [`references/review-report-template.md`](references/review-report-template.md)

Report confirmed flags only; state the count of dismissed flags in one line.

### Step 6 — Rewrite

Pick the edit scope first (choose yourself if the user didn't state one; say which you chose if it matters):

- **Free edit** (default for "humanize this") — empty phrases get deleted, not reworded; length may shrink noticeably.
- **Careful edit** (the text must fill a slot: client document, fixed format) — structure survives; length stays within 80–110% of the original.
- **Minimal edit** (on explicit request only) — touch only unambiguous AI constructions.

Universal rewrite rules:
1. Never add ideas not in the original; never remove substance
2. Replace every flagged AI phrase with natural language
3. Vary sentence length: mix short punchy lines with longer analytical ones
4. Replace generic openings with a specific hook (story, data point, contrarian claim)
5. Replace summary conclusions with a challenge, principle, or open question
6. Break uniform paragraph rhythm: some short, some long
7. If concrete examples are missing: leave `[ADD SPECIFIC EXAMPLE FROM YOUR EXPERIENCE]` — never invent
8. Editing is not fact-checking: a claim the text doesn't support isn't necessarily false — the author may have data beyond the text. Soften the wording to what the text can carry, or flag that the public version needs receipts. Do not silently delete the claim as unverified.

**Channel exceptions to rules 3–6.** These four are prose-rhythm rules and two channels do not want them:

- **Documentation** — do not vary sentence length, break paragraph rhythm, replace an opening with a hook, or turn a closing summary into an open question. Uniform shape is what makes a procedure followable, and a spec that ends on a provocation has failed. Rules 1, 2, 7, and 8 still apply.
- **Creative** — rule 5 inverts: a closing line that states the piece's meaning is the tell, so cut it rather than replacing it with a principle or a challenge. Rules 3 and 6 are the writer's call, not yours.

For blog, essay, opinion, or personal writing (not encyclopedic, technical, legal, or reference content):
MANDATORY READ → [`references/personality-and-soul.md`](references/personality-and-soul.md) — removing AI patterns produces clean prose; this section is what makes it sound like someone.

MANDATORY READ for channel-specific rewrite rules:
→ [`references/channel-rules.md`](references/channel-rules.md)

**Elimination loop.** A single rewrite pass is not the end state. Iterate until the text survives both a deterministic check and an adversarial one, up to 3 rounds:

1. **Rewrite** applying the confirmed flags and the rules above.
2. **Re-scan** — run `scripts/slop-scan.py` on the rewrite (same `--allow` set). Any debris = fix immediately. Any new phrase hits = fix or justify.
3. **Prosecute** — switch sides: argue the strongest case that the rewrite is still AI-generated. Check specifically against the second-order tells in `references/ai-patterns-universal.md` § Part 5 — a cleanup pass tends to produce them: uniform confidence, an aphoristic close on every paragraph, "That's not X. That's Y.", no slack anywhere, performative vulnerability (an admission that costs the writer nothing), and manufactured suspense standing in for the hooks you just deleted. Cite the evidence in one line each.
4. If the prosecution has a case, fix and repeat from 2. If it doesn't, or after 3 rounds, stop.

Exit criteria: scanner reports 0 debris; remaining scanner flags each have a one-line justification (medium convention or voice profile); the prosecution can no longer point at a cluster of tells. List any accepted exceptions. Present only the final rewrite after the review report, not the intermediate drafts.

### Step 7 — Self-update

After every review, compare new flags against patterns already in the skill. For each novel pattern:
1. Is it specific enough to illustrate with a concrete example? If not, skip it.
2. Is it universal or channel-specific? Add to the correct reference file.
3. Do not duplicate existing rules.

Also watch your own rewrites for replacement tics: any substitute phrase this skill has used across three or more texts has become a marker itself. Add it to the second-order list in `references/formula-watchlist.md` and stop using it — a worn phrase is rarely fixed by a fresher phrase; it is fixed by leading with the substance.

When a novel pattern is mechanical (a literal phrase or typography artifact), also add a rule for it to `scripts/slop-scan.py` so future scans catch it deterministically. Structural or judgment-dependent patterns go in the reference files only.

To add a pattern: attempt to edit the reference file directly. If editing is not available in this context, output the proposed addition as a fenced code block for the user to paste manually.

Report to user:
```
## Skill Update
- [X] new pattern(s) added: [list each + reference file, or "⚠ paste manually — file editing unavailable"]
- [ ] no new patterns found this review
```

### Tuning

Common adjustments after a first review:

| Problem | Fix |
|---------|-----|
| Wrong channel detected | Re-run Step 0; state the correct channel; reload only that channel's rules |
| Runbook or scene detected as Blog | Re-run Step 0 checking Documentation and Creative first; both share Blog's heading and paragraph signals |
| Rewrite changed ideas | Revert substance changes; keep only delivery edits from Step 6 rules |
| Scores feel off | Ask which dimension feels wrong; re-read only that dimension in `channel-rules.md` and recalibrate |
| Voice profile too generic | Request a more representative sample; re-run Voice Calibration before rewriting |
| Legitimate phrase keeps getting flagged | Record it in the voice profile; pass the matching `--allow <rule-id>` to the scanner from then on |
| Rewrite feels over-scrubbed | Re-run Step 2 on your own edits — dismissed flags should have been left alone |
| Rewrite sounds staged rather than clean | Re-run required check 14; keep at most one suspense frame, analogy frame, or self-posed question in the whole piece |

---

## NEVER

- **NEVER optimize for "sounding human" or "beating detectors"**
  **Instead:** Write for the actual context — medium, audience, reader need.
  **Why:** Both goals produce worse writing. Good context fit reads as human as a side effect.

- **NEVER invent specificity to avoid sounding generic**
  **Instead:** Use fewer verified facts rather than many guessed ones; leave `[VERIFY]` placeholders.
  **Why:** Specificity theater (invented milestones, synthetic quotes, suspiciously exact claims) fails fact-checks and breaks trust faster than vagueness. An invented specific does more damage than a cliché: readers discount a cliché as filler, but they believe an invented fact.

- **NEVER invent norms or thresholds**
  **Instead:** Every "healthy", "strong", "well within range", or "realistic" needs a named baseline — a plan, a prior period, a cost floor, an industry benchmark — or it goes.
  **Why:** An unfounded threshold ("as long as churn stays under 3%, the model holds") reads as analysis but is fabrication; no voice profile or user preference can override this.

- **NEVER inject slang, forced asides, typos, or artificial sentence-length targets to break regularity**
  **Instead:** Natural variety comes from the relationship between thoughts, not from alternating lengths by formula.
  **Why:** Programmatic variation is as recognizable as programmatic regularity.

- **NEVER remove needed headings, lists, descriptive links, or caveats to "sound less AI-written"**
  **Instead:** Preserve accessibility and usability; make text less structured only when the medium genuinely calls for it.
  **Why:** Removing structure to pass a vibe check makes text less useful, not more human.

- **NEVER run long-form diagnostics before required checks**
  **Instead:** Run `references/required-checks.md` first; escalate to diagnostics only when checks pass but the piece still feels off.
  **Why:** Running diagnostics on a draft that hasn't passed required checks produces false positives — diagnostics are calibrated to identify structural problems, not surface-level errors. Running them first treats symptoms as disease.

- **NEVER add ideas to a rewrite that weren't in the original**
  **Instead:** Preserve every argument; change only the delivery.
  **Why:** The user owns the ideas; the skill owns the execution.

- **NEVER apply channel-specific rules from the wrong channel**
  **Instead:** Load only the section for the detected channel in `ai-patterns-channels.md`.
  **Why:** social media hooks, email structure, and IM brevity rules conflict — wrong-channel rules corrupt the rewrite.

- **NEVER apply Blog or social media rules to fiction, poetry, or scripts**
  **Instead:** Detect the Creative channel and load its rules; the em-dash prohibition and the rule-of-three flag are suspended inside dialogue and verse.
  **Why:** The dash marks interrupted speech and nothing else does that job. Stripping it from dialogue, or breaking a deliberate triad in a poem, damages the writing in the name of cleaning it.

- **NEVER rewrite code, commands, identifiers, product names, legal text, or quoted material**
  **Instead:** Edit the prose around a fixed string and leave the string exactly as found; if one genuinely must change, say so in your response rather than changing it silently.
  **Why:** These are not prose. A watched word inside a command is part of the command, and editing it breaks the thing it names or misquotes the person who said it. See required check 12.

- **NEVER change spelling variety, date format, or punctuation convention the source held consistently**
  **Instead:** Keep en-GB spelling in an en-GB piece; keep the source's date and number formats. Where the source was inconsistent, pick what its audience expects and say which you picked.
  **Why:** Consistency is evidence of a deliberate choice. Silently Americanising a British writer is an unrequested edit that signals carelessness about everything else in the rewrite.

- **NEVER match voice from a sample written in a different register than the target content**
  **Instead:** Before applying a voice profile, verify the sample's register (blog, casual, technical) matches the output medium.
  **Why:** A casual social media voice applied to formal documentation produces a register mismatch that undermines both the content and the author's credibility.
