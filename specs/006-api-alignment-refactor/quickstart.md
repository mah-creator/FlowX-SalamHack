# Quickstart: Phase 4.5 API Alignment & Refactor

## Prerequisites

- PHP 8.3+
- Composer 2.x
- Node.js compatible with the updated frontend project
- Backend dependencies installed in `backend/`
- Updated frontend dependencies installed in `updated_frontend/`

## Run Backend on the Updated Frontend Port

From the repository root:

```powershell
cd backend
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=5000
```

The updated frontend's `apiClient.ts` defaults to `http://localhost:5000`, so no frontend code changes are required.

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

Seed data comes from `updated_frontend/db.json`.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@flowx.demo` | `admin123` |
| User | `user@flowx.demo` | `user123` |

## Manual User Workflow

1. Sign in as `user@flowx.demo`.
2. Confirm dashboard loads user, wallet, transfer, verification, and notification resources.
3. Create a transfer.
4. Request a match.
5. Submit the transfer.
6. Request payment confirmation.
7. Open a dispute.
8. Refresh the transfer/dispute pages and confirm state persists for the local demo session.

## Manual Admin Workflow

1. Sign in as `admin@flowx.demo`.
2. Confirm admin dashboard loads users, transfers, verifications, disputes, config, and audit logs.
3. Approve or reject a verification.
4. Open the risk queue and approve or reject an `UNDER_REVIEW` transfer.
5. Resolve a dispute.
6. Refund a transfer.
7. Update config.
8. Refresh audit logs and confirm admin state-changing actions are visible.

## Contract Smoke Commands

```powershell
cd backend

curl.exe -s http://127.0.0.1:5000/users?email=user%40flowx.demo^&password=user123
curl.exe -s http://127.0.0.1:5000/wallets?userId=usr-user
curl.exe -s http://127.0.0.1:5000/transfers?userId=usr-user
curl.exe -s http://127.0.0.1:5000/config
```

Create and action a transfer:

```powershell
curl.exe -s -X POST http://127.0.0.1:5000/transfers -H "Accept: application/json" -H "Content-Type: application/json" -d "{\"userId\":\"usr-user\",\"sourceCountry\":\"Gaza\",\"destinationCountry\":\"Egypt\",\"amount\":100,\"currency\":\"USD\",\"paymentMethod\":\"FlowX Wallet\",\"receiverName\":\"Demo Receiver\",\"receiverPaymentMethod\":\"Bank Transfer\"}"
curl.exe -s -X POST http://127.0.0.1:5000/transfers/{id}/match-request -H "Accept: application/json"
curl.exe -s -X POST http://127.0.0.1:5000/transfers/{id}/submit -H "Accept: application/json"
```

## Validation Commands

```powershell
cd backend
vendor/bin/pest --filter FlowX
vendor/bin/pest
vendor/bin/pint --test
```

Expected result after implementation: all existing Phase 4 tests continue to pass, FlowX contract tests pass, and no updated frontend screen depends on JSON Server.
