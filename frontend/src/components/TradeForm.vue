<script setup lang="ts">
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import { reactive, ref, watch } from 'vue'
import type { CreateTradeRequest } from '../api/types'
import {
  FIELDS,
  type FieldErrors,
  type TradeDraft,
  toRequest,
  validateTrade,
} from '../lib/tradeValidation'

const props = defineProps<{ submitting: boolean; serverErrors: FieldErrors }>()
const emit = defineEmits<{ submit: [request: CreateTradeRequest]; cancel: [] }>()

const draft = reactive<TradeDraft>({ symbol: '', side: null, quantity: null, price: null })
const errors = ref<FieldErrors>({})

watch(
  () => props.serverErrors,
  (serverErrors) => {
    errors.value = { ...serverErrors }
  },
)

// Editing a field clears its error until the next submit.
for (const field of FIELDS) {
  watch(
    () => draft[field],
    () => {
      delete errors.value[field]
    },
  )
}

function submit() {
  errors.value = validateTrade(draft)
  if (Object.keys(errors.value).length === 0) emit('submit', toRequest(draft))
}
</script>

<template>
  <form class="trade-form" novalidate @submit.prevent="submit">
    <div class="field">
      <label for="trade-symbol">Symbol</label>
      <!-- The Dialog focuses [autofocus] on open, else its close button; biome.json allows it here. -->
      <InputText
        size="small"
        id="trade-symbol"
        v-model="draft.symbol"
        class="symbol"
        maxlength="10"
        autocomplete="off"
        autofocus
        :invalid="!!errors.symbol"
        fluid
      />
      <Message v-if="errors.symbol" severity="error" variant="simple" size="small">
        {{ errors.symbol }}
      </Message>
    </div>

    <div class="field">
      <span id="trade-side-label" class="label">Side</span>
      <SelectButton
        size="small"
        v-model="draft.side"
        :options="['Buy', 'Sell']"
        :allow-empty="false"
        aria-labelledby="trade-side-label"
        :invalid="!!errors.side"
        fluid
      />
      <Message v-if="errors.side" severity="error" variant="simple" size="small">
        {{ errors.side }}
      </Message>
    </div>

    <div class="field">
      <label for="trade-quantity">Quantity</label>
      <InputNumber
        size="small"
        v-model="draft.quantity"
        input-id="trade-quantity"
        :min-fraction-digits="0"
        :max-fraction-digits="4"
        :invalid="!!errors.quantity"
        fluid
      />
      <Message v-if="errors.quantity" severity="error" variant="simple" size="small">
        {{ errors.quantity }}
      </Message>
    </div>

    <div class="field">
      <label for="trade-price">Price</label>
      <InputNumber
        size="small"
        v-model="draft.price"
        input-id="trade-price"
        :min-fraction-digits="2"
        :max-fraction-digits="4"
        :invalid="!!errors.price"
        fluid
      />
      <Message v-if="errors.price" severity="error" variant="simple" size="small">
        {{ errors.price }}
      </Message>
    </div>

    <div class="actions">
      <Button
        label="Cancel"
        size="small"
        severity="secondary"
        variant="text"
        type="button"
        @click="emit('cancel')"
      />
      <Button label="Add trade" type="submit" size="small" :loading="submitting" />
    </div>
  </form>
</template>

<style scoped>
.trade-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.25rem;
}

.field {
  display: grid;
  gap: 0.375rem;
  align-content: start;
}

.field label,
.label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--p-surface-500);
}

.symbol {
  text-transform: uppercase;
}

.actions {
  grid-column: 1 / -1;
  display: grid;
  grid-auto-flow: column;
  justify-content: end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
