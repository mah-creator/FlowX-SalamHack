# Quickstart: API Discovery (Phase 1) — Reviewer's Walkthrough

**Audience**: anyone validating that Phase 1 is actually done — reviewer,
team lead, AI agent picking up the work.
**Time required**: ~10 minutes for a spot-check, ~30 minutes for a full
checklist pass.

This walkthrough makes the spec's 15 Success Criteria executable. Read
the artefacts in the order below; when you finish, you will know whether
Phase 1 is exit-ready.

---

## 0. Prerequisites

You need:

- A working git checkout at `branch 002-api-discovery`.
- A text editor or browser able to render Markdown.
- (Optional, only for SC-009 structural validation) `npx
  @apidevtools/swagger-cli validate specs/002-api-discovery/contracts/openapi.yaml`
  or any OpenAPI 3.1 validator on your PATH.

You do **not** need to run the React frontend, install Laravel, or have
any backend running. Phase 1 is documentation only.

---

## 1. Read the artefacts in this order

1. [`spec.md`](./spec.md) — what Phase 1 must produce, including the
   Clarifications session.
2. [`plan.md`](./plan.md) — Constitution Check, project structure, and
   the design choices that made it through clarification.
3. [`research.md`](./research.md) — the six plan-time decisions
   (R1–R6) with rationale and rejected alternatives.
4. [`data-model.md`](./data-model.md) — the structural model of the
   deliverable; tells you what each entry should look like.
5. [`api-contract.md`](./api-contract.md) — **the deliverable itself.**
   Skim the table of contents first; you'll spot-check entries below.
6. [`contracts/openapi.yaml`](./contracts/openapi.yaml) — the
   machine-readable sidecar. Open it once just to confirm it exists
   and validates; you don't need to read every path.
7. [`contracts/entities/`](./contracts/entities/) — per-entity JSON
   Schemas. One file per entity in the deliverable; the directory
   listing is the SC-004 receipt.

---

## 2. Spot-check procedure (≤5 minutes per item, per SC-005)

Pick three Endpoint Entries from `api-contract.md` at random. For each:

1. Note its `id` (e.g., `EP-007`), `method`, `path`, `classification`,
   and `source_citation`.
2. Open the cited frontend file at the cited symbol or line range.
3. Confirm the cited code corroborates the entry's request shape,
   response shape, and status-side-effects without further context.
4. If `classification = derived`, confirm `phase3_grounding_note` is
   non-empty and explains how Phase 3 will ground its contract test.
5. If the request creates an entity with an identifier, confirm
   `id_origin_candidates` lists the candidates without selecting one
   (FR-018).

If every spot-check passes, SC-001, SC-006, SC-007, and SC-013 are on
track.

---

## 3. Coverage receipt (run all four)

| Receipt | What to check | Pass when |
|---------|---------------|-----------|
| SC-002 | Compare the page list (`ls frontend/src/pages/*.tsx`) against the Frontend Flows section of `api-contract.md`. | Every page appears, and each is either mapped to ≥1 endpoint or marked "no backend operation required". |
| SC-003 | Compare the methods on `DemoContextValue` and the reducer action `type` values (in `frontend/src/context/DemoContext.tsx` and `frontend/src/lib/demoStore.ts`) against the Frontend Operations section. | Every method and every action `type` appears, and each is either mapped to ≥1 endpoint or marked client-only. |
| SC-004 | Compare typed exports in `frontend/src/types.ts` and entity exports in `frontend/src/lib/demoStore.ts` against the Data Entities section. | Every typed export appears with a field breakdown, and each has a corresponding `contracts/entities/<Name>.schema.json` file. |
| SC-012 | Compare `frontend/package.json` `dependencies` and `devDependencies` against the Third-Party Integrations section. | Every external-service SDK appears with audit-time invocation status. |

---

## 4. Constitution Check (re-affirm)

Run through the five principles using `api-contract.md`:

- **Principle I** — open `git status` against `frontend/`; expect zero
  modifications since branch creation. SC-010.
- **Principle II** — open `checklists/requirements.md`; every item
  ticked. The file dates from `/speckit-specify` time, before
  population, satisfying test-first.
- **Principle III** — every Endpoint Entry has a `source_citation`;
  every `derived` entry has a `phase3_grounding_note`. SC-006, SC-007.
- **Principle IV** — search `api-contract.md` for the strings
  "Laravel", "Sanctum", "Passport", "Eloquent", "PHP", "MySQL",
  "Postgres". Expect zero matches. SC-009.
- **Principle V** — `api-contract.md` carries `version` and a
  `## Changelog` section. SC-011.

---

## 5. Structural validation (optional but recommended)

```text
npx @apidevtools/swagger-cli validate specs/002-api-discovery/contracts/openapi.yaml
```

The validator should report no errors. This is not a contract test (no
backend exists yet); it is a structural smoke test that the OpenAPI
sidecar is well-formed. The same sidecar will feed Phase 3 contract
tests after Phase 2 stands up routes.

---

## 6. Exit criteria

Phase 1 is exit-ready when **all** of the following are true:

- [ ] Every checklist item in `checklists/requirements.md` is `[x]`.
- [ ] Each of the 15 SCs in `spec.md` evaluates to pass per the
      receipts above.
- [ ] `api-contract.md` has a `version` line and ≥1 changelog entry.
- [ ] `git status` against `frontend/` shows zero modifications.
- [ ] `contracts/openapi.yaml` validates structurally.
- [ ] The Contradiction Register section is present (even if empty,
      stated explicitly per SC-008).

When the above are true, the next phase is Phase 2 — Backend Foundation,
which uses `api-contract.md` and `contracts/openapi.yaml` as its
authoritative input. Run `/speckit-tasks` next to break Phase 1's
implementation work into ordered tasks.

<!-- Phase 1 exit walkthrough: 2026-04-29, Codex -->
