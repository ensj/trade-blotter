import type { ColDef } from 'ag-grid-community'
import type { Position } from '../api/types'
import { formatPrice, formatQuantity } from '../lib/format'

export const positionColumns: ColDef<Position>[] = [
  { field: 'symbol', headerName: 'Symbol', cellDataType: 'text', width: 90 },
  {
    field: 'netQuantity',
    headerName: 'Net Qty',
    type: 'rightAligned',
    flex: 1,
    minWidth: 80,
    valueFormatter: (p) => formatQuantity(p.value ?? 0),
    cellClassRules: { 'short-position': (p) => (p.value ?? 0) < 0 },
  },
  {
    field: 'averageCost',
    headerName: 'Avg Cost',
    type: 'rightAligned',
    flex: 1,
    minWidth: 80,
    resizable: false,
    valueFormatter: (p) => formatPrice(p.value ?? 0),
  },
]

export const positionDefaultColDef: ColDef<Position> = { sortable: true }
