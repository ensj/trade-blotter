import type { ColDef } from 'ag-grid-community'
import type { Position } from '../api/types'
import { formatPrice, formatQuantity } from '../lib/format'

export const positionColumns: ColDef<Position>[] = [
  { field: 'symbol', headerName: 'Symbol', cellDataType: 'text', minWidth: 80 },
  {
    field: 'netQuantity',
    headerName: 'Net Qty',
    type: 'rightAligned',
    valueFormatter: (p) => formatQuantity(p.value ?? 0),
    cellClassRules: { 'short-position': (p) => (p.value ?? 0) < 0 },
  },
  {
    field: 'averageCost',
    headerName: 'Avg Cost',
    type: 'rightAligned',
    valueFormatter: (p) => formatPrice(p.value ?? 0),
  },
]

export const positionDefaultColDef: ColDef<Position> = { sortable: true, flex: 1, minWidth: 80 }
