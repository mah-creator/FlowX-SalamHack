# Footer — Premium Editorial Redesign Plan

## Vision

Elevate the current boxed footer into a **full-bleed dark editorial footer** with a large brand statement, structured multi-column link grid, social icons, a magnetic "back to top" button, and a scroll-triggered entrance animation. The footer should feel like the closing credits of a premium experience — deliberate, spacious, and confident. Inspired by Stripe, Linear, and Vercel footers.

---

## Current State

```
┌──────────────────────────────────────────────────────────────┐
│  Container, py-16, border-t, bg-white                        │
│                                                              │
│  ┌─ zinc-50 card, rounded-2xl ───────────────────────────┐  │
│  │                                                        │  │
│  │  [Logo]           Quick Links       Legal             │  │
│  │  "Cross-border    Problem  Security Privacy           │  │
│  │   transfers..."   Solution Pricing  Terms             │  │
│  │                   Features FAQ      Contact           │  │
│  │                   Case Study        Twitter           │  │
│  │                                                        │  │
│  │  ── border ──────────────────────────────────────────  │  │
│  │  © 2026 flowX                         Back to Top     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Light bg card on white — low contrast, no visual impact
- Basic 3-column grid, functional but uninspired
- No visual flourishes, no social icons (just text links)
- "Back to Top" is a plain text link
- Footer doesn't feel like a deliberate design moment

---

## Target Experience — Dark Editorial Footer

A **full-width dark footer** (`#0a0a0a`) that extends to the edges. A large brand tagline at the top, followed by a 4-column link grid, social icons row, and a bottom bar with copyright + animated back-to-top button.

### Viewport Layout

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│  bg-[#0a0a0a], full-bleed, no container constraints           │
│                                                                │
│  ┌─ Top: Brand Statement ──────────────────────────────────┐  │
│  │                                                          │  │
│  │  [FlowX Logo]                                           │  │
│  │                                                          │  │
│  │  "Move Money Without"                                    │  │
│  │  "Borders."  (large, light)                             │  │
│  │                                                          │  │
│  │  "Cross-border transfers made faster, cheaper,          │  │
│  │   and reliable for constrained regions."                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ── thin separator line ──────────────────────────────────    │
│                                                                │
│  ┌─ Link Grid (4 columns) ─────────────────────────────────┐  │
│  │                                                          │  │
│  │  PRODUCT        COMPANY       RESOURCES      CONNECT    │  │
│  │  Problem        About         Documentation  Twitter    │  │
│  │  Solution       Careers       API Reference  LinkedIn   │  │
│  │  Features       Press         Help Center    GitHub     │  │
│  │  Pricing        Blog                         Email      │  │
│  │  Case Study                                             │  │
│  │  Security                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ── thin separator line ──────────────────────────────────    │
│                                                                │
│  ┌─ Bottom Bar ────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  © 2026 FlowX. All rights reserved.     [↑ Back to Top]│  │
│  │  Privacy · Terms · Contact                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  [FlowX Logo]                │
│                              │
│  "Move Money Without"        │
│  "Borders."                  │
│                              │
│  Description text...         │
│                              │
│  ── separator ──             │
│                              │
│  PRODUCT     COMPANY         │
│  Problem     About           │
│  Solution    Careers         │
│  ...         ...             │
│                              │
│  RESOURCES   CONNECT         │
│  Docs        Twitter         │
│  API         LinkedIn        │
│  ...         ...             │
│                              │
│  ── separator ──             │
│                              │
│  © 2026 FlowX               │
│  Privacy · Terms · Contact   │
│  [↑ Back to Top]             │
└──────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Footer bg** | `#0a0a0a` (consistent dark theme) |
| **Brand tagline** | `text-white`, `text-4xl lg:text-5xl`, `font-light`, `tracking-tight` |
| **Description** | `text-white/40`, `text-sm`, `font-light`, `leading-relaxed`, `max-w-md` |
| **Column heading** | `text-white/30`, `text-[10px]`, `uppercase`, `tracking-[0.25em]`, `font-bold` |
| **Column link** | `text-white/50`, `text-sm`, `font-light`, hover → `text-white` |
| **Separator lines** | `bg-white/[0.06]`, `h-px` |
| **Copyright** | `text-white/25`, `text-xs` |
| **Legal links** | `text-white/30`, `text-xs`, hover → `text-white/60` |
| **Back-to-top button** | `border border-white/[0.1]`, `rounded-full`, `text-white/40`, hover → `border-brand-teal text-brand-teal` |
| **Social icons** | `text-white/30`, `w-5 h-5`, hover → `text-white` |

---

## Data Model

**File:** `src/components/layout/Footer.tsx` (inline data — no constants.ts change needed)

```tsx
const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Problem', href: '#problem' },
      { label: 'Solution', href: '#solution' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Case Study', href: '#case-study' },
      { label: 'Security', href: '#security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Twitter', href: '#', icon: 'twitter' },
      { label: 'LinkedIn', href: '#', icon: 'linkedin' },
      { label: 'GitHub', href: '#', icon: 'github' },
      { label: 'Email', href: 'mailto:hello@flowx.com', icon: 'mail' },
    ],
  },
];

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
];
```

---

## Back-to-Top Button — Magnetic + Animated

A circular button with a magnetic hover pull and an arrow that animates upward on hover:

```tsx
function BackToTopButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.15, y: y * 0.15,
      duration: 0.4, ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      x: 0, y: 0,
      duration: 0.6, ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Back to top"
      className="
        w-12 h-12 rounded-full border border-white/[0.1]
        flex items-center justify-center
        text-white/40 hover:text-brand-teal
        hover:border-brand-teal/40
        transition-colors duration-300 group
      "
    >
      <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
    </button>
  );
}
```

---

## GSAP Animation Blueprint

### Footer Entry (ScrollTrigger)

```tsx
const footerRef = useRef<HTMLElement>(null);

useGSAP(() => {
  const footer = footerRef.current;
  if (!footer) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footer,
      start: 'top 85%',
      toggleActions: 'play none none none',  // play once, don't reverse
    },
  });

  // Beat 1: Logo
  const logo = footer.querySelector('[data-footer-logo]');
  tl.from(logo, {
    y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
  });

  // Beat 2: Brand tagline words
  const taglineWords = footer.querySelectorAll('[data-tagline-word]');
  tl.from(taglineWords, {
    y: 30, opacity: 0,
    duration: 0.6, ease: 'power3.out', stagger: 0.06,
  }, '-=0.2');

  // Beat 3: Description
  const desc = footer.querySelector('[data-footer-desc]');
  tl.from(desc, {
    y: 15, opacity: 0, duration: 0.4, ease: 'power2.out',
  }, '-=0.3');

  // Beat 4: Separator line draws
  const separators = footer.querySelectorAll('[data-separator]');
  tl.from(separators[0], {
    scaleX: 0, transformOrigin: 'left center',
    duration: 0.6, ease: 'power2.out',
  }, '-=0.2');

  // Beat 5: Column headings + links stagger
  const columns = footer.querySelectorAll('[data-footer-col]');
  columns.forEach((col, i) => {
    const heading = col.querySelector('[data-col-heading]');
    const links = col.querySelectorAll('[data-col-link]');

    tl.from(heading, {
      y: 10, opacity: 0, duration: 0.3, ease: 'power2.out',
    }, `-=0.${4 - i}`);

    tl.from(links, {
      y: 10, opacity: 0, duration: 0.3,
      ease: 'power2.out', stagger: 0.04,
    }, '-=0.2');
  });

  // Beat 6: Bottom bar
  tl.from(separators[1], {
    scaleX: 0, transformOrigin: 'left center',
    duration: 0.6, ease: 'power2.out',
  }, '-=0.2');

  const bottomBar = footer.querySelector('[data-bottom-bar]');
  tl.from(bottomBar, {
    y: 10, opacity: 0, duration: 0.4, ease: 'power2.out',
  }, '-=0.3');

}, { scope: footerRef });
```

---

## Link Hover Effect

Each link gets a subtle underline-draw effect on hover via CSS:

```css
.footer-link {
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}
```

---

## Implementation Phases

### Phase 1: Full-Bleed Dark Container

**File:** `src/components/layout/Footer.tsx`

1. Remove `Container` wrapper — use raw `<footer>` with inner padding
2. Set `bg-[#0a0a0a]` dark theme, full-width
3. Add inner `max-w-7xl mx-auto px-6` for content containment
4. Set up `footerRef` for GSAP

### Phase 2: Brand Statement Block

1. Logo at top (use existing `<Logo />` — may need a white/inverted variant)
2. Large tagline: "Move Money Without" / "Borders." in `text-5xl font-light`
3. Description paragraph below in `text-white/40`

### Phase 3: Link Grid

1. 4-column grid: Product, Company, Resources, Connect
2. Each column has a heading (`text-[10px] uppercase tracking-[0.25em]`) + stacked links
3. Links use `footer-link` class for underline-draw hover
4. Preserve `handleSmoothScroll` for anchor links

### Phase 4: Social Icons (Connect Column)

1. Inline SVG icons for Twitter, LinkedIn, GitHub, Mail
2. `w-5 h-5`, `text-white/30`, hover → `text-white`
3. Each link has both icon + text label

### Phase 5: Bottom Bar

1. Copyright text (left)
2. Legal links: Privacy · Terms · Contact (center or left)
3. Back-to-top button (right) — magnetic hover, rounded-full

### Phase 6: Back-to-Top Button

1. Create `BackToTopButton` component with GSAP magnetic hover
2. ArrowUp icon with hover translate
3. Elastic snap-back on mouse leave
4. `window.scrollTo({ top: 0, behavior: 'smooth' })` on click

### Phase 7: GSAP Footer Entry

1. Wire up `useGSAP` with `ScrollTrigger`
2. `toggleActions: 'play none none none'` — play once, no reverse (footer is the end)
3. Sequence: logo → tagline words → description → separator → columns stagger → bottom bar

### Phase 8: Separator Lines

1. Two `h-px bg-white/[0.06]` horizontal lines
2. First between brand block and link grid
3. Second between link grid and bottom bar
4. GSAP animates `scaleX: 0 → 1` from left

### Phase 9: Mobile Adaptation

On `< 768px`:
- Link grid becomes 2×2 grid (2 columns, 2 rows)
- Brand tagline scales to `text-3xl`
- Bottom bar stacks vertically: copyright → legal → back-to-top
- Back-to-top button centers below legal links

### Phase 10: Polish

- Logo may need a white/inverted variant for dark bg
- `prefers-reduced-motion`: disable entrance stagger, show immediately
- All link hover transitions remain CSS-only (no GSAP overhead)
- Ensure keyboard navigation works for all links and back-to-top

---

## Files Changed

| File | Change |
|---|---|
| `src/components/layout/Footer.tsx` | Full rewrite — dark theme, brand statement, 4-col link grid, social icons, magnetic back-to-top, GSAP useGSAP entry |
| `src/components/ui/Logo.tsx` | (Possibly) add inverted/white variant prop for dark backgrounds |
| `src/index.css` | `.footer-link::after` underline-draw hover effect |

---

## Responsive Breakpoints

| Breakpoint | Link Grid | Tagline Size | Bottom Bar |
|---|---|---|---|
| `≥ 1024px` (lg) | 4 columns side-by-side | `text-5xl` | Horizontal: copyright left, back-to-top right |
| `≥ 768px` (md) | 4 columns, tighter gap | `text-4xl` | Horizontal |
| `< 768px` (sm) | 2×2 grid | `text-3xl` | Stacked vertically |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| Footer entry animation | Single timeline, play-once — no ongoing cost |
| Magnetic button hover | Single tween per mousemove, GSAP batches internally |
| Link underline hover | Pure CSS `::after` pseudo-element — zero JS cost |
| Social icons | Inline SVGs, no external requests |
| ScrollTrigger cleanup | `useGSAP` with `scope` auto-cleans on unmount |

---

## Testing Criteria

- [ ] Footer spans full viewport width with dark `#0a0a0a` background
- [ ] Logo renders correctly on dark background (white/inverted variant)
- [ ] Brand tagline "Move Money Without Borders." is large and prominent
- [ ] Description text is readable at `text-white/40`
- [ ] Separator lines draw from left on scroll entry
- [ ] 4 link columns render with correct headings and links
- [ ] Link hover produces underline-draw effect from left
- [ ] Anchor links (Problem, Solution, etc.) smooth-scroll to correct sections
- [ ] Social icons in Connect column are visible and hover to white
- [ ] Back-to-top button has magnetic pull on hover
- [ ] Back-to-top scrolls to top smoothly on click
- [ ] Arrow icon shifts up on button hover
- [ ] Copyright shows current year
- [ ] Legal links (Privacy, Terms, Contact) are present
- [ ] On mobile, link grid becomes 2×2
- [ ] On mobile, bottom bar stacks vertically
- [ ] Footer entry animation plays once (doesn't reverse on scroll-back)
- [ ] `prefers-reduced-motion` skips entrance animation
- [ ] All interactive elements are keyboard accessible
- [ ] Text meets WCAG AA contrast on dark background
