# Solution Section — Pinned Scroll Storytelling Redesign Plan

## Vision

Transform the current horizontal stepper into a **full-viewport pinned scroll experience** where the section stays fixed while the user scrolls through each solution step. Each step occupies the full screen with a **left content panel + right visual panel** layout, transitioning through a choreographed sequence of crossfades, slide-ins, and progress indicators. Light-themed, editorial, and cinematic — the kind of scroll experience that wins Awwwards SOTD.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  "A Smarter Way to Move Money"                               │
│                                                              │
│   (01)──────────(02)──────────(03)──────────(04)             │
│  Create         Smart         Local         Secure           │
│  Request        Matching      Payments      Completion       │
└──────────────────────────────────────────────────────────────┘
```

- Static horizontal 4-column layout with connecting line
- Teal numbered circles, basic text
- No scroll interactivity, no pin, no visual progression
- Feels like a generic feature list

---

## Target Experience — Pinned Step-Through

The section is pinned to the viewport. As the user scrolls, they progress through 4 steps. Each step has a **content pane** (left) and an **illustration pane** (right) that crossfade between steps.

### User Flow

```
Scroll ─────────────────────────────────────────────────────────►
  │
  ├─ Section enters viewport → pins to screen
  │
  ├─ Step 1 visible (Create Request)
  │    Left:  step number, title, description, micro-icon
  │    Right: abstract illustration / animated graphic
  │
  ├─ Scroll continues → Step 1 fades out, Step 2 fades in
  ├─ Scroll continues → Step 2 fades out, Step 3 fades in
  ├─ Scroll continues → Step 3 fades out, Step 4 fades in
  │
  └─ After Step 4 completes → section unpins, normal flow resumes
```

### Viewport Layout (Pinned)

```
Desktop:
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌─ Progress Rail ─┐                                              │
│  │  ① ─── ② ─── ③ ─── ④   (vertical, left edge)                 │
│  └─────────────────┘                                              │
│                                                                    │
│  ┌─ Left Panel (40%) ──────┐  ┌─ Right Panel (55%) ────────────┐ │
│  │                          │  │                                 │ │
│  │  Overline: "STEP 01"    │  │                                 │ │
│  │                          │  │     ┌───────────────────┐      │ │
│  │  Title:                  │  │     │                   │      │ │
│  │  "Create Request"        │  │     │   Abstract SVG /  │      │ │
│  │                          │  │     │   Animated Visual │      │ │
│  │  Description paragraph   │  │     │                   │      │ │
│  │  with more detail than   │  │     └───────────────────┘      │ │
│  │  current version.        │  │                                 │ │
│  │                          │  │                                 │ │
│  │  [ Decorative element ]  │  │                                 │ │
│  └──────────────────────────┘  └─────────────────────────────────┘ │
│                                                                    │
│  ┌─ Bottom: Step label bar ──────────────────────────────────────┐ │
│  │  Create Request  ·  Smart Matching  ·  Local Payments  ·  …  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

Mobile:
┌────────────────────────────────┐
│  Progress dots (horizontal)    │
│                                │
│  ┌─ Visual (full width) ────┐ │
│  │   Animated illustration   │ │
│  └───────────────────────────┘ │
│                                │
│  ┌─ Content (full width) ───┐ │
│  │  STEP 01                  │ │
│  │  Create Request           │ │
│  │  Description text...      │ │
│  └───────────────────────────┘ │
└────────────────────────────────┘
```

---

## Color & Typography System (Light Theme)

| Element | Value |
|---|---|
| **Section background** | `#FAFAFA` (warm off-white) |
| **Card / panel bg** | `#FFFFFF` with subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.04)` |
| **Step overline** | `text-brand-teal`, `text-xs`, `font-semibold`, `tracking-[0.2em]`, `uppercase` |
| **Step title** | `text-brand-blue`, `text-4xl lg:text-5xl`, `font-bold`, `tracking-tight` |
| **Step description** | `text-brand-blue/60`, `text-base lg:text-lg`, `font-light`, `leading-relaxed` |
| **Active progress dot** | `bg-brand-teal`, `w-3 h-3`, with a pulsing ring (`ring-4 ring-brand-teal/20`) |
| **Inactive progress dot** | `bg-zinc-200`, `w-2 h-2` |
| **Progress connector** | `bg-zinc-200`, 2px wide, with a `bg-brand-teal` fill that scrubs with scroll |
| **Accent elements** | `brand-teal` (#0094ac) for highlights, lines, active states |

---

## Vertical Progress Rail

A thin vertical rail on the left edge that visually connects the 4 steps. As the user scrolls, the teal fill grows downward and the active dot scales up:

```
  ●  ← active (teal, pulsing ring)
  │  ← filled (teal)
  │
  ○  ← upcoming (zinc-200)
  │  ← unfilled (zinc-200)
  │
  ○
  │
  │
  ○
```

### Implementation

```tsx
<div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0 h-[240px]">
  {/* Background track */}
  <div className="absolute inset-0 w-[2px] bg-zinc-200 left-1/2 -translate-x-1/2" />

  {/* Filled track — height animated via GSAP scrub */}
  <div
    ref={progressFillRef}
    className="absolute top-0 w-[2px] bg-brand-teal left-1/2 -translate-x-1/2 origin-top"
    style={{ height: '0%' }}
  />

  {/* Dots */}
  {solutionSteps.map((_, i) => (
    <div
      key={i}
      ref={el => dotRefs.current[i] = el}
      className="relative z-10 w-2 h-2 rounded-full bg-zinc-200 transition-all duration-300"
      style={{ marginTop: i === 0 ? 0 : 'auto' }}
    />
  ))}
</div>
```

---

## Data Model Update

**File:** `src/data/constants.ts`

Extend each step with a richer description and a visual identifier:

```ts
export interface SolutionStep {
  step: string;
  title: string;
  desc: string;
  longDesc: string;       // NEW — expanded paragraph for the pinned view
  visual: 'request' | 'matching' | 'payments' | 'completion'; // NEW — visual identifier
}

export const solutionSteps: SolutionStep[] = [
  {
    step: '01',
    title: 'Create Request',
    desc: 'Enter amount, destination, and receiver details securely.',
    longDesc: 'Start by specifying how much you want to send, the destination country, and who should receive the funds. Our encrypted form captures only what\'s necessary — no invasive data collection. Your request enters the FlowX matching pool within milliseconds.',
    visual: 'request',
  },
  {
    step: '02',
    title: 'Smart Matching',
    desc: 'FlowX finds a user with an exactly opposite transfer need.',
    longDesc: 'Our AI-driven matching engine scans thousands of active requests to find someone sending money in the opposite direction. The algorithm optimizes for speed, amount compatibility, and user trust scores — typically finding a match in under 30 seconds.',
    visual: 'matching',
  },
  {
    step: '03',
    title: 'Local Payments',
    desc: 'Both sides pay locally using their preferred local methods.',
    longDesc: 'Once matched, both parties make local payments in their own currency using familiar methods — bank transfer, mobile money, or digital wallets. No money crosses borders. No correspondent banks. No SWIFT fees.',
    visual: 'payments',
  },
  {
    step: '04',
    title: 'Secure Completion',
    desc: 'Funds released after encrypted confirmation via escrow.',
    longDesc: 'After both local payments are cryptographically verified, the escrow releases funds to both recipients simultaneously. The entire process — from request to completion — averages under 15 minutes.',
    visual: 'completion',
  },
];
```

---

## GSAP Pin Animation Blueprint

### Core Concept

The section height is artificially extended (via `ScrollTrigger.pin`) to create scroll room for the 4-step sequence. The actual visible content stays pinned at `position: fixed` while GSAP scrubs through a timeline that crossfades between steps.

### ScrollTrigger Configuration

```tsx
gsap.registerPlugin(ScrollTrigger);

useGSAP(() => {
  const section = sectionRef.current;
  const steps = stepPanelsRef.current; // array of 4 step containers
  if (!section || steps.length < 4) return;

  // Total scroll distance = 4 steps × 100vh each
  const totalScrollHeight = steps.length * window.innerHeight;

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: `+=${totalScrollHeight}`,
      pin: true,
      scrub: 0.8,           // smooth scrub with slight lag
      anticipatePin: 1,     // prevents jump when pin activates
      pinSpacing: true,     // adds spacing after section
    },
  });

  // For each step transition (3 transitions for 4 steps):
  steps.forEach((step, i) => {
    if (i === 0) {
      // First step: fade in
      masterTl.from(step, { opacity: 0, y: 40, duration: 0.3 });
    }

    if (i < steps.length - 1) {
      // Current step: hold, then fade out
      masterTl.to(step, { opacity: 1, duration: 0.5 }); // hold visible
      masterTl.to(step, { opacity: 0, y: -30, duration: 0.3 });

      // Next step: fade in
      masterTl.from(steps[i + 1], { opacity: 0, y: 40, duration: 0.3 }, '<');
    } else {
      // Last step: hold visible
      masterTl.to(step, { opacity: 1, duration: 0.5 });
    }
  });
}, { scope: sectionRef });
```

> **`scrub: 0.8`** — The 0.8 second lag creates a buttery-smooth feel where the animation gently catches up to the scroll position, rather than being rigidly locked to it.

> **`anticipatePin: 1`** — Prevents the slight visual "jump" that can occur when a section first gets pinned. GSAP pre-adjusts the scroll position.

---

## Step Transition Animation Detail

Each step transition is a **choreographed sequence**, not a simple crossfade:

```
Step N exit:
  ├─ Description text → opacity: 0, y: -20  (0.2s)
  ├─ Title → opacity: 0, y: -15             (0.15s, delayed 0.05s)
  ├─ Overline → opacity: 0                  (0.1s, delayed 0.1s)
  ├─ Right visual → opacity: 0, scale: 0.95 (0.25s)
  └─ Progress dot N → shrink to inactive

Step N+1 enter (overlapping with exit):
  ├─ Progress dot N+1 → scale up, color → teal, add ring
  ├─ Progress fill → height grows to next dot
  ├─ Overline → opacity: 1, y: 0            (0.15s)
  ├─ Title → opacity: 1, y: 0               (0.2s, delayed 0.05s)
  ├─ Description → opacity: 1, y: 0         (0.2s, delayed 0.1s)
  ├─ Right visual → opacity: 1, scale: 1    (0.3s)
  └─ Accent line draws from left             (0.3s)
```

### Detailed Timeline Per Transition

```tsx
function buildStepTransition(tl: gsap.core.Timeline, exitStep: Element, enterStep: Element, exitDot: Element, enterDot: Element, progressFill: Element, fillPercent: number) {
  const exitOverline = exitStep.querySelector('[data-overline]');
  const exitTitle    = exitStep.querySelector('[data-title]');
  const exitDesc     = exitStep.querySelector('[data-desc]');
  const exitVisual   = exitStep.querySelector('[data-visual]');

  const enterOverline = enterStep.querySelector('[data-overline]');
  const enterTitle    = enterStep.querySelector('[data-title]');
  const enterDesc     = enterStep.querySelector('[data-desc]');
  const enterVisual   = enterStep.querySelector('[data-visual]');
  const enterAccent   = enterStep.querySelector('[data-accent]');

  // ── EXIT ──
  tl.to(exitDesc,   { opacity: 0, y: -20, duration: 0.15, ease: 'power2.in' })
    .to(exitTitle,   { opacity: 0, y: -15, duration: 0.12, ease: 'power2.in' }, '-=0.08')
    .to(exitOverline,{ opacity: 0,          duration: 0.1,  ease: 'power2.in' }, '-=0.06')
    .to(exitVisual,  { opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in' }, '-=0.1')
    .set(exitStep,   { visibility: 'hidden' });

  // ── ENTER ──
  tl.set(enterStep, { visibility: 'visible' })
    .to(enterDot,   { scale: 1.5, backgroundColor: '#0094ac', duration: 0.15 })
    .to(progressFill,{ height: `${fillPercent}%`, duration: 0.2, ease: 'power2.out' }, '<')
    .from(enterOverline, { opacity: 0, y: 10, duration: 0.12, ease: 'power2.out' })
    .from(enterTitle,    { opacity: 0, y: 20, duration: 0.15, ease: 'power2.out' }, '-=0.06')
    .from(enterDesc,     { opacity: 0, y: 15, duration: 0.15, ease: 'power2.out' }, '-=0.08')
    .from(enterVisual,   { opacity: 0, scale: 0.96, duration: 0.2, ease: 'power2.out' }, '-=0.12')
    .from(enterAccent,   { width: 0, duration: 0.2, ease: 'power2.out' }, '-=0.15');
}
```

---

## Right Panel Visuals

Each step has an abstract, minimalist illustration in the right panel. These are **SVG-based animated graphics** (not images) that reinforce the step's concept:

| Step | Visual Concept | Animation |
|---|---|---|
| **01 — Create Request** | A form outline with input fields that fill in, a cursor typing | Fields draw in via `stroke-dashoffset`, text appears character-by-character |
| **02 — Smart Matching** | Two circles (users) connected by a dashed line that solidifies into a teal line | Circles pulse, dashed line morphs to solid with GSAP `morphSVG` or `drawSVG` |
| **03 — Local Payments** | Two currency symbols ($ and £) with arrows pointing locally downward into wallet icons | Arrows animate downward, wallet icons glow on receive |
| **04 — Secure Completion** | A shield icon with a checkmark that draws in, surrounded by a circular progress ring | Ring fills 0→100%, checkmark draws in with `stroke-dashoffset` |

### SVG Visual Component

```tsx
function StepVisual({ type }: { type: SolutionStep['visual'] }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[360px] h-auto"
        fill="none"
      >
        {/* SVG content varies by type */}
        {/* Paths use data-draw attribute for GSAP targeting */}
      </svg>
    </div>
  );
}
```

> **Fallback:** If SVG illustrations add too much complexity in the first pass, use large oversized step numbers (`"01"`, `"02"`, etc.) as the visual — rendered at `clamp(10rem, 20vw, 16rem)` in `text-zinc-100` with a subtle `text-brand-teal/10` gradient fill. These still look premium and are trivial to implement.

---

## Section Heading (Pre-Pin)

Before the pin begins, the section heading is visible at the top. As the section scrolls into view and pins, the heading fades up and then remains as a fixed label or fades out to make room for the step content.

### Option A: Heading Fades Out Before Pin Starts

```tsx
// Heading timeline — plays before the main pin timeline
const headingTl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top 80%',
    end: 'top 10%',
    scrub: true,
  },
});

headingTl
  .from(headingRef.current, { opacity: 0, y: 60, duration: 1 })
  .to(headingRef.current, { opacity: 0, y: -40, duration: 0.5 }, '+=0.3');
```

### Option B: Heading Persists as Small Label (Recommended)

The heading starts large, then scales down and repositions to the top-left corner of the pinned section as a persistent label:

```tsx
masterTl.to(headingRef.current, {
  fontSize: '1rem',
  opacity: 0.4,
  y: -200, // move to top of section
  duration: 0.3,
}, 0);
```

---

## Bottom Step Label Bar

A horizontal bar at the bottom of the pinned viewport showing all step names, with the active one highlighted:

```
  Create Request  ·  Smart Matching  ·  Local Payments  ·  Secure Completion
       ^^^^
    (active — teal, bold)
```

### Implementation

```tsx
<div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8">
  {solutionSteps.map((step, i) => (
    <button
      key={i}
      ref={el => labelRefs.current[i] = el}
      className="text-xs tracking-widest uppercase text-zinc-300 transition-colors duration-300"
      data-step-label
    >
      {step.title}
    </button>
  ))}
</div>
```

GSAP animates the active label to `color: #0094ac; font-weight: 600` and inactive ones to `color: #d4d4d8`.

---

## Implementation Steps

### Phase 1: Section Container & Pin Setup

**File:** `src/components/sections/SolutionSection.tsx`

1. Replace the current section with a `100vh` height container
2. Set up `sectionRef` for ScrollTrigger pin
3. Establish the two-panel layout (left 40%, right 55%, 5% gap)
4. Register ScrollTrigger and create the basic pin

```tsx
export function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepPanelsRef = useRef<HTMLDivElement[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="relative h-screen bg-[#FAFAFA] overflow-hidden"
    >
      {/* Section heading */}
      <div className="absolute inset-0 flex">
        {/* Progress rail (left edge) */}
        {/* Left content panel */}
        {/* Right visual panel */}
      </div>
      {/* Bottom step label bar */}
    </section>
  );
}
```

### Phase 2: Step Panels (Stacked, Absolute)

All 4 step content panels are stacked on top of each other via `position: absolute`. Only one is visible at a time:

```tsx
{solutionSteps.map((step, i) => (
  <div
    key={step.step}
    ref={el => { if (el) stepPanelsRef.current[i] = el; }}
    className="absolute inset-0 flex items-center"
    style={{ visibility: i === 0 ? 'visible' : 'hidden' }}
  >
    {/* Left panel */}
    <div className="w-[40%] pl-24 pr-12 flex flex-col justify-center">
      <span data-overline className="text-brand-teal text-xs font-semibold tracking-[0.2em] uppercase mb-4">
        Step {step.step}
      </span>
      <h3 data-title className="text-4xl lg:text-5xl font-bold text-brand-blue tracking-tight mb-6">
        {step.title}
      </h3>
      <div data-accent className="w-12 h-[2px] bg-brand-teal mb-6" />
      <p data-desc className="text-base lg:text-lg text-brand-blue/60 font-light leading-relaxed max-w-[42ch]">
        {step.longDesc}
      </p>
    </div>

    {/* Right panel */}
    <div className="w-[55%] ml-auto flex items-center justify-center" data-visual>
      <StepVisual type={step.visual} />
    </div>
  </div>
))}
```

### Phase 3: Vertical Progress Rail

Implement the progress rail component with dots and fill track as described above. Position it `left-12` absolutely within the pinned section.

### Phase 4: GSAP Master Timeline

Wire up the master `gsap.timeline` with:
- `pin: true` on the section
- Scrubbed transitions between steps using `buildStepTransition()`
- Progress fill and dot animations synced to the scrub position
- Bottom label bar active-state transitions

### Phase 5: Step Visuals (SVG)

Create the `<StepVisual>` component with 4 inline SVGs. Start with the **oversized number fallback** if time is tight, then iterate into full SVG illustrations.

### Phase 6: Heading Animation

Implement Option B (scale-down to label) or Option A (fade-out) for the section heading as the pin activates.

### Phase 7: Bottom Label Bar

Add the horizontal step name bar at the bottom of the viewport. Animate active/inactive states via the master timeline.

### Phase 8: Mobile Adaptation

On screens `< 768px`:
- **Disable pin** — use a standard vertical scroll layout instead
- Stack content vertically: visual on top, text below
- Progress rail becomes horizontal dots at the top
- Each step is a full-width card with scroll-triggered fade-in

```tsx
// Detect mobile and conditionally apply pin
const isMobile = window.innerWidth < 768;

const masterTl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: isMobile ? undefined : `+=${totalScrollHeight}`,
    pin: !isMobile,
    scrub: isMobile ? false : 0.8,
    anticipatePin: 1,
  },
});
```

### Phase 9: Polish & Micro-Details

- Add a subtle `box-shadow` to the right visual panel area for depth
- Implement a thin teal horizontal line under the heading that draws from left
- Add a `backdrop-blur` glass effect to the bottom label bar
- Ensure smooth `will-change: transform, opacity` on all animated elements
- Clean up `will-change` after animations complete to free GPU memory

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add `longDesc` and `visual` fields to `SolutionStep` interface and data |
| `src/components/sections/SolutionSection.tsx` | Full rewrite — pinned scroll section, stacked step panels, GSAP ScrollTrigger with scrub, progress rail, bottom label bar |
| `src/index.css` | (Optional) Add `.solution-section` grain / subtle pattern if needed for depth |

---

## Responsive Breakpoints

| Breakpoint | Behavior | Layout |
|---|---|---|
| `≥ 1024px` (lg) | Full pin experience, scrub timeline | Left 40% / Right 55%, vertical progress rail |
| `≥ 768px` (md) | Pin enabled, slightly tighter layout | Left 45% / Right 50%, progress rail |
| `< 768px` (sm) | **Pin disabled**, vertical scroll | Stacked cards, horizontal progress dots, each step fades in on scroll |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Pin causing layout shifts | `anticipatePin: 1` prevents the jump; `pinSpacing: true` adds natural document flow below |
| Multiple stacked panels | Only one visible at a time (`visibility: hidden` on inactive); GPU only composites the visible panel |
| SVG animations | Lightweight stroke animations; no raster images in the critical path |
| Scrub responsiveness | `scrub: 0.8` — slight lag smooths out janky trackpad input without feeling sluggish |
| Mobile fallback | Pin completely disabled below 768px; standard scroll-triggered fades used instead |
| `will-change` | Applied only during active animation, cleared after via `onComplete` |
| Resize handling | ScrollTrigger.refresh() called on resize to recalculate pin distances |

---

## Testing Criteria

- [ ] Section pins to viewport when `top` hits `top` of screen
- [ ] Scrolling forward smoothly transitions through Steps 1 → 2 → 3 → 4
- [ ] Scrolling backward reverses transitions: 4 → 3 → 2 → 1
- [ ] Progress rail fill grows/shrinks in sync with the active step
- [ ] Active dot scales up and turns teal; inactive dots remain small and zinc
- [ ] Bottom label bar highlights the active step name in teal
- [ ] After Step 4, the section unpins and the page continues scrolling normally
- [ ] No visible "jump" when the pin activates or deactivates
- [ ] Step content crossfade follows the choreographed order: overline → title → desc → visual
- [ ] Right panel visuals fade/scale smoothly between steps
- [ ] On mobile (< 768px), pin is disabled, steps render as stacked cards
- [ ] Resizing the browser window recalculates pin correctly (no stuck pins)
- [ ] Section background is light `#FAFAFA`, all text is dark `brand-blue`
- [ ] Scrub feels smooth and buttery, not rigidly locked to scroll position
- [ ] Fast scrolling through the section doesn't cause visual glitches
