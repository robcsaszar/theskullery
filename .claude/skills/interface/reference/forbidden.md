# Forbidden Patterns

These are the highest-signal AI design signatures. Each one fails the slop test on its own. Match-and-refuse: if you're about to write any of these, rewrite the element with different structure.

## Visual / CSS

**Gradient text** (`background-clip: text` + gradient background)
→ Use a single solid color. Emphasis via weight or size.

**Neon or outer glows** (`box-shadow` glows, colored drop shadows)
→ Use inner borders (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)`) or subtle tinted shadows.

**Pure `#000000` or `#ffffff`**
→ Tint every neutral toward the brand hue (OKLCH chroma 0.005–0.01).

**Oversaturated accent colors** (>80% saturation)
→ Desaturate until the accent blends elegantly with neutrals.

**Side-stripe borders** (`border-left` or `border-right` >1px as a colored accent on cards/callouts)
→ Full borders, background tints, leading icons, or nothing.

**Glassmorphism as default** (blurs and glass cards used decoratively everywhere)
→ Rare and purposeful, or nothing. If used: add 1px inner border and inner shadow to simulate edge refraction.

**Custom mouse cursors**
→ Remove. They degrade accessibility and performance.

## Layout

**The hero-metric template** (big number, small label, supporting stats, gradient accent)
→ Rewrite with actual content hierarchy. This pattern is a SaaS cliché.

**Identical card grids** (same-sized cards with icon + heading + text, repeated in rows)
→ Asymmetric grid, zig-zag, bento, or horizontal scroll. Vary at least size and proportion.

**Centered hero + centered body copy as default**
→ Split-screen, left-aligned content with right-aligned asset, or asymmetric whitespace.

**Modal as first thought**
→ Exhaust inline, progressive disclosure, and slide-over alternatives first. Modals are usually laziness.

**Nested cards**
→ Always wrong. Use `divide-y`, `border-t`, or negative space.

**`h-screen` on full-height sections**
→ `min-height: 100dvh` — `h-screen` causes catastrophic layout jump on iOS Safari.

## Animation

**`ease-in` on any UI element** → `ease-out` or custom curve.
**`scale(0)` as entry start** → `scale(0.95) + opacity: 0`.
**`transition: all`** → Specify exact properties.
**Animating `top`, `left`, `width`, `height`** → `transform` and `opacity` only.
**Animation on keyboard-initiated actions** → Remove entirely.
**Same speed for enter and exit** → Exit faster than enter.
**Keyframes on rapidly-triggered elements** → CSS transitions for interruptibility.
**Duration >300ms on everyday UI** → 150–250ms.
**Elements appearing all at once in a list** → Stagger 30–80ms between items.

## Typography

**Inter font for premium or creative contexts** → `Geist`, `Satoshi`, `Cabinet Grotesk`, `Outfit`.
**Serif on clean dashboards or software UI** → Sans-serif only.
**Oversized H1 as the primary hierarchy signal** → Control hierarchy with weight and color, not just scale.
**Flat type scale** (same size between levels) → ≥1.25 ratio between steps.

## Copy and Content

**AI copywriting clichés**: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary", "Game-Changing"
→ Concrete verbs: what does it actually do?

**Em dashes** (`—`, `--`)
→ Comma, colon, semicolon, period, or parentheses.

**Filler metrics**: `99.99%`, `50%`, `1,000,000`
→ Organic numbers: `47.2%`, `+1 (312) 847-1928`.

**Generic placeholder names**: "John Doe", "Jane Smith", "Acme Corp", "Nexus", "SmartFlow"
→ Invent realistic, contextually appropriate names with personality.

**Generic SVG avatars or "egg" user icons**
→ Creative placeholders, initials with intentional color, or real-feeling photo placeholders.

**Restated headings** (body copy that repeats what the heading just said)
→ Every word earns its place. The body continues; it doesn't restate.

## Z-Index

**Arbitrary z-index values on non-systemic elements** (`z-index: 50`, `z-index: 10` scattered throughout)
→ Use z-index only for systemic layer contexts: sticky navigation, modals, overlays, toasts. Define a small named scale (e.g., `--z-nav: 100; --z-modal: 200; --z-toast: 300`) and use nothing outside it. Arbitrary z-values create invisible stacking conflicts that only appear in edge cases.

## Emojis in UI Code

**Emojis in markup, alt text, or text content**
→ Replace with high-quality icons (Phosphor, Radix Icons, Lucide) or clean SVG primitives. Emojis render inconsistently across platforms, degrade accessibility, and read as unpolished.

## Creative Arsenal (When to Push Beyond Conventional)

When a design needs to feel technically extraordinary, pull from these patterns. Don't use them by default — match ambition to context.

**Navigation:** Mac OS dock magnification hover; magnetic buttons that pull toward the cursor; dynamic island pill that morphs to show status; contextual radial menu expanding at click coordinates.

**Layout:** Bento grid (asymmetric tile-based grouping); masonry (staggered rows without fixed height); split-screen scroll (two halves sliding in opposite directions); curtain reveal (hero parting on scroll).

**Cards:** Parallax tilt tracking mouse coordinates; spotlight border illuminating under cursor; holographic foil with iridescent shift on hover; morphing modal (button expands into full-screen dialog).

**Scroll:** Sticky scroll stack (cards stick and layer); horizontal scroll hijack (vertical → horizontal gallery pan); zoom parallax (central image zooms with scroll); SVG path drawing on scroll.

**Typography:** Kinetic marquee reversing direction on scroll; text mask reveal (large type as window into video background); text scramble (matrix character decode on load); circular text path.

**Micro-interactions:** Directional hover fill (enters from the side the mouse came from); ripple click effect (waves from exact coordinates); mesh gradient background (animated lava-lamp color blobs); skeleton shimmer (light moving across placeholders).

**Performance note:** Never mix animation libraries (e.g. GSAP + Framer Motion) in the same component tree. Use one library per animation context. For isolated canvas or full-page scrolltelling, GSAP/Three.js are appropriate; wrap in strict cleanup on unmount.

## The AI Slop Test

Run at two altitudes. Both must fail.

1. **First-order:** Could someone guess theme + palette from the category alone? (finance → navy, healthcare → teal, observability → dark blue, AI → purple/violet). If yes, rework.

2. **Second-order:** Could someone guess the aesthetic family from category + avoiding the first-order trap? ("AI tool that's not SaaS-cream" → editorial-typographic; "fintech that's not navy" → terminal-native dark). If yes, rework further. The second reflex is subtler and harder to catch.

The scene sentence is the fix for both: *"Who uses this, where, under what ambient light, in what mood?"* A concrete answer produces a non-obvious choice. An abstract answer produces a reflex.
