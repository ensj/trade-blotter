import { describe, expect, test } from 'vitest'
import { mapProblemErrors, type TradeDraft, toRequest, validateTrade } from './tradeValidation'

const valid: TradeDraft = { symbol: 'AAPL', side: 'Buy', quantity: 100, price: 187.25 }

test('a complete draft has no errors', () => {
  expect(validateTrade(valid)).toEqual({})
})

describe('symbol', () => {
  test.each(['A', 'BRK.B', 'BF-B', 'abcdefghij', ' msft '])('accepts %j', (symbol) => {
    expect(validateTrade({ ...valid, symbol }).symbol).toBeUndefined()
  })

  test('is required', () => {
    expect(validateTrade({ ...valid, symbol: '' }).symbol).toBe('Symbol is required')
    expect(validateTrade({ ...valid, symbol: '   ' }).symbol).toBe('Symbol is required')
  })

  test.each(['ABCDEFGHIJK', 'AA PL', 'AAPL!', 'ÅAPL', 'A_B'])('rejects %j', (symbol) => {
    expect(validateTrade({ ...valid, symbol }).symbol).toBe("Use 1–10 letters, digits, '.' or '-'")
  })
})

test('side is required', () => {
  expect(validateTrade({ ...valid, side: null }).side).toBe('Side is required')
  expect(validateTrade({ ...valid, side: 'Sell' }).side).toBeUndefined()
})

describe.each(['quantity', 'price'] as const)('%s', (field) => {
  const label = field === 'quantity' ? 'Quantity' : 'Price'
  const check = (value: number | null) => validateTrade({ ...valid, [field]: value })[field]

  test('is required', () => {
    expect(check(null)).toBe(`${label} is required`)
  })

  test('must be positive', () => {
    expect(check(0)).toBe('Must be greater than 0')
    expect(check(-5)).toBe('Must be greater than 0')
  })

  test('must be at most one billion', () => {
    expect(check(1_000_000_000)).toBeUndefined()
    expect(check(1_000_000_000.0001)).toBe('Must be at most 1,000,000,000')
  })

  test('allows at most 4 decimal places', () => {
    expect(check(0.0001)).toBeUndefined()
    expect(check(1.2345)).toBeUndefined()
    expect(check(1.23456)).toBe('At most 4 decimal places')
    expect(check(0.00001)).toBe('At most 4 decimal places')
  })

  test('rejects non-finite numbers', () => {
    expect(check(Number.NaN)).toBe(`${label} is required`)
  })
})

test('toRequest trims and upper-cases the symbol', () => {
  expect(toRequest({ ...valid, symbol: ' brk.b ' })).toEqual({
    symbol: 'BRK.B',
    side: 'Buy',
    quantity: 100,
    price: 187.25,
  })
})

test('toRequest refuses an incomplete draft', () => {
  expect(() => toRequest({ ...valid, side: null })).toThrow()
  expect(() => toRequest({ ...valid, quantity: null })).toThrow()
  expect(() => toRequest({ ...valid, price: null })).toThrow()
})

describe('mapProblemErrors', () => {
  test('maps camelCase keys onto fields', () => {
    expect(
      mapProblemErrors({
        errors: {
          symbol: ['The Symbol field is required.'],
          quantity: ['Must be positive.', 'Too many decimals.'],
          price: ['Invalid number.'],
          side: ['Side must be Buy or Sell.'],
        },
      }),
    ).toEqual({
      fields: {
        symbol: 'The Symbol field is required.',
        quantity: 'Must be positive. Too many decimals.',
        price: 'Invalid number.',
        side: 'Side must be Buy or Sell.',
      },
      other: [],
    })
  })

  test('treats keys that are not exact field names as form-level messages', () => {
    expect(mapProblemErrors({ errors: { Symbol: ['Pascal.'], '$.price': ['Path.'] } })).toEqual({
      fields: {},
      other: ['Pascal.', 'Path.'],
    })
  })

  test('keeps errors for unknown keys as form-level messages', () => {
    expect(mapProblemErrors({ errors: { request: ['Malformed JSON.'] } })).toEqual({
      fields: {},
      other: ['Malformed JSON.'],
    })
  })

  test('falls back to detail or title when there are no field errors', () => {
    expect(mapProblemErrors({ title: 'Conflict', detail: 'Try again' })).toEqual({
      fields: {},
      other: ['Try again'],
    })
    expect(mapProblemErrors({ title: 'Conflict' }).other).toEqual(['Conflict'])
    expect(mapProblemErrors({}).other).toEqual(['The trade was rejected'])
    expect(mapProblemErrors({ title: 'Bad', errors: {} }).other).toEqual(['Bad'])
  })
})
