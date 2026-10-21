import { expect, test } from 'vitest'
import { primePreset } from './theme'

test('maps every primary shade to the sky palette', () => {
  const primary = (primePreset as { semantic: { primary: Record<string, string> } }).semantic
    .primary
  expect(primary['50']).toBe('{sky.50}')
  expect(primary['500']).toBe('{sky.500}')
  expect(primary['950']).toBe('{sky.950}')
})

test('uses a primary shade dark enough for white button text (WCAG AA)', () => {
  const light = (
    primePreset as {
      semantic: { colorScheme: { light: { primary: Record<string, string> } } }
    }
  ).semantic.colorScheme.light.primary
  expect(light).toMatchObject({
    color: '{primary.700}',
    hoverColor: '{primary.800}',
    activeColor: '{primary.900}',
  })
})
