# Login & Sign Up Pages — Minimal Auth UI Plan

## Vision

Create **two dedicated auth pages** (Login and Sign Up) with a minimal, clean aesthetic that stays true to the FlowX brand. A split-layout design — left panel with a dark branded sidebar featuring the logo and a rotating tagline, right panel with a spacious white form. No clutter, no excess decoration — just confident typography, precise spacing, and subtle GSAP `useGSAP` entrance animations. Inspired by Stripe, Linear, and Clerk auth screens.

---

## Current State

- No auth pages exist in the project
- No client-side router installed (`react-router-dom` needed)
- Project is a single-page Vite + React app rendering all sections in `App.tsx`

---

## Target Experience

### Login Page

```
Desktop (lg+):
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌─ Left Panel (40%) ──────────┐  ┌─ Right Panel (60%) ────┐ │
│  │  bg-[#0a0a0a]               │  │  bg-white               │ │
│  │                              │  │                          │ │
│  │  [FlowX Logo]  (white)      │  │      "Welcome back"     │ │
│  │                              │  │      (text-3xl, bold)   │ │
│  │                              │  │                          │ │
│  │                              │  │      ┌──────────────┐   │ │
│  │  "Move Money"               │  │      │  Email        │   │ │
│  │  "Without Borders."         │  │      └──────────────┘   │ │
│  │  (text-4xl, light)          │  │      ┌──────────────┐   │ │
│  │                              │  │      │  Password     │   │ │
│  │                              │  │      └──────────────┘   │ │
│  │                              │  │                          │ │
│  │  "Trusted by thousands      │  │      [  Sign In  →  ]   │ │
│  │   across 4+ corridors"      │  │                          │ │
│  │  (text-white/30, sm)        │  │      ── or ──           │ │
│  │                              │  │                          │ │
│  │  ┌──────────────────────┐   │  │      [G] Continue with  │ │
│  │  │ "FlowX matched 2.4k │   │  │          Google         │ │
│  │  │  transfers this week"│   │  │                          │ │
│  │  └──────────────────────┘   │  │      "Don't have an     │ │
│  │  (rotating stat)            │  │       account? Sign up"  │ │
│  │                              │  │                          │ │
│  └──────────────────────────────┘  └──────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Mobile (sm):
┌──────────────────────────────┐
│  bg-white, full screen       │
│                              │
│  [FlowX Logo]  (brand-blue)  │
│                              │
│  "Welcome back"              │
│                              │
│  ┌──────────────────────────┐│
│  │  Email                    ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │  Password                 ││
│  └──────────────────────────┘│
│                              │
│  [  Sign In  →  ]            │
│                              │
│  ── or ──                    │
│  [G] Continue with Google    │
│                              │
│  "Don't have an account?"    │
│  Sign up                     │
└──────────────────────────────┘
```

### Sign Up Page

Same split layout, right panel changes to:

```
┌─ Right Panel ───────────────────┐
│                                  │
│  "Create your account"          │
│  (text-3xl, bold)               │
│                                  │
│  ┌────────────┐ ┌────────────┐  │
│  │ First name │ │ Last name  │  │
│  └────────────┘ └────────────┘  │
│  ┌────────────────────────────┐ │
│  │  Email                      │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  Password                   │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │  Confirm Password           │ │
│  └────────────────────────────┘ │
│                                  │
│  [  Create Account  →  ]        │
│                                  │
│  ── or ──                       │
│  [G] Continue with Google       │
│                                  │
│  "Already have an account?"     │
│  Sign in                        │
└──────────────────────────────────┘
```

---

## Color & Typography

| Element | Spec |
|---|---|
| **Left panel bg** | `#0a0a0a` (dark branded sidebar) |
| **Right panel bg** | `#ffffff` (clean white form area) |
| **Logo (left)** | White/inverted variant on dark bg |
| **Logo (mobile)** | `brand-blue` on white bg |
| **Left tagline** | `text-white`, `text-3xl lg:text-4xl`, `font-light`, `tracking-tight` |
| **Left tagline accent** | `text-white/30` |
| **Left stat text** | `text-white/40`, `text-sm`, `font-light` |
| **Right heading** | `text-brand-blue`, `text-2xl lg:text-3xl`, `font-bold`, `tracking-tight` |
| **Right subtext** | `text-brand-blue/50`, `text-sm`, `font-light` |
| **Input label** | `text-brand-blue/70`, `text-xs`, `uppercase`, `tracking-wider`, `font-semibold` |
| **Input field** | `bg-zinc-50`, `border border-zinc-200`, `rounded-xl`, `px-4 py-3.5`, `text-sm`, focus: `border-brand-teal ring-2 ring-brand-teal/10` |
| **Primary button** | `bg-brand-blue`, `text-white`, `rounded-xl`, `py-3.5`, `font-semibold`, `text-sm`, hover: `bg-brand-blue/90` |
| **Social button** | `bg-zinc-50`, `border border-zinc-200`, `rounded-xl`, `text-brand-blue`, hover: `bg-zinc-100` |
| **Divider "or"** | `text-zinc-300`, `text-xs`, with left/right `h-px bg-zinc-200` lines |
| **Link text** | `text-brand-teal`, `font-semibold`, hover: `text-brand-teal/80` |
| **Error text** | `text-red-500`, `text-xs` |

---

## Routing Setup

**Install `react-router-dom`:**

```bash
npm install react-router-dom
```

**File:** `src/main.tsx`

```tsx
import { BrowserRouter } from 'react-router-dom';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
```

**File:** `src/App.tsx`

```tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
}
```

> The current `App.tsx` content (all sections + navbar + footer) moves into a new `src/pages/LandingPage.tsx` component.

---

## File Structure

```
src/
├── pages/
│   ├── LandingPage.tsx      ← existing App content moves here
│   ├── LoginPage.tsx
│   └── SignUpPage.tsx
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx    ← shared split-layout wrapper
│   │   ├── AuthInput.tsx     ← reusable styled input
│   │   ├── AuthDivider.tsx   ← "or" divider
│   │   └── SocialButton.tsx  ← Google/social login button
│   ├── layout/
│   ├── sections/
│   └── ui/
```

---

## Shared Auth Layout Component

Both pages share the same split-layout shell:

```tsx
interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    // Left panel slides in
    const leftPanel = layout.querySelector('[data-auth-left]');
    gsap.from(leftPanel, {
      x: -40, opacity: 0, duration: 0.8, ease: 'power3.out',
    });

    // Left tagline words
    const taglineWords = layout.querySelectorAll('[data-tagline-word]');
    gsap.from(taglineWords, {
      y: 30, opacity: 0, duration: 0.6,
      ease: 'power3.out', stagger: 0.06, delay: 0.3,
    });

    // Right panel content
    const rightContent = layout.querySelector('[data-auth-right]');
    gsap.from(rightContent, {
      y: 30, opacity: 0, duration: 0.7,
      ease: 'power3.out', delay: 0.4,
    });
  }, { scope: layoutRef });

  return (
    <div
      ref={layoutRef}
      className="min-h-screen flex font-sans selection:bg-brand-teal/30"
    >
      {/* Left branded panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-[40%] bg-[#0a0a0a] flex-col justify-between p-12 relative overflow-hidden"
        data-auth-left
      >
        {/* Logo */}
        <div data-auth-logo>
          <Logo variant="white" />
        </div>

        {/* Tagline */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-white mb-4">
            {renderWords('Move Money', 'text-white')}
            <br />
            {renderWords('Without Borders.', 'text-white/30')}
          </h1>
          <p className="text-white/30 text-sm font-light leading-relaxed max-w-xs">
            Trusted by thousands of users across 4+ corridors for fast, secure transfers.
          </p>
        </div>

        {/* Rotating stat (bottom) */}
        <div className="text-white/20 text-xs font-light">
          <p>© {new Date().getFullYear()} FlowX. All rights reserved.</p>
        </div>

        {/* Ambient glow */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0% 100%, rgba(0,148,172,0.08), transparent 60%)',
          }}
        />
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-white flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" data-auth-right>
          {/* Mobile logo (visible only on sm) */}
          <div className="lg:hidden mb-10">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Auth Input Component

```tsx
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-brand-blue/70 text-xs uppercase tracking-wider font-semibold mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        className={`
          w-full bg-zinc-50 border rounded-xl px-4 py-3.5 text-sm text-brand-blue
          placeholder:text-brand-blue/30
          transition-all duration-200
          focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10
          ${error ? 'border-red-300 ring-2 ring-red-100' : 'border-zinc-200'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
}
```

---

## Auth Divider

```tsx
function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">or</span>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
}
```

---

## Social Button

```tsx
function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-center gap-3
        bg-zinc-50 border border-zinc-200 rounded-xl
        px-4 py-3.5 text-sm font-medium text-brand-blue
        hover:bg-zinc-100 hover:border-zinc-300
        transition-all duration-200
      "
    >
      {icon}
      {label}
    </button>
  );
}
```

---

## Login Page

```tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: auth logic
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-blue mb-2">
        Welcome back
      </h2>
      <p className="text-brand-blue/50 text-sm font-light mb-8">
        Sign in to your FlowX account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-zinc-300 text-brand-teal focus:ring-brand-teal/20" />
            <span className="text-xs text-brand-blue/50">Remember me</span>
          </label>
          <a href="#" className="text-xs text-brand-teal font-semibold hover:text-brand-teal/80 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="
            w-full bg-brand-blue text-white rounded-xl py-3.5
            font-semibold text-sm
            hover:bg-brand-blue/90 transition-colors duration-200
            flex items-center justify-center gap-2 group
          "
        >
          Sign In
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <AuthDivider />

      <SocialButton
        icon={<GoogleIcon />}
        label="Continue with Google"
      />

      <p className="text-center text-sm text-brand-blue/50 mt-8">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-teal font-semibold hover:text-brand-teal/80 transition-colors">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
```

---

## Sign Up Page

Same structure, different fields:

```tsx
export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  return (
    <AuthLayout>
      <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-brand-blue mb-2">
        Create your account
      </h2>
      <p className="text-brand-blue/50 text-sm font-light mb-8">
        Start sending money without borders
      </p>

      <form className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <AuthInput id="firstName" label="First name" placeholder="Mohammed" ... />
          <AuthInput id="lastName" label="Last name" placeholder="Ahmed" ... />
        </div>
        <AuthInput id="email" label="Email" type="email" placeholder="you@example.com" ... />
        <AuthInput id="password" label="Password" type="password" placeholder="••••••••" ... />
        <AuthInput id="confirmPassword" label="Confirm password" type="password" placeholder="••••••••" ... />

        <button type="submit" className="w-full bg-brand-blue text-white rounded-xl py-3.5 font-semibold text-sm ...">
          Create Account
          <ArrowRight className="w-4 h-4 ..." />
        </button>
      </form>

      <AuthDivider />
      <SocialButton icon={<GoogleIcon />} label="Continue with Google" />

      <p className="text-center text-sm text-brand-blue/50 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-teal font-semibold ...">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
```

---

## GSAP Animations

### Page Entrance (both pages)

Handled inside `AuthLayout` via `useGSAP`:

```
Timeline ────────────────────────────────────────────►
  │
  ├─ 0.0s  Left panel slides in from x: -40, opacity: 0
  │
  ├─ 0.3s  Tagline words stagger (y: 30, opacity: 0)
  │
  ├─ 0.4s  Right panel content fades up (y: 30, opacity: 0)
  │
  └─ done
```

### Input Focus Micro-Animation

When an input gains focus, GSAP adds a subtle scale pulse to the label:

```tsx
// Optional enhancement — label shifts color on focus
// Can be handled with pure CSS via peer/focus-within
```

### Submit Button Hover

Button arrow icon shifts right on hover (CSS `group-hover:translate-x-0.5`).

---

## Implementation Phases

### Phase 1: Install Router & Restructure

1. `npm install react-router-dom`
2. Create `src/pages/` directory
3. Move existing `App.tsx` content into `src/pages/LandingPage.tsx`
4. Update `App.tsx` to use `<Routes>` with 3 routes: `/`, `/login`, `/signup`
5. Wrap `<App />` in `<BrowserRouter>` in `main.tsx`

### Phase 2: Auth Layout Shell

**File:** `src/components/auth/AuthLayout.tsx`

1. Build the split-layout: left dark panel (40%) + right white form (60%)
2. Left panel: logo (white), tagline, copyright, ambient glow
3. Right panel: centered `max-w-md` container for form content
4. Mobile: hide left panel, show logo above form
5. Wire up `useGSAP` entrance animation

### Phase 3: Shared Auth Components

**Files:**
- `src/components/auth/AuthInput.tsx` — styled input with label, error state
- `src/components/auth/AuthDivider.tsx` — "or" separator
- `src/components/auth/SocialButton.tsx` — Google/social login button

### Phase 4: Login Page

**File:** `src/pages/LoginPage.tsx`

1. Email + password fields
2. "Remember me" checkbox + "Forgot password?" link
3. Primary submit button with arrow icon
4. Google social login
5. "Don't have an account? Sign up" link → `/signup`

### Phase 5: Sign Up Page

**File:** `src/pages/SignUpPage.tsx`

1. First name + last name (2-col row)
2. Email + password + confirm password
3. Primary submit button
4. Google social login
5. "Already have an account? Sign in" link → `/login`

### Phase 6: Logo Variant

**File:** `src/components/ui/Logo.tsx`

1. Add optional `variant` prop: `'default' | 'white'`
2. White variant for dark auth sidebar background
3. Default variant stays `brand-blue` for light backgrounds

### Phase 7: Form Validation (Basic)

1. Required field validation on submit
2. Password minimum length check (8 chars)
3. Confirm password match validation
4. Email format validation
5. Error messages display below each field via `AuthInput` error prop

### Phase 8: Navigation Integration

1. Add "Sign In" / "Get Started" links/buttons to the landing page Navbar
2. These link to `/login` and `/signup` respectively
3. Use `<Link>` from `react-router-dom` for SPA navigation

### Phase 9: Mobile Adaptation

On `< 1024px`:
- Left branded panel hidden entirely
- Logo renders at the top of the form (brand-blue on white)
- Form takes full viewport width with padding
- All inputs remain full-width

### Phase 10: Polish & Accessibility

- `prefers-reduced-motion`: disable entrance animations
- All inputs have associated `<label>` elements with `htmlFor`
- Focus rings are clearly visible (`ring-2 ring-brand-teal/10`)
- Tab order is logical: fields → submit → social → link
- Form errors announced to screen readers (`role="alert"`)
- `<title>` tags: "Login — FlowX" / "Sign Up — FlowX"

---

## Files Changed / Created

| File | Change |
|---|---|
| `package.json` | Add `react-router-dom` dependency |
| `src/main.tsx` | Wrap `<App />` in `<BrowserRouter>` |
| `src/App.tsx` | Replace inline sections with `<Routes>` (3 routes) |
| `src/pages/LandingPage.tsx` | **NEW** — existing App content extracted here |
| `src/pages/LoginPage.tsx` | **NEW** — login form with AuthLayout |
| `src/pages/SignUpPage.tsx` | **NEW** — sign-up form with AuthLayout |
| `src/components/auth/AuthLayout.tsx` | **NEW** — shared split-layout shell |
| `src/components/auth/AuthInput.tsx` | **NEW** — styled input component |
| `src/components/auth/AuthDivider.tsx` | **NEW** — "or" divider |
| `src/components/auth/SocialButton.tsx` | **NEW** — social login button |
| `src/components/auth/index.ts` | **NEW** — barrel export |
| `src/components/ui/Logo.tsx` | Add `variant` prop for white/inverted |

---

## Responsive Breakpoints

| Breakpoint | Layout | Left Panel | Form Width |
|---|---|---|---|
| `≥ 1024px` (lg) | Split: 40% / 60% | Visible (dark sidebar) | `max-w-md` |
| `≥ 768px` (md) | Full-width form, centered | Hidden | `max-w-md` |
| `< 768px` (sm) | Full-width form, tight padding | Hidden | Full width with `px-6` |

---

## Performance Considerations

| Concern | Mitigation |
|---|---|
| New dependency (react-router-dom) | Lightweight (~14kb gzip), industry standard |
| Page transition | Simple GSAP `from` tweens, no complex timelines |
| Form re-renders | Controlled inputs with local state only, no global store |
| Code splitting | Pages can be lazy-loaded with `React.lazy()` if needed |
| Auth layout reuse | Single component shared between both pages, no duplication |

---

## Testing Criteria

- [ ] `/login` route renders the login page correctly
- [ ] `/signup` route renders the sign-up page correctly
- [ ] `/` route still renders the full landing page
- [ ] Left dark panel is visible on desktop with logo, tagline, and copyright
- [ ] Left panel is hidden on mobile, logo appears above form
- [ ] Page entrance animation plays: left panel slides, right fades up
- [ ] Email input validates format on submit
- [ ] Password input requires minimum 8 characters
- [ ] Sign Up: confirm password must match password
- [ ] Error messages appear below respective fields
- [ ] "Sign In" button submits the login form
- [ ] "Create Account" button submits the sign-up form
- [ ] "Forgot password?" link is present on login page
- [ ] "Don't have an account? Sign up" links to `/signup`
- [ ] "Already have an account? Sign in" links to `/login`
- [ ] Google social button is styled and present on both pages
- [ ] All inputs have proper labels and focus states
- [ ] Tab navigation works logically through all form elements
- [ ] `prefers-reduced-motion` disables entrance animations
- [ ] Page titles update: "Login — FlowX" / "Sign Up — FlowX"
- [ ] Smooth scrolling (Lenis) only applies to landing page, not auth pages
- [ ] No console errors when navigating between routes
