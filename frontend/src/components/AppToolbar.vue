<script setup lang="ts">
import SearchIcon from '@primevue/icons/search'
import TimesIcon from '@primevue/icons/times'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useTemplateRef } from 'vue'

const search = defineModel<string>('search', { required: true })
const input = useTemplateRef<{ $el: HTMLInputElement }>('input')

// The clear button unmounts itself, so hand focus back to the field.
function clear() {
  search.value = ''
  input.value?.$el.focus()
}
</script>

<template>
  <header class="toolbar">
    <h1 class="title">Trade Blotter</h1>
    <IconField class="search">
      <InputIcon>
        <SearchIcon />
      </InputIcon>
      <InputText
        ref="input"
        v-model="search"
        type="search"
        placeholder="Search symbol or side"
        aria-label="Search trades"
        size="small"
        fluid
      />
      <InputIcon v-if="search">
        <button type="button" class="clear" aria-label="Clear search" @click="clear">
          <TimesIcon />
        </button>
      </InputIcon>
    </IconField>
    <div class="actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: auto minmax(12rem, 22rem) 1fr auto;
  grid-template-areas: "title search . actions";
  align-items: center;
  gap: 1rem;
}

.title {
  grid-area: title;
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-surface-800);
}

.search {
  grid-area: search;
}

/* Our clear button replaces the browser's own. */
.search :deep(input::-webkit-search-cancel-button) {
  appearance: none;
}

.clear {
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

.clear:hover {
  color: var(--p-surface-700);
}

.actions {
  grid-area: actions;
  display: grid;
  grid-auto-flow: column;
  gap: 0.5rem;
}
</style>
