# Landing Page & Auth Forms Migration Plan

> **Goal**: Replace the existing `frontend/src` landing page and auth forms with the redesigned versions from `frontend/landing-signIn-signUp/`, while preserving all existing API integration, account type selection, and auth features.

---

## Table of Contents

1. [Overview & Context](#1-overview--context)
2. [Dependency Installation](#2-dependency-installation)
3. [Static Assets](#3-static-assets)
4. [CSS / Design Tokens Merge](#4-css--design-tokens-merge)
5. [Copy Landing Page Components](#5-copy-landing-page-components)
6. [Migrate Auth Forms (with Feature Merge)](#6-migrate-auth-forms-with-feature-merge)
7. [Update Routing](#7-update-routing)
8. [Update index.html (SEO)](#8-update-indexhtml-seo)
9. [Cleanup](#9-cleanup)
10. [Verification Checklist](#10-verification-checklist)

---

## 1. Overview & Context

### Source Directory (`frontend/landing-signIn-signUp/`)

A standalone Vite + React + Tailwind v4 app with:
- **Landing page**: Awwwards-quality with GSAP animations, Lenis smooth scroll, video background, loader, 11 section components (Hero, Problem, Solution, Features, CaseStudy, Security, Demo, Pricing, FAQ, CTA, MarqueeStrip), Navbar, Footer, MobileMenu
- **Auth forms**: Clean `LoginPage.tsx` and `SignUpPage.tsx` using reusable `AuthLayout`, `AuthInput`, `AuthDivider`, `SocialButton` components with GSAP entrance animations
- **NO API integration** — form submissions are stubbed with `console.log`

### Target Directory (`frontend/src/`)

The main app with:
- Full API integration via `AuthProvider`, `useCurrentUser` hook, `authApi` service
- `SignupPage.tsx` handles both login AND signup with: account type picker (Individual/Business), local demo credential shortcuts, password visibility toggle, loading/error states, Terms checkbox, navigation to `/dashboard` on success
- `LandingPage.tsx` is a simpler, single-file component (no GSAP/Lenis)

### Key Principle

The new visual design from `landing-signIn-signUp/` must be adopted, but ALL functional features from the existing `frontend/src/` auth must be **merged into** the new forms. Nothing from the existing API layer should be lost.

---

## 2. Dependency Installation

Add packages that `landing-signIn-signUp` uses but `frontend` doesn't have:

```bash
cd frontend
npm install gsap @gsap/react lenis @studio-freight/react-lenis react-fast-marquee
```

**Already shared** (no action): `react`, `react-dom`, `react-router-dom`, `lucide-react`, `motion`, `tailwindcss`, `@tailwindcss/vite`, `@vitejs/plugin-react`

---

## 3. Static Assets

### 3.1 Copy Video Background

Copy the landing video to the main frontend's public folder:

```
frontend/landing-signIn-signUp/public/media/bgVideo.mp4
  → frontend/public/media/bgVideo.mp4
```

Create `frontend/public/media/` if it doesn't exist.

### 3.2 Copy Background Image

```
frontend/landing-signIn-signUp/src/bgImage.png
  → frontend/src/features/landing/assets/bgImage.png
```

> [!NOTE]
> The bgImage.png is imported in source code, so it should live inside `src/`.

---

## 4. CSS / Design Tokens Merge

Merge the landing's CSS utilities into `frontend/src/styles.css`. The existing file already has the color tokens (`navy-900`, `teal-500`, etc.), so only **add missing utilities**.

### 4.1 Add the `brand-blue` and `brand-teal` aliases

The landing uses `brand-blue` and `brand-teal` while the main app uses `navy-800` and `teal-600`. Add aliases to the `@theme inline` block in `styles.css`:

```css
--color-brand-blue: #1a2e4c;
--color-brand-teal: #0094ac;
```

### 4.2 Add missing utility classes

Append these to the `styles.css` **after** the existing `@layer components` block:

```css
@layer utilities {
  .gsap-hidden {
    visibility: hidden;
    opacity: 0;
  }

  .mask-marquee {
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }

  .problem-section::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0.045;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(26, 46, 76, 0.45) 0.7px, transparent 0.8px),
      radial-gradient(circle at 80% 70%, rgba(26, 46, 76, 0.35) 0.7px, transparent 0.8px);
    background-size: 3px 3px, 4px 4px;
    background-position: 0 0, 1px 1px;
  }

  .case-study-section::before { /* ... copy from landing index.css ... */ }
  .security-section::before { /* ... copy from landing index.css ... */ }
  .demo-panel::before { /* ... copy from landing index.css ... */ }

  .footer-link { position: relative; }
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
  .footer-link:hover::after { width: 100%; }

  .problem-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  @media (min-width: 768px) {
    .problem-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: auto auto;
    }
  }
}
```

> [!IMPORTANT]
> Copy the full `::before` pseudo-element rules from `landing-signIn-signUp/src/index.css` lines 40-78 verbatim.

### 4.3 Font

The landing uses **Inter** while the main app uses **Plus Jakarta Sans**. **Keep Plus Jakarta Sans** as the primary font for the dashboard. For landing pages, you can either:
- (Recommended) Keep Plus Jakarta Sans everywhere for consistency, OR
- Add Inter as a secondary font and use `font-sans` override on the landing page only

---

## 5. Copy Landing Page Components

Create a new feature module for the landing page content.

### 5.1 Target Structure

```
frontend/src/features/landing/
├── components/
│   ├── auth/
│   │   ├── AuthDivider.tsx       ← from landing/src/components/auth/
│   │   ├── AuthInput.tsx         ← from landing/src/components/auth/
│   │   ├── AuthLayout.tsx        ← from landing/src/components/auth/
│   │   ├── SocialButton.tsx      ← from landing/src/components/auth/
│   │   └── index.ts
│   ├── layout/
│   │   ├── Footer.tsx            ← from landing/src/components/layout/
│   │   ├── MobileMenu.tsx        ← from landing/src/components/layout/
│   │   └── Navbar.tsx            ← from landing/src/components/layout/
│   ├── sections/
│   │   ├── CTASection.tsx        ← from landing/src/components/sections/
│   │   ├── CaseStudySection.tsx
│   │   ├── DemoSection.tsx
│   │   ├── FAQSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HeroSection.tsx
│   │   ├── MarqueeStrip.tsx
│   │   ├── PricingSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── SecuritySection.tsx
│   │   ├── SolutionSection.tsx
│   │   └── index.ts
│   └── ui/
│       ├── AnimatedCard.tsx      ← from landing/src/components/ui/
│       ├── Container.tsx
│       ├── FAQItem.tsx
│       ├── Loader.tsx
│       ├── Logo.tsx
│       ├── SectionHeading.tsx
│       └── index.ts
├── data/
│   └── constants.ts              ← from landing/src/data/constants.ts
├── hooks/
│   ├── useAssetLoader.ts         ← from landing/src/hooks/
│   ├── useCyclingIndex.ts
│   └── useLenis.ts
├── pages/
│   ├── LandingPage.tsx           ← from landing/src/pages/LandingPage.tsx
│   ├── LoginPage.tsx             ← from landing/src/pages/LoginPage.tsx (MODIFIED — see §6)
│   └── SignUpPage.tsx            ← from landing/src/pages/SignUpPage.tsx (MODIFIED — see §6)
└── assets/
    └── bgImage.png
```

### 5.2 Copy Procedure

1. Copy **all files** from `landing-signIn-signUp/src/components/` → `frontend/src/features/landing/components/`
2. Copy `landing-signIn-signUp/src/data/constants.ts` → `frontend/src/features/landing/data/constants.ts`
3. Copy `landing-signIn-signUp/src/hooks/` → `frontend/src/features/landing/hooks/`
4. Copy `landing-signIn-signUp/src/pages/LandingPage.tsx` → `frontend/src/features/landing/pages/LandingPage.tsx`
5. Copy `landing-signIn-signUp/src/pages/LoginPage.tsx` → `frontend/src/features/landing/pages/LoginPage.tsx`
6. Copy `landing-signIn-signUp/src/pages/SignUpPage.tsx` → `frontend/src/features/landing/pages/SignUpPage.tsx`

### 5.3 Fix All Import Paths

After copying, update **all relative imports** in the copied files. Since `landing-signIn-signUp` used `../components/...` style imports from `pages/`, these must now be updated to reference the new locations.

**Pattern**: Replace `../components/` with paths relative to `frontend/src/features/landing/`, or use the `@/` alias.

Examples:
```typescript
// In LandingPage.tsx, change:
import { Footer } from '../components/layout/Footer';
// To:
import { Footer } from '@/features/landing/components/layout/Footer';

// In LoginPage.tsx, change:
import { AuthDivider, AuthInput, AuthLayout, SocialButton } from '../components/auth';
// To:
import { AuthDivider, AuthInput, AuthLayout, SocialButton } from '@/features/landing/components/auth';

// In LandingPage.tsx, change:
import { heroCards } from '../data/constants';
// To:
import { heroCards } from '@/features/landing/data/constants';
```

Apply this transformation to **every file** that was copied.

---

## 6. Migrate Auth Forms (with Feature Merge)

This is the critical section. The new visual forms from `landing-signIn-signUp` must gain all the functional features from the existing `frontend/src/features/auth/pages/SignupPage.tsx`.

### 6.1 Features to Merge INTO `LoginPage.tsx`

The new `LoginPage.tsx` currently only has client-side validation and `console.log`. Add:

| Feature | Source | What to do |
|---|---|---|
| **API login call** | `useCurrentUser()` hook | Import `useCurrentUser` from `@/features/auth/hooks/useCurrentUser` and call `login({ email, password })` |
| **Loading state** | `loading` from `useCurrentUser()` | Disable submit button and show "Please wait..." when loading |
| **Error display** | `error` from hook + local `formError` | Show error banner below form when auth fails |
| **Navigate on success** | `useNavigate()` | Navigate to `/dashboard` on successful login |
| **Local demo shortcuts** | `localAccountShortcuts` | Add two quick-fill buttons (User Account / Admin Account) above the form |
| **Password visibility toggle** | `showPassword` state + Eye/EyeOff icons | Add toggle button inside password field |

**Concrete changes to `LoginPage.tsx`**:

```typescript
// Add imports
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useCurrentUser from '@/features/auth/hooks/useCurrentUser';
import { localAccountShortcuts } from '@/features/auth/data/localAccountShortcuts';

// Inside component:
const navigate = useNavigate();
const { login, loading, error } = useCurrentUser();
const [showPassword, setShowPassword] = useState(false);
const [formError, setFormError] = useState<string | null>(null);

// Replace handleSubmit body:
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  setFormError(null);
  // ... existing validation ...
  if (Object.keys(nextErrors).length === 0) {
    try {
      const user = await login({ email, password });
      if (!user) {
        setFormError('Invalid credentials. Try user@flowx.demo / user123');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch {
      setFormError('Authentication failed. Please try again.');
    }
  }
};

// Add demo credential shortcuts buttons above the form
// Add error banner: {(formError || error) && <div className="...">...</div>}
// Add password show/hide toggle to the password AuthInput
```

### 6.2 Features to Merge INTO `SignUpPage.tsx`

| Feature | Source | What to do |
|---|---|---|
| **Account type picker** | `AccountType` from `@/shared/types` | Add Individual/Business toggle cards (from existing SignupPage lines 210-258) |
| **API signup call** | `useCurrentUser()` hook | Call `signup({ fullName, email, password, role: 'user', accountType })` |
| **Loading state** | `loading` from hook | Disable submit, show loading text |
| **Error display** | `error` + `formError` | Show error banner |
| **Navigate on success** | `useNavigate()` | Navigate to `/dashboard` |
| **Terms checkbox** | Required checkbox | Add Terms of Service / Privacy Policy checkbox before submit |
| **Password visibility** | `showPassword` state | Add toggle to both password fields |
| **Full name → single field** | Existing uses `fullName` | Combine `firstName` + `lastName` into `fullName` for the API call (`${firstName} ${lastName}`) |

**Concrete changes to `SignUpPage.tsx`**:

```typescript
// Add imports
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Building2 } from 'lucide-react';
import useCurrentUser from '@/features/auth/hooks/useCurrentUser';
import type { AccountType } from '@/shared/types';

// Inside component:
const navigate = useNavigate();
const { signup, loading, error } = useCurrentUser();
const [accountType, setAccountType] = useState<AccountType>('Individual');
const [formError, setFormError] = useState<string | null>(null);
const [agreedToTerms, setAgreedToTerms] = useState(false);

// Replace handleSubmit body:
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();
  setFormError(null);
  // ... existing validation ...
  // Add: if (!agreedToTerms) { nextErrors.terms = 'You must agree...'; }
  if (Object.keys(nextErrors).length === 0) {
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const user = await signup({
        fullName,
        email: form.email,
        password: form.password,
        role: 'user',
        accountType,
      });
      if (!user) {
        setFormError('Signup failed. Try a different email.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch {
      setFormError('Signup failed. Please try again.');
    }
  }
};

// Add Account Type picker UI (Individual / Business cards) above the name fields
// Add Terms checkbox before submit button
// Add error banner
```

### 6.3 Preserve Auth Infrastructure

Do **NOT** modify these existing files — they remain the API backbone:
- `frontend/src/core/providers/AuthProvider.tsx`
- `frontend/src/features/auth/hooks/useCurrentUser.tsx`
- `frontend/src/features/auth/services/authApi.ts`
- `frontend/src/features/auth/types.ts`
- `frontend/src/features/auth/data/localAccountShortcuts.ts`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/apiClient.ts`
- `frontend/src/shared/types/` (AccountType, CurrentUser, etc.)

---

## 7. Update Routing

### 7.1 Modify `frontend/src/flowx/FlowXApp.tsx`

Update imports to point to the new landing pages:

```typescript
// Replace these imports:
import LandingPage from '@/features/auth/pages/LandingPage';
import SignupPage from '@/features/auth/pages/SignupPage';

// With:
import LandingPage from '@/features/landing/pages/LandingPage';
import LoginPage from '@/features/landing/pages/LoginPage';
import SignUpPage from '@/features/landing/pages/SignUpPage';
```

Update the route definitions:

```typescript
// Change:
<Route path="/signup" element={<SignupPage />} />
<Route path="/login" element={<SignupPage />} />

// To:
<Route path="/signup" element={<SignUpPage />} />
<Route path="/login" element={<LoginPage />} />
```

### 7.2 Update `RootRoute` component

```typescript
// Change the import used in RootRoute:
// Replace: import LandingPage from '@/features/auth/pages/LandingPage';
// With:    import LandingPage from '@/features/landing/pages/LandingPage';
```

The rest of `RootRoute` logic stays the same (show landing if not logged in, redirect to dashboard if logged in).

---

## 8. Update `index.html` (SEO)

Merge the SEO meta tags from `landing-signIn-signUp/index.html` into `frontend/index.html`:

```html
<title>FlowX | Fast, Secure Cross-Border Transfers</title>
<meta name="description" content="FlowX enables fast, secure, low-fee cross-border money transfers through smart local matching and escrow-backed verification." />
<meta name="keywords" content="FlowX, cross-border transfers, money transfer, fintech, escrow, secure payments, remittance" />
<meta name="author" content="FlowX" />
<meta property="og:type" content="website" />
<meta property="og:title" content="FlowX | Fast, Secure Cross-Border Transfers" />
<meta property="og:description" content="Move money across borders faster with smart matching, local payouts, and escrow-backed protection." />
<meta property="og:site_name" content="FlowX" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="FlowX | Fast, Secure Cross-Border Transfers" />
<meta name="twitter:description" content="Fast and secure cross-border transfers with transparent fees and real-time tracking." />
```

---

## 9. Cleanup

After migration is verified working:

1. **Delete old landing page**: `frontend/src/features/auth/pages/LandingPage.tsx` (688 lines, now replaced)
2. **Delete old signup page**: `frontend/src/features/auth/pages/SignupPage.tsx` (415 lines, now replaced)
3. **Keep** `frontend/src/features/auth/pages/VerificationPage.tsx` — it's unrelated to this migration
4. **Do NOT delete** `frontend/landing-signIn-signUp/` — keep it as a reference until the migration is fully stable
5. **Keep** all files in `frontend/src/features/auth/` except the two deleted pages — the services, hooks, types, and data files are still used by the new forms

---

## 10. Verification Checklist

After implementation, verify:

- [ ] `npm run dev` starts without errors
- [ ] Landing page (`/`) renders with video background, all 11 sections, GSAP animations, smooth scroll
- [ ] Navbar links scroll to correct sections
- [ ] Mobile menu works
- [ ] Loader appears on first visit
- [ ] Login page (`/login`) renders with new AuthLayout design
- [ ] Login form calls API and navigates to `/dashboard` on success
- [ ] Login shows error message on invalid credentials
- [ ] Demo credential shortcuts work on login page
- [ ] Signup page (`/signup`) renders with new AuthLayout design
- [ ] Signup form has Account Type picker (Individual / Business)
- [ ] Signup form combines first + last name and calls API
- [ ] Signup shows Terms checkbox and validates it
- [ ] Signup navigates to `/dashboard` on success
- [ ] Password visibility toggle works on both forms
- [ ] All protected routes still work (dashboard, admin, etc.)
- [ ] `npm run build` completes without TypeScript errors

---

## File Change Summary

| Action | Path | Notes |
|--------|------|-------|
| **Install** | `package.json` | Add gsap, @gsap/react, lenis, @studio-freight/react-lenis, react-fast-marquee |
| **Copy** | `public/media/bgVideo.mp4` | From landing public |
| **Edit** | `src/styles.css` | Add brand-blue, brand-teal tokens + utility classes |
| **Create** | `src/features/landing/**` | ~30 files: components, data, hooks, pages, assets |
| **Edit** | `src/features/landing/pages/LoginPage.tsx` | Merge API integration |
| **Edit** | `src/features/landing/pages/SignUpPage.tsx` | Merge API + account type + terms |
| **Edit** | `src/flowx/FlowXApp.tsx` | Update imports + route definitions |
| **Edit** | `index.html` | Add SEO meta tags |
| **Delete** | `src/features/auth/pages/LandingPage.tsx` | Old landing (after verification) |
| **Delete** | `src/features/auth/pages/SignupPage.tsx` | Old auth forms (after verification) |
