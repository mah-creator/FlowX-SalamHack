# Case Study Section — Cinematic Narrative Redesign Plan

## Vision

Transform the current static two-column card into an **immersive, scroll-driven narrative experience** that tells the Gaza ↔ Egypt story as a cinematic sequence. A full-viewport dark section with an animated corridor map, kinetic typography, and a live transaction flow visualization that plays out as the user scrolls. The goal: make the user *feel* the transfer happening — not just read about it.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  bg-white, rounded card on zinc-50                           │
│                                                              │
│  ┌─ Left ──────────────┐  ┌─ Right ─────────────────────┐  │
│  │ "Real Example"       │  │  [GA] ───●──── [CA]         │  │
│  │ "Gaza ↔ Egypt"       │  │  Gaza     dot   Cairo       │  │
│  │  paragraph text      │  │                              │  │
│  │  ⚡ FlowX matches    │  │  "Local Payout Triggered"    │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Static layout, no scroll interaction
- Framer Motion dot animation (basic `x` loop)
- Light bg feels disconnected from brand story
- No narrative progression — everything visible at once

---

## Target Experience — Scroll-Driven Narrative

The section is **dark-themed** (`#0a0a0a`) to create cinematic contrast. Content reveals in a choreographed scroll-triggered sequence — the story unfolds as you scroll.

### User Flow

```
Scroll ───────────────────────────────────────────────────►
  │
  ├─ Section enters → dark bg fades in
  │
  ├─ Beat 1: Overline + heading reveal (kinetic words)
  │
  ├─ Beat 2: Mohammed's card slides in from left
  │    "Mohammed in Gaza needs to receive money..."
  │
  ├─ Beat 3: Ahmad's card slides in from right
  │    "Ahmad in Egypt needs to send money..."
  │
  ├─ Beat 4: Corridor map animates between them
  │    Animated path draws, dot pulses along route
  │
  ├─ Beat 5: "FlowX matches them instantly" — flash reveal
  │    Teal accent pulse, both cards glow
  │
  ├─ Beat 6: Result card fades up from bottom
  │    "Local Payout Triggered · Zero Border Movement"
  │
  └─ Section exits normally
```

### Viewport Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  "REAL EXAMPLE"  (overline, teal, tracking-widest)            │
│                                                                │
│  "Gaza ↔ Egypt"                                               │
│  "Without Borders"  (italic, muted)                           │
│                                                                │
│  ┌─ Mohammed Card ─┐          ┌─ Ahmad Card ──────┐          │
│  │  Mohammed        │          │          Ahmad    │          │
│  │  Gaza Center     │          │     Cairo Center  │          │
│  │  "Needs to       │          │     "Needs to     │          │
│  │   receive..."    │          │      send..."     │          │
│  └──────────────────┘          └───────────────────┘          │
│                                                                │
│          ┌─ Corridor Map ──────────────────────┐              │
│          │  ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ● │              │
│          │  Gaza          FlowX           Cairo │              │
│          └─────────────────────────────────────┘              │
│                                                                │
│          ┌─ Result Banner ─────────────────────┐              │
│          │  ✓ LOCAL PAYOUT TRIGGERED           │              │
│          │  Zero International Movement         │              │
│          └─────────────────────────────────────┘              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  "REAL EXAMPLE"              │
│  "Gaza ↔ Egypt"              │
│  "Without Borders"           │
│                              │
│  ┌─ Mohammed Card ─────────┐│
│  │  Mohammed · Gaza         ││
│  │  "Needs to receive..."   ││
│  └──────────────────────────┘│
│                              │
│  ┌─ Corridor (vertical) ───┐│
│  │  ● ─ ─ ─ ─ ─ ─ ─ ─ ●  ││
│  └──────────────────────────┘│
│                              │
│  ┌─ Ahmad Card ────────────┐│
│  │  Ahmad · Cairo           ││
│  │  "Needs to send..."      ││
│  └──────────────────────────┘│
│                              │
│  ┌─ Result Banner ─────────┐│
│  │  ✓ LOCAL PAYOUT          ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Section bg** | `#0a0a0a` (dark, cinematic) |
| **Overline** | `text-brand-teal`, `text-xs`, `tracking-[0.25em]`, `uppercase`, `font-bold` |
| **Heading main** | `text-white`, `text-5xl lg:text-6xl`, `font-light`, `tracking-tighter` |
| **Heading accent** | `text-white/30`, `italic` |
| **Person card bg** | `bg-white/[0.04]`, `border: 1px solid white/[0.08]`, `backdrop-blur-sm`, `rounded-2xl` |
| **Person name** | `text-white`, `text-lg`, `font-semibold` |
| **Person location** | `text-brand-teal`, `text-[10px]`, `uppercase`, `tracking-widest`, `font-bold` |
| **Person description** | `text-white/50`, `text-sm`, `font-light`, `leading-relaxed` |
| **Corridor path** | `stroke: brand-teal/30` dashed, animated to `brand-teal` solid |
| **Corridor dot** | `fill: brand-teal`, `w-3 h-3`, with pulsing ring |
| **FlowX badge** | `bg-brand-teal`, `text-white`, `text-[10px]`, centered on corridor |
| **Result banner** | `bg-brand-teal/10`, `border: 1px solid brand-teal/20`, `rounded-2xl` |
| **Result title** | `text-brand-teal`, `text-sm`, `font-bold`, `uppercase`, `tracking-widest` |
| **Result subtitle** | `text-white/40`, `text-xs`, `italic` |

---

## Data Model Update

**File:** `src/data/constants.ts`

Add a new data structure for the case study narrative:

```ts
// ─── Case Study ───────────────────────────────────────────────────────────────

export interface CaseStudyPerson {
  name: string;
  location: string;
  locationCode: string;
  description: string;
  role: 'sender' | 'receiver';
}

export interface CaseStudyData {
  overline: string;
  headingMain: string;
  headingAccent: string;
  matchLine: string;
  resultTitle: string;
  resultSubtitle: string;
  persons: [CaseStudyPerson, CaseStudyPerson];
}

export const caseStudy: CaseStudyData = {
  overline: 'Real Example',
  headingMain: 'Gaza ↔ Egypt',
  headingAccent: 'Without Borders',
  matchLine: 'FlowX matches them instantly.',
  resultTitle: 'Local Payout Triggered',
  resultSubtitle: 'Zero International Movement',
  persons: [
    {
      name: 'Mohammed',
      location: 'Gaza Center',
      locationCode: 'GA',
      description:
        'Needs to receive money from Egypt to pay for essential supplies.',
      role: 'receiver',
    },
    {
      name: 'Ahmad',
      location: 'Cairo Center',
      locationCode: 'CA',
      description:
        'Needs to send money to Gaza to support his family.',
      role: 'sender',
    },
  ],
};
```

---

## Person Card Component

```tsx
interface PersonCardProps {
  person: CaseStudyPerson;
  side: 'left' | 'right';
}

function PersonCard({ person, side }: PersonCardProps) {
  return (
    <div
      className={`
        relative p-8 rounded-2xl border border-white/[0.08]
        bg-white/[0.03] backdrop-blur-sm
        max-w-sm w-full
        ${side === 'right' ? 'ml-auto text-right' : ''}
      `}
      data-person-card
    >
      {/* Avatar circle */}
      <div
        className={`
          w-14 h-14 rounded-full border border-brand-teal/20
          flex items-center justify-center mb-4
          bg-white/[0.05] text-white font-semibold text-sm
          shadow-lg shadow-brand-teal/5
          ${side === 'right' ? 'ml-auto' : ''}
        `}
      >
        {person.locationCode}
      </div>

      <h4 className="text-white text-lg font-semibold mb-1" data-name>
        {person.name}
      </h4>
      <p className="text-brand-teal text-[10px] uppercase tracking-[0.2em] font-bold mb-4" data-location>
        {person.location}
      </p>
      <p className="text-white/50 text-sm font-light leading-relaxed" data-desc>
        {person.description}
      </p>

      {/* Subtle corner accent glow */}
      <div
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} w-16 h-16 pointer-events-none`}
        style={{
          background: `radial-gradient(circle at ${side === 'left' ? '0% 0%' : '100% 0%'}, rgba(0,148,172,0.08), transparent 70%)`,
        }}
      />
    </div>
  );
}
```

---

## Corridor Map — SVG Animated Path

An SVG connecting the two persons with an animated dashed-to-solid path and a traveling dot:

```tsx
function CorridorMap() {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-8" data-corridor>
      <svg viewBox="0 0 600 60" className="w-full h-auto" fill="none">
        {/* Background dashed path */}
        <line
          x1="40" y1="30" x2="560" y2="30"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />

        {/* Animated solid path (draws in via GSAP stroke-dashoffset) */}
        <line
          x1="40" y1="30" x2="560" y2="30"
          stroke="#0094ac"
          strokeWidth="2"
          data-corridor-path
          strokeDasharray="520"
          strokeDashoffset="520"
        />

        {/* Left node */}
        <circle cx="40" cy="30" r="6" fill="#0a0a0a" stroke="#0094ac" strokeWidth="1.5" data-node-left />

        {/* Right node */}
        <circle cx="560" cy="30" r="6" fill="#0a0a0a" stroke="#0094ac" strokeWidth="1.5" data-node-right />

        {/* Traveling dot */}
        <circle cx="40" cy="30" r="4" fill="#0094ac" data-traveling-dot />

        {/* Center FlowX badge */}
        <rect x="260" y="12" width="80" height="36" rx="18" fill="#0094ac" data-flowx-badge opacity="0" />
        <text x="300" y="35" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.1em" data-flowx-text opacity="0">
          FLOWX
        </text>
      </svg>
    </div>
  );
}
```

---

## GSAP Animation Blueprint

### Dependencies

Uses existing `gsap`, `@gsap/react` (`useGSAP` hook), and `ScrollTrigger`.

### Master Timeline (ScrollTrigger)

```tsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Inside CaseStudySection:
const sectionRef = useRef<HTMLElement>(null);
const overlineRef = useRef<HTMLSpanElement>(null);
const headingWordsRef = useRef<HTMLSpanElement[]>([]);
const leftCardRef = useRef<HTMLDivElement>(null);
const rightCardRef = useRef<HTMLDivElement>(null);
const corridorRef = useRef<HTMLDivElement>(null);
const matchLineRef = useRef<HTMLDivElement>(null);
const resultRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  const section = sectionRef.current;
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'bottom 20%',
      toggleActions: 'play none none reverse',
    },
  });

  // Beat 1: Overline fades in
  tl.from(overlineRef.current, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  });

  // Beat 2: Heading words stagger in (kinetic)
  tl.from(headingWordsRef.current, {
    y: 50, opacity: 0, rotateX: 35,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.07,
  }, '-=0.2');

  // Beat 3: Mohammed's card slides in from left
  tl.from(leftCardRef.current, {
    x: -80, opacity: 0, duration: 0.7, ease: 'power3.out',
  }, '-=0.2');

  // Beat 4: Ahmad's card slides in from right
  tl.from(rightCardRef.current, {
    x: 80, opacity: 0, duration: 0.7, ease: 'power3.out',
  }, '-=0.5');

  // Beat 5: Corridor path draws in
  const corridorPath = section.querySelector('[data-corridor-path]');
  const travelingDot = section.querySelector('[data-traveling-dot]');
  const nodeLeft = section.querySelector('[data-node-left]');
  const nodeRight = section.querySelector('[data-node-right]');

  tl.from(corridorRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');

  tl.to(corridorPath, {
    strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut',
  });

  // Nodes pulse
  tl.to(nodeLeft, { r: 8, duration: 0.3, ease: 'power2.out' }, '-=0.8')
    .to(nodeLeft, { r: 6, duration: 0.2 });

  tl.to(nodeRight, { r: 8, duration: 0.3, ease: 'power2.out' }, '-=0.6')
    .to(nodeRight, { r: 6, duration: 0.2 });

  // Traveling dot moves across
  tl.to(travelingDot, {
    cx: 560, duration: 1.0, ease: 'power1.inOut',
  }, '-=1.0');

  // Beat 6: FlowX badge reveals at center
  const badge = section.querySelector('[data-flowx-badge]');
  const badgeText = section.querySelector('[data-flowx-text]');
  tl.to([badge, badgeText], {
    opacity: 1, duration: 0.3, ease: 'power2.out',
  }, '-=0.4');

  // Beat 7: Match line flash
  tl.from(matchLineRef.current, {
    opacity: 0, scale: 0.95, duration: 0.4, ease: 'back.out(2)',
  }, '-=0.1');

  // Both cards glow briefly
  tl.to([leftCardRef.current, rightCardRef.current], {
    borderColor: 'rgba(0,148,172,0.3)',
    boxShadow: '0 0 30px rgba(0,148,172,0.1)',
    duration: 0.4, ease: 'power2.out',
  }, '-=0.3')
  .to([leftCardRef.current, rightCardRef.current], {
    borderColor: 'rgba(255,255,255,0.08)',
    boxShadow: '0 0 0px transparent',
    duration: 0.6, ease: 'power2.out',
  });

  // Beat 8: Result banner rises
  tl.from(resultRef.current, {
    y: 40, opacity: 0, scale: 0.97,
    duration: 0.6, ease: 'power3.out',
  }, '-=0.4');

}, { scope: sectionRef });
```

---

## Kinetic Heading Helper

Reuse the split-word pattern from ProblemSection:

```tsx
function renderWords(
  text: string,
  className: string,
  addRef: (el: HTMLSpanElement | null) => void,
) {
  return text.split(' ').map((word, i) => (
    <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-3">
      <span
        ref={addRef}
        className={`inline-block ${className}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {word}
      </span>
    </span>
  ));
}
```

---

## Implementation Phases

### Phase 1: Section Container & Dark Theme

**File:** `src/components/sections/CaseStudySection.tsx`

1. Replace `bg-white` with `bg-[#0a0a0a]` dark theme
2. Remove the light card wrapper and `Container` light styling
3. Set up `sectionRef` and all animation refs
4. Add subtle noise/grain overlay via CSS pseudo-element

### Phase 2: Data Model

**File:** `src/data/constants.ts`

1. Add `CaseStudyPerson`, `CaseStudyData` interfaces
2. Add `caseStudy` constant with narrative data
3. Remove hardcoded text from the component

### Phase 3: Kinetic Heading

1. Build overline + heading with split-word refs
2. Use `headingWordsRef` array for GSAP targeting
3. Main text in white, accent ("Without Borders") in `white/30 italic`

### Phase 4: Person Cards

1. Create `PersonCard` sub-component with glassmorphic styling
2. Layout: `flex justify-between` with `max-w-sm` cards
3. Left card for Mohammed, right card for Ahmad
4. Add `data-person-card` attributes for GSAP targeting

### Phase 5: Corridor Map SVG

1. Create the `CorridorMap` SVG component
2. Dashed background line + solid animated line
3. Two endpoint nodes + traveling dot
4. Center FlowX badge (hidden initially, revealed by GSAP)

### Phase 6: GSAP Master Timeline

1. Wire up `useGSAP` with `ScrollTrigger`
2. Implement the 8-beat choreographed sequence
3. Use `toggleActions: 'play none none reverse'` for scroll-back
4. Add `will-change` management

### Phase 7: Match Line & Result Banner

1. Build centered match-line with Zap icon
2. Build result banner with check icon
3. Both animated as final beats in the timeline

### Phase 8: Background Decorations

1. Add radial gradient glow behind corridor (`brand-teal/5`)
2. Add film-grain noise overlay (same as ProblemSection)
3. Optional: subtle grid lines in the background at very low opacity

### Phase 9: Mobile Adaptation

On `< 768px`:
- Stack all elements vertically (cards, corridor, result)
- Corridor SVG simplifies to a vertical dashed line
- Cards become full-width
- Animation directions switch: cards come from `y` instead of `x`

```tsx
useGSAP(() => {
  const isMobile = window.innerWidth < 768;

  tl.from(leftCardRef.current, {
    [isMobile ? 'y' : 'x']: isMobile ? 40 : -80,
    opacity: 0, duration: 0.7, ease: 'power3.out',
  });
}, { scope: sectionRef });
```

### Phase 10: Reduced Motion & Polish

- `prefers-reduced-motion`: disable transforms, use opacity-only fades
- Clean `will-change` after animation completes
- Ensure text passes WCAG AA contrast on dark bg
- Add subtle hover effect on person cards (border glow)

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add `CaseStudyPerson`, `CaseStudyData` interfaces and `caseStudy` data |
| `src/components/sections/CaseStudySection.tsx` | Full rewrite — dark theme, person cards, corridor SVG, GSAP useGSAP ScrollTrigger timeline, kinetic heading |
| `src/index.css` | (Optional) `.case-study-section::before` grain texture |

---

## Responsive Breakpoints

| Breakpoint | Layout | Card Width | Heading Size |
|---|---|---|---|
| `≥ 1024px` (lg) | Side-by-side cards, horizontal corridor | `max-w-sm` | `text-6xl` |
| `≥ 768px` (md) | Side-by-side cards, tighter gap | `max-w-xs` | `text-5xl` |
| `< 768px` (sm) | Stacked cards, vertical corridor | `full-width` | `text-4xl` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| SVG stroke animation | Lightweight single path, hardware-accelerated via `stroke-dashoffset` |
| Multiple card animations | Sequenced in a single timeline, not parallel independent triggers |
| `will-change` | Applied during animation, cleared via `onComplete` |
| Dark background contrast | All text meets WCAG AA on `#0a0a0a` background |
| ScrollTrigger cleanup | `useGSAP` with `scope` handles automatic cleanup on unmount |
| Resize handling | `ScrollTrigger.refresh()` on resize to recalculate positions |

---

## Testing Criteria

- [ ] Section background is dark `#0a0a0a` with optional grain texture
- [ ] Overline "REAL EXAMPLE" fades up first in teal
- [ ] Heading words stagger in with 3D rotateX kinetic reveal
- [ ] Mohammed's card slides in from the left
- [ ] Ahmad's card slides in from the right (overlapping timing)
- [ ] Corridor SVG path draws from left to right (dashed → solid)
- [ ] Traveling dot moves along the corridor path
- [ ] FlowX badge fades in at the center of the corridor
- [ ] Both person cards flash with a brief teal glow on match
- [ ] Match line ("FlowX matches them instantly") pops in with scale
- [ ] Result banner rises from bottom with subtle scale
- [ ] Scrolling back up reverses all animations smoothly
- [ ] On mobile (< 768px), elements stack vertically
- [ ] On mobile, cards animate from `y` instead of `x`
- [ ] No layout shift or jank during scroll-triggered animations
- [ ] `prefers-reduced-motion` disables transforms, uses opacity-only
- [ ] All text passes WCAG AA contrast on dark background
- [ ] `toggleActions: 'play none none reverse'` works on repeated passes
