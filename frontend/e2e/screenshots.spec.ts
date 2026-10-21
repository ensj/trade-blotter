import { fileURLToPath } from 'node:url'
import { expect, type Page, test } from '@playwright/test'
import { addTrade, blotter, columnValues, openEntry } from './blotter'

// Walks the whole flow on a fresh database and writes docs/screenshots/e2e-*.png.
// Run with `npm run e2e:screenshots`; the regular suite skips this file.

const shot = (page: Page, name: string) =>
  page.screenshot({
    path: fileURLToPath(new URL(`../../docs/screenshots/e2e-${name}.png`, import.meta.url)),
  })

const noToasts = (page: Page) => expect(page.locator('.p-toast-message')).toHaveCount(0)

test('screenshot the flow', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/')
  await expect(blotter(page)).toContainText('No trades yet')
  await shot(page, 'empty')

  const dialog = await openEntry(page)
  await shot(page, 'modal')
  await dialog.getByRole('button', { name: 'Add trade' }).click()
  await expect(dialog.getByText('Symbol is required')).toBeVisible()
  await shot(page, 'validation')
  await dialog.getByRole('button', { name: 'Cancel' }).click()

  for (const trade of [
    { symbol: 'AAPL', side: 'Buy', quantity: 100, price: 187.25 },
    { symbol: 'MSFT', side: 'Buy', quantity: 50, price: 412.1 },
    { symbol: 'TSLA', side: 'Buy', quantity: 40, price: 248.5 },
    { symbol: 'AAPL', side: 'Buy', quantity: 100, price: 190.75 },
    { symbol: 'BRK.B', side: 'Buy', quantity: 12.5, price: 455.2 },
    { symbol: 'MSFT', side: 'Sell', quantity: 20, price: 415 },
  ] as const) {
    await addTrade(page, trade)
  }
  await expect.poll(async () => (await columnValues(blotter(page), 'symbol')).length).toBe(6)
  await noToasts(page)
  await shot(page, 'trades')

  await addTrade(page, { symbol: 'TSLA', side: 'Sell', quantity: 100, price: 251.3 })
  await noToasts(page)
  await shot(page, 'short')

  await page.getByRole('searchbox', { name: 'Search trades' }).fill('aapl')
  await expect.poll(() => columnValues(blotter(page), 'symbol')).toEqual(['AAPL', 'AAPL'])
  await shot(page, 'search')

  await page.setViewportSize({ width: 1024, height: 768 })
  await page.getByRole('searchbox', { name: 'Search trades' }).fill('')
  await expect.poll(async () => (await columnValues(blotter(page), 'symbol')).length).toBe(7)
  await shot(page, 'trades-1024')
})
