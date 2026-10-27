# SVG Animation Techniques — Code Reference

Worked, copy-ready code for each technique. Read the entry that matches the effect; the entries are independent.

**Contents**

| # | Technique | Approach |
|---|---|---|
| [1](#1-stroke-draw-effect-css) | Stroke draw effect | CSS |
| [2](#2-stroke-draw-effect-gsap--drawsvg) | Stroke draw effect | GSAP + DrawSVG |
| [3](#3-duotone--layered-stroke) | Duotone / layered stroke | CSS or GSAP |
| [4](#4-clip-path-reveal-css-transitions) | Clip-path reveal | CSS transitions |
| [5](#5-clip-path-reveal-css-keyframes) | Clip-path reveal | CSS keyframes |
| [6](#6-svg-clippath-with-animated-circle) | SVG `clipPath` with animated circle | SVG + CSS |
| [7](#7-svg-clippath-with-gradienttransform-sweep) | SVG `clipPath` gradient sweep | SVG + CSS |
| [8](#8-path-morphing-animejs) | Path morphing | anime.js |
| [9](#9-organic-blob-morphing-codrops-pattern) | Organic blob morphing | anime.js |
| [10](#10-hover-state-morphing-with-elastic-easing) | Hover-state morphing | anime.js |
| [11](#11-squash--stretch-gsap-custombounce) | Squash and stretch | GSAP CustomBounce |
| [12](#12-staggered-entrance-gsap) | Staggered entrance | GSAP |
| [13](#13-scroll-linked-draw-gsap-scrolltrigger) | Scroll-linked draw | GSAP ScrollTrigger |
| [14](#14-accessible-animation-wrapper) | Accessible animation wrapper | Any |
| [15](#15-css-only-stroke-draw-with-keyframes) | CSS-only stroke draw | CSS keyframes |

---

## 1. Stroke Draw Effect (CSS)

Normalize with `pathLength="1"` — no measuring, no JS, and it survives the artwork being redrawn.

```html
<path class="draw-path" pathLength="1" d="…" />
```

```css
.draw-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.5s ease-in-out;
}

.draw-path.active {
  stroke-dashoffset: 0;
}
```

**Measured variant — only for constant pen speed.** When several paths of different lengths must draw at the same visual rate, you need real lengths to derive per-path durations. Measure once at init and cache; never call `getTotalLength()` per frame.

```js
document.querySelectorAll('.draw-path').forEach(path => {
  const length = path.getTotalLength();
  path.style.setProperty('--path-length', length);
  path.style.setProperty('--draw-duration', `${length / 300}s`); // 300 units/sec
});
```

## 2. Stroke Draw Effect (GSAP + DrawSVG)

```js
import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(DrawSVGPlugin);

// Full draw
gsap.from('.logo-path', {
  drawSVG: '0%',
  duration: 2,
  ease: 'power2.inOut',
  stagger: 0.15
});

// Partial draw (middle 60% of path)
gsap.to('.accent-path', {
  drawSVG: '20% 80%',
  duration: 1.5,
  ease: 'power3.out'
});
```

## 3. Duotone / Layered Stroke

Layer two copies of a path with different colors and stagger timing:

```html
<svg viewBox="0 0 200 100">
  <path class="stroke-bg" d="M10 50 Q100 10 190 50"
        stroke="#e0e0e0" stroke-width="3" fill="none"/>
  <path class="stroke-fg" d="M10 50 Q100 10 190 50"
        stroke="#ff6b35" stroke-width="3" fill="none"/>
</svg>
```

```js
const tl = gsap.timeline();
tl.from('.stroke-bg', { drawSVG: '0%', duration: 1.8, ease: 'power2.inOut' })
  .from('.stroke-fg', { drawSVG: '0%', duration: 1.5, ease: 'power2.inOut' }, '-=1.2');
```

## 4. Clip-Path Reveal (CSS Transitions)

```css
.reveal-element {
  clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}

.reveal-element.visible {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}
```

### Circle expand reveal

```css
.circle-reveal {
  clip-path: circle(0% at 50% 50%);
  transition: clip-path 0.6s ease-out;
}

.circle-reveal.visible {
  clip-path: circle(75% at 50% 50%);
}
```

## 5. Clip-Path Reveal (CSS Keyframes)

```css
@keyframes wipe-in {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}

.wipe-enter {
  animation: wipe-in 0.8s ease-out forwards;
}
```

## 6. SVG clipPath with Animated Circle

```html
<svg viewBox="0 0 400 300">
  <defs>
    <clipPath id="reveal-clip">
      <circle class="clip-circle" cx="200" cy="150" r="0"/>
    </clipPath>
  </defs>
  <image href="photo.jpg" width="400" height="300"
         clip-path="url(#reveal-clip)"/>
</svg>
```

```js
gsap.to('.clip-circle', {
  attr: { r: 250 },
  duration: 1.2,
  ease: 'power3.out'
});
```

## 7. SVG clipPath with gradientTransform Sweep

```html
<svg viewBox="0 0 400 300">
  <defs>
    <linearGradient id="sweep" gradientTransform="translate(-1, 0)">
      <stop offset="0" stop-color="white"/>
      <stop offset="0.3" stop-color="white"/>
      <stop offset="0.7" stop-color="black"/>
      <stop offset="1" stop-color="black"/>
    </linearGradient>
    <mask id="sweep-mask">
      <rect width="400" height="300" fill="url(#sweep)"/>
    </mask>
  </defs>
  <g mask="url(#sweep-mask)">
    <image href="photo.jpg" width="400" height="300"/>
  </g>
</svg>
```

```js
gsap.to('#sweep', {
  attr: { gradientTransform: 'translate(1, 0)' },
  duration: 1.5,
  ease: 'power2.inOut'
});
```

## 8. Path Morphing (anime.js)

```js
import anime from 'animejs';

// Paths MUST have same number of points and commands
const startPath = 'M10,80 Q52,10 95,80 Q52,150 10,80';
const endPath   = 'M10,80 Q52,50 95,80 Q52,110 10,80';

anime({
  targets: '#morph-path',
  d: [{ value: endPath }],
  duration: 800,
  easing: 'easeInOutQuad',
  direction: 'alternate',
  loop: true
});
```

## 9. Organic Blob Morphing (Codrops Pattern)

```js
import anime from 'animejs';

const blobPaths = [
  'M60,-28.2C73.2,-7.8,76.5,17.7,66.2,38.5C55.9,59.3,32,75.5,5.5,78.2C-21,80.9,-50,70.2,-64.9,49.9C-79.9,29.6,-80.8,-0.3,-70.1,-23.8C-59.5,-47.3,-37.3,-64.4,-13.3,-69.6C10.8,-74.8,46.8,-48.6,60,-28.2Z',
  'M54.5,-32.1C65.6,-11.3,65.8,14.6,55.3,35.2C44.8,55.8,23.6,71.2,-0.2,71.3C-24,71.5,-50.6,56.5,-62.3,35.3C-74,14.1,-70.7,-13.3,-58.2,-34.8C-45.8,-56.3,-24.1,-72,1.2,-72.7C26.5,-73.3,43.3,-52.9,54.5,-32.1Z',
  'M47.4,-25.7C58.1,-5.6,60.8,19.3,50.5,38.3C40.2,57.3,16.8,70.5,-4.1,68.8C-25,67.1,-43.4,50.5,-54.6,30.8C-65.8,11.1,-69.8,-11.8,-60.5,-31.1C-51.2,-50.4,-28.6,-66.2,-4.5,-65.2C19.6,-64.2,36.7,-45.8,47.4,-25.7Z'
];

let currentPath = 0;

function morphBlob() {
  currentPath = (currentPath + 1) % blobPaths.length;
  anime({
    targets: '#blob path',
    d: [{ value: blobPaths[currentPath] }],
    duration: 2000,
    easing: 'easeInOutElastic(1, 0.4)',
    complete: morphBlob
  });
}

morphBlob();
```

### With floating motion

```js
// Combine morph with gentle translation
anime({
  targets: '#blob',
  translateY: [-10, 10],
  duration: 3000,
  easing: 'easeInOutSine',
  direction: 'alternate',
  loop: true
});
```

## 10. Hover State Morphing with Elastic Easing

```js
const btn = document.querySelector('.morph-btn');
const pathEl = btn.querySelector('path');

const restPath  = 'M0,0 L120,0 L120,40 L0,40 Z';
const hoverPath = 'M-5,-3 L125,-3 Q132,20 125,43 L-5,43 Q-12,20 -5,-3 Z';

btn.addEventListener('mouseenter', () => {
  anime({
    targets: pathEl,
    d: [{ value: hoverPath }],
    duration: 600,
    easing: 'easeOutElastic(1, 0.5)'
  });
});

btn.addEventListener('mouseleave', () => {
  anime({
    targets: pathEl,
    d: [{ value: restPath }],
    duration: 400,
    easing: 'easeOutQuad'
  });
});
```

## 11. Squash & Stretch (GSAP CustomBounce)

```js
import { gsap } from 'gsap';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomEase } from 'gsap/CustomEase';
gsap.registerPlugin(CustomBounce, CustomEase);

CustomBounce.create('myBounce', {
  strength: 0.6,
  squash: 3,
  squashID: 'myBounce-squash'
});

const tl = gsap.timeline();
tl.to('.ball', {
  y: 300,
  duration: 1.5,
  ease: 'myBounce'
})
.to('.ball', {
  scaleX: 1.4,
  scaleY: 0.6,
  transformOrigin: 'center bottom',
  duration: 1.5,
  ease: 'myBounce-squash'
}, 0); // start at same time
```

## 12. Staggered Entrance (GSAP)

```js
gsap.from('.icon-group path', {
  drawSVG: '0%',
  opacity: 0,
  duration: 0.8,
  ease: 'power2.out',
  stagger: {
    each: 0.08,
    from: 'start' // or 'center', 'end', 'random'
  }
});
```

## 13. Scroll-Linked Draw (GSAP ScrollTrigger)

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

gsap.from('.scroll-path', {
  drawSVG: '0%',
  ease: 'none',
  scrollTrigger: {
    trigger: '.svg-section',
    start: 'top 80%',
    end: 'bottom 20%',
    scrub: 1 // smooth 1s lag behind scroll
  }
});
```

## 14. Accessible Animation Wrapper

```js
function createAnimation(targets, vars) {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) {
    // Jump to end state instantly
    gsap.set(targets, {
      ...vars,
      duration: 0,
      stagger: 0,
      delay: 0
    });
    return;
  }

  return gsap.to(targets, vars);
}

// Usage
createAnimation('.hero-path', {
  drawSVG: '100%',
  duration: 2,
  ease: 'power2.inOut'
});
```

## 15. CSS-Only Stroke Draw with `@keyframes`

No JS and nothing to measure — `pathLength="1"` rescales the dash coordinate system so `1` always means "the whole path".

```html
<path class="logo-path" pathLength="1" d="…" />
```

```css
.logo-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 2s ease-in-out forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .logo-path {
    animation: none;
    stroke-dashoffset: 0;
  }
}
```
