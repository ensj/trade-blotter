import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ApiError } from '../api/http'
import type { Position, Trade } from '../api/types'
import { jsonResponse, stubFetch } from '../test/fetch'
import { usePositionsStore } from './positions'
import { useTradesStore } from './trades'

const trade: Trade = {
  id: '6f1c3e1a-0000-4000-8000-000000000001',
  symbol: 'AAPL',
  side: 'Buy',
  quantity: 100,
  price: 187.25,
  timestamp: '2026-10-19T14:03:11.123Z',
}
const position: Position = { symbol: 'AAPL', netQuantity: 100, averageCost: 187.25 }

beforeEach(() => setActivePinia(createPinia()))
afterEach(() => vi.unstubAllGlobals())

test('trades store starts empty and idle', () => {
  const store = useTradesStore()
  expect(store.trades).toEqual([])
  expect(store.loading).toBe(false)
  expect(store.error).toBeNull()
})

test('fetchTrades loads trades and toggles loading', async () => {
  stubFetch(jsonResponse([trade]))
  const store = useTradesStore()
  const pending = store.fetchTrades()
  expect(store.loading).toBe(true)
  await pending
  expect(store.loading).toBe(false)
  expect(store.trades).toEqual([trade])
})

test('fetchTrades records the error and keeps the previous trades', async () => {
  stubFetch(jsonResponse([trade]), jsonResponse({ title: 'Server error' }, 500))
  const store = useTradesStore()
  await store.fetchTrades()
  await store.fetchTrades()
  expect(store.error).toBe('Server error')
  expect(store.trades).toEqual([trade])
  expect(store.loading).toBe(false)
})

test('a successful fetch clears an earlier error', async () => {
  stubFetch(new TypeError('Failed to fetch'), jsonResponse([trade]))
  const store = useTradesStore()
  await store.fetchTrades()
  expect(store.error).toBe('Failed to fetch')
  await store.fetchTrades()
  expect(store.error).toBeNull()
})

test('an older response does not overwrite a newer one', async () => {
  let resolveFirst: (r: Response) => void = () => {}
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(new Promise<Response>((resolve) => (resolveFirst = resolve)))
    .mockResolvedValueOnce(jsonResponse([trade]))
  vi.stubGlobal('fetch', fetchMock)
  const store = useTradesStore()
  const first = store.fetchTrades()
  await store.fetchTrades()
  resolveFirst(jsonResponse([]))
  await first
  expect(store.trades).toEqual([trade])
  expect(store.loading).toBe(false)
})

test('positions store loads positions', async () => {
  stubFetch(jsonResponse([position]))
  const store = usePositionsStore()
  await store.fetchPositions()
  expect(store.positions).toEqual([position])
  expect(store.error).toBeNull()
})

test('positions store records errors', async () => {
  stubFetch(jsonResponse({ detail: 'Database is locked' }, 500))
  const store = usePositionsStore()
  await store.fetchPositions()
  expect(store.error).toBe('Database is locked')
  expect(store.positions).toEqual([])
})

test('createTrade posts, then re-fetches trades and positions', async () => {
  const fetchMock = stubFetch(
    jsonResponse(trade, 201),
    jsonResponse([trade]),
    jsonResponse([position]),
  )
  const trades = useTradesStore()
  const positions = usePositionsStore()
  const request = { symbol: 'AAPL', side: 'Buy' as const, quantity: 100, price: 187.25 }
  await expect(trades.createTrade(request)).resolves.toEqual(trade)
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(['/trades', '/trades', '/positions'])
  expect(trades.trades).toEqual([trade])
  expect(positions.positions).toEqual([position])
})

test('createTrade rethrows API errors and does not re-fetch', async () => {
  const fetchMock = stubFetch(
    jsonResponse({ title: 'Invalid', errors: { Quantity: ['Must be positive.'] } }, 400),
  )
  const store = useTradesStore()
  const request = { symbol: 'AAPL', side: 'Buy' as const, quantity: -1, price: 1 }
  await expect(store.createTrade(request)).rejects.toBeInstanceOf(ApiError)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(store.error).toBeNull()
})
