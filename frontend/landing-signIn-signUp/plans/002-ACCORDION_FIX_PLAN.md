# Accordion (FAQ) Animation Fix Plan

## Problem Statement

When opening an FAQ item, the animation sequence is broken:
1. The closed item appears as a **capsule** (pill shape via `rounded-full`).
2. On click, a **jarring visual glitch** occurs — the shape morphs weirdly before the content panel expands.
3. The overall open/close transition feels janky instead of smooth.

---

## Root Cause Analysis

There are **three compounding issues** in `src/components/ui/FAQItem.tsx`:

### Bug 1: React Inline Styles Fight GSAP Animations

**Location:** Line 73

```tsx
style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }}
```

**What happens:**
- When `isOpen` becomes `true`, React **immediately** sets `height: auto`, `opacity: 1`, `display: block` on the content wrapper — *before* GSAP gets a chance to run.
- GSAP's `fromTo(contentRef, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1 })` then tries to animate, but the element is already at its final state from React's inline styles.
- This causes a **flash of full content → jump back to 0 → animate to auto** sequence, which is the "weird animation" you see.

> **⚠️ CAUTION:** This is the **primary** cause of the glitch. React's render cycle sets the final values instantly, then GSAP overwrites them back to 0 and tries to animate forward — creating a visible flicker.

### Bug 2: Capsule → Rounded-Top Border-Radius Morph

**Location:** Lines 56–60 (the button's class toggle)

```tsx
className={`... transition-all duration-300 ${
  isOpen
    ? 'bg-brand-blue text-white rounded-t-[2rem]'
    : 'bg-zinc-50 text-brand-blue rounded-full border border-zinc-100 ...'
}`}
```

**What happens:**
- `rounded-full` = `border-radius: 9999px` (a perfect pill/capsule).
- `rounded-t-[2rem]` = `border-radius: 2rem 2rem 0 0`.
- `transition-all duration-300` animates **every** property, including `border-radius`.
- The transition from `9999px → 2rem` on top corners and `9999px → 0` on bottom corners creates a **visible morphing** effect where the shape distorts before settling.

### Bug 3: GSAP Timing — Close Animation Fires on First Render

**Location:** Lines 17–49 (the `useGSAP` hook)

```tsx
useGSAP(() => {
  // ...
  if (isOpen) { /* open animation */ }
  else { /* close animation ← runs on mount! */ }
}, { dependencies: [isOpen] });
```

**What happens:**
- On **initial mount**, `isOpen` is `false`, so the `else` branch runs a close animation on an already-hidden element.
- This is harmless visually but wastes a GSAP tween and can cause race conditions if the user clicks rapidly before mount animations settle.

---

## Fix Plan — Step by Step

### Step 1: Remove Inline Styles from the Content Wrapper

**File:** `src/components/ui/FAQItem.tsx` — Line 73

Let GSAP be the **sole controller** of `height`, `opacity`, and `display`. Remove the React inline styles entirely and set the initial state via GSAP on mount instead.

```diff
  <div
    ref={contentRef}
-   style={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, display: isOpen ? 'block' : 'none' }}
+   style={{ height: 0, opacity: 0, display: 'none', overflow: 'hidden' }}
    className="overflow-hidden bg-brand-blue text-white rounded-b-[2rem]"
  >
```

> **ℹ️ NOTE:** The initial inline style is now static (`height: 0, opacity: 0, display: none`). GSAP will animate away from these values when `isOpen` becomes `true`. No more React vs. GSAP conflict.

---

### Step 2: Guard Against the Initial-Mount Close Animation

**File:** `src/components/ui/FAQItem.tsx` — inside `useGSAP`

Add a ref to track whether the component has completed its first render. Skip the close animation on mount.

```diff
  export function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
+   const hasAnimated = useRef(false);

    useGSAP(() => {
      if (!contentRef.current || !innerRef.current) return;

+     // Skip the close animation on initial mount
+     if (!hasAnimated.current && !isOpen) {
+       hasAnimated.current = true;
+       return;
+     }
+     hasAnimated.current = true;

      gsap.killTweensOf([contentRef.current, innerRef.current]);
      // ... rest of animation logic
    }, { dependencies: [isOpen] });
```

---

### Step 3: Fix the Border-Radius Morphing

**File:** `src/components/ui/FAQItem.tsx` — Lines 56–60

Two options (choose one):

#### Option A — Use a Fixed `rounded-[2rem]` for Both States (Recommended)

This avoids the `9999px → 2rem` morph entirely. The button stays a consistent rounded rectangle.

```diff
  className={`w-full px-8 py-6 flex justify-between items-center text-left transition-all duration-300 ${
    isOpen
-     ? 'bg-brand-blue text-white rounded-t-[2rem]'
-     : 'bg-zinc-50 text-brand-blue rounded-full border border-zinc-100 hover:border-brand-teal'
+     ? 'bg-brand-blue text-white rounded-t-[2rem] rounded-b-none'
+     : 'bg-zinc-50 text-brand-blue rounded-[2rem] border border-zinc-100 hover:border-brand-teal'
  }`}
```

#### Option B — Remove `transition-all`, Transition Only Colors

Keep the capsule look when closed, but don't animate border-radius — snap it instantly.

```diff
  className={`w-full px-8 py-6 flex justify-between items-center text-left
-   transition-all duration-300
+   transition-colors duration-300
    ${
      isOpen
        ? 'bg-brand-blue text-white rounded-t-[2rem]'
        : 'bg-zinc-50 text-brand-blue rounded-full border border-zinc-100 hover:border-brand-teal'
    }`}
```

> **💡 TIP:** **Option A** is recommended — it keeps the design consistent and eliminates the visual shape-shift entirely. The `2rem` radius still looks modern and premium without the jarring capsule morph.

---

### Step 4: Add `overflow: hidden` to the Outer Wrapper

Ensure the content panel never visually overflows the rounded corners during animation.

```diff
- <div className="mb-4">
+ <div className="mb-4 overflow-hidden rounded-[2rem]">
```

> **ℹ️ NOTE:** This wrapper `overflow: hidden` with matching `rounded-[2rem]` clips the content to the rounded shape at all times during animation, preventing any visual overflow bleed.

If you use this approach, you can **remove** `rounded-t-[2rem]` from the button and `rounded-b-[2rem]` from the content panel — the parent handles the rounding.

---

### Step 5: Polish the GSAP Timing

Fine-tune the open animation so the content reveal feels snappy and deliberate:

```tsx
if (isOpen) {
  gsap.set(contentRef.current, { display: 'block' });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.fromTo(contentRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.4 });
  tl.fromTo(innerRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, '-=0.25');
} else {
  const tl = gsap.timeline({
    onComplete: () => {
      if (contentRef.current) gsap.set(contentRef.current, { display: 'none' });
    },
  });
  tl.to(innerRef.current, { y: -6, opacity: 0, duration: 0.2, ease: 'power2.in' });
  tl.to(contentRef.current, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.inOut' }, '-=0.1');
}
```

> **💡 TIP:** Using a GSAP `timeline` instead of individual tweens guarantees sequencing. The overlap (`'-=0.25'`) creates a smooth stagger where the text starts fading in while the container is still expanding.

---

## Summary of Changes

| File | What to Change | Why |
|------|---------------|-----|
| `FAQItem.tsx` L73 | Remove dynamic inline styles → static initial state | Eliminate React vs. GSAP conflict (primary fix) |
| `FAQItem.tsx` L17–49 | Add `hasAnimated` guard ref | Prevent close animation on first mount |
| `FAQItem.tsx` L56–60 | Change `rounded-full` → `rounded-[2rem]` | Eliminate capsule border-radius morph |
| `FAQItem.tsx` L52 | Add `overflow-hidden rounded-[2rem]` to wrapper | Clean clip during animation |
| `FAQItem.tsx` L25–46 | Refactor to GSAP timeline | Tighter sequencing, no overlap bugs |

## Priority Order

1. **Step 1** (inline styles) — fixes the core flicker/flash bug
2. **Step 3** (border-radius) — fixes the capsule morph
3. **Step 2** (mount guard) — prevents edge-case jank
4. **Step 4** (overflow wrapper) — visual polish
5. **Step 5** (timeline) — animation polish
