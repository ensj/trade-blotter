import type { Trade } from '../api/types'

export function matchesSearch(trade: Trade, query: string): boolean {
  const needle = query.trim().toLowerCase()
  return trade.symbol.toLowerCase().includes(needle) || trade.side.toLowerCase().includes(needle)
}
