# Quickstart: Phase 5 Data Persistence

## Prerequisites

- PHP 8.3+
- Composer 2.x
- SQLite support enabled for PHP
- Backend dependencies installed in `backend/`
- Updated frontend dependencies installed in `updated_frontend/`

## Configure SQLite

From the repository root:

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Set local database values in `backend/.env`:

```text
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Create the SQLite file if it does not exist:

```powershell
if (!(Test-Path database\\database.sqlite)) { New-Item -ItemType File database\\database.sqlite | Out-Null }
```

## Initialize Persistent Baseline Data

```powershell
php artisan migrate
php artisan db:seed
```

Seeders are expected to create baseline FlowX demo data only when missing. Re-running `php artisan db:seed` must not duplicate baseline users, wallets, configuration, agents, or payment methods and must not remove user-created records.

## Explicit Demo Reset

Use the explicit reset command to intentionally restore local demo data to baseline:

```powershell
php artisan flowx:reset-demo-data
```

Reset is explicit; ordinary startup and ordinary seeding must not wipe persisted data.

## Run Backend on the Updated Frontend Port

```powershell
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=5000
```

## Run Updated Frontend

In a second terminal:

```powershell
cd updated_frontend
npm install
npm run dev
```

If needed, set only the existing base URL configuration:

```powershell
$env:VITE_API_BASE_URL='http://localhost:5000'
npm run dev
```

## Demo Accounts

Baseline data is derived from the FlowX demo dataset.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@flowx.demo` | `admin123` |
| User | `user@flowx.demo` | `user123` |

## Persistence Smoke Test

1. Sign in as `user@flowx.demo`.
2. Create a transfer.
3. Request a match or submit the transfer.
4. Sign in as `admin@flowx.demo`.
5. Update configuration or perform an admin transfer/dispute action.
6. Stop and restart `php artisan serve`.
7. Reload the updated frontend.
8. Confirm the transfer, updated configuration, and audit log entries remain visible.

## Contract and Persistence Validation

```powershell
cd backend
vendor/bin/pest --filter FlowX
vendor/bin/pest
vendor/bin/pint --test
```

Expected result after implementation: Phase 4 compatibility tests pass, Phase 4.5 FlowX contract tests pass, and new Phase 5 persistence tests prove data survives backend restarts/reloads.
