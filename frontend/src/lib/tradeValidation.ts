import type { CreateTradeRequest, ProblemDetails, Side } from '../api/types'

// Mirrors the server's rules; the server stays the authority.
export type TradeField = 'symbol' | 'side' | 'quantity' | 'price'
export type FieldErrors = Partial<Record<TradeField, string>>

export interface TradeDraft {
  symbol: string
  side: Side | null
  quantity: number | null
  price: number | null
}

const SYMBOL = /^[A-Za-z0-9.-]{1,10}$/
const MAX_AMOUNT = 1_000_000_000
const FIELDS: TradeField[] = ['symbol', 'side', 'quantity', 'price']

function amountError(value: number | null, label: string): string | undefined {
  if (value === null || !Number.isFinite(value)) return `${label} is required`
  if (value <= 0) return 'Must be greater than 0'
  if (value > MAX_AMOUNT) return 'Must be at most 1,000,000,000'
  if (Number(value.toFixed(4)) !== value) return 'At most 4 decimal places'
  return undefined
}

export function validateTrade(draft: TradeDraft): FieldErrors {
  const errors: FieldErrors = {}
  const symbol = draft.symbol.trim()
  if (!symbol) errors.symbol = 'Symbol is required'
  else if (!SYMBOL.test(symbol)) errors.symbol = "Use 1–10 letters, digits, '.' or '-'"
  if (!draft.side) errors.side = 'Side is required'
  const quantity = amountError(draft.quantity, 'Quantity')
  if (quantity) errors.quantity = quantity
  const price = amountError(draft.price, 'Price')
  if (price) errors.price = price
  return errors
}

export function toRequest(draft: TradeDraft): CreateTradeRequest {
  if (!draft.side || draft.quantity === null || draft.price === null) {
    throw new Error('toRequest needs a validated draft')
  }
  return {
    symbol: draft.symbol.trim().toUpperCase(),
    side: draft.side,
    quantity: draft.quantity,
    price: draft.price,
  }
}

function fieldFor(key: string): TradeField | undefined {
  return FIELDS.find((field) => field === key)
}

export function mapProblemErrors(problem: ProblemDetails): {
  fields: FieldErrors
  other: string[]
} {
  const fields: FieldErrors = {}
  const other: string[] = []
  for (const [key, messages] of Object.entries(problem.errors ?? {})) {
    const field = fieldFor(key)
    if (field) fields[field] = messages.join(' ')
    else other.push(...messages)
  }
  if (Object.keys(fields).length === 0 && other.length === 0) {
    other.push(problem.detail ?? problem.title ?? 'The trade was rejected')
  }
  return { fields, other }
}
