# Part 3 brief: integration, e2e and UI pass

`main` now contains the merged backend and frontend. Two agents run in parallel on top of it, each on its own branch cut from `main`. The user is away, so work autonomously: don't ask questions, make calls yourself, and record them in your report. Don't push and don't merge.

## Agent A: frontend and e2e (branch `feat/e2e`)

1. **Switch PrimeVue 5 to PrimeVue 4 (MIT).** PrimeVue 5 shows an "Invalid PrimeUI License" badge without a paid or registered key. Use the PrimeVue 4 package versions and `@primevue/themes` Aura. Remove the `VITE_PRIMEUI_LICENSE` plumbing and anything else that is license-related. Check that the badge is gone.
2. **Playwright e2e against the real stack.**
   - Put it in `frontend/e2e/`.
   - `playwright.config.ts` starts both servers through `webServer`: the backend on 5080 with a throwaway SQLite file passed through the connection-string env var, and Vite on 5173 using the proxy, not the mock.
   - Flows to cover:
     - the app loads empty;
     - a buy is added and appears in the blotter, newest first, with the right notional;
     - positions update;
     - a sell reduces the position, and the average cost stays the same;
     - an oversell flips the position short, and the average cost becomes the flip price;
     - closing a position to zero removes it from the panel;
     - client-side validation errors show on the form;
     - search filters the rows;
     - sorting by a column works;
     - Buy and Sell use different colours.
   - Add an `npm run e2e` script.
3. **Screenshots of the whole flow** go to `docs/screenshots/e2e-*.png`: empty state, modal open, modal with validation errors, after several trades, a short position, and search active. Take them at a 1440×900 viewport, plus one at 1024 wide.
4. **UI review against the screenshots.** Fix what fails these checks, one commit per fix:
   - Is the spacing even?
   - Is the column order sensible for a trader?
   - Are buttons spaced well?
   - Do inputs sit in a sensible grid, neither cramped nor far apart?
   - Are labels small and above their inputs?
   - Is the blotter neither too big nor too small? (A mostly empty grid area on first load is fine, but consider a proper empty-state overlay.)
   - Is the palette soft and consistent between PrimeVue and AG Grid?
   - Is there an empty state for positions?

   After the fixes, re-take the screenshots.
5. **README.** Add an e2e section to the setup docs.

## Agent B: backend polish (branch `feat/backend-polish`)

1. **Unknown side.** A 400 for an unknown side currently leaks a .NET type name and adds an extra `request` error. Return a clean ValidationProblemDetails with a single `side` error: "Side must be Buy or Sell." Also tidy the messages for other JSON binding errors. Write the tests first.
2. **Mutation script.** `scripts/mutation-backend.sh` fails unless .NET 8 is first on PATH. Make it source the same PATH fix that `scripts/with-dotnet.sh` uses.
3. **Code and folder review.** Check the backend against the UI → Controller → Feature boundaries:
   - controllers contain only HTTP concerns;
   - features own the logic and the EF access;
   - no dead code;
   - folder names are intuitive.

   Fix what you find. Don't change the API contract.

Both agents keep the toolchain green: tests, coverage at or above 80%, Biome, CSharpier, knip and jscpd. Each ends with a report under 300 words.
