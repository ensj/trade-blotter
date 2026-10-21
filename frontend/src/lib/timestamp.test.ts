import { expect, test } from 'vitest'
import { compareTimestamps } from './timestamp'

// .NET trims trailing fractional zeros, so string order disagrees with time order.
test('orders by time, not by string', () => {
  expect('2026-10-20T14:03:47.5Z' > '2026-10-20T14:03:47.51Z').toBe(true)
  expect(compareTimestamps('2026-10-20T14:03:47.5Z', '2026-10-20T14:03:47.51Z')).toBeLessThan(0)
  expect(compareTimestamps('2026-10-20T14:03:47.51Z', '2026-10-20T14:03:47.5Z')).toBeGreaterThan(0)
})

test('handles a timestamp with no fractional seconds', () => {
  expect(compareTimestamps('2026-10-20T14:03:47Z', '2026-10-20T14:03:47.1Z')).toBeLessThan(0)
})

test('treats equal instants as equal', () => {
  expect(compareTimestamps('2026-10-20T14:03:47.5Z', '2026-10-20T14:03:47.500Z')).toBe(0)
})
