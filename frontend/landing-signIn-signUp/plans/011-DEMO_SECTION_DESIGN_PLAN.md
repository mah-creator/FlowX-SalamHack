# Demo Section — Live Transaction Tracker Redesign Plan

## Vision

Transform the current static 4-status row into an **interactive live transaction simulation** — a dark, terminal-inspired tracker that auto-plays a transaction lifecycle as the user watches. Each status step activates sequentially with animated progress bars, pulsing indicators, and a mock transaction detail card. The effect: the user witnesses a FlowX transfer happen in real time. Think Bloomberg terminal meets Vercel's deployment tracker.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  bg-white, centered heading                                  │
│                                                              │
│  "Track Every Step"                                          │
│  "From request creation to final payout..."                  │
│                                                              │
│  ┌─ zinc-50 card ────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  ● Pending    ● Matched    ○ Awaiting    ○ Completed  │  │
│  │  "analyzed"   "found"      "deposit"     "released"   │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Static status dots — no progression, no animation
- `active` field is pre-set, never changes
- Minimal visual weight, feels like a wireframe
- No interactivity or simulated experience

---

## Target Experience — Live Transaction Simulation

A **dark-themed** section with a mock transaction interface. When the section scrolls into view, a simulated transaction auto-plays through 4 stages. Each stage activates with a progress bar fill, status label update, timestamp appearance, and pulsing indicator.

### User Flow

```
Scroll ───────────────────────────────────────────────────►
  │
  ├─ Section enters viewport
  │
  ├─ Beat 1: Heading + subtitle reveal
  │
  ├─ Beat 2: Transaction card fades in (dark panel)
  │
  ├─ Beat 3: Auto-play sequence begins (1.5s per step):
  │    Step 1: "Pending" activates — dot pulses, label glows
  │    │        Progress bar fills 0% → 25%
  │    │        Timestamp appears: "00:00"
  │    │
  │    Step 2: "Matched" activates — dot pulses
  │    │        Progress bar fills 25% → 50%
  │    │        Timestamp: "00:28"
  │    │
  │    Step 3: "Awaiting Payment" activates
  │    │        Progress bar fills 50% → 75%
  │    │        Timestamp: "02:15"
  │    │
  │    Step 4: "Completed" activates — checkmark appears
  │             Progress bar fills 75% → 100% (turns teal)
  │             Timestamp: "04:32"
  │             Confetti-like dot burst (subtle)
  │
  ├─ Beat 4: Transaction summary reveals below
  │    "Transfer complete · $500 · Gaza → Cairo · 4m 32s"
  │
  └─ Sequence loops after brief pause (or stays on complete)
```

### Viewport Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│  bg-[#FAFAFA]                                                  │
│                                                                │
│  "LIVE DEMO"  (overline, teal)                                │
│  "Track Every Step"  (heading)                                 │
│  "in Real Time"  (accent, muted)                              │
│                                                                │
│  ┌─ Transaction Panel (dark, #111) ────────────────────────┐  │
│  │                                                          │  │
│  │  ┌─ Header Bar ───────────────────────────────────────┐ │  │
│  │  │  TXN-2024-FL0X-7829       $500.00  USD → EGP      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌─ Progress Bar ────────────────────────────────────┐  │  │
│  │  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │  │
│  │  │  50% ─────────────────────────────────── 100%      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │  │
│  │  │● Pending│──│● Matched│──│○ Await. │──│○ Done   │   │  │
│  │  │ 00:00   │  │ 00:28   │  │         │  │         │   │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │  │
│  │                                                          │  │
│  │  ┌─ Summary (appears after complete) ─────────────────┐ │  │
│  │  │  ✓ Transfer complete · $500 · Gaza → Cairo · 4:32  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  "LIVE DEMO"                 │
│  "Track Every Step"          │
│                              │
│  ┌─ Dark Panel ────────────┐│
│  │  TXN-2024-FL0X-7829     ││
│  │  $500.00 USD → EGP      ││
│  │                          ││
│  │  ████████░░░░░░░  50%   ││
│  │                          ││
│  │  ● Pending     00:00    ││
│  │  ● Matched     00:28    ││
│  │  ○ Awaiting             ││
│  │  ○ Completed            ││
│  │                          ││
│  │  ✓ Transfer complete    ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Section bg** | `#FAFAFA` (light, editorial — contrasts with dark panel) |
| **Overline** | `text-brand-teal`, `text-xs`, `tracking-[0.25em]`, `uppercase`, `font-bold` |
| **Heading** | `text-brand-blue`, `text-5xl lg:text-6xl`, `font-bold`, `tracking-tight` |
| **Heading accent** | `text-brand-blue/40`, `font-light` |
| **Panel bg** | `#111111` (near-black, terminal feel) |
| **Panel border** | `border: 1px solid white/[0.06]`, `rounded-3xl` |
| **Panel shadow** | `shadow-2xl shadow-black/20` |
| **Header bar bg** | `bg-white/[0.04]`, `rounded-xl`, within panel |
| **TXN ID** | `text-white/40`, `text-xs`, `font-mono` |
| **Amount** | `text-white`, `text-lg`, `font-semibold`, `tabular-nums` |
| **Currency pair** | `text-white/50`, `text-xs` |
| **Progress bar track** | `bg-white/[0.06]`, `h-1.5`, `rounded-full` |
| **Progress bar fill** | `bg-brand-teal`, `rounded-full`, animated width |
| **Active step dot** | `bg-brand-teal`, pulsing ring `ring-4 ring-brand-teal/20` |
| **Inactive step dot** | `bg-white/20` |
| **Completed step dot** | `bg-brand-teal` (solid, no pulse) |
| **Step label (active)** | `text-white`, `text-xs`, `font-semibold` |
| **Step label (inactive)** | `text-white/30`, `text-xs` |
| **Step label (complete)** | `text-brand-teal`, `text-xs` |
| **Timestamp** | `text-white/20`, `text-[10px]`, `font-mono`, `tabular-nums` |
| **Summary bar** | `bg-brand-teal/10`, `border: 1px solid brand-teal/20`, `rounded-xl` |
| **Summary text** | `text-brand-teal`, `text-xs`, `font-semibold` |

---

## Data Model Update

**File:** `src/data/constants.ts`

Enrich each demo status with more detail:

```ts
export interface DemoStatus {
  s: string;
  d: string;
  active: boolean;          // keep for backward compat
  timestamp: string;        // NEW — simulated timestamp
  icon: 'clock' | 'link' | 'wallet' | 'check';  // NEW
}

export const demoStatuses: DemoStatus[] = [
  { s: 'Pending',          d: 'Request analyzed',   active: true,  timestamp: '00:00', icon: 'clock' },
  { s: 'Matched',          d: 'Pairing found',      active: true,  timestamp: '00:28', icon: 'link' },
  { s: 'Awaiting Payment', d: 'Local deposit',      active: false, timestamp: '02:15', icon: 'wallet' },
  { s: 'Completed',        d: 'Funds released',     active: false, timestamp: '04:32', icon: 'check' },
];

export interface DemoTransaction {
  id: string;
  amount: string;
  currencyFrom: string;
  currencyTo: string;
  routeFrom: string;
  routeTo: string;
}

export const demoTransaction: DemoTransaction = {
  id: 'TXN-2024-FL0X-7829',
  amount: '$500.00',
  currencyFrom: 'USD',
  currencyTo: 'EGP',
  routeFrom: 'Gaza',
  routeTo: 'Cairo',
};
```

---

## Transaction Panel Component

```tsx
function TransactionPanel() {
  return (
    <div
      className="
        relative bg-[#111111] border border-white/[0.06]
        rounded-3xl p-8 lg:p-10 max-w-3xl mx-auto
        shadow-2xl shadow-black/20
      "
      data-panel
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white/[0.04] rounded-xl px-6 py-4 mb-8" data-header>
        <span className="text-white/40 text-xs font-mono">{demoTransaction.id}</span>
        <div className="flex items-center gap-3">
          <span className="text-white text-lg font-semibold tabular-nums">{demoTransaction.amount}</span>
          <span className="text-white/50 text-xs">
            {demoTransaction.currencyFrom} → {demoTransaction.currencyTo}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className="h-full bg-brand-teal rounded-full"
            style={{ width: '0%' }}
            data-progress-fill
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 mb-8" data-steps>
        {demoStatuses.map((status, i) => (
          <StepIndicator key={status.s} status={status} index={i} />
        ))}
      </div>

      {/* Summary (hidden initially) */}
      <div
        ref={summaryRef}
        className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl px-6 py-4 text-center"
        style={{ opacity: 0, display: 'none' }}
        data-summary
      >
        <span className="text-brand-teal text-xs font-semibold tracking-wide">
          ✓ Transfer complete · {demoTransaction.amount} · {demoTransaction.routeFrom} → {demoTransaction.routeTo} · 4m 32s
        </span>
      </div>
    </div>
  );
}
```

---

## Step Indicator Component

```tsx
function StepIndicator({ status, index }: { status: DemoStatus; index: number }) {
  return (
    <div className="flex-1 flex items-start gap-3" data-step={index}>
      {/* Dot */}
      <div
        className="relative mt-0.5 shrink-0"
        data-step-dot
      >
        <div className="w-3 h-3 rounded-full bg-white/20" />
        {/* Pulse ring (hidden by default, shown via GSAP) */}
        <div
          className="absolute inset-0 rounded-full ring-4 ring-brand-teal/20 opacity-0"
          data-step-ring
        />
      </div>

      {/* Text */}
      <div>
        <span
          className="text-white/30 text-xs font-semibold uppercase tracking-wider block"
          data-step-label
        >
          {status.s}
        </span>
        <span
          className="text-white/15 text-[10px] italic block mt-0.5"
          data-step-desc
        >
          {status.d}
        </span>
        <span
          className="text-white/0 text-[10px] font-mono tabular-nums block mt-1"
          data-step-time
        >
          {status.timestamp}
        </span>
      </div>

      {/* Connector line (not on last item) */}
      {index < demoStatuses.length - 1 && (
        <div className="hidden md:block flex-1 h-px bg-white/[0.06] self-center mx-2" data-connector />
      )}
    </div>
  );
}
```

---

## GSAP Animation Blueprint

### Section Entry + Auto-Play Sequence

```tsx
const sectionRef = useRef<HTMLElement>(null);
const overlineRef = useRef<HTMLSpanElement>(null);
const headingWordsRef = useRef<HTMLSpanElement[]>([]);
const panelRef = useRef<HTMLDivElement>(null);
const progressRef = useRef<HTMLDivElement>(null);
const summaryRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  const section = sectionRef.current;
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
  });

  // ── Section Entry ──

  // Beat 1: Overline
  tl.from(overlineRef.current, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  });

  // Beat 2: Heading words kinetic
  tl.from(headingWordsRef.current, {
    y: 50, opacity: 0, rotateX: 35,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.07,
  }, '-=0.2');

  // Beat 3: Panel slides up
  tl.from(panelRef.current, {
    y: 60, opacity: 0, scale: 0.97,
    duration: 0.8, ease: 'power3.out',
  }, '-=0.3');

  // Beat 4: Header bar reveals inside panel
  const header = section.querySelector('[data-header]');
  tl.from(header, {
    y: 15, opacity: 0, duration: 0.4, ease: 'power2.out',
  }, '-=0.4');

  // ── Auto-Play Sequence (each step ~1.5s apart) ──

  const steps = section.querySelectorAll('[data-step]');
  const connectors = section.querySelectorAll('[data-connector]');
  const progressFill = progressRef.current;

  steps.forEach((step, i) => {
    const dot = step.querySelector('[data-step-dot] > div:first-child');
    const ring = step.querySelector('[data-step-ring]');
    const label = step.querySelector('[data-step-label]');
    const desc = step.querySelector('[data-step-desc]');
    const time = step.querySelector('[data-step-time]');
    const pct = ((i + 1) / steps.length) * 100;

    const stepDelay = i * 1.5;

    // Progress bar fills to this step's percentage
    tl.to(progressFill, {
      width: `${pct}%`,
      duration: 1.0,
      ease: 'power2.inOut',
    }, `+=${i === 0 ? 0.3 : 0.5}`);

    // Dot activates
    tl.to(dot, {
      backgroundColor: '#0094ac',
      scale: 1.3,
      duration: 0.3,
      ease: 'back.out(2)',
    }, '-=0.8');

    // Pulse ring appears
    tl.to(ring, {
      opacity: 1, scale: 1.5,
      duration: 0.4, ease: 'power2.out',
    }, '-=0.3');
    tl.to(ring, {
      opacity: 0, scale: 2,
      duration: 0.6, ease: 'power2.out',
    });

    // Label lights up
    tl.to(label, {
      color: i === steps.length - 1 ? '#0094ac' : '#ffffff',
      duration: 0.3,
    }, '-=1.0');

    // Description fades in
    tl.to(desc, {
      color: 'rgba(255,255,255,0.4)',
      duration: 0.3,
    }, '-=0.8');

    // Timestamp appears
    tl.to(time, {
      color: 'rgba(255,255,255,0.2)',
      duration: 0.3,
    }, '-=0.6');

    // Connector line fills (if not last)
    if (i < connectors.length) {
      tl.to(connectors[i], {
        backgroundColor: '#0094ac',
        duration: 0.4, ease: 'power2.out',
      }, '-=0.4');
    }

    // Previous step dot settles (shrink back, keep color)
    if (i > 0) {
      const prevDot = steps[i - 1].querySelector('[data-step-dot] > div:first-child');
      tl.to(prevDot, { scale: 1, duration: 0.2 }, '-=1.0');
    }
  });

  // ── Summary Reveal (after all steps) ──

  tl.set(summaryRef.current, { display: 'block' });
  tl.from(summaryRef.current, {
    y: 15, opacity: 0, scale: 0.98,
    duration: 0.5, ease: 'back.out(1.5)',
  });
  tl.to(summaryRef.current, { opacity: 1, duration: 0.01 });

}, { scope: sectionRef });
```

---

## Decorative Elements

### Panel Inner Glow

A soft radial gradient inside the panel for depth:

```tsx
<div
  className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 pointer-events-none"
  style={{
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,148,172,0.06), transparent 70%)',
  }}
/>
```

### Grid Lines (optional)

Faint horizontal/vertical grid lines inside the panel for a terminal/dashboard aesthetic:

```css
.demo-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  border-radius: inherit;
}
```

---

## Implementation Phases

### Phase 1: Section Container & Light Background

**File:** `src/components/sections/DemoSection.tsx`

1. Keep `bg-[#FAFAFA]` light theme (panel itself is dark — creates contrast)
2. Set up full-width layout with centered content
3. Create all refs

### Phase 2: Data Model

**File:** `src/data/constants.ts`

1. Add `timestamp` and `icon` fields to `DemoStatus`
2. Add `DemoTransaction` interface and `demoTransaction` data
3. Keep `active` field for backward compatibility

### Phase 3: Kinetic Heading

1. Overline "LIVE DEMO" in teal
2. Split "Track Every Step" + "in Real Time" into kinetic word spans

### Phase 4: Transaction Panel

1. Dark `#111111` card with border and shadow
2. Header bar with mock TXN ID, amount, currency pair
3. Full-width progress bar (track + fill)
4. Optional: grid-line pseudo-element for terminal feel

### Phase 5: Step Indicators

1. 4 steps in a horizontal row (vertical on mobile)
2. Each has: dot, label, description, timestamp
3. Connector lines between steps (desktop only)
4. All initially dimmed — GSAP activates sequentially

### Phase 6: GSAP Auto-Play Sequence

1. Section entry: overline → heading → panel slide-up → header
2. Auto-play: each step activates with ~1.5s spacing
3. Progress bar fills incrementally (0% → 25% → 50% → 75% → 100%)
4. Dot pulses (scale + ring), label/timestamp colors animate
5. Summary banner reveals after final step
6. `toggleActions: 'play none none reverse'`

### Phase 7: Summary Banner

1. Appears after completion with `back.out` ease
2. Shows transfer details: amount, route, time elapsed
3. Teal bg/border accent

### Phase 8: Mobile Adaptation

On `< 768px`:
- Steps stack vertically (flex-col)
- Connectors become vertical lines
- Panel padding reduces
- Header bar stacks amount below TXN ID
- Progress bar remains horizontal

### Phase 9: Reduced Motion & Polish

- `prefers-reduced-motion`: skip auto-play, show all steps as active immediately
- Ensure panel text is readable (WCAG AA on `#111111`)
- Add subtle `box-shadow` animation on panel during sequence
- Clean `will-change` after completion

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add `timestamp`, `icon` to `DemoStatus`; add `DemoTransaction` interface + data |
| `src/components/sections/DemoSection.tsx` | Full rewrite — dark panel, progress bar, step indicators, GSAP useGSAP auto-play sequence, summary banner |
| `src/index.css` | (Optional) `.demo-panel::before` grid-line overlay |

---

## Responsive Breakpoints

| Breakpoint | Steps Layout | Panel Padding | Heading Size |
|---|---|---|---|
| `≥ 1024px` (lg) | Horizontal row with connectors | `p-10` | `text-6xl` |
| `≥ 768px` (md) | Horizontal row, tighter | `p-8` | `text-5xl` |
| `< 768px` (sm) | Vertical stack | `p-6` | `text-4xl` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Sequential auto-play (many tweens) | Single timeline with offset positions, not independent tweens |
| Progress bar width animation | GPU-composited via `width` on a small element — negligible cost |
| Pulse ring animation | Uses `opacity` + `scale` (composited), ring removed after pulse |
| Panel grid-line overlay | Pure CSS pseudo-element, no JS cost |
| `will-change` | Not critical — animations are brief one-shots |
| ScrollTrigger cleanup | `useGSAP` with `scope` auto-cleans on unmount |
| Reverse on scroll-back | `toggleActions: 'play none none reverse'` resets all steps |

---

## Testing Criteria

- [ ] Section bg is light `#FAFAFA`, panel is dark `#111111`
- [ ] Overline "LIVE DEMO" fades up in teal
- [ ] Heading words stagger in with 3D kinetic reveal
- [ ] Transaction panel slides up with scale + opacity
- [ ] Header bar shows TXN ID, amount, and currency pair
- [ ] Auto-play begins after panel entry animation
- [ ] Step 1 "Pending" activates: dot turns teal, pulses, label lights up, timestamp appears
- [ ] Progress bar fills to 25%
- [ ] Step 2 "Matched" activates after ~1.5s delay, progress reaches 50%
- [ ] Step 3 "Awaiting Payment" activates, progress reaches 75%
- [ ] Step 4 "Completed" activates with teal label, progress reaches 100%
- [ ] Previous step dots settle (shrink back) when next step activates
- [ ] Connector lines between steps fill with teal color
- [ ] Summary banner reveals after final step with back.out ease
- [ ] Scrolling back up reverses entire sequence smoothly
- [ ] On mobile, steps stack vertically
- [ ] `prefers-reduced-motion` shows all steps as completed immediately
- [ ] Panel text passes WCAG AA contrast on `#111111`
- [ ] No layout shift during auto-play sequence
- [ ] Rapid scroll in/out doesn't cause animation glitches
