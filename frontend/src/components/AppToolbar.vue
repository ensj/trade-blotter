<script setup lang="ts">
import SearchIcon from '@primevue/icons/search'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'

const search = defineModel<string>('search', { required: true })
</script>

<template>
  <header class="toolbar">
    <h1 class="title">Trade Blotter</h1>
    <IconField class="search">
      <InputIcon>
        <SearchIcon />
      </InputIcon>
      <InputText
        v-model="search"
        type="search"
        placeholder="Search symbol or side"
        aria-label="Search trades"
        size="small"
        fluid
      />
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

.actions {
  grid-area: actions;
  display: grid;
  grid-auto-flow: column;
  gap: 0.5rem;
}
</style>
