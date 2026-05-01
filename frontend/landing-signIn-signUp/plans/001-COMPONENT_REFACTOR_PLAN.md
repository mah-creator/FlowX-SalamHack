# FlowX Landing Page — Component Refactor Plan

> **Goal:** Break the monolithic `src/App.tsx` (543 lines, 10+ sections) into focused, reusable components following React + Vite best practices.

---

## 1. Why Refactor?

| Problem today | Impact |
|---|---|
| All logic + markup in one 543-line file | Hard to navigate, modify, or test individual sections |
| Inline data arrays scattered through JSX | No single source of truth; duplication risk |
| Shared UI patterns repeated (section headings, card shells) | Inconsistent styling drift over time |
| State + side-effects mixed with render | Hard to unit-test or reuse logic |
| No separation between layout, sections, and primitives | Every change risks breaking unrelated parts |

---

## 2. Proposed Directory Structure

```
src/
├── main.tsx                    # Entry point (no changes needed)
├── index.css                   # Global styles & Tailwind theme (no changes)
├── App.tsx                     # Slim orchestrator — imports sections, renders layout
│
├── data/
│   └── constants.ts            # All static data arrays (logos, navLinks, heroCards, faqData, etc.)
│
├── hooks/
│   ├── useLenis.ts             # Lenis smooth scroll setup
│   └── useCyclingIndex.ts      # Auto-cycling index (used by HeroCard carousel)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── MobileMenu.tsx      # Animated full-screen mobile menu overlay
│   │   └── Footer.tsx          # Site footer
│   │
│   ├── sections/
│   │   ├── HeroSection.tsx     # Hero heading + CTA
│   │   ├── MarqueeStrip.tsx    # Dual marquee logos + cycling feature card
│   │   ├── ProblemSection.tsx  # "Cross-Border Transfers Are Broken" cards
│   │   ├── SolutionSection.tsx # 4-step process with connector line
│   │   ├── FeaturesSection.tsx # 6-feature grid
│   │   ├── CaseStudySection.tsx # Gaza ↔ Egypt animated use case
│   │   ├── SecuritySection.tsx  # Trust pillars + placeholder visual
│   │   ├── DemoSection.tsx      # Transaction status tracker UI
│   │   ├── PricingSection.tsx   # Fee info block
│   │   ├── FAQSection.tsx       # Accordion FAQ
│   │   └── CTASection.tsx       # Final teal CTA banner
│   │
│   └── ui/
│       ├── Logo.tsx             # FlowX <Zap> + wordmark (used in Navbar, MobileMenu, Footer)
│       ├── SectionHeading.tsx   # Reusable h2 with teal italic accent
│       ├── AnimatedCard.tsx     # motion.div card shell (used in Problem, Features)
│       └── FAQItem.tsx          # Single FAQ accordion item
```

---

## 3. File-by-File Breakdown

### 3.1 `src/data/constants.ts`

Extract **all static data** from `App.tsx` into a typed constants file. This is the single source of truth.

```ts
// src/data/constants.ts

export const logos = [
  'STRIPE', 'REVOLUT', 'WISE', 'COINBASE',
  'PLAIDS', 'N26', 'KLARNA', 'ADVYEN',
  'CHIME', 'MONZO', 'NU BANK', 'BLOCK',
];

export interface HeroCard {
  title: string;
  desc: string;
  img: string;
}
export const heroCards: HeroCard[] = [ /* ... */ ];

export interface NavLink {
  name: string;
  href: string;
}
export const navLinks: NavLink[] = [ /* ... */ ];

export interface FAQEntry {
  q: string;
  a: string;
}
export const faqData: FAQEntry[] = [ /* ... */ ];

export const problemItems  = [ /* ... */ ];
export const solutionSteps = [ /* ... */ ];
export const features      = [ /* ... */ ];
export const securityPillars = [ /* ... */ ];
export const demoStatuses  = [ /* ... */ ];
```

> **Best practice:** TypeScript interfaces for each data shape prevent typos and enable autocomplete across every component that imports them.

---

### 3.2 `src/hooks/useLenis.ts`

```ts
import { useEffect } from 'react';
import Lenis from 'lenis';

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}
```

### 3.3 `src/hooks/useCyclingIndex.ts`

```ts
import { useState, useEffect } from 'react';

export function useCyclingIndex(length: number, intervalMs = 4000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);
  return index;
}
```

---

### 3.4 `src/components/ui/Logo.tsx`

Currently duplicated in **Navbar**, **MobileMenu**, and **Footer**. Extract to one source.

```tsx
import { Zap } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Zap className="w-5 h-5 text-brand-teal" />
      <span className="text-lg font-semibold tracking-tight">flowX</span>
    </div>
  );
}
```

### 3.5 `src/components/ui/SectionHeading.tsx`

The `h2` + teal italic accent pattern is repeated in **every** section.

```tsx
interface SectionHeadingProps {
  main: string;
  accent: string;
  center?: boolean;
  className?: string;
}

export function SectionHeading({ main, accent, center, className }: SectionHeadingProps) {
  return (
    <h2 className={`text-4xl md:text-5xl font-light tracking-tighter mb-16
      ${center ? 'text-center' : ''} ${className ?? ''}`}>
      {main} <br />
      <span className="text-brand-teal italic">{accent}</span>
    </h2>
  );
}
```

### 3.6 `src/components/ui/AnimatedCard.tsx`

The staggered `whileInView` pattern is shared by **ProblemSection** and **FeaturesSection**.

```tsx
import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ index, children, className }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 3.7 `src/components/ui/FAQItem.tsx`

Encapsulates the accordion toggle display. Receives `isOpen` and `onToggle` from its parent `FAQSection`.

```tsx
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full px-8 py-6 flex justify-between items-center text-left
          transition-all duration-300
          ${isOpen
            ? 'bg-brand-blue text-white rounded-t-[2rem]'
            : 'bg-zinc-50 text-brand-blue rounded-full border border-zinc-100 hover:border-brand-teal'
          }`}
      >
        <h4 className="text-base md:text-lg font-medium">{question}</h4>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
          ${isOpen ? 'bg-white/10' : 'bg-brand-teal/10'}`}>
          {isOpen
            ? <Minus className="w-4 h-4 text-white" />
            : <Plus className="w-4 h-4 text-brand-teal" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden bg-brand-blue text-white rounded-b-[2rem]"
          >
            <div className="px-10 pb-8 pt-2 text-white/70 font-light leading-relaxed text-sm md:text-base">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### 3.8 Layout Components

#### `src/components/layout/Navbar.tsx`
- Imports `navLinks` from `../../data/constants`
- Accepts `onOpenMenu: () => void` prop
- Renders desktop links, CTA buttons, and mobile menu trigger
- Uses `<Logo />`

#### `src/components/layout/MobileMenu.tsx`
- Accepts `isOpen: boolean` and `onClose: () => void`
- Owns the `AnimatePresence` overlay
- Uses `<Logo />`
- Imports `navLinks` from constants

#### `src/components/layout/Footer.tsx`
- Pure presentational, no props needed
- Uses `<Logo />`

---

### 3.9 Section Components — Responsibility Map

| Component | App.tsx lines | Local state? | Key dependencies |
|---|---|---|---|
| `HeroSection` | 172–203 | No | `motion/react` |
| `MarqueeStrip` | 205–261 | `useCyclingIndex` hook | `react-fast-marquee`, `heroCards` |
| `ProblemSection` | 264–296 | No | `AnimatedCard`, `SectionHeading`, `problemItems` |
| `SolutionSection` | 298–324 | No | `SectionHeading`, `solutionSteps` |
| `FeaturesSection` | 326–348 | No | `SectionHeading`, `features` |
| `CaseStudySection` | 350–400 | No | `motion/react`, `Zap` |
| `SecuritySection` | 402–435 | No | `SectionHeading`, `securityPillars`, `Zap` |
| `DemoSection` | 437–462 | No | `SectionHeading`, `demoStatuses` |
| `PricingSection` | 464–476 | No | `SectionHeading` |
| `FAQSection` | 478–511 | `activeFaqIndex` (number\|null) | `FAQItem`, `faqData` |
| `CTASection` | 513–522 | No | — |

---

### 3.10 Slim `App.tsx` After Refactor (~40 lines)

```tsx
import { useState } from 'react';
import { useLenis } from './hooks/useLenis';
import { Navbar } from './components/layout/Navbar';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import {
  HeroSection, MarqueeStrip, ProblemSection, SolutionSection,
  FeaturesSection, CaseStudySection, SecuritySection, DemoSection,
  PricingSection, FAQSection, CTASection
} from './components/sections';

export default function App() {
  useLenis();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-teal/30 relative bg-white text-brand-blue">
      <div className="bg-black min-h-screen lg:h-screen flex flex-col text-white">
        <Navbar onOpenMenu={() => setIsMenuOpen(true)} />
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <HeroSection />
        <MarqueeStrip />
      </div>

      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <CaseStudySection />
      <SecuritySection />
      <DemoSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
```

---

## 4. Migration Steps (Recommended Order)

> Work in small, verifiable commits. The app should compile and run correctly after **each step**.

```
Step 1 — Data layer
  ✦ Create src/data/constants.ts
  ✦ Move all static arrays out of App.tsx; import them back inline first
  ✦ Add TypeScript interfaces for each data shape

Step 2 — Custom hooks
  ✦ Create src/hooks/useLenis.ts
  ✦ Create src/hooks/useCyclingIndex.ts
  ✦ Replace the two useEffect blocks in App.tsx with hook calls

Step 3 — UI primitives
  ✦ Create Logo, SectionHeading, AnimatedCard, FAQItem
  ✦ Replace their first usage in App.tsx to validate they work

Step 4 — Layout components
  ✦ Create Navbar, MobileMenu, Footer
  ✦ Test: mobile menu open/close still works

Step 5 — Sections (easiest → hardest)
  ✦ PricingSection → CTASection → DemoSection
  ✦ ProblemSection → FeaturesSection → SecuritySection
  ✦ SolutionSection → CaseStudySection
  ✦ FAQSection (needs FAQItem + local state management)
  ✦ HeroSection + MarqueeStrip (most complex, do last)

Step 6 — Slim App.tsx
  ✦ App.tsx should be ~40 lines
  ✦ Delete all migrated JSX blocks

Step 7 — Barrel exports & final polish
  ✦ Add src/components/sections/index.ts
  ✦ Add src/components/ui/index.ts
  ✦ Run: npm run lint (tsc --noEmit)
  ✦ Verify all scroll anchor links (#problem, #solution, etc.) still work
```

---

## 5. Best Practices Checklist

- [ ] **Named exports** everywhere in component files (not `export default`) — better refactoring tool support
- [ ] **Co-locate types** with data in `constants.ts` — interfaces live next to the arrays they describe
- [ ] **`viewport={{ once: true }}`** on all `whileInView` animations — already in place, keep it
- [ ] **No prop drilling past 2 levels** — data is imported directly from `constants.ts`, not threaded through `App`
- [ ] **Stable `key` props** — prefer string identifiers (e.g., `item.title`) over array indices where items have natural IDs
- [ ] **`loading="lazy"`** on all images below the fold (HeroCard carousel images, CaseStudy visuals)
- [ ] **Accessibility** — add `aria-expanded` to FAQ buttons; `aria-label` to icon-only buttons (mobile menu trigger, close button)
- [ ] **Section `id` anchors** — each section component renders its own `id` attribute so nav scroll links keep working
- [ ] **CSS stays in `index.css`** — no component-level stylesheets; Tailwind utility classes only
- [ ] **Barrel files** — `sections/index.ts` and `ui/index.ts` for clean, readable imports

---

## 6. Barrel Files

```ts
// src/components/sections/index.ts
export { HeroSection }      from './HeroSection';
export { MarqueeStrip }     from './MarqueeStrip';
export { ProblemSection }   from './ProblemSection';
export { SolutionSection }  from './SolutionSection';
export { FeaturesSection }  from './FeaturesSection';
export { CaseStudySection } from './CaseStudySection';
export { SecuritySection }  from './SecuritySection';
export { DemoSection }      from './DemoSection';
export { PricingSection }   from './PricingSection';
export { FAQSection }       from './FAQSection';
export { CTASection }       from './CTASection';

// src/components/ui/index.ts
export { Logo }            from './Logo';
export { SectionHeading }  from './SectionHeading';
export { AnimatedCard }    from './AnimatedCard';
export { FAQItem }         from './FAQItem';
```

---

## 7. Future-Proofing

| If you add... | Recommended approach |
|---|---|
| A new landing section | New file in `sections/`, data in `constants.ts`, one import in `App.tsx` |
| A second page (`/about`) | Add a router (e.g. React Router); `App.tsx` becomes a layout shell |
| i18n / translations | `constants.ts` exports functions accepting a locale; strings move to `locales/en.ts` |
| CMS-driven content | Replace `constants.ts` exports with React Query hooks fetching from an API |
| Dark mode | Add a `ThemeContext`; apply `dark:` Tailwind variants per component |
| Analytics events | `onClick` handlers in `CTASection` / `Navbar` are now trivially findable and editable |

---

*Generated: 2026-04-29 | FlowX Landing Page — src/App.tsx analysis*
