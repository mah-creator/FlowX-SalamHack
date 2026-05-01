---

description: "Task list for Phase 0: Backend Constitution"
---

# Tasks: Backend Constitution (Phase 0)

**Input**: Design documents from `/specs/001-backend-constitution/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: This is a documentation-only deliverable. Per the plan, the spec
quality checklist (`checklists/requirements.md`) and the verification
walkthrough (`quickstart.md`) — both authored before implementation in
`/speckit-specify` and `/speckit-plan` respectively — serve as the
"test-first" artefacts (Constitution Principle II). No additional automated
tests are generated. Implementation tasks below make the quickstart pass.

**Organization**: Tasks are grouped by user story so each story can be
implemented and verified independently.

**Implementer note (for cheaper LLM)**: Every editing task below names the
exact file path, the exact text to find, and the exact text to write.
Follow the steps verbatim. After each task that edits a file, save the
file (use `Read` first if the editing tool requires it, then use `Edit`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on
  incomplete tasks).
- **[Story]**: Maps the task to a user story (US1, US2, US3) from spec.md.
  Setup, Foundational, and Polish phases have no story label.
- All paths are relative to the repo root: `C:\Users\mahmoud\Desktop\salam hack\salamhack prototype` (Windows) or `/c/Users/mahmoud/Desktop/salam hack/salamhack prototype` (bash).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Load all the context the implementer needs before editing
anything.

- [X] T001 Read every input artefact in this exact order so context is loaded: `specs/001-backend-constitution/spec.md`, `specs/001-backend-constitution/plan.md`, `specs/001-backend-constitution/research.md`, `specs/001-backend-constitution/data-model.md`, `specs/001-backend-constitution/quickstart.md`, then `.specify/memory/constitution.md`, then `BACKEND_PLAN.md`, then `CLAUDE.md`. Do not edit anything in this task — read only.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None — this feature has no shared infrastructure that all
user stories depend on. The constitution document already exists at
v1.0.0; per-story work below either amends it or edits other files.

**Checkpoint**: Foundation ready (trivially) — user story implementation
can begin.

---

## Phase 3: User Story 1 — Authoritative source of binding backend rules (Priority: P1) 🎯 MVP

**Goal**: A single, current constitution document that every contributor
and AI agent can consult to know which rules are binding. Already drafted
at v1.0.0; this story tightens two governance clauses to match the
clarifications recorded in the spec, then verifies the result.

**Independent Test**: Run quickstart Steps 1-12 (`specs/001-backend-constitution/quickstart.md`).
All twelve steps pass.

### Implementation for User Story 1

- [X] T002 [US1] Amend `.specify/memory/constitution.md` to add the reviewer-approval clause to the amendment process (FR-008(d)). Find the bullet that reads exactly:

  ```text
  - Amendments require: (a) a PR that edits this file, (b) a Sync Impact Report
    prepended to this file describing version bump and template impacts, and (c)
    updates to any affected templates in `.specify/templates/` in the same PR.
  ```

  Replace it with:

  ```text
  - Amendments require: (a) a PR that edits this file, (b) a Sync Impact Report
    prepended to this file describing version bump and template impacts, (c)
    updates to any affected templates in `.specify/templates/` in the same PR,
    and (d) at least one PR reviewer approval (the same approval gate that
    applies to any code change in this repo — no separate approver role is
    defined).
  ```

- [X] T003 [US1] Amend `.specify/memory/constitution.md` to require written justification and reviewer approval for justified deviations (FR-010). Find the bullet that reads exactly:

  ```text
  - Compliance review: PR reviewers MUST verify that the Constitution Check in the
    feature's plan has been completed and that all "MUST" obligations applicable
    to the change are satisfied. Justified deviations MUST be recorded in the
    Complexity Tracking table of the feature's plan.
  ```

  Replace it with:

  ```text
  - Compliance review: PR reviewers MUST verify that the Constitution Check in
    the feature's plan has been completed and that all "MUST" obligations
    applicable to the change are satisfied. Justified deviations MUST be (i)
    recorded in the Complexity Tracking table of the feature's plan, (ii)
    accompanied by written justification from the author, and (iii) approved by
    at least one PR reviewer on the same PR (the same approval gate that
    applies to any code change — no separate approver role is defined).
  ```

- [X] T004 [US1] Bump the constitution version from `1.0.0` to `1.0.1` (PATCH — clarifications, no new principle and no removed obligation) in `.specify/memory/constitution.md`. Find the footer line that reads exactly:

  ```text
  **Version**: 1.0.0 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
  ```

  Replace it with:

  ```text
  **Version**: 1.0.1 | **Ratified**: 2026-04-29 | **Last Amended**: 2026-04-29
  ```

- [X] T005 [US1] Prepend a new Sync Impact Report block to `.specify/memory/constitution.md` documenting the v1.0.0 → v1.0.1 bump performed in T002–T004. Insert the following block as the **very first lines** of the file (above the existing `<!-- SYNC IMPACT REPORT ==================` block — do not delete the existing block; the new one stacks on top so the most recent change is visible first):

  ```text
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
  ```

- [X] T006 [US1] Run quickstart Steps 1-12 by hand against the just-amended `.specify/memory/constitution.md`. For each step in `specs/001-backend-constitution/quickstart.md`, perform the described inspection. If any step fails, return to the corresponding earlier task (T002, T003, T004, or T005) and re-edit. Do not advance to Phase 4 until Steps 1-12 all pass.

**Checkpoint**: At this point, User Story 1 is fully functional. The
constitution exists, is well-formed, carries valid metadata, and its
governance section now matches the FR-008(d) and FR-010 clarifications.

---

## Phase 4: User Story 2 — Phase-by-phase delivery is governed and traceable (Priority: P2)

**Goal**: `BACKEND_PLAN.md` and `CLAUDE.md` no longer contradict the
constitution. Reconcile `BACKEND_PLAN.md` Phases 0 and 2 to reference
Laravel/PHP, and update `CLAUDE.md` so contributors and AI agents are
pointed at the constitution on first read.

**Independent Test**: Run quickstart Steps 13-14
(`specs/001-backend-constitution/quickstart.md`). Both steps pass.

### Implementation for User Story 2

- [X] T007 [P] [US2] Edit `BACKEND_PLAN.md` to reconcile Phase 0 with the Laravel decision (FR-013, SC-008). Find the bullet under `## Phase 0 — Backend Constitution` → `**Spec Focus:**` that reads exactly:

  ```text
  * Use TypeScript and structured architecture
  ```

  Replace it with:

  ```text
  * Use Laravel (PHP) with idiomatic framework architecture (FormRequest validation, API Resources, Eloquent, central exception handler, Sanctum/Passport)
  ```

- [X] T008 [P] [US2] Edit `BACKEND_PLAN.md` to reconcile Phase 2 with the Laravel decision (FR-013, SC-008). Find the bullet under `## Phase 2 — Backend Foundation` → `**Key Outputs:**` that reads exactly:

  ```text
  * Project setup (Node.js + TypeScript)
  ```

  Replace it with:

  ```text
  * Project setup (Laravel + PHP, versions pinned in this phase's plan and in `composer.json`)
  ```

- [X] T009 [US2] Append a brief rationale note to `BACKEND_PLAN.md` (FR-013) so future readers see why the stack changed. Find the line at the very top of the file that reads exactly:

  ```text
  # Backend Implementation Plan (Spec Kit Driven)
  ```

  Replace it with:

  ```text
  # Backend Implementation Plan (Spec Kit Driven)

  > **Stack note (Phase 0 reconciliation, 2026-04-29)**: This plan was
  > originally authored against TypeScript/Node. The project has since
  > selected Laravel (PHP) as the backend framework family. The
  > constitution at `.specify/memory/constitution.md` is the authoritative
  > record of that decision; the Phase 0 and Phase 2 sections below have
  > been updated to match. On any further conflict, the constitution wins.
  ```

  (T007 and T008 may be done in parallel with T009 — they touch different
  sections of the same file. If your tooling cannot do parallel edits to
  one file, run them sequentially in the order T007 → T008 → T009.)

- [X] T010 [US2] Edit `CLAUDE.md` to point contributors and AI agents at the constitution on first read (FR-014, SC-009). Find the entire block that reads exactly:

  ```text
  <!-- SPECKIT START -->
  For additional context about technologies to be used, project structure,
  shell commands, and other important information, read the current plan
  <!-- SPECKIT END -->
  ```

  Replace it with:

  ```text
  <!-- SPECKIT START -->
  **Constitution (binding rules — read first)**: The project's binding
  rules for all backend work live in `.specify/memory/constitution.md`.
  Read it before starting any backend task. The constitution supersedes
  this file, `BACKEND_PLAN.md`, and the Spec Kit templates on any
  conflict.

  For additional technical context, project structure, and the current
  implementation focus, read the current feature's plan at
  `specs/<feature>/plan.md` (the most recent feature directory under
  `specs/`).
  <!-- SPECKIT END -->
  ```

- [X] T011 [US2] Run quickstart Steps 13-14 against the edited `BACKEND_PLAN.md` and `CLAUDE.md`. Specifically:
  - Step 13: Search `BACKEND_PLAN.md` (case-insensitive) for the strings `typescript` and `node.js`. There must be zero hits inside the `## Phase 0 — Backend Constitution` and `## Phase 2 — Backend Foundation` sections. (A reference inside the new "Stack note" at the top — explaining the original wording — is acceptable because it is the rationale, not a current stack claim.)
  - Step 14: Read `CLAUDE.md` end to end. Confirm that within the first screen of content the reader can identify (a) the path `.specify/memory/constitution.md`, AND (b) the precedence note that the constitution supersedes other guidance.
  - If either step fails, return to T007/T008/T009/T010 as appropriate and re-edit.

**Checkpoint**: User Stories 1 AND 2 both pass their independent tests.

---

## Phase 5: User Story 3 — Constitution stays consistent with the rest of the project's working documents (Priority: P3)

**Goal**: Confirm that the amendment performed in Phase 3 produced a valid
sync impact report and that the spec itself reflects all clarifications.

**Independent Test**: Run quickstart Step 15
(`specs/001-backend-constitution/quickstart.md`). Step passes.

### Implementation for User Story 3

- [X] T012 [US3] Verify the new Sync Impact Report inserted in T005 against the spec's amendment requirements. Open `.specify/memory/constitution.md` and check that the topmost `<!-- SYNC IMPACT REPORT -->` block:
  - Names the version change (`1.0.0 → 1.0.1`).
  - Gives a bump rationale referencing PATCH-level changes.
  - Lists every modified section (Governance bullets).
  - Lists every template in `.specify/templates/` with a status of `✅ updated` or `✅ no change required` (FR-008(c), SC-005).
  - Lists no follow-up TODOs (or, if any are listed, they are explicitly tracked elsewhere).
  - If any of the above is missing, edit the block in place to add the missing content.

- [X] T013 [US3] Run quickstart Step 15 against `specs/001-backend-constitution/spec.md`. Confirm:
  - A `## Clarifications` section exists with a `### Session 2026-04-29` subheading.
  - Three Q&A bullets are present under that session (Q1: BACKEND_PLAN.md scope, Q2: approval authority, Q3: CLAUDE.md scope).
  - FR-013 and FR-014 are listed under Functional Requirements.
  - SC-008 and SC-009 are listed under Measurable Outcomes.
  - The Assumptions section's Laravel bullet ends by stating that reconciliation is part of Phase 0's deliverable (not "tracked separately as a follow-up").
  - If any item is missing, do not silently rewrite the spec — escalate by reporting which item is missing so the user can decide whether to re-run `/speckit-clarify` or to amend the spec by hand.

**Checkpoint**: All three user stories pass their independent tests.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: One end-to-end pass to confirm Phase 0 is closed and the
checklist record is current.

- [X] T014 Run the full quickstart end-to-end (all 15 steps) against the current state of the repo. Record any failures. If any step fails, return to the corresponding implementation task (T002–T013) and re-do it; do not mark Phase 0 closed until all 15 steps pass.

- [X] T015 Update `specs/001-backend-constitution/checklists/requirements.md` to reflect the verification result. Find the `## Notes` section at the bottom of the file. After the last existing bullet (the one starting with "The spec mentions \`frontend/\`…"), append a new bullet that reads exactly:

  ```text
  - **Verified 2026-04-29**: All 15 quickstart steps passed. Constitution
    is at v1.0.1. `BACKEND_PLAN.md` Phase 0/2 reconciled to Laravel/PHP.
    `CLAUDE.md` updated to point to the constitution. Phase 0 closed.
  ```

  (If verification was performed on a date other than 2026-04-29, replace
  the date in the bullet with today's actual ISO date.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1, T001)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Trivially complete (no tasks).
- **Phase 3 (User Story 1, T002–T006)**: Starts after T001.
- **Phase 4 (User Story 2, T007–T011)**: Starts after T001. Independent of
  Phase 3 — the BACKEND_PLAN.md and CLAUDE.md edits do not depend on the
  constitution amendment. May run in parallel with Phase 3 if staffed.
- **Phase 5 (User Story 3, T012–T013)**: T012 depends on T005 (verifies the
  sync impact report it produced). T013 depends only on T001 and may run in
  parallel with T002–T011.
- **Phase 6 (Polish, T014–T015)**: Depends on every prior implementation
  task being complete.

### Within Each User Story

- US1: T002, T003, T004, T005 may be done in any order against the
  constitution file (they edit different lines), but a single editor will
  typically do them sequentially in order; T006 verifies and runs last.
- US2: T007 and T008 are marked [P] (different sections of `BACKEND_PLAN.md`).
  T009 also touches `BACKEND_PLAN.md` but in a different section (the very
  top), so it is also independent of T007/T008. T010 edits a different file
  entirely (`CLAUDE.md`). T011 verifies and runs last.
- US3: T012 → T013 → done.

### Parallel Opportunities

- After T001 completes, T002–T005 (US1) and T007–T010 (US2) and T013 (US3)
  can in principle all run in parallel by separate agents — they touch
  three different files and the work in each file is independent across
  stories. A single implementer should sequence them within each story.

---

## Parallel Example: User Story 2

```bash
# After T001 completes, the four edits in US2 touch independent regions:
Task: T007 — replace one bullet in BACKEND_PLAN.md Phase 0
Task: T008 — replace one bullet in BACKEND_PLAN.md Phase 2
Task: T009 — insert a stack-note block at the top of BACKEND_PLAN.md
Task: T010 — replace the SPECKIT block in CLAUDE.md
# T011 verifies — runs after T007/T008/T009/T010 are all done.
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. T001 (load context).
2. T002–T006 (amend constitution to v1.0.1 and verify Steps 1–12).
3. STOP and validate against quickstart Steps 1-12. The constitution alone
   already gives the project an authoritative source of binding rules, so
   shipping just US1 leaves the project in a usable governance state even
   if `BACKEND_PLAN.md`/`CLAUDE.md` reconciliation is delayed.

### Incremental Delivery

1. T001.
2. US1 (T002–T006) → quickstart Steps 1-12 pass → optional commit.
3. US2 (T007–T011) → quickstart Steps 13-14 pass → optional commit.
4. US3 (T012–T013) → quickstart Step 15 passes → optional commit.
5. Polish (T014–T015) → all 15 steps pass → final Phase 0 commit.

### Single-Implementer Linear Path (recommended for a cheaper LLM)

Just walk T001 → T015 in order. No task requires parallelism; the parallel
markers exist only for future scaling.

---

## Notes

- This is a documentation-only feature; no code is added in Phase 0.
- "Test-first" is satisfied because `quickstart.md` (the verification
  procedure) was written in `/speckit-plan` before any of the editing
  tasks below.
- After Phase 0 closes, the next phase is Phase 1 (API Discovery) per
  `BACKEND_PLAN.md`. Begin it with `/speckit-specify` describing the API
  surface to discover from `frontend/`.
- If any task's "find this exact text" string does not match (e.g., the
  constitution was already edited by hand), STOP and report the
  discrepancy rather than guessing. The replacement text in this file
  assumes the file states described in `plan.md` and `data-model.md`.
