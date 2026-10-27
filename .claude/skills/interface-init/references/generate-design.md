# Generate the Visual Spec — delegate to ai-design-dot-md

**Single source of truth.** The `ai-design-dot-md` skill owns DESIGN.md spec knowledge: the YAML frontmatter schema, the ordered markdown sections, extract-from-code and create-from-brief modes, and validation. interface-init does not duplicate any of that — a duplicated spec goes stale the day the upstream skill updates. What interface-init adds on top is exactly what ai-design-dot-md does not cover: the **strategic layer** (Overview subsections + anti-reference Don'ts) and the **`.interface/design.json` sidecar**.

## Step 1: Locate the skill

Check whether `ai-design-dot-md` is available:

1. It appears in the session's skill roster (invocable via the Skill tool), or
2. A local copy exists at `<harness>/skills/ai-design-dot-md/SKILL.md` (check `.claude`, `.cursor`, `.agents`, and the other harness dirs).

If found, skip to Step 3.

## Step 2: Not installed — ask, never pick silently

STOP and call the AskUserQuestion tool with two options:

1. **Install the skill** (recommended — persistent, updatable, recorded in `skills-lock.json`):

   ```bash
   npx skills add robcsaszar/scaffold --skill ai-design-dot-md
   ```

   Then invoke or read the freshly installed skill.

2. **Use it as a one-off reference** — fetch the current version from GitHub and follow it in-session without installing:

   - `https://raw.githubusercontent.com/robcsaszar/scaffold/main/skills/ai-design-dot-md/SKILL.md`
   - `https://raw.githubusercontent.com/robcsaszar/scaffold/main/skills/ai-design-dot-md/references/design-md-spec.md`

   (If `main` 404s, try `master`.) If the fetch fails — offline session, blocked domain — report that and fall back to offering the install, or let the user paste the spec; do NOT improvise a DESIGN.md format from memory.

## Step 3: Run its flow

Follow ai-design-dot-md end to end. Mode mapping:

- Project has tokens/components/rendered output → its **Extract** mode.
- Pre-implementation project (nothing built) → its **Create** mode (covers what a seed flow would).

Feed it what Phases 2–3 already established — stack, token locations found, brand personality, references — so it doesn't re-ask the user. Its output is the spec-compliant DESIGN.md (frontmatter + sections). Defer to it on every spec question: section names and order, token schema, color format, validation.

## Step 4: The interface-init post-pass (always, both modes)

ai-design-dot-md produces the visual spec; now layer in what the suite needs:

1. **Inject the strategic subsections** into `## Overview` (template and content in [interview.md](interview.md)): Register, Users & Purpose, Brand Personality, Design Principles, Accessibility & Inclusion.
2. **Carry every anti-reference** from the strategic interview into `## Do's and Don'ts` as a Don't, **verbatim** — the user's own words.
3. Optionally record the interface doctrine hooks as Named Rules where the user confirmed them: color strategy (Restrained / Committed / Full palette / Drenched) in Colors, motion energy in the section that fits. These drive the interface skill's variant and generation flows.
4. **Write the sidecar** per [sidecar.md](sidecar.md) — including the `strategic` block mirroring the subsections. Skip the sidecar when nothing was extracted (pre-implementation Create-mode output with no tokens or components yet).
5. **Validate the merged file**: `name` present in frontmatter; every `{token.path}` resolves; section order untouched by the injection; every anti-reference present in Do's and Don'ts.

The injection must not disturb what ai-design-dot-md wrote: subsections go inside Overview after its prose, Don'ts are appended to the existing list, and no top-level section is added, renamed, or reordered.
