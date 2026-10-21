<script setup lang="ts">
import type { GetRowIdParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import type { Position } from '../api/types'
import { usePositionsStore } from '../stores/positions'
import { gridTheme } from '../theme'
import { emptyState } from './emptyState'
import { positionColumns, positionDefaultColDef } from './positionColumns'

const store = usePositionsStore()

const getRowId = (p: GetRowIdParams<Position>) => p.data.symbol
</script>

<template>
  <section class="panel">
    <h2 class="panel-heading">Positions</h2>
    <AgGridVue
      class="grid"
      :theme="gridTheme"
      :row-data="store.positions"
      :column-defs="positionColumns"
      :default-col-def="positionDefaultColDef"
      :get-row-id="getRowId"
      :loading="store.loading"
      :overlay-no-rows-template="emptyState('No open positions', 'Positions appear as you trade.')"
    />
  </section>
</template>

<style scoped>
.grid {
  min-height: 12rem;
}

.grid :deep(.short-position) {
  color: var(--p-red-700);
}
</style>
