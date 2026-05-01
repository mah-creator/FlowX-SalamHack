# CTA Section — Cinematic Final Act Redesign Plan

## Vision

Transform the current flat teal box with basic text into a **full-bleed cinematic closer** — the grand finale of the landing page. A dark-to-teal gradient section with a massive kinetic headline, an animated particle field, a glowing CTA button with magnetic hover, and subtle trust signals. The section should feel like the climax of a film — everything builds to this single action: **click the button**.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  Container with padding                                      │
│                                                              │
│  ┌─ Teal box, rounded-sm ─────────────────────────────────┐ │
│  │                                                         │ │
│  │  "Start Sending Smarter"  (text-7xl, italic, light)    │ │
│  │  "Join thousands using FlowX..."  (opacity-80)         │ │
│  │  [  Create Your First Transfer  ]  (bg-brand-blue)     │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- Basic teal background box with rounded corners
- Static text, no animations
- Button has no hover effects beyond color change
- No visual drama, feels like an afterthought
- No trust signals or social proof

---

## Target Experience — Grand Finale

A **full-width section** (no container constraints) with a gradient background that transitions from the previous section's dark tone into a rich teal. Centered content with an oversized headline, animated background elements, and a CTA button that demands to be clicked.

### User Flow

```
Scroll ───────────────────────────────────────────────────►
  │
  ├─ Section enters viewport
  │
  ├─ Beat 1: Background gradient sweeps in (dark → teal)
  │
  ├─ Beat 2: Oversized headline reveals word-by-word
  │    "Start Sending Smarter" — massive, cinematic
  │
  ├─ Beat 3: Subtitle fades up
  │
  ├─ Beat 4: CTA button scales in with glow effect
  │    Magnetic hover pulls button toward cursor
  │
  ├─ Beat 5: Trust badges fade in below button
  │    "No fees · Instant matching · Bank-grade security"
  │
  ├─ Beat 6: Ambient particles drift continuously
  │
  └─ Section complete — footer follows
```

### Viewport Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║                                                           ║ │
│  ║     ·  ·     ·        ·    ·      ·   ·    ·             ║ │
│  ║          ·        ·          (floating particles)         ║ │
│  ║                                                           ║ │
│  ║              "Start Sending"                              ║ │
│  ║                 "Smarter"     (text-8xl, bold)            ║ │
│  ║                                                           ║ │
│  ║        "Join thousands using FlowX to bypass             ║ │
│  ║         traditional banking barriers."                    ║ │
│  ║                                                           ║ │
│  ║            ┌──────────────────────────┐                   ║ │
│  ║            │  CREATE YOUR FIRST       │  ← glowing       ║ │
│  ║            │  TRANSFER →              │     button        ║ │
│  ║            └──────────────────────────┘                   ║ │
│  ║                                                           ║ │
│  ║     No fees  ·  Instant matching  ·  Bank-grade security ║ │
│  ║                                                           ║ │
│  ║     ·        ·    ·       ·     ·        ·               ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│                              │
│    "Start Sending"           │
│       "Smarter"              │
│                              │
│  "Join thousands using..."   │
│                              │
│  ┌────────────────────────┐  │
│  │  CREATE YOUR FIRST     │  │
│  │  TRANSFER →            │  │
│  └────────────────────────┘  │
│                              │
│  No fees · Instant · Secure  │
│                              │
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Section bg** | `linear-gradient(180deg, #0a0a0a 0%, #062e35 30%, #0094ac 100%)` — dark to teal gradient |
| **Ambient overlay** | Subtle radial glow at center: `radial-gradient(circle at 50% 50%, rgba(0,148,172,0.15), transparent 60%)` |
| **Heading line 1** | `text-white`, `text-6xl md:text-7xl lg:text-8xl`, `font-bold`, `tracking-tighter` |
| **Heading line 2** | `text-white/80`, same size, `italic`, `font-light` |
| **Subtitle** | `text-white/60`, `text-lg md:text-xl`, `font-light`, `leading-relaxed` |
| **Button bg** | `bg-white`, `text-brand-blue`, with `box-shadow: 0 0 40px rgba(255,255,255,0.15)` glow |
| **Button hover** | Glow intensifies: `box-shadow: 0 0 60px rgba(255,255,255,0.3)`, subtle scale `1.03` |
| **Trust text** | `text-white/40`, `text-xs`, `uppercase`, `tracking-widest` |
| **Trust dot separator** | `text-white/20` |
| **Particles** | `bg-white/[0.06]`, `w-1 h-1` to `w-2 h-2`, `rounded-full` |

---

## CTA Button — Magnetic Hover Effect

The button has a **magnetic pull** — it subtly moves toward the cursor when hovering nearby, creating a premium interactive feel:

```tsx
function MagneticButton({ children }: { children: React.ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0, y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="
        relative px-14 py-6 bg-white text-brand-blue
        font-bold text-xs uppercase tracking-[0.3em]
        rounded-full
        shadow-[0_0_40px_rgba(255,255,255,0.15)]
        hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]
        hover:scale-[1.03]
        transition-shadow transition-transform duration-300
        group
      "
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>

      {/* Glow ring behind button */}
      <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </button>
  );
}
```

---

## Floating Particles

Small dots that drift slowly across the background, creating ambient depth:

```tsx
function FloatingParticles({ count = 20 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = container.querySelectorAll('[data-particle]');
    particles.forEach((p) => {
      gsap.to(p, {
        y: `random(-60, 60)`,
        x: `random(-40, 40)`,
        duration: `random(8, 16)`,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: `random(0, 5)`,
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-particle
          className="absolute rounded-full bg-white/[0.06]"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
```

---

## Trust Badges Row

Subtle trust signals below the CTA button:

```tsx
<div className="flex items-center justify-center gap-6 flex-wrap" data-trust>
  {['No hidden fees', 'Instant matching', 'Bank-grade security'].map((text, i) => (
    <span key={i} className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/60" />
      {text}
    </span>
  ))}
</div>
```

---

## GSAP Animation Blueprint

### Master Timeline (ScrollTrigger)

```tsx
const sectionRef = useRef<HTMLElement>(null);
const headingLine1Ref = useRef<HTMLSpanElement[]>([]);
const headingLine2Ref = useRef<HTMLSpanElement[]>([]);
const subtitleRef = useRef<HTMLParagraphElement>(null);
const buttonRef = useRef<HTMLDivElement>(null);
const trustRef = useRef<HTMLDivElement>(null);

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

  // Beat 1: Heading line 1 — word-by-word kinetic reveal
  tl.from(headingLine1Ref.current, {
    y: 80, opacity: 0, rotateX: 40,
    transformOrigin: 'center bottom',
    duration: 0.7, ease: 'power3.out', stagger: 0.08,
  });

  // Beat 2: Heading line 2 — slight delay, same pattern
  tl.from(headingLine2Ref.current, {
    y: 60, opacity: 0, rotateX: 30,
    transformOrigin: 'center bottom',
    duration: 0.6, ease: 'power3.out', stagger: 0.08,
  }, '-=0.3');

  // Beat 3: Subtitle fades up
  tl.from(subtitleRef.current, {
    y: 30, opacity: 0, duration: 0.6, ease: 'power2.out',
  }, '-=0.2');

  // Beat 4: CTA button scales in with glow
  tl.from(buttonRef.current, {
    y: 30, opacity: 0, scale: 0.9,
    duration: 0.7, ease: 'back.out(1.5)',
  }, '-=0.2');

  // Beat 5: Trust badges stagger in
  const trustItems = section.querySelectorAll('[data-trust] > span');
  tl.from(trustItems, {
    y: 15, opacity: 0, duration: 0.4,
    ease: 'power2.out', stagger: 0.08,
  }, '-=0.3');

}, { scope: sectionRef });
```

---

## Implementation Phases

### Phase 1: Section Container & Gradient Background

**File:** `src/components/sections/CTASection.tsx`

1. Remove `Container` wrapper — make section full-bleed
2. Apply dark-to-teal gradient background
3. Add centered ambient radial glow overlay
4. Set `min-h-[80vh]` for cinematic vertical presence
5. Center all content with flexbox

```tsx
<section
  ref={sectionRef}
  id="cta"
  className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
  style={{
    background: 'linear-gradient(180deg, #0a0a0a 0%, #062e35 30%, #0094ac 100%)',
  }}
>
  {/* Ambient glow */}
  <div className="absolute inset-0 pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 50% 50%, rgba(0,148,172,0.15), transparent 60%)',
    }}
  />

  {/* Particles */}
  <FloatingParticles />

  {/* Content */}
  <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
    {/* Heading, subtitle, button, trust */}
  </div>
</section>
```

### Phase 2: Kinetic Headline

1. Split "Start Sending" into kinetic word spans (line 1, bold)
2. Split "Smarter" as line 2 (italic, lighter opacity)
3. Wire both line refs for GSAP stagger

### Phase 3: Subtitle

1. Descriptive paragraph below heading
2. `text-white/60`, `font-light`, `max-w-xl mx-auto`

### Phase 4: Magnetic CTA Button

1. Create `MagneticButton` component with GSAP magnetic hover
2. White bg, dark text, rounded-full, glow shadow
3. Arrow icon with hover translate
4. Elastic snap-back on mouse leave

### Phase 5: Trust Badges

1. Row of 3 trust signals below the button
2. Teal dot + uppercase text, staggered reveal

### Phase 6: Floating Particles

1. Create `FloatingParticles` component
2. ~20 small dots with randomized positions
3. Continuous drift via GSAP `yoyo` tweens
4. `pointer-events: none`, contained within section

### Phase 7: GSAP Master Timeline

1. Wire up `useGSAP` with `ScrollTrigger`
2. 5-beat sequence: heading L1 → heading L2 → subtitle → button → trust
3. `toggleActions: 'play none none reverse'`

### Phase 8: Mobile Adaptation

On `< 768px`:
- Heading scales down to `text-5xl`
- Button remains full interactive (magnetic hover works on touch too or is disabled)
- Particles reduced to ~10 for performance
- `min-h-[60vh]` on mobile
- Trust badges wrap to multiple lines if needed

### Phase 9: Reduced Motion & Polish

- `prefers-reduced-motion`: disable particles, kinetic heading, use simple fade-in
- Disable magnetic hover (use standard hover state)
- Ensure button focus state is clearly visible (white outline ring)
- Add `aria-label` to the CTA button

---

## Files Changed

| File | Change |
|---|---|
| `src/components/sections/CTASection.tsx` | Full rewrite — gradient bg, kinetic headline, magnetic CTA button, floating particles, trust badges, GSAP useGSAP ScrollTrigger timeline |
| `src/index.css` | (Optional) particle keyframes fallback if needed |

---

## Responsive Breakpoints

| Breakpoint | Heading Size | Min Height | Particle Count |
|---|---|---|---|
| `≥ 1024px` (lg) | `text-8xl` / `text-7xl` | `min-h-[80vh]` | 20 |
| `≥ 768px` (md) | `text-7xl` / `text-6xl` | `min-h-[70vh]` | 15 |
| `< 768px` (sm) | `text-5xl` / `text-4xl` | `min-h-[60vh]` | 10 |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Floating particles (20 tweens) | Each particle uses GPU-composited `transform` only; small element count |
| Magnetic button | Single tween per mousemove, throttled by GSAP's internal batching |
| Gradient background | Static CSS gradient, no JS computation |
| `will-change` | Applied only during scroll animation, cleared after |
| Particles on mobile | Count reduced to 10 on `< 768px` |
| ScrollTrigger cleanup | `useGSAP` with `scope` handles automatic cleanup on unmount |
| Particle cleanup | All `repeat: -1` tweens killed on unmount via `useGSAP` scope |

---

## Testing Criteria

- [ ] Section spans full viewport width (no container constraints)
- [ ] Background gradient transitions smoothly from dark to teal
- [ ] Ambient radial glow is visible behind content
- [ ] Heading line 1 ("Start Sending") reveals word-by-word with 3D rotateX
- [ ] Heading line 2 ("Smarter") reveals with slight delay, italic style
- [ ] Subtitle fades up after heading
- [ ] CTA button scales in with `back.out` ease and visible glow
- [ ] Hovering the CTA button produces magnetic pull toward cursor
- [ ] Mouse leave snaps button back with elastic ease
- [ ] Button glow intensifies on hover
- [ ] Arrow icon shifts right on button hover
- [ ] Trust badges stagger in below the button
- [ ] Floating particles drift slowly across background
- [ ] Particles do not interfere with click/hover events (`pointer-events: none`)
- [ ] Scrolling back up reverses scroll-triggered animations
- [ ] On mobile, heading scales down appropriately
- [ ] On mobile, particle count is reduced
- [ ] Button has visible focus state for keyboard navigation
- [ ] `prefers-reduced-motion` disables particles and kinetic reveals
- [ ] No layout shift during animations
- [ ] Section feels like the climactic finale of the page
