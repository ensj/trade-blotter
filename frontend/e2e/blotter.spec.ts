import { expect, test } from '@playwright/test'
import {
  addTrade,
  blotter,
  columnValues,
  entryDialog,
  expectPosition,
  fillTrade,
  openEntry,
  positionRow,
  positionsPanel,
} from './blotter'

// Runs in declaration order against one fresh database (workers: 1); each test uses its own symbols.

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('loads empty', async ({ page }) => {
  await expect(blotter(page)).toContainText('No trades yet')
  await expect(positionsPanel(page)).toContainText('No open positions')
})

test('a buy appears in the blotter, newest first, with its notional', async ({ page }) => {
  await addTrade(page, { symbol: 'aapl', side: 'Buy', quantity: 100, price: 187.25 })
  await expect.poll(() => columnValues(blotter(page), 'symbol')).toEqual(['AAPL'])
  await expect.poll(() => columnValues(blotter(page), 'notional')).toEqual(['18,725.00'])

  await addTrade(page, { symbol: 'MSFT', side: 'Buy', quantity: 10, price: 400 })
  await expect.poll(() => columnValues(blotter(page), 'symbol')).toEqual(['MSFT', 'AAPL'])
  await expect.poll(() => columnValues(blotter(page), 'side')).toEqual(['Buy', 'Buy'])
  await expect
    .poll(() => columnValues(blotter(page), 'notional'))
    .toEqual(['4,000.00', '18,725.00'])
})

test('positions update after a trade', async ({ page }) => {
  await expectPosition(page, 'AAPL', '100', '187.25')
  await addTrade(page, { symbol: 'AAPL', side: 'Buy', quantity: 100, price: 192.75 })
  await expectPosition(page, 'AAPL', '200', '190.00')
})

test('a sell reduces the position and keeps the average cost', async ({ page }) => {
  await addTrade(page, { symbol: 'TSLA', side: 'Buy', quantity: 100, price: 10 })
  await addTrade(page, { symbol: 'TSLA', side: 'Sell', quantity: 40, price: 50 })
  await expectPosition(page, 'TSLA', '60', '10.00')
})

test('an oversell flips the position short at the flip price', async ({ page }) => {
  await addTrade(page, { symbol: 'NFLX', side: 'Buy', quantity: 100, price: 10 })
  await addTrade(page, { symbol: 'NFLX', side: 'Sell', quantity: 150, price: 12 })
  await expectPosition(page, 'NFLX', '-50', '12.00')
  await expect(positionRow(page, 'NFLX').locator('[col-id="netQuantity"]')).toHaveClass(
    /short-position/,
  )
})

test('closing a position to zero removes it from the panel', async ({ page }) => {
  await addTrade(page, { symbol: 'AMD', side: 'Buy', quantity: 100, price: 10 })
  await expect(positionRow(page, 'AMD')).toHaveCount(1)
  await addTrade(page, { symbol: 'AMD', side: 'Sell', quantity: 100, price: 12 })
  await expect(positionRow(page, 'AMD')).toHaveCount(0)
  await expect.poll(() => columnValues(blotter(page), 'symbol')).toContain('AMD')
})

test('client-side validation errors show on the form', async ({ page }) => {
  const dialog = await openEntry(page)
  await dialog.getByRole('button', { name: 'Add trade' }).click()
  for (const message of [
    'Symbol is required',
    'Side is required',
    'Quantity is required',
    'Price is required',
  ]) {
    await expect(dialog.getByText(message)).toBeVisible()
  }

  await fillTrade(dialog, { symbol: 'BAD SYM', side: 'Buy', quantity: 0, price: 1.23456 })
  await dialog.getByRole('button', { name: 'Add trade' }).click()
  await expect(dialog.getByText("Use 1–10 letters, digits, '.' or '-'")).toBeVisible()
  await expect(dialog.getByText('Must be greater than 0')).toBeVisible()
  await expect(entryDialog(page)).toBeVisible()
})

test('search filters the rows by symbol or side', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search trades' })
  await search.fill('nflx')
  await expect.poll(() => columnValues(blotter(page), 'symbol')).toEqual(['NFLX', 'NFLX'])

  await search.fill('SELL')
  await expect
    .poll(async () => new Set(await columnValues(blotter(page), 'side')))
    .toEqual(new Set(['Sell']))

  await search.fill('')
  await expect.poll(async () => (await columnValues(blotter(page), 'symbol')).length).toBe(9)
})

test('sorting by a column works', async ({ page }) => {
  const header = blotter(page).getByRole('columnheader', { name: 'Symbol' })
  await header.click()
  await expect
    .poll(() => columnValues(blotter(page), 'symbol'))
    .toEqual(['AAPL', 'AAPL', 'AMD', 'AMD', 'MSFT', 'NFLX', 'NFLX', 'TSLA', 'TSLA'])
  await header.click()
  await expect
    .poll(() => columnValues(blotter(page), 'symbol'))
    .toEqual(['TSLA', 'TSLA', 'NFLX', 'NFLX', 'MSFT', 'AMD', 'AMD', 'AAPL', 'AAPL'])
})

test('Buy is green and Sell is red', async ({ page }) => {
  // The dominant RGB channel names the hue; slate body text is blue-dominant, so it fails both.
  const dominant = (selector: string) =>
    blotter(page)
      .locator(selector)
      .first()
      .evaluate((el) => {
        const [r = 0, g = 0, b = 0] = getComputedStyle(el).color.match(/\d+/g)?.map(Number) ?? []
        return g > r && g > b ? 'green' : r > g && r > b ? 'red' : 'other'
      })
  expect(await dominant('.side.buy')).toBe('green')
  expect(await dominant('.side.sell')).toBe('red')
})
