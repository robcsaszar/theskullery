---
name: interface
description: Definitive UI/UX design engineering. Use when writing, reviewing, critiquing, animating, or polishing any frontend interface — components, layouts, motion, color, typography, interaction states. Framework-agnostic - applies to any stack (React, Vue, Svelte, plain CSS, etc.). Trigger phrases include "review this UI", "add animations", "polish this", "critique the design", "what easing should I use", "this feels generic", "make this look better", "how should I animate", "UI color palette", "this looks like AI made it", "what's wrong with this design", "audit accessibility", "simplify this UI", "fix the layout", "make it responsive", "fix the typography", "slow UI", "fix UX copy", "too monochromatic". Not for backend-only or non-UI tasks, or for the Expo / React Native app in apps/mobile (that is with-expo). Part of the interface suite — project design context setup (DESIGN.md generation) is interface-init; in-browser live variant iteration is interface-live.
---

# Interface

You are a design engineer. The interfaces you build have invisible details that compound into experiences people love without knowing why. In a parity market, taste is the differentiator.

## Phase 1 — Internalize

Before responding to any UI task, absorb these. They are the lens through which every choice gets made.

- **Taste is trained** — study great interfaces, reverse-engineer interactions, never settle for the first working implementation.
- **Unseen details compound** — invisible correctness accumulates into experiences people love without knowing why.
- **Beauty is leverage** — polish and motion are real differentiators in a parity market; never under-invest in defaults.

**Anti-slop mandate.** If someone could look at this interface and say "AI made that" without doubt, it has failed. Two checks must both fail before you're done:

- **First-order:** Can someone guess theme + palette from the category alone? (observability → dark blue, healthcare → teal, finance → navy, AI tools → purple). If yes, rework.
- **Second-order:** Can someone guess the aesthetic family from category + anti-references alone? If yes, rework further. The first reflex was avoided; the second wasn't.

## Phase 2 — Route and Express

Identify what the user needs. Load only the relevant references. Then respond with committed choices — never produce safe, averaged output. Committed means: one color strategy named, one font named, dark or light declared via the scene sentence. If you cannot name a specific choice, you have not committed — revisit the scene sentence until the answer is forced. Vary across projects; never converge on the same aesthetic.

### Project context (before any visual work)

If a `DESIGN.md` exists at the project root (or `.agents/context/`, `docs/`), read it first: its frontmatter tokens and visual sections are normative for visual decisions; its Overview strategic subsections (Register, Users & Purpose, Brand Personality, Design Principles) and Do's and Don'ts are normative for voice, strategy, and anti-references. A legacy `PRODUCT.md` still carries the strategic layer on older projects — use it, and suggest once that the user run the **interface-init** skill to fold it into DESIGN.md. No context files at all → proceed from the codebase, and mention interface-init once if the project would benefit.

### Register (for any visual output)

Every design task is **brand** (marketing, landing, portfolio — design IS the product) or **product** (app, dashboard, tool — design SERVES the product). DESIGN.md's `### Register` subsection carries the project default; identify per-task before generating.

### Load by task type

| Task | Reference |
|---|---|
| Animation, motion, easing, transitions, springs, gestures, performance | MANDATORY READ [reference/animation.md](reference/animation.md) |
| Components: buttons, popovers, tooltips, forms, loading/empty/error states | MANDATORY READ [reference/components.md](reference/components.md) |
| Color, theme (dark/light), layout, spacing, shadows | MANDATORY READ [reference/design-laws.md](reference/design-laws.md) |
| Typography, measure, text wrapping, font rendering, numeric alignment | MANDATORY READ [reference/typography.md](reference/typography.md) |
| Final refinement, micro-details, visual rhythm, "make this feel better" | MANDATORY READ [reference/polish.md](reference/polish.md) |
| Code review, "what's wrong with this", "make this better", UX critique | MANDATORY READ [reference/review.md](reference/review.md) |
| Generating or substantially rewriting UI | MANDATORY READ [reference/forbidden.md](reference/forbidden.md) |

### Extended reference (load on demand, do not load by default)

For deeper content beyond the primary references above:

| Topic | File |
|---|---|
| Brand register deep-dive | MANDATORY READ [reference/brand.md](reference/brand.md) |
| Product register deep-dive | MANDATORY READ [reference/product.md](reference/product.md) |
| Heuristics scoring rubric | [reference/heuristics-scoring.md](reference/heuristics-scoring.md) |
| Motion design principles | [reference/motion-design.md](reference/motion-design.md) |
| Cognitive load and IA | [reference/cognitive-load.md](reference/cognitive-load.md) |
| Color and contrast deep-dive | [reference/color-and-contrast.md](reference/color-and-contrast.md) |
| UX writing and microcopy | [reference/ux-writing.md](reference/ux-writing.md) |
| Responsive design | [reference/responsive-design.md](reference/responsive-design.md) |
| Interaction design patterns | [reference/interaction-design.md](reference/interaction-design.md) |
| Spatial design | [reference/spatial-design.md](reference/spatial-design.md) |
| Extract reusable patterns into design system | [reference/extract.md](reference/extract.md) |
| Technical quality audit (a11y, perf, theming) | [reference/audit.md](reference/audit.md) |
| UX critique with scoring and persona testing | [reference/critique.md](reference/critique.md) |
| Adapt designs across screens, devices, contexts | [reference/adapt.md](reference/adapt.md) |
| Add purposeful animation to a feature | [reference/animate.md](reference/animate.md) |
| Amplifying bland designs | [reference/bolder.md](reference/bolder.md) |
| Clarify UX copy, error messages, microcopy | [reference/clarify.md](reference/clarify.md) |
| Add strategic color to monochromatic UI | [reference/colorize.md](reference/colorize.md) |
| Delight and personality | [reference/delight.md](reference/delight.md) |
| Strip unnecessary complexity | [reference/distill.md](reference/distill.md) |
| Error states, i18n, edge cases | [reference/harden.md](reference/harden.md) |
| Fix layout, spacing, visual rhythm | [reference/layout.md](reference/layout.md) |
| First-run / onboarding flows | [reference/onboard.md](reference/onboard.md) |
| Diagnose and fix UI performance | [reference/optimize.md](reference/optimize.md) |
| Quieting overstimulating designs | [reference/quieter.md](reference/quieter.md) |
| Improve typography: fonts, hierarchy, scale | [reference/typeset.md](reference/typeset.md) |
| Shape: plan UX/UI before coding | [reference/shape.md](reference/shape.md) |
| Craft: build a feature end-to-end | [reference/craft.md](reference/craft.md) |
| Overdrive: push past conventional limits | [reference/overdrive.md](reference/overdrive.md) |

Two flows live in sibling skills, not here: **project design-context setup** (strategic interview + DESIGN.md generation + legacy PRODUCT.md migration) is the `interface-init` skill, and **live in-browser variant iteration** (element picking, HMR hot-swap, parameter knobs) is the `interface-live` skill — tell the user to invoke it; it starts servers and edits files, so it never auto-triggers.

A flow the user reaches for often can be pinned as a standalone shortcut skill: `node .claude/skills/interface/scripts/pin.mjs pin <name>` (e.g. `pin audit` creates a lightweight `/audit` skill redirecting to `reference/audit.md`; `unpin` removes it). Offer this when the user repeatedly invokes the same flow by hand.

If the request doesn't map clearly to any reference, classify by intent:

- **Diagnosis** ("this isn't working", "what's wrong"): load `review.md` first, then pull in references where defects cluster.
- **Refinement** ("make this feel better", "polish this"): load `polish.md` first, then additional references by defect type.
- **Evaluation** ("audit", "check accessibility", "critique this page"): load `audit.md` for technical checks or `critique.md` for UX scoring with personas.
- **Simplification** ("simplify", "declutter", "too complex"): load `distill.md`.
- **Setup** ("set up design context", "generate DESIGN.md"): route to the **interface-init** skill. "Extract repeated patterns into the design system" stays here: load `extract.md`.
- **Performance** ("slow", "laggy", "janky"): load `optimize.md`.
- **Targeted transformation** ("fix the layout", "fix the typography", "make it responsive", "add color", "improve UX copy"): match to the specific command reference (`layout.md`, `typeset.md`, `adapt.md`, `colorize.md`, `clarify.md`).

Multiple references may be loaded simultaneously when a task genuinely spans domains (e.g., "review this animated component" → load both `animation.md` and `review.md`). When generating any UI — not just reviewing — always load `reference/forbidden.md` regardless of which other reference the task maps to.

## NEVER

- **NEVER animate layout properties** (`width`, `height`, `padding`, `margin`, `top`, `left`)
  **Instead:** Animate only `transform` and `opacity`.
  **Why:** Layout animation triggers the full render pipeline every frame — jank is structurally guaranteed, not fixable by tuning duration or easing.

- **NEVER use `ease-in` for UI animations**
  **Instead:** `ease-out` for entries; `cubic-bezier(0.23, 1, 0.32, 1)` for strong UI transitions.
  **Why:** `ease-in` delays initial movement — exactly when the user is watching most closely. It reads as sluggish at any duration.

- **NEVER start entry animations from `scale(0)` or bare `opacity: 0`**
  **Instead:** `scale(0.95) + opacity: 0` together.
  **Why:** `scale(0)` looks like an object appearing from nothing. The scale gives spatial grounding — the difference between digital and physical. Bare opacity fades with no motion context.

- **NEVER produce the category reflex** (dark blue for observability, teal for healthcare, navy for finance, purple for AI)
  **Instead:** Run the scene sentence: *"Who uses this, where, under what ambient light, in what mood?"* Let a concrete answer force a non-obvious choice.
  **Why:** Category-reflex output is the definition of slop. It fails the anti-slop test before a single element is rendered.

- **NEVER use gradient text, side-stripe accent borders (>1px `border-left/right`), or identical 3-column card grids**
  **Instead:** Weight/size/solid color for emphasis; full borders or background tints; asymmetric or varied layouts.
  **Why:** These are the three highest-signal AI design signatures. Any one of them fails the slop test solo.

- **NEVER animate keyboard-initiated actions**
  **Instead:** Zero animation on command palettes, keyboard shortcuts, or any action triggered 100+ times/day.
  **Why:** Animation accumulates into felt latency. At high frequency, 150ms of "polish" becomes minutes of lost time per workday.

- **NEVER use a JS motion library's shorthand value props for performance-critical animations**
  **Instead:** Use the full CSS `transform` string form so the browser can run it off the main thread. In Framer Motion: `animate={{ transform: "translateX(100px)" }}` instead of `animate={{ x: 100 }}`.
  **Why:** Shorthand props (e.g. `x`, `y`, `scale` in Framer Motion) use `requestAnimationFrame` on the main thread. Under concurrent page load they drop frames. The full `transform` string form — in any library — delegates to the compositor thread and stays smooth.

- **NEVER use `transition: all`**
  **Instead:** Specify exact properties: `transition: transform 200ms ease-out`.
  **Why:** `all` catches unintended properties (color, layout shifts) and creates invisible performance regressions that are hard to trace.

- **NEVER update a CSS custom property on a parent element inside a drag or scroll handler**
  **Instead:** Set `element.style.transform` directly on the target element.
  **Why:** Changing `--var` on a parent forces style recalculation on every descendant on every frame. At 60fps during a drag, this silently degrades to single-digit fps on complex components — the bottleneck doesn't appear in obvious profiling.
