import { defineStore } from 'pinia'
import * as api from '../api/trades'
import type { CreateTradeRequest, Trade } from '../api/types'
import { usePositionsStore } from './positions'
import { useResource } from './resource'

export const useTradesStore = defineStore('trades', () => {
  const { items: trades, loading, error, load: fetchTrades } = useResource(api.getTrades)

  // Re-fetch rather than insert locally: the server owns timestamps, order and positions.
  async function createTrade(request: CreateTradeRequest): Promise<Trade> {
    const trade = await api.createTrade(request)
    await Promise.all([fetchTrades(), usePositionsStore().fetchPositions()])
    return trade
  }

  return { trades, loading, error, fetchTrades, createTrade }
})
