# Trade Blotter

A trade blotter: enter trades, see them in a live grid, and see positions derived from trade history. .NET 8 API + Vue 3 frontend.

Design: [`docs/superpowers/specs/2026-10-19-trade-blotter-design.md`](docs/superpowers/specs/2026-10-19-trade-blotter-design.md).

## Setup

### Prerequisites

- .NET 8 SDK. `global.json` pins `8.0.x` with `rollForward: latestFeature`. If `dotnet` resolves to another SDK, put the right one first: `export DOTNET_ROOT=$HOME/.dotnet PATH=$HOME/.dotnet:$PATH`.
- Node 24.

### Backend

```sh
cd backend
dotnet run --project src/TradeBlotter.Api   # http://localhost:5080, Swagger at /swagger
```

### Frontend

```sh
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build
```

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
