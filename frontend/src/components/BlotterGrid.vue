<script setup lang="ts">
import type { GetRowIdParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import type { Trade } from '../api/types'
import { useTradesStore } from '../stores/trades'
import { gridTheme } from '../theme'
import { blotterColumns, defaultColDef } from './blotterColumns'
import SideCellRenderer from './SideCellRenderer.vue'

const store = useTradesStore()

const getRowId = (p: GetRowIdParams<Trade>) => p.data.id

defineExpose({ SideCellRenderer })
</script>

<template>
  <AgGridVue
    class="grid"
    :theme="gridTheme"
    :row-data="store.trades"
    :column-defs="blotterColumns"
    :default-col-def="defaultColDef"
    :get-row-id="getRowId"
    :loading="store.loading"
    overlay-no-rows-template="No trades yet. Use + New trade to add one."
  />
</template>

<style scoped>
.grid {
  height: 100%;
  width: 100%;
}
</style>
