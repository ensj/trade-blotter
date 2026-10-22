# Trade Blotter

A single-page trade blotter: enter trades, see them in a sortable grid, see positions derived from trade history.

The approved design is authoritative: `docs/superpowers/specs/2026-10-19-trade-blotter-design.md`. Read it before changing behavior. `prompt.md` is the original prompt; where it differs, the design wins (no users, no client timestamps, no timezone setting, no paste mode).

- AG Grid Community only; no Enterprise features.

## Quality rules

- Unit test coverage must stay at or above 80% lines (enforced by coverlet and Vitest thresholds).
- Mutation testing runs on demand (`npm run mutation` in `frontend/`, `scripts/mutation-backend.sh` for the backend). Use the script, not bare `dotnet stryker`: it sets concurrency to cores − 1 and puts .NET 8 on PATH.
- Update `README.md` whenever configuration changes (tooling, scripts, ports, env vars, dependencies).

## Commit rules

- One meaningful change per commit.
- Short imperative subject line (e.g. "Add position calculator").
- Pre-commit runs formatters, linters, the file-length check, and tests for the side that changed. Don't bypass it with `--no-verify`.