import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App.vue'
import { jsonResponse, stubFetch } from './test/fetch'

afterEach(() => vi.unstubAllGlobals())

test('renders the shell and loads trades and positions', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const fetchMock = stubFetch(jsonResponse([]), jsonResponse([]))
  const wrapper = mount(App, { global: { plugins: [pinia] } })
  expect(wrapper.text()).toContain('Trade Blotter')
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(['/trades', '/positions'])
})
