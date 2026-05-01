# Tasks: Phase 5 Data Persistence

**Input**: Design documents from `/specs/007-data-persistence/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/flowx-persistence-contract.md](./contracts/flowx-persistence-contract.md), [quickstart.md](./quickstart.md)

**Tests**: Required by the constitution. Write each test task first and confirm it fails for the expected reason before implementing the matching code.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after the foundational persistence layer is in place.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase because it touches different files and does not depend on incomplete work.
- **[Story]**: Required only for user story phases.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare SQLite configuration, test helpers, and baseline fixture access without changing frontend-visible behavior.

- [X] T001 Add local SQLite defaults and comments for `DB_CONNECTION=sqlite` and `DB_DATABASE=database/database.sqlite` in `backend/.env.example`
- [X] T002 Create the empty SQLite database placeholder file and keep it out of commits via `backend/database/database.sqlite`
- [X] T003 [P] Add `database/database.sqlite` ignore rules while preserving migration tracking in `backend/.gitignore`
- [X] T004 [P] Create a FlowX persistence test helper trait with SQLite setup and migration helpers in `backend/tests/Concerns/UsesFlowXDatabase.php`
- [X] T005 [P] Create a FlowX fixture loader helper that reads `backend/tests/Fixtures/FlowX/db.json` in `backend/tests/Support/FlowXFixture.php`
- [X] T006 Document the Phase 5 SQLite assumptions for implementers in `backend/tests/Feature/FlowX/Persistence/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the schema, models, seeders, and service binding needed before any story can persist data.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [X] T007 Write failing migration coverage for all FlowX table names and key columns in `backend/tests/Feature/FlowX/Persistence/FlowXMigrationSchemaTest.php`
- [X] T008 Write failing model serialization coverage for exact frontend field names in `backend/tests/Unit/Domain/FlowX/FlowXEloquentSerializationTest.php`
- [X] T009 Create `flowx_users` table migration with unique `email` and frontend-visible string `id` in `backend/database/migrations/2026_04_30_000001_create_flowx_users_table.php`
- [X] T010 Create `flowx_transfers` table migration with canonical transfer columns, `user_id`, unique `reference_number`, and status indexes in `backend/database/migrations/2026_04_30_000002_create_flowx_transfers_table.php`
- [X] T011 Create `flowx_wallets`, `flowx_verifications`, `flowx_disputes`, and `flowx_notifications` migrations with foreign keys to FlowX users/transfers in `backend/database/migrations/2026_04_30_000003_create_flowx_user_resource_tables.php`
- [X] T012 Create `flowx_configurations`, `flowx_audit_logs`, `flowx_agents`, `flowx_payment_methods`, `flowx_analytics`, `flowx_activities`, and `flowx_requests` migrations in `backend/database/migrations/2026_04_30_000004_create_flowx_support_tables.php`
- [X] T013 [P] Create the `FlowXUser` Eloquent model with casts and frontend array conversion in `backend/app/Models/FlowXUser.php`
- [X] T014 [P] Create the `FlowXTransfer` Eloquent model with casts, status constants, relationships, and frontend array conversion in `backend/app/Models/FlowXTransfer.php`
- [X] T015 [P] Create wallet, verification, dispute, and notification Eloquent models with casts and frontend array conversion in `backend/app/Models/FlowXWallet.php`, `backend/app/Models/FlowXVerification.php`, `backend/app/Models/FlowXDispute.php`, and `backend/app/Models/FlowXNotification.php`
- [X] T016 [P] Create configuration, audit log, agent, payment method, analytics, activity, and request Eloquent models in `backend/app/Models/FlowXConfiguration.php`, `backend/app/Models/FlowXAuditLog.php`, `backend/app/Models/FlowXAgent.php`, `backend/app/Models/FlowXPaymentMethod.php`, `backend/app/Models/FlowXAnalyticsMetric.php`, `backend/app/Models/FlowXActivity.php`, and `backend/app/Models/FlowXRequest.php`
- [X] T017 Implement a reusable frontend field mapper for snake_case storage to camelCase FlowX arrays in `backend/app/Domain/FlowX/FlowXPayloadMapper.php`
- [X] T018 Implement an Eloquent-backed store with the same public methods as the temporary store in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T019 Bind `FlowXStore` callers to the Eloquent-backed implementation through a stable interface or alias in `backend/app/Providers/DomainServiceProvider.php`
- [X] T020 Update existing FlowX controllers to depend on the bound store contract without changing response shapes in `backend/app/Http/Controllers/FlowX/UserResourceController.php`, `backend/app/Http/Controllers/FlowX/TransferResourceController.php`, `backend/app/Http/Controllers/FlowX/WalletResourceController.php`, `backend/app/Http/Controllers/FlowX/VerificationResourceController.php`, `backend/app/Http/Controllers/FlowX/DisputeResourceController.php`, `backend/app/Http/Controllers/FlowX/NotificationResourceController.php`, `backend/app/Http/Controllers/FlowX/ConfigResourceController.php`, `backend/app/Http/Controllers/FlowX/AuditLogResourceController.php`, and `backend/app/Http/Controllers/FlowX/StaticResourceController.php`
- [X] T021 Run the schema and serialization tests and make them pass using `backend/tests/Feature/FlowX/Persistence/FlowXMigrationSchemaTest.php` and `backend/tests/Unit/Domain/FlowX/FlowXEloquentSerializationTest.php`

**Checkpoint**: The database schema, models, and store abstraction are ready; user story work can begin.

---

## Phase 3: User Story 1 - Preserve FlowX data across restarts (Priority: P1) MVP

**Goal**: User-created and admin-updated FlowX data survives backend restarts while the Phase 4.5 frontend contract remains unchanged.

**Independent Test**: Create a FlowX transfer, patch it, update config, write an audit log, rebuild the app/store lifecycle, then read the same records with the same identifiers and frontend fields.

### Tests for User Story 1

- [X] T022 [P] [US1] Write failing transfer durability test covering create, read by id, filtered read, patch, and app/store reload in `backend/tests/Feature/FlowX/Persistence/FlowXTransferDurabilityTest.php`
- [X] T023 [P] [US1] Write failing config and audit log durability test covering update, audit creation, and app/store reload in `backend/tests/Feature/FlowX/Persistence/FlowXConfigAuditDurabilityTest.php`
- [X] T024 [P] [US1] Write failing Phase 4.5 compatibility regression test that runs existing FlowX contract requests against SQLite in `backend/tests/Feature/FlowX/Persistence/FlowXContractOnDatabaseTest.php`

### Implementation for User Story 1

- [X] T025 [US1] Implement transfer create/find/all/patch persistence in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T026 [US1] Implement config read/patch persistence with single active configuration behavior in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T027 [US1] Implement audit log create/all persistence in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T028 [US1] Preserve FlowX transfer defaults from `FlowXFactory::transfer` while storing through Eloquent in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T029 [US1] Ensure exact-match filters for `userId` and `status` are translated to SQLite queries in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T030 [US1] Update `FlowXAuditLogger` to write through the Eloquent-backed store without changing audit log response fields in `backend/app/Domain/FlowX/FlowXAuditLogger.php`
- [X] T031 [US1] Keep `FlowXResponse` error envelopes unchanged for missing persisted items and invalid actions in `backend/app/Http/Controllers/FlowX/FlowXResponse.php`
- [X] T032 [US1] Run and pass US1 tests in `backend/tests/Feature/FlowX/Persistence/FlowXTransferDurabilityTest.php`, `backend/tests/Feature/FlowX/Persistence/FlowXConfigAuditDurabilityTest.php`, and `backend/tests/Feature/FlowX/Persistence/FlowXContractOnDatabaseTest.php`

**Checkpoint**: User Story 1 is independently complete when created/updated FlowX transfer, config, and audit data remain visible after app/store reload and existing FlowX contract behavior still passes.

---

## Phase 4: User Story 2 - Initialize predictable demo data (Priority: P1)

**Goal**: An empty SQLite database can be initialized with baseline FlowX demo data once, and repeated seeding does not duplicate or overwrite user-created data.

**Independent Test**: Run migrations and seeders from an empty database, verify demo dashboard resources exist, create an extra record, run the seeder three more times, and verify no duplicates and no user-created data loss.

### Tests for User Story 2

- [X] T033 [P] [US2] Write failing idempotent seeding test for baseline users, wallets, config, agents, and payment methods in `backend/tests/Feature/FlowX/Persistence/FlowXSeederIdempotencyTest.php`
- [X] T034 [P] [US2] Write failing empty database dashboard readiness test for demo user and admin resources in `backend/tests/Feature/FlowX/Persistence/FlowXSeededDashboardReadinessTest.php`
- [X] T035 [P] [US2] Write failing explicit reset behavior test that proves reset is intentional and ordinary seeding does not wipe user-created records in `backend/tests/Feature/FlowX/Persistence/FlowXDemoResetTest.php`

### Implementation for User Story 2

- [X] T036 [US2] Create an idempotent baseline seeder that imports `backend/tests/Fixtures/FlowX/db.json` into FlowX Eloquent models in `backend/database/seeders/FlowXBaselineSeeder.php`
- [X] T037 [US2] Update the root database seeder to call `FlowXBaselineSeeder` without creating unrelated Laravel sample users in `backend/database/seeders/DatabaseSeeder.php`
- [X] T038 [US2] Implement idempotent upsert logic for users, wallets, transfers, verifications, disputes, notifications, config, audit logs, and reference resources in `backend/database/seeders/FlowXBaselineSeeder.php`
- [X] T039 [US2] Create an explicit local demo reset command that clears FlowX tables and reruns the baseline seeder in `backend/app/Console/Commands/FlowXResetDemoDataCommand.php`
- [X] T040 [US2] Register the explicit reset command in `backend/routes/console.php`
- [X] T041 [US2] Update the Phase 5 quickstart with the final reset command name and SQLite setup details in `specs/007-data-persistence/quickstart.md`
- [X] T042 [US2] Run and pass US2 tests in `backend/tests/Feature/FlowX/Persistence/FlowXSeederIdempotencyTest.php`, `backend/tests/Feature/FlowX/Persistence/FlowXSeededDashboardReadinessTest.php`, and `backend/tests/Feature/FlowX/Persistence/FlowXDemoResetTest.php`

**Checkpoint**: User Story 2 is independently complete when an empty database seeds successfully, repeated seeding is non-destructive, and reset is explicit.

---

## Phase 5: User Story 3 - Maintain data integrity during workflows (Priority: P2)

**Goal**: Transfer, dispute, verification, wallet, notification, and configuration workflows persist related changes consistently and reject invalid orphan writes.

**Independent Test**: Complete transfer and admin workflows, create and resolve a dispute, update verification and wallet data, then verify relationships and audit logs remain consistent after reload; invalid related-record writes leave no orphaned rows.

### Tests for User Story 3

- [X] T043 [P] [US3] Write failing relationship integrity test for missing `userId`, `transferId`, and notification owner writes in `backend/tests/Feature/FlowX/Persistence/FlowXRelationshipIntegrityTest.php`
- [X] T044 [P] [US3] Write failing transfer lifecycle persistence test for match, submit, risk approval/rejection, refund, and invalid transitions in `backend/tests/Feature/FlowX/Persistence/FlowXLifecyclePersistenceTest.php`
- [X] T045 [P] [US3] Write failing dispute workflow persistence test covering dispute open, transfer status update, resolve/reject, and reload in `backend/tests/Feature/FlowX/Persistence/FlowXDisputePersistenceTest.php`
- [X] T046 [P] [US3] Write failing verification, wallet, and notification persistence test covering patch behavior and reload in `backend/tests/Feature/FlowX/Persistence/FlowXUserResourcePersistenceTest.php`

### Implementation for User Story 3

- [X] T047 [US3] Add relationship validation and no-orphan failure behavior for create and patch operations in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T048 [US3] Implement transaction-wrapped multi-record writes for dispute creation, verification admin updates, refunds, risk actions, and config audit events in `backend/app/Domain/FlowX/FlowXEloquentStore.php`
- [X] T049 [US3] Persist lifecycle action results through the canonical `FlowXTransfer` model in `backend/app/Domain/FlowX/FlowXTransferLifecycle.php`
- [X] T050 [US3] Update `TransferActionController` to use persisted lifecycle results and preserve invalid-transition responses in `backend/app/Http/Controllers/FlowX/TransferActionController.php`
- [X] T051 [US3] Implement dispute create/patch side effects and response shaping in `backend/app/Http/Controllers/FlowX/DisputeResourceController.php`
- [X] T052 [US3] Implement verification patch side effects for user verification fields and audit logging in `backend/app/Http/Controllers/FlowX/VerificationResourceController.php`
- [X] T053 [US3] Implement wallet and notification persisted patch behavior in `backend/app/Http/Controllers/FlowX/WalletResourceController.php` and `backend/app/Http/Controllers/FlowX/NotificationResourceController.php`
- [X] T054 [US3] Run and pass US3 tests in `backend/tests/Feature/FlowX/Persistence/FlowXRelationshipIntegrityTest.php`, `backend/tests/Feature/FlowX/Persistence/FlowXLifecyclePersistenceTest.php`, `backend/tests/Feature/FlowX/Persistence/FlowXDisputePersistenceTest.php`, and `backend/tests/Feature/FlowX/Persistence/FlowXUserResourcePersistenceTest.php`

**Checkpoint**: User Story 3 is independently complete when workflow state is durable and invalid relationship writes leave zero orphaned records.

---

## Phase 6: User Story 4 - Keep legacy Phase 4 consumers working (Priority: P3)

**Goal**: Existing Phase 4 auth and transaction behavior continues to pass while FlowX transfers are canonical for overlapping transfer concepts.

**Independent Test**: Run existing Phase 4 transaction/admin/auth tests and FlowX persistence tests in the same database-backed test run; verify overlapping transaction operations adapt to canonical FlowX transfer data.

### Tests for User Story 4

- [X] T055 [P] [US4] Write failing legacy transaction compatibility test against canonical FlowX transfers in `backend/tests/Feature/FlowX/Persistence/LegacyTransactionCompatibilityTest.php`
- [X] T056 [P] [US4] Write failing legacy admin compatibility test for approve, refund, flag-risk, and resolve-dispute behavior using canonical FlowX transfer data in `backend/tests/Feature/FlowX/Persistence/LegacyAdminCompatibilityTest.php`
- [X] T057 [P] [US4] Write failing full persistent suite smoke test that runs representative Phase 4 and Phase 4.5 requests in one test in `backend/tests/Feature/FlowX/Persistence/PersistentCompatibilitySmokeTest.php`

### Implementation for User Story 4

- [X] T058 [US4] Create a mapper between canonical FlowX transfers and legacy transaction arrays/resources in `backend/app/Domain/Transactions/FlowXTransactionCompatibilityMapper.php`
- [X] T059 [US4] Adapt `TransactionStore` to read/write overlapping transaction concepts through canonical FlowX transfer data where applicable in `backend/app/Domain/Transactions/TransactionStore.php`
- [X] T060 [US4] Adapt `TransactionController` to preserve existing Phase 4 response shapes while using compatibility-mapped FlowX transfer data in `backend/app/Http/Controllers/TransactionController.php`
- [X] T061 [US4] Adapt `AdminTransactionController` to preserve existing Phase 4 admin response shapes while using compatibility-mapped FlowX transfer data in `backend/app/Http/Controllers/AdminTransactionController.php`
- [X] T062 [US4] Keep existing auth route behavior unchanged while ensuring signup-created FlowX resources persist in `backend/app/Http/Controllers/AuthController.php`
- [X] T063 [US4] Run and pass US4 tests in `backend/tests/Feature/FlowX/Persistence/LegacyTransactionCompatibilityTest.php`, `backend/tests/Feature/FlowX/Persistence/LegacyAdminCompatibilityTest.php`, and `backend/tests/Feature/FlowX/Persistence/PersistentCompatibilitySmokeTest.php`

**Checkpoint**: User Story 4 is independently complete when legacy Phase 4 behavior and FlowX persistence behavior pass together without duplicate transfer state.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and documentation that spans all stories.

- [X] T064 [P] Update backend README with SQLite migrate/seed/reset commands in `backend/README.md`
- [X] T065 [P] Update Phase 5 implementation notes with final file list and validation commands in `specs/007-data-persistence/quickstart.md`
- [X] T066 Remove or quarantine obsolete JSON-store reset behavior so tests no longer depend on `backend/storage/framework/flowx-store.json` in `backend/app/Domain/FlowX/FlowXStore.php`
- [X] T067 Ensure all FlowX persistence tests use SQLite test isolation and do not read or write `backend/storage/framework/flowx-store.json` in `backend/tests/Concerns/UsesFlowXDatabase.php`
- [X] T068 Run the complete FlowX test suite and fix regressions in `backend/tests/Feature/FlowX`
- [X] T069 Run the complete backend test suite and fix regressions in `backend/tests`
- [X] T070 Run Pint and fix formatting issues in `backend/app`, `backend/database`, and `backend/tests`
- [X] T071 Verify the quickstart manually against `updated_frontend` without modifying frontend source in `specs/007-data-persistence/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and is the MVP.
- **Phase 4 US2**: Depends on Phase 2; can run after or alongside US1 if store/migration interfaces are stable.
- **Phase 5 US3**: Depends on Phase 2 and benefits from US1 persistence behavior.
- **Phase 6 US4**: Depends on Phase 2 and canonical FlowX transfer persistence from US1.
- **Phase 7 Polish**: Depends on all selected user stories.

### User Story Dependencies

- **US1 Preserve FlowX data across restarts**: Required MVP; no dependency on other stories after foundation.
- **US2 Initialize predictable demo data**: Independent after foundation; required for local demo readiness.
- **US3 Maintain data integrity during workflows**: Builds on persisted entities and lifecycle behavior.
- **US4 Keep legacy Phase 4 consumers working**: Builds on canonical FlowX transfer persistence.

### Within Each User Story

- Write tests first and confirm they fail.
- Implement models/store/service behavior before controller adaptation.
- Preserve existing response shapes while changing storage.
- Run story-specific tests before moving to the next story.

## Parallel Opportunities

- Setup helpers T004, T005, and T006 can run in parallel.
- Model tasks T013, T014, T015, and T016 can run in parallel after migrations are drafted.
- US1 tests T022, T023, and T024 can run in parallel.
- US2 tests T033, T034, and T035 can run in parallel.
- US3 tests T043, T044, T045, and T046 can run in parallel.
- US4 tests T055, T056, and T057 can run in parallel.
- Documentation tasks T064 and T065 can run in parallel near the end.

## Parallel Example: User Story 1

```text
Task: "T022 Write failing transfer durability test in backend/tests/Feature/FlowX/Persistence/FlowXTransferDurabilityTest.php"
Task: "T023 Write failing config and audit log durability test in backend/tests/Feature/FlowX/Persistence/FlowXConfigAuditDurabilityTest.php"
Task: "T024 Write failing Phase 4.5 compatibility regression test in backend/tests/Feature/FlowX/Persistence/FlowXContractOnDatabaseTest.php"
```

## Parallel Example: User Story 2

```text
Task: "T033 Write failing idempotent seeding test in backend/tests/Feature/FlowX/Persistence/FlowXSeederIdempotencyTest.php"
Task: "T034 Write failing empty database dashboard readiness test in backend/tests/Feature/FlowX/Persistence/FlowXSeededDashboardReadinessTest.php"
Task: "T035 Write failing explicit reset behavior test in backend/tests/Feature/FlowX/Persistence/FlowXDemoResetTest.php"
```

## Parallel Example: User Story 3

```text
Task: "T043 Write failing relationship integrity test in backend/tests/Feature/FlowX/Persistence/FlowXRelationshipIntegrityTest.php"
Task: "T044 Write failing transfer lifecycle persistence test in backend/tests/Feature/FlowX/Persistence/FlowXLifecyclePersistenceTest.php"
Task: "T045 Write failing dispute workflow persistence test in backend/tests/Feature/FlowX/Persistence/FlowXDisputePersistenceTest.php"
Task: "T046 Write failing verification, wallet, and notification persistence test in backend/tests/Feature/FlowX/Persistence/FlowXUserResourcePersistenceTest.php"
```

## Parallel Example: User Story 4

```text
Task: "T055 Write failing legacy transaction compatibility test in backend/tests/Feature/FlowX/Persistence/LegacyTransactionCompatibilityTest.php"
Task: "T056 Write failing legacy admin compatibility test in backend/tests/Feature/FlowX/Persistence/LegacyAdminCompatibilityTest.php"
Task: "T057 Write failing full persistent suite smoke test in backend/tests/Feature/FlowX/Persistence/PersistentCompatibilitySmokeTest.php"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup tasks.
2. Complete Phase 2 foundational schema/model/store tasks.
3. Complete Phase 3 User Story 1.
4. Stop and validate US1 independently with its three persistence tests plus existing FlowX contract tests.

### Incremental Delivery

1. Setup plus foundation creates the SQLite/Eloquent persistence layer.
2. US1 proves durable writes and the unchanged FlowX contract.
3. US2 adds reliable baseline initialization and reset.
4. US3 hardens relationship integrity and workflow transactions.
5. US4 restores and validates legacy compatibility on canonical FlowX transfer data.
6. Polish runs full tests, formatting, and manual quickstart verification.

### Guidance for a Smaller Implementation Model

- Do not edit `updated_frontend`.
- Do not change existing route paths or response field names.
- Prefer adding new files over large rewrites unless a task names an existing file.
- Keep `FlowXFactory` defaults unless a test proves they conflict with persistence.
- Use Eloquent casts and mapper methods to preserve camelCase frontend fields.
- Run the named tests after each checkpoint before continuing.
