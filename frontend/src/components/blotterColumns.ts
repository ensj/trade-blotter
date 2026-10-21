import type { ColDef } from 'ag-grid-community'
import type { Trade } from '../api/types'
import {
  formatMoney,
  formatPrice,
  formatQuantity,
  formatTimestamp,
  formatTradeTime,
} from '../lib/format'
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
    valueFormatter: (p) => (p.value ? formatTradeTime(p.value) : ''),
    tooltip: (p) => (p.value ? formatTimestamp(p.value) : ''),
    width: 132,
  },
  { field: 'symbol', headerName: 'Symbol', cellDataType: 'text', width: 100 },
  {
    field: 'side',
    headerName: 'Side',
    cellDataType: 'text',
    cellRenderer: SideCellRenderer,
    width: 72,
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'rightAligned',
    flex: 1,
    minWidth: 80,
    valueFormatter: (p) => formatQuantity(p.value ?? 0),
  },
  {
    field: 'price',
    headerName: 'Price',
    type: 'rightAligned',
    flex: 1,
    minWidth: 90,
    valueFormatter: (p) => formatPrice(p.value ?? 0),
  },
  {
    colId: 'notional',
    headerName: 'Notional',
    type: 'rightAligned',
    cellDataType: 'number',
    valueGetter: (p) => (p.data ? notional(p.data.quantity, p.data.price) : null),
    valueFormatter: (p) => (p.value == null ? '' : formatMoney(p.value)),
    flex: 1,
    minWidth: 110,
  },
]

// Text columns get fixed widths sized to their content; the numeric columns share the rest.
export const defaultColDef: ColDef<Trade> = { sortable: true }
