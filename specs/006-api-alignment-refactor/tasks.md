# Tasks: Phase 4.5 API Alignment & Refactor

**Input**: Design documents from `/specs/006-api-alignment-refactor/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/flowx-resource-contract.md](./contracts/flowx-resource-contract.md), [quickstart.md](./quickstart.md)
**Tests**: Required by constitution Principle II and Principle III. Write each test task first, confirm it fails for the expected reason, then implement.
**Goal for cheaper LLM implementation**: Follow tasks in order. Do not edit `updated_frontend/`. Do not remove existing Phase 4 `/transactions`, `/admin/transactions`, or `/auth/*` routes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its phase prerequisites are complete because it touches different files.
- **[Story]**: User story label from `spec.md`; only user story phase tasks include it.
- Every task includes exact file paths. Keep all new code under `backend/` unless the task path is `specs/006-api-alignment-refactor/tasks.md`.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the FlowX implementation and test file layout without changing behavior.

- [X] T001 Create FlowX domain directories in `backend/app/Domain/FlowX/`, `backend/app/Http/Controllers/FlowX/`, `backend/app/Http/Requests/FlowX/`, `backend/app/Http/Resources/FlowX/`, `backend/tests/Feature/FlowX/Contract/`, `backend/tests/Feature/FlowX/Actions/`, and `backend/tests/Unit/Domain/FlowX/`
- [X] T002 [P] Copy the contract seed fixture from `updated_frontend/db.json` into `backend/tests/Fixtures/FlowX/db.json` for test assertions without modifying `updated_frontend/db.json`
- [X] T003 [P] Create a source-reference note listing every frontend contract source in `backend/tests/Fixtures/FlowX/README.md`
- [X] T004 [P] Create an empty manual smoke checklist file for implementation notes in `backend/tests/Feature/FlowX/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared FlowX store, response helpers, and routing base used by every story.

**CRITICAL**: No user story endpoint implementation should begin until this phase is complete.

### Tests First

- [X] T005 [P] Create failing unit tests for loading seeded users, transfers, wallets, config, static resources, and reset behavior in `backend/tests/Unit/Domain/FlowX/FlowXStoreTest.php`
- [X] T006 [P] Create failing unit tests for exact-match collection filtering by `email`, `password`, `userId`, and `status` in `backend/tests/Unit/Domain/FlowX/FlowXFilterTest.php`
- [X] T007 [P] Create failing unit tests for FlowX transfer lifecycle transitions and invalid-transition rejection in `backend/tests/Unit/Domain/FlowX/FlowXTransferLifecycleTest.php`
- [X] T008 [P] Create failing feature tests proving new FlowX routes do not require `Authorization` headers while existing Phase 4 route behavior still works in `backend/tests/Feature/FlowX/FlowXCompatibilityTest.php`

### Implementation

- [X] T009 Implement FlowX transfer status constants and terminal-status helpers in `backend/app/Domain/FlowX/FlowXTransferStatus.php`
- [X] T010 Implement FlowX id, timestamp, fee, net amount, and reference-number helper methods in `backend/app/Domain/FlowX/FlowXFactory.php`
- [X] T011 Implement the temporary seeded resource store with reset, all, find, create, patch, and replace methods in `backend/app/Domain/FlowX/FlowXStore.php`
- [X] T012 Implement exact-match filtering for resource collections in `backend/app/Domain/FlowX/FlowXFilters.php`
- [X] T013 Implement lifecycle action methods for match request, submit, risk approval, risk rejection, refund, and dispute-open side effects in `backend/app/Domain/FlowX/FlowXTransferLifecycle.php`
- [X] T014 Implement audit-log append helpers for admin and system actions in `backend/app/Domain/FlowX/FlowXAuditLogger.php`
- [X] T015 Implement a shared JSON response helper for resource objects, arrays, not-found, validation, and invalid-transition errors in `backend/app/Http/Controllers/FlowX/FlowXResponse.php`
- [X] T016 Register `App\Domain\FlowX\FlowXStore` as a singleton or scoped service in `backend/app/Providers/AppServiceProvider.php`
- [X] T017 Add explicit FlowX route group placeholders without auth middleware in `backend/routes/api.php`
- [X] T018 Run `vendor/bin/pest tests/Unit/Domain/FlowX/FlowXStoreTest.php tests/Unit/Domain/FlowX/FlowXFilterTest.php tests/Unit/Domain/FlowX/FlowXTransferLifecycleTest.php` from `backend/` and record any failures to fix in `specs/006-api-alignment-refactor/tasks.md`

**Checkpoint**: FlowX store and helper layer exists, seed data loads, filters work, lifecycle rules are unit-tested, and route group is header-free.

---

## Phase 3: User Story 1 - Sign in and load the FlowX workspace (Priority: P1) MVP

**Goal**: Demo user and demo admin can sign in through updated frontend credential lookup and load all dashboard resources.

**Independent Test**: Start backend on port 5000, sign in as `user@flowx.demo` and `admin@flowx.demo`, and verify both dashboards load without JSON Server.

### Tests for User Story 1

- [X] T019 [P] [US1] Create failing contract tests for `GET /users`, `GET /users?email=...`, `GET /users?email=...&password=...`, `GET /users/{id}`, `POST /users`, and `PATCH /users/{id}` in `backend/tests/Feature/FlowX/Contract/UsersContractTest.php`
- [X] T020 [P] [US1] Create failing contract tests for dashboard `GET /wallets?userId=...`, `GET /transfers?userId=...`, `GET /verifications?userId=...`, and `GET /notifications?userId=...` in `backend/tests/Feature/FlowX/Contract/UserDashboardContractTest.php`
- [X] T021 [P] [US1] Create failing contract tests for admin dashboard reads `GET /users`, `GET /transfers`, `GET /verifications`, `GET /disputes`, `GET /config`, and `GET /auditLogs` in `backend/tests/Feature/FlowX/Contract/AdminDashboardContractTest.php`
- [X] T022 [P] [US1] Create failing feature tests for signup-created starter user, wallet, verification, and welcome notification in `backend/tests/Feature/FlowX/Contract/SignupStarterResourcesTest.php`

### Implementation for User Story 1

- [X] T023 [US1] Implement `index`, `show`, `store`, and `patch` user resource methods in `backend/app/Http/Controllers/FlowX/UserResourceController.php`
- [X] T024 [US1] Implement wallet collection, create, and patch methods needed by signup and dashboard loading in `backend/app/Http/Controllers/FlowX/WalletResourceController.php`
- [X] T025 [US1] Implement transfer collection and show read methods for dashboard loading in `backend/app/Http/Controllers/FlowX/TransferResourceController.php`
- [X] T026 [US1] Implement verification collection and create methods needed by signup and dashboard loading in `backend/app/Http/Controllers/FlowX/VerificationResourceController.php`
- [X] T027 [US1] Implement notification collection and create methods needed by signup and dashboard loading in `backend/app/Http/Controllers/FlowX/NotificationResourceController.php`
- [X] T028 [US1] Implement dispute collection read method for admin dashboard loading in `backend/app/Http/Controllers/FlowX/DisputeResourceController.php`
- [X] T029 [US1] Implement config read method for admin dashboard loading in `backend/app/Http/Controllers/FlowX/ConfigResourceController.php`
- [X] T030 [US1] Implement audit-log collection and create methods for admin dashboard loading in `backend/app/Http/Controllers/FlowX/AuditLogResourceController.php`
- [X] T031 [US1] Wire US1 resource routes for users, wallets, transfers, verifications, notifications, disputes, config, and auditLogs in `backend/routes/api.php`
- [X] T032 [US1] Ensure `POST /users` fills safe defaults for missing `id`, `createdAt`, `role`, `accountType`, `country`, `phone`, `verified`, `kycLevel`, `verificationStatus`, `trustScore`, and `status` in `backend/app/Domain/FlowX/FlowXFactory.php`
- [X] T033 [US1] Ensure collection responses return plain JSON arrays and `GET /config` returns a plain JSON object in `backend/app/Http/Controllers/FlowX/FlowXResponse.php`
- [X] T034 [US1] Run `vendor/bin/pest tests/Feature/FlowX/Contract/UsersContractTest.php tests/Feature/FlowX/Contract/UserDashboardContractTest.php tests/Feature/FlowX/Contract/AdminDashboardContractTest.php tests/Feature/FlowX/Contract/SignupStarterResourcesTest.php` from `backend/`

**Checkpoint**: US1 is complete when demo login lookups return matching arrays, dashboard resource arrays have FlowX shapes, signup support works, and no new route requires auth headers.

---

## Phase 4: User Story 2 - Complete user transfer workflows with FlowX statuses (Priority: P1)

**Goal**: A user can create a transfer, view it, request a match, submit it, request payment confirmation, cancel by generic PATCH, and open a dispute.

**Independent Test**: Create a transfer from the updated frontend, then run match-request, submit, payment confirmation, cancellation, and dispute-open flows with refreshed resources.

### Tests for User Story 2

- [X] T035 [P] [US2] Create failing contract tests for `POST /transfers`, `GET /transfers`, `GET /transfers?userId=...`, `GET /transfers/{id}`, and `PATCH /transfers/{id}` in `backend/tests/Feature/FlowX/Contract/TransfersContractTest.php`
- [X] T036 [P] [US2] Create failing action tests for `POST /transfers/{id}/match-request` and invalid match transitions in `backend/tests/Feature/FlowX/Actions/MatchRequestActionTest.php`
- [X] T037 [P] [US2] Create failing action tests for `POST /transfers/{id}/submit` and invalid submit transitions in `backend/tests/Feature/FlowX/Actions/SubmitTransferActionTest.php`
- [X] T038 [P] [US2] Create failing action tests for `PATCH /transfers/{id}` with `paymentConfirmationRequested: true` and `status: CANCELLED` in `backend/tests/Feature/FlowX/Actions/TransferPatchActionTest.php`
- [X] T039 [P] [US2] Create failing contract tests for `POST /disputes`, `GET /disputes`, `GET /disputes?userId=...`, and `PATCH /disputes/{id}` in `backend/tests/Feature/FlowX/Contract/DisputesContractTest.php`

### Implementation for User Story 2

- [X] T040 [US2] Implement transfer create and patch methods with FlowX defaults in `backend/app/Http/Controllers/FlowX/TransferResourceController.php`
- [X] T041 [US2] Implement transfer action methods `matchRequest`, `submit`, `riskApproval`, `riskRejection`, and `refund` in `backend/app/Http/Controllers/FlowX/TransferActionController.php`
- [X] T042 [US2] Implement transfer action request validation for reason payloads and empty-body actions in `backend/app/Http/Requests/FlowX/TransferActionRequest.php`
- [X] T043 [US2] Implement dispute create, collection, and patch methods with transfer status side effects in `backend/app/Http/Controllers/FlowX/DisputeResourceController.php`
- [X] T044 [US2] Wire transfer create, patch, show, collection, match-request, submit, risk-approval, risk-rejection, refund, and dispute routes in `backend/routes/api.php`
- [X] T045 [US2] Ensure transfer creation returns `fee`, `exchangeRate`, `netAmount`, `referenceNumber`, `createdAt`, `updatedAt`, `riskLevel`, and `paymentConfirmationRequested` in `backend/app/Domain/FlowX/FlowXFactory.php`
- [X] T046 [US2] Ensure invalid dedicated transfer actions return HTTP 409 and leave stored transfer data unchanged in `backend/app/Domain/FlowX/FlowXTransferLifecycle.php`
- [X] T047 [US2] Run `vendor/bin/pest tests/Feature/FlowX/Contract/TransfersContractTest.php tests/Feature/FlowX/Actions/MatchRequestActionTest.php tests/Feature/FlowX/Actions/SubmitTransferActionTest.php tests/Feature/FlowX/Actions/TransferPatchActionTest.php tests/Feature/FlowX/Contract/DisputesContractTest.php` from `backend/`

**Checkpoint**: US2 is complete when the complete user transfer flow works with uppercase FlowX statuses and dedicated invalid transitions are rejected without mutation.

---

## Phase 5: User Story 3 - Use supporting workspace resources (Priority: P2)

**Goal**: User workspace screens for wallets, marketplace agents, notifications, and verification work without JSON Server.

**Independent Test**: As the demo user, open wallet, marketplace, notifications, and verification screens and confirm all resources load and mutable resources update.

### Tests for User Story 3

- [X] T048 [P] [US3] Create failing contract tests for `GET /wallets`, `GET /wallets?userId=...`, `POST /wallets`, and `PATCH /wallets/{id}` in `backend/tests/Feature/FlowX/Contract/WalletsContractTest.php`
- [X] T049 [P] [US3] Create failing contract tests for `GET /notifications`, `GET /notifications?userId=...`, `POST /notifications`, and `PATCH /notifications/{id}` in `backend/tests/Feature/FlowX/Contract/NotificationsContractTest.php`
- [X] T050 [P] [US3] Create failing contract tests for `GET /verifications`, `GET /verifications?userId=...`, `POST /verifications`, and `PATCH /verifications/{id}` in `backend/tests/Feature/FlowX/Contract/VerificationsContractTest.php`
- [X] T051 [P] [US3] Create failing contract tests for `GET /agents`, `GET /paymentMethods`, `GET /analytics`, `GET /activities`, and `GET /requests` in `backend/tests/Feature/FlowX/Contract/StaticResourcesContractTest.php`

### Implementation for User Story 3

- [X] T052 [US3] Complete wallet create and patch behavior with numeric balance preservation in `backend/app/Http/Controllers/FlowX/WalletResourceController.php`
- [X] T053 [US3] Complete notification create and patch behavior including marking notifications as read in `backend/app/Http/Controllers/FlowX/NotificationResourceController.php`
- [X] T054 [US3] Complete verification create and patch behavior with FlowX status vocabulary in `backend/app/Http/Controllers/FlowX/VerificationResourceController.php`
- [X] T055 [US3] Implement static resource collection reads for agents, paymentMethods, analytics, activities, and requests in `backend/app/Http/Controllers/FlowX/StaticResourceController.php`
- [X] T056 [US3] Wire wallet, notification, verification, agents, paymentMethods, analytics, activities, and requests routes in `backend/routes/api.php`
- [X] T057 [US3] Ensure missing item PATCH requests return HTTP 404 for wallets, notifications, and verifications in `backend/app/Http/Controllers/FlowX/FlowXResponse.php`
- [X] T058 [US3] Run `vendor/bin/pest tests/Feature/FlowX/Contract/WalletsContractTest.php tests/Feature/FlowX/Contract/NotificationsContractTest.php tests/Feature/FlowX/Contract/VerificationsContractTest.php tests/Feature/FlowX/Contract/StaticResourcesContractTest.php` from `backend/`

**Checkpoint**: US3 is complete when user supporting workspace pages render with backend data and updates persist for the local demo session.

---

## Phase 6: User Story 4 - Admin review, risk, disputes, and configuration (Priority: P3)

**Goal**: Admin can process verifications, risk reviews, disputes, refunds, config updates, and audit history in the updated frontend.

**Independent Test**: Sign in as admin, process a verification, approve or reject a risk review, resolve a dispute, refund a transfer, update config, and confirm audit logs refresh.

### Tests for User Story 4

- [X] T059 [P] [US4] Create failing contract tests for admin verification approval, rejection, and needs-info PATCH flows in `backend/tests/Feature/FlowX/Actions/AdminVerificationWorkflowTest.php`
- [X] T060 [P] [US4] Create failing action tests for `POST /transfers/{id}/risk-approval` and `POST /transfers/{id}/risk-rejection` including audit logs in `backend/tests/Feature/FlowX/Actions/AdminRiskWorkflowTest.php`
- [X] T061 [P] [US4] Create failing action tests for `PATCH /disputes/{id}` resolution and `POST /transfers/{id}/refund` including audit logs in `backend/tests/Feature/FlowX/Actions/AdminDisputeRefundWorkflowTest.php`
- [X] T062 [P] [US4] Create failing contract tests for `GET /config`, `PATCH /config`, `GET /auditLogs`, and `POST /auditLogs` in `backend/tests/Feature/FlowX/Contract/AdminConfigAuditContractTest.php`

### Implementation for User Story 4

- [X] T063 [US4] Add backend-owned audit log entries for verification PATCH outcomes in `backend/app/Http/Controllers/FlowX/VerificationResourceController.php`
- [X] T064 [US4] Add backend-owned audit log entries for risk approval, risk rejection, and refund actions in `backend/app/Http/Controllers/FlowX/TransferActionController.php`
- [X] T065 [US4] Complete dispute resolution patch behavior with `status`, `resolution`, and `resolvedAt` handling in `backend/app/Http/Controllers/FlowX/DisputeResourceController.php`
- [X] T066 [US4] Complete config patch behavior preserving `feePercent`, `exchangeRate`, `supportedCountries`, `supportedCurrencies`, `supportedCorridors`, and `paymentWindowMinutes` in `backend/app/Http/Controllers/FlowX/ConfigResourceController.php`
- [X] T067 [US4] Ensure audit-log create and collection routes preserve `actorId`, `actorRole`, `action`, `entityType`, `entityId`, and `createdAt` in `backend/app/Http/Controllers/FlowX/AuditLogResourceController.php`
- [X] T068 [US4] Ensure admin workflow routes remain header-free for Phase 4.5 and do not use `auth.bearer.presence` or `admin.guard` middleware in `backend/routes/api.php`
- [X] T069 [US4] Run `vendor/bin/pest tests/Feature/FlowX/Actions/AdminVerificationWorkflowTest.php tests/Feature/FlowX/Actions/AdminRiskWorkflowTest.php tests/Feature/FlowX/Actions/AdminDisputeRefundWorkflowTest.php tests/Feature/FlowX/Contract/AdminConfigAuditContractTest.php` from `backend/`

**Checkpoint**: US4 is complete when admin state-changing actions update resources, append audit logs, and keep the admin dashboard refreshable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation, compatibility, formatting, and manual demo checks across all stories.

- [X] T070 [P] Add a full FlowX route registry assertion covering all Phase 4.5 resource routes and existing Phase 4 compatibility routes in `backend/tests/Feature/FlowX/FlowXRouteRegistryTest.php`
- [X] T071 [P] Add CORS smoke coverage for the updated frontend origin and header-free FlowX resource calls in `backend/tests/Feature/FlowX/FlowXCorsTest.php`
- [X] T072 [P] Add not-found, validation, and invalid-transition error response coverage for representative FlowX endpoints in `backend/tests/Feature/FlowX/FlowXErrorResponseTest.php`
- [X] T073 Update backend quickstart notes for running Phase 4.5 tests and port 5000 serve command in `backend/README.md`
- [X] T074 Run the full backend test suite with `vendor/bin/pest` from `backend/` and fix failures in the related `backend/app/` or `backend/tests/` file
- [X] T075 Run Laravel formatting check with `vendor/bin/pint --test` from `backend/` and fix formatting in the reported `backend/app/` or `backend/tests/` file
- [X] T076 Run manual curl smoke commands from `specs/006-api-alignment-refactor/quickstart.md` and record pass/fail notes in `backend/tests/Feature/FlowX/README.md`
- [ ] T077 Start `php artisan serve --host=127.0.0.1 --port=5000` from `backend/`, run the updated frontend from `updated_frontend/`, and record manual user/admin demo results in `backend/tests/Feature/FlowX/README.md`
- [X] T078 Confirm no task modified frontend source by running `git diff -- updated_frontend` and record the result in `specs/006-api-alignment-refactor/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks every user story.
- **Phase 3 US1 MVP**: Depends on Phase 2.
- **Phase 4 US2**: Depends on Phase 2; can start after Phase 2, but manual end-to-end frontend validation is easier after US1.
- **Phase 5 US3**: Depends on Phase 2; some controllers may already exist from US1.
- **Phase 6 US4**: Depends on Phase 2; risk/refund work depends on transfer lifecycle code from US2.
- **Phase 7 Polish**: Depends on all intended story phases.

### User Story Dependencies

- **US1 (P1)**: MVP. No dependency on other stories after foundation.
- **US2 (P1)**: Core transfer workflow. Uses foundational store and lifecycle code. Independent contract tests can run without US1 UI validation.
- **US3 (P2)**: Supporting workspace resources. Shares wallet, verification, and notification controllers introduced in US1.
- **US4 (P3)**: Admin workflows. Depends on transfer, verification, dispute, config, and audit resources being present.

### Within Each User Story

1. Write contract/action tests first.
2. Run the story tests and confirm they fail for missing route, missing method, or shape mismatch.
3. Implement domain/controller/request/route code.
4. Run story-specific tests.
5. Do not edit `updated_frontend/`.

---

## Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 creates directories.
- T005, T006, T007, and T008 can run in parallel because they create separate test files.
- US1 test tasks T019 through T022 can run in parallel.
- US2 test tasks T035 through T039 can run in parallel.
- US3 test tasks T048 through T051 can run in parallel.
- US4 test tasks T059 through T062 can run in parallel.
- Polish test additions T070, T071, and T072 can run in parallel after all routes exist.

## Parallel Example: User Story 1

```text
Task: "T019 [US1] Create UsersContractTest.php"
Task: "T020 [US1] Create UserDashboardContractTest.php"
Task: "T021 [US1] Create AdminDashboardContractTest.php"
Task: "T022 [US1] Create SignupStarterResourcesTest.php"
```

## Parallel Example: User Story 2

```text
Task: "T036 [US2] Create MatchRequestActionTest.php"
Task: "T037 [US2] Create SubmitTransferActionTest.php"
Task: "T038 [US2] Create TransferPatchActionTest.php"
Task: "T039 [US2] Create DisputesContractTest.php"
```

## Parallel Example: User Story 3

```text
Task: "T048 [US3] Create WalletsContractTest.php"
Task: "T049 [US3] Create NotificationsContractTest.php"
Task: "T050 [US3] Create VerificationsContractTest.php"
Task: "T051 [US3] Create StaticResourcesContractTest.php"
```

## Parallel Example: User Story 4

```text
Task: "T059 [US4] Create AdminVerificationWorkflowTest.php"
Task: "T060 [US4] Create AdminRiskWorkflowTest.php"
Task: "T061 [US4] Create AdminDisputeRefundWorkflowTest.php"
Task: "T062 [US4] Create AdminConfigAuditContractTest.php"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational.
3. Complete Phase 3 US1.
4. Stop and validate demo user/admin login plus dashboard load against backend port 5000.

### Incremental Delivery

1. Deliver US1 for login and dashboards.
2. Deliver US2 for transfer creation and user transfer actions.
3. Deliver US3 for supporting user workspace screens.
4. Deliver US4 for admin workflow completion.
5. Run Phase 7 checks before handoff.

### Guidance for Smaller Models

- Implement only the task currently assigned.
- Read the referenced spec/contract file before editing.
- Do not rename existing Phase 4 controllers or routes.
- Do not add auth middleware to FlowX resource routes.
- Keep response bodies as plain JSON arrays or objects matching `updated_frontend/src/services/types.ts`.
- If a test needs seed data, load it from `backend/tests/Fixtures/FlowX/db.json`.
- If a generic PATCH includes a status change, preserve mock-compatible behavior.
- If a dedicated action route changes status, use `FlowXTransferLifecycle` and reject impossible transitions with HTTP 409.
