# Problem Section — Awwwards-Worthy Redesign Plan

## Vision

Transform the current uniform 4-column card grid into a **cinematic, scroll-driven bento grid** that feels like a visual narrative. Each problem card occupies a distinct visual weight in an asymmetric layout, revealed through choreographed GSAP ScrollTrigger animations with kinetic typography, parallax depth layers, and rich micro-interactions.

---

## Current State

```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Card 1 │ │ Card 2 │ │ Card 3 │ │ Card 4 │   ← uniform 1×1 grid
└────────┘ └────────┘ └────────┘ └────────┘
```

- Tailwind `grid-cols-4` with equal-sized cards
- Basic `AnimatedCard` wrapper (simple fade-in)
- Minimal hover (border color + shadow)
- No scroll-triggered orchestration
- Static numbered circle, plain text

---

## Target Layout — Asymmetric Bento Grid

```
Desktop (lg+):
┌──────────────────────┬─────────────┐
│                      │             │
│     CARD 1 (2×1)     │  CARD 2     │
│   "Blocked"          │  "High fees"│
│                      │  (1×1)      │
├─────────────┬────────┴─────────────┤
│             │                      │
│  CARD 3     │     CARD 4 (2×1)     │
│  "Slow"     │  "Lack of trust"     │
│  (1×1)      │                      │
└─────────────┴──────────────────────┘

Tablet (md):
┌──────────────────────┬─────────────┐
│     CARD 1 (2×1)     │  CARD 2     │
├─────────────┬────────┴─────────────┤
│  CARD 3     │     CARD 4 (2×1)     │
└─────────────┴──────────────────────┘

Mobile (sm):
┌─────────────────────────────────────┐
│  CARD 1 (full width)                │
├─────────────────────────────────────┤
│  CARD 2 (full width)                │
├─────────────────────────────────────┤
│  CARD 3 (full width)                │
├─────────────────────────────────────┤
│  CARD 4 (full width)                │
└─────────────────────────────────────┘
```

### Grid CSS

```css
.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 1.25rem; /* 20px */
}

/* Wide cards span 2 columns */
.problem-grid .card--wide {
  grid-column: span 2;
}

/* Tablet: 3-col stays, same layout */
@media (max-width: 768px) {
  .problem-grid {
    grid-template-columns: 1fr;
  }
  .problem-grid .card--wide {
    grid-column: span 1;
  }
}
```

> Cards 1 and 4 are **wide** (span 2 cols); Cards 2 and 3 are **standard** (span 1 col). This alternating pattern creates visual rhythm and breaks monotony.

---

## Card Anatomy

Each card is composed of multiple depth layers for parallax and animation:

```
┌─────────────────────────────────────────────┐
│  ┌─ Layer 0: Background ──────────────────┐ │
│  │  Subtle gradient fill + grain texture   │ │
│  │                                         │ │
│  │  ┌─ Layer 1: Oversized Index ────────┐  │ │
│  │  │  "01"  (giant, ~160px, 5% opacity) │  │ │
│  │  │  positioned top-right, clipped     │  │ │
│  │  └───────────────────────────────────┘  │ │
│  │                                         │ │
│  │  ┌─ Layer 2: Content ────────────────┐  │ │
│  │  │  Icon (animated SVG)               │  │ │
│  │  │  Title (kinetic text reveal)       │  │ │
│  │  │  Description (fade-up, staggered)  │  │ │
│  │  └───────────────────────────────────┘  │ │
│  │                                         │ │
│  │  ┌─ Layer 3: Decorative Line ────────┐  │ │
│  │  │  Animated accent line (draws in)   │  │ │
│  │  └───────────────────────────────────┘  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Visual Details

| Element | Spec |
|---|---|
| **Card background** | `bg-zinc-950` with a very subtle radial gradient (`radial-gradient(ellipse at 30% 20%, rgba(0,148,172,0.06), transparent 70%)`) |
| **Border** | 1px `border-white/[0.06]`, on hover → `border-brand-teal/30` |
| **Border radius** | `1.25rem` (20px) |
| **Padding** | Wide cards: `3rem` (48px). Standard cards: `2.5rem` (40px) |
| **Oversized index** | Font: Inter 800, `clamp(8rem, 12vw, 12rem)`, `color: white`, `opacity: 0.03`, `position: absolute`, `top: -1rem`, `right: 1rem`, `pointer-events: none` |
| **Icon** | 32×32 SVG with `stroke: brand-teal`, `stroke-width: 1.5` |
| **Title** | `text-xl font-semibold text-white` (wide cards: `text-2xl`) |
| **Description** | `text-sm text-white/50 leading-relaxed font-light`, `max-width: 32ch` |
| **Accent line** | 48px wide, 2px tall, `bg-brand-teal`, positioned below the icon |

---

## Section Heading — Kinetic Typography

The heading "Cross-Border Transfers Are Broken" will be split into individual words, each animated with a staggered reveal:

```
"Cross-Border"  →  main (brand-blue or white depending on bg)
"Transfers Are Broken"  →  accent (brand-teal)
```

### Animation Sequence

1. Each word starts at `y: 40px, opacity: 0, rotateX: 45deg`
2. Words animate in with a `0.08s` stagger, `power3.out` ease, `0.6s` duration
3. After all words land, a thin horizontal line draws from center outward (width: `0 → 80px`)

```tsx
// Split heading into words, wrap each in a <span>
const words = text.split(' ');
return words.map((word, i) => (
  <span key={i} className="inline-block overflow-hidden">
    <span ref={addToRefs} className="inline-block">
      {word}
    </span>
  </span>
));
```

---

## Data Model Update

**File:** `src/data/constants.ts`

Add an `icon` identifier and a `variant` flag to each problem item so the component knows which layout/icon to render:

```ts
export interface ProblemItem {
  title: string;
  desc: string;
  icon: 'blocked' | 'fees' | 'slow' | 'trust';
  variant: 'wide' | 'standard';
}

export const problemItems: ProblemItem[] = [
  {
    title: 'Blocked or restricted',
    desc: 'Transfers are often limited by arbitrary bank policies.',
    icon: 'blocked',
    variant: 'wide',
  },
  {
    title: 'High fees',
    desc: 'Traditional services take a massive cut of your hard-earned money.',
    icon: 'fees',
    variant: 'standard',
  },
  {
    title: 'Slow processing',
    desc: 'Waiting days for money to arrive in urgent situations.',
    icon: 'slow',
    variant: 'standard',
  },
  {
    title: 'Lack of trust',
    desc: 'No visibility into where your money is during transition.',
    icon: 'trust',
    variant: 'wide',
  },
];
```

---

## GSAP Animation Blueprint

### Dependencies

```bash
npm install gsap @gsap/react
```

> Already installed in the project — `useGSAP` is in use elsewhere.

### Master Timeline (ScrollTrigger)

All animations are orchestrated in a single `gsap.timeline` with `ScrollTrigger`:

```
Timeline ─────────────────────────────────────────────────────────►
  │
  ├─ 0.0s   Section background fades from white → #0a0a0a (dark)
  │
  ├─ 0.1s   Heading words stagger in (rotateX + y + opacity)
  │
  ├─ 0.4s   Accent line draws from center
  │
  ├─ 0.5s   Card 1 reveals (clipPath + y + opacity)
  ├─ 0.65s  Card 2 reveals
  ├─ 0.8s   Card 3 reveals
  ├─ 0.95s  Card 4 reveals
  │
  ├─ 1.1s   Inside each card (sub-timeline):
  │          ├─ Oversized number fades to 0.03 opacity
  │          ├─ Accent line draws width 0 → 48px
  │          ├─ Icon SVG path draws (stroke-dashoffset)
  │          └─ Title + desc fade up
  │
  └─ 1.6s   Bottom quote line fades in + border draws
```

### ScrollTrigger Configuration

```tsx
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top 75%',     // trigger when top of section hits 75% viewport
  end: 'bottom 25%',
  toggleActions: 'play none none reverse',
});
```

> `toggleActions: 'play none none reverse'` → plays on enter, reverses on leave-back. This means scrolling back up will gracefully undo the animation.

---

## Implementation Steps

### Phase 1: Section Skeleton & Dark Theme

**File:** `src/components/sections/ProblemSection.tsx`

1. Replace `bg-white` with a dark theme: `bg-[#0a0a0a]`
2. Swap the `Container` wrapper to use `as="section"` with `id="problem"`
3. Set up the asymmetric grid using Tailwind or a custom CSS class
4. Wrap the entire section in a `ref` for ScrollTrigger

```tsx
export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headingWordsRef = useRef<HTMLSpanElement[]>([]);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative py-32 bg-[#0a0a0a] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        {/* Grid */}
        {/* Bottom quote */}
      </div>
    </section>
  );
}
```

### Phase 2: Kinetic Heading Component

Create a reusable `<KineticHeading>` inside the file (or as a new UI component) that splits text into words and exposes refs for GSAP:

```tsx
function KineticHeading({
  main,
  accent,
  wordsRef,
}: {
  main: string;
  accent: string;
  wordsRef: React.MutableRefObject<HTMLSpanElement[]>;
}) {
  const addRef = (el: HTMLSpanElement | null) => {
    if (el && !wordsRef.current.includes(el)) {
      wordsRef.current.push(el);
    }
  };

  const renderWords = (text: string, className: string) =>
    text.split(' ').map((word, i) => (
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

  return (
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center mb-20">
      {renderWords(main, 'text-white')}
      <br className="hidden sm:block" />
      {renderWords(accent, 'text-brand-teal')}
    </h2>
  );
}
```

### Phase 3: Problem Card Component

Create a `<ProblemCard>` sub-component with layered structure:

```tsx
interface ProblemCardProps {
  item: ProblemItem;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
}

function ProblemCard({ item, index, cardRef }: ProblemCardProps) {
  const isWide = item.variant === 'wide';
  const indexStr = String(index + 1).padStart(2, '0');

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-[1.25rem] border border-white/[0.06]
        ${isWide ? 'col-span-2 p-12' : 'col-span-1 p-10'}
        group cursor-default
        hover:border-brand-teal/30 transition-colors duration-500
      `}
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(0,148,172,0.05), transparent 70%), #111111',
        willChange: 'transform, opacity',
      }}
    >
      {/* Layer 0: Oversized Index */}
      <span
        className="absolute top-[-0.5rem] right-4 font-extrabold text-white/[0.03] select-none pointer-events-none leading-none"
        style={{ fontSize: 'clamp(8rem, 12vw, 12rem)' }}
        data-index
      >
        {indexStr}
      </span>

      {/* Layer 1: Content */}
      <div className="relative z-10">
        {/* Icon placeholder — to be replaced with animated SVG */}
        <div className="w-8 h-8 mb-4" data-icon>
          <ProblemIcon type={item.icon} />
        </div>

        {/* Accent line */}
        <div
          className="h-[2px] bg-brand-teal mb-6 origin-left"
          style={{ width: 0 }}
          data-accent-line
        />

        <h3
          className={`font-semibold text-white mb-3 ${isWide ? 'text-2xl' : 'text-xl'}`}
          data-title
        >
          {item.title}
        </h3>

        <p
          className="text-sm text-white/50 leading-relaxed font-light max-w-[32ch]"
          data-desc
        >
          {item.desc}
        </p>
      </div>
    </div>
  );
}
```

### Phase 4: GSAP ScrollTrigger Orchestration

**Inside `ProblemSection`**, wire up the master timeline:

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Inside the component:
useGSAP(() => {
  const section = sectionRef.current;
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      end: 'bottom 25%',
      toggleActions: 'play none none reverse',
    },
  });

  // 1. Heading words — staggered kinetic reveal
  tl.from(headingWordsRef.current, {
    y: 60,
    opacity: 0,
    rotateX: 45,
    transformOrigin: 'center bottom',
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.06,
  });

  // 2. Cards — staggered clipPath + y reveal
  tl.from(
    cardsRef.current,
    {
      y: 80,
      opacity: 0,
      scale: 0.96,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12,
    },
    '-=0.3' // overlap with heading end
  );

  // 3. Inside each card — sub-animations
  cardsRef.current.forEach((card, i) => {
    const accentLine = card.querySelector('[data-accent-line]');
    const title = card.querySelector('[data-title]');
    const desc = card.querySelector('[data-desc]');
    const icon = card.querySelector('[data-icon]');

    const subTl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    subTl
      .from(icon, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(2)' })
      .to(accentLine, { width: 48, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .from(title, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from(desc, { y: 15, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  });

  // 4. Bottom quote — fade in
  tl.from(
    quoteRef.current,
    { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' },
    '-=0.4'
  );
}, { scope: sectionRef });
```

### Phase 5: Hover Micro-Interactions

Add a subtle **tilt / magnetic effect** on card hover using GSAP:

```tsx
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -4; // max ±4deg
  const rotateY = ((x - centerX) / centerX) * 4;

  gsap.to(card, {
    rotateX,
    rotateY,
    transformPerspective: 800,
    duration: 0.4,
    ease: 'power2.out',
  });

  // Move the oversized index slightly (parallax)
  const indexEl = card.querySelector('[data-index]');
  gsap.to(indexEl, {
    x: ((x - centerX) / centerX) * 8,
    y: ((y - centerY) / centerY) * 6,
    duration: 0.4,
    ease: 'power2.out',
  });
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  const card = e.currentTarget;
  gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  gsap.to(card.querySelector('[data-index]'), { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
};
```

### Phase 6: SVG Icons

Create a `<ProblemIcon>` component that renders inline SVGs for each problem type. These should be minimal, single-path stroke icons that can be animated via `stroke-dashoffset`:

```tsx
function ProblemIcon({ type }: { type: ProblemItem['icon'] }) {
  const paths: Record<string, string> = {
    blocked: 'M18 6L6 18M6 6l12 12',                           // X mark
    fees:    'M12 1v22M5 8h14M7 16h10',                         // Dollar-ish
    slow:    'M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20', // Clock
    trust:   'M1 12s4-8 11-8 7 0 11 8 11 8s-4 8-11 8-11-8-11-8', // Eye
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-teal">
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

> The SVG path `stroke-dashoffset` animation (drawing effect) will be applied via GSAP in Phase 4's sub-timeline for each card.

### Phase 7: Background & Noise Texture

Add a subtle film-grain noise overlay to the section for texture depth:

```css
.problem-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* tiny noise SVG */
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}
```

Or use a CSS-only grain via a pseudo-element with a small repeating radial-gradient.

### Phase 8: Bottom Quote Enhancement

The bottom quote gets a refined treatment — a left-border that **draws downward** via GSAP, with the text fading in after:

```tsx
<div ref={quoteRef} className="mt-20 relative pl-8">
  {/* Animated vertical line */}
  <div
    className="absolute left-0 top-0 w-[2px] bg-brand-teal origin-top"
    style={{ height: 0 }}
    data-quote-line
  />
  <p className="text-white/40 font-light italic text-lg max-w-2xl">
    Millions of people are left without reliable ways to send or receive money.
  </p>
</div>
```

Animation (added to the master timeline):
```tsx
tl.to('[data-quote-line]', { height: '100%', duration: 0.6, ease: 'power2.out' }, '-=0.5')
  .from(quoteRef.current.querySelector('p'), { opacity: 0, x: -20, duration: 0.5 }, '-=0.3');
```

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add `icon` and `variant` fields to `ProblemItem` interface and data |
| `src/components/sections/ProblemSection.tsx` | Full rewrite — bento grid, dark theme, GSAP ScrollTrigger, kinetic heading, layered cards, hover effects |
| `src/index.css` | Add `.problem-section::before` grain texture, `.problem-grid` base styles |

---

## Responsive Breakpoints

| Breakpoint | Layout | Card Padding | Heading Size |
|---|---|---|---|
| `≥ 1024px` (lg) | 3-col bento, wide cards span 2 | 48px / 40px | `text-6xl` |
| `≥ 768px` (md) | 3-col bento, wide cards span 2 | 40px / 32px | `text-5xl` |
| `< 768px` (sm) | 1-col stack, all full-width | 32px | `text-4xl` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Multiple ScrollTriggers | Use a single master timeline where possible; individual card sub-timelines are lightweight |
| `will-change` | Applied only to animated properties (`transform`, `opacity`) and removed after animation completes |
| 3D transforms on hover | `transformPerspective` is GPU-accelerated; the tilt values are capped at ±4° to avoid excessive compositing |
| Noise texture overlay | Using a tiny inlined SVG data-URI instead of a large PNG; `opacity: 0.03` keeps it subtle |
| Ref arrays | Using callback refs with a guard to avoid duplicates on re-render |

---

## Testing Criteria

- [ ] Scrolling into the section triggers the heading words staggering in with a 3D rotateX + y reveal
- [ ] Cards reveal in sequence (1 → 2 → 3 → 4) with opacity + y + scale
- [ ] Each card's internal elements (icon → accent line → title → desc) animate in sub-sequence
- [ ] Scrolling back up reverses all animations smoothly
- [ ] Hovering a card produces a subtle 3D tilt effect (max ±4°)
- [ ] The oversized index number shifts slightly on hover (parallax)
- [ ] Mouse leave snaps back with a soft elastic ease
- [ ] Bottom quote's vertical line draws downward, then text fades in
- [ ] On mobile (< 768px), cards stack vertically in a single column
- [ ] On tablet (768px–1023px), the 3-col bento layout still holds
- [ ] No layout shift or jank during scroll-triggered animations
- [ ] `toggleActions: 'play none none reverse'` works correctly on repeated scroll passes
- [ ] Section background is dark (#0a0a0a) with subtle grain texture visible
- [ ] Card borders subtly highlight to `brand-teal/30` on hover
