import { expect, test } from 'vitest'
import { emptyState } from './emptyState'

test('builds an empty-state overlay with a title and a hint', () => {
  expect(emptyState('No trades yet', 'Add one.')).toBe(
    '<div class="empty-state"><strong>No trades yet</strong><span>Add one.</span></div>',
  )
})
