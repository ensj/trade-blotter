// Mirrors the API contract in docs/openapi.json. Money is a JSON number; timestamps are UTC ISO strings ending in Z.

export type Side = 'Buy' | 'Sell'

export interface CreateTradeRequest {
  symbol: string
  side: Side
  quantity: number
  price: number
}

export interface Trade {
  id: string
  symbol: string
  side: Side
  quantity: number
  price: number
  timestamp: string
}

export interface Position {
  symbol: string
  netQuantity: number
  averageCost: number
}

// RFC 7807; `errors` is present on 400 validation responses, keyed by field name.
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
}
