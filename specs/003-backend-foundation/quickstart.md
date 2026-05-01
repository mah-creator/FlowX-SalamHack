# Quickstart — Backend Foundation (Phase 2)

This document walks a reviewer (or any new contributor) from a fresh
clone to a passing smoke test in under 10 minutes (spec SC-001).
Every command is copy-pasteable. If a step does not work as
documented, that is a Phase 2 defect — open an issue.

## Prerequisites

- **PHP** ≥ 8.3 (`php -v` shows 8.3.x or newer).
- **Composer** ≥ 2.x (`composer --version`).
- **Git** (`git --version`).
- A clone of this repository on branch `003-backend-foundation` or
  any branch where `backend/` exists.

If you do not have PHP 8.3, install it via your platform's package
manager (Homebrew on macOS: `brew install php@8.3`; on Windows: see
the [PHP for Windows](https://windows.php.net/) downloads). Composer
is at <https://getcomposer.org/>.

## One-time setup (≈ 3 minutes)

From the repository root:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

`composer install` reads `composer.json`'s pinned `php: "^8.3"` and
`laravel/framework: "^11.0"` and installs Laravel 11 plus Pest 3.x.
If your PHP is older, Composer fails with a readable platform-check
error.

## Configure CORS for the frontend (≈ 30 seconds)

Open `backend/.env` and confirm:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

This matches the React frontend's documented dev origin per
`frontend/package.json` (`"dev": "vite --port=3000 --host=0.0.0.0"`).
You can add more comma-separated origins for LAN testing
(`http://localhost:3000,http://192.168.1.10:3000`); a wildcard `*`
is rejected on startup outside `APP_ENV=local` (spec FR-006 / SC-006).

## Run the server (≈ 5 seconds)

```bash
php artisan serve --port=8000
```

The server listens on `http://localhost:8000`. Leave this terminal
running.

## Smoke-test the foundation (≈ 1 minute)

In a second terminal:

```bash
# Health endpoint — public, returns 200.
curl -s http://localhost:8000/healthz | jq
# Expected:
# { "status": "ok", "service": "salamhack-backend", "version": "0.1.0" }

# Stub endpoint without auth — 401 unauthenticated envelope.
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/transactions
# Expected: 401

# Same endpoint with any non-empty Bearer token — 501 not_implemented envelope.
curl -s -H "Authorization: Bearer testtoken" http://localhost:8000/transactions | jq
# Expected:
# { "error": { "code": "not_implemented", "message": "...", "details": { "endpoint_id": "EP-001" } } }

# Unknown path — 404 not_found envelope (NOT a Laravel default 404 page).
curl -s http://localhost:8000/this/does/not/exist | jq
# Expected:
# { "error": { "code": "not_found", "message": "...", "details": {} } }
```

## Run the Pest smoke test (≈ 5 seconds)

```bash
vendor/bin/pest --filter=FoundationSmokeTest
```

Expected output: 5 passing tests:

- `it returns 200 ok from the health endpoint`
- `it returns 501 with the not_implemented envelope from EP-001`
- `it returns the canonical not_found envelope on an unknown path`
- `it returns 401 unauthenticated when an authenticated endpoint is hit anonymously`
- `it passes the auth middleware when any non-empty Bearer token is present`

If any of these fail, the foundation is not wired correctly. Open an
issue or check the corresponding row in
[contracts/route-registry.md](./contracts/route-registry.md).

To run the full Phase 2 verification suite:

```bash
vendor/bin/pest
```

Expected output: all feature tests pass.

## Verify the route registry (≈ 30 seconds)

The route registry artefact at
[contracts/route-registry.md](./contracts/route-registry.md) lists
all 18 Phase 1 endpoints plus the health endpoint. To verify the
backend's running routes match it:

```bash
# Count Phase 1 routes (transactions/, admin/, auth/).
php artisan route:list --json \
  | jq '[.[] | select(.uri | startswith("transactions") or startswith("admin/") or startswith("auth/"))] | length'
# Expected: 18

# Confirm health endpoint.
php artisan route:list --json | jq '.[] | select(.uri == "healthz") | .method'
# Expected: "GET|HEAD"

# Confirm no /api prefix sneaked in.
php artisan route:list --json | jq '[.[] | select(.uri | startswith("api/"))] | length'
# Expected: 0
```

If any of these counts is off, the route registry artefact is out of
sync with the backend; fix the backend (not the artefact — the
artefact is the contract).

## Verify Phase 2 negative scope

No frontend files should be changed by Phase 2:

```bash
git diff -- frontend/
# Expected: no output
```

No persistence layer should exist in Phase 2:

```bash
find backend/app/Models backend/database/migrations -maxdepth 1 -type f
# Expected: no output
```

No controller should contain business logic or persistence calls:

```bash
grep -R "DB::\|Transaction::\|User::\|Schema::create\|Model" backend/app/Http/Controllers
# Expected: no output
```

On Windows PowerShell, equivalent checks:

```powershell
git diff -- frontend/
Get-ChildItem backend/app/Models,backend/database/migrations -ErrorAction SilentlyContinue
Select-String -Path backend/app/Http/Controllers/*.php -Pattern 'DB::|Transaction::|User::|Schema::create|Model'
```

## Where to look next

- [spec.md](./spec.md) — the Phase 2 specification with the four
  resolved clarifications.
- [plan.md](./plan.md) — this implementation plan, including
  Constitution Check and Complexity Tracking.
- [research.md](./research.md) — plan-time decisions
  (R-001..R-013).
- [data-model.md](./data-model.md) — Phase 2 structural entities
  (Backend Project, Stub Endpoint, Health Endpoint, etc.).
- [contracts/route-registry.md](./contracts/route-registry.md) —
  the canonical mapping from Phase 1 endpoint IDs to Laravel routes.
- `specs/002-api-discovery/api-contract.md` — Phase 1's API contract
  (the upstream source of truth for every endpoint's wire shape).

## Common issues

- **`composer install` fails with platform check** — your PHP is
  older than 8.3. Upgrade or use `composer install --ignore-platform-reqs`
  only at your own risk (CI does NOT pass this flag and will catch
  the mismatch).
- **`php artisan key:generate` fails** — check that `.env` exists.
  Re-run `cp .env.example .env`.
- **`curl /healthz` returns connection refused** — the server is not
  running, or it bound to a different port. Check the `php artisan
  serve` terminal.
- **`curl /transactions` returns 200 with an HTML page** — Laravel's
  `web` route fallback is intercepting. Confirm
  `bootstrap/app.php` sets `apiPrefix: ''` and that the API mount
  reconfiguration is in place (Complexity Tracking row 1).
- **CORS rejects the frontend** — confirm `.env`'s
  `CORS_ALLOWED_ORIGINS` includes the actual origin the frontend dev
  server uses (`http://localhost:3000` by default).
