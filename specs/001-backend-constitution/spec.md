# Feature Specification: Backend Constitution (Phase 0)

**Feature Branch**: `001-backend-constitution`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Read BACKEND_PLAN.md and create a specification for the Phase0: Backend Constitution"

## Clarifications

### Session 2026-04-29

- Q: Is updating `BACKEND_PLAN.md` (so its Phase 0/2 references match the Laravel decision) part of Phase 0's deliverable, or is it deferred? → A: In scope for Phase 0 — Phase 0 deliverable includes editing `BACKEND_PLAN.md` so Phase 0/2 references match the Laravel decision.
- Q: Who has authority to approve (a) a constitution amendment, and (b) a justified deviation from a constitutional rule? → A: Same as any code change — one reviewer approval on the PR is sufficient for both amendments and deviations; no separate approver role is defined.
- Q: Is updating `CLAUDE.md` (or other in-repo agent-runtime guidance) so it explicitly points contributors and AI agents at `.specify/memory/constitution.md` part of Phase 0's deliverable, or deferred? → A: In scope for Phase 0 — `CLAUDE.md` MUST be updated to direct contributors and AI agents to read the constitution before backend work and to defer to it on conflict.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authoritative source of binding backend rules (Priority: P1)

A backend engineer (human or AI agent) is about to start work on any backend
change. Before writing code, they need a single, current document that tells
them which rules are non-negotiable, which are guidelines, and how the
backend is supposed to relate to the existing React frontend. They open the
project's constitution and find every binding rule in one place, written so
they can be checked against a pull request without further interpretation.

**Why this priority**: Every later phase of the backend (foundation, contract
testing, implementation, persistence, auth, deployment) will be reviewed
against this document. If it is missing, ambiguous, or out of date, every
later phase inherits that ambiguity and the project loses its main guarantee
that the frontend will continue to work without modification. P1 because no
other backend work can be safely started without it.

**Independent Test**: A new contributor can be handed only the constitution
and the frontend repository, and from those two artefacts alone they can
state, for any proposed backend change, whether it is permitted, prohibited,
or requires a documented exception — without consulting any other person.

**Acceptance Scenarios**:

1. **Given** the constitution exists in the project, **When** a contributor
   asks "must every API endpoint have a contract test?", **Then** the
   constitution gives a single unambiguous answer (yes/no/conditional) along
   with the rule that establishes it.
2. **Given** the constitution exists, **When** a contributor proposes a
   backend change that would require modifying the React frontend to
   accommodate it, **Then** the constitution clearly identifies that as
   prohibited and points to the rule.
3. **Given** the constitution exists, **When** a reviewer reads any pull
   request, **Then** they can identify which constitutional rules apply to
   the change and verify each one is satisfied.

---

### User Story 2 - Phase-by-phase delivery is governed and traceable (Priority: P2)

A team lead is sequencing the work in `BACKEND_PLAN.md` (Phases 1–7) and
needs each phase to enter and exit through a defined process so that nothing
is half-built and no phase silently breaks an earlier one. The constitution
specifies how each phase enters the work pipeline, what gates a change must
pass before merging, and what compliance review looks like, so the lead can
plan the sequence with confidence and report progress objectively.

**Why this priority**: Without governance rules the phases collapse into
ad-hoc work, breaking incremental delivery. P2 because it depends on User
Story 1 being satisfied (the rules must exist before they can be enforced),
but it must be in place before Phase 1 work begins.

**Independent Test**: Given only the constitution, the team lead can write
the entry/exit criteria for any one of the seven backend phases and produce
a checklist of merge gates that a reviewer can apply mechanically.

**Acceptance Scenarios**:

1. **Given** the constitution exists, **When** the team lead drafts the
   plan for any backend phase, **Then** they can list the constitutional
   gates that pull requests in that phase must pass.
2. **Given** a pull request in any phase, **When** a reviewer evaluates it,
   **Then** they can answer "does this PR meet the constitution's quality
   gates?" with a yes/no per gate and no subjective judgement.
3. **Given** a proposed exception to a constitutional rule, **When** the
   contributor wants to merge anyway, **Then** the constitution defines
   exactly where and how that exception must be recorded.

---

### User Story 3 - Constitution stays consistent with the rest of the project's working documents (Priority: P3)

A maintainer needs to amend the constitution (e.g., to add a new principle
or tighten an existing rule). They need a defined amendment process that
forces version bumps, change logging, and propagation of changes into the
project's plan/spec/task templates so that the templates and the constitution
never drift out of sync.

**Why this priority**: Drift between the constitution and the templates is a
latent failure — everything looks fine until a feature is built against
stale guidance. P3 because the project can ship its first phases before any
amendment is needed, but the process must exist before the first amendment
is attempted.

**Independent Test**: A maintainer can take a hypothetical proposed change
to one rule and, using only the constitution, produce: the new version
number, the sync impact report, and the list of templates that must be
updated in the same change.

**Acceptance Scenarios**:

1. **Given** a proposed amendment, **When** the maintainer follows the
   constitution's amendment procedure, **Then** they produce a correct
   semver bump (MAJOR/MINOR/PATCH) with a stated rationale.
2. **Given** an amendment that adds or changes a principle, **When** the
   amendment is merged, **Then** the change includes updates (or explicit
   "no change required" notes) for every affected template under
   `.specify/templates/`.
3. **Given** an amendment, **When** any future contributor reads the
   constitution, **Then** they can see at the top of the file what changed,
   in which version, and which templates were touched.

---

### Edge Cases

- What happens if the React frontend's actual behavior contradicts what the
  backend documentation says? The constitution must declare which one wins
  for the backend's purposes (the frontend's observed behavior).
- What happens if a rule in the constitution conflicts with `BACKEND_PLAN.md`
  (for example, the plan referencing a different language stack)? The
  constitution must define which document supersedes the other and what
  reconciliation is required.
- What happens if a rule cannot be satisfied for a particular change (e.g.,
  a third-party constraint forces a contract deviation)? The constitution
  must define how that exception is recorded and who must approve it.
- What happens if a rule is added but the templates are not updated? The
  amendment process must catch this, and the constitution itself must list
  which templates are required to track each principle.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST contain a single canonical constitution
  document at a known, stable path that every contributor and AI agent is
  expected to consult before backend work.
- **FR-002**: The constitution MUST declare the existing React frontend (in
  `frontend/`) as the authoritative source of the API contract, and MUST
  explicitly prohibit modifying frontend code in order to make the backend
  function (configuration changes such as base URL, where the mechanism
  already exists, are the only permitted exception).
- **FR-003**: The constitution MUST require that every backend API endpoint
  has at least one automated contract test, and MUST require that those
  contract tests are derived from the React frontend's observed behavior
  rather than from documentation alone.
- **FR-004**: The constitution MUST mandate test-first development (write
  failing test → confirm correct failure → implement → refactor) for all
  backend feature work, and MUST require that tests and the implementation
  they exercise be merged together in the same change set.
- **FR-005**: The constitution MUST identify the chosen backend framework
  family (Laravel) and require idiomatic use of its standard building
  blocks for routing, validation, response shaping, persistence, error
  handling, and authentication, so that the codebase is reviewable by any
  contributor familiar with that framework.
- **FR-006**: The constitution MUST require that work follows the phased
  plan in `BACKEND_PLAN.md`, with each phase delivered through a Spec Kit
  cycle (specify → clarify → plan → tasks → implement → validate), and MUST
  define what "phase complete" means in terms of constitutional compliance.
- **FR-007**: The constitution MUST list the per-pull-request quality gates
  that a reviewer can apply mechanically (presence of contract tests,
  test-first ordering, framework idioms, source citation for new contract
  assertions, completed Constitution Check in the feature plan).
- **FR-008**: The constitution MUST define an amendment process that
  requires (a) a semantic version bump with stated rationale, (b) a sync
  impact report at the top of the document describing what changed,
  (c) updates to every affected template under `.specify/templates/` in
  the same change, and (d) at least one reviewer approval on the PR
  (the same approval gate that applies to any code change in this repo —
  no separate approver role is defined).
- **FR-009**: The constitution MUST define a precedence rule for conflicts:
  the constitution supersedes `BACKEND_PLAN.md`, the templates, and any
  agent-runtime guidance such as `CLAUDE.md`.
- **FR-010**: The constitution MUST define how a contributor records a
  justified deviation from a rule: the deviation MUST be logged in the
  feature plan's Complexity Tracking section, MUST include a written
  justification from the author, and MUST be approved by at least one
  reviewer on the same PR (the same approval gate that applies to any
  code change — no separate approver role is defined).
- **FR-011**: The constitution MUST carry visible metadata on every
  version: current version number, original ratification date, and date of
  last amendment, all in ISO date format.
- **FR-012**: The constitution MUST be free of unresolved placeholder
  tokens (no `[ALL_CAPS]` brackets remaining) in any ratified version.
- **FR-013**: Phase 0 MUST also reconcile `BACKEND_PLAN.md` so that its
  Phase 0 and Phase 2 descriptions reference the chosen backend framework
  family (Laravel/PHP) instead of the previous TypeScript/Node references,
  and MUST record a brief rationale for the change in the plan or the
  Phase 0 commit. After this reconciliation, no contradiction between
  `BACKEND_PLAN.md` and the constitution about the framework choice may
  remain in the repository.
- **FR-014**: Phase 0 MUST also update `CLAUDE.md` (the project's
  agent-runtime guidance file) so that it explicitly directs contributors
  and AI agents to read `.specify/memory/constitution.md` before starting
  backend work and to defer to the constitution on any conflict with other
  guidance. The reference MUST point to the canonical constitution path
  and MUST be discoverable on the first read of `CLAUDE.md` (i.e., not
  buried after unrelated content).

### Key Entities *(include if feature involves data)*

- **Constitution Document**: The single canonical artefact that holds the
  binding rules for backend development. Attributes: version (semver),
  ratification date, last-amended date, principles, supplementary sections
  (technology constraints, workflow gates, governance), sync impact report
  for the most recent change.
- **Principle**: An individual binding rule inside the constitution.
  Attributes: name, ordinal, body text, rationale, and (optionally) a
  NON-NEGOTIABLE marker indicating that exceptions are not permitted.
- **Quality Gate**: A check that must pass before a pull request is
  merged. Attributes: the principle it derives from, the artefact it
  inspects (test file, code, plan document), and the binary outcome
  (pass/fail).
- **Amendment**: A proposed change to the constitution. Attributes: the
  before/after diff, the resulting semver bump, the sync impact report,
  and the set of template files updated as part of the change.
- **Spec-Kit Phase**: One of the seven phases described in `BACKEND_PLAN.md`.
  Attributes: phase number, objective, key outputs, entry criteria, exit
  criteria (the constitutional gates that apply to that phase).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of backend pull requests opened after the constitution is
  ratified can be evaluated against the constitution's quality gates with a
  binary pass/fail per gate, with no reviewer needing to ask "is this rule
  meant to apply here?".
- **SC-002**: 100% of backend API endpoints, once implemented in any phase,
  have at least one automated contract test that references the source of
  the observed frontend behavior it asserts (file path, captured request,
  or equivalent).
- **SC-003**: Zero changes to frontend source code are required during any
  backend phase in order to make the backend function. (Configuration
  changes via existing mechanisms such as base URL do not count as source
  code changes.)
- **SC-004**: A new contributor (human or AI agent), given only the
  constitution, can correctly identify which rules apply to a sample
  backend pull request in under 10 minutes, with at least 90% agreement
  against an experienced reviewer's evaluation of the same PR.
- **SC-005**: 100% of constitution amendments include a sync impact report
  and a documented status (updated / no change required) for every
  template under `.specify/templates/`. Drift between constitution and
  templates after an amendment is zero.
- **SC-006**: 100% of accepted exceptions to constitutional rules are
  recorded in the relevant feature plan's complexity-tracking section,
  with no undocumented exceptions present in merged code.
- **SC-007**: At any point in time, the constitution document carries a
  current semver version, an ISO ratification date, an ISO last-amended
  date, and contains zero unresolved placeholder tokens.
- **SC-008**: After Phase 0 is closed, `BACKEND_PLAN.md` contains zero
  references to TypeScript/Node as the backend stack and zero statements
  that contradict the constitution's framework choice.
- **SC-009**: After Phase 0 is closed, `CLAUDE.md` contains an explicit,
  readable-on-first-glance reference to `.specify/memory/constitution.md`
  and to the rule that the constitution supersedes other guidance. An AI
  agent or human contributor reading only `CLAUDE.md` end-to-end can
  identify the constitution's path and its precedence in under one minute.

## Assumptions

- The React frontend in `frontend/` is, and will continue to be, the
  authoritative source for the API contract; the backend's role is to
  conform to it.
- Laravel is the chosen backend framework family (overriding the older
  reference to TypeScript/Node in `BACKEND_PLAN.md` Phase 0/2). Reconciliation
  of `BACKEND_PLAN.md` to match this choice is part of Phase 0's deliverable
  (see FR-013, SC-008).
- Spec Kit is the team's working method for sequencing backend work; every
  phase in `BACKEND_PLAN.md` will go through a Spec Kit cycle.
- The project uses a single canonical constitution path at
  `.specify/memory/constitution.md`, established by the Spec Kit template.
- Contributors include both human engineers and AI coding agents; the
  constitution is written so both audiences can apply it.
- The team has access to the running React frontend (or its source) for
  the purpose of capturing observed API behavior to base contract tests on.
