# Loader & Hero Timeline — Bug Fixes Plan

## Issues Identified

After reviewing the current implementation across `LandingPage.tsx`, `Loader.tsx`, `Navbar.tsx`, `HeroSection.tsx`, and `MarqueeStrip.tsx`, the following bugs and problems were found:

---

### Issue 1: Navbar Shifts Right During Entrance

**Root cause:** The navbar uses `left-1/2` + `-translate-x-1/2` for centering. When GSAP animates it with `y: -30 → 0`, it applies an inline `transform` that **overrides** the Tailwind `-translate-x-1/2` class. The navbar loses its `translateX(-50%)` and snaps to the left edge (or shifts right since `left: 50%` is still applied without the counter-translation).

**File:** `src/pages/LandingPage.tsx` (lines 114, 150–159)

**Fix:** Use GSAP `fromTo` with explicit `xPercent: -50` preserved throughout the animation, or animate `opacity` and `y` without touching the `transform` property by using `gsap.set` to include the existing translation:

```diff
- gsap.set(navbar, { opacity: 0, y: -30 });
+ gsap.set(navbar, { opacity: 0, y: -30, xPercent: -50 });
```

```diff
  tl.to(navbar, {
    y: 0,
    opacity: 1,
+   xPercent: -50,
    duration: 0.6,
    ease: 'power3.out',
  }, 0);
```

Alternatively, use `clearProps: 'transform'` after the navbar animation completes so Tailwind's classes regain control:

```ts
tl.to(navbar, {
  y: 0, opacity: 1,
  duration: 0.6, ease: 'power3.out',
  onComplete: () => gsap.set(navbar, { clearProps: 'transform' }),
}, 0);
```

> **Recommended approach:** The `clearProps: 'transform'` onComplete approach is cleanest because it hands control back to CSS after the animation.

---

### Issue 2: H1 Word Spans Have No Initial Hidden State

**Root cause:** The headline word `<span>` elements in `HeroSection.tsx` do **not** have `style={{ opacity: 0 }}` set. Unlike `[data-hero-subtitle]` and `[data-hero-cta]` which explicitly set `opacity: 0` inline, the word spans rely entirely on GSAP `from()` to start them hidden. But there's a timing gap between React render and GSAP timeline execution — during this gap, the raw text is briefly visible (flash of content).

**File:** `src/components/sections/HeroSection.tsx` (lines 7–9)

**Fix:** Add `opacity: 0` to the initial inline style of each word span:

```diff
  <span {...{ [attr]: '' }} className="inline-block"
-   style={{ willChange: 'transform, opacity' }}
+   style={{ willChange: 'transform, opacity', opacity: 0 }}
  >
```

> This ensures words are hidden on render and only revealed by GSAP. The `from()` tween already sets `opacity: 0` as its start state, so the inline style is consistent.

---

### Issue 3: `clearProps: 'all'` Fallback Nukes Navbar Positioning

**Root cause:** The `useEffect` at lines 65–82 of `LandingPage.tsx` runs when `isLoaded` is true and `shouldRunEntrance` is false (i.e. on re-navigation). It calls `gsap.set([navbar, ...], { clearProps: 'all' })` — this strips ALL inline styles from the navbar, including any GSAP-set transforms. While intended to "reset" elements, it can cause a visual snap if the navbar had accumulated scroll-based transforms from its own `useGSAP` (the hide/show links logic).

**File:** `src/pages/LandingPage.tsx` (lines 65–82)

**Fix:** Exclude the navbar from the `clearProps: 'all'` reset. The navbar manages its own state via its internal `useGSAP`. Only clear hero content elements:

```diff
- gsap.set([navbar, ...words1, ...words2, subtitle, cta, marquee, heroCard], {
+ gsap.set([...words1, ...words2, subtitle, cta, marquee, heroCard].filter(Boolean), {
    clearProps: 'all',
  });
+
+ // Navbar: only ensure it's visible, don't clear its transform
+ if (navbar) gsap.set(navbar, { opacity: 1 });
```

---

### Issue 4: MarqueeStrip and Hero Card Stuck at `opacity: 0` on Re-navigation

**Root cause:** `MarqueeStrip.tsx` sets `style={{ opacity: 0 }}` as a hardcoded inline style on the `[data-marquee]` and `[data-hero-card]` divs. When a user navigates away (`/login`) and returns (`/`), the component re-mounts with `opacity: 0` but the entrance animation does NOT replay (due to `hasPlayedLandingEntrance = true`). The `clearProps: 'all'` useEffect is meant to fix this, but it runs at the wrong time or doesn't clear the React-set inline style.

**File:** `src/components/sections/MarqueeStrip.tsx` (lines 12, 40)

**Fix:** Remove the hardcoded `style={{ opacity: 0 }}` from the JSX. Instead, let the entrance timeline in `LandingPage.tsx` set the initial hidden state via GSAP at animation start time. On re-navigation (no entrance), the `clearProps` effect ensures everything is visible:

```diff
- <div className="..." data-marquee style={{ opacity: 0 }}>
+ <div className="..." data-marquee>
```

```diff
- <div className="..." data-hero-card style={{ opacity: 0 }}>
+ <div className="..." data-hero-card>
```

Then in the entrance timeline, add initial sets at the top:

```ts
// At the start of the useGSAP entrance:
gsap.set([marquee, heroCard, subtitle, cta], { opacity: 0 });
```

Apply the same fix to `[data-hero-subtitle]` and `[data-hero-cta]` in `HeroSection.tsx`:

```diff
- <p data-hero-subtitle className="..." style={{ opacity: 0 }}>
+ <p data-hero-subtitle className="...">
```

```diff
- <div data-hero-cta style={{ opacity: 0 }}>
+ <div data-hero-cta>
```

> **Principle:** Never use hardcoded `style={{ opacity: 0 }}` for animation-gated visibility. Let GSAP control both the initial hidden state and the reveal. On re-navigation when animation is skipped, elements render visible by default.

---

### Issue 5: Timeline Ordering — Navbar Should Appear Before Headline

**Root cause:** Currently the navbar animation is placed at timeline position `0` (absolute time), but the headline words are placed at `+=0.2` (after a 0.2s gap). This means the navbar and headline start nearly simultaneously, but the headline visually appears to lead because its stagger begins almost immediately while the navbar is at `y: -30`.

**Observation:** It feels more natural for the navbar to be visible first (it's at the top of the page), then the headline reveals below.

**File:** `src/pages/LandingPage.tsx`

**Fix:** Move the navbar animation to fire first, then headline starts after the navbar is partially visible:

```ts
// Navbar enters first
tl.to(navbar, {
  y: 0, opacity: 1, xPercent: -50,
  duration: 0.6, ease: 'power3.out',
  onComplete: () => gsap.set(navbar, { clearProps: 'transform' }),
});

// Headline starts after navbar is ~60% done
tl.from(headlineWords1, {
  y: 60, opacity: 0, rotateX: 35,
  transformOrigin: 'center bottom',
  duration: 0.7, ease: 'power3.out', stagger: 0.07,
}, '-=0.35');
```

---

### Issue 6: `from()` on Already-Hidden Elements Creates Double-State Conflict

**Root cause:** GSAP `from()` tweens record the element's current state as the "to" target and animate FROM the provided values. When an element already has `opacity: 0` (via inline style) and GSAP does `from({ opacity: 0 })`, GSAP records `opacity: 0` as the destination too — the element stays invisible.

This affects `[data-hero-subtitle]`, `[data-hero-cta]`, `[data-marquee]`, and `[data-hero-card]` which all have hardcoded `opacity: 0`.

**Fix:** This is resolved by Issue 4's fix — removing the hardcoded inline `opacity: 0` and letting GSAP set the initial state at timeline start. With that fix, `from({ opacity: 0 })` correctly records the natural `opacity: 1` as the destination.

---

### Issue 7: Loader Z-Index May Not Cover Navbar

**Root cause:** The Loader uses `z-50` but the Navbar uses `z-999`. The navbar could peek through the loader overlay on initial render.

**File:** `src/components/ui/Loader.tsx` (line 92), `src/components/layout/Navbar.tsx` (line 157)

**Fix:** Increase the Loader's z-index above the navbar's:

```diff
- className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
+ className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
```

---

## Summary of Changes

| File | Change |
|---|---|
| `src/pages/LandingPage.tsx` | Fix navbar `xPercent` preservation + `clearProps: 'transform'` onComplete; exclude navbar from `clearProps: 'all'` reset; add `gsap.set` for initial hidden states at timeline start; reorder timeline (navbar first); remove hero subtitle/cta from implicit `from()` conflict |
| `src/components/sections/HeroSection.tsx` | Add `opacity: 0` to word span inline styles; remove `style={{ opacity: 0 }}` from subtitle and CTA |
| `src/components/sections/MarqueeStrip.tsx` | Remove `style={{ opacity: 0 }}` from `[data-marquee]` and `[data-hero-card]` |
| `src/components/ui/Loader.tsx` | Increase z-index to `z-[9999]` to cover navbar |

---

## Corrected Timeline Order

```
Timeline ────────────────────────────────────────────────────────►
  │
  ├─ 0.0s  gsap.set — hide all hero elements (opacity: 0)
  │         gsap.set — navbar: opacity: 0, y: -30, xPercent: -50
  │
  ├─ 0.0s  Navbar drops in (y: -30 → 0, opacity: 0 → 1)
  │         onComplete: clearProps 'transform' to restore CSS centering
  │
  ├─ 0.25s Headline Line 1 words stagger in (overlaps with navbar)
  │
  ├─ ~0.6s Headline Line 2 words stagger in
  │
  ├─ ~0.9s Subtitle fades up
  │
  ├─ ~1.1s CTA button scales in
  │
  ├─ ~1.3s Marquee strip fades up
  │
  ├─ ~1.5s Hero card fades in
  │
  └─ done  clearProps 'willChange' on all targets; unlock scroll
```

---

## Testing Criteria

- [ ] Navbar stays horizontally centered during entrance animation (no left/right shift)
- [ ] Navbar remains centered after entrance completes
- [ ] Navbar scroll-based link hide/show still works correctly after entrance
- [ ] H1 headline words are not visible before GSAP animates them
- [ ] Subtitle and CTA are not visible before GSAP animates them
- [ ] Marquee strip and hero card are not visible before GSAP animates them
- [ ] Navigating to `/login` and back to `/` shows all hero content immediately (no stuck `opacity: 0`)
- [ ] Loader fully covers the navbar (no navbar peeking through)
- [ ] Timeline plays in correct order: navbar → headline → subtitle → CTA → marquee → card
- [ ] No content flash between loader exit and hero entrance
- [ ] `prefers-reduced-motion` still shows all content immediately
- [ ] Scrolling up/down after entrance doesn't cause navbar position issues
