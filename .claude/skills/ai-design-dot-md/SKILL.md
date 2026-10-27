---
name: ai-design-dot-md
description: "Create or extract a DESIGN.md file — a spec-compliant document combining YAML design tokens (name, colors, typography, spacing, rounded, components) with 8 ordered markdown sections (Overview through Do's & Don'ts) as persistent design-system context for AI agents. Use when adding design context to a project, generating DESIGN.md from frontend source code, defining a brand's token system, or updating an existing DESIGN.md. Don't use for implementing a design in code or editing component styles — this produces the DESIGN.md context file, not the UI itself. Triggers — design.md, DESIGN.md, design tokens, design system, extract design, create design file, brand tokens, AI design context."
---

# Create / Extract DESIGN.md

DESIGN.md = YAML design tokens (machine-readable) + 8 ordered markdown sections (human-readable rationale). Two modes: **extract** from existing source code, **create** from design intent.

MANDATORY READ before any token work (Phase 3+): [`references/design-md-spec.md`](references/design-md-spec.md) — Do NOT load during Phases 1 and 2.

---

## Phase 1 — Detect Mode

**Extract** — frontend source exists. Signals: `package.json`, `tailwind.config.js`, CSS/SCSS files, component directories with repeated styles.

**Create** — no extractable source. User provides brand brief, palette, adjectives, or aesthetic description.

Ambiguous → ask: "Extract design tokens from existing source code, or create from a design brief?"

If an existing `DESIGN.md` is present → ask: "Update existing file or replace it?"

Exit criterion: mode is unambiguous and any existing file decision is made.

---

## Phase 2 — Gather Inputs

### Extract mode

Scan in order:

1. `package.json` → detect framework (Svelte, React, Vue, Angular, Tailwind)
2. Framework config (`tailwind.config.js`, `svelte.config.js`, theme files)
3. Global CSS/SCSS → custom properties, font-face declarations, spacing scales
4. Component files → repeated class patterns, inline styles, token usage frequency

Consolidate near-duplicate colors (within ~10% perceptual distance). Use semantic keys in YAML (`primary`, `secondary`, `accent`) for cross-referencing. Use descriptive names ("Warm Amber") only in prose sections and as YAML value comments — never as token keys.

If no extractable tokens are found (minified CSS, no custom properties, framework-agnostic markup) → switch to Create mode and inform the user: "No design tokens found in source — I'll create DESIGN.md from a design brief instead."

### Create mode

Elicit: brand name, 2–3 personality adjectives, primary color or hex, secondary/accent colors, preferred typeface (or "system" if unspecified), corner style (sharp / soft / pill), density (compact / comfortable / spacious).

Exit criterion: `name` and at least one `primary` color are known before Phase 3.

---

## Phase 3 — Build YAML Frontmatter

Open the file with `---` fenced YAML. Required: `name`. Minimum color: `primary`.

Use `{path.to.token}` to cross-reference values — never repeat a hex code if a token already defines it.

For full schema (color formats, typography properties, dimension syntax, component property list) → [`references/design-md-spec.md`](references/design-md-spec.md)

Exit criterion: YAML block is valid syntax, `name` is present, all `{token}` references resolve to a defined token in the same block.

---

## Phase 4 — Write Markdown Sections

Before writing each section, ask: What decision would an AI agent make in this area without guidance? What value or constraint would it guess wrong? Answer that question in the prose — that's the value of the section.

Write all 8 sections **in this exact order** — no exceptions:

1. `## Overview` — brand personality, emotional intent, visual atmosphere. Editorial copy, not a list.
2. `## Colors` — semantic groupings (foundation, interactive, typography, states). Each entry: name + hex + role.
3. `## Typography` — font families, 9–15 hierarchy levels, character descriptions, usage rules.
4. `## Layout` — grid model, spacing strategy, density, responsive behavior.
5. `## Elevation & Depth` — shadow language, tonal layers, z-axis approach.
6. `## Shapes` — border-radius scale and rounding philosophy.
7. `## Components` — button variants, inputs, cards, navigation. Cover shape, color, states, transitions.
8. `## Do's and Don'ts` — ≥3 do's and ≥3 don'ts, concrete and actionable. Every don't names the do that replaces it (`Don't invent a new accent for CTAs — use {colors.primary}`), so attention lands on the target, not the banned value.

Write **intent**, not raw values. "Warm amber for primary CTAs to evoke energy" beats "button background: #F59E0B" — the YAML tokens carry exact values; the prose carries *why*.

Exit criterion: all 8 sections present, in order, no duplicate `##` headings, no section blank.

---

## Phase 5 — Place and Validate

Default placement: `DESIGN.md` at project root. If `.stitch/` directory exists, use `.stitch/DESIGN.md`.

Before writing, verify:

- `name` field present in YAML
- No duplicate `##` section headings
- All `{token.path}` references resolve within the YAML block
- Sections appear in prescribed order (Overview → Do's & Don'ts)
- Every don't in section 8 names its replacement do

When updating an existing file: diff against it and preserve rationale not covered by the extraction — do not discard context that wasn't changed. Prose that describes a token no longer defined in the YAML is the exception: drop it and tell the user which lines went, so stale rationale does not ride along under the new tokens.

Exit criterion: file written; passes all 5 checks above.

---

## NEVER

- **NEVER omit `name` from YAML frontmatter**
  **Instead:** Always include `name: "Brand Name"` as the first YAML field.
  **Why:** `name` is the only required field in the spec — its absence invalidates the entire token block.

- **NEVER write duplicate `##` section headings**
  **Instead:** Merge content into the canonical section; use `###` sub-headings for grouping within it.
  **Why:** Duplicate headings cause spec rejection in all compliant consumers.

- **NEVER write sections out of prescribed order**
  **Instead:** Always follow Overview → Colors → Typography → Layout → Elevation → Shapes → Components → Do's & Don'ts.
  **Why:** Spec consumers parse sections positionally — out-of-order content breaks tooling that expects structural sequence.

- **NEVER fill prose sections with raw CSS values**
  **Instead:** Describe design intent; let YAML tokens hold exact values.
  **Why:** Agents re-implementing in new contexts need to understand *why*, not replicate hex codes they could read from tokens.

- **NEVER use `{token.ref}` pointing to an undefined token**
  **Instead:** Define the referenced token first, or use an inline value.
  **Why:** Unresolved references silently break token inheritance in all consumers (Claude Code, Cursor, Kiro, Stitch).

- **NEVER leave a section blank or skip it without annotation**
  **Instead:** Include all 8 sections; mark genuinely unknown ones as "TBD — [what information is needed to complete this]".
  **Why:** Consumers assume a complete file; missing sections cause agents to invent values.
