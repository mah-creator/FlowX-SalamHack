# Phase 0 Research: API Discovery (Phase 1)

**Date**: 2026-04-29
**Spec**: [spec.md](./spec.md) (clarified 2026-04-29)
**Plan**: [plan.md](./plan.md)

The spec carries 0 `[NEEDS CLARIFICATION]` markers after the
`/speckit-clarify` session of 2026-04-29 (5 questions resolved). This file
records the remaining plan-time decisions: deliverable format and layout,
source-citation format, audit method, changelog format, and OpenAPI sidecar
conventions. Each decision is stated, justified, and accompanied by
rejected alternatives.

---

## R1 — Deliverable format

**Decision**: One canonical Markdown narrative (`api-contract.md`) at the
feature directory root, plus a machine-readable OpenAPI 3.1 YAML sidecar
(`contracts/openapi.yaml`) and per-entity JSON Schema files
(`contracts/entities/<EntityName>.schema.json`). The Markdown is
authoritative on disagreement; the sidecars exist to feed Phase 3 contract
testing without re-parsing prose.

**Rationale**:

- Spec FR-001 requires a single canonical, singly-addressable artefact.
  The Markdown file at the feature root satisfies that.
- Phase 3 will need machine-readable shapes to drive contract assertions;
  rebuilding them from prose at that point would invite drift. Producing
  the OpenAPI YAML and per-entity JSON Schemas in Phase 1 keeps the
  shapes versioned alongside the narrative they were derived from.
- OpenAPI 3.1 is JSON-Schema-aligned, so the entity schemas can be
  referenced by `$ref` from the OpenAPI document and reused independently
  in Phase 3 unit-level test fixtures.
- Markdown stays authoritative because the constitution's Principle III
  obligations (source citation, observed-vs-derived classification,
  Phase 3 grounding note) are most readable as prose; the OpenAPI carries
  them via custom `x-` extensions for machine consumption but they belong
  primarily to the narrative.

**Alternatives considered**:

- *Markdown only*: simpler, but Phase 3 would have to reverse-engineer
  endpoint shapes from prose, increasing drift risk.
- *OpenAPI only*: would push the spec's narrative obligations
  (FR-009 grounding note, FR-014 contradiction register) into prose
  fields awkwardly; OpenAPI is built for shape, not for documenting
  why a shape was chosen.
- *Single Markdown + a JSON Schema bundle (no OpenAPI)*: would force
  Phase 3 to invent its own routing/method metadata format. OpenAPI
  already standardises that.

---

## R2 — Source-citation format

**Decision**: Citations use one of three exact forms, chosen per-claim:

1. **File + symbol** — `frontend/src/lib/demoStore.ts#nextTxId`
2. **File + line range** — `frontend/src/context/DemoContext.tsx:88-114`
3. **Page component name** — `frontend/src/pages/NewTransferPage.tsx`
   (used when the claim is grounded in the page-level UI flow rather
   than a specific symbol)

Citations MUST be reviewer-verifiable in isolation: opening the cited
file and reading the named symbol or line range MUST corroborate the
claim, with no other context required.

**Rationale**:

- Spec FR-008 requires citations sufficient to verify entries without
  consulting the original author. The three forms cover the three
  natural granularities the audit will produce (function, block,
  whole-component-flow).
- Line ranges can drift if the frontend changes; that risk is accepted
  because the constitution permits Phase 1 to be incrementally
  extended (Principle V) and FR-015 mandates a changelog. When a
  citation drifts, the changelog records the re-citation.
- File paths use repo-root-relative paths (no leading slash) matching
  the rest of Spec Kit's conventions.

**Alternatives considered**:

- *Captured request fixtures (HAR files, recorded JSON)*: would be
  ideal per constitution Principle III, but no HTTP traffic exists to
  capture today (audit finding R3). Reserved for the *observed* layer
  when traffic eventually appears.
- *Free-form prose pointers* ("see DemoContext"): violates the
  reviewer-in-isolation criterion; rejected.
- *Permalink URLs to a hosted git provider*: introduces an external
  dependency not present in this repo at audit time; rejected.

---

## R3 — Audit method (HTTP-discovery procedure)

**Decision**: The audit is performed by source-tree inspection at the
HEAD commit of branch `002-api-discovery`. The procedure is:

1. **HTTP-call grep**: search `frontend/src/` for the patterns
   `fetch\(`, `axios`, `XMLHttpRequest`, `ky\(`, `got\(`, and any
   `import.meta.env.VITE_*_URL` style API base-URL configuration.
   Record the result. Initial sweep on 2026-04-29 returned **zero
   matches** in `frontend/src/`; this is the audit's headline finding.
2. **Page-level flow enumeration**: list every `*.tsx` under
   `frontend/src/pages/` and walk each page's hooks/state usage to
   identify implied backend operations.
3. **State-module enumeration**: walk every method on `DemoContextValue`
   in `frontend/src/context/DemoContext.tsx` and every reducer action
   `type` it dispatches in `frontend/src/lib/demoStore.ts`. Map each
   item to one endpoint entry or to an explicit "client-only" note.
4. **Entity enumeration**: walk every typed export from
   `frontend/src/types.ts` and every type/constant exported from
   `frontend/src/lib/demoStore.ts` (`Transaction`, `TxStatus`,
   `DEMO_CONFIG`, `DEMO_USERS`, `NotificationItem`, `User`, the audit
   log entry type, etc.). Record each as a Data Entity in the
   deliverable.
5. **Third-party enumeration**: read `frontend/package.json`
   `dependencies` and `devDependencies` and produce the Third-Party
   Integrations section per FR-017. For each declared SDK, repeat
   step 1's grep with the SDK's import name (`@google/genai`,
   `GoogleGenAI`, etc.) to confirm whether it is invoked from
   `frontend/src/`.
6. **Audit-method note**: copy this procedure verbatim into a section
   of `api-contract.md` so reviewers can reproduce it.

**Rationale**:

- Reproducibility: any reviewer running the same six steps at the same
  commit MUST reach the same set of findings. This is the operational
  meaning of "audit" for a documentation deliverable.
- Source-only: avoids depending on a running browser/proxy, which
  would (a) require running the frontend (which has no backend to
  point at) and (b) couple the audit to environment quirks.
- Constitution Principle I compliance: zero frontend modifications;
  step 1 is grep-only, steps 2-5 are read-only.

**Alternatives considered**:

- *Runtime capture via browser devtools or a recording proxy*:
  ideal for *observed* findings under Principle III, but the frontend
  issues no requests today, so runtime capture would produce nothing.
  Reserved for later additions to Phase 1 (Principle V incremental
  extension) once the frontend wires HTTP.
- *Static-analysis tooling (e.g., AST-based fetch-graph extraction)*:
  overkill for a frontend that emits no HTTP. Reconsider only if the
  surface grows large enough to need it.

---

## R4 — Changelog and version marker

**Decision**: The deliverable carries a `## Changelog` section
immediately after its title block, plus a `**Version**: vMAJOR.MINOR.PATCH
| Last-Updated: YYYY-MM-DD` line in the title block. Initial release at
`v1.0.0` corresponds to Phase 1's first ratified deliverable. Subsequent
incremental extensions per Principle V bump:

- **MAJOR**: an existing endpoint entry is removed or its method/path
  changes — i.e., a contract-breaking edit.
- **MINOR**: an endpoint entry is added, or a derived entry is
  reclassified to observed.
- **PATCH**: source citations are updated (e.g., line numbers
  re-anchored after a frontend refactor) or a Phase 3 grounding note is
  refined; no contract shape change.

Each changelog entry records: version, date, summary line, and the
list of affected endpoint entry IDs.

**Rationale**:

- FR-015 / SC-011 require a current version, last-updated marker, and
  changelog so incremental extensions are visibly traceable.
- Mirrors the constitution's own semver discipline (constitution v1.0.1)
  for consistency across the repo.

**Alternatives considered**:

- *Date-based versioning only*: loses the contract-breakage signal
  MAJOR provides; rejected.
- *Git history as the de facto changelog*: forces every reviewer to
  run `git log` to understand state changes; the explicit changelog
  costs little and is a single-pass read.

---

## R5 — OpenAPI sidecar conventions

**Decision**: `contracts/openapi.yaml` is an OpenAPI 3.1 document. Each
path operation carries the following custom extensions:

- `x-classification`: `observed` | `derived` (mirrors Markdown FR-007).
- `x-source-citation`: a string in one of the R2 formats.
- `x-phase3-grounding-note`: present only when `x-classification:
  derived`; mirrors Markdown FR-009.
- `x-frontend-operation`: optional; the `DemoContextValue` method or
  reducer action the entry maps to (when one exists).
- `x-frontend-flow`: optional; the page component name(s) the entry
  is referenced by.

Components are reused from per-entity JSON Schema via `$ref:
"./entities/<EntityName>.schema.json"`. Authentication is described in
the OpenAPI `components.securitySchemes` section per the FR-010
recommendation (wire-level only — no Laravel package names).

**Rationale**:

- Custom `x-` extensions are first-class in OpenAPI 3.1 and ignored by
  validators; they let the deliverable's Principle III obligations
  ride alongside the standard fields without breaking tooling.
- `$ref` to per-entity JSON Schemas lets Phase 3 consume an entity's
  shape directly (e.g., for a contract test asserting a Transaction
  payload) without parsing the OpenAPI envelope.

**Alternatives considered**:

- *Inline all schemas in the OpenAPI*: simpler initially but harder to
  consume entity-by-entity in Phase 3.
- *AsyncAPI / GraphQL schema*: not the protocol the eventual backend
  will serve (constitution implies a REST-shaped surface; the
  frontend's reducer actions map naturally to REST verbs).
- *Skip OpenAPI entirely, use Markdown only*: see R1 alternatives.

---

## R6 — Out of scope / explicitly deferred

The following items are recorded here so future readers don't expect
them in Phase 1:

- **Backend code, scaffolding, or test fixtures** — Phase 2 / Phase 3 /
  Phase 4 own these (constitution V). Phase 1 stays documentation-only.
- **Selecting Sanctum vs. Passport** — explicitly out of scope per
  spec FR-010(b) and FR-011; Phase 2 / Phase 6 decide.
- **Resolving the constitution Principle III contradiction** (i.e.,
  modifying the frontend to issue HTTP requests so derived entries can
  become observed) — surfaced via FR-014's contradiction register but
  not resolved in Phase 1. Belongs to a later phase or a constitution
  amendment.
- **Selecting an ID-origin position per entity** — explicitly deferred
  per FR-018 / SC-013; Phase 2's plan owns it.
- **Selecting the per-status `TxStatus` API mapping at finer
  granularity than FR-019** — deferred to Phase 2; Phase 1 documents
  the convention only.
