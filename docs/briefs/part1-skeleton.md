# Part 1 brief: skeleton

You are the Part 1 agent. A coordinator session assigned this work through herdr. The user is away until tomorrow, so work autonomously: don't ask questions. When something is ambiguous, make the call and record it in your final report.

## Inputs

- `docs/superpowers/specs/2026-10-19-trade-blotter-design.md`: the approved design, which is authoritative.
- `prompt.md`: the user's original prompt. The design supersedes it: there is no users table, no client-supplied timestamps, no timezone setting, and no paste mode.

The design is already approved, so skip brainstorming and don't write a design doc. Use TDD for any logic you write.

## Environment

- The .NET 8 SDK lives in `~/.dotnet` (it's on PATH via `~/.zshenv`). Add a `global.json` pinning 8.0.x with `rollForward: latestFeature`.
- Node is v24.
- You are in a git worktree on branch `feat/skeleton`. Commit there. Don't push, and don't merge to `main`; the coordinator does both.

## Commits, in order

Each commit is one meaningful step with a short imperative message. End every commit message with:

```
Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
```

1. **CLAUDE.md + README skeleton.**
   - CLAUDE.md covers:
     - a requirements summary pointing to the design doc;
     - architecture rules: Controller → Feature, Pinia for state, `decimal` money, CSS grid layout;
     - commit rules;
     - a rule that unit coverage must stay at or above 80%;
     - the soft 500-line limit;
     - the rule "update README whenever configuration changes";
     - section ownership, so the backend and frontend agents edit only their own sections.
   - The README skeleton has headings for setup (backend, frontend, tests, mutation, e2e), assumptions and design decisions, and what's next.
2. **Project scaffold.**
   - `backend/`: solution, `src/TradeBlotter.Api`, and `tests/TradeBlotter.Api.Tests` (xUnit).
   - `frontend/`: Vite + Vue 3 + TS, with Pinia, PrimeVue, `ag-grid-community` and `ag-grid-vue3` installed, Vitest, and `@playwright/test` as a dev dependency.
   - Root `.gitignore`.
   - Coverage gates at 80%: a coverlet threshold for the backend, excluding `Program.cs` and migrations; Vitest thresholds for the frontend.
3. **Skills and MCP.**
   - Project `.mcp.json` with the AG Grid and PrimeVue MCP servers. Check each package exists (`npm view <pkg>`) before adding it. Don't substitute a lookalike; if one doesn't exist, leave it out and note it.
   - If AG Grid or PrimeVue publish official Claude Code skills, add them project-scoped.
4. **Mutation testing.** Configure it for speed, as the design describes.
   - Stryker.NET: a local dotnet tool and `stryker-config.json`.
   - Stryker.js: `stryker.config.mjs` with the vitest runner, `concurrency` set to `os.availableParallelism() - 1`, `incremental`, and `ignoreStatic`.
   - Add npm/dotnet scripts to run each one.
   - Run both once against whatever small logic exists and record the wall-clock time for each in your report.
5. **Hooks and linters.**
   - Biome (frontend) and CSharpier (local dotnet tool).
   - A `.claude/settings.json` PostToolUse hook on Edit|Write|MultiEdit. It runs a script in `scripts/` that formats and lints the touched file, then runs the file-length check. Lint errors exit 2.
   - `lefthook.yml` pre-commit hook:
     - Biome and CSharpier on staged files;
     - the file-length check;
     - backend tests only when `backend/**` is staged, and frontend tests only when `frontend/**` is staged.

     Run `lefthook install`.
6. **Developer tools.** Add knip, jscpd and the soft 500-line file-length script (it warns and never blocks), with knip and jscpd on pre-push.
7. **Skeleton endpoints and contract.**
   - `TradesController` (`POST /trades`, `GET /trades`, `GET /trades/{id}`) and `PositionsController` (`GET /positions`), calling feature-service stubs.
   - DTOs exactly as the design specifies, with the string enum converter and ProblemDetails.
   - Swashbuckle, with the OpenAPI document exported and committed to `docs/openapi.json`.
   - Example payloads.
   - Frontend `src/api/types.ts` mirroring the contract.
   - A Vite dev proxy to the backend: backend on port 5080, frontend on 5173.
8. **Data model and database.**
   - Trade entity with a `Sequence` column.
   - `AppDbContext` on SQLite, with a UTC `DateTime` value converter.
   - Initial EF migration.
   - Connection string overridable through config/env.
   - An integration test showing that a round-trip keeps the `Z` timestamp.

Update the README in every commit that changes configuration.

## Done means

- `dotnet build`, `dotnet test`, `npm run build`, `npm test`, `biome check` and `csharpier check` all pass.
- A test commit shows that the pre-commit hook fires.
- A test edit shows that the Claude hook fires.

Paste the actual command output in your report; don't just assert that things pass.

When you finish, reply with a report under 300 words:
- the commits made;
- the verification output summary;
- the Stryker timings;
- which MCP servers and skills were added or skipped, and why;
- every call you made that the design didn't settle.
