<script setup lang="ts">
import type { ICellRendererParams } from 'ag-grid-community'
import type { Side } from '../api/types'

defineProps<{ params: ICellRendererParams<unknown, Side> }>()
</script>

<template>
  <span :class="['side', params.value === 'Buy' ? 'buy' : 'sell']">{{ params.value }}</span>
</template>

<!-- Not scoped: ag-grid-vue3 wraps a renderer passed by reference, which drops the scope id. -->
<style>
.side.buy,
.side.sell {
  font-weight: 600;
}

.side.buy {
  color: var(--p-green-600);
}

.side.sell {
  color: var(--p-red-600);
}
</style>
