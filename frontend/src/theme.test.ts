import { expect, test } from 'vitest'
import { emptyState, primePreset } from './theme'

test('maps every primary shade to the sky palette', () => {
  const primary = (primePreset as { semantic: { primary: Record<string, string> } }).semantic
    .primary
  expect(primary['50']).toBe('{sky.50}')
  expect(primary['500']).toBe('{sky.500}')
  expect(primary['950']).toBe('{sky.950}')
})

test('builds an empty-state overlay with a title and a hint', () => {
  expect(emptyState('No trades yet', 'Add one.')).toBe(
    '<div class="empty-state"><strong>No trades yet</strong><span>Add one.</span></div>',
  )
})
