# Component Patterns Reference

## Buttons and Pressable Elements

Every button must have `:active` feedback — the interface must confirm it heard the user.

```css
.button {
  transition: transform 160ms ease-out;
}
.button:active {
  transform: scale(0.97);
}
```

Scale range: 0.95–0.98. Applies to any pressable element. `scale()` scales children proportionally — this is a feature, not a bug.

## Popovers: Origin-Aware Scaling

Popovers must scale in from their trigger point, not from center.

```css
/* Radix UI */
.popover { transform-origin: var(--radix-popover-content-transform-origin); }

/* Base UI */
.popover { transform-origin: var(--transform-origin); }
```

**Exception: modals.** Modals are not anchored to a trigger — they appear centered in the viewport and must keep `transform-origin: center`.

## Tooltips: Instant on Subsequent Hover

First tooltip waits (prevents accidental activation). Once one is open, adjacent tooltips appear instantly with no animation.

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}
.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}
/* Skip for adjacent tooltips */
.tooltip[data-instant] { transition-duration: 0ms; }
```

## Forms

- Label above input, always. Never placeholder-as-label.
- Helper text optional but present in markup.
- Error text below input, inline (never modal or toast).
- Use `gap: 0.5rem` between input blocks.
- Error state: red border + error text, not just one or the other.

## Interaction State Completeness

LLMs generate "happy path" states by default. Always implement the full cycle:

| State | Implementation |
|---|---|
| **Loading** | Skeleton loaders matching layout geometry — not generic spinners |
| **Empty** | Composed empty state showing how to populate, not just "No items" |
| **Error** | Clear inline error with recovery action — never just a red message |
| **Success** | Tactile feedback: `translateY(-1px)` or `scale(0.98)` on confirm |

Skeleton loaders must match the actual layout dimensions — a skeleton for a 3-column list should have 3 placeholder columns.

## Layout and Viewport

```css
/* Always — iOS Safari crashes vh units on full-height sections */
.hero { min-height: 100dvh; }

/* Grid over flex percentage math */
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
/* Never: width: calc(33% - 1rem) */
```

**Contain page layouts** with a sensible max-width (e.g., 1280–1400px) centered in the viewport. Don't wrap everything in a container — most things don't need one.

## Blur for Crossfade Masking

When a crossfade between two states looks wrong despite tuning, add `filter: blur(2px)` during transition. Without blur, both states are visible simultaneously as distinct objects. Blur bridges them.

```css
.content { transition: filter 200ms ease, opacity 200ms ease; }
.content.transitioning { filter: blur(2px); opacity: 0.7; }
```

Keep blur under 20px — heavy blur is expensive in Safari.

## Spacing and Rhythm

Vary spacing for rhythm — identical padding everywhere is monotony.

Use cards only when elevation communicates hierarchy. When a shadow is used, tint it toward the background hue (not neutral gray). Nested cards are always wrong.

## Asymmetric Enter/Exit

Enter can be deliberate (slow), exit must always be snappy.

```css
.overlay { transition: clip-path 200ms ease-out; }           /* exit: fast */
.button:active .overlay { transition: clip-path 2s linear; } /* enter: deliberate */
```

## Component Personality

Match motion to the component's mood. A professional dashboard should be crisp and fast. A playful tool can be bouncier. Cohesion matters: the easing, duration, visual design, and name should all feel like the same thing.

Principles for building components people love:

1. **DX over features.** The less friction to adopt, the more people use it. Minimize setup ceremony — no wrappers, no configuration required for the default case.
2. **Good defaults beat options.** Most users never customize. Ship beautiful out of the box; options are for edge cases, not the baseline experience.
3. **Naming creates identity.** A memorable name beats a purely descriptive one. Sacrifice discoverability for memorability when the component is the product.
4. **Handle edge cases invisibly.** Pause timers when the tab is hidden. Fill visual gaps with pseudo-elements to maintain hover state. Users never notice these — that is exactly right.
5. **Review your work the next day.** Imperfections missed during development are obvious with fresh eyes. Play animations at 0.25× speed to catch timing issues invisible at full speed.

## scale() Scales Children

Unlike `width`/`height`, `scale()` also scales an element's children proportionally — font size, icons, and content all scale together. When scaling a button on press, this is a feature, not a bug.

## Animation Isolation

Isolate CPU-heavy perpetual animations (infinite loops, continuous motion) at the component boundary — never let them trigger re-renders in parent layout components. The pattern applies regardless of framework: a memoized leaf component in React, a standalone `<script>` island in Astro, an isolated component in Vue.

When using any motion library, verify it supports interruption and retargeting — libraries that restart from zero on interruption feel broken under rapid user interaction.
