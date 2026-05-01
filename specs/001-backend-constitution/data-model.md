# Data Model: Backend Constitution (Phase 0)

**Feature**: Backend Constitution (Phase 0)
**Date**: 2026-04-29

## Scope and framing

This feature does not introduce any database, persisted records, or in-memory
runtime model. The "data" it produces and governs is the *structural model of
the project's governance documents*: how they compose, what fields each must
carry, and what validation rules each must satisfy.

Each entity below corresponds to a real on-disk artefact (or a section
within one). Attributes map to **structural requirements** that the
implementation step (`/speckit-implement`) and the quickstart verification
must satisfy. Validation rules are derived directly from the spec's
functional requirements.

---

## Entity: Constitution Document

**On-disk location**: `.specify/memory/constitution.md` (single canonical
path — FR-001).

**Attributes**:

| Attribute | Type | Source / Format | Required |
|-----------|------|-----------------|----------|
| `version` | string (semver: `MAJOR.MINOR.PATCH`) | Footer line: `**Version**: X.Y.Z` | Yes (FR-011) |
| `ratification_date` | ISO date (`YYYY-MM-DD`) | Footer line: `**Ratified**: YYYY-MM-DD` | Yes (FR-011) |
| `last_amended_date` | ISO date (`YYYY-MM-DD`) | Footer line: `**Last Amended**: YYYY-MM-DD` | Yes (FR-011) |
| `principles` | ordered list of `Principle` | `## Core Principles` section, one per `### N. Title` | Yes — at least one (FR-002…FR-006) |
| `supplementary_sections` | list of named sections | Sections after Core Principles (technology, workflow, governance) | Yes — must include Technology Stack, Development Workflow, Governance |
| `sync_impact_report` | HTML comment block at top of file | Block prepended on each amendment | Yes (FR-008(b)) |

**Validation rules**:

- MUST contain zero unresolved placeholder tokens of the form
  `[ALL_CAPS]` (FR-012).
- MUST declare `frontend/` as the authoritative source of the API contract
  and prohibit modifying frontend code to make the backend function
  (FR-002).
- MUST require contract tests for every API endpoint, derived from observed
  frontend behavior (FR-003).
- MUST mandate test-first development with tests and implementation in the
  same change set (FR-004).
- MUST identify the chosen backend framework family (Laravel) and require
  idiomatic use of its standard building blocks (FR-005).
- MUST require Spec Kit cycle per phase per `BACKEND_PLAN.md` (FR-006) and
  define what "phase complete" means in constitutional terms.
- MUST list mechanically-applicable per-PR quality gates (FR-007).
- MUST define the amendment process: semver bump + sync impact report +
  template updates + one reviewer approval (FR-008).
- MUST define the precedence rule: constitution supersedes
  `BACKEND_PLAN.md`, the templates, and `CLAUDE.md` (FR-009).
- MUST define how a contributor records and gets approval for a justified
  deviation (FR-010).

**Lifecycle**:

- *Draft template* (`.specify/templates/constitution-template.md` copied
  into place by Spec Kit setup) → *Ratified v1.0.0* (this Phase 0) →
  *Amended vX.Y.Z* (subsequent amendments via the process in FR-008).

---

## Entity: Principle

**On-disk location**: A `### N. <Name>` subsection inside `## Core Principles`
of the Constitution Document.

**Attributes**:

| Attribute | Type | Required |
|-----------|------|----------|
| `ordinal` | Roman numeral, monotonically increasing within the document | Yes |
| `name` | short title (3-6 words) | Yes |
| `non_negotiable` | boolean — present if the title contains "(NON-NEGOTIABLE)" | Optional |
| `body` | one or more paragraphs of MUST/SHOULD obligations | Yes |
| `rationale` | a paragraph explaining *why* the principle exists | Yes (per template convention) |

**Validation rules**:

- Body MUST use MUST / MUST NOT / SHOULD wording (no vague "we should").
- Each `(NON-NEGOTIABLE)` principle MUST explicitly state that no
  exceptions are permitted, or define an exceptions clause if any are
  permitted.

**Relationships**:

- A `Principle` is the source of one or more `Quality Gate`s (a gate
  derives from a principle).

---

## Entity: Quality Gate

**On-disk location**: Listed in the `## Development Workflow & Quality Gates`
section of the Constitution Document, and re-invoked in each feature plan's
`## Constitution Check` section.

**Attributes**:

| Attribute | Type | Required |
|-----------|------|----------|
| `derived_from_principle` | reference to a `Principle` (by ordinal/name) | Yes |
| `inspected_artefact` | string — what the reviewer reads to evaluate (test file path, code file path, plan section) | Yes |
| `outcome` | enum — pass / fail / N/A | Yes (binary, per SC-001) |
| `applies_to` | predicate — which PRs this gate applies to (e.g., "PRs that add or modify endpoints") | Yes |

**Validation rules**:

- A reviewer MUST be able to evaluate the gate without subjective
  judgement (SC-001). If a gate requires interpretation, it MUST be
  re-worded.
- Every Principle MUST be reflected by at least one gate, OR the
  constitution MUST justify why that principle is verified at a different
  point in the workflow.

---

## Entity: Amendment

**On-disk location**: A git commit (or merged PR) that edits
`.specify/memory/constitution.md` and prepends a sync impact report block.

**Attributes**:

| Attribute | Type | Required |
|-----------|------|----------|
| `version_bump` | enum — MAJOR / MINOR / PATCH | Yes (FR-008(a)) |
| `bump_rationale` | one paragraph stating which rule from the versioning policy applies | Yes |
| `sync_impact_report` | HTML comment at top of constitution.md | Yes (FR-008(b)) |
| `templates_touched` | list of `.specify/templates/*.md` files updated, each annotated `✅ updated` or `✅ no change required` | Yes (FR-008(c), SC-005) |
| `reviewer_approval` | at least one PR approval | Yes (FR-008(d)) |
| `commit_or_pr_link` | reference to the git artefact | Yes |

**Validation rules**:

- Sync Impact Report MUST list every modified principle, every added
  section, and every removed section.
- A `MAJOR` bump MUST cite the removed/redefined principle in the
  rationale.
- Every `Principle` whose obligations change MUST appear in the report.

**Relationships**:

- An `Amendment` updates exactly one `Constitution Document` and zero or
  more `Principle`s.

---

## Entity: Spec-Kit Phase

**On-disk location**: A section inside `BACKEND_PLAN.md` (one per phase
0..7).

**Attributes**:

| Attribute | Type | Required |
|-----------|------|----------|
| `phase_number` | integer 0-7 | Yes |
| `objective` | one paragraph | Yes |
| `key_outputs` | bulleted list | Yes |
| `entry_criteria` | implicit — previous phase complete | Yes |
| `exit_criteria` | the constitutional gates that apply to this phase | Yes |

**Validation rules** (post-Phase-0):

- Phase 0 description MUST reference Laravel/PHP (FR-013).
- Phase 2 description MUST reference Laravel/PHP rather than Node.js +
  TypeScript (FR-013, SC-008).
- After Phase 0 closes, no `Spec-Kit Phase` section in `BACKEND_PLAN.md`
  may state a backend-stack choice that contradicts the constitution
  (SC-008).

**Relationships**:

- Each `Spec-Kit Phase` is governed by zero or more `Quality Gate`s
  (depending on what kind of work the phase contains).

---

## Cross-cutting: agent-runtime guidance file (`CLAUDE.md`)

Not modelled as a separate entity (it is not a governance artefact in its
own right), but Phase 0 imposes structural requirements on it via FR-014:

- MUST contain an explicit, first-glance reference to
  `.specify/memory/constitution.md`.
- MUST state that the constitution supersedes other guidance.
- The reference MUST be discoverable on first read (i.e., not buried after
  unrelated content) — verifiable by the SC-009 one-minute test.

---

## Summary table — verification mapping

| Spec FR | Entity / artefact verified | How |
|---------|----------------------------|-----|
| FR-001 | Constitution Document path | File exists at `.specify/memory/constitution.md` |
| FR-002 | Principle I body | Grep for "frontend" + "authoritative" in constitution |
| FR-003 | Principle III body | Grep for "contract test" + "observed" |
| FR-004 | Principle II body | Grep for "test-first" / "TDD" + "same change set" |
| FR-005 | Principle IV body | Grep for "Laravel" + each idiomatic building block |
| FR-006 | Principle V + Workflow section | Grep for "Spec Kit" + phase-completion definition |
| FR-007 | Workflow section | Section lists per-PR gates |
| FR-008 | Governance section | Lists semver + sync impact + templates + reviewer |
| FR-009 | Governance section | Precedence rule present |
| FR-010 | Governance section | Deviation logging + approval defined |
| FR-011 | Constitution footer | Version + dates present, ISO format |
| FR-012 | Whole document | Grep for `[A-Z_]\+` brackets returns zero hits |
| FR-013 | `BACKEND_PLAN.md` Phases 0/2 | Grep for "TypeScript" / "Node.js" returns zero hits in those sections |
| FR-014 | `CLAUDE.md` | First-glance reference + precedence note present |
