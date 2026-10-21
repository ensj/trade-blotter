<script setup lang="ts">
import PlusIcon from '@primevue/icons/plus'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref, watch } from 'vue'
import AppToolbar from './components/AppToolbar.vue'
import BlotterGrid from './components/BlotterGrid.vue'
import PositionsPanel from './components/PositionsPanel.vue'
import TradeEntryModal from './components/TradeEntryModal.vue'
import { usePositionsStore } from './stores/positions'
import { useTradesStore } from './stores/trades'

const trades = useTradesStore()
const positions = usePositionsStore()
const search = ref('')
const entryOpen = ref(false)
const toast = useToast()

watch([() => trades.error, () => positions.error], ([tradesError, positionsError]) => {
  const message = tradesError ?? positionsError
  if (message) toast.add({ severity: 'error', summary: 'Could not load data', detail: message })
})

onMounted(() => Promise.all([trades.fetchTrades(), positions.fetchPositions()]))
</script>

<template>
  <div class="app">
    <AppToolbar v-model:search="search" class="toolbar">
      <template #actions>
        <Button label="New trade" size="small" @click="entryOpen = true">
          <template #icon="{ class: iconClass }"><PlusIcon :class="iconClass" /></template>
        </Button>
      </template>
    </AppToolbar>
    <main class="blotter" aria-label="Trades">
      <BlotterGrid :search="search" />
    </main>
    <aside class="positions" aria-label="Positions">
      <PositionsPanel />
    </aside>
    <TradeEntryModal v-model:visible="entryOpen" />
    <Toast position="bottom-right" />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22rem;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    "toolbar toolbar"
    "blotter positions";
  gap: 1rem;
  height: 100vh;
  padding: 1rem 1.25rem 1.25rem;
}

.toolbar {
  grid-area: toolbar;
}

.blotter {
  grid-area: blotter;
  display: grid;
  min-height: 0;
}

.positions {
  grid-area: positions;
  display: grid;
  min-height: 0;
}

@media (max-width: 900px) {
  .app {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(20rem, 1fr) auto;
    grid-template-areas: "toolbar" "blotter" "positions";
    height: auto;
    min-height: 100vh;
  }
}
</style>
