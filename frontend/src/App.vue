<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppToolbar from './components/AppToolbar.vue'
import BlotterGrid from './components/BlotterGrid.vue'
import { usePositionsStore } from './stores/positions'
import { useTradesStore } from './stores/trades'

const trades = useTradesStore()
const positions = usePositionsStore()
const search = ref('')

onMounted(() => Promise.all([trades.fetchTrades(), positions.fetchPositions()]))
</script>

<template>
  <div class="app">
    <AppToolbar v-model:search="search" class="toolbar" />
    <main class="blotter" aria-label="Trades">
      <BlotterGrid :search="search" />
    </main>
    <aside class="positions" aria-label="Positions"></aside>
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
