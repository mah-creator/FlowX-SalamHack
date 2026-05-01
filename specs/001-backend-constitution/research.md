# Phase 0 Research: Backend Constitution

**Feature**: Backend Constitution (Phase 0)
**Date**: 2026-04-29
**Status**: Complete — all spec-level NEEDS CLARIFICATION resolved during
`/speckit-clarify` session 2026-04-29.

## Summary

This feature has no open technical unknowns at the implementation level — it
is a documentation deliverable. What this research document captures is the
three meta-decisions that shaped the spec and that future maintainers will
want to see justified. Each decision is recorded with the alternatives that
were considered and why they were rejected.

---

## Decision 1: Backend framework family is Laravel/PHP

**Decision**: The backend will be implemented with Laravel on PHP. This
overrides the original `BACKEND_PLAN.md` text that referenced
"TypeScript and structured architecture" (Phase 0) and "Node.js + TypeScript"
(Phase 2). The constitution's Principle IV codifies this and Phase 0 is in
scope to reconcile `BACKEND_PLAN.md` accordingly (FR-013, SC-008).

**Rationale**:

- Set by the user when invoking `/speckit-constitution`: "We are implementing
  a backend for an existing React frontend using Laravel."
- Laravel provides first-party building blocks (FormRequest validation, API
  Resources, Eloquent, central exception handler, Sanctum/Passport) that map
  one-to-one onto the principles the constitution wants to enforce, which
  makes Principle IV ("idiomatic Laravel architecture") cheap to comply with
  and cheap to review.
- Spec Kit's `/speckit-plan` and downstream phases need a single,
  authoritative framework choice to make per-phase technical decisions; the
  earlier `BACKEND_PLAN.md` references to TypeScript/Node would have produced
  conflicting guidance every time an agent read both documents.

**Alternatives considered**:

- **Node.js + TypeScript** (the original `BACKEND_PLAN.md` text). Rejected
  per user instruction. No technical comparison was performed during the
  Phase 0 cycle because the user specified the choice explicitly.
- **Leave the framework choice open until Phase 2**. Rejected: it would
  delay the reconciliation of `BACKEND_PLAN.md`, leave the constitution
  silent on Principle IV, and force every later spec to re-litigate the
  choice.

**Implication for this feature**: Three files must be brought into agreement
with this decision in Phase 0 — the constitution (already done at v1.0.0),
`BACKEND_PLAN.md` (FR-013), and `CLAUDE.md` (FR-014, indirectly: it must
point readers to the constitution which is where the Laravel choice lives).

---

## Decision 2: Governance approval model is "one reviewer, same as any code change"

**Decision**: Both constitution amendments and justified rule deviations
require exactly one PR reviewer approval — the same approval gate that
applies to every other change in this repository. No separate "maintainer",
"steward", or "constitutional reviewer" role is defined. Encoded in the
spec at FR-008(d) and FR-010, recorded in the clarifications section as
Q2 → A.

**Rationale**:

- Project context is a hackathon prototype with a small team. Inventing
  separate approval roles when the team itself does not yet have role
  separation creates a governance gate that cannot be enforced and that
  reviewers will silently ignore.
- The model is mechanically enforceable today via standard repo PR
  settings, which keeps SC-001's "binary pass/fail per gate" claim true.
- Stricter models can be adopted later via amendment if the team grows;
  amendments themselves use this same one-reviewer gate, so the upgrade
  path is the cheapest possible.

**Alternatives considered**:

- **Two-reviewer rule for amendments, one for deviations**. Rejected for
  this team size — would block routine wording fixes (PATCH bumps) on
  reviewer availability without adding meaningful governance.
- **Maintainers-only via CODEOWNERS**. Rejected because the project does
  not yet have a maintainer set, and inventing one in Phase 0 would record
  a fact that is not yet true.
- **Author-only with audit trail**. Rejected because it removes any
  external check on amendments and makes Principle II's expectation of
  reviewer involvement (the per-PR quality gates in FR-007) inconsistent
  between code and governance changes.

**Implication for this feature**: The constitution document already says
"PR reviewers MUST verify that the Constitution Check in the feature's plan
has been completed". The implement step should ensure FR-008(d) wording is
present in `.specify/memory/constitution.md`'s Governance section, or add it
if absent.

---

## Decision 3: Scope of Phase 0 deliverable includes reconciling `BACKEND_PLAN.md` and updating `CLAUDE.md`

**Decision**: Phase 0 is not just "ratify the constitution". It also
includes (a) editing `BACKEND_PLAN.md` so its Phase 0 and Phase 2
descriptions reference Laravel/PHP rather than TypeScript/Node (FR-013,
SC-008), and (b) editing `CLAUDE.md` so an agent or human reading it can
discover the constitution path and its precedence within one minute
(FR-014, SC-009). Recorded in the clarifications section as Q1 → A and
Q3 → A.

**Rationale**:

- A constitution that the project's own agent-runtime guidance (`CLAUDE.md`)
  never points at is a constitution that AI agents will not load — they
  will read the plan instead and miss the binding rules entirely.
- A `BACKEND_PLAN.md` that contradicts the constitution sits in the repo
  across every later phase and forces every reader to re-derive which
  document wins. Reconciling it once in Phase 0 is a small, bounded edit;
  deferring it leaves a guaranteed inconsistency for the entire project.
- Both edits are bounded to known files and known sections — they do not
  expand Phase 0 into an open-ended rewrite.

**Alternatives considered**:

- **Defer both edits to a separate cleanup task**. Rejected: agents and
  reviewers would proceed through Phase 1+ against stale guidance, which
  is exactly the failure mode Principle V (Spec-Driven Phased Delivery) is
  meant to prevent.
- **Rewrite `BACKEND_PLAN.md` end-to-end as Laravel-native** (Q1 option C).
  Rejected as out of scope for Phase 0; the plan body is otherwise
  consistent and a wholesale rewrite would invite scope creep without
  removing any concrete contradiction.
- **Leave `CLAUDE.md` to be updated by the Spec Kit toolchain when later
  phases run**. Rejected because the toolchain only updates the section
  between `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` to point at
  the *current plan*, which is the wrong target — agents need to learn
  about the *constitution*, which lives outside any one feature plan.

**Implication for this feature**: Three files are edited in Phase 0
(`.specify/memory/constitution.md`, `BACKEND_PLAN.md`, `CLAUDE.md`); see
data-model.md and tasks.md (generated by `/speckit-tasks`) for the precise
edit list.

---

## Open questions

None at the implementation level. All decisions needed to begin
`/speckit-tasks` are recorded above.
