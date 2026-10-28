# Strategic Discovery Interview

Gathers the strategic layer of design context. The answers land in DESIGN.md's Overview subsections and Do's and Don'ts — there is no separate strategic file.

## Interview mode, not confirmation mode

If the repo is empty or the user's brief is sparse, run a short interview before proposing anything. Do **not** turn a one-sentence request into a complete inferred context and ask for blanket confirmation.

- Use the harness's structured question tool when one exists. Otherwise, ask directly in chat and stop.
- Ask **2–3 questions per round**, then wait for answers.
- Use inferred answers as hypotheses or options, not as finished facts.
- Complete at least one real user-answer round before drafting, unless every required answer is directly discoverable from repo docs.
- Round 1 should establish register, users/purpose, and desired outcome.
- Round 2 should establish brand personality or references, anti-references, and accessibility needs.

## Minimum viable interview

Cover register confirmation, users and purpose, brand personality, anti-references, and accessibility needs — unless each answer is directly discoverable from repo context. After at least one interview round, you may propose inferred answers, but the user must confirm them before you write DESIGN.md.

### Register (ask first; it shapes everything below)

Every design task is either **brand** (marketing, landing, campaign, long-form content, portfolio: design IS the product) or **product** (app UI, admin, dashboards, tools: design SERVES the product).

If the codebase scan produced a clear hypothesis, lead with it: *"From the codebase, this looks like a [brand / product] surface. Does that match your intent, or should we treat it differently?"*

If the signal is genuinely split (e.g. a product with a big marketing landing), STOP and ask which register describes the **primary** surface. The register can be overridden per task later, but DESIGN.md carries one default.

### Users & Purpose

- Who uses this? What's their context when using it?
- What job are they trying to get done?
- For brand: what emotions should the interface evoke? (confidence, delight, calm, urgency)
- For product: what workflow are they in? What's the primary task on any given screen?

### Brand & Personality

- How would you describe the brand personality in 3 words?
- Reference sites or apps that capture the right feel? What specifically about them?
  - For brand, push for real-world references in the right lane (tech-minimal, editorial-magazine, consumer-warm, brutalist-grid, etc.), not generic "modern" adjectives.
  - For product, push for category best-tool references (Linear, Figma, Notion, Raycast, Stripe).
- What should this explicitly NOT look like? Any anti-references? (These are carried **verbatim** into Do's and Don'ts.)

### Accessibility & Inclusion

- Specific accessibility requirements? (WCAG level, known user needs)
- Considerations for reduced motion, color blindness, or other accommodations?

Skip questions where the answer is already clear. **Do NOT ask about colors, fonts, radii, or visual styling here.** Those belong to the visual extraction (or seed) phase.

## Where the answers land

Write them as `###` subsections inside DESIGN.md's `## Overview`, after the North Star and philosophy paragraphs:

```markdown
### Register

product

### Users & Purpose
[Who they are, their context, the job to be done, what success looks like]

### Brand Personality
[Voice, tone, 3-word personality, emotional goals]

### Design Principles
[3–5 strategic principles derived from the conversation — principles like "practice what you preach", "show, don't tell". NOT visual rules like "use OKLCH" or "magenta accent"; those belong to the visual sections.]

### Accessibility & Inclusion
[WCAG level, known user needs, considerations]
```

Register is a bare value (`brand` or `product`), no prose. Anti-references do NOT get an Overview subsection — every one of them becomes a **Don't** in Do's and Don'ts, in the user's own words. Mirror register, personality, principles, and anti-references into the sidecar's `strategic` block (see [sidecar.md](sidecar.md)).
