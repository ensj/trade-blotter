<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { ref } from 'vue'
import { ApiError, errorMessage } from '../api/http'
import type { CreateTradeRequest } from '../api/types'
import { formatPrice, formatQuantity } from '../lib/format'
import { type FieldErrors, mapProblemErrors } from '../lib/tradeValidation'
import { useTradesStore } from '../stores/trades'
import TradeForm from './TradeForm.vue'

const visible = defineModel<boolean>('visible', { required: true })
const store = useTradesStore()
const toast = useToast()

const submitting = ref(false)
const serverErrors = ref<FieldErrors>({})
const formErrors = ref<string[]>([])

function reset() {
  serverErrors.value = {}
  formErrors.value = []
}

async function submit(request: CreateTradeRequest) {
  submitting.value = true
  formErrors.value = []
  try {
    const trade = await store.createTrade(request)
    visible.value = false
    toast.add({
      severity: 'success',
      summary: 'Trade added',
      detail: `${trade.side} ${formatQuantity(trade.quantity)} ${trade.symbol} @ ${formatPrice(trade.price)}`,
      life: 3000,
    })
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) {
      const { fields, other } = mapProblemErrors(e.problem)
      serverErrors.value = fields
      formErrors.value = other
    } else {
      formErrors.value = [errorMessage(e)]
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="New trade"
    :draggable="false"
    :style="{ width: '30rem' }"
    @hide="reset"
  >
    <div class="body">
      <Message v-for="message in formErrors" :key="message" severity="error" size="small">
        {{ message }}
      </Message>
      <TradeForm
        :submitting="submitting"
        :server-errors="serverErrors"
        @submit="submit"
        @cancel="visible = false"
      />
    </div>
  </Dialog>
</template>

<style scoped>
.body {
  display: grid;
  gap: 1rem;
}
</style>
