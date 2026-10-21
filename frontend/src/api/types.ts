// Generated from docs/openapi.json into schema.d.ts (`npm run gen:api`); these are the app-facing names.
import type { components } from './schema'

type Schemas = components['schemas']

export type Side = Schemas['Side']
export type CreateTradeRequest = Schemas['CreateTradeRequest']
export type Trade = Schemas['TradeResponse']
export type Position = Schemas['PositionResponse']
// RFC 7807; `errors` is present on 400 validation responses, keyed by field name.
export type ProblemDetails = Schemas['ValidationProblemDetails']
