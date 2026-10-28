# Design Laws Reference

## Color

**Use OKLCH.** Reduce chroma as lightness approaches 0 or 100 — high chroma at extremes looks garish.

**Never `#000` or `#fff`.** Tint every neutral toward the brand hue. Chroma of 0.005–0.01 is enough to feel intentional without being visible.

**Exception:** image outlines are one of the rare cases where pure black or pure white at low opacity is correct. The outline is a neutral separator, not a themed surface. See [reference/polish.md](polish.md).

**Pick a color strategy before picking colors:**

| Strategy | Surface coverage | Use case |
|---|---|---|
| **Restrained** | Tinted neutrals + one accent ≤10% | Product UI, minimalist brand |
| **Committed** | One saturated color at 30–60% | Identity-driven pages, brand heroes |
| **Full palette** | 3–4 named roles, each used deliberately | Campaigns, data visualization |
| **Drenched** | The surface IS the color | Campaign heroes, bold brand pages |

The "one accent ≤10%" rule applies only to Restrained. Don't collapse every design to Restrained by reflex.

**Max 1 accent color in product UI.** Saturation below 80%. Stick to one palette throughout — don't mix warm and cool grays in the same project.

**Dominant + sharp accent.** Timid, evenly-distributed palettes feel unresolved. Commit one color as dominant (40–70% of visual weight), then land a single sharp accent against it. The contrast between a dominant and its accent is where the palette's personality lives.

## Theme: Dark vs. Light

Dark vs. light is never a default. Not dark "because tools look cool dark." Not light "to be safe."

**Run the scene sentence before choosing:**

> *"Who uses this, where, under what ambient light, in what mood?"*

If the sentence doesn't force the answer, it's not concrete enough. Add detail until it does.

- "Observability dashboard" does not force an answer.
- "SRE glancing at incident severity on a 27-inch monitor at 2am in a dim room" does.

Run the sentence, not the category.

## Typography

- **Line length:** 65–75ch for body text. Beyond that, the eye loses its place at line return.
- **Hierarchy:** Scale + weight contrast, ≥1.25 ratio between steps. Flat scales have no hierarchy.
- **No Inter.** It is the default AI font. Use `Geist`, `Satoshi`, `Cabinet Grotesk`, or `Outfit` for personality.
- **Serif constraints:** Serif only for editorial/creative contexts. Never on clean dashboards or software UI.
- **Headlines:** `tracking-tighter leading-none` at display sizes. Avoid loose tracking at large scale.
- **No oversized H1s.** Control hierarchy with weight and color, not just massive scale.

## Layout

**Vary spacing for rhythm.** Same padding everywhere is monotony. Use tighter spacing inside components, more generous spacing between sections.

**Cards earn their place.** Use only when elevation communicates hierarchy. If you're using a card purely to group content, use negative space, `divide-y`, or `border-t` instead. Nested cards are always wrong.

**Don't wrap everything in a container.** Full-bleed elements are intentional. Reserve containers for text-heavy content (65–75ch constraint) and page-level max-width.

**Asymmetric layouts.** Centered hero + centered text is the first training-data reflex. Prefer split-screen (50/50), left-aligned content with right-aligned asset, or asymmetric whitespace. On mobile, collapse to single-column aggressively (`w-full px-4`).

**Grid over flex math.** `grid-template-columns: repeat(3, 1fr)` over `width: calc(33% - 1rem)`.

**Spatial composition levers** — name one before coding the layout:

- *Diagonal flow*: content arranged along a diagonal axis, not a horizontal grid
- *Overlap*: elements intentionally crossing boundaries to create depth
- *Grid-breaking*: a single element escaping the column structure for emphasis
- *Generous negative space*: editorial, expensive, airy (art gallery mode)
- *Controlled density*: everything present and purposeful, nothing wasted (cockpit mode)

## Shadows and Materiality

Tint shadows toward the background hue — not neutral gray. A blue card on a blue background should have a blue-tinted shadow.

Use shadow to communicate elevation (z-axis), not decoration. If the shadow doesn't communicate hierarchy, remove it.

**Grain/noise filters:** Apply only to `fixed`, `pointer-events-none` pseudo-elements. Never on scrolling containers — continuous GPU repaint degrades mobile performance.

## Visual Density

**Art gallery (airy):** Huge section gaps, lots of whitespace, everything expensive and clean. Editorial, portfolio, luxury brand.

**Daily app (balanced):** Normal spacing for standard web apps. The default for product UI.

**Cockpit (packed):** Tiny padding, no card boxes, `divide-y` and negative space, all numbers in `font-mono`. For dashboards where data density is the product.

When density is high (cockpit mode): drop generic card containers. Group with logic (`border-t`, `divide-y`) or pure negative space. Data should breathe without being boxed unless elevation is functionally required.

## Copy

- Every word earns its place. No restated headings. No intros that repeat the title.
- No em dashes (`—` or `--`). Use commas, colons, semicolons, periods, or parentheses.
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary". Use concrete verbs.
- Avoid filler metrics: `99.99%`, `50%`, `1,000,000`. Use organic numbers: `47.2%`, `+1 (312) 847-1928`.
- No "John Doe", "Jane Smith", "Acme Corp". Invent realistic names with personality.

## Before You Code

Answer these before touching a file. Skip them and you'll design by reflex.

1. **Purpose** — What problem does this interface solve? Who uses it?
2. **Tone** — Pick an extreme and name it: brutally minimal, maximalist, retro-futuristic, editorial, industrial, organic, luxury, playful, brutalist, art deco. Name it before reaching for colors.
3. **Differentiator** — What is the ONE thing someone will remember? If you can't name it, you haven't committed.
4. **Constraints** — Framework, performance budget, accessibility requirements.

**Anti-convergence mandate.** Never reach for the same aesthetic family across different projects. If the last three interfaces you generated were typographic-editorial, force a different axis on the next one. Space Grotesk on a dark background with subtle grain is a reflex, not a choice. Vary: light vs. dark, structured vs. organic, dense vs. airy, typographic vs. illustrative. No two projects should look like siblings.
