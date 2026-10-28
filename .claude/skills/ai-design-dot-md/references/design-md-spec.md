# DESIGN.md Spec Reference

## YAML Token Schema

```yaml
version: "alpha"          # optional
name: "My Brand"          # REQUIRED
description: "..."        # optional

colors:
  primary: "#855300"
  secondary: "#1a3a4a"
  accent: "#f0c060"

typography:
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  heading-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2

rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  pill: "9999px"

spacing:
  1: "4px"
  2: "8px"
  4: "16px"
  8: "32px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
```

---

## Color Formats Supported

| Format | Example |
|---|---|
| Hex short | `#RGB` |
| Hex full | `#RRGGBB` |
| Hex with alpha | `#RRGGBBAA` |
| Named | `red`, `transparent` |
| Functional | `rgb()`, `rgba()`, `hsl()`, `hsla()`, `hwb()` |
| Wide-gamut | `oklch()`, `oklab()`, `lch()`, `lab()` |
| Mix | `color-mix(in srgb, #a00 50%, #00a)` |

---

## Dimension Syntax

String with unit suffix: `"16px"`, `"1rem"`, `"1.5em"`

Spacing can also be unitless numbers: `4`, `8`, `16` (treated as px-equivalent scale)

---

## Typography Properties

| Property | Type | Example |
|---|---|---|
| fontFamily | string | `"Inter, sans-serif"` |
| fontSize | Dimension | `"16px"` |
| fontWeight | number | `400` |
| lineHeight | Dimension or unitless | `1.5` or `"24px"` |
| letterSpacing | Dimension | `"0.01em"` |
| fontFeature | string | `"liga 1"` |
| fontVariation | string | `"wght 400"` |

Typography hierarchy guidance: aim for 9–15 named levels. Suggested names: `display`, `heading-xl`, `heading-lg`, `heading-md`, `heading-sm`, `label-lg`, `body-lg`, `body`, `body-sm`, `caption`, `overline`.

---

## Component Properties

Supported: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`

Component property values can be token references (`{colors.primary}`) or inline values (`"#ffffff"`).

---

## Token Reference Syntax

`{path.to.token}` — dot-separated path to any token in the same YAML block.

| Reference | Resolves? | Reason |
|---|---|---|
| `{colors.primary}` | ✅ | `colors.primary` is defined |
| `{rounded.md}` | ✅ | `rounded.md` is defined |
| `{colors.brand-green}` | ❌ | no such token defined |

---

## Section Minimum Content

| Section | Required minimum |
|---|---|
| Overview | Brand name, 2–3 personality descriptors, emotional intent |
| Colors | At least `primary`; semantic groupings preferred |
| Typography | At least body + one heading level; 9–15 levels ideal |
| Layout | Grid model (columns, gutters), spacing strategy, density |
| Elevation & Depth | Shadow approach, tonal layers, z-index philosophy |
| Shapes | Border-radius scale and philosophy (sharp / soft / pill) |
| Components | Button, input, card at minimum; include states and transitions |
| Do's and Don'ts | ≥3 do's, ≥3 don'ts; concrete and actionable |

---

## Validation Checklist

Before writing the file:

- [ ] `name` field present in YAML
- [ ] No duplicate `##` section headings
- [ ] All `{token.path}` references resolve within the same YAML block
- [ ] Sections appear in order: Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's & Don'ts

---

## Framework-Specific Extraction Notes

**Tailwind**: Token values live in `tailwind.config.js` under `theme.extend`. Map `colors`, `fontFamily`, `spacing`, `borderRadius` directly.

**CSS custom properties**: `--color-primary`, `--font-size-base` etc. in `:root` → map to YAML tokens; strip the `--` prefix and convert kebab-case to dot-path.

**Svelte**: Theme tokens often in `src/lib/styles/` or `app.css`. Check `$lib/tokens.ts` or similar.

**React**: Look for `theme.ts`, `tokens.ts`, styled-components `ThemeProvider`, or MUI `createTheme`.
