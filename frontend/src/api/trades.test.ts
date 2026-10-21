import { afterEach, expect, test, vi } from 'vitest'
import { jsonResponse, stubFetch } from '../test/fetch'
import { getPositions } from './positions'
import { createTrade, getTrades } from './trades'
import type { Position, Trade } from './types'

afterEach(() => vi.unstubAllGlobals())

const trade: Trade = {
  id: '6f1c3e1a-0000-4000-8000-000000000001',
  symbol: 'AAPL',
  side: 'Buy',
  quantity: 100,
  price: 187.25,
  timestamp: '2026-10-19T14:03:11.123Z',
}

test('getTrades fetches GET /trades', async () => {
  const fetchMock = stubFetch(jsonResponse([trade]))
  await expect(getTrades()).resolves.toEqual([trade])
  expect(fetchMock.mock.calls[0]?.[0]).toBe('/trades')
  expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'GET' })
})

test('createTrade posts the request and returns the created trade', async () => {
  const fetchMock = stubFetch(jsonResponse(trade, 201))
  const body = { symbol: 'AAPL', side: 'Buy' as const, quantity: 100, price: 187.25 }
  await expect(createTrade(body)).resolves.toEqual(trade)
  expect(fetchMock.mock.calls[0]?.[0]).toBe('/trades')
  expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST', body: JSON.stringify(body) })
})

test('getPositions fetches GET /positions', async () => {
  const positions: Position[] = [{ symbol: 'AAPL', netQuantity: 100, averageCost: 187.25 }]
  const fetchMock = stubFetch(jsonResponse(positions))
  await expect(getPositions()).resolves.toEqual(positions)
  expect(fetchMock.mock.calls[0]?.[0]).toBe('/positions')
})
