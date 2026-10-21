import { mount } from '@vue/test-utils'
import type { ICellRendererParams } from 'ag-grid-community'
import { expect, test } from 'vitest'
import SideCellRenderer from './SideCellRenderer.vue'

const render = (value: string) =>
  mount(SideCellRenderer, { props: { params: { value } as ICellRendererParams } })

test('renders Buy in the buy style', () => {
  const span = render('Buy').get('span')
  expect(span.text()).toBe('Buy')
  expect(span.classes()).toContain('buy')
})

test('renders Sell in the sell style', () => {
  const span = render('Sell').get('span')
  expect(span.text()).toBe('Sell')
  expect(span.classes()).toContain('sell')
  expect(span.classes()).not.toContain('buy')
})
