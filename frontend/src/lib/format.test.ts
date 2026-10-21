import { expect, test } from 'vitest'
import { formatMoney, formatPrice, formatQuantity, formatTimestamp } from './format'

test('formatTimestamp converts UTC to the given time zone', () => {
  expect(formatTimestamp('2026-10-19T14:03:11.123Z', 'en-US', 'America/New_York')).toBe(
    'Oct 19, 2026, 10:03:11',
  )
  expect(formatTimestamp('2026-10-19T14:03:11.123Z', 'en-US', 'Asia/Seoul')).toBe(
    'Oct 19, 2026, 23:03:11',
  )
})

test('formatTimestamp uses a 24-hour clock', () => {
  expect(formatTimestamp('2026-10-19T00:05:00Z', 'en-US', 'UTC')).toBe('Oct 19, 2026, 00:05:00')
})

test('formatQuantity groups thousands and keeps up to 4 decimals', () => {
  expect(formatQuantity(1234567, 'en-US')).toBe('1,234,567')
  expect(formatQuantity(0.1234, 'en-US')).toBe('0.1234')
  expect(formatQuantity(-1500.5, 'en-US')).toBe('-1,500.5')
})

test('formatPrice shows 2 to 4 decimals', () => {
  expect(formatPrice(187.25, 'en-US')).toBe('187.25')
  expect(formatPrice(1000, 'en-US')).toBe('1,000.00')
  expect(formatPrice(0.1234, 'en-US')).toBe('0.1234')
  expect(formatPrice(12.123456, 'en-US')).toBe('12.1235')
})

test('formatMoney shows exactly 2 decimals', () => {
  expect(formatMoney(18725, 'en-US')).toBe('18,725.00')
  expect(formatMoney(0.005, 'en-US')).toBe('0.01')
})
