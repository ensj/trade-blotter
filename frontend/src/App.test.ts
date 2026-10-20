import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import App from './App.vue'

test('renders the app shell', () => {
  expect(mount(App).text()).toContain('Trade Blotter')
})
