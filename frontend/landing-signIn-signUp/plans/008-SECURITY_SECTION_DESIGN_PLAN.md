# Security Section — Fortress Shield Redesign Plan

## Vision

Transform the current flat 2×2 text grid + placeholder visual into a **dark, immersive security fortress experience** — a full-width cinematic section with an animated SVG shield at its center, surrounded by 4 orbiting security pillars that reveal on scroll. Concentric animated rings, subtle particle-like dots, and a glowing core create the feeling of impenetrable protection. The section screams "your money is safe" without saying it.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  bg-white, light theme                                       │
│                                                              │
│  ┌─ Left ──────────────┐  ┌─ Right ─────────────────────┐  │
│  │ "Built on Trust"     │  │  aspect-square box           │  │
│  │ "& Verification"     │  │  ⚡ icon (20% opacity)       │  │
│  │                      │  │  "Unbreakable               │  │
│  │  ┌─────┐ ┌─────┐   │  │   Security Lattice"          │  │
│  │  │ KYC │ │Escrow│   │  │                              │  │
│  │  ├─────┤ ├─────┤   │  │                              │  │
│  │  │Admin│ │Fraud │   │  │                              │  │
│  │  └─────┘ └─────┘   │  │                              │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Static two-column layout with text-only pillar cards
- Right side is an empty placeholder with a Zap icon
- No visual hierarchy, no animations, no depth
- Light bg doesn't convey security/seriousness

---

## Target Experience — Shield Fortress

A **dark section** (`#0a0a0a`) with a central animated shield graphic. The 4 security pillars orbit around or flank the shield in a diamond/cross layout. The entire composition animates in on scroll with a choreographed GSAP timeline.

### User Flow

```
Scroll ───────────────────────────────────────────────────►
  │
  ├─ Section enters → dark bg
  │
  ├─ Beat 1: Overline + heading kinetic reveal
  │
  ├─ Beat 2: Central shield SVG draws in
  │    Concentric rings expand outward, core glows
  │
  ├─ Beat 3: 4 pillar cards reveal around the shield
  │    Staggered from center outward, each with icon + text
  │
  ├─ Beat 4: Connecting lines draw from shield to each pillar
  │    Dashed → solid, teal pulse along each line
  │
  ├─ Beat 5: Subtle particle dots fade in across background
  │    Slow drift animation (continuous, not scroll-bound)
  │
  └─ Section complete
```

### Viewport Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│        "SECURITY"  (overline, teal)                           │
│        "Built on Trust"                                        │
│        "& Verification"  (muted)                              │
│                                                                │
│                   ┌─ Pillar 1 ──┐                             │
│                   │  🔐 Identity │                             │
│                   │  Verification│                             │
│                   └──────────────┘                             │
│                         │                                      │
│   ┌─ Pillar 3 ──┐    ┌─┴──┐    ┌─ Pillar 2 ──┐              │
│   │  👁 Admin    │────│🛡️  │────│  🔒 Escrow   │              │
│   │  Review      │    │CORE│    │  Protection  │              │
│   └──────────────┘    └─┬──┘    └──────────────┘              │
│                         │                                      │
│                   ┌─ Pillar 4 ──┐                             │
│                   │  📡 Fraud    │                             │
│                   │  Detection   │                             │
│                   └──────────────┘                             │
│                                                                │
│   ── bottom accent line ──────────────────────────────────    │
│   "Every layer designed to protect your transaction."         │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  "SECURITY"                  │
│  "Built on Trust"            │
│  "& Verification"            │
│                              │
│       ┌──────────┐          │
│       │  🛡️ CORE  │          │
│       │  shield   │          │
│       └──────────┘          │
│                              │
│  ┌─ Pillar 1 ──────────────┐│
│  │ 🔐 Identity Verification ││
│  └──────────────────────────┘│
│  ┌─ Pillar 2 ──────────────┐│
│  │ 🔒 Escrow Protection     ││
│  └──────────────────────────┘│
│  ┌─ Pillar 3 ──────────────┐│
│  │ 👁 Admin Review          ││
│  └──────────────────────────┘│
│  ┌─ Pillar 4 ──────────────┐│
│  │ 📡 Fraud Detection       ││
│  └──────────────────────────┘│
│                              │
│  "Every layer designed..."   │
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Section bg** | `#0a0a0a` (dark cinematic, consistent with Problem + Case Study sections) |
| **Overline** | `text-brand-teal`, `text-xs`, `tracking-[0.25em]`, `uppercase`, `font-bold` |
| **Heading main** | `text-white`, `text-5xl lg:text-6xl`, `font-bold`, `tracking-tight` |
| **Heading accent** | `text-white/30`, `font-light` |
| **Shield core** | `stroke: brand-teal`, glowing `drop-shadow` in teal, filled `brand-teal/5` |
| **Concentric rings** | `stroke: white/[0.04]` → `white/[0.08]`, animated outward expansion |
| **Pillar card bg** | `bg-white/[0.04]`, `border: 1px solid white/[0.08]`, `backdrop-blur-sm`, `rounded-2xl` |
| **Pillar card hover** | `border-brand-teal/30`, `bg-white/[0.06]` |
| **Pillar icon container** | `w-10 h-10`, `rounded-xl`, `bg-brand-teal/10`, icon in `text-brand-teal` |
| **Pillar title** | `text-white`, `text-sm`, `font-semibold` |
| **Pillar description** | `text-white/50`, `text-xs`, `font-light`, `leading-relaxed` |
| **Connecting lines** | `stroke: brand-teal/20` dashed → `brand-teal/40` solid on reveal |
| **Bottom tagline** | `text-white/30`, `text-sm`, `italic`, `font-light` |

---

## Data Model Update

**File:** `src/data/constants.ts`

Extend `SecurityPillar` with icon identifier and richer description:

```ts
export interface SecurityPillar {
  t: string;
  d: string;
  longDesc: string;        // NEW — expanded text for the redesigned card
  icon: 'identity' | 'escrow' | 'admin' | 'fraud';  // NEW
  position: 'top' | 'right' | 'bottom' | 'left';    // NEW — diamond position
}

export const securityPillars: SecurityPillar[] = [
  {
    t: 'Identity Verification',
    d: 'Strict KYC protocols to ensure every user is legitimate.',
    longDesc:
      'Multi-layer KYC with document verification, liveness detection, and cross-reference checks against global watchlists. Every user is verified before their first transaction.',
    icon: 'identity',
    position: 'top',
  },
  {
    t: 'Escrow Protection',
    d: 'Military-grade encryption for all locked transactions.',
    longDesc:
      'AES-256 encrypted digital escrow locks funds until both parties confirm. No single point of failure — distributed across redundant secure nodes.',
    icon: 'escrow',
    position: 'right',
  },
  {
    t: 'Admin Review',
    d: 'Manual oversight for high-risk or large volume transfers.',
    longDesc:
      'Automated risk scoring flags suspicious patterns. High-value or unusual transfers are escalated to trained review agents before processing.',
    icon: 'admin',
    position: 'left',
  },
  {
    t: 'Fraud Detection',
    d: 'Real-time monitoring of behavioral patterns and trust loops.',
    longDesc:
      'Continuous behavioral analysis monitors velocity, device fingerprints, and network patterns. Anomalies trigger instant holds and user notifications.',
    icon: 'fraud',
    position: 'bottom',
  },
];
```

---

## Central Shield SVG

An animated shield with concentric rings that expand outward on scroll:

```tsx
function ShieldCore() {
  return (
    <div className="relative w-64 h-64 lg:w-80 lg:h-80 mx-auto" data-shield-core>
      <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
        {/* Concentric rings (3 rings, expanding outward) */}
        <circle cx="160" cy="160" r="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" data-ring-3 />
        <circle cx="160" cy="160" r="110" stroke="rgba(255,255,255,0.06)" strokeWidth="1" data-ring-2 />
        <circle cx="160" cy="160" r="70"  stroke="rgba(255,255,255,0.08)" strokeWidth="1" data-ring-1 />

        {/* Shield path (centered) */}
        <path
          d="M160 50 L220 85 L220 160 C220 210 160 260 160 260 C160 260 100 210 100 160 L100 85 Z"
          stroke="#0094ac"
          strokeWidth="2"
          fill="rgba(0,148,172,0.05)"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-shield-outline
          strokeDasharray="500"
          strokeDashoffset="500"
        />

        {/* Checkmark inside shield */}
        <path
          d="M140 160 L155 175 L185 140"
          stroke="#0094ac"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-shield-check
          strokeDasharray="80"
          strokeDashoffset="80"
        />

        {/* Subtle glow behind shield */}
        <circle cx="160" cy="160" r="40" fill="rgba(0,148,172,0.08)" data-shield-glow opacity="0" />
      </svg>
    </div>
  );
}
```

---

## Pillar Card Component

```tsx
interface PillarCardProps {
  pillar: SecurityPillar;
  index: number;
}

function PillarCard({ pillar, index }: PillarCardProps) {
  return (
    <div
      className="
        relative p-6 rounded-2xl border border-white/[0.08]
        bg-white/[0.03] backdrop-blur-sm
        group hover:border-brand-teal/30 hover:bg-white/[0.06]
        transition-colors duration-500 cursor-default
      "
      data-pillar-card
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center mb-4" data-pillar-icon>
        <SecurityIcon type={pillar.icon} />
      </div>

      {/* Title */}
      <h4 className="text-white text-sm font-semibold mb-2 tracking-tight" data-pillar-title>
        {pillar.t}
      </h4>

      {/* Description */}
      <p className="text-white/50 text-xs font-light leading-relaxed" data-pillar-desc>
        {pillar.longDesc}
      </p>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 100% 0%, rgba(0,148,172,0.1), transparent 70%)',
        }}
      />
    </div>
  );
}
```

---

## SVG Security Icons

Minimal 24×24 stroke icons for each pillar:

```tsx
function SecurityIcon({ type }: { type: SecurityPillar['icon'] }) {
  const paths: Record<string, string> = {
    identity: 'M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2m8-4a4 4 0 100-8 4 4 0 000 8m6 4l2 2 4-4',
    escrow:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10',
    admin:    'M1 12s4-8 11-8 7 0 11 8 11 8s-4 8-11 8-11-8-11-8m10-3a3 3 0 100 6 3 3 0 000-6',
    fraud:    'M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 110-20 10 10 0 010 20',
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-brand-teal">
      <path d={paths[type]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

---

## Diamond Layout (Desktop)

The 4 pillars are arranged in a diamond/cross pattern around the central shield on desktop. On mobile they stack vertically.

```tsx
{/* Desktop diamond layout */}
<div className="relative max-w-3xl mx-auto hidden lg:block" data-diamond>
  {/* Center: Shield */}
  <div className="flex justify-center">
    <ShieldCore />
  </div>

  {/* Top pillar */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-64" ref={el => pillarRefs.current[0] = el}>
    <PillarCard pillar={securityPillars[0]} index={0} />
  </div>

  {/* Right pillar */}
  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 w-64" ref={el => pillarRefs.current[1] = el}>
    <PillarCard pillar={securityPillars[1]} index={1} />
  </div>

  {/* Left pillar */}
  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 w-64" ref={el => pillarRefs.current[2] = el}>
    <PillarCard pillar={securityPillars[2]} index={2} />
  </div>

  {/* Bottom pillar */}
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 w-64" ref={el => pillarRefs.current[3] = el}>
    <PillarCard pillar={securityPillars[3]} index={3} />
  </div>
</div>

{/* Mobile stacked layout */}
<div className="lg:hidden space-y-4">
  <div className="flex justify-center mb-8">
    <ShieldCore />
  </div>
  {securityPillars.map((pillar, i) => (
    <div key={pillar.t} ref={el => pillarRefs.current[i] = el}>
      <PillarCard pillar={pillar} index={i} />
    </div>
  ))}
</div>
```

> **Note:** The diamond layout uses absolute positioning within a relatively-positioned container sized to accommodate the shield + pillars. Exact offsets will need tuning during implementation based on card sizes. An alternative approach is a CSS Grid with named areas.

---

## GSAP Animation Blueprint

### Master Timeline (ScrollTrigger)

```tsx
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sectionRef = useRef<HTMLElement>(null);
const overlineRef = useRef<HTMLSpanElement>(null);
const headingWordsRef = useRef<HTMLSpanElement[]>([]);
const shieldRef = useRef<HTMLDivElement>(null);
const pillarRefs = useRef<HTMLDivElement[]>([]);
const taglineRef = useRef<HTMLParagraphElement>(null);

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

  // Beat 1: Overline
  tl.from(overlineRef.current, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  });

  // Beat 2: Heading words kinetic stagger
  tl.from(headingWordsRef.current, {
    y: 50, opacity: 0, rotateX: 35,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.07,
  }, '-=0.2');

  // Beat 3: Concentric rings expand
  const rings = section.querySelectorAll('[data-ring-1], [data-ring-2], [data-ring-3]');
  tl.from(rings, {
    scale: 0, opacity: 0, transformOrigin: 'center center',
    duration: 0.8, ease: 'power2.out', stagger: 0.15,
  }, '-=0.3');

  // Beat 4: Shield outline draws in
  const shieldOutline = section.querySelector('[data-shield-outline]');
  tl.to(shieldOutline, {
    strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut',
  }, '-=0.5');

  // Shield glow fades in
  const shieldGlow = section.querySelector('[data-shield-glow]');
  tl.to(shieldGlow, {
    opacity: 1, duration: 0.5, ease: 'power2.out',
  }, '-=0.6');

  // Beat 5: Checkmark draws in
  const shieldCheck = section.querySelector('[data-shield-check]');
  tl.to(shieldCheck, {
    strokeDashoffset: 0, duration: 0.5, ease: 'power2.out',
  }, '-=0.2');

  // Beat 6: Pillar cards reveal (staggered from center outward)
  tl.from(pillarRefs.current, {
    scale: 0.9, opacity: 0, duration: 0.6,
    ease: 'power3.out', stagger: 0.1,
  }, '-=0.3');

  // Beat 7: Each pillar's inner elements animate
  pillarRefs.current.forEach((card) => {
    if (!card) return;
    const icon = card.querySelector('[data-pillar-icon]');
    const title = card.querySelector('[data-pillar-title]');
    const desc = card.querySelector('[data-pillar-desc]');

    tl.from(icon, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.out(2)' }, '-=0.4')
      .from(title, { y: 10, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2')
      .from(desc, { y: 8, opacity: 0, duration: 0.3, ease: 'power2.out' }, '-=0.2');
  });

  // Beat 8: Bottom tagline
  tl.from(taglineRef.current, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  }, '-=0.2');

  // Continuous: slow ring rotation (not scroll-bound)
  gsap.to(section.querySelector('[data-ring-3]'), {
    rotation: 360, duration: 120, ease: 'none', repeat: -1,
    transformOrigin: 'center center',
  });
  gsap.to(section.querySelector('[data-ring-2]'), {
    rotation: -360, duration: 90, ease: 'none', repeat: -1,
    transformOrigin: 'center center',
  });

}, { scope: sectionRef });
```

---

## Hover Micro-Interactions

Pillar cards get a subtle magnetic tilt on hover (same pattern as ProblemSection):

```tsx
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  gsap.to(card, {
    rotateX: y * -6,
    rotateY: x * 6,
    transformPerspective: 800,
    duration: 0.4,
    ease: 'power2.out',
  });
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  gsap.to(e.currentTarget, {
    rotateX: 0, rotateY: 0,
    duration: 0.6, ease: 'elastic.out(1, 0.5)',
  });
};
```

---

## Background Elements

### Noise/Grain Overlay

Same subtle grain texture used across dark sections:

```css
.security-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* tiny noise SVG */
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}
```

### Ambient Glow

A large, soft radial gradient behind the shield:

```tsx
<div
  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
  style={{
    background: 'radial-gradient(circle, rgba(0,148,172,0.06) 0%, transparent 70%)',
  }}
/>
```

---

## Implementation Phases

### Phase 1: Section Container & Dark Theme

**File:** `src/components/sections/SecuritySection.tsx`

1. Replace `bg-white` with `bg-[#0a0a0a]`
2. Remove `Container` light styling and two-column grid
3. Set up all refs (`sectionRef`, `shieldRef`, `pillarRefs`, etc.)
4. Add noise overlay and ambient glow background elements

### Phase 2: Data Model

**File:** `src/data/constants.ts`

1. Extend `SecurityPillar` with `longDesc`, `icon`, and `position` fields
2. Update existing data with expanded descriptions

### Phase 3: Kinetic Heading

1. Overline "SECURITY" in brand-teal
2. Split "Built on Trust" and "& Verification" into kinetic word spans
3. Wire up `headingWordsRef` for GSAP targeting

### Phase 4: Central Shield SVG

1. Create `ShieldCore` component with concentric rings + shield path + checkmark
2. All paths use `strokeDasharray`/`strokeDashoffset` for draw animations
3. Add inner glow circle (initially hidden)

### Phase 5: Diamond Layout

1. Build the cross/diamond layout with absolute-positioned pillar cards
2. Center the shield, position pillars at top/right/bottom/left
3. Add connecting line SVGs between shield and each pillar (optional enhancement)

### Phase 6: Pillar Cards

1. Create `PillarCard` component with icon, title, longDesc
2. Glassmorphic styling matching CaseStudy/Problem section cards
3. Add hover corner accent gradient

### Phase 7: GSAP Master Timeline

1. Wire up `useGSAP` with `ScrollTrigger`
2. 8-beat sequence: overline → heading → rings → shield draw → checkmark → pillars → inner elements → tagline
3. Add continuous ring rotation (independent of scroll)
4. `toggleActions: 'play none none reverse'`

### Phase 8: Hover Effects

1. Add magnetic tilt on pillar cards via GSAP `rotateX`/`rotateY`
2. Elastic snap-back on mouse leave
3. Border color transition to `brand-teal/30` on hover

### Phase 9: Mobile Adaptation

On `< 1024px`:
- Diamond layout switches to vertical stack
- Shield renders at smaller size centered above cards
- Pillar cards stack full-width with gap
- Connecting lines hidden on mobile
- Hover effects disabled (touch devices)

### Phase 10: Reduced Motion & Polish

- `prefers-reduced-motion`: disable ring rotations, use opacity-only fades
- Clean `will-change` after scroll-triggered animations complete
- Validate WCAG AA contrast for all text on `#0a0a0a`
- Add bottom tagline with subtle left-border draw animation

---

## Files Changed

| File | Change |
|---|---|
| `src/data/constants.ts` | Extend `SecurityPillar` with `longDesc`, `icon`, `position` fields |
| `src/components/sections/SecuritySection.tsx` | Full rewrite — dark theme, shield SVG, diamond layout, GSAP useGSAP ScrollTrigger timeline, pillar cards, hover effects |
| `src/index.css` | (Optional) `.security-section::before` grain texture |

---

## Responsive Breakpoints

| Breakpoint | Layout | Shield Size | Heading Size |
|---|---|---|---|
| `≥ 1024px` (lg) | Diamond cross layout, pillars orbit shield | `w-80 h-80` | `text-6xl` |
| `≥ 768px` (md) | 2×2 grid below shield | `w-64 h-64` | `text-5xl` |
| `< 768px` (sm) | Vertical stack, shield above cards | `w-48 h-48` | `text-4xl` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Continuous ring rotation | Uses `rotation` (GPU-composited transform), not layout-triggering properties |
| SVG stroke draw | Lightweight single-path animations via `strokeDashoffset` |
| Diamond layout positioning | Absolute positioning avoids complex CSS Grid on desktop; simple stack on mobile |
| `will-change` | Applied during scroll animation, cleared after completion |
| Hover tilt | Capped at ±6° to avoid excessive GPU compositing; disabled on touch |
| ScrollTrigger cleanup | `useGSAP` with `scope` handles automatic cleanup on unmount |

---

## Testing Criteria

- [ ] Section background is dark `#0a0a0a` with subtle grain texture
- [ ] Overline "SECURITY" fades up in teal
- [ ] Heading words stagger in with 3D rotateX kinetic reveal
- [ ] Concentric rings expand outward from center with stagger
- [ ] Shield outline draws in via stroke-dashoffset animation
- [ ] Shield inner glow fades in after outline completes
- [ ] Checkmark draws inside the shield
- [ ] 4 pillar cards reveal with staggered scale + opacity
- [ ] Each pillar's icon → title → desc animate in sub-sequence
- [ ] Continuous ring rotation runs smoothly (not scroll-bound)
- [ ] Hovering a pillar card produces subtle 3D tilt (max ±6°)
- [ ] Mouse leave snaps back with elastic ease
- [ ] Card border highlights to `brand-teal/30` on hover
- [ ] Scrolling back up reverses all scroll-triggered animations
- [ ] On mobile (< 1024px), layout switches to vertical stack
- [ ] Shield renders smaller on mobile, centered above cards
- [ ] No layout shift or jank during animations
- [ ] `prefers-reduced-motion` disables transforms and ring rotation
- [ ] All text passes WCAG AA contrast on dark background
- [ ] Bottom tagline fades in as final beat
- [ ] `toggleActions: 'play none none reverse'` works on repeated passes
