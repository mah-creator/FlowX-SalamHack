# Post-Migration Cleanup Plan

> **Goal**: Remove all dead code, duplicate files, and leftover artifacts from the migration while ensuring the app remains fully functional.

---

## Table of Contents

1. [Delete the `landing-signIn-signUp` Folder](#1-delete-the-landing-signin-signup-folder)
2. [Delete the Stale `dist` Folder](#2-delete-the-stale-dist-folder)
3. [Remove Redundant Root Markdown Files](#3-remove-redundant-root-markdown-files)
4. [Duplicate `cn()` Utility — Consolidate](#4-duplicate-cn-utility--consolidate)
5. [Verify CSS Has No Duplicated Blocks](#5-verify-css-has-no-duplicated-blocks)
6. [Audit Unused shadcn/ui Components](#6-audit-unused-shadcnui-components)
7. [Remove Stale Dependencies from `package.json`](#7-remove-stale-dependencies-from-packagejson)
8. [Verification Steps](#8-verification-steps)

---

## 1. Delete the `landing-signIn-signUp` Folder

The entire `frontend/landing-signIn-signUp/` directory is now a dead copy. All its content has been migrated into `frontend/src/features/landing/`. It has its own `node_modules`, `package.json`, `dist`, and source files — none of which are referenced by the main app.

**Action**: Delete the entire directory.

```
DELETE: frontend/landing-signIn-signUp/   (entire folder)
```

> [!IMPORTANT]
> This is the single biggest cleanup item. The folder contains its own `node_modules` and is completely unused by the main frontend build.

---

## 2. Delete the Stale `dist` Folder

There is a `frontend/dist/` folder from a previous production build. After the migration, this build output is **stale and invalid** — it was built from the old code.

**Action**: Delete it. A fresh build can be created with `npm run build` when needed.

```
DELETE: frontend/dist/   (entire folder)
```

---

## 3. Remove Redundant Root Markdown Files

The frontend root contains several documentation / planning files. Review and clean up:

| File | Verdict | Reason |
|------|---------|--------|
| `LANDING_AUTH_MIGRATION_PLAN.md` | **DELETE** | Migration is complete; no longer needed |
| `ARCHITECTURE.md` | **KEEP** | Documents overall app architecture |
| `README.md` | **KEEP** | Primary project readme |
| `FLOWX_README.md` | **REVIEW** | If its content is redundant with `README.md`, delete it |
| `MOCK_API_READY_README.md` | **REVIEW** | If the mock API setup info is already in README.md, delete it |
| `README_DEPLOYMENT.md` | **KEEP** | Deployment instructions are useful |

**Minimum action**:
```
DELETE: frontend/LANDING_AUTH_MIGRATION_PLAN.md
```

**Optional** (if content is redundant):
```
DELETE: frontend/FLOWX_README.md
DELETE: frontend/MOCK_API_READY_README.md
```

---

## 4. Duplicate `cn()` Utility — Consolidate

There are **two identical** `cn()` utility functions in the codebase:

1. `src/lib/utils.ts` — used by all 46 shadcn/ui components (imported as `@/lib/utils`)
2. `src/shared/utils/cn.ts` + `src/shared/utils/index.ts` — used by app pages and layout (imported as `@/shared/utils`)

Both are identical implementations of `twMerge(clsx(...inputs))`.

### Recommended Fix

**Keep `src/lib/utils.ts`** (it's the shadcn convention and has 43+ consumers) and redirect `@/shared/utils` to re-export from it.

**Step 1**: Replace `src/shared/utils/cn.ts` content with a re-export:

```typescript
// src/shared/utils/cn.ts  — replace entire file with:
export { cn } from "@/lib/utils";
```

This way both `@/lib/utils` and `@/shared/utils` resolve to the same function, and no imports need to change across the codebase.

**Alternative (more thorough)**: Find-and-replace all `from "@/shared/utils"` to `from "@/lib/utils"` across the 9 files that use it, then delete `src/shared/utils/cn.ts` and `src/shared/utils/index.ts`. Only do this if you want a single canonical import path.

---

## 5. Verify CSS Has No Duplicated Blocks

After the migration, `src/styles.css` grew from ~212 lines to ~340 lines. Check for:

### 5.1 Duplicate `@theme inline` blocks
The file should have at most **two** `@theme inline` blocks: one for the shadcn design system variables, and one for the FlowX custom tokens. If a third was added during migration with `brand-blue`/`brand-teal`, merge it into the existing FlowX token block.

### 5.2 Duplicate `@layer base` blocks
Check if there are multiple `@layer base` blocks with conflicting `body` styles. Consolidate into one.

### 5.3 Duplicate keyframes
Ensure `@keyframes marquee` and `@keyframes scan` appear exactly once.

**Action**: Open `src/styles.css` and:
- Merge any duplicate `@theme inline` blocks into one
- Merge any duplicate `@layer base` blocks
- Remove duplicate `@keyframes` definitions
- Remove any duplicate `@layer components` or `@layer utilities` blocks

---

## 6. Audit Unused shadcn/ui Components

The `src/components/ui/` directory has **46 shadcn/ui components**. Many may have been auto-generated but never used. Removing unused ones reduces bundle size and clutter.

### How to audit

For each component file, search for imports across the codebase. A component is safe to delete if it has **zero imports** outside of its own file.

### Likely unused components (verify before deleting)

These are components that are common in shadcn installs but often unused in custom apps:

| Component | Check |
|-----------|-------|
| `aspect-ratio.tsx` | Search for `aspect-ratio` imports |
| `breadcrumb.tsx` | Search for `Breadcrumb` imports |
| `calendar.tsx` | Search for `Calendar` imports |
| `carousel.tsx` | Search for `Carousel` imports |
| `collapsible.tsx` | Search for `Collapsible` imports |
| `command.tsx` | Search for `Command` imports |
| `context-menu.tsx` | Search for `ContextMenu` imports |
| `drawer.tsx` | Search for `Drawer` imports |
| `hover-card.tsx` | Search for `HoverCard` imports |
| `input-otp.tsx` | Search for `InputOTP` imports |
| `menubar.tsx` | Search for `Menubar` imports |
| `navigation-menu.tsx` | Search for `NavigationMenu` imports |
| `pagination.tsx` | Search for `Pagination` imports |
| `resizable.tsx` | Search for `Resizable` imports |
| `slider.tsx` | Search for `Slider` imports |
| `sonner.tsx` | Search for `Sonner` or `Toaster` imports |
| `textarea.tsx` | Search for `Textarea` imports |
| `toggle.tsx` | Search for `Toggle` imports |
| `toggle-group.tsx` | Search for `ToggleGroup` imports |

**Action for each**: Run a search like:
```bash
grep -r "from.*components/ui/breadcrumb" src/ --include="*.tsx" --include="*.ts"
```
If no results (besides the component's own file), the component is safe to delete.

> [!WARNING]
> Do NOT delete components that ARE imported somewhere. Only delete those with zero external imports. When in doubt, keep the file.

After deleting unused UI components, also remove any corresponding unused Radix packages from `package.json` (e.g., if `carousel.tsx` is deleted, `embla-carousel-react` can be removed too).

---

## 7. Remove Stale Dependencies from `package.json`

Check if any dependencies are now orphaned:

| Package | Check | Action |
|---------|-------|--------|
| `motion` (framer-motion) | Search: `grep -r "from.*motion" src/` | If still imported in other pages → **KEEP**. If zero results → **REMOVE** |
| Any Radix packages matching deleted UI components | Cross-reference with §6 results | Remove if the component was deleted |

> [!NOTE]
> The `motion` package is likely still used by dashboard and workspace pages (e.g., `WorkspacePages.tsx`, `VerificationPage.tsx`). Verify before removing.

After removing any packages, run:
```bash
npm install
```

---

## 8. Verification Steps

After performing all cleanup actions, verify everything still works:

```bash
# 1. Install deps (in case anything changed)
npm install

# 2. Type-check — this catches any broken imports
npx tsc --noEmit

# 3. Dev server
npm run dev
```

### Manual checks:
- [ ] Landing page (`/`) loads with all sections, animations, video
- [ ] Login page (`/login`) renders, API login works
- [ ] Signup page (`/signup`) renders with account type picker, API signup works
- [ ] Dashboard loads after login
- [ ] Admin dashboard loads with admin credentials
- [ ] No console errors in browser DevTools
- [ ] `npm run build` completes without errors

---

## Summary of All Deletions

| Path | Type | Reason |
|------|------|--------|
| `frontend/landing-signIn-signUp/` | Directory | Fully migrated, dead code |
| `frontend/dist/` | Directory | Stale build output |
| `frontend/LANDING_AUTH_MIGRATION_PLAN.md` | File | Migration complete |
| `src/components/ui/<unused>.tsx` | Files (varies) | Unused shadcn components |

## Summary of All Edits

| Path | Change | Reason |
|------|--------|--------|
| `src/shared/utils/cn.ts` | Re-export from `@/lib/utils` | Deduplicate `cn()` |
| `src/styles.css` | Merge duplicate blocks | Clean CSS |
| `package.json` | Remove unused deps | Clean dependencies |
