<script setup lang="ts">
import type { GetRowIdParams, GridApi, GridReadyEvent, IRowNode } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import { shallowRef, watch } from 'vue'
import type { Trade } from '../api/types'
import { matchesSearch } from '../lib/tradeSearch'
import { useTradesStore } from '../stores/trades'
import { gridTheme } from '../theme'
import { blotterColumns, defaultColDef } from './blotterColumns'
import { emptyState } from './emptyState'

const props = defineProps<{ search: string }>()
const store = useTradesStore()
const gridApi = shallowRef<GridApi<Trade>>()

const getRowId = (p: GetRowIdParams<Trade>) => p.data.id
const onGridReady = (event: GridReadyEvent<Trade>) => {
  gridApi.value = event.api
}

const isExternalFilterPresent = () => props.search.trim() !== ''
const doesExternalFilterPass = (node: IRowNode<Trade>) =>
  node.data ? matchesSearch(node.data, props.search) : true

watch(
  () => props.search,
  () => gridApi.value?.onFilterChanged(),
)
</script>

<template>
  <section class="panel">
    <h2 class="panel-heading">Trades</h2>
    <AgGridVue
      class="grid"
      :theme="gridTheme"
      :row-data="store.trades"
      :column-defs="blotterColumns"
      :default-col-def="defaultColDef"
      :get-row-id="getRowId"
      :tooltip-show-delay="300"
      :is-external-filter-present="isExternalFilterPresent"
      :does-external-filter-pass="doesExternalFilterPass"
      :loading="store.loading"
      :overlay-no-rows-template="emptyState('No trades yet', 'Use New trade to record one.')"
      @grid-ready="onGridReady"
    />
  </section>
</template>
