# Salamhack Backend

This Laravel application is the Phase 2 backend foundation for the Salamhack prototype.

Primary references:

- Setup and validation: `../specs/003-backend-foundation/quickstart.md`
- Route contract: `../specs/003-backend-foundation/contracts/route-registry.md`
- Implementation plan: `../specs/003-backend-foundation/plan.md`

Phase 2 scope:

- Register all 18 Phase 1 API paths exactly as documented, with no `/api` prefix.
- Return a canonical `501 not_implemented` error envelope from product endpoint stubs.
- Expose public `GET /healthz`.
- Enforce Bearer-token presence only on authenticated routes.
- Render all non-2xx responses through the canonical error envelope.
- Avoid business logic, persistence, migrations, Eloquent models, and frontend changes.

Phase 4 validation and response shaping:

- Endpoint validation should use Laravel FormRequest classes.
- Validation failures must be rendered centrally as `error.code=validation_failed`.
- Successful business responses should use Laravel API Resources or ResourceCollections.
- Controllers should stay thin and delegate domain behavior to services introduced in later phases.

Phase 4.5 FlowX API alignment:

- Updated frontend contract source: `../updated_frontend/src/services/` and `../updated_frontend/db.json`.
- Planning artifacts: `../specs/006-api-alignment-refactor/`.
- Run the backend on the updated frontend default API port:

```powershell
php artisan serve --host=127.0.0.1 --port=5000
```

- Run the FlowX contract tests:

```powershell
vendor/bin/pest tests/Feature/FlowX tests/Unit/Domain/FlowX
```

- Run all backend checks:

```powershell
vendor/bin/pest
vendor/bin/pint --test
```

The Phase 4.5 resource routes are header-free for demo compatibility and live
beside the existing Phase 4 `/transactions`, `/admin/transactions`, and
`/auth/*` routes.

Phase 5 FlowX persistence:

- Local/demo persistence uses SQLite through Laravel migrations.
- Configure `DB_CONNECTION=sqlite` and `DB_DATABASE=database/database.sqlite`.
- Initialize persistent baseline data:

```powershell
php artisan migrate
php artisan db:seed
```

- Reset local demo data explicitly:

```powershell
php artisan flowx:reset-demo-data
```

Ordinary seeding is idempotent and must not remove user-created records.
