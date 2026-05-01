<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1
Bump rationale: PATCH — clarifications to the Governance section. Adds
explicit reviewer-approval clauses to the amendment process and to the
deviation-handling process. No new principle and no removed obligation.

Modified principles: none renamed; no principle bodies altered.

Added sections: none.
Removed sections: none.

Modified sections:
  - Governance — amendment process bullet now lists (d) at least one PR
    reviewer approval.
  - Governance — compliance review bullet now requires (i) recording in
    Complexity Tracking, (ii) written justification, (iii) at least one
    PR reviewer approval for justified deviations.

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — no change required (the
       existing Constitution Check section continues to be populated by
       feature plans; the new approval clauses do not change the gate
       shape).
  - ✅ .specify/templates/spec-template.md — no change required.
  - ✅ .specify/templates/tasks-template.md — no change required.
  - ✅ .specify/templates/checklist-template.md — no change required.

Follow-up TODOs: none.
-->

<!--
SYNC IMPACT REPORT
==================
Version change: (uninitialized template) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution replacing the
unfilled template. MAJOR by convention for first ratified version.

Modified principles: N/A (initial ratification — placeholders replaced)
  - PRINCIPLE_1 -> I. Frontend-Contract Fidelity (NON-NEGOTIABLE)
  - PRINCIPLE_2 -> II. Test-First Development (NON-NEGOTIABLE)
  - PRINCIPLE_3 -> III. Contract Tests Derived From Observed Frontend Behavior
  - PRINCIPLE_4 -> IV. Laravel Idiomatic Architecture
  - PRINCIPLE_5 -> V. Spec-Driven Phased Delivery

Added sections:
  - Technology Stack & Constraints (replaces SECTION_2 placeholder)
  - Development Workflow & Quality Gates (replaces SECTION_3 placeholder)
  - Governance (filled in)

Removed sections: None (placeholders only)

Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — Constitution Check section is generic,
       no edits required; planners must populate gates from these principles.
  - ✅ .specify/templates/spec-template.md — Generic and consistent with principles;
       no edits required.
  - ✅ .specify/templates/tasks-template.md — Test-first ordering and contract-test
       task category already align with Principles II and III; no edits required.
  - ✅ .specify/templates/checklist-template.md — Generic; no edits required.
  - ✅ BACKEND_PLAN.md — Phase 0 originally referenced "TypeScript and structured
       architecture"; Principles IV and V supersede this with Laravel. Plan body
       is otherwise consistent. Reconciled in v1.0.1.

Follow-up TODOs:
  - None. BACKEND_PLAN.md Phase 0/2 reconciliation was completed in v1.0.1.
-->

# Salamhack Backend Constitution

## Core Principles

### I. Frontend-Contract Fidelity (NON-NEGOTIABLE)

The existing React frontend in `frontend/` is the authoritative definition of the
API contract. The Laravel backend MUST exactly match every observable aspect of
the frontend's HTTP usage: route paths, HTTP methods, query parameters, request
headers (including `Content-Type`, `Accept`, and any auth headers), request body
shapes and field names, response body shapes and field names, HTTP status codes,
and error response formats.

No change to frontend source code is permitted in order to make the backend
"work." If a mismatch is discovered, the backend MUST adapt — never the frontend.
The only allowed frontend-side change is configuration that points the existing
client at the new backend (e.g., base URL via environment variable), and only if
that mechanism already exists in the frontend.

**Rationale**: This project replaces a stubbed/missing backend for an already-shipping
frontend. Any deviation from the observed contract creates an integration defect
that cannot be hidden by backend-side changes.

### II. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory. For every endpoint, group of endpoints, or behavior change:

1. Write the failing test first (contract test, feature test, or unit test as
   appropriate to the layer).
2. Confirm the test fails for the right reason (e.g., 404 because the route does
   not yet exist, or assertion failure on response shape).
3. Implement the minimum code required to make the test pass.
4. Refactor with tests green.

Implementation code MUST NOT be merged ahead of the tests that exercise it. Pull
requests that add or modify endpoints MUST include the corresponding tests in
the same change set.

**Rationale**: TDD enforces that the contract is captured executably before code
exists to satisfy it, which is the only reliable way to deliver Principle I.

### III. Contract Tests Derived From Observed Frontend Behavior

Every API endpoint MUST have at least one contract test, and contract tests MUST
be derived from the actual requests the React frontend issues — not from API
documentation, intuition, or backend wishful thinking.

Acceptable sources of "observed behavior" include: reading the frontend source
(fetch/axios call sites, request builders, query hooks), running the frontend
against a recording proxy or browser devtools and capturing requests, and any
existing fixtures already produced by the frontend team. The source used for
each contract test SHOULD be referenced in the test (comment or fixture name)
so reviewers can verify it.

Contract tests MUST assert at minimum: HTTP status code, response `Content-Type`,
top-level response shape (keys present, types, required vs. optional), and error
envelope format for failure cases. Fields the frontend actually reads MUST be
asserted explicitly; fields the frontend ignores MAY be asserted loosely or
omitted.

**Rationale**: A contract test sourced from the frontend's real behavior is the
operational definition of "the backend matches the frontend." Tests derived from
any other source can pass while the integration is still broken.

### IV. Laravel Idiomatic Architecture

The backend MUST be built using current Laravel conventions rather than ad-hoc
structures. Specifically:

- Routing: defined in `routes/api.php` (or split route files) with explicit HTTP
  verbs; no catch-all magic routes.
- Validation: handled via `FormRequest` classes per endpoint; controllers MUST
  NOT inline validation rules for non-trivial requests.
- Response shaping: handled via Eloquent API Resources (or explicit array
  responses) so response shape is reviewable in one place per endpoint and
  matches the frontend contract.
- Persistence: Eloquent models with migrations under `database/migrations/`;
  raw SQL only when justified.
- Errors: a single exception handler renders the error envelope in the format
  the frontend expects; controllers MUST NOT hand-roll inconsistent error
  responses.
- Controllers: thin; business logic belongs in services, actions, or model
  methods, not in controllers.
- Authentication: implemented via a first-party Laravel package (Sanctum or
  Passport) chosen to match the frontend's observed auth scheme.

Deviations are permitted only when they are required to satisfy Principle I
(contract fidelity) and MUST be documented in the relevant plan's Complexity
Tracking section.

**Rationale**: Idiomatic Laravel keeps the backend reviewable, testable, and
maintainable by anyone with Laravel experience, which is the value of choosing
a framework over a hand-rolled stack.

### V. Spec-Driven Phased Delivery

Work MUST follow the phased plan in `BACKEND_PLAN.md` (Phase 0 → Phase 7), and
each phase MUST go through a Spec Kit cycle: specify → clarify → plan → tasks →
implement → validate. A later phase MUST NOT begin until the previous phase's
exit criteria are met, with one exception: Phase 1 (API Discovery) may be
incrementally extended as new frontend behaviors are discovered during later
phases.

Incremental delivery is required: every merged change SHOULD leave the backend
in a runnable state with its existing contract tests passing. Long-lived
branches that batch many phases together are discouraged.

**Rationale**: The phased plan exists so that contract fidelity, TDD, and
Laravel idiom can be enforced one slice at a time. Skipping the spec cycle for
a phase loses the gate that catches contract drift early.

## Technology Stack & Constraints

- **Backend framework**: Laravel (latest stable major release at the time of
  Phase 2 setup). The chosen Laravel and PHP versions MUST be recorded in the
  Phase 2 plan and in `composer.json`.
- **Language**: PHP, version pinned in `composer.json` `require.php` and
  enforced in CI.
- **Testing framework**: Laravel's built-in test runner (PHPUnit or Pest —
  decided in Phase 2 plan) running against Laravel's `TestCase` and `RefreshDatabase`
  for feature/contract tests.
- **Storage**: Database engine selected in Phase 5; until then, in-memory or
  file-backed storage is permitted as long as the contract tests pass. The
  contract MUST NOT change when persistence is introduced.
- **Frontend boundary**: The React frontend lives in `frontend/` and MUST NOT be
  modified to accommodate the backend (see Principle I). The frontend's existing
  base URL configuration is the only integration touchpoint.
- **CORS**: configured to permit the frontend's actual origin(s), not `*`, in
  any non-development environment.
- **Authentication**: scheme (token/cookie/session) MUST be derived from how the
  frontend actually sends credentials, then implemented with Sanctum or Passport
  per Principle IV.
- **Out of scope**: rewriting the frontend, replacing the frontend's HTTP client,
  or designing a new API surface beyond what the frontend uses.

## Development Workflow & Quality Gates

- **Branching**: feature branches per Spec Kit feature, named per the configured
  Spec Kit conventions; merges target the working integration branch.
- **Per-PR gates** (all MUST pass before merge):
  1. All contract tests for affected endpoints are present and were written
     before the implementation in the same PR (Principle II).
  2. Test suite passes on CI.
  3. PR description references the source of truth for any new contract
     assertions (frontend file path, captured request, etc.) per Principle III.
  4. New or modified endpoints follow the Laravel layering in Principle IV
     (FormRequest validation, Resource responses, thin controllers, central
     error handler).
  5. Constitution Check in the feature's plan has no unjustified violations.
- **Spec Kit cycle per phase**: every phase listed in `BACKEND_PLAN.md` MUST be
  delivered as one or more Spec Kit features going through `/speckit-specify` →
  `/speckit-clarify` (when ambiguity exists) → `/speckit-plan` → `/speckit-tasks`
  → `/speckit-implement`.
- **Contract drift handling**: if a contract test starts failing because the
  frontend's observed behavior changed, the test MUST be updated (with the new
  source recorded) and the backend brought back into compliance. The backend
  MUST NOT be "fixed" by editing the assertion to match what the backend does.

## Governance

- This constitution supersedes ad-hoc practices and any conflicting guidance in
  `BACKEND_PLAN.md`, `.specify/templates/`, `CLAUDE.md`, or any other
  agent-runtime guidance. When `BACKEND_PLAN.md` and this constitution disagree
  (e.g., Phase 0 originally referenced TypeScript), this constitution wins and
  `BACKEND_PLAN.md` MUST be reconciled.
- Amendments require: (a) a PR that edits this file, (b) a Sync Impact Report
  prepended to this file describing version bump and template impacts, (c)
  updates to any affected templates in `.specify/templates/` in the same PR,
  and (d) at least one PR reviewer approval (the same approval gate that
  applies to any code change in this repo - no separate approver role is
  defined).
- Versioning policy (semantic):
  - **MAJOR**: removing a principle, redefining a NON-NEGOTIABLE, or any change
    that invalidates existing plans/specs.
  - **MINOR**: adding a principle or section, or materially expanding the
    obligations under an existing principle.
  - **PATCH**: clarifications, wording fixes, typo or formatting changes that
    do not change obligations.
- Compliance review: PR reviewers MUST verify that the Constitution Check in
  the feature's plan has been completed and that all "MUST" obligations
  applicable to the change are satisfied. Justified deviations MUST be (i)
  recorded in the Complexity Tracking table of the feature's plan, (ii)
  accompanied by written justification from the author, and (iii) approved by
  at least one PR reviewer on the same PR (the same approval gate that
  applies to any code change - no separate approver role is defined).
- Runtime guidance for agents/contributors lives in `CLAUDE.md` and the Spec Kit
  templates; those documents MUST defer to this constitution on any conflict.

**Version**: 1.0.1 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
