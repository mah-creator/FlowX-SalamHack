# Project Architecture

FlowX now follows a focused API-driven MVP structure. React pages call service modules, service modules call JSON Server through one API client, and backend business decisions remain outside the frontend.

## Folder Structure

- `src/flowx/` - app route composition and shared route pages.
- `src/features/<feature>/pages/` - route-level feature pages.
- `src/services/` - API-ready service layer for users, auth, transfers, verification, wallet, notifications, disputes, and admin workflows.
- `src/shared/components/layout/` - shared layout chrome such as Sidebar, Navbar, and Footer.
- `src/shared/types/` - role/session-facing shared types.
- `src/shared/utils/` - shared utility helpers.
- `src/components/ui/` - reusable UI primitives.

## API Boundary

- Components should not contain backend business decisions.
- Components should call `src/services/*` modules, then render API responses.
- Matching, deposit confirmation, payout completion, refunds, risk scoring, and verification decisions are backend/API responsibilities.
- JSON Server is only the local mock API. Replace `VITE_API_BASE_URL` when a real backend is available.

## Active MVP Routes

- User: `/dashboard`, `/transfer/new`, `/transfers`, `/transfer/status/:id`, `/verification`, `/wallet`, `/marketplace`, `/notifications`.
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/verification`, `/admin/transfers`, `/admin/requests`, `/admin/analytics`.

## Quality Gate

Run these before shipping:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
