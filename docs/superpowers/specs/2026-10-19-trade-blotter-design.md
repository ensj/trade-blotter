# Trade Blotter — Design

## Intent

A take-home exercise: a trade blotter where a user enters trades, sees them in a live table, and sees positions derived from trade history. Graded on domain modeling, API design, Vue patterns, UI judgment, tests, and repo quality. "Quality over completeness." The exercise also requires building with Claude Code and committing the full transcript.

The build is also a demonstration of parallel agent work: a coordinator (this session) drives three herdr agent sessions: one for Part 1 on `main`, then two for Part 2 in worktrees.

## Requirements (restated from the exercise)

- Backend: C# / .NET 8 REST API. `POST /trades`, `GET /trades` (newest first), `GET /positions` (net qty, avg cost per symbol). Positions derived, never stored. Zero net position omitted. SQLite.
- Frontend: Vue 3 Composition API, Pinia for state, Vite. Trade entry form (symbol, side, quantity, price; no empty fields; quantity and price positive). Blotter updates without page reload. Columns: timestamp, symbol, side, quantity, price, notional. Sortable. Side visually distinct. Positions panel updates reactively on submit.
- Tests: at least position calculation. README with setup, assumptions, and what's next. Clear commit history. Public GitHub repo. Full transcript included.

## Goals

- Correct average-cost position logic, proven by unit tests and mutation testing.
- A clean, small API contract with proper status codes and ProblemDetails errors.
- A scannable, pleasant single-page blotter.
- Guardrails that keep agent output tidy: lint on every edit, tests and lint on every commit, 80% unit coverage, soft 500-line file limit, duplication and dead-code checks.

## Non-goals

- Authentication, users, per-user settings.
- Server-side pagination, sorting, or filtering. All trades are returned; the grid sorts and filters client-side. (Pagination raises consistency questions between fetches once sorting and filtering exist.)
- Bulk/paste trade entry.
- Real-time push (SSE/WebSockets). "Live" means the grid refreshes after the user's own submissions.
- Market data, P&L, realized gains.
- Client-supplied timestamps or timezone handling on the server.

## Anti-goals

- Floating-point money. Quantity and price are `decimal` end to end on the server.
- Business logic in controllers, or state scattered across components instead of Pinia.
- Enterprise-only AG Grid features.

## Decisions

### Domain

**Trade**

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | Server-generated |
| `Sequence` | `long` | Autoincrement; internal tiebreak for equal timestamps (Guids don't preserve insertion order). Not in the API. |
| `Symbol` | `string` | Trimmed, upper-cased. 1–10 chars, `^[A-Z0-9.\-]+$` |
| `Side` | `enum Side { Buy, Sell }` | Serialized as `"Buy"` / `"Sell"`. A short is just a negative net position; no short-sell or cover types. |
| `Quantity` | `decimal` | > 0, ≤ 1,000,000,000, at most 4 decimal places (fractional shares allowed) |
| `Price` | `decimal` | > 0, ≤ 1,000,000,000, at most 4 decimal places |
| `Timestamp` | `DateTime` (UTC) | Set by the server at insert (`DateTime.UtcNow` via an injected `TimeProvider` for testability). Never accepted from the client. |

No `User` entity, no `UserId`.

**Position** (computed, not persisted)

| Field | Type |
|---|---|
| `Symbol` | `string` |
| `NetQuantity` | `decimal` (negative = short) |
| `AverageCost` | `decimal` |

Computed internally with a dictionary keyed by symbol; returned as an array sorted by symbol. Positions whose net quantity is exactly `0` are omitted (exact because of `decimal`; no epsilon).

**Average-cost rule.** Process each symbol's trades in timestamp order (ties broken by `Sequence`). Let signed quantity be `+q` for Buy, `-q` for Sell.

- Trade increases the absolute position (same direction, or from flat): `avg = (|net| * avg + q * price) / (|net| + q)`.
- Trade reduces the position without crossing zero: `avg` unchanged.
- Trade closes exactly to zero: position removed; next trade starts fresh.
- Trade crosses zero (flip): `avg = price` of that trade; new net is the remainder.

Worked examples that must be unit tests:

| Trades | Net | Avg |
|---|---|---|
| Buy 100 @ 10, Buy 100 @ 20 | 200 | 15 |
| Buy 100 @ 10, Sell 40 @ 50 | 60 | 10 |
| Buy 100 @ 10, Sell 100 @ 12 | omitted | — |
| Buy 100 @ 10, Sell 150 @ 12 | -50 | 12 |
| Sell 50 @ 20, Sell 50 @ 10 | -100 | 15 |
| Sell 100 @ 20, Buy 30 @ 5 | -70 | 20 |
| Buy 100 @ 10, Sell 100 @ 12, Buy 10 @ 30 | 10 | 30 |

The calculator works unrounded; the API rounds `AverageCost` to 6 decimal places (midpoint away from zero) so values survive JavaScript's `number` parsing. Money is sent as JSON numbers, not strings. The frontend formats for display. (My call.)

### API contract

All JSON, camelCase. Errors use RFC 7807 ProblemDetails.

`POST /trades`

```json
{ "symbol": "AAPL", "side": "Buy", "quantity": 100, "price": 187.25 }
```

- `201 Created`, `Location: /trades/{id}`, body = the created trade.
- `400` ValidationProblemDetails for missing/invalid fields, unknown side, malformed JSON.
- `415` for non-JSON content type (framework default).

`GET /trades` → `200`, array of trades, newest first (`Timestamp` desc, then `Sequence` desc):

```json
[{ "id": "…", "symbol": "AAPL", "side": "Buy", "quantity": 100, "price": 187.25, "timestamp": "2026-10-19T14:03:11.123Z" }]
```

`GET /positions` → `200`, array sorted by symbol:

```json
[{ "symbol": "AAPL", "netQuantity": 100, "averageCost": 187.25 }]
```

Unhandled exceptions → `500` ProblemDetails, no stack trace outside Development. `GET /trades/{id}` is not required; `Location` still points there (my call: implement it as a trivial endpoint so the header is honest).

Timestamps always serialize with a `Z` suffix. SQLite loses `DateTimeKind`, so the EF model needs a value converter that marks reads as UTC.

Notional (`quantity * price`) is computed in the frontend, not sent by the API.

Part 1 commits this contract as DTOs plus an OpenAPI document (Swashbuckle, exported to `docs/openapi.json`) and example payloads, so the frontend agent can build against a mock without waiting on the backend.

### Backend architecture

UI → Controller → Feature (business logic + data access).

```
backend/
  TradeBlotter.sln
  src/TradeBlotter.Api/
    Controllers/        TradesController, PositionsController — HTTP only
    Features/Trades/    trade service, request/response DTOs, validation
    Features/Positions/ PositionCalculator (pure function), positions service
    Data/               AppDbContext, entity config, migrations
    Program.cs
  tests/TradeBlotter.Api.Tests/   xUnit; unit + WebApplicationFactory integration tests
```

- EF Core 8 with SQLite, migrations committed. DB file `backend/src/TradeBlotter.Api/trade-blotter.db`, gitignored; connection string overridable via config/env (e2e uses a throwaway file).
- SQLite stores `decimal` as TEXT and can't order or sum it in SQL. That's fine: positions are computed in memory. Order trades by `Timestamp` (ISO text sorts correctly).
- `PositionCalculator` is a pure static function over a list of trades; it is the main mutation-testing target.

### Frontend architecture

```
frontend/
  src/
    api/            fetch wrapper + trades/positions calls (no state)
    stores/         Pinia: trades, positions
    components/     Toolbar, BlotterGrid, SideCellRenderer, PositionsPanel, TradeEntryModal, TradeForm
    App.vue, main.ts
  e2e/              Playwright (Part 3)
```

- Vue 3 `<script setup>` + TypeScript, Vite, Pinia, PrimeVue (one theme preset, soft palette), AG Grid Community (`ag-grid-vue3`).
- Layout uses CSS `display: grid` throughout: toolbar row on top, blotter in the main area, positions panel beside it.
- Toolbar: search box (drives an AG Grid external filter via `isExternalFilterPresent` / `doesExternalFilterPass`) and a "+" button that opens the trade entry modal.
- Blotter columns default to newest first, all sortable. Side uses a custom cell renderer: green Buy, red Sell. Timestamps are converted from UTC to the browser's local timezone with `Intl.DateTimeFormat`.
- Trade entry modal (PrimeVue Dialog) holds a single form: symbol, side, quantity, price. Small labels above inputs. Client-side validation mirrors the server's. Paste/bulk entry was considered and dropped (AG Grid's multi-cell paste is Enterprise-only).
- Search box matches symbol and side, case-insensitive substring. (My call.)
- After any successful POST  the trades and positions stores both re-fetch everything from the server. No optimistic insert, no `since` parameter.
- Errors surface via PrimeVue Toast.
- Dev server proxies `/trades` and `/positions` to the backend (no CORS config needed).
- No timezone setting, no seed data.

### Tooling and guardrails

| Concern | Tool |
|---|---|
| C# format/lint | CSharpier |
| JS/TS/Vue format/lint | Biome |
| Unit tests | xUnit (backend), Vitest (frontend) |
| Coverage ≥ 80% lines, enforced | coverlet threshold (backend), Vitest coverage thresholds (frontend) |
| Mutation testing | Stryker.NET (backend `Features/**`), Stryker.js (frontend `src/stores`, `src/api`, pure helpers) |
| Dead code / unused deps | knip |
| Duplication | jscpd (both trees) |
| File length | custom script: warn above 500 lines (soft; never blocks) |
| Git hooks | lefthook |

**Claude Code hooks** (`.claude/settings.json`): PostToolUse on Edit/Write/MultiEdit runs a script that formats and lints the touched file (Biome for `.ts/.js/.vue/.json`, CSharpier for `.cs`), then runs the file-length check. Lint errors exit 2 so the agent sees them.

**Pre-commit** (lefthook): Biome and CSharpier on staged files, file-length check, then tests only for the side that changed (backend tests if `backend/**` is staged, frontend tests if `frontend/**`). knip and jscpd run on pre-push, not pre-commit, to keep commits fast.

**Mutation testing is never on a hook.** Run on demand via scripts. Configure for speed:

- Stryker.js: `stryker.config.mjs` with `testRunner: "vitest"`, `concurrency: os.availableParallelism() - 1`, `incremental: true` (incremental file gitignored), `ignoreStatic: true`, `mutate` restricted to logic files (exclude `.vue`, components, `main.ts`), no TypeScript checker. The vitest runner uses per-test coverage automatically.
- Stryker.NET: `stryker-config.json` with `concurrency` set to cores − 1, `mutate` restricted to `Features/**`, `coverage-analysis: perTest`, `since` mode available for incremental runs. Installed as a local dotnet tool (`.config/dotnet-tools.json`).
- Thresholds: high 80, low 60, break 50 for both.

**MCP servers and skills** (`.mcp.json`, project-scoped): AG Grid, PrimeVue, Playwright. Verify package names at install time; drop any that don't exist rather than substituting a lookalike.

### Repo files

- `CLAUDE.md`: requirements summary, architecture rules (Controller → Feature, Pinia for state, `decimal` money, grid layout), commit rules (one meaningful change per commit, short imperative message), coverage rule, "update README whenever configuration changes", per-part section ownership.
- `README.md`: setup (backend, frontend, tests, mutation, e2e), assumptions and design decisions, what's next. Skeleton in Part 1; each agent adds to its own section only.
- `prompt.md`: the coordinator prompt, committed as-is.
- `transcripts/`: every session's Claude Code `.jsonl` transcript, copied at the end, named by part. Scanned for secrets and absolute home paths before commit.
- `.gitignore`: `bin/`, `obj/`, `node_modules/`, `*.db`, Stryker output and incremental files, Playwright reports.

## Execution plan (coordination)

Repo: `ensj/trade-blotter`, public. `main` is the integration branch.

**Part 1 — skeleton (1 agent, on `main`).** Roughly one commit per bullet in `prompt.md`'s Part 1. A scaffold commit (empty .NET solution + test project, Vite app) goes right after CLAUDE.md so later configs have something to point at. Order: CLAUDE.md + README skeleton; project scaffold; skills/MCP; mutation testing config; hooks + linters; dev tools (knip, jscpd, file length); skeleton endpoints + DTOs + OpenAPI; data model + SQLite + EF migration. Skeleton endpoints return `501` or empty arrays. Coverage gates apply from the first commit with tests. Exit criteria: both projects build, hooks fire, pre-commit passes, OpenAPI committed.

**Part 2 — parallel (2 agents, 2 worktrees).** Branches `feat/backend` and `feat/frontend` off Part 1's `main`. Each agent touches only its own tree plus its own README/CLAUDE.md section.

- Backend: implement endpoints via features; position calculator with the worked-example tests; mutation testing on features; error handling and status codes.
- Frontend: grid layout; AG Grid blotter with side renderer and external filter; Pinia stores + API module; toolbar and trade entry modal; positions panel; PrimeVue theme. Builds against a mock of the committed contract.

**Part 3 — integrate and verify (coordinator + subagents, no extra herdr session).** Merge both branches into `main`. Playwright e2e against the real backend on a fresh DB, with screenshots of the full flow. A UI review pass on the screenshots (spacing, column order for a trader, label placement, grid sizing, consistent soft theme). A structure review (folders, Controller → Feature boundaries). Coverage subagents check every requirement in the exercise and `prompt.md` against the result. Copy transcripts, finish README, push.

## Prerequisite

.NET 8 SDK is not installed (only 6.0.401). Install it before Part 1.

## Left to the builder

- Exact AG Grid / PrimeVue theme values, within "soft hue, consistent".
- Column widths and default column order (Part 3 reviews it).
- Test file organization within each test project.
- Exact jscpd threshold and knip config.
