import { expect, type Locator, type Page } from '@playwright/test'

export interface TradeInput {
  symbol: string
  side: 'Buy' | 'Sell'
  quantity: number
  price: number
}

export const blotter = (page: Page) => page.getByRole('main', { name: 'Trades' })
export const positionsPanel = (page: Page) => page.getByRole('complementary', { name: 'Positions' })
export const entryDialog = (page: Page) => page.getByRole('dialog', { name: 'New trade' })

export async function openEntry(page: Page) {
  await page.getByRole('button', { name: 'New trade' }).click()
  await expect(entryDialog(page)).toBeVisible()
  return entryDialog(page)
}

// InputNumber formats as you type, so type key by key rather than fill.
export async function fillTrade(dialog: Locator, trade: Partial<TradeInput>) {
  if (trade.symbol !== undefined) await dialog.getByLabel('Symbol').fill(trade.symbol)
  if (trade.side) await dialog.getByRole('button', { name: trade.side, exact: true }).click()
  if (trade.quantity !== undefined) {
    await dialog.getByLabel('Quantity').pressSequentially(String(trade.quantity))
  }
  if (trade.price !== undefined) {
    await dialog.getByLabel('Price').pressSequentially(String(trade.price))
  }
}

export async function addTrade(page: Page, trade: TradeInput) {
  const dialog = await openEntry(page)
  await fillTrade(dialog, trade)
  await dialog.getByRole('button', { name: 'Add trade' }).click()
  await expect(dialog).toBeHidden()
}

// Cell text of one column, in displayed row order. Rows animating out are skipped.
export function columnValues(grid: Locator, colId: string): Promise<string[]> {
  return grid.locator('.ag-row:not(.ag-opacity-zero)').evaluateAll(
    (rows, id) =>
      rows
        .map((row) => ({
          index: Number(row.getAttribute('aria-rowindex')),
          text: row.querySelector(`[col-id="${id}"]`)?.textContent?.trim() ?? '',
        }))
        .sort((a, b) => a.index - b.index)
        .map((r) => r.text),
    colId,
  )
}

export function positionRow(page: Page, symbol: string): Locator {
  return positionsPanel(page)
    .locator('.ag-row')
    .filter({ has: page.locator('[col-id="symbol"]', { hasText: new RegExp(`^${symbol}$`) }) })
}

export async function expectPosition(page: Page, symbol: string, netQty: string, avgCost: string) {
  const row = positionRow(page, symbol)
  await expect(row.locator('[col-id="netQuantity"]')).toHaveText(netQty)
  await expect(row.locator('[col-id="averageCost"]')).toHaveText(avgCost)
}
