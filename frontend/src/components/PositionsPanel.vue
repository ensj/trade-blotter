<script setup lang="ts">
import type { GetRowIdParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import type { Position } from '../api/types'
import { usePositionsStore } from '../stores/positions'
import { gridTheme } from '../theme'
import { positionColumns, positionDefaultColDef } from './positionColumns'

const store = usePositionsStore()

const getRowId = (p: GetRowIdParams<Position>) => p.data.symbol
</script>

<template>
  <section class="panel">
    <h2 class="heading">Positions</h2>
    <AgGridVue
      class="grid"
      :theme="gridTheme"
      :row-data="store.positions"
      :column-defs="positionColumns"
      :default-col-def="positionDefaultColDef"
      :get-row-id="getRowId"
      :loading="store.loading"
      overlay-no-rows-template="No open positions"
    />
  </section>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.5rem;
  min-height: 0;
}

.heading {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-surface-500);
}

.grid {
  height: 100%;
  min-height: 12rem;
}

.grid :deep(.short-position) {
  color: var(--p-red-600);
}
</style>
