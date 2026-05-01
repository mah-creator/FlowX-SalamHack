# FAQ Section — Editorial Accordion Redesign Plan

## Vision

Elevate the current basic accordion into a **premium editorial FAQ experience** with a two-column asymmetric layout — a sticky left panel with the heading, decorative number counter, and a subtle support CTA, paired with a right-side accordion that uses refined GSAP-powered expand/collapse animations, numbered items, and scroll-triggered staggered reveals. Light-themed, spacious, and typographically rich — the kind of FAQ section you'd find on a Stripe or Linear landing page.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  bg-white, narrow container, centered                        │
│                                                              │
│  "Frequently Asked Questions"  (text-3xl, centered)         │
│                                                              │
│  ┌─ FAQ 1 (rounded-2rem, zinc-50) ───────────────────────┐  │
│  │  "Is my money safe?"                        [+]        │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌─ FAQ 2 ───────────────────────────────────────────────┐  │
│  │  "What if no match is found?"               [+]        │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌─ FAQ 3 ───────────────────────────────────────────────┐  │
│  │  "Can I cancel a transfer?"                 [+]        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Basic centered heading, no visual hierarchy
- Accordion works but visually plain (zinc-50 bg)
- No numbering, no decorative elements
- Only 3 FAQs — needs more content to feel substantial
- No scroll-triggered entrance animation for the section

---

## Target Experience — Editorial Split Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│  bg-[#FAFAFA]                                                  │
│                                                                │
│  ┌─ Left (sticky) ──────┐  ┌─ Right (accordion) ───────────┐ │
│  │                       │  │                                │ │
│  │  "SUPPORT"            │  │  ┌─ 01 ─────────────────────┐ │ │
│  │  (overline, teal)     │  │  │  Is my money safe?    [-] │ │ │
│  │                       │  │  │                            │ │ │
│  │  "Questions"          │  │  │  Yes, all transactions... │ │ │
│  │  "& Answers"          │  │  │                            │ │ │
│  │                       │  │  └────────────────────────────┘ │ │
│  │  ┌───┐               │  │                                │ │
│  │  │ 03│  total         │  │  ┌─ 02 ─────────────────────┐ │ │
│  │  │   │  questions     │  │  │  What if no match?   [+] │ │ │
│  │  └───┘               │  │  └────────────────────────────┘ │ │
│  │                       │  │                                │ │
│  │  ── accent line ──    │  │  ┌─ 03 ─────────────────────┐ │ │
│  │                       │  │  │  Can I cancel?        [+] │ │ │
│  │  "Still have a        │  │  └────────────────────────────┘ │ │
│  │   question?"          │  │                                │ │
│  │  [ Contact Us → ]     │  │  ┌─ 04 ─────────────────────┐ │ │
│  │                       │  │  │  How long does it...  [+] │ │ │
│  └───────────────────────┘  │  └────────────────────────────┘ │ │
│                              │                                │ │
│                              │  ┌─ 05 ─────────────────────┐ │ │
│                              │  │  What countries...    [+] │ │ │
│                              │  └────────────────────────────┘ │ │
│                              └────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  "SUPPORT"                   │
│  "Questions & Answers"       │
│                              │
│  ┌─ 01 ────────────────────┐│
│  │  Is my money safe?  [-] ││
│  │  Answer text...          ││
│  └──────────────────────────┘│
│  ┌─ 02 ────────────────────┐│
│  │  What if no match?  [+] ││
│  └──────────────────────────┘│
│  ...                         │
│                              │
│  "Still have a question?"    │
│  [ Contact Us → ]            │
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Section bg** | `#FAFAFA` (warm off-white, light editorial feel) |
| **Overline** | `text-brand-teal`, `text-xs`, `tracking-[0.25em]`, `uppercase`, `font-bold` |
| **Heading main** | `text-brand-blue`, `text-4xl lg:text-5xl`, `font-bold`, `tracking-tight` |
| **Heading accent** | `text-brand-blue/40`, `font-light` |
| **Counter number** | `text-brand-teal`, `text-5xl`, `font-bold`, `tabular-nums` |
| **Counter label** | `text-brand-blue/40`, `text-sm`, `font-light` |
| **Item number** | `text-brand-teal/40`, `text-xs`, `font-mono`, `tabular-nums` |
| **Question text (closed)** | `text-brand-blue`, `text-base lg:text-lg`, `font-medium` |
| **Question text (open)** | `text-brand-blue`, same size, `font-semibold` |
| **Answer text** | `text-brand-blue/60`, `text-sm lg:text-base`, `font-light`, `leading-relaxed` |
| **Item border** | `border-b border-zinc-200` (single bottom border per item, minimal) |
| **Toggle icon (closed)** | `text-brand-blue/30`, Plus icon |
| **Toggle icon (open)** | `text-brand-teal`, Minus icon, rotated via GSAP |
| **Contact CTA** | `text-brand-teal`, `text-sm`, `font-semibold`, with arrow, underline on hover |

---

## Data Model Update

**File:** `src/data/constants.ts`

Expand from 3 to 5+ FAQs for visual substance:

```ts
export const faqData: FAQEntry[] = [
  {
    q: 'Is my money safe?',
    a: 'Yes, all transactions are protected through our distributed digital escrow. Funds are never moved until verification is cryptographically confirmed by both parties.',
  },
  {
    q: 'What if no match is found?',
    a: 'Your request stays in our prioritized queue. For urgent transactions, FlowX can fulfill needs using platform liquidity reserves to ensure timely delivery.',
  },
  {
    q: 'Can I cancel a transfer?',
    a: 'Transfers can be cancelled at any point before local payment is confirmed by the matching party. Once both sides confirm, the escrow settlement is final.',
  },
  {
    q: 'How long does a transfer take?',
    a: 'Most transfers complete in under 15 minutes. The matching engine typically finds a pair within 30 seconds, and local payments are processed through instant settlement rails.',
  },
  {
    q: 'What countries are supported?',
    a: 'FlowX currently supports corridors between Palestine, Egypt, Turkey, and Jordan, with more regions being added quarterly based on demand and regulatory approval.',
  },
];
```

---

## Refined FAQ Item Component

Replace the current `FAQItem` with a cleaner, numbered design using border separators instead of filled backgrounds:

```tsx
interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ question, answer, index, isOpen, onToggle }: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current || !innerRef.current) return;

    gsap.killTweensOf([contentRef.current, innerRef.current]);

    if (isOpen) {
      // Icon rotates to X
      gsap.to(iconRef.current, {
        rotation: 180, duration: 0.3, ease: 'power2.out',
      });

      gsap.set(contentRef.current, { display: 'block' });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(contentRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.45 },
      );
      tl.fromTo(innerRef.current,
        { y: -8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        '-=0.2',
      );
    } else {
      gsap.to(iconRef.current, {
        rotation: 0, duration: 0.3, ease: 'power2.in',
      });

      const tl = gsap.timeline({
        onComplete: () => {
          if (contentRef.current) gsap.set(contentRef.current, { display: 'none' });
        },
      });
      tl.to(innerRef.current, { y: -6, opacity: 0, duration: 0.2, ease: 'power2.in' });
      tl.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.inOut' }, '-=0.1');
    }
  }, { dependencies: [isOpen] });

  return (
    <div
      className="border-b border-zinc-200 last:border-b-0"
      data-faq-item
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full py-6 flex items-start gap-4 text-left group"
      >
        {/* Number */}
        <span className="text-brand-teal/40 text-xs font-mono tabular-nums pt-1 shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Question */}
        <h4 className={`flex-1 text-base lg:text-lg transition-colors duration-200 ${
          isOpen ? 'text-brand-blue font-semibold' : 'text-brand-blue font-medium group-hover:text-brand-teal'
        }`}>
          {question}
        </h4>

        {/* Toggle icon */}
        <div
          ref={iconRef}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
            isOpen ? 'bg-brand-teal/10 text-brand-teal' : 'bg-zinc-100 text-brand-blue/30 group-hover:bg-brand-teal/10 group-hover:text-brand-teal'
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      {/* Collapsible answer */}
      <div
        ref={contentRef}
        style={{ height: 0, opacity: 0, display: 'none', overflow: 'hidden' }}
      >
        <div ref={innerRef} className="pl-10 pb-6 pr-12 text-brand-blue/60 font-light leading-relaxed text-sm lg:text-base max-w-[60ch]">
          {answer}
        </div>
      </div>
    </div>
  );
}
```

---

## Left Panel — Sticky Sidebar

```tsx
<div className="lg:sticky lg:top-32 self-start">
  {/* Overline */}
  <span ref={overlineRef} className="text-brand-teal text-xs tracking-[0.25em] uppercase font-bold block mb-4">
    Support
  </span>

  {/* Heading */}
  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-brand-blue mb-2">
    {renderWords('Questions', 'text-brand-blue', addHeadingRef)}
  </h2>
  <h2 className="text-4xl lg:text-5xl font-light tracking-tight text-brand-blue/40 mb-10">
    {renderWords('& Answers', 'text-brand-blue/40', addHeadingRef)}
  </h2>

  {/* Counter */}
  <div className="flex items-baseline gap-3 mb-8" data-counter>
    <span className="text-5xl font-bold text-brand-teal tabular-nums">
      {String(faqData.length).padStart(2, '0')}
    </span>
    <span className="text-sm text-brand-blue/40 font-light">
      questions<br />answered
    </span>
  </div>

  {/* Accent line */}
  <div className="w-12 h-[2px] bg-brand-teal mb-8" data-accent-line />

  {/* Support CTA */}
  <div data-support-cta>
    <p className="text-brand-blue/50 text-sm font-light mb-3">
      Still have a question?
    </p>
    <a
      href="#contact"
      className="inline-flex items-center gap-2 text-brand-teal text-sm font-semibold group"
    >
      Contact Us
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </a>
  </div>
</div>
```

---

## GSAP Animation Blueprint

### Section Entry (ScrollTrigger)

```tsx
const sectionRef = useRef<HTMLElement>(null);
const overlineRef = useRef<HTMLSpanElement>(null);
const headingWordsRef = useRef<HTMLSpanElement[]>([]);
const faqItemsRef = useRef<HTMLDivElement[]>([]);

useGSAP(() => {
  const section = sectionRef.current;
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
  });

  // Beat 1: Overline
  tl.from(overlineRef.current, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  });

  // Beat 2: Heading words kinetic reveal
  tl.from(headingWordsRef.current, {
    y: 40, opacity: 0, rotateX: 30,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.06,
  }, '-=0.2');

  // Beat 3: Counter number
  const counter = section.querySelector('[data-counter]');
  tl.from(counter, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  }, '-=0.3');

  // Beat 4: Accent line draws
  const accentLine = section.querySelector('[data-accent-line]');
  tl.from(accentLine, {
    width: 0, duration: 0.4, ease: 'power2.out',
  }, '-=0.2');

  // Beat 5: Support CTA
  const supportCta = section.querySelector('[data-support-cta]');
  tl.from(supportCta, {
    y: 15, opacity: 0, duration: 0.4, ease: 'power2.out',
  }, '-=0.2');

  // Beat 6: FAQ items stagger in from right
  const faqItems = section.querySelectorAll('[data-faq-item]');
  tl.from(faqItems, {
    x: 30, opacity: 0, duration: 0.5,
    ease: 'power2.out', stagger: 0.08,
  }, '-=0.4');

}, { scope: sectionRef });
```

---

## Implementation Phases

### Phase 1: Section Container & Layout

**File:** `src/components/sections/FAQSection.tsx`

1. Replace centered narrow layout with two-column split: left 35% / right 60%
2. Set section bg to `#FAFAFA`
3. Left panel gets `lg:sticky lg:top-32`
4. Set up all refs

```tsx
<section ref={sectionRef} id="faq" className="py-32 bg-[#FAFAFA]">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-[35%_1fr] gap-16 lg:gap-24">
      {/* Left: sticky sidebar */}
      {/* Right: accordion */}
    </div>
  </div>
</section>
```

### Phase 2: Data Update

**File:** `src/data/constants.ts`

1. Add 2 more FAQ entries (5 total minimum) for visual substance
2. Keep existing `FAQEntry` interface (no changes needed)

### Phase 3: Left Sidebar

1. Overline "SUPPORT" in teal
2. Kinetic heading: "Questions" (bold) + "& Answers" (light, muted)
3. Counter showing total FAQ count with `tabular-nums`
4. Accent line (teal, 48px)
5. "Still have a question?" + Contact CTA with arrow

### Phase 4: Refined Accordion Items

1. Create `FAQAccordionItem` — replaces existing `FAQItem` or update in-place
2. Numbered items (`01`, `02`, ...) with mono font
3. Border-bottom separators instead of filled card backgrounds
4. GSAP expand/collapse with icon rotation
5. Hover: question text shifts to teal, icon bg highlights

### Phase 5: GSAP Section Entry

1. Wire up `useGSAP` with `ScrollTrigger`
2. 6-beat sequence: overline → heading → counter → accent line → CTA → FAQ items stagger
3. `toggleActions: 'play none none reverse'`

### Phase 6: Accordion GSAP Animations

1. Refine the existing `useGSAP` expand/collapse in FAQItem
2. Add icon rotation tween (0° → 180° on open)
3. Ensure `gsap.killTweensOf` prevents race conditions
4. `height: 0 → auto` with `power3.out` ease

### Phase 7: Mobile Adaptation

On `< 1024px`:
- Single column stack: heading block on top, accordion below
- Left sidebar loses `sticky`, renders as normal flow
- Counter + CTA move below heading, above accordion
- All spacing tightens

### Phase 8: Reduced Motion & Accessibility

- `prefers-reduced-motion`: instant expand/collapse, no section entry animation
- `aria-expanded` on each toggle button
- Keyboard: `Enter`/`Space` toggles items
- Focus ring visible on toggle buttons
- Semantic structure with proper heading hierarchy

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Add 2 more FAQ entries for visual substance |
| `src/components/sections/FAQSection.tsx` | Full rewrite — two-column split layout, sticky left sidebar, GSAP useGSAP ScrollTrigger entry, kinetic heading, counter |
| `src/components/ui/FAQItem.tsx` | Refine — numbered items, border separators, icon rotation, hover states (or replace with inline `FAQAccordionItem`) |

---

## Responsive Breakpoints

| Breakpoint | Layout | Heading Size |
|---|---|---|
| `≥ 1024px` (lg) | Two-column split, left sticky | `text-5xl` |
| `≥ 768px` (md) | Single column, heading above accordion | `text-4xl` |
| `< 768px` (sm) | Single column, tighter spacing | `text-3xl` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Accordion height animation | GSAP `height: auto` is computed once; no forced reflows during animation |
| `killTweensOf` on rapid toggles | Prevents orphan tweens from stacking |
| Sticky sidebar | Uses CSS `position: sticky`, no JS scroll listener |
| Section entry | Single timeline, lightweight `from` tweens |
| `will-change` | Not needed — transforms are brief and one-shot |
| ScrollTrigger cleanup | `useGSAP` with `scope` auto-cleans on unmount |

---

## Testing Criteria

- [ ] Section bg is warm off-white `#FAFAFA`
- [ ] Left sidebar is sticky on desktop (stays visible while scrolling accordion)
- [ ] Overline "SUPPORT" fades up in teal
- [ ] Heading words stagger in with kinetic 3D reveal
- [ ] Counter displays correct FAQ count (`05`) with bold teal styling
- [ ] Accent line draws from left
- [ ] "Contact Us" CTA arrow shifts right on hover
- [ ] FAQ items stagger in from right on scroll
- [ ] Each FAQ item shows a two-digit number (`01`, `02`, etc.)
- [ ] Clicking a question smoothly expands the answer with GSAP `height: auto`
- [ ] Toggle icon rotates on open, rotates back on close
- [ ] Only one FAQ can be open at a time (existing behavior preserved)
- [ ] Question text shifts to `font-semibold` when open
- [ ] Question text shifts to teal on hover when closed
- [ ] Scrolling back up reverses section entry animation
- [ ] On mobile (< 1024px), layout stacks to single column
- [ ] Sidebar is no longer sticky on mobile
- [ ] `aria-expanded` correctly reflects open/close state
- [ ] `prefers-reduced-motion` disables all animations
- [ ] No layout shift during accordion expand/collapse
- [ ] Rapid toggling doesn't cause animation glitches
