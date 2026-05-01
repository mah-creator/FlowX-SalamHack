# Loader & Hero Timeline — Asset-Aware Preloader + Orchestrated Entrance Plan

## Vision

Create a **cinematic page preloader** that holds the screen while critical assets (images, fonts) load, then transitions into a **choreographed hero entrance timeline** where the navbar, headline, subtitle, CTA button, and marquee strip all reveal in a carefully orchestrated GSAP sequence. The loader itself is minimal — a centered FlowX logo with a subtle progress indicator — and the transition from loader to hero is seamless and fluid. No jarring pop-in, no content flash. The first 3 seconds of the site should feel like a film title sequence.

---

## Current State

- No preloader exists — content renders immediately, causing flash of unstyled/loading content
- Hero uses Framer Motion `initial/animate` props (basic fade-up, independent of load state)
- Navbar renders immediately without entrance animation
- MarqueeStrip renders immediately
- Background image (`bgImage.png`, ~1.3MB) may cause layout shift if it loads late
- No coordination between component entrance animations

---

## Target Experience

### Loading Phase

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  bg-white, full viewport                                       │
│                                                                │
│                                                                │
│                                                                │
│                    [FlowX Logo]                                │
│                                                                │
│                ────────────────── 68%                          │
│                (thin progress bar)                             │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Transition (loader → hero)

```
Timeline ────────────────────────────────────────────────────────►
  │
  ├─ Assets loaded → progress bar hits 100%
  │
  ├─ 0.0s  Progress bar turns teal, brief hold (0.3s)
  │
  ├─ 0.3s  Loader logo scales up slightly + fades out
  │         Loader background slides up (clipPath or y)
  │
  ├─ 0.7s  Background image is already rendered behind
  │
  ├─ ── HERO ENTRANCE BEGINS ──
  │
  ├─ 0.8s  Navbar drops in from top (y: -20, opacity: 0)
  │
  ├─ 1.0s  Hero headline words stagger in
  │         "Send Money Across" → word by word
  │         "Borders — Without Moving It" → delayed, italic
  │
  ├─ 1.4s  Hero subtitle paragraph fades up
  │
  ├─ 1.6s  CTA button scales in (back.out ease)
  │
  ├─ 1.8s  Marquee strips fade in + start scrolling
  │
  ├─ 2.0s  Hero card (cycling) fades in
  │
  └─ 2.2s  Complete — scroll unlocked, page is interactive
```

### Post-Transition (Hero Viewport)

```
┌────────────────────────────────────────────────────────────────┐
│  bg-image visible                                              │
│                                                                │
│  ┌─ Navbar (dropped in) ───────────────────────────────────┐  │
│  │  [Logo]  Problem · Solution · Features    [SignUp][Login]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Hero Content ──────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  "Send Money Across"           Description paragraph    │  │
│  │  "Borders — Without            [How It Works →]         │  │
│  │   Moving It"                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Marquee Strip ─────────────────────────────────────────┐  │
│  │  STRIPE  REVOLUT  WISE  COINBASE  →→→                   │  │
│  │  ←←←  BLOCK  NU BANK  MONZO  CHIME                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─ Hero Card (cycling) ───────────────────────────────────┐  │
│  │  [img] Secure Match Engine  ·  "Every transaction..."   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Asset Loading Strategy

The preloader tracks loading of critical assets before allowing the hero transition:

```tsx
function useAssetLoader(assets: string[]) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const total = assets.length + 1; // +1 for document fonts

    const updateProgress = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) {
        setIsComplete(true);
      }
    };

    // Track image loading
    assets.forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress; // don't block on failures
      img.src = src;
    });

    // Track font loading
    document.fonts.ready.then(updateProgress);

    // Safety timeout — proceed after 5s regardless
    const timeout = setTimeout(() => {
      if (!isComplete) {
        setProgress(100);
        setIsComplete(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return { progress, isComplete };
}
```

### Critical Assets to Track

```tsx
const CRITICAL_ASSETS = [
  bgImage,                          // hero background (~1.3MB)
  heroCards[0].img,                  // first hero card image
];
```

> Only track assets visible in the initial viewport. Below-fold images load lazily.

---

## Loader Component

```tsx
function Loader({ progress, onComplete }: { progress: number; onComplete: () => void }) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  // Animate progress bar smoothly
  useEffect(() => {
    gsap.to(progressBarRef.current, {
      width: `${progress}%`,
      duration: 0.4,
      ease: 'power2.out',
    });
    // Update counter text
    if (progressTextRef.current) {
      progressTextRef.current.textContent = `${progress}%`;
    }
  }, [progress]);

  // Exit animation when complete
  const triggerExit = useCallback(() => {
    const tl = gsap.timeline({
      onComplete,
    });

    // Progress bar turns teal + brief hold
    tl.to(progressBarRef.current, {
      backgroundColor: '#0094ac',
      duration: 0.2,
    });

    // Small hold to let the user register "100%"
    tl.to({}, { duration: 0.3 });

    // Logo scales up slightly
    tl.to(logoRef.current, {
      scale: 1.1, opacity: 0,
      duration: 0.5, ease: 'power2.in',
    });

    // Progress bar + text fade
    tl.to([progressBarRef.current?.parentElement, progressTextRef.current], {
      opacity: 0, duration: 0.3,
    }, '-=0.4');

    // Loader panel slides up and away
    tl.to(loaderRef.current, {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
    }, '-=0.2');
  }, [onComplete]);

  useEffect(() => {
    if (progress >= 100) {
      // Small delay so progress bar visually reaches 100%
      const timer = setTimeout(triggerExit, 200);
      return () => clearTimeout(timer);
    }
  }, [progress, triggerExit]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
    >
      {/* Logo */}
      <div ref={logoRef} className="mb-8">
        <Logo />
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-zinc-100 rounded-full overflow-hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-brand-blue/30 rounded-full"
          style={{ width: '0%' }}
        />
      </div>

      {/* Progress text */}
      <span
        ref={progressTextRef}
        className="mt-3 text-[10px] text-brand-blue/30 font-mono tabular-nums tracking-wider"
      >
        0%
      </span>
    </div>
  );
}
```

---

## Hero Entrance Timeline

After the loader completes and calls `onComplete`, the hero entrance timeline fires:

```tsx
// In LandingPage / App:
const [isLoaded, setIsLoaded] = useState(false);
const heroRef = useRef<HTMLDivElement>(null);
const navRef = useRef<HTMLElement>(null);

useGSAP(() => {
  if (!isLoaded || !heroRef.current) return;

  // Prevent scroll during entrance
  document.body.style.overflow = 'hidden';

  const tl = gsap.timeline({
    onComplete: () => {
      document.body.style.overflow = '';
    },
  });

  // ── Navbar ──
  const navbar = document.querySelector('nav');
  tl.from(navbar, {
    y: -30, opacity: 0,
    duration: 0.6, ease: 'power3.out',
  });

  // ── Hero Headline ──
  // Line 1: "Send Money Across"
  const headlineWords1 = heroRef.current.querySelectorAll('[data-hero-word-1]');
  tl.from(headlineWords1, {
    y: 60, opacity: 0, rotateX: 35,
    transformOrigin: 'center bottom',
    duration: 0.7, ease: 'power3.out', stagger: 0.07,
  }, '-=0.2');

  // Line 2: "Borders — Without Moving It"
  const headlineWords2 = heroRef.current.querySelectorAll('[data-hero-word-2]');
  tl.from(headlineWords2, {
    y: 50, opacity: 0, rotateX: 25,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.06,
  }, '-=0.3');

  // ── Subtitle paragraph ──
  const subtitle = heroRef.current.querySelector('[data-hero-subtitle]');
  tl.from(subtitle, {
    y: 25, opacity: 0,
    duration: 0.5, ease: 'power2.out',
  }, '-=0.2');

  // ── CTA button ──
  const cta = heroRef.current.querySelector('[data-hero-cta]');
  tl.from(cta, {
    y: 20, opacity: 0, scale: 0.95,
    duration: 0.5, ease: 'back.out(1.5)',
  }, '-=0.2');

  // ── Marquee strip ──
  const marquee = heroRef.current.querySelector('[data-marquee]');
  tl.from(marquee, {
    y: 30, opacity: 0,
    duration: 0.6, ease: 'power2.out',
  }, '-=0.2');

  // ── Hero card (cycling cards) ──
  const heroCard = heroRef.current.querySelector('[data-hero-card]');
  if (heroCard) {
    tl.from(heroCard, {
      y: 20, opacity: 0, scale: 0.97,
      duration: 0.5, ease: 'power2.out',
    }, '-=0.3');
  }

}, { dependencies: [isLoaded], scope: heroRef });
```

---

## Scroll Lock During Entrance

Scroll is locked during the loader + hero entrance to prevent the user from scrolling before content is ready:

```tsx
// Lock scroll on mount
useEffect(() => {
  if (!isLoaded) {
    document.body.style.overflow = 'hidden';
  }
}, [isLoaded]);

// Unlock happens inside the hero timeline's onComplete
```

---

## HeroSection Refactor

Replace Framer Motion `initial/animate` with GSAP-targeted `data-*` attributes so the hero timeline can drive all animations:

```tsx
export function HeroSection() {
  return (
    <Container as="main" className="..." data-hero-section>
      <div className="..." data-hero-content>
        <div>
          <h1 className="...">
            {/* Line 1 — split into word spans */}
            {['Send', 'Money', 'Across'].map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-2">
                <span data-hero-word-1 className="inline-block" style={{ willChange: 'transform, opacity' }}>
                  {word}
                </span>
              </span>
            ))}
            <br />
            {/* Line 2 — split into word spans */}
            <span className="text-brand-blue italic font-extralight ...">
              {['Borders', '—', 'Without', 'Moving', 'It'].map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-2">
                  <span data-hero-word-2 className="inline-block" style={{ willChange: 'transform, opacity' }}>
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h1>
        </div>

        <div className="...">
          <p data-hero-subtitle className="..." style={{ opacity: 0 }}>
            FlowX matches local payment needs...
          </p>

          <div data-hero-cta style={{ opacity: 0 }}>
            <button className="...">
              How It Works
              <ArrowUpRight className="..." />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
```

> **Key change:** Remove all Framer Motion `initial/animate/transition` props. All hero elements start at `opacity: 0` (via inline style or a class) and are revealed by the GSAP timeline. This prevents the content from flashing before the loader finishes.

---

## MarqueeStrip Refactor

Add `data-marquee` and `data-hero-card` attributes, start hidden:

```tsx
export function MarqueeStrip() {
  return (
    <Container className="shrink-0" data-marquee style={{ opacity: 0 }}>
      {/* ... existing marquee content */}

      <div data-hero-card className="..." style={{ opacity: 0 }}>
        {/* ... existing cycling card */}
      </div>
    </Container>
  );
}
```

---

## Integration in App / LandingPage

```tsx
export default function LandingPage() {
  useLenis();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroViewportRef = useRef<HTMLDivElement>(null);

  const { progress, isComplete } = useAssetLoader(CRITICAL_ASSETS);

  return (
    <>
      {/* Loader — renders on top, removes itself after exit */}
      {!isLoaded && (
        <Loader
          progress={progress}
          onComplete={() => setIsLoaded(true)}
        />
      )}

      <div
        ref={heroViewportRef}
        className="min-h-screen flex flex-col font-sans selection:bg-brand-teal/30 relative bg-white text-brand-blue"
      >
        {/* Hero viewport */}
        <div className="min-h-screen lg:h-screen flex flex-col bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }}>
          <Navbar onOpenMenu={() => setIsMenuOpen(true)} />
          <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <HeroSection />
          <MarqueeStrip />
        </div>

        {/* Rest of the page */}
        <ProblemSection />
        {/* ... */}
      </div>
    </>
  );
}
```

---

## Implementation Phases

### Phase 1: Asset Loader Hook

**File:** `src/hooks/useAssetLoader.ts`

1. Create the `useAssetLoader` hook
2. Track `bgImage.png` and first hero card image
3. Track `document.fonts.ready`
4. 5-second safety timeout
5. Return `{ progress, isComplete }`

### Phase 2: Loader Component

**File:** `src/components/ui/Loader.tsx`

1. Full-screen fixed overlay (`z-50`, `bg-white`)
2. Centered FlowX logo
3. Thin progress bar (48px wide, 2px tall)
4. Percentage counter in mono font
5. GSAP-animated progress bar fill
6. Exit animation: logo scale-up + fade, bar fade, panel slide-up

### Phase 3: HeroSection Refactor

**File:** `src/components/sections/HeroSection.tsx`

1. Remove all Framer Motion `initial`/`animate`/`transition` props
2. Remove `motion` import (replace `motion.div` with plain `div`)
3. Split headline into word `<span>`s with `data-hero-word-1` / `data-hero-word-2`
4. Add `data-hero-subtitle` and `data-hero-cta` attributes
5. All animated elements start at `opacity: 0` via inline style

### Phase 4: MarqueeStrip Refactor

**File:** `src/components/sections/MarqueeStrip.tsx`

1. Add `data-marquee` attribute to container
2. Add `data-hero-card` attribute to cycling card container
3. Both start at `opacity: 0`

### Phase 5: Navbar Entrance

**File:** `src/components/layout/Navbar.tsx`

1. Add `data-navbar` attribute to `<nav>` element
2. Navbar starts at `opacity: 0` (set via GSAP at the start of the hero timeline, not inline)
3. Hero timeline handles the navbar drop-in animation

### Phase 6: Hero Entrance Timeline

**File:** `src/pages/LandingPage.tsx` (or `src/App.tsx`)

1. Create the master hero timeline inside `useGSAP`
2. Sequence: navbar → headline L1 → headline L2 → subtitle → CTA → marquee → hero card
3. Lock scroll during entrance, unlock `onComplete`
4. Timeline only fires when `isLoaded === true`

### Phase 7: Integration

1. Wire `useAssetLoader` in LandingPage
2. Render `<Loader>` conditionally (while `!isLoaded`)
3. Pass `progress` to Loader, `onComplete` sets `isLoaded = true`
4. Hero timeline watches `isLoaded` dependency

### Phase 8: Cleanup & Edge Cases

1. Remove `<Loader>` from DOM after exit (unmount via state)
2. Handle fast connections: if assets load in < 200ms, still show loader briefly (minimum 500ms display) for visual consistency
3. Handle slow connections: 5s timeout ensures the page becomes usable
4. Clean `will-change` on hero elements after entrance completes
5. `prefers-reduced-motion`: skip loader animation, show content immediately

### Phase 9: Reduced Motion

When `prefers-reduced-motion: reduce`:
- Loader shows briefly (200ms) then disappears instantly (no slide-up)
- Hero content appears immediately without staggered word reveals
- No scroll lock

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  setIsLoaded(true);
  return;
}
```

---

## Files Changed / Created

| File | Change |
|---|---|
| `src/hooks/useAssetLoader.ts` | **NEW** — asset loading hook with progress tracking |
| `src/components/ui/Loader.tsx` | **NEW** — preloader overlay component |
| `src/components/ui/index.ts` | Export `Loader` |
| `src/components/sections/HeroSection.tsx` | Remove Framer Motion, add `data-*` attributes, split headline into word spans |
| `src/components/sections/MarqueeStrip.tsx` | Add `data-marquee` / `data-hero-card` attributes |
| `src/components/layout/Navbar.tsx` | Add `data-navbar` attribute |
| `src/App.tsx` (or `src/pages/LandingPage.tsx`) | Integrate `useAssetLoader`, render `Loader`, create hero entrance timeline |

---

## Timing Specification

| Beat | Element | Delay | Duration | Ease |
|---|---|---|---|---|
| Loader exit: bar → teal | Progress bar | 0.0s | 0.2s | `power2.out` |
| Loader exit: hold | — | 0.2s | 0.3s | — |
| Loader exit: logo | Logo | 0.5s | 0.5s | `power2.in` |
| Loader exit: panel | Panel | 0.8s | 0.7s | `power3.inOut` |
| Hero: navbar | `<nav>` | 0.0s | 0.6s | `power3.out` |
| Hero: headline L1 | Words | 0.2s | 0.7s | `power3.out` (stagger 0.07) |
| Hero: headline L2 | Words | −0.3s | 0.6s | `power3.out` (stagger 0.06) |
| Hero: subtitle | `<p>` | −0.2s | 0.5s | `power2.out` |
| Hero: CTA | Button | −0.2s | 0.5s | `back.out(1.5)` |
| Hero: marquee | Strip | −0.2s | 0.6s | `power2.out` |
| Hero: hero card | Card | −0.3s | 0.5s | `power2.out` |

> Total perceived time from loader start to full hero: ~2.5s on fast connections

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Loader blocking interactivity | 5s safety timeout ensures fallback |
| Large background image (1.3MB) | Tracked as critical asset; loader holds until loaded |
| Font loading delay | `document.fonts.ready` tracked; Inter is the only custom font |
| Scroll lock during entrance | `overflow: hidden` on body, released in `onComplete` |
| `will-change` on word spans | Applied during animation, cleared after via `clearProps` |
| Loader DOM node | Unmounted from React tree after exit (`!isLoaded && <Loader>`) |
| Framer Motion removal | Reduces JS bundle by removing unused `motion` import from Hero |
| Multiple staggered tweens | All in a single timeline — no independent tweens competing |

---

## Testing Criteria

- [ ] Loader appears immediately on page load with FlowX logo and progress bar
- [ ] Progress bar fills smoothly as assets load (not jerky jumps)
- [ ] Percentage counter updates in sync with progress bar
- [ ] On fast connections, loader shows for at least 500ms (no flash)
- [ ] On slow connections, loader holds until assets load (or 5s timeout)
- [ ] Progress bar turns teal at 100% before exit sequence begins
- [ ] Loader logo scales up slightly and fades out
- [ ] Loader panel slides up and away to reveal the hero
- [ ] Page cannot be scrolled during loader + hero entrance
- [ ] Navbar drops in from top after loader exits
- [ ] Hero headline Line 1 words stagger in with 3D rotateX
- [ ] Hero headline Line 2 words stagger in with slight delay
- [ ] Subtitle paragraph fades up after headline
- [ ] CTA button scales in with back.out ease
- [ ] Marquee strip fades up and starts scrolling
- [ ] Hero card (cycling) fades in last
- [ ] Scroll is unlocked after all hero elements are visible
- [ ] `prefers-reduced-motion` skips loader and shows content immediately
- [ ] No content flash or layout shift before loader appears
- [ ] Refreshing the page re-triggers the full loader → hero sequence
- [ ] Navigating back to `/` from `/login` does NOT re-trigger loader
- [ ] Framer Motion is fully removed from HeroSection (no `motion.div`)
- [ ] No console errors during load sequence
- [ ] Works correctly on both desktop and mobile viewports
