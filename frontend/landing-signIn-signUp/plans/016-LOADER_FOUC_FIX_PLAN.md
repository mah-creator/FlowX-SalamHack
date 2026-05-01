# Loader → Hero FOUC Fix Plan

## Problem

When the loader slides up (`yPercent: -100`), hero elements (navbar, headline, subtitle, CTA, marquee) are **briefly visible at their natural state** before the GSAP entrance timeline begins. This creates a jarring flash — commonly called **FOUC (Flash of Unstyled Content)**.

### Why It Happens

The timing chain has a multi-frame gap:

```
Loader exit completes
  → onComplete fires
    → handleLoaderComplete()
      → setShowLoader(false)   ← React state update (async)
      → setIsLoaded(true)      ← React state update (async)
        → React re-render
          → useGSAP dependency changes
            → GSAP timeline finally starts
              → gsap.set(elements, { opacity: 0 })  ← TOO LATE
```

Between the loader sliding away and GSAP setting initial hidden states, there are **2–4 frames** (~30–60ms) where elements render at their natural `opacity: 1` / `visibility: visible` state. The user sees a flash.

### Current Flawed Approach

The code tries to hide elements two ways, both failing:
1. **Inline `style={{ opacity: 0 }}`** on subtitle/CTA/marquee — breaks on re-navigation (elements stay invisible because entrance doesn't replay)
2. **`gsap.set(elements, { opacity: 0 })` at timeline start** — runs too late (after React re-render cycle)

---

## Solution: CSS-First Hiding + GSAP `autoAlpha`

The industry-standard fix from GSAP's official documentation: **hide elements in CSS, reveal with GSAP's `autoAlpha`**.

### How `autoAlpha` Works

`autoAlpha` is a GSAP convenience property that controls both `opacity` and `visibility` simultaneously:
- `autoAlpha: 0` → sets `opacity: 0` AND `visibility: hidden`
- `autoAlpha: 1` → sets `opacity: 1` AND `visibility: inherit`

Using `visibility: hidden` (not `display: none`) preserves layout — elements occupy their space but are invisible. No layout shifts.

---

## Implementation

### Step 1: Add CSS Class for Pre-hidden Elements

**File:** `src/index.css`

Add a utility class that hides elements before JS runs:

```css
@layer utilities {
  .gsap-hidden {
    visibility: hidden;
    opacity: 0;
  }
}
```

> This class is applied in the HTML/JSX. Because it's CSS, it takes effect **immediately on render** — no waiting for JavaScript. The flash is eliminated at the source.

---

### Step 2: Apply `.gsap-hidden` to All Animated Hero Elements

**File:** `src/components/sections/HeroSection.tsx`

Apply to word spans, subtitle, and CTA:

```diff
  <span {...{ [attr]: '' }}
-   className="inline-block"
-   style={{ willChange: 'transform, opacity' }}
+   className="inline-block gsap-hidden"
  >
    {word}
  </span>
```

```diff
  <p
    data-hero-subtitle
-   className="max-w-sm text-sm font-light leading-relaxed text-brand-blue/90 md:text-base"
-   style={{ opacity: 0 }}
+   className="max-w-sm text-sm font-light leading-relaxed text-brand-blue/90 md:text-base gsap-hidden"
  >
```

```diff
- <div data-hero-cta style={{ opacity: 0 }}>
+ <div data-hero-cta className="gsap-hidden">
```

**File:** `src/components/sections/MarqueeStrip.tsx`

```diff
- <div className="..." data-marquee style={{ opacity: 0 }}>
+ <div className="... gsap-hidden" data-marquee>
```

```diff
- <div className="..." data-hero-card style={{ opacity: 0 }}>
+ <div className="... gsap-hidden" data-hero-card>
```

**File:** `src/components/layout/Navbar.tsx`

```diff
  <nav data-navbar
    ref={navRef}
-   className="fixed top-4 left-1/2 -translate-x-1/2 ..."
+   className="fixed top-4 left-1/2 -translate-x-1/2 ... gsap-hidden"
  >
```

---

### Step 3: Switch Timeline to Use `autoAlpha` Instead of `opacity`

**File:** `src/pages/LandingPage.tsx`

Replace all `opacity` references in the entrance timeline with `autoAlpha`. This automatically flips `visibility: hidden → inherit` when animating:

```ts
useGSAP(() => {
  if (!isLoaded || !shouldRunEntrance) return;

  const root = heroViewportRef.current;
  if (!root) return;

  const navbar = root.querySelector('[data-navbar]');
  const headlineWords1 = root.querySelectorAll('[data-hero-word-1]');
  const headlineWords2 = root.querySelectorAll('[data-hero-word-2]');
  const subtitle = root.querySelector('[data-hero-subtitle]');
  const cta = root.querySelector('[data-hero-cta]');
  const marquee = root.querySelector('[data-marquee]');
  const heroCard = root.querySelector('[data-hero-card]');

  setIsHeroEntering(true);

  const tl = gsap.timeline({
    onComplete: () => {
      setIsHeroEntering(false);
      hasPlayedLandingEntrance = true;
      // Clean up will-change and let CSS take over
      gsap.set(
        [navbar, ...headlineWords1, ...headlineWords2, subtitle, cta, marquee, heroCard].filter(Boolean),
        { clearProps: 'willChange' },
      );
    },
  });

  // Navbar: use autoAlpha + preserve xPercent for centering
  tl.fromTo(navbar,
    { autoAlpha: 0, y: -30, xPercent: -50 },
    {
      autoAlpha: 1, y: 0, xPercent: -50,
      duration: 0.6, ease: 'power3.out',
      onComplete: () => gsap.set(navbar, { clearProps: 'transform' }),
    },
  );

  // Headline Line 1
  tl.fromTo(headlineWords1,
    { autoAlpha: 0, y: 60, rotateX: 35, transformOrigin: 'center bottom' },
    {
      autoAlpha: 1, y: 0, rotateX: 0,
      duration: 0.7, ease: 'power3.out', stagger: 0.07,
    },
    '-=0.35',
  );

  // Headline Line 2
  tl.fromTo(headlineWords2,
    { autoAlpha: 0, y: 50, rotateX: 25, transformOrigin: 'center bottom' },
    {
      autoAlpha: 1, y: 0, rotateX: 0,
      duration: 0.6, ease: 'power3.out', stagger: 0.06,
    },
    '-=0.3',
  );

  // Subtitle
  tl.fromTo(subtitle,
    { autoAlpha: 0, y: 25 },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    '-=0.2',
  );

  // CTA
  tl.fromTo(cta,
    { autoAlpha: 0, y: 20, scale: 0.95 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' },
    '-=0.2',
  );

  // Marquee
  tl.fromTo(marquee,
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    '-=0.2',
  );

  // Hero Card
  if (heroCard) {
    tl.fromTo(heroCard,
      { autoAlpha: 0, y: 20, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
      '-=0.3',
    );
  }
}, { dependencies: [isLoaded, shouldRunEntrance], scope: heroViewportRef });
```

> **Key change:** `from()` → `fromTo()`. Using `fromTo()` explicitly declares both start and end states, eliminating any ambiguity about GSAP recording the wrong "natural" state.

---

### Step 4: Fix the Re-Navigation Reset

When the user returns from `/login` → `/`, the entrance doesn't replay. Elements must be made visible immediately:

**File:** `src/pages/LandingPage.tsx`

```ts
useEffect(() => {
  if (!isLoaded || shouldRunEntrance) return;

  const root = heroViewportRef.current;
  if (!root) return;

  // Entrance already played — make everything visible immediately
  const targets = root.querySelectorAll('.gsap-hidden');
  targets.forEach((el) => {
    (el as HTMLElement).style.visibility = 'inherit';
    (el as HTMLElement).style.opacity = '1';
  });
}, [isLoaded, shouldRunEntrance]);
```

> This replaces the old `gsap.set([...], { clearProps: 'all' })` approach which was too aggressive and broke navbar positioning.

---

### Step 5: Navbar-Specific Handling

The navbar's centering (`left-1/2 -translate-x-1/2`) conflicts with GSAP transforms. After the entrance animation, clear GSAP's inline transform so Tailwind's classes regain control.

Already handled in Step 3 via:
```ts
onComplete: () => gsap.set(navbar, { clearProps: 'transform' }),
```

For the re-navigation case (Step 4), the navbar gets `visibility: inherit` + `opacity: 1` without touching its transform — the scroll-based link hide/show logic continues to work.

---

## Why This Fixes the FOUC

```
BEFORE (broken):
  Elements render visible → Loader slides up → User sees flash → GSAP sets opacity: 0 → GSAP animates

AFTER (fixed):
  Elements render with .gsap-hidden (visibility: hidden) → Loader slides up → Nothing visible → GSAP fromTo autoAlpha: 0 → 1 (flips visibility: inherit + animates opacity)
```

The CSS class `gsap-hidden` is parsed by the browser **before any JavaScript executes**. There is zero window for a flash because the elements are invisible from the very first paint.

---

## Files Changed

| File | Change |
|---|---|
| `src/index.css` | Add `.gsap-hidden` utility class |
| `src/components/sections/HeroSection.tsx` | Add `gsap-hidden` class to word spans, subtitle, CTA; remove inline `style={{ opacity: 0 }}` |
| `src/components/sections/MarqueeStrip.tsx` | Add `gsap-hidden` class to marquee and hero-card divs; remove inline `style={{ opacity: 0 }}` |
| `src/components/layout/Navbar.tsx` | Add `gsap-hidden` class to `<nav>` |
| `src/pages/LandingPage.tsx` | Switch `from()` → `fromTo()` with `autoAlpha`; fix re-nav reset to use `.gsap-hidden` selector; preserve navbar `xPercent` centering |

---

## Testing Criteria

- [ ] Loader slides up — **zero flash** of hero content
- [ ] Navbar animates in from top, stays perfectly centered (no horizontal shift)
- [ ] Headline words stagger in smoothly after navbar
- [ ] Subtitle, CTA, marquee, hero card all reveal without any pre-flash
- [ ] After entrance completes, all elements are fully interactive
- [ ] Navigating to `/login` and back to `/` — all hero content visible immediately (no stuck invisible elements)
- [ ] Navbar scroll-based link hide/show still works after entrance
- [ ] `prefers-reduced-motion` — all content visible immediately, no animation
- [ ] No layout shift (elements use `visibility: hidden`, not `display: none`)
- [ ] Refreshing the page re-triggers full loader → entrance sequence cleanly
