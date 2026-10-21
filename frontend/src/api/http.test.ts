import { afterEach, expect, test, vi } from 'vitest'
import { jsonResponse, stubFetch } from '../test/fetch'
import { ApiError, errorMessage, request } from './http'

afterEach(() => vi.unstubAllGlobals())

test('returns the parsed JSON body on success', async () => {
  stubFetch(jsonResponse([{ symbol: 'AAPL' }]))
  await expect(request('/positions')).resolves.toEqual([{ symbol: 'AAPL' }])
})

test('sends JSON with an Accept header', async () => {
  const fetchMock = stubFetch(jsonResponse({}, 201))
  await request('/trades', { method: 'POST', body: { symbol: 'AAPL' } })
  expect(fetchMock).toHaveBeenCalledWith('/trades', {
    method: 'POST',
    body: '{"symbol":"AAPL"}',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  })
})

test('omits Content-Type when there is no body', async () => {
  const fetchMock = stubFetch(jsonResponse([]))
  await request('/trades')
  expect(fetchMock).toHaveBeenCalledWith('/trades', {
    method: 'GET',
    body: undefined,
    headers: { Accept: 'application/json' },
  })
})

test('maps a ProblemDetails response to an ApiError', async () => {
  const problem = {
    title: 'One or more validation errors occurred.',
    status: 400,
    errors: { symbol: ['Symbol is required.'] },
  }
  stubFetch(jsonResponse(problem, 400))
  const error = await request('/trades').catch((e: unknown) => e)
  expect(error).toBeInstanceOf(ApiError)
  expect(error).toMatchObject({
    status: 400,
    problem,
    message: 'One or more validation errors occurred.',
  })
})

test('prefers the ProblemDetails detail over the title', async () => {
  stubFetch(jsonResponse({ title: 'Server error', detail: 'Database is locked' }, 500))
  await expect(request('/trades')).rejects.toThrow('Database is locked')
})

test('falls back to the status when the error body is not JSON', async () => {
  stubFetch(new Response('Bad Gateway', { status: 502, statusText: 'Bad Gateway' }))
  const error = await request('/trades').catch((e: unknown) => e)
  expect(error).toMatchObject({ status: 502, message: 'Request failed with status 502' })
})

test('errorMessage reads Error messages and stringifies anything else', () => {
  expect(errorMessage(new TypeError('Failed to fetch'))).toBe('Failed to fetch')
  expect(errorMessage('boom')).toBe('Unexpected error')
})
