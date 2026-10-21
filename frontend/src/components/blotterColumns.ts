import type { ColDef } from 'ag-grid-community'
import type { Trade } from '../api/types'
import { formatMoney, formatPrice, formatQuantity, formatTimestamp } from '../lib/format'
import { notional } from '../lib/notional'
import { compareTimestamps } from '../lib/timestamp'
import SideCellRenderer from './SideCellRenderer.vue'

export const blotterColumns: ColDef<Trade>[] = [
  {
    field: 'timestamp',
    headerName: 'Time',
    cellDataType: 'text',
    sort: 'desc',
    comparator: compareTimestamps,
    valueFormatter: (p) => (p.value ? formatTimestamp(p.value) : ''),
    minWidth: 170,
  },
  { field: 'symbol', headerName: 'Symbol', cellDataType: 'text', minWidth: 90 },
  {
    field: 'side',
    headerName: 'Side',
    cellDataType: 'text',
    cellRenderer: SideCellRenderer,
    minWidth: 80,
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'rightAligned',
    valueFormatter: (p) => formatQuantity(p.value ?? 0),
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'rightAligned',
    valueFormatter: (p) => formatPrice(p.value ?? 0),
  },
  {
    colId: 'notional',
    headerName: 'Notional',
    type: 'rightAligned',
    cellDataType: 'number',
    valueGetter: (p) => (p.data ? notional(p.data.quantity, p.data.price) : null),
    valueFormatter: (p) => (p.value == null ? '' : formatMoney(p.value)),
    minWidth: 120,
  },
]

export const defaultColDef: ColDef<Trade> = { sortable: true, flex: 1, minWidth: 90 }
