import { flushPromises, mount } from '@vue/test-utils'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'
import { useTradesStore } from '../stores/trades'
import BlotterGrid from './BlotterGrid.vue'

ModuleRegistry.registerModules([AllCommunityModule])

// Removed rows animate out, so wait longer after a filter change.
const settle = async (ms = 50) => {
  await flushPromises()
  await new Promise((r) => setTimeout(r, ms))
}

async function mountGrid(search = '') {
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
  const wrapper = mount(BlotterGrid, {
    props: { search },
    global: { plugins: [pinia] },
    attachTo: document.body,
  })
  await settle()
  return wrapper
}

test('shows trades from the store with sides rendered', async () => {
  const wrapper = await mountGrid()
  expect(wrapper.text()).toContain('AAPL')
  expect(wrapper.find('.side.sell').exists()).toBe(true)
  wrapper.unmount()
})

test('filters rows by the search prop', async () => {
  const wrapper = await mountGrid('msft')
  expect(wrapper.text()).toContain('MSFT')
  expect(wrapper.text()).not.toContain('AAPL')

  await wrapper.setProps({ search: 'buy' })
  await settle(600)
  expect(wrapper.text()).toContain('AAPL')
  expect(wrapper.text()).not.toContain('MSFT')

  await wrapper.setProps({ search: '' })
  await settle()
  expect(wrapper.text()).toContain('AAPL')
  expect(wrapper.text()).toContain('MSFT')
  wrapper.unmount()
})
