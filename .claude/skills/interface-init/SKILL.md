---
name: interface-init
description: Gathers design context for a project and writes DESIGN.md — the single context file every interface-suite flow reads. Runs a strategic discovery interview (register, users, brand personality, anti-references, accessibility), then delegates the visual spec generation to the ai-design-dot-md skill (offering to install it via npx or use it one-off from GitHub), and layers the strategic subsections plus a machine-readable .interface/design.json sidecar on top. Also migrates legacy PRODUCT.md files into DESIGN.md. Use once per project, when design context is missing or stale, when the user says "set up design context", "generate DESIGN.md", "extract design tokens into a spec", or when another interface flow reports no DESIGN.md. Ongoing design work is the interface skill; in-browser variant iteration is interface-live.
---

# Interface Init

One flow, one output: a **DESIGN.md** at the project root carrying both layers of design context — the strategic layer (who it's for, brand personality, anti-references) in the Overview and Do's and Don'ts sections, and the visual layer (tokens, colors, typography, components) in the frontmatter and visual sections — plus a `.interface/design.json` sidecar for what the spec's schema can't hold.

DESIGN.md follows the [Google Stitch DESIGN.md open format](https://github.com/google-labs-code/design.md). **This skill does not carry the spec itself** — the `ai-design-dot-md` skill is the single source of truth for the frontmatter schema, section structure, and generation modes, and Phase 4 delegates to it (installing it or referencing it from GitHub on demand). interface-init owns only what that skill doesn't: the strategic interview, the strategic-layer injection, the sidecar, and the legacy migration.

Every other interface-suite flow reads this file before doing work. **Tokens are normative for values; prose is normative for intent.**

## Phase 1 — Load current state

```bash
node .claude/skills/interface-init/scripts/load-context.mjs
```

Decision tree on the output:

- **`hasDesign: false, hasLegacyProduct: false`** (no context yet): run Phases 2–5 in full.
- **`hasDesign: true`**: STOP and call the AskUserQuestion tool. Ask whether to refresh the visual extraction, revise the strategic sections, or both. Never silently overwrite; when updating, diff against the existing file and preserve rationale the extraction didn't touch.
- **`hasLegacyProduct: true`** (pre-fold PRODUCT.md exists): run the **Migration** section below — fold it into DESIGN.md — as part of whichever path applies.
- **DESIGN.md exists but lacks the strategic subsections in Overview** (older visual-only file): offer to add them via Phases 2–3 without redoing the visual extraction.

If init was invoked as a setup blocker by another interface flow (e.g. craft found no DESIGN.md), pause that task, complete init, re-run the loader, then resume the original flow with fresh context. Init creates project context; it is not a substitute for that flow's own task-specific interview.

Completion criterion: you know which of DESIGN.md / legacy PRODUCT.md / sidecar exist and which phases this run needs.

## Phase 2 — Explore the codebase

Before asking questions, scan the project to discover what you can: README and docs (purpose, audience), package.json and config (stack, design libraries), existing components (patterns in use), brand assets (logos, colors already defined), design tokens / CSS variables, any style guides.

Form a **register hypothesis**:

- Brand signals: `/`, `/about`, `/pricing`, `/blog/*`, hero sections, big typography, scroll-driven sections, landing-page-shaped content.
- Product signals: `/app/*`, `/dashboard`, `/settings`, `/(auth)`, forms, data tables, side/top nav, app-shell components.

Register is a hypothesis at this point, not a decision; Phase 3 confirms it.

Completion criterion: what's discoverable is noted; what remains unclear is a question for Phase 3.

## Phase 3 — Strategic interview

MANDATORY READ [references/interview.md](references/interview.md). Do NOT load it when this run is a visual-only refresh of an existing DESIGN.md whose strategic sections the user wants kept.

Run the interview per that reference: interview mode, not confirmation mode; 2–3 questions per round; at least one real user-answer round before drafting unless every required answer is directly discoverable from repo docs. The answers land in DESIGN.md's Overview subsections (Register, Users & Purpose, Brand Personality, Design Principles, Accessibility & Inclusion) and its Do's and Don'ts (anti-references), not in a separate file.

Completion criterion: register confirmed; users/purpose, personality, anti-references, accessibility answered or explicitly deferred by the user.

## Phase 4 — Generate the visual spec (delegate)

MANDATORY READ [references/generate-design.md](references/generate-design.md) and follow it: locate the `ai-design-dot-md` skill (or, if absent, ask the user whether to install it via `npx skills add robcsaszar/scaffold --skill ai-design-dot-md` or use it one-off from GitHub), then run its Extract mode (code exists) or Create mode (pre-implementation), feeding it what Phases 2–3 already established so it doesn't re-ask.

Completion criterion: a spec-compliant DESIGN.md written by the ai-design-dot-md flow.

## Phase 5 — Strategic post-pass + sidecar

Per [references/generate-design.md](references/generate-design.md) Step 4: inject the strategic subsections into Overview, carry every anti-reference into Do's and Don'ts **verbatim**, then MANDATORY READ [references/sidecar.md](references/sidecar.md) and write `.interface/design.json` (skip the sidecar when nothing was extracted — no tokens or components yet).

Completion criterion: strategic subsections present in Overview; every anti-reference appears in Do's and Don'ts; section order untouched; sidecar written (when applicable).

## Phase 6 — Confirm and refresh session cache

1. Show the user the full DESIGN.md. Briefly highlight the non-obvious creative choices (descriptive color names, atmosphere language, named rules).
2. Mention the sidecar (scan mode): the interface-live panel will now render this project's actual primitives instead of generic approximations.
3. Offer to refine any section.
4. **Re-run the loader** (`node .claude/skills/interface-init/scripts/load-context.mjs`) and let its full JSON output land in conversation, so subsequent flows in this session use the freshly written file, not a stale earlier version.
5. Optionally ask whether to append a short **Design context** pointer to the repo's agent instructions file (AGENTS.md or CLAUDE.md) so other agents discover DESIGN.md.

## Migration — legacy PRODUCT.md

Older versions of this suite kept the strategic layer in a separate PRODUCT.md. When the loader reports `hasLegacyProduct: true`:

1. Read the legacy file. Map its sections into DESIGN.md: `## Register` → Overview ### Register; `## Users` + `## Product Purpose` → Overview ### Users & Purpose; `## Brand Personality` → Overview ### Brand Personality; `## Design Principles` → Overview ### Design Principles; `## Accessibility & Inclusion` → Overview ### Accessibility & Inclusion; `## Anti-references` → Do's and Don'ts Don'ts, **verbatim**.
2. Merge, don't overwrite: where DESIGN.md already carries a strategic subsection, keep the richer of the two and show the user any conflict.
3. Mirror the strategic fields into the sidecar's `strategic` block ([references/sidecar.md](references/sidecar.md)).
4. Ask the user to confirm, then delete PRODUCT.md. Until it's deleted, other suite flows keep reading it as a fallback, so a half-done migration is safe but should be finished.

## NEVER

- **NEVER silently overwrite an existing DESIGN.md**
  **Instead:** Show the user what exists and ask: refresh, revise, or merge.
  **Why:** The file may carry hand-written rationale the extraction can't regenerate; losing it silently destroys the user's trust in the whole suite.

- **NEVER synthesize the strategic layer from the task prompt alone**
  **Instead:** Complete at least one real interview round (or cite the repo doc that answers each question).
  **Why:** An inferred brand personality confirmed by a blanket "looks good" produces confident-sounding context that misdirects every downstream flow.

- **NEVER generate the visual spec without ai-design-dot-md**
  **Instead:** Locate it, or ask the user: install via npx, or one-off from GitHub. If both are refused or impossible, stop and say what's blocked.
  **Why:** That skill is the single source of truth for the spec; a from-memory DESIGN.md format is a second, silently diverging implementation — exactly the staleness this delegation exists to prevent.

- **NEVER let the strategic injection disturb the generated spec structure**
  **Instead:** Subsections go inside Overview; Don'ts append to the existing list; no top-level section added, renamed, or reordered.
  **Why:** DESIGN.md-aware tooling parses sections positionally and by literal header words; an injection that touches structure silently breaks every consumer.

- **NEVER put strategic machine-fields in the YAML frontmatter**
  **Instead:** Strategic prose lives in Overview subsections; the machine-readable copy lives in the sidecar's `strategic` block.
  **Why:** The spec's frontmatter schema accepts only `version`, `name`, `description`, `omitted`, `colors`, `typography`, `rounded`, `spacing`, `components` — custom keys break spec validators.

- **NEVER fabricate tokens or components the project doesn't have**
  **Instead:** Extract what's reused; skip what's absent; mark genuinely unknown areas as TBD with what's needed to complete them.
  **Why:** Consumers assume the file is real; invented values become "on-brand" the moment they're written down.

## Files

- `references/interview.md` — strategic discovery interview (Phase 3)
- `references/generate-design.md` — delegation to ai-design-dot-md + strategic post-pass (Phases 4–5)
- `references/sidecar.md` — `.interface/design.json` schema and component translation rules (Phase 5)
- `scripts/load-context.mjs` — context loader shared with the rest of the suite (Phase 1, Phase 6)
