---
name: with-svg-animation
description: "Surfaces the SVG animation traps that go unmentioned when a request sounds simple — dash patterns restarting at every subpath, pathLength normalization, transform-box on inner elements. Use whenever animating an SVG (draw-on, hover spin or scale, path morph, clip reveal, scroll-linked draw), including when the request names none of these and sounds like a one-liner, and when choosing between CSS, SMIL, WAAPI, GSAP, or a morph library. Don't use for raster or canvas animation (see with-canvas) or for non-SVG DOM transitions."
---

# with-svg-animation

You already know how to animate SVG. What you reliably fail to do is *raise these conditions when the user hasn't named them* — a vague request produces a plausible answer that breaks on the user's actual artwork. This body is a pre-flight, not a tutorial.

## Pre-flight — answer before writing any code

Read the actual path data; if you can't see it, ask for it. Never answer from the request alone — every trap below is invisible in the request and obvious in the markup.

1. **Is the thing being animated the root `<svg>`, or an element inside it?** Inner elements need `transform-box`.
2. **Does the target `d` contain more than one `M` command?** One `<path>` can hold several disconnected subpaths.
3. **Is the artwork stroked or filled?** A draw-on animation only animates a stroke; a filled logo needs stroke-then-crossfade, or a mask wipe instead.
4. **How many elements animate at once, and is it scroll-linked?** Dash and `d` are paint-level, not compositable — dozens of them on a mid-range phone is a different problem than one logo, and answering "many" or "scroll-linked" puts you under the paint budget in the last NEVER before you write anything.

## Already broken? Match the symptom

| Symptom | Cause |
|---|---|
| Shape swings across the canvas instead of pivoting | `transform-box` missing on an inner element |
| Strokes start together but finish at different times | One `<path>`, several subpaths — dash pattern restarts per subpath |
| Morph hard-cuts halfway instead of tweening | Command sequences don't match, so interpolation fell back to discrete |
| Reveal edge drifts or scales with the artwork | `clip-path` and `transform` on the same node |

## Traps

**Dash patterns restart at every subpath.** A single `<path>` whose `d` has three `M` commands is not one continuous dash run — each subpath gets its own copy of the pattern, so all three start together and finish at different times. It reads as a glitch. Split the `d` into one `<path>` per subpath (a mechanical edit at each `M`) to get per-stroke control and staggering. `pathLength` does not rescue the single-path version.

**Use `pathLength="1"` instead of measuring.** It rescales the coordinate system that `stroke-dasharray` and `stroke-dashoffset` operate in, so `dasharray: 1; dashoffset: 1` hides any path regardless of length. No `getTotalLength()`, no hardcoded numbers that break when a designer nudges the artwork. Reach for measurement only when you need true constant pen-speed across paths of differing length.

**`transform-origin` needs `transform-box: fill-box` on inner elements.** On the root `<svg>` it behaves like a CSS box and `transform-origin: center` works. On a `<path>` or `<g>`, `transform-box` defaults to `view-box`, so `center` means the centre of the viewBox and the shape swings across the canvas instead of pivoting. Set both properties explicitly on every animated inner element.

**Do not reach for `vector-effect="non-scaling-stroke"` by reflex.** It keeps on-screen stroke width constant regardless of scale, which is wrong for a logo — a mark should thicken as it grows. It also forces stroke geometry to recompute against the current CTM on every paint, which compounds badly with dash animation. Use it only when constant stroke weight is the stated intent.

**A clip and a transform on the same node are one rigid unit.** Per spec the element's own transform also transforms its clip, so the reveal edge welds to the artwork and scales with it. When you want them decoupled, put `clip-path` on an outer group and the transform on an inner one. When you want them welded, put both on the same node deliberately.

## Escalation — CSS first

Start in CSS and escalate only when CSS structurally cannot do it, not when it merely gets awkward:

| Reach for | When |
|---|---|
| CSS | Anything expressible as `transform`, `opacity`, dash offset, or interpolating between same-type same-vertex-count shapes |
| SMIL `<animate>` | Cross-browser `d` animation with no JS — Firefox does not support CSS `d` interpolation |
| WAAPI | You need JS control, scroll/pointer input, or reduced-motion branching, and `d` support is adequate for your targets |
| Library | Only for geometry no native technique can produce — resampling mismatched point counts (Flubber) or subpath-count changes |

GSAP's DrawSVG and MorphSVG are paid Club GreenSock plugins. Never emit code depending on them without confirmed licensing — check the project's dependencies or ask. Unconfirmed means use the native route or Flubber, and say why you did.

MANDATORY READ [`references/techniques.md`](references/techniques.md) before writing stroke-draw, clip-path, morph, squash-stretch, stagger, or scroll-linked code — 15 worked examples, each independently readable via the contents table. Do NOT load it for approach-selection or diagnosis questions; this body answers those.

## NEVER

- **NEVER morph between paths with different command sequences**
  **Instead:** author both states with identical commands in identical order — including a degenerate zero-radius subpath when a hole must appear — or hand resampling to a library.
  **Why:** interpolation is a per-coordinate lerp over two command lists; a structural mismatch silently falls back to a discrete swap and hard-cuts at 50%.

- **NEVER scroll-link dash animation across many paths without a paint budget**
  **Instead:** round offset writes to whole units, skip paths outside their active range, cache lengths once, and move any continuous background transform out to a promoted HTML wrapper.
  **Why:** dash offset regenerates stroke geometry every frame on the main thread; it is fine for one logo and janks a mid-range phone across dozens.
