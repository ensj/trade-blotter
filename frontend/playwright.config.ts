import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// A fresh SQLite file per run, so every run starts from an empty blotter.
const database = join(tmpdir(), `trade-blotter-e2e-${Date.now()}.db`)
const screenshots = process.env.E2E_SCREENSHOTS === '1'
// Override to run alongside a dev server on the default ports.
const apiPort = process.env.E2E_API_PORT ?? '5080'
const webPort = process.env.E2E_WEB_PORT ?? '5173'
// Playwright empties outputDir on every run, so a rerun would delete the last failure's trace.
// Set once here; workers inherit it and resolve the same directory.
process.env.E2E_RUN_ID ??= new Date().toISOString().replace(/[:.]/g, '-')

export default defineConfig({
  testDir: 'e2e',
  testMatch: screenshots ? 'screenshots.spec.ts' : 'blotter.spec.ts',
  outputDir: `test-results/${process.env.E2E_RUN_ID}`,
  // The tests share one backend database and build on each other's trades.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${webPort}`,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `../scripts/with-dotnet.sh dotnet run --project ../backend/src/TradeBlotter.Api --no-launch-profile --urls http://localhost:${apiPort}`,
      url: `http://localhost:${apiPort}/positions`,
      env: {
        ConnectionStrings__TradeBlotter: `Data Source=${database}`,
        ASPNETCORE_ENVIRONMENT: 'Development',
      },
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: `npx vite --port ${webPort} --strictPort`,
      url: `http://localhost:${webPort}`,
      env: { MOCK_API: '0', API_PORT: apiPort },
      reuseExistingServer: false,
    },
  ],
})
