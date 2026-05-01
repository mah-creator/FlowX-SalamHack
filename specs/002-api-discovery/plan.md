# Implementation Plan: API Discovery (Phase 1)

**Branch**: `002-api-discovery` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-api-discovery/spec.md`

## Summary

Phase 1's deliverable is a single canonical API contract document derived
from auditing the existing React frontend at `frontend/`. Source-level
inspection has confirmed the audit's headline finding up front: the
frontend issues **zero outbound HTTP requests** today and uses
`useReducer`-based local state in `DemoContext`. The deliverable therefore
has two layers per the spec's clarifications: (a) the literal HTTP audit
recording the zero-traffic finding with evidence, and (b) a derived API
surface inventoried from `DemoContextValue` methods, reducer action types,
page flows, and typed entities — every entry classified observed-vs-derived
(spec FR-007) with a Phase 3 grounding note (FR-009) wherever the source is
derived. The deliverable also covers third-party SDK declarations
(`@google/genai`, etc.; FR-017), ID-origin observations without taking a
position (FR-018), the `TxStatus` mapping convention (FR-019, one endpoint
per externally-triggered operation), and a wire-level auth recommendation
for Phase 6 (FR-010).

The deliverable is documentation only. No backend code is created or
modified in this phase. The frontend is not modified at all (constitution
Principle I, spec FR-016 / SC-010). Verification is by checklist against
the spec's 19 functional requirements and 15 success criteria.

## Technical Context

**Language/Version**: N/A — this feature delivers Markdown plus
machine-readable schema sidecars (OpenAPI 3.1 YAML and JSON Schema). No
runtime language is involved; the Laravel/PHP versions for the backend are
pinned in Phase 2's plan.
**Primary Dependencies**: Spec Kit templates and scripts under `.specify/`;
the React frontend source tree under `frontend/src/` is the audit subject
(read-only). No runtime dependencies.
**Storage**: N/A — versioned Markdown and YAML/JSON files in the git
repository.
**Testing**: Manual checklist verification against
`specs/002-api-discovery/checklists/requirements.md` plus the Success
Criteria counters (SC-001 through SC-015) which are count-based assertions
that any reviewer can verify by inspection. The OpenAPI sidecar will be
parsed/lint-checked using a standard validator (e.g.,
[openapi-spec-validator](https://github.com/p1c2u/openapi-spec-validator)
or `npx @apidevtools/swagger-cli validate`) as a structural smoke test —
the validator choice is irrelevant since the file is data, not code.
**Target Platform**: Repository-resident documentation; readable by humans
and AI agents and consumable by Phase 3's contract test framework
(selected in Phase 2).
**Project Type**: Discovery / documentation feature within an existing
monorepo that contains the React frontend (`frontend/`) and will contain
a Laravel backend (added in Phase 2).
**Performance Goals**: N/A.
**Constraints**:

- MUST NOT modify any file under `frontend/` (Principle I; spec FR-016 / SC-010).
- MUST stay technology-agnostic on the wire — no Laravel/PHP/ORM/library
  references in the deliverable (spec FR-011 / SC-009).
- MUST be reviewable in a single pass with every claim grounded in a
  cited frontend artefact (spec FR-012 / SC-001).
- MUST be incremental-friendly with a version marker and changelog
  (spec FR-015 / SC-011).

**Scale/Scope**: One audit covering ~10 page components under
`frontend/src/pages/`, ~15 methods on `DemoContextValue` plus ~7 reducer
action types, ~5 typed entities (User, Transaction, AuditLogEntry,
NotificationItem, DemoConfig), ~11 `TxStatus` values, and ~1 declared
third-party SDK (`@google/genai`). Expected output: ~15-20 endpoint
entries, ~5 entity schemas, 1 auth recommendation, 1 third-party section,
1 changelog entry.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution at `.specify/memory/constitution.md` v1.0.1 defines five
principles. Applied to this feature:

| # | Principle | Applicability to this feature | Status |
|---|-----------|-------------------------------|--------|
| I | Frontend-Contract Fidelity (NON-NEGOTIABLE) | Direct — this feature *is* the operationalisation of Principle I: it produces the API contract by reading the frontend. Spec FR-016 / SC-010 forbid modifying any file under `frontend/`; SC-009 forbids leaking backend implementation details into the deliverable. | ✅ Pass (no frontend changes; deliverable wire-level only) |
| II | Test-First Development (NON-NEGOTIABLE) | Adapted — for a documentation deliverable the "failing test" is the requirements checklist (`checklists/requirements.md`) plus the 15 SCs, all of which are binary-testable counters. The checklist was authored at `/speckit-specify` time and now serves as the gate the deliverable must clear before close. | ✅ Pass (checklist + SCs authored before deliverable population) |
| III | Contract Tests From Observed Frontend Behavior | Direct — this is the principle the deliverable enables for Phase 3. Spec FR-007 (observed-vs-derived classification) and FR-009 (Phase 3 grounding note) ensure every derived endpoint carries a written-down strategy for grounding its eventual contract test. The contradiction register (FR-014) surfaces every place where the principle cannot, today, be satisfied. | ✅ Pass (mechanism specified; population in /speckit-implement) |
| IV | Laravel Idiomatic Architecture | N/A in Phase 1 — no backend code. The deliverable is wire-level (FR-011) so Phase 2's Laravel choices remain free. | ✅ N/A |
| V | Spec-Driven Phased Delivery | Direct — this feature *is* the Phase 1 cycle of Spec-Driven Phased Delivery (specify → clarify → plan → tasks → implement → validate). Phase 0 is closed; later phases (2-7) MUST NOT begin until Phase 1's exit criteria are met, with the spec's permitted Principle V exception that Phase 1 may be incrementally extended later. | ✅ Pass (cycle in progress; FR-015 supports incremental extension) |

**Initial gate**: PASS — no unjustified violations.

**Post-design re-check**: see end of Phase 1 below.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-discovery/
├── spec.md                  # Specification (created by /speckit-specify, clarified by /speckit-clarify)
├── plan.md                  # This file (/speckit-plan)
├── research.md              # Phase 0 output (/speckit-plan)
├── data-model.md            # Phase 1 output (/speckit-plan)
├── quickstart.md            # Phase 1 output (/speckit-plan)
├── api-contract.md          # THE DELIVERABLE — populated by /speckit-implement (canonical Markdown narrative)
├── checklists/
│   └── requirements.md      # Spec quality checklist (created by /speckit-specify)
├── contracts/               # Phase 1 output (/speckit-plan creates skeleton; /speckit-implement populates)
│   ├── openapi.yaml         # OpenAPI 3.1 sidecar mirroring api-contract.md
│   └── entities/
│       └── README.md        # Convention doc; per-entity *.schema.json added during implement
└── tasks.md                 # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

The deliverable is split into a human-reviewable canonical Markdown
document (`api-contract.md`) and a machine-readable sidecar
(`contracts/openapi.yaml`) mirroring it 1:1. Per-entity JSON Schema files
under `contracts/entities/` provide the entity shapes Phase 3 will consume
directly. The Markdown is authoritative on any disagreement; the sidecars
exist to feed Phase 3 contract testing without re-parsing prose.

### Source Code (repository root)

This feature reads the React frontend (`frontend/`) and produces
documentation in `specs/002-api-discovery/`. It does **not** create or
modify any source code, and it does **not** touch any file under
`frontend/`.

```text
frontend/                    # AUDIT SUBJECT — READ-ONLY (Principle I, FR-016, SC-010)
├── src/
│   ├── pages/               # Audited: each *.tsx is a flow source
│   ├── components/          # Audited transitively via the pages they render
│   ├── context/DemoContext.tsx  # Central state module — operations source
│   ├── lib/demoStore.ts     # Reducer + entity types source
│   ├── types.ts             # Entity types source
│   └── ...
└── package.json             # Third-party SDK declarations source (FR-017)

specs/002-api-discovery/     # DELIVERABLE LOCATION — created/edited by this phase only
└── (see tree above)

CLAUDE.md                    # EDITED — current-feature plan pointer updated to specs/002-api-discovery/plan.md (per /speckit-plan template instruction)
```

**Structure Decision**: The feature is documentation-only inside the
existing repo. The deliverable lives in the standard Spec Kit feature
directory; the canonical Markdown is at the feature directory root
(`api-contract.md`) for visibility, and machine-readable sidecars sit
under `contracts/` per Spec Kit convention. No new top-level directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | (none)     | (none)                              |

---

## Phase 0: Outline & Research

**Status**: Complete — spec contains 0 `[NEEDS CLARIFICATION]` markers
(resolved by `/speckit-clarify` session 2026-04-29). Remaining
plan-level decisions (deliverable format, citation format, audit method,
changelog format, OpenAPI sidecar shape) are recorded in
[research.md](./research.md).

Output: [research.md](./research.md). It records the plan-time decisions
that shape this feature's deliverable, the rationale for each, and
alternatives considered.

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete (yes).

1. **Entities → data-model.md**: The spec defines seven structural
   entities for the deliverable itself (API Contract Document, Endpoint
   Entry, Frontend Operation, Frontend Flow, Data Entity, Source
   Citation, Contradiction Register Entry). These describe the shape of
   the *deliverable*, not a database. For Phase 1 they also imply the
   shape of the entities the API will eventually serve (User,
   Transaction, etc.) — those are documented in the deliverable itself
   (`api-contract.md`), not in `data-model.md`. Captured in
   [data-model.md](./data-model.md) with attributes, relationships, and
   validation rules derived from the spec's functional requirements.

2. **Interface contracts → /contracts/**: PRESENT. This feature's
   deliverable IS an API contract specification — the deliverable's
   machine-readable layer lives under `contracts/`. `/speckit-plan`
   creates the directory and the convention files (`openapi.yaml`
   skeleton, `entities/README.md`); `/speckit-implement` populates the
   endpoint paths and per-entity JSON Schemas mirroring the canonical
   Markdown. The OpenAPI document carries `x-classification` (observed
   | derived), `x-source-citation`, and `x-phase3-grounding-note`
   extensions on each path operation so the spec's FR-007 / FR-008 /
   FR-009 obligations are machine-checkable, not just prose.

3. **Quickstart → quickstart.md**: A reviewer-oriented walkthrough that
   lets anyone verify Phase 1 is actually done — what to open, what to
   look for in each artefact, how to spot-check a derived entry against
   its frontend source citation in under one minute (SC-001), and how to
   run the OpenAPI structural validator. See
   [quickstart.md](./quickstart.md).

4. **Agent context update**: The plan reference in `CLAUDE.md` between
   `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` is updated to
   point at this plan (`specs/002-api-discovery/plan.md`). This is the
   plan-template's prescribed update and is performed at
   `/speckit-plan` time, not deferred to `/speckit-implement`. The
   constitution-precedence note at the top of the marker block remains
   intact (Principle I from Phase 0's `CLAUDE.md` work).

**Output**: data-model.md, contracts/ (skeleton: openapi.yaml +
entities/README.md), quickstart.md, updated CLAUDE.md plan pointer.

### Constitution Check (post-design re-evaluation)

After Phase 1 design, no new violations introduced:

- Principle I (Frontend-Contract Fidelity): the design enforces
  observed-vs-derived classification (deliverable mechanism + OpenAPI
  `x-classification` extension), forbids any frontend modification
  (FR-016, SC-010), and stays wire-level only (FR-011, SC-009). ✅
- Principle II (Test-First): the requirements checklist exists and the
  15 SC counters are binary-testable; the quickstart documents the
  reviewer procedure that produces a pass/fail per counter. ✅
- Principle III (Contract Tests From Observed Behavior): the design
  embeds observed-vs-derived classification, source citation, and a
  Phase 3 grounding note as first-class fields on every endpoint entry
  (both in Markdown and in OpenAPI extensions), and the contradiction
  register surfaces every gap. ✅
- Principle IV (Laravel Idiomatic): still N/A — no code. The
  deliverable explicitly excludes backend implementation choices
  (FR-011, SC-009). ✅
- Principle V (Spec-Driven Phased Delivery): this entire feature is
  the Phase 1 cycle. The changelog/version marker (FR-015, SC-011)
  supports the constitution's permitted incremental extension of
  Phase 1 during later phases. ✅

**Post-design gate**: PASS.
