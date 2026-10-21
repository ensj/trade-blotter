# Trade Blotter

A trade blotter: enter trades, see them in a live grid, and see positions derived from trade history. .NET 8 API + Vue 3 frontend.

Design: [`docs/superpowers/specs/2026-10-19-trade-blotter-design.md`](docs/superpowers/specs/2026-10-19-trade-blotter-design.md).

## Setup

### Prerequisites

- .NET 8 SDK. `global.json` pins `8.0.x` with `rollForward: latestFeature`. If `dotnet` resolves to another SDK, put the right one first: `export DOTNET_ROOT=$HOME/.dotnet PATH=$HOME/.dotnet:$PATH`.
- Node 24.

### Claude Code MCP servers and skills

- `.mcp.json` registers three project MCP servers, run through `npx`: AG Grid (`ag-mcp`), PrimeVue (`@primevue/mcp`) and Playwright (`@playwright/mcp`). Claude Code asks you to approve them on first use.
- `.claude/skills/` holds the vendors' official skills, copied from [`ag-grid/skills`](https://github.com/ag-grid/skills) (`ag-dev`, `ag-update`) and [`primefaces/primeui-plugins`](https://github.com/primefaces/primeui-plugins/tree/main/plugins/primevue/skills) (`primevue-*`; these call the PrimeVue MCP tools). To update them, re-copy from those repos.

### Backend

```sh
cd backend
dotnet run --project src/TradeBlotter.Api   # http://localhost:5080, Swagger at /swagger
```

SQLite via EF Core 8. Migrations in `src/TradeBlotter.Api/Data/Migrations/` are applied on startup. The database file defaults to `src/TradeBlotter.Api/trade-blotter.db` (gitignored); override it with `ConnectionStrings__TradeBlotter="Data Source=/path/to/file.db"`.

```sh
dotnet tool restore
dotnet ef migrations add <Name> --project src/TradeBlotter.Api --output-dir Data/Migrations
```

Backend behavior worth knowing:

- Validation lives in `Features/Trades/TradeValidator`, run by MVC through `CreateTradeRequest : IValidatableObject`, so every 400 has the same ValidationProblemDetails shape. `[Required]` reports missing fields; the validator checks values only once they are present.
- Money must be a JSON number. `"quantity": "100"` is a 400, not coerced.
- SQLite stores decimals as TEXT and reads `100` back as `100.0`, so responses may carry a trailing `.0`. The value is identical.
- 500s are ProblemDetails with no exception detail outside Development.
- Stryker needs the .NET 8 SDK on PATH: `scripts/with-dotnet.sh scripts/mutation-backend.sh`.

Mutation score (Stryker.NET 4.16.0, `Features/**`, 2026-10-20): **97.92%**, 47 killed, 1 survived, 0 timeouts. 13 mutants did not compile and 4 were skipped as already covered; neither counts.

| File | Killed | Survived |
|---|---|---|
| `Positions/PositionCalculator.cs` | 22 | 1 |
| `Positions/PositionService.cs` | 1 | 0 |
| `Trades/TradeService.cs` | 5 | 0 |
| `Trades/TradeValidator.cs` | 19 | 0 |

Remaining survivor:

- `PositionCalculator`: `q <= held` → `q < held`. Equivalent. When a trade closes the position to exactly zero, the mutant keeps the trade price as the average instead of the old one, but a zero position is omitted and the next trade starts fresh because `held` is 0, so no output changes.

### Frontend

```sh
cd frontend
npm install
npm run dev     # http://localhost:5173; proxies /trades and /positions to the backend on 5080
npm run dev:mock  # same, but serves /trades and /positions from an in-memory mock (frontend/mock/), no backend
npm run build
```

- **Layout.** `src/App.vue` is a CSS grid: toolbar row, blotter, positions panel beside it (stacked below 900px). The PrimeVue Aura preset uses a sky primary, and the AG Grid Quartz theme reads the same PrimeVue CSS variables (`src/theme.ts`). Dark mode is off.
- **Code map.** `src/api/` holds stateless fetch calls (ProblemDetails → `ApiError`). `src/stores/` holds the Pinia `trades` and `positions` stores; a successful create re-fetches both. `src/lib/` has pure helpers: formatting, search matching, and validation that mirrors the server. `src/components/` holds the views.
- **Search** matches symbol or side as a case-insensitive substring, through an AG Grid external filter.
- **Mutation score** (Stryker.js on `src/stores` and `src/api`, 2026-10-20): 91.80% (56 killed, 5 survived, 0 no coverage). Survivors: three stale-response guards in `src/stores/resource.ts` (`--latest` is equivalent; the error and loading guards are not asserted for an overlapping failure) and, in `src/api/http.ts`, the `ApiError` name and the `status` in the fallback problem body.

### API contract

- `docs/openapi.json`: the OpenAPI document exported from Swashbuckle. A backend test fails if it drifts from the running app; regenerate it with `UPDATE_OPENAPI=1 dotnet test backend`.
- `docs/examples/`: request, response and validation-error payloads. A backend test deserializes them into the DTOs.
- `frontend/src/api/types.ts`: TypeScript mirror of the contract.

### Tests

```sh
cd backend && dotnet test   # xUnit; fails below 80% line coverage (coverlet; Program.cs and Migrations excluded)
cd frontend && npm test     # Vitest; fails below 80% lines/branches/functions/statements
```

### Lint, format and hooks

```sh
cd frontend && npx biome check .                        # Biome: format + lint TS/JS/Vue/JSON
dotnet tool restore && dotnet csharpier check backend   # CSharpier (local tool in .config/dotnet-tools.json)
lefthook install                                        # once per clone (also run by `npm install` in frontend)
```

- **pre-commit** (lefthook): Biome and CSharpier fix staged files, the file-length check warns, then `dotnet test` runs if `backend/**` is staged and `npm test` if `frontend/**` is staged.
- **Claude Code** (`.claude/settings.json`): after every Edit/Write/MultiEdit, `scripts/claude-post-edit.sh` formats and lints the file and runs the file-length check. Lint errors exit 2 so the agent sees them.
- **pre-push** (lefthook): knip (unused files, exports and dependencies in `frontend/`, config `frontend/knip.jsonc`) and jscpd (duplication across `backend/` and `frontend/src`, fails above 3%, config `.jscpd.json`).
- `scripts/check-file-length.sh [files]` warns about files over 500 lines and never fails; with no arguments it checks every tracked file.
- Run the dev tools directly with `npm run lint`, `npm run knip` and `npm run dup` in `frontend/`.
- `scripts/with-dotnet.sh` puts `~/.dotnet` first on PATH for hooks, since git hooks don't read shell profiles.

### Mutation testing

On demand only, never on a hook. Thresholds: high 80, low 60, break 50.

```sh
scripts/mutation-backend.sh               # Stryker.NET on backend Features/** (local tool, `dotnet tool restore`)
scripts/mutation-backend.sh --since:main  # only mutants in files changed since main
cd frontend && npm run mutation           # Stryker.js on src/**/*.ts (no components), incremental
```

Both use cores − 1 for concurrency. Reports land in `backend/StrykerOutput/` and `frontend/reports/mutation/` (gitignored).

### End-to-end tests

## Assumptions and design decisions

## What's next
