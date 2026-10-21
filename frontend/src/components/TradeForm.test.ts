import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { expect, test } from 'vitest'
import TradeForm from './TradeForm.vue'

function mountForm(serverErrors = {}) {
  return mount(TradeForm, {
    props: { submitting: false, serverErrors },
    global: { plugins: [PrimeVue] },
  })
}

async function fill(wrapper: ReturnType<typeof mountForm>) {
  await wrapper.get('#trade-symbol').setValue(' brk.b ')
  await wrapper
    .findAll('button')
    .find((b) => b.text() === 'Sell')
    ?.trigger('click')
  await setNumber(wrapper, '#trade-quantity', '150')
  await setNumber(wrapper, '#trade-price', '412.5')
}

async function setNumber(wrapper: ReturnType<typeof mountForm>, selector: string, value: string) {
  const input = wrapper.get(selector)
  ;(input.element as HTMLInputElement).value = value
  await input.trigger('input')
  await input.trigger('blur')
}

test('shows every required-field error on an empty submit', async () => {
  const wrapper = mountForm()
  await wrapper.get('form').trigger('submit')
  const text = wrapper.text()
  expect(text).toContain('Symbol is required')
  expect(text).toContain('Side is required')
  expect(text).toContain('Quantity is required')
  expect(text).toContain('Price is required')
  expect(wrapper.emitted('submit')).toBeUndefined()
})

test('labels sit above their inputs', () => {
  const wrapper = mountForm()
  for (const id of ['trade-symbol', 'trade-quantity', 'trade-price']) {
    expect(wrapper.find(`label[for="${id}"]`).exists()).toBe(true)
  }
  expect(wrapper.text()).toContain('Side')
})

test('emits a normalized request when valid', async () => {
  const wrapper = mountForm()
  await fill(wrapper)
  await wrapper.get('form').trigger('submit')
  expect(wrapper.emitted('submit')).toEqual([
    [{ symbol: 'BRK.B', side: 'Sell', quantity: 150, price: 412.5 }],
  ])
})

test('shows server errors on their fields and clears one when edited', async () => {
  const wrapper = mountForm()
  await wrapper.setProps({ serverErrors: { symbol: 'Unknown symbol.', price: 'Too high.' } })
  expect(wrapper.text()).toContain('Unknown symbol.')
  expect(wrapper.text()).toContain('Too high.')

  await wrapper.get('#trade-symbol').setValue('MSFT')
  expect(wrapper.text()).not.toContain('Unknown symbol.')
  expect(wrapper.text()).toContain('Too high.')
})

test('cancel emits cancel', async () => {
  const wrapper = mountForm()
  await wrapper
    .findAll('button')
    .find((b) => b.text() === 'Cancel')
    ?.trigger('click')
  expect(wrapper.emitted('cancel')).toHaveLength(1)
})
