import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// A fresh SQLite file per run, so every run starts from an empty blotter.
const database = join(tmpdir(), `trade-blotter-e2e-${Date.now()}.db`)
const screenshots = process.env.E2E_SCREENSHOTS === '1'

export default defineConfig({
  testDir: 'e2e',
  testMatch: screenshots ? 'screenshots.spec.ts' : 'blotter.spec.ts',
  // The tests share one backend database and build on each other's trades.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        '../scripts/with-dotnet.sh dotnet run --project ../backend/src/TradeBlotter.Api --no-launch-profile --urls http://localhost:5080',
      url: 'http://localhost:5080/positions',
      env: {
        ConnectionStrings__TradeBlotter: `Data Source=${database}`,
        ASPNETCORE_ENVIRONMENT: 'Development',
      },
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: 'npx vite --port 5173 --strictPort',
      url: 'http://localhost:5173',
      env: { MOCK_API: '0' },
      reuseExistingServer: false,
    },
  ],
})
