<script setup lang="ts">
import { onMounted } from 'vue'
import { usePositionsStore } from './stores/positions'
import { useTradesStore } from './stores/trades'

const trades = useTradesStore()
const positions = usePositionsStore()

onMounted(() => Promise.all([trades.fetchTrades(), positions.fetchPositions()]))
</script>

<template>
  <div class="app">
    <header class="toolbar">
      <h1 class="title">Trade Blotter</h1>
    </header>
    <main class="blotter" aria-label="Trades"></main>
    <aside class="positions" aria-label="Positions"></aside>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22rem;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'toolbar toolbar'
    'blotter positions';
  gap: 1rem;
  height: 100vh;
  padding: 1rem 1.25rem 1.25rem;
}

.toolbar {
  grid-area: toolbar;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-surface-800);
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
    grid-template-areas: 'toolbar' 'blotter' 'positions';
    height: auto;
    min-height: 100vh;
  }
}
</style>
