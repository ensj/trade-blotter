import { expect, test } from 'vitest'
import { notional } from './notional'

test('multiplies quantity by price', () => {
  expect(notional(100, 187.25)).toBe(18725)
})

test('removes binary float noise', () => {
  expect(notional(3, 0.1)).toBe(0.3)
})

test('keeps the full 8 decimal places of two 4-dp inputs', () => {
  expect(notional(1.2345, 1.2345)).toBe(1.52399025)
  expect(notional(0.0001, 0.0001)).toBe(0.00000001)
})
