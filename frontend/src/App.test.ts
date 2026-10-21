import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App.vue'
import { jsonResponse, stubFetch } from './test/fetch'

afterEach(() => vi.unstubAllGlobals())

test('renders the shell and loads trades and positions', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const fetchMock = stubFetch(jsonResponse([]), jsonResponse([]))
  const wrapper = mount(App, { global: { plugins: [pinia, PrimeVue, ToastService] } })
  expect(wrapper.text()).toContain('Trade Blotter')
  expect(fetchMock.mock.calls.map((call) => call[0])).toEqual(['/trades', '/positions'])
})

test('toasts load errors and opens the entry dialog from the toolbar', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  stubFetch(jsonResponse({ title: 'Server down' }, 500), jsonResponse([]))
  const wrapper = mount(App, {
    global: { plugins: [pinia, PrimeVue, ToastService] },
    attachTo: document.body,
  })
  await flushPromises()
  expect(document.body.textContent).toContain('Server down')
  const newTrade = wrapper.findAll('button').find((b) => b.text() === 'New trade')
  await newTrade?.trigger('click')
  await flushPromises()
  expect(document.body.textContent).toContain('Add trade')
  wrapper.unmount()
})
