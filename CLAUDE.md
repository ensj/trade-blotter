# Trade Blotter

A single-page trade blotter: enter trades, see them in a sortable grid, see positions derived from trade history.

The approved design is authoritative: `docs/superpowers/specs/2026-10-19-trade-blotter-design.md`. Read it before changing behavior. `prompt.md` is the original prompt; where it differs, the design wins (no users, no client timestamps, no timezone setting, no paste mode).

## Requirements summary

- Backend: .NET 8 REST API, SQLite via EF Core. `POST /trades` (201 + Location), `GET /trades` (newest first), `GET /trades/{id}`, `GET /positions` (net quantity and average cost per symbol, sorted by symbol, zero positions omitted). Positions are computed, never stored.
- Frontend: Vue 3 `<script setup>` + TS, Vite, Pinia, PrimeVue, AG Grid Community. Toolbar (search + "+"), blotter grid, positions panel, trade entry modal.
- Errors are RFC 7807 ProblemDetails. JSON is camelCase. Timestamps are UTC with a `Z` suffix.

## Architecture rules

- Backend: Controller → Feature. Controllers only translate HTTP; business logic and data access live in `Features/<Name>/`.
- `decimal` for quantity and price on the server, end to end. Never `double` or `float` for money.
- Frontend: shared state lives in Pinia stores (`src/stores`). Components read stores; `src/api` holds stateless fetch calls.
- Layout uses CSS `display: grid`.
- AG Grid Community only; no Enterprise features.

## Quality rules

- Unit test coverage must stay at or above 80% lines (enforced by coverlet and Vitest thresholds).
- Files have a soft 500-line limit. `scripts/check-file-length.sh` warns; split the file rather than ignore it.
- Use TDD for logic.
- Mutation testing runs on demand (`npm run mutation`, `dotnet stryker`), never on a hook.
- Update `README.md` whenever configuration changes (tooling, scripts, ports, env vars, dependencies).

## Commit rules

- One meaningful change per commit.
- Short imperative subject line (e.g. "Add position calculator").
- Pre-commit runs formatters, linters, the file-length check, and tests for the side that changed. Don't bypass it with `--no-verify`.

## Section ownership

Parallel agents edit only their own sections of this file and `README.md`:

- Backend agent: `backend/` and the sections marked **Backend**.
- Frontend agent: `frontend/` and the sections marked **Frontend**.
- Coordinator: everything else (root config, `docs/`, e2e, shared sections).

## Backend

<!-- Owned by the backend agent. -->

## Frontend

<!-- Owned by the frontend agent. -->

- Pure logic lives in `src/lib/` and column defs in `src/components/*Columns.ts`, so they test without mounting a grid. Components stay thin.
- Grid custom components are registered by name with `defineExpose` (see `BlotterGrid.vue`).
- AG Grid rows animate out after a filter or data change. Component tests wait about 600 ms before asserting that a row is gone.
- `npm run dev:mock` runs the UI without the backend (`mock/mockApi.ts`, dev-only). Keep it in step with `docs/openapi.json`.
- Biome runs with `html.experimentalFullSupportEnabled` so it sees template usage in `.vue` files.
