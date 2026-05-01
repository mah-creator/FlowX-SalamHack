# FlowX Mock API Ready Version

This version is ready for an API-driven MVP frontend backed locally by JSON Server. The frontend calls service modules and renders API responses; backend business decisions belong to the API.

## Start The App

Open two terminals:

```bash
npm install
npm run server
```

Then:

```bash
npm run dev
```

Frontend: http://localhost:5173
Mock API: http://localhost:5000

## Local Login Accounts

User:

```text
Email: user@flowx.demo
Password: user123
```

Admin:

```text
Email: admin@flowx.demo
Password: admin123
```

## API Entities In db.json

- `config`
- `users`
- `wallets`
- `transfers`
- `verifications`
- `disputes`
- `notifications`
- `auditLogs`
- `paymentMethods`
- `agents`

## Role Behavior

User role sees dashboard, new transfer, transfer history/status, wallet, verified agents, notifications, and identity verification.

Admin role sees admin dashboard, users, verification queue, all transfers, requests queue, and analytics.

## Real API Migration

When the backend is ready, keep compatible response shapes or adapt the service layer under `src/services`, then change:

```env
VITE_API_BASE_URL=https://your-real-api.com
```
