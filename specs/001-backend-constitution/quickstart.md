# Quickstart: Verify the Backend Constitution (Phase 0)

**Feature**: Backend Constitution (Phase 0)
**Audience**: Anyone reviewing whether Phase 0 is actually done — humans or
AI agents.

This walkthrough is the executable form of the requirements checklist. If
every step below passes, Phase 0 is complete. Each step lists the spec
identifier (FR / SC) it satisfies, so a reviewer can map findings back to the
spec without guessing.

Estimated time: ~10 minutes for a human; under 1 minute for SC-004 / SC-009
spot checks.

---

## Step 1 — The constitution exists at the canonical path

Open `.specify/memory/constitution.md`.

- **Pass if**: the file exists and is non-empty.
- **Spec items**: FR-001.

---

## Step 2 — The constitution carries valid metadata

In the constitution, find the footer line of the form:

```text
**Version**: X.Y.Z | **Ratified**: YYYY-MM-DD | **Last Amended**: YYYY-MM-DD
```

- **Pass if**: all three values are present, the version parses as semver,
  and both dates are ISO format.
- **Spec items**: FR-011, SC-007 (metadata clauses).

---

## Step 3 — No unresolved placeholders

Search the constitution for tokens of the form `[ALL_CAPS]`. Examples that
would fail: `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`, `[GOVERNANCE_RULES]`.

- **Pass if**: zero such tokens remain.
- **Spec items**: FR-012, SC-007 (placeholder clause).

---

## Step 4 — Frontend-Contract Fidelity is declared and prohibits frontend edits

In the constitution, locate Principle I (Frontend-Contract Fidelity).

- **Pass if**: it (a) names `frontend/` as the authoritative source of the
  API contract, AND (b) explicitly prohibits modifying frontend code to make
  the backend function (configuration changes via existing mechanisms are
  the only permitted exception).
- **Spec items**: FR-002.

---

## Step 5 — Contract tests required for every endpoint, sourced from the frontend

In the constitution, locate Principle III (Contract Tests Derived From
Observed Frontend Behavior).

- **Pass if**: it requires *every* endpoint to have at least one contract
  test, AND requires those tests to be derived from observed frontend
  behavior (not from documentation alone), AND describes acceptable
  sources of "observed behavior".
- **Spec items**: FR-003.

---

## Step 6 — Test-first development is mandated, with tests and code in the same change set

In the constitution, locate Principle II (Test-First Development).

- **Pass if**: it (a) lays out the red-green-refactor cycle, AND (b)
  explicitly says tests and the implementation that exercises them MUST
  be merged in the same change set.
- **Spec items**: FR-004.

---

## Step 7 — Laravel framework family is named and idiomatic use is required

In the constitution, locate Principle IV (Laravel Idiomatic Architecture).

- **Pass if**: it (a) names Laravel as the chosen framework family, AND
  (b) requires idiomatic use for routing, validation (FormRequest),
  response shaping (API Resources), persistence (Eloquent), error handling
  (central handler), and authentication (Sanctum/Passport).
- **Spec items**: FR-005.

---

## Step 8 — Spec-driven phased delivery is mandated

In the constitution, locate Principle V (Spec-Driven Phased Delivery) and
the Development Workflow & Quality Gates section.

- **Pass if**: it (a) requires every `BACKEND_PLAN.md` phase to go through
  the full Spec Kit cycle, AND (b) defines what "phase complete" means in
  constitutional terms (gates passed, etc.).
- **Spec items**: FR-006.

---

## Step 9 — Per-PR quality gates are listed mechanically

In the Development Workflow & Quality Gates section.

- **Pass if**: it lists discrete, mechanically-applicable per-PR gates
  (presence of contract tests, test-first ordering in the diff, framework
  idioms, source citation for new contract assertions, completed
  Constitution Check in the feature plan).
- **Spec items**: FR-007, SC-001.

---

## Step 10 — Amendment process is fully defined

In the Governance section.

- **Pass if**: it requires (a) a semver bump with rationale, (b) a sync
  impact report at the top of the file, (c) updates to every affected
  template under `.specify/templates/`, AND (d) at least one PR reviewer
  approval.
- **Spec items**: FR-008, SC-005.

---

## Step 11 — Precedence rule is explicit

In the Governance section.

- **Pass if**: it states that the constitution supersedes
  `BACKEND_PLAN.md`, the templates, and `CLAUDE.md` (or any other
  agent-runtime guidance) on conflict.
- **Spec items**: FR-009.

---

## Step 12 — Deviation process and approval are defined

In the Governance section.

- **Pass if**: it requires deviations to be (a) recorded in the relevant
  feature plan's Complexity Tracking section, (b) accompanied by written
  justification, AND (c) approved by at least one PR reviewer.
- **Spec items**: FR-010, SC-006.

---

## Step 13 — `BACKEND_PLAN.md` no longer contradicts the constitution

Open `BACKEND_PLAN.md`. Read the Phase 0 and Phase 2 descriptions.

- **Pass if**: neither section references "TypeScript" or "Node.js" as the
  backend stack, and both are consistent with the Laravel/PHP choice in the
  constitution. A brief rationale (one sentence) for the change is present
  in the plan or in the corresponding Phase 0 commit message.
- **Spec items**: FR-013, SC-008.

A scripted check (rough): grep `BACKEND_PLAN.md` for case-insensitive
"typescript" or "node.js" and confirm zero hits in Phase 0/2 sections.

---

## Step 14 — `CLAUDE.md` points first-readers at the constitution

Open `CLAUDE.md` and read it end to end (it is short).

- **Pass if**: within the first screen of content the reader can identify
  (a) the path `.specify/memory/constitution.md`, AND (b) the rule that
  the constitution supersedes other in-repo guidance on conflict. A
  cold-start reader should be able to state both within one minute of
  opening the file.
- **Spec items**: FR-014, SC-009.

---

## Step 15 — Spec template and supporting documents are in agreement

Open the spec for this feature: `specs/001-backend-constitution/spec.md`.

- **Pass if**: the spec contains a `## Clarifications` section with the
  three Q&A entries from session 2026-04-29; FR-013 and FR-014 are
  present; SC-008 and SC-009 are present; the Assumptions section
  references reconciliation as in-scope (not deferred).
- **Spec items**: validates that the clarification outputs were written
  back to the spec as required by `/speckit-clarify` step 6.

---

## If any step fails

Return to `/speckit-implement` for the failing step (or to
`/speckit-clarify` if the failure indicates a missing decision rather than
a missing edit). Do not mark Phase 0 closed until all 15 steps pass.

## If all steps pass

Phase 0 is complete. The next phase is Phase 1 (API Discovery) per
`BACKEND_PLAN.md` — start it with `/speckit-specify` describing the API
surface to discover from `frontend/`.
