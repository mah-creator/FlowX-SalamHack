# Navbar Scroll Animation Fix Plan

## Problem Statement

The navbar has a scroll-direction-aware effect: when the user scrolls **down**, the navigation links fade out and the navbar shrinks; when the user scrolls **up**, the links reappear and the navbar expands back. The effect is **functional** but suffers from two issues:

1. **Jumping / Jarring layout shift** — The navbar width snaps instantly instead of transitioning smoothly.
2. **Spacing inconsistency** — When links are hidden, the gap between the Logo and the CTA buttons is not handled gracefully, leaving either too much or too little space.

---

## Root Cause Analysis

### Issue 1: Layout Jump

The current animation in `Navbar.tsx` uses `display: none` / `display: flex` to remove/add the links container from layout flow:

```tsx
// On scroll down — after opacity fades:
gsap.set(linksRef.current, { display: 'none' });   // Line 62

// On scroll up — before fading in:
gsap.set(linksRef.current, { display: 'flex' });    // Line 70
```

`display` is a **non-animatable** CSS property. When it flips from `flex` → `none`, the element is instantly removed from the document flow, causing:
- The `<nav>` (which uses `w-auto`) to recalculate its intrinsic width in a single frame.
- A visible "jump" as the nav snaps from wide → narrow (or narrow → wide).

### Issue 2: Spacing

The `<nav>` uses `justify-between` with three direct children:

```
[ Logo ]  —  [ Links ]  —  [ CTA Buttons ]
```

When `Links` gets `display: none`, the nav collapses to:

```
[ Logo ]  ———————————  [ CTA Buttons ]
```

The remaining `justify-between` distributes the Logo and CTA buttons to opposite edges of the now-narrower nav, but the transition between these two states is instant, so the spacing "jumps."

---

## Proposed Solution

Replace the `display: none/flex` toggle with a **width + overflow** animation. The links container will smoothly collapse to `width: 0; overflow: hidden` (keeping `display: flex` at all times), allowing the navbar to resize fluidly via CSS `transition` on its own width.

### Key Principles

| Principle | Why |
|---|---|
| Never toggle `display` | It's not animatable and causes instant reflow |
| Animate `width` or `max-width` of the links container | Allows the element to smoothly shrink/grow within the flex layout |
| Use `overflow: hidden` on the links during collapse | Prevents content from spilling out while the container shrinks |
| Keep `gap` consistent | Use a fixed or transitioning gap so spacing doesn't jump |
| Add `transition` to the `<nav>` itself | So the overall bar width interpolates smoothly as its content resizes |

---

## Implementation Steps

### Phase 1: Remove `display` Toggle, Use Width Animation

**File:** `src/components/layout/Navbar.tsx`

#### Step 1.1 — Store the natural width of the links container

On mount (inside `useGSAP`), measure and cache the links container's natural `scrollWidth` so we know what value to animate back to.

```tsx
const linksNaturalWidth = useRef(0);

useGSAP(() => {
  if (linksRef.current) {
    linksNaturalWidth.current = linksRef.current.scrollWidth;
  }
  // ... rest of the hook
}, []);
```

#### Step 1.2 — Replace the scroll-down animation

Replace the current `gsap.to(…)` + `display: none` with a smooth width collapse:

```diff
  if (scrollingDown && !linksHiddenRef.current) {
-   gsap.to(linksRef.current, {
-     y: -16,
-     opacity: 0,
-     duration: 0.25,
-     ease: 'power2.out',
-     pointerEvents: 'none',
-     onComplete: () => {
-       if (linksRef.current) {
-         gsap.set(linksRef.current, { display: 'none' });
-       }
-     },
-   });
+   gsap.to(linksRef.current, {
+     opacity: 0,
+     width: 0,
+     marginLeft: 0,
+     marginRight: 0,
+     gap: 0,
+     duration: 0.4,
+     ease: 'power2.inOut',
+     pointerEvents: 'none',
+     overflow: 'hidden',
+   });
    linksHiddenRef.current = true;
  }
```

#### Step 1.3 — Replace the scroll-up animation

Replace the `display: flex` set + `fromTo` with a smooth width expansion:

```diff
  if (!scrollingDown && linksHiddenRef.current) {
-   gsap.set(linksRef.current, { display: 'flex' });
-   gsap.fromTo(
-     linksRef.current,
-     { y: -16, opacity: 0 },
-     {
-       y: 0,
-       opacity: 1,
-       duration: 0.25,
-       ease: 'power2.out',
-       pointerEvents: 'auto',
-     }
-   );
+   gsap.to(linksRef.current, {
+     opacity: 1,
+     width: linksNaturalWidth.current,
+     duration: 0.4,
+     ease: 'power2.inOut',
+     pointerEvents: 'auto',
+     overflow: 'visible',
+     clearProps: 'width,overflow,marginLeft,marginRight,gap',
+     // clearProps resets inline styles once animation completes,
+     // so the element goes back to its natural flex sizing
+   });
    linksHiddenRef.current = false;
  }
```

> **Important:** `clearProps` runs at the **end** of the tween. It strips the inline `width`, `overflow`, etc., returning the element to its natural CSS-driven size. This is critical so the links container remains responsive if the viewport resizes.

#### Step 1.4 — Remove the `y` (translateY) shift

The original code translates the links 16 px up (`y: -16`) during hide. This vertical displacement contributes to the "jump" feeling because the navbar's vertical alignment is disrupted. Since the navbar is a horizontal flex row, a vertical slide is visually inconsistent — **remove it entirely** and rely on the opacity + width collapse for a cleaner effect.

---

### Phase 2: Add Scroll Threshold / Debounce

The current implementation fires on **every single scroll event**, meaning even a 1 px scroll toggles the animation. This causes flickering when the user scrolls slowly or reaches scroll boundaries.

#### Step 2.1 — Add a scroll delta threshold

Only trigger the animation when the scroll delta exceeds a minimum threshold (e.g. 5 px):

```tsx
const SCROLL_THRESHOLD = 5;

const onScroll = () => {
  const currentY = window.scrollY;
  const delta = currentY - lastY;

  if (Math.abs(delta) < SCROLL_THRESHOLD) return;

  const scrollingDown = delta > 0;
  // ... rest of logic

  lastY = currentY;
};
```

#### Step 2.2 — Skip when near the top

When the page is near the top (`scrollY < 80`), always show links regardless of scroll direction:

```tsx
if (currentY < 80 && linksHiddenRef.current) {
  // Force-show links when near top
  // ... run the "show" animation
}
```

---

### Phase 3: Fix Spacing Between Logo and CTA

#### Step 3.1 — Replace `justify-between` with explicit gaps

The `justify-between` layout pushes items to the edges, but when the middle child collapses, the remaining two snap to opposite ends. A better approach:

```diff
- <nav className="... flex items-center justify-between ...">
+ <nav className="... flex items-center justify-center ...">
    <Logo className="shrink-0" />

-   <div ref={linksRef} className="hidden lg:flex items-center gap-8 ...">
+   <div ref={linksRef} className="hidden lg:flex items-center gap-8 mx-auto ...">
      {/* links */}
    </div>

    <div className="... items-center gap-2">
      {/* CTA buttons */}
    </div>
  </nav>
```

Alternatively, keep `justify-between` but wrap the Logo + Links in a single flex container so the collapse happens **within** that group, keeping the CTA anchored:

```
[ Logo  ·  Links ]  ———  [ CTA ]
      ↓ collapse
[     Logo       ]  ———  [ CTA ]
```

> **Tip:** The second approach (grouping Logo + Links) is generally cleaner because it keeps the CTA buttons anchored to the right edge at all times, preventing them from sliding during the transition.

#### Step 3.2 — Ensure the nav width itself transitions

Since the nav uses `w-auto`, it will naturally follow its content. For a truly smooth bar resize, consider also animating the nav's width via GSAP alongside the links:

```tsx
// Add a navRef
const navRef = useRef<HTMLElement>(null);

// Inside the scroll handler, after animating links:
gsap.to(navRef.current, {
  width: scrollingDown ? collapsedWidth : expandedWidth,
  duration: 0.4,
  ease: 'power2.inOut',
});
```

---

### Phase 4: Recalculate on Resize

#### Step 4.1 — Update cached width on window resize

The natural width of the links container may change if the viewport resizes. Add a resize listener:

```tsx
const handleResize = () => {
  if (linksRef.current && !linksHiddenRef.current) {
    linksNaturalWidth.current = linksRef.current.scrollWidth;
  }
};

window.addEventListener('resize', handleResize, { passive: true });
return () => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', handleResize);
};
```

---

## Summary of Changes

| File | Change |
|---|---|
| `src/components/layout/Navbar.tsx` | Replace `display` toggle with `width` + `overflow` GSAP animation |
| `src/components/layout/Navbar.tsx` | Remove `y: -16` translateY from hide/show |
| `src/components/layout/Navbar.tsx` | Add scroll delta threshold (5 px minimum) |
| `src/components/layout/Navbar.tsx` | Add "near top" guard to always show links when `scrollY < 80` |
| `src/components/layout/Navbar.tsx` | Restructure flex layout or group Logo + Links to fix spacing |
| `src/components/layout/Navbar.tsx` | Animate nav width alongside links for a unified transition |
| `src/components/layout/Navbar.tsx` | Add resize listener to recalculate cached widths |

---

## Testing Criteria

- [ ] Scrolling down slowly → links fade and shrink smoothly, no layout jump
- [ ] Scrolling up slowly → links expand and fade in smoothly, no layout jump
- [ ] Fast scroll down then immediately up → no flickering, animations queue correctly
- [ ] At page top (`scrollY ≈ 0`) → links are always visible
- [ ] Resizing the window while links are visible → no overflow or misalignment
- [ ] Mobile (`< 1024 px`) → links container is hidden via CSS (`hidden lg:flex`), scroll handler is a no-op
- [ ] CTA buttons remain anchored and don't shift horizontally during transition
