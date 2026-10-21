import { expect, test } from 'vitest'
import type { Trade } from '../api/types'
import { matchesSearch } from './tradeSearch'

const trade: Trade = {
  id: '1',
  symbol: 'BRK.B',
  side: 'Sell',
  quantity: 1,
  price: 1,
  timestamp: '2026-10-19T14:03:11.123Z',
}

test('an empty or blank query matches everything', () => {
  expect(matchesSearch(trade, '')).toBe(true)
  expect(matchesSearch(trade, '   ')).toBe(true)
})

test('matches a case-insensitive substring of the symbol', () => {
  expect(matchesSearch(trade, 'brk')).toBe(true)
  expect(matchesSearch(trade, 'K.B')).toBe(true)
})

test('matches a case-insensitive substring of the side', () => {
  expect(matchesSearch(trade, 'SELL')).toBe(true)
  expect(matchesSearch(trade, 'el')).toBe(true)
})

test('trims the query before matching', () => {
  expect(matchesSearch(trade, '  brk  ')).toBe(true)
})

test('rejects a query that matches neither field', () => {
  expect(matchesSearch(trade, 'aapl')).toBe(false)
  expect(matchesSearch(trade, 'buy')).toBe(false)
  expect(matchesSearch(trade, '1')).toBe(false)
})
