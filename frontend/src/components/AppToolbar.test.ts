import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { expect, test } from 'vitest'
import AppToolbar from './AppToolbar.vue'

test('emits the typed search text', async () => {
  const wrapper = mount(AppToolbar, {
    props: { search: '' },
    slots: { actions: '<button>New</button>' },
    global: { plugins: [PrimeVue] },
  })
  await wrapper.get('input[aria-label="Search trades"]').setValue('aapl')
  expect(wrapper.emitted('update:search')).toEqual([['aapl']])
  expect(wrapper.text()).toContain('New')
})

test('shows a clear button only while there is search text', async () => {
  const wrapper = mount(AppToolbar, {
    props: { search: '' },
    global: { plugins: [PrimeVue] },
    attachTo: document.body,
  })
  expect(wrapper.find('button[aria-label="Clear search"]').exists()).toBe(false)

  await wrapper.setProps({ search: 'aapl' })
  await wrapper.get('button[aria-label="Clear search"]').trigger('click')
  expect(wrapper.emitted('update:search')).toEqual([['']])
  expect(document.activeElement).toBe(wrapper.get('input').element)
  wrapper.unmount()
})
