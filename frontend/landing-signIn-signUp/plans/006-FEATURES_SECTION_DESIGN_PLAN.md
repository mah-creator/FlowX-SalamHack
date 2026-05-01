
# Features Section — Awwwards-Worthy Redesign Plan

## Vision

Replace the flat 3×2 text grid with an **interactive feature showcase** using a **spotlight card** pattern — one large active card dominates the viewport while the remaining 5 sit as compact selectable thumbnails. Scroll-triggered GSAP reveals, glassmorphic card surfaces, animated SVG icons, and a smooth expand/collapse transition when switching the active feature.

---

## Enhancement Audit (Added Scope)

The concept and structure are strong. To make this production-ready, add the following:

- **Accessibility-first interactions:** keyboard navigation between features, `aria-selected`, `aria-controls`, visible focus states, and proper region labeling.
- **Motion safety:** `prefers-reduced-motion` fallback that disables auto-advance and uses instant content swaps.
- **Transition safety:** guard against rapid-click race conditions while exit/enter timelines are running.
- **Lifecycle hygiene:** kill all GSAP timelines/ScrollTriggers on unmount and avoid orphan tweens.
- **Mobile interaction polish:** add drag-snap behavior for pills (optional) and ensure no horizontal layout jitter.
- **Quality gates:** explicit performance, CLS, and responsiveness acceptance criteria.

---

## Current State

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Smart Matching   │  │ Escrow Security  │  │ Real-Time Track  │
│ (border-top,txt) │  │ (border-top,txt) │  │ (border-top,txt) │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Multi-Currency   │  │ Dispute Resolut. │  │ Verification     │
│ (border-top,txt) │  │ (border-top,txt) │  │ (border-top,txt) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

- Uniform 3-col grid, `AnimatedCard` fade-in
- Text-only — tiny uppercase title + description
- No icons, no interactivity, no visual hierarchy

---

## Target Layout — Spotlight + Thumbnails

```
Desktop (lg+):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  "Everything You Need for Safe Transfers"                        │
│                                                                  │
│  ┌─ SPOTLIGHT CARD (60% width) ──────────┐  ┌─ THUMBNAILS ────┐│
│  │                                        │  │                  ││
│  │  ┌─────┐                               │  │  ┌────────────┐ ││
│  │  │ SVG │  Smart Matching System        │  │  │ Escrow     │ ││
│  │  │icon │                               │  │  └────────────┘ ││
│  │  └─────┘                               │  │  ┌────────────┐ ││
│  │                                        │  │  │ Tracking   │ ││
│  │  AI-driven engine that pairs           │  │  └────────────┘ ││
│  │  transactions in milliseconds.         │  │  ┌────────────┐ ││
│  │  Extended description with more        │  │  │ Currency   │ ││
│  │  detail about how this works...        │  │  └────────────┘ ││
│  │                                        │  │  ┌────────────┐ ││
│  │  ┌──────────────────────────────┐      │  │  │ Disputes   │ ││
│  │  │  Animated visual / graphic   │      │  │  └────────────┘ ││
│  │  └──────────────────────────────┘      │  │  ┌────────────┐ ││
│  │                                        │  │  │ Scores     │ ││
│  └────────────────────────────────────────┘  │  └────────────┘ ││
│                                              └──────────────────┘│
└──────────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────────┐
│  Horizontal scroll pills     │
│  [Active] [○] [○] [○] [○]   │
│                              │
│  ┌─ SPOTLIGHT (full width) ─┐│
│  │  Icon + Title + Desc      ││
│  │  Visual                   ││
│  └───────────────────────────┘│
└──────────────────────────────┘
```

---

## Design Tokens (Light Theme with Glassmorphism)

| Element | Spec |
|---|---|
| **Section bg** | `#F5F5F7` (Apple-esque warm gray) with subtle radial gradient glow behind spotlight |
| **Spotlight card** | `bg-white`, `border: 1px solid rgba(0,0,0,0.06)`, `border-radius: 1.5rem`, `box-shadow: 0 24px 48px -12px rgba(0,0,0,0.08)` |
| **Thumbnail card** | `bg-white/60`, `backdrop-blur-sm`, `border: 1px solid rgba(0,0,0,0.04)`, `border-radius: 1rem` |
| **Active thumbnail** | `border-color: brand-teal`, `bg-white`, ring glow `ring-2 ring-brand-teal/20` |
| **Icon container** | `48×48`, `rounded-xl`, `bg-brand-teal/8`, icon in `text-brand-teal` |
| **Heading** | `text-brand-blue`, `text-4xl lg:text-5xl`, `font-light`, `tracking-tight` |
| **Feature title** | Spotlight: `text-2xl font-bold text-brand-blue`. Thumbnail: `text-sm font-semibold` |
| **Description** | `text-brand-blue/60`, `text-base`, `font-light`, `leading-relaxed` |

---

## Data Model Update

**File:** `src/data/constants.ts`

```ts
export interface Feature {
  title: string;
  desc: string;
  longDesc: string;         // NEW — expanded paragraph for spotlight view
  icon: 'matching' | 'escrow' | 'tracking' | 'currency' | 'dispute' | 'scores';
}

export const features: Feature[] = [
  {
    title: 'Smart Matching System',
    desc: 'AI-driven engine that pairs transactions in milliseconds.',
    longDesc: 'Our proprietary matching algorithm analyzes thousands of pending requests across corridors, optimizing for amount compatibility, urgency level, and user trust scores. Average match time: 28 seconds.',
    icon: 'matching',
  },
  {
    title: 'Escrow-Based Security',
    desc: 'Funds are locked in digital escrow until both parties confirm.',
    longDesc: 'Every transaction is protected by our distributed digital escrow system. Funds are cryptographically locked and only released when both sender and receiver confirm completion through multi-factor verification.',
    icon: 'escrow',
  },
  // ... remaining 4 features with longDesc + icon
];
```

---

## Interaction Model

### Feature Selection

Clicking a thumbnail (or auto-advancing on a timer) triggers:

1. **Current spotlight content** exits: `opacity → 0`, `y → -20`, staggered (icon → title → desc → visual)
2. **Clicked thumbnail** gets active ring + border highlight
3. **New spotlight content** enters: `opacity → 1`, `y → 0`, staggered in reverse order
4. Transition duration: `0.4s` total, `power2.inOut` ease

Keyboard interaction:

1. Left/Right (or Up/Down on desktop list) moves active feature
2. `Home` jumps to first, `End` jumps to last
3. `Enter` / `Space` on a thumbnail activates it

### Auto-Advance (Optional)

A subtle progress bar runs along the bottom of the spotlight card. When it fills (every ~5s), the next feature auto-selects. Hovering the spotlight pauses the timer.

```tsx
const [activeIndex, setActiveIndex] = useState(0);
const timerRef = useRef<gsap.core.Tween | null>(null);

// Progress bar tween
useEffect(() => {
  timerRef.current = gsap.to(progressBarRef.current, {
    width: '100%',
    duration: 5,
    ease: 'none',
    onComplete: () => {
      setActiveIndex(prev => (prev + 1) % features.length);
    },
  });
  return () => { timerRef.current?.kill(); };
}, [activeIndex]);
```

### Reduced Motion Mode (Required)

When `prefers-reduced-motion: reduce` is true:

- Disable section entry animation and switch animations
- Disable auto-advance timer/progress bar
- Keep feature switching instant with no transforms
- Preserve all content and interaction semantics

---

## GSAP Animation Blueprint

### Section Entry (ScrollTrigger)

```tsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });

  // 1. Heading reveal
  tl.from(headingRef.current, {
    y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
  });

  // 2. Spotlight card scales in
  tl.from(spotlightRef.current, {
    y: 60, opacity: 0, scale: 0.97, duration: 0.8, ease: 'power3.out',
  }, '-=0.4');

  // 3. Thumbnails stagger in from right
  tl.from(thumbnailRefs.current, {
    x: 40, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
  }, '-=0.5');
}, { scope: sectionRef });
```

### Feature Switch Animation

```tsx
function switchFeature(newIndex: number) {
  if (newIndex === activeIndex) return;

  const contentEls = spotlightRef.current;
  const icon = contentEls.querySelector('[data-icon]');
  const title = contentEls.querySelector('[data-title]');
  const desc = contentEls.querySelector('[data-desc]');
  const visual = contentEls.querySelector('[data-visual]');

  const exitTl = gsap.timeline({
    onComplete: () => {
      setActiveIndex(newIndex);
      // Enter animation triggers via useEffect on activeIndex change
    },
  });

  exitTl
    .to(visual, { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' })
    .to(desc,   { opacity: 0, y: -10, duration: 0.15 }, '-=0.1')
    .to(title,  { opacity: 0, y: -10, duration: 0.12 }, '-=0.08')
    .to(icon,   { opacity: 0, scale: 0.8, duration: 0.1 }, '-=0.06');
}

// Enter animation (after state update)
useEffect(() => {
  const contentEls = spotlightRef.current;
  const icon = contentEls.querySelector('[data-icon]');
  const title = contentEls.querySelector('[data-title]');
  const desc = contentEls.querySelector('[data-desc]');
  const visual = contentEls.querySelector('[data-visual]');

  gsap.timeline()
    .from(icon,   { opacity: 0, scale: 0.8, duration: 0.15, ease: 'back.out(2)' })
    .from(title,  { opacity: 0, y: 15, duration: 0.2, ease: 'power2.out' }, '-=0.05')
    .from(desc,   { opacity: 0, y: 10, duration: 0.2, ease: 'power2.out' }, '-=0.1')
    .from(visual, { opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.out' }, '-=0.15');
}, [activeIndex]);
```

---

## Spotlight Card Anatomy

```tsx
<div ref={spotlightRef} className="relative bg-white rounded-3xl border border-black/[0.06] p-10 lg:p-14 shadow-2xl shadow-black/[0.06]">
  {/* Icon */}
  <div data-icon className="w-12 h-12 rounded-xl bg-brand-teal/8 flex items-center justify-center mb-6">
    <FeatureIcon type={features[activeIndex].icon} />
  </div>

  {/* Title */}
  <h3 data-title className="text-2xl lg:text-3xl font-bold text-brand-blue tracking-tight mb-4">
    {features[activeIndex].title}
  </h3>

  {/* Description */}
  <p data-desc className="text-base lg:text-lg text-brand-blue/60 font-light leading-relaxed max-w-[50ch] mb-8">
    {features[activeIndex].longDesc}
  </p>

  {/* Abstract visual / decorative graphic */}
  <div data-visual className="w-full h-48 rounded-2xl bg-gradient-to-br from-brand-teal/5 to-brand-blue/5 flex items-center justify-center">
    <FeatureVisual type={features[activeIndex].icon} />
  </div>

  {/* Auto-advance progress bar */}
  <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-zinc-100 rounded-full overflow-hidden">
    <div ref={progressBarRef} className="h-full bg-brand-teal rounded-full" style={{ width: 0 }} />
  </div>
</div>
```

---

## Thumbnail Card Anatomy

```tsx
<button
  onClick={() => switchFeature(i)}
  className={`
    w-full text-left p-5 rounded-xl border transition-all duration-300
    ${i === activeIndex
      ? 'bg-white border-brand-teal ring-2 ring-brand-teal/20 shadow-sm'
      : 'bg-white/60 border-black/[0.04] hover:bg-white hover:border-black/[0.08]'
    }
  `}
>
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs
      ${i === activeIndex ? 'bg-brand-teal text-white' : 'bg-zinc-100 text-zinc-400'}`}>
      <FeatureIcon type={features[i].icon} size={16} />
    </div>
    <span className={`text-sm font-semibold
      ${i === activeIndex ? 'text-brand-blue' : 'text-brand-blue/50'}`}>
      {features[i].title}
    </span>
  </div>
</button>
```

---

## SVG Icons

Minimal 24×24 stroke icons for each feature:

| Feature | Icon Concept |
|---|---|
| **Smart Matching** | Two interlocking puzzle pieces |
| **Escrow Security** | Shield with lock |
| **Real-Time Tracking** | Radar / pulse ring |
| **Multi-Currency** | Stacked coins with currency symbols |
| **Dispute Resolution** | Balance scale |
| **Verification Scores** | Star with checkmark |

---

## Implementation Phases

### Phase 1: Layout & Structure
- Replace the 3-col grid with a `flex` layout: spotlight (60%) + thumbnail column (35%)
- Set section bg to `#F5F5F7` with a subtle radial glow behind the spotlight
- Add `sectionRef`, `spotlightRef`, `thumbnailRefs`, `progressBarRef`

### Phase 2: Spotlight Card
- Build the layered spotlight card with icon, title, longDesc, visual area, progress bar
- Use `data-*` attributes on inner elements for GSAP targeting

### Phase 3: Thumbnail List
- 6 thumbnail buttons stacked vertically (active feature remains visible and highlighted)
- Wire `onClick → switchFeature(i)` with active state styling

### Phase 4: Feature Switch Animation
- Exit timeline (staggered fade-out) → state update → Enter timeline (staggered fade-in)
- Thumbnail active state transition: border, ring, icon color
- Add `isTransitioningRef` guard to prevent overlapping switch timelines from rapid clicks

### Phase 5: Auto-Advance Timer
- GSAP tween on progress bar width `0% → 100%` over 5s
- On complete: advance to next feature
- Pause on hover, reset on manual click
- Pause when tab/window is hidden; resume on visibility return

### Phase 6: ScrollTrigger Entry
- Heading fades up, spotlight scales in, thumbnails stagger from right
- `toggleActions: 'play none none reverse'`
- Use `gsap.matchMedia()` to disable heavy entrance motion for reduced-motion users

### Phase 7: Feature Visuals
- Create `<FeatureVisual>` — abstract SVG patterns or animated graphics per feature
- Fallback: gradient background with oversized icon at low opacity

### Phase 8: Mobile Adaptation
- Below `768px`: thumbnails become horizontal scroll pills at top
- Spotlight becomes full-width card below pills
- Auto-advance still works, swipe gesture optional enhancement

### Phase 9: Accessibility Hardening
- Add semantic structure: `role="tablist"` / `role="tab"` / `role="tabpanel"` (or equivalent button+region pattern)
- Add `aria-selected`, `aria-controls`, `id`, and descriptive `aria-label`s
- Ensure focus rings meet contrast and are visible on all backgrounds
- Validate keyboard-only operation end-to-end

### Phase 10: QA, Telemetry, and Reliability
- Add Playwright/Cypress scenario for thumbnail click, keyboard navigation, and reduced-motion behavior
- Track interaction analytics (`feature_selected`, `auto_advance_paused`) if analytics exists
- Verify no memory leaks with repeated navigation/unmount cycles

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `≥ 1024px` (lg) | Spotlight 60% + Thumbnails 35%, side by side |
| `≥ 768px` (md) | Spotlight 55% + Thumbnails 40% |
| `< 768px` (sm) | Full-width spotlight, horizontal pill selector above |

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add `longDesc` and `icon` fields to `Feature` interface and data |
| `src/components/sections/FeaturesSection.tsx` | Full rewrite — spotlight + thumbnails layout, GSAP switch animation, auto-advance, ScrollTrigger entry |
| `src/index.css` | (Optional) subtle radial glow utility for section background |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Frequent re-renders on switch | Only spotlight content re-renders; thumbnails use CSS transitions, not re-mounts |
| Auto-advance timer | Single GSAP tween, killed on unmount. Paused on hover to avoid wasted cycles |
| SVG icons | Inline, tiny stroke paths — no network requests |
| `will-change` | Applied only during switch animation, cleared after |
| Rapid input during transitions | Lock interaction during exit animation and release after enter complete |
| Background tab CPU usage | Pause progress tween on `document.visibilityState !== 'visible'` |

---

## Testing Criteria

- [ ] Section entry: heading, spotlight, and thumbnails animate in with stagger
- [ ] Clicking a thumbnail smoothly crossfades the spotlight content (exit → enter)
- [ ] Active thumbnail has teal border + ring, others are muted
- [ ] Auto-advance progresses every ~5s with visible progress bar
- [ ] Hovering the spotlight pauses auto-advance
- [ ] Clicking a thumbnail resets the progress bar and timer
- [ ] On mobile, thumbnails render as horizontal pills above the spotlight
- [ ] Scrolling back up reverses the entry animation
- [ ] No layout shift during feature switches
- [ ] All 6 features are accessible and display correct content
- [ ] Keyboard navigation works (`Arrow`, `Home`, `End`, `Enter`, `Space`)
- [ ] `prefers-reduced-motion` disables timeline motion and auto-advance
- [ ] Focus styles are clearly visible and WCAG-compliant
- [ ] Lighthouse: no major regressions in Performance/Accessibility
- [ ] No console warnings/errors during rapid feature switching
