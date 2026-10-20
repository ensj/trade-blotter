# Part 2 brief: frontend

You are the frontend agent, and you work in parallel with a backend agent. The backend does not exist yet, so build against mocks of the committed contract (`docs/openapi.json`, `frontend/src/api/types.ts`). The user is away, so work autonomously: don't ask questions, make calls yourself, and record them in your report.

## Inputs

- The design doc: `docs/superpowers/specs/2026-10-19-trade-blotter-design.md`.
- `CLAUDE.md`.
- `prompt.md`'s frontend section, minus the parts the design removed: no timezone setting, no paste mode.

## Scope

Touch only `frontend/`, plus the frontend sections of `README.md` and `CLAUDE.md`. Commit on your branch. Don't push and don't merge.

## Commits

1. **Layout shell.**
   - `App.vue` uses `display: grid`: a toolbar row, the blotter in the main area, and the positions panel beside it. Use grid for layout everywhere.
   - Set up PrimeVue with one soft, consistent theme preset, and match the AG Grid theme (Quartz with params) to it.
2. **API module and Pinia stores.**
   - `src/api/`: a fetch wrapper that maps ProblemDetails to errors, plus `getTrades`, `getPositions` and `createTrade`.
   - `src/stores/`: `trades` and `positions` stores with loading and error state.
   - After a successful create, re-fetch both stores.
   - Unit-test the stores and the API module with mocked fetch.
3. **Blotter grid.**
   - AG Grid Community.
   - Columns in an order that suits a trader: Time, Symbol, Side, Qty, Price, Notional.
   - Notional is computed by a `valueGetter`.
   - Default sort is newest first, and every column is sortable.
   - Timestamps show in the browser's local timezone using `Intl.DateTimeFormat`.
   - Numbers are right-aligned with thousands separators.
   - `SideCellRenderer`: green Buy, red Sell.
4. **Toolbar search.** Wire the search box to an AG Grid external filter (`isExternalFilterPresent` / `doesExternalFilterPass`), matching symbol and side as a case-insensitive substring.
5. **Trade entry modal.**
   - The "+" button opens a PrimeVue Dialog containing a single form: symbol, side, quantity and price.
   - Labels are small, above each input. Fields sit in a sensible grid.
   - Validation mirrors the server's rules: symbol is 1–10 characters from `[A-Za-z0-9.-]`; quantity and price are > 0, ≤ 1e9, with at most 4 decimal places.
   - Server ProblemDetails errors map back onto the matching fields.
   - On success, close the dialog and show a toast.
6. **Positions panel.** A compact AG Grid or table with Symbol, Net Qty (negative styled as short) and Avg Cost. It updates reactively from the store.

Keep the toolchain green: run Biome on what you touch, keep coverage at or above 80%, and keep files under 500 lines. Run Stryker.js on `src/stores` and `src/api` once at the end and record the score in the README.

## Done means

`npm run build`, `npm test` (with coverage) and `biome check` pass. Then run the dev server against a mock (Vite middleware, MSW, or similar; your call, but dev-only) and take a Playwright screenshot of the page and of the open modal. Save the screenshots to `docs/screenshots/part2-*.png`.

Reply with a report under 300 words: the commits, coverage, the Stryker score, the screenshot paths, and the calls you made.
