import type { CellClassParams, ColDef, ValueFormatterParams } from 'ag-grid-community'
import { expect, test } from 'vitest'
import type { Position } from '../api/types'
import { positionColumns, positionDefaultColDef } from './positionColumns'

const column = (field: keyof Position): ColDef<Position> => {
  const found = positionColumns.find((c) => c.field === field)
  if (!found) throw new Error(`No column ${field}`)
  return found
}
const netQuantity = column('netQuantity')
const averageCost = column('averageCost')

test('shows symbol, net quantity and average cost', () => {
  expect(positionColumns.map((c) => c.headerName)).toEqual(['Symbol', 'Net Qty', 'Avg Cost'])
  expect(column('symbol').cellDataType).toBe('text')
})

test('fixes the symbol width and lets the numbers share the rest', () => {
  expect(positionColumns.map((c) => [c.field, c.width, c.flex])).toEqual([
    ['symbol', 90, undefined],
    ['netQuantity', undefined, 1],
    ['averageCost', undefined, 1],
  ])
  expect(positionDefaultColDef.flex).toBeUndefined()
})

test('only the last column hides its resize handle', () => {
  expect(positionColumns.map((c) => c.resizable)).toEqual([undefined, undefined, false])
})

test('flags negative net quantity as short', () => {
  const rule = (netQuantity.cellClassRules as Record<string, (p: CellClassParams) => boolean>)[
    'short-position'
  ]
  expect(rule?.({ value: -50 } as CellClassParams)).toBe(true)
  expect(rule?.({ value: 50 } as CellClassParams)).toBe(false)
  expect(rule?.({ value: undefined } as CellClassParams)).toBe(false)
})

test('formats quantities and prices', () => {
  const fmt = (col: ColDef<Position>, value: unknown) =>
    (col.valueFormatter as (p: ValueFormatterParams<Position>) => string)({
      value,
    } as ValueFormatterParams<Position>)
  expect(fmt(netQuantity, -1500)).toBe((-1500).toLocaleString())
  expect(fmt(netQuantity, undefined)).toBe('0')
  expect(fmt(averageCost, 15)).toBe((15).toLocaleString(undefined, { minimumFractionDigits: 2 }))
  expect(fmt(averageCost, undefined)).toBe(
    (0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
  )
})
