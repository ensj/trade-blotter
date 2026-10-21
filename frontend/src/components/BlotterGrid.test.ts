import { flushPromises, mount } from '@vue/test-utils'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'
import { useTradesStore } from '../stores/trades'
import BlotterGrid from './BlotterGrid.vue'

ModuleRegistry.registerModules([AllCommunityModule])

test('shows trades from the store with sides rendered', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useTradesStore().trades = [
    {
      id: 'a',
      symbol: 'AAPL',
      side: 'Buy',
      quantity: 100,
      price: 187.25,
      timestamp: '2026-10-19T14:03:11.123Z',
    },
    {
      id: 'b',
      symbol: 'MSFT',
      side: 'Sell',
      quantity: 5,
      price: 410,
      timestamp: '2026-10-19T15:00:00.000Z',
    },
  ]
  const wrapper = mount(BlotterGrid, { global: { plugins: [pinia] }, attachTo: document.body })
  await flushPromises()
  await new Promise((r) => setTimeout(r, 50))
  expect(wrapper.text()).toContain('AAPL')
  expect(wrapper.find('.side.sell').exists()).toBe(true)
  wrapper.unmount()
})
