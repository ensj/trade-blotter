import { request } from './http'
import type { CreateTradeRequest, Trade } from './types'

export function getTrades(): Promise<Trade[]> {
  return request<Trade[]>('/trades')
}

export function createTrade(body: CreateTradeRequest): Promise<Trade> {
  return request<Trade>('/trades', { method: 'POST', body })
}
