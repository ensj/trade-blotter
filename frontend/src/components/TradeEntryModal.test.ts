import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { defineComponent } from 'vue'
import type { CreateTradeRequest } from '../api/types'
import { jsonResponse, stubFetch } from '../test/fetch'
import TradeEntryModal from './TradeEntryModal.vue'

const toastAdd = vi.fn()
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAdd }) }))

// Render the dialog inline so the test can see its content.
const DialogStub = defineComponent({
  props: { visible: Boolean },
  emits: ['update:visible', 'hide'],
  template: '<div v-if="visible" class="dialog"><slot /></div>',
})

const request: CreateTradeRequest = { symbol: 'AAPL', side: 'Buy', quantity: 1500, price: 131.4567 }
const created = { ...request, id: 'x', timestamp: '2026-10-19T14:03:11.123Z' }

beforeEach(() => {
  setActivePinia(createPinia())
  toastAdd.mockClear()
})
afterEach(() => vi.unstubAllGlobals())

function mountModal() {
  return mount(TradeEntryModal, {
    props: { visible: true },
    global: { plugins: [PrimeVue], stubs: { Dialog: DialogStub } },
  })
}

async function submit(wrapper: ReturnType<typeof mountModal>) {
  wrapper.findComponent({ name: 'TradeForm' }).vm.$emit('submit', request)
  await flushPromises()
}

test('closes and toasts after a successful create', async () => {
  stubFetch(jsonResponse(created, 201), jsonResponse([created]), jsonResponse([]))
  const wrapper = mountModal()
  await submit(wrapper)
  expect(wrapper.emitted('update:visible')).toEqual([[false]])
  expect(toastAdd).toHaveBeenCalledWith(
    expect.objectContaining({ severity: 'success', summary: 'Trade added' }),
  )
  expect(toastAdd.mock.calls[0]?.[0].detail).toBe(
    `Buy ${(1500).toLocaleString()} AAPL @ ${(131.4567).toLocaleString(undefined, { maximumFractionDigits: 4 })}`,
  )
})

test('maps a 400 ProblemDetails onto fields and form messages', async () => {
  stubFetch(
    jsonResponse(
      { status: 400, errors: { symbol: ['Unknown symbol.'], request: ['Bad body.'] } },
      400,
    ),
  )
  const wrapper = mountModal()
  await submit(wrapper)
  expect(wrapper.text()).toContain('Unknown symbol.')
  expect(wrapper.text()).toContain('Bad body.')
  expect(wrapper.emitted('update:visible')).toBeUndefined()
  expect(toastAdd).not.toHaveBeenCalled()
})

test('shows other failures as a form message and stays open', async () => {
  stubFetch(new TypeError('Failed to fetch'))
  const wrapper = mountModal()
  await submit(wrapper)
  expect(wrapper.text()).toContain('Failed to fetch')
  expect(wrapper.emitted('update:visible')).toBeUndefined()
})

test('clears errors when the dialog hides', async () => {
  stubFetch(new TypeError('Failed to fetch'))
  const wrapper = mountModal()
  await submit(wrapper)
  wrapper.findComponent(DialogStub).vm.$emit('hide')
  await flushPromises()
  expect(wrapper.text()).not.toContain('Failed to fetch')
})

test('cancel closes the dialog', async () => {
  const wrapper = mountModal()
  wrapper.findComponent({ name: 'TradeForm' }).vm.$emit('cancel')
  expect(wrapper.emitted('update:visible')).toEqual([[false]])
})
