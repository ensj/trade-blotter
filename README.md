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

### Frontend

```sh
cd frontend
npm install
npm run dev     # http://localhost:5173; proxies /trades and /positions to the backend on 5080
npm run dev:mock  # same, but serves /trades and /positions from an in-memory mock (frontend/mock/), no backend
npm run build
```

- **PrimeUI license.** PrimeVue 5 shows an "Invalid PrimeUI License" badge and logs a console warning without a license key. Get a key (free Community or commercial) from [primeui.dev](https://primeui.dev/licenses) and set `VITE_PRIMEUI_LICENSE` in the environment or in `frontend/.env.local` (gitignored).

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
