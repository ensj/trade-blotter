<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community'
import type { Side } from '../api/types'

defineProps<{ params: ICellRendererParams<unknown, Side> }>()
</script>

<template>
  <span :class="['side', params.value === 'Buy' ? 'buy' : 'sell']">{{ params.value }}</span>
</template>

<style scoped>
.side {
  font-weight: 600;
}

.buy {
  color: var(--p-green-600);
}

.sell {
  color: var(--p-red-600);
}
</style>
