import { flushPromises, mount } from '@vue/test-utils'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'
import { usePositionsStore } from '../stores/positions'
import PositionsPanel from './PositionsPanel.vue'

ModuleRegistry.registerModules([AllCommunityModule])

test('renders store positions and updates when the store changes', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = usePositionsStore()
  store.positions = [{ symbol: 'AAPL', netQuantity: -50, averageCost: 12 }]
  const wrapper = mount(PositionsPanel, { global: { plugins: [pinia] }, attachTo: document.body })
  await flushPromises()
  await new Promise((r) => setTimeout(r, 50))
  expect(wrapper.text()).toContain('AAPL')
  expect(wrapper.find('.short-position').exists()).toBe(true)

  store.positions = [{ symbol: 'MSFT', netQuantity: 10, averageCost: 400 }]
  await flushPromises()
  await new Promise((r) => setTimeout(r, 600))
  expect(wrapper.text()).toContain('MSFT')
  expect(wrapper.text()).not.toContain('AAPL')
  wrapper.unmount()
})
