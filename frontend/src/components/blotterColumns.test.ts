import type { ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community'
import { expect, test } from 'vitest'
import type { Trade } from '../api/types'
import { blotterColumns, defaultColDef } from './blotterColumns'
import SideCellRenderer from './SideCellRenderer.vue'

const trade: Trade = {
  id: '1',
  symbol: 'AAPL',
  side: 'Buy',
  quantity: 1500,
  price: 187.25,
  timestamp: '2026-10-19T14:03:11.123Z',
}

const column = (header: string): ColDef<Trade> => {
  const found = blotterColumns.find((c) => c.headerName === header)
  if (!found) throw new Error(`No column ${header}`)
  return found
}

const format = (header: string, value: unknown) => {
  const formatter = column(header).valueFormatter as (p: ValueFormatterParams<Trade>) => string
  return formatter({ value } as ValueFormatterParams<Trade>)
}

test('orders columns for a trader', () => {
  expect(blotterColumns.map((c) => c.headerName)).toEqual([
    'Time',
    'Symbol',
    'Side',
    'Qty',
    'Price',
    'Notional',
  ])
})

test('sorts newest first by default and every column is sortable', () => {
  expect(column('Time').sort).toBe('desc')
  expect(blotterColumns.filter((c) => c.sort)).toHaveLength(1)
  expect(defaultColDef.sortable).toBe(true)
})

test('right-aligns the numeric columns', () => {
  for (const header of ['Qty', 'Price', 'Notional']) {
    expect(column(header).type).toBe('rightAligned')
  }
})

test('computes notional from quantity and price', () => {
  const getter = column('Notional').valueGetter as (p: ValueGetterParams<Trade>) => unknown
  expect(getter({ data: trade } as ValueGetterParams<Trade>)).toBe(280875)
  expect(getter({ data: undefined } as ValueGetterParams<Trade>)).toBeNull()
})

test('formats numbers with thousands separators', () => {
  expect(format('Qty', 1500)).toBe((1500).toLocaleString())
  expect(format('Qty', 1500)).not.toBe('1500')
  expect(format('Price', 187.25)).toBe(
    (187.25).toLocaleString(undefined, { minimumFractionDigits: 2 }),
  )
  expect(format('Notional', 280875)).toBe(
    (280875).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  )
  expect(format('Notional', null)).toBe('')
})

test('formats the timestamp in local time and tolerates a missing value', () => {
  expect(format('Time', trade.timestamp)).toMatch(/2026/)
  expect(format('Time', undefined)).toBe('')
})

test('renders side with the custom renderer', () => {
  expect(column('Side').cellRenderer).toBe(SideCellRenderer)
})
