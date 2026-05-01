# Quickstart — Core API Implementation (Phase 4)

This walkthrough lets a reviewer verify Phase 4 end-to-end:

1. Start the backend.
2. Run the Phase 4 feature/unit tests.
3. Exercise the demo user journey by hand with `curl`.
4. Re-run the Phase 3 contract suite and confirm the 14/4
   pass/expected-stub split.

If you are coming to this branch fresh, read
[plan.md](./plan.md) first, then [data-model.md](./data-model.md)
and [contracts/state-machine.md](./contracts/state-machine.md).

---

## Prerequisites

- Phase 2 setup completed once for this clone (Composer dependencies
  installed under `backend/`, `.env` created, `APP_KEY` generated).
- PHP 8.3+ on `PATH`.
- Composer 2.x on `PATH`.
- A POSIX shell with `curl` and `jq` for the manual journey.

If the backend has never been set up:

```bash
cd backend/
composer install
cp .env.example .env
php artisan key:generate
```

Phase 4 introduces new env keys; copy them from the updated
`.env.example`:

```text
SALAMHACK_FEE_PERCENT=2
SALAMHACK_EXCHANGE_RATE=1.0
SALAMHACK_RATE_LOCK_MINUTES=15
SALAMHACK_PAYMENT_WINDOW_MINUTES=1
SALAMHACK_DEFAULT_SOURCE=Gaza
SALAMHACK_DEFAULT_DESTINATION=Egypt
SALAMHACK_TX_ID_PREFIX=TR-
SALAMHACK_ADMIN_TOKENS=admin-demo-token
```

`SALAMHACK_PAYMENT_WINDOW_MINUTES=1` keeps the demo journey under
spec SC-005's 90-second budget. `SALAMHACK_ADMIN_TOKENS` accepts a
comma-separated list; if left empty, every authenticated caller is
treated as an admin (research R-005). For the manual journey below,
populate it with a known-secret string so admin endpoints are
exercised against the same allowlist a real reviewer would use.

---

## 1. Start the backend

From the repo root:

```bash
cd backend/
php artisan serve --port=8000
```

The health probe is unchanged from Phase 2:

```bash
curl -s http://localhost:8000/healthz | jq
# Expected:
# {
#   "status": "ok",
#   "service": "salamhack-backend",
#   "version": "0.1.0"
# }
```

Keep the server process running in one terminal; run the steps below
from another.

---

## 2. Run the Phase 4 test suite

The full Phase 4 surface (state machine unit tests + endpoint feature
tests) runs through Pest:

```bash
cd backend/
vendor/bin/pest --filter "Domain\\Transactions|Transactions|Admin"
```

Expected: every test passes. The state-machine unit test exercises
all 14 transitions (T01..T14 from
[contracts/state-machine.md](./contracts/state-machine.md)); each
endpoint feature test exercises happy path, ownership check, and
invalid-state rejection.

For a single endpoint:

```bash
vendor/bin/pest --filter ProcessPayoutsTest
```

For the foundation smoke test (Phase 2; must still pass):

```bash
vendor/bin/pest --filter FoundationSmokeTest
```

---

## 3. Exercise the demo user journey by `curl`

This is the canonical happy path covered by spec SC-005. Total wall
time should be under 90 seconds when
`SALAMHACK_PAYMENT_WINDOW_MINUTES=1`.

Set a token for the run (any non-empty bearer token works for a
non-admin caller; the same token will produce a stable `usr-…` id
across calls):

```bash
TOKEN="user-demo-token"
ADMIN_TOKEN="admin-demo-token"   # must match SALAMHACK_ADMIN_TOKENS
BASE="http://localhost:8000"
H_AUTH="Authorization: Bearer ${TOKEN}"
H_JSON="Content-Type: application/json"
H_ACCEPT="Accept: application/json"
```

### 3a. List transactions (empty)

```bash
curl -s "${BASE}/transactions" -H "${H_AUTH}" -H "${H_ACCEPT}" | jq
# Expected:
# { "transactions": [] }
```

### 3b. Create a transaction (T01 → S1)

```bash
TX_JSON=$(curl -s -X POST "${BASE}/transactions" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" \
  -d '{"amount": 750, "currency": "USD"}')
echo "${TX_JSON}" | jq
TX_ID=$(echo "${TX_JSON}" | jq -r '.id')
# Expected: status code 201; id matches /^TR-\d{4}$/; status="Pending Request";
#           depositA=false, depositB=false; auditLog has one entry with action="request_created".
```

### 3c. Auto-match (T02: S1 → S2)

```bash
curl -s -X POST "${BASE}/transactions/${TX_ID}/auto-match" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}' | jq
# Expected: status="Match Found"; auditLog has new entry action="auto_matched".
```

### 3d. Confirm match (T03: S2 → S3)

```bash
curl -s -X POST "${BASE}/transactions/${TX_ID}/confirm-match" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}' | jq
# Expected: status="Awaiting Deposits"; auditLog gains action="match_confirmed".
```

### 3e. Confirm party A's deposit (T04: S3 → S4)

```bash
curl -s -X POST "${BASE}/transactions/${TX_ID}/deposits" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" \
  -d '{"party": "A"}' | jq
# Expected: status="Deposit Confirmed Partially"; depositA=true; depositB=false;
#           auditLog gains action="deposit_a_confirmed".
```

### 3f. Confirm party B's deposit (T05: S4 → S5)

```bash
curl -s -X POST "${BASE}/transactions/${TX_ID}/deposits" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" \
  -d '{"party": "B"}' | jq
# Expected: status="Both Deposits Confirmed"; depositB=true;
#           auditLog gains action="deposit_b_confirmed".
```

### 3g. Process payouts (T06: S5 → S6)

```bash
curl -s -X POST "${BASE}/transactions/${TX_ID}/process-payouts" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}' | jq
# Expected: status="Processing Payouts" (immediately);
#           auditLog gains action="payouts_processing_started".
```

### 3h. Wait the settlement window, then re-read (T07: S6 → S7)

With `SALAMHACK_PAYMENT_WINDOW_MINUTES=1`:

```bash
sleep 65
curl -s "${BASE}/transactions/${TX_ID}" \
  -H "${H_AUTH}" -H "${H_ACCEPT}" | jq
# Expected: status="Completed";
#           auditLog gains action="payouts_completed" with actor="system".
```

### 3i. Verify the audit log is chronological

```bash
curl -s "${BASE}/transactions/${TX_ID}" \
  -H "${H_AUTH}" -H "${H_ACCEPT}" | jq '.auditLog | map(.action)'
# Expected: [
#   "request_created",
#   "auto_matched",
#   "match_confirmed",
#   "deposit_a_confirmed",
#   "deposit_b_confirmed",
#   "payouts_processing_started",
#   "payouts_completed"
# ]
```

### 3j. Negative path: cancel a Completed transaction (T08 illegal)

```bash
curl -s -i -X POST "${BASE}/transactions/${TX_ID}/cancel" \
  -H "${H_AUTH}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}'
# Expected: HTTP/1.1 409 Conflict
#           body: {"error":{"code":"invalid_state", ...}}
```

### 3k. Negative path: ownership rejection

Create a second transaction with a different bearer token and try to
read it with the first:

```bash
OTHER_TOKEN="another-user-token"
OTHER_TX=$(curl -s -X POST "${BASE}/transactions" \
  -H "Authorization: Bearer ${OTHER_TOKEN}" -H "${H_JSON}" -H "${H_ACCEPT}" \
  -d '{"amount": 100, "currency": "EGP"}' | jq -r '.id')

curl -s -i "${BASE}/transactions/${OTHER_TX}" \
  -H "${H_AUTH}" -H "${H_ACCEPT}"
# Expected: HTTP/1.1 403 Forbidden
#           body: {"error":{"code":"forbidden", ...}}
```

### 3l. Admin journey (P3)

```bash
# As admin, list everything:
curl -s "${BASE}/admin/transactions" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" -H "${H_ACCEPT}" | jq '.transactions | length'

# Filter by status:
curl -s "${BASE}/admin/transactions?status=Completed" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" -H "${H_ACCEPT}" | jq

# Flag a transaction (T10):
curl -s -X POST "${BASE}/admin/transactions/${OTHER_TX}/flag-risk" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}' | jq

# Approve it back (T11):
curl -s -X POST "${BASE}/admin/transactions/${OTHER_TX}/approve" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" -H "${H_JSON}" -H "${H_ACCEPT}" -d '{}' | jq

# Non-admin caller hits an admin endpoint:
curl -s -i "${BASE}/admin/transactions" \
  -H "${H_AUTH}" -H "${H_ACCEPT}"
# Expected: HTTP/1.1 403 Forbidden
```

---

## 4. Re-run the Phase 3 contract suite

The Phase 3 suite is the integration gate for Phase 4. From the repo
root:

```bash
cd backend/
vendor/bin/pest tests/Contract
```

Expected (spec SC-003, SC-009):

- 14 endpoint groups passing (`EP-001..EP-014` excluding `EP-015..
  EP-018`).
- 4 endpoint groups classified as expected stub failures
  (`EP-015..EP-018`).
- 0 unexpected contract failures.
- 0 environment / setup failures.

If the suite reports anything other than "exit 0 with the 14/4
split", Phase 4 is not done — diagnose the unexpected row by row.

---

## Spot checks for reviewers

A reviewer who does not want to execute the suite end-to-end can spot
check Phase 4 with these one-liners:

```bash
# Route registry diff vs Phase 2 (path/method must be empty)
cd backend/
php artisan route:list --json \
  | jq '[.[] | {method: .method, uri: .uri}] | sort_by(.uri)' \
  > /tmp/phase4-routes.json
diff /tmp/phase4-routes.json <( jq -s '.[0]' specs/003-backend-foundation/contracts/route-registry.json 2>/dev/null || echo '[]' )
# Expected: empty diff for path/method.

# Transaction id format
curl -s -X POST http://localhost:8000/transactions \
  -H "Authorization: Bearer t" -H "Content-Type: application/json" \
  -d '{"amount":1,"currency":"USD"}' \
  | jq -r '.id' | grep -E '^TR-[0-9]{4}$'

# Audit log present
curl -s http://localhost:8000/transactions \
  -H "Authorization: Bearer t" \
  | jq '.transactions[0].auditLog | type'
# Expected: "array"

# Frontend untouched
git diff main..HEAD --stat -- frontend/
# Expected: empty (spec SC-008).
```

---

## Troubleshooting

- **`php artisan serve` says port 8000 in use**: kill the previous
  Phase 2/3 server (`lsof -i :8000`), or run with `--port=8001` and
  set `BASE=http://localhost:8001`.
- **`SALAMHACK_PAYMENT_WINDOW_MINUTES` change doesn't take effect**:
  Laravel caches config in some environments. Run
  `php artisan config:clear` after editing `.env`.
- **Auto-match returns 409 instead of 200**: the transaction is no
  longer in `Pending Request` (probably already auto-matched). Use
  `GET /transactions/{id}` to check status, then create a fresh
  transaction if needed.
- **Settlement does not happen after one minute**: lazy settlement
  fires on the *next* read, not on a clock tick. Hit
  `GET /transactions/{id}` after the window elapses to trigger it.
- **Admin endpoints succeed for a non-admin token in dev**:
  `SALAMHACK_ADMIN_TOKENS` is empty, which research R-005 documents
  as the zero-config fallback (every authenticated caller is treated
  as admin). Set the env var to a non-empty value to exercise the
  guard.
- **Process restart wipes data**: expected; spec FR-025 documents
  this. Phase 5 introduces durable storage.
