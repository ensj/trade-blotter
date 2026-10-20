# Part 2 brief: backend

You are the backend agent, and you work in parallel with a frontend agent. The user is away, so work autonomously: don't ask questions, make calls yourself, and record them in your report.

## Inputs

- The design doc: `docs/superpowers/specs/2026-10-19-trade-blotter-design.md`.
- `CLAUDE.md`.
- The committed contract: `docs/openapi.json` and the DTOs. **Don't change the contract.** If you find it is wrong, stop and report back instead of editing it.

## Scope

Touch only `backend/`, plus the backend sections of `README.md` and `CLAUDE.md`. Commit on your branch. Don't push and don't merge.

## Commits

1. **Trades feature.**
   - `Features/Trades` holds the service and validation.
   - Symbol: trim, upper-case, 1–10 characters, `^[A-Z0-9.\-]+$`.
   - Quantity and price: > 0, ≤ 1e9, at most 4 decimal places.
   - Timestamps come from an injected `TimeProvider`.
   - Wire `TradesController` to the service: `POST` returns 201 with a `Location` header and the trade; `GET` returns trades newest first, ordered by `Timestamp` desc then `Sequence` desc; `GET /trades/{id}` returns 200 or 404.
   - Write the tests first: unit tests plus `WebApplicationFactory` integration tests against a temp SQLite file.
2. **Positions feature.**
   - `Features/Positions/PositionCalculator` is a pure function implementing the design's average-cost rule.
   - Every worked example in the design is a test, plus edge cases: a symbol with only sells, multiple symbols, timestamp ties ordered by `Sequence`, and fractional quantities.
   - The API rounds `averageCost` to 6 decimal places, midpoint away from zero.
   - Zero net positions are omitted. Positions are sorted by symbol.
   - Wire up `PositionsController`.
3. **Mutation testing.**
   - Run Stryker.NET on `Features/**` and kill surviving mutants by adding tests until the mutation score is at least 80%. Positions should be close to 100%.
   - Record the final score and the remaining survivors, with a reason for each, in the README.
4. **Error handling.**
   - ProblemDetails everywhere.
   - `400` ValidationProblemDetails for invalid fields, unknown side and malformed JSON. `415` for non-JSON. `404` for an unknown id. `500` ProblemDetails with no stack trace outside Development.
   - Write an integration test for each status code.

## Done means

`dotnet test` passes with coverage at least 80%, `csharpier check` is clean, and the Stryker score is recorded.

Then start the API, run curl against each endpoint and status code, and paste the output in your report (under 300 words). The report also covers the commits, coverage, the mutation score, and the calls you made.
