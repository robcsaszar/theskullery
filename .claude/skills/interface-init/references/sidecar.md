# The `.interface/design.json` Sidecar

The frontmatter owns token primitives (colors, typography, rounded, spacing, components). The sidecar at `.interface/design.json` carries **what the spec's schema can't hold**: the machine-readable strategic block, tonal ramps per color, shadow/elevation tokens, motion tokens, breakpoints, full component HTML/CSS snippets (the interface-live panel renders these into a shadow DOM), and narrative (north star, rules, do's/don'ts). It extends the frontmatter, it doesn't duplicate it.

Regenerate the sidecar whenever you regenerate root DESIGN.md. If the user only asks to refresh the sidecar (e.g. from the live panel's stale-hint), preserve DESIGN.md and write only `.interface/design.json`.

## Schema

```json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601 string",
  "title": "Design System: [Project Title]",
  "strategic": {
    "register": "brand | product",
    "users": "One-paragraph who/context/job summary.",
    "purpose": "What the product does and what success looks like.",
    "personality": "3-word personality + voice summary.",
    "principles": ["principle 1", "principle 2"],
    "antiReferences": ["verbatim anti-reference 1", "..."],
    "accessibility": "WCAG level and known needs."
  },
  "extensions": {
    "colorMeta": {
      "primary":        { "role": "primary",  "displayName": "Editorial Magenta", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "warm-ash-cream": { "role": "neutral",  "displayName": "Warm Ash Cream",    "canonical": "oklch(96% 0.005 350)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "Display", "purpose": "Hero headlines only." }
    },
    "shadows": [
      { "name": "ambient-low", "value": "0 4px 24px rgba(0,0,0,0.12)", "purpose": "Diffuse hover glow under accent elements." }
    ],
    "motion": [
      { "name": "ease-standard", "value": "cubic-bezier(0.4, 0, 0.2, 1)", "purpose": "Default easing for state transitions." }
    ],
    "breakpoints": [
      { "name": "sm", "value": "640px" }
    ]
  },
  "components": [
    {
      "name": "Primary Button",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "One-line what and when.",
      "html": "<button class=\"ds-btn-primary\">GET STARTED</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
  "narrative": {
    "northStar": "The Editorial Sanctuary",
    "overview": "2-3 paragraphs of the philosophy, pulled from DESIGN.md Overview section.",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "The One Voice Rule", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["Do use ..."],
    "donts": ["Don't use ..."]
  }
}
```

The `strategic` block is the machine-readable copy of DESIGN.md's Overview subsections and the anti-references from Do's and Don'ts. Scripts (interface-live's server, the panel) read register and anti-references from here; the prose in DESIGN.md remains the human- and agent-readable source. Keep the two in sync — the sidecar is regenerated from DESIGN.md, never hand-drifted away from it.

Token metadata is keyed by the frontmatter token name (`colorMeta.<token-name>`, `typographyMeta.<token-name>`) — the sidecar carries only metadata that can't live in the frontmatter (tonal ramps, canonical OKLCH when the hex is an approximation, display names, role hints). Components carry full HTML/CSS because the spec's 8-prop set can't hold them.

## Component translation rules

The `html` and `css` fields must be **self-contained, drop-in snippets** that render correctly when injected into a shadow DOM. The panel applies them directly: no post-processing, no framework runtime.

1. **Tailwind expansion.** If the source uses Tailwind (`className="bg-primary text-white rounded-lg px-6 py-3"`), expand every utility to literal CSS properties in the `css` string. Do **not** reference Tailwind classes; do **not** assume a Tailwind CSS bundle is loaded. Each component is self-contained.
2. **Token resolution.** If the project exposes tokens as CSS custom properties on `:root` (e.g. `--color-primary`, `--radius-md`), reference them via `var(--color-primary)`; they inherit through the shadow DOM and stay live-bound. If tokens live only in JS theme objects (styled-components, CSS-in-JS), resolve to literal values at generation time.
3. **Icons.** Inline as SVG. Do not reference Lucide/Heroicons packages, icon fonts, or `<img src="...">`. A typical icon is 16-24px; copy the SVG path data directly.
4. **States.** Include `:hover`, `:focus-visible`, and (if meaningful) `:active` rules inline. A static default-only snapshot makes the panel feel dead.
5. **Reset bloat.** Extract only the component's *distinctive* CSS (background, color, padding, border-radius, typography, transition). Skip universal resets; the panel already has a neutral canvas.
6. **Scoped class names.** Prefix every class with `ds-` (e.g. `ds-btn-primary`, `ds-input-search`) so component CSS doesn't collide with other components' CSS in the same shadow DOM.

## What to include

Aim for a tight set of **5-10 components** that best represent the visual system:

- **Canonical primitives (always include if the project has them):** button (each variant as a separate component entry), input/text field, navigation, chip/tag, card.
- **Signature components (include if distinctive):** hero CTA, featured card, filter pill, any custom pattern the user called out as important during the strategic interview.
- **Skip the rest.** Utility components, form building blocks, wrapper layouts: not worth documenting unless visually distinctive.

If the project has **no component library yet** (bare landing page, new project), synthesize canonical primitives from the tokens using best-practice defaults consistent with the DESIGN.md's rules. Every `.interface/design.json` has *something* to render, even on day zero.

## Tonal ramps

For each color token, generate an 8-step `tonalRamp` array: dark to light, same hue and chroma, stepped lightness from ~15% to ~95%. The panel renders this as a strip under the swatch. If the project already defines a tonal scale (Material `surface-container-low` family, Tailwind-style `blue-50..blue-900`), use those values. Otherwise synthesize in OKLCH.

## Narrative mapping

Pull directly from the DESIGN.md you just wrote:

- `narrative.northStar` → the `**Creative North Star: "..."**` line from Overview
- `narrative.overview` → the philosophy paragraphs from Overview
- `narrative.keyCharacteristics` → the bulleted `**Key Characteristics:**` list
- `narrative.rules` → every `**The [Name] Rule.** [body]` across all sections, tagged with `section`
- `narrative.dos` / `narrative.donts` → the bullet lists from Do's and Don'ts verbatim
- `strategic.*` → the Overview subsections and the anti-reference Don'ts, verbatim

Do not reword. The panel shows these as secondary collapsible context; the same voice that's in the Markdown carries through.
