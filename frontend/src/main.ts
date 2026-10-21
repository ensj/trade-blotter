import { AllCommunityModule, enableDevValidations, ModuleRegistry } from 'ag-grid-community'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import App from './App.vue'
import { primePreset } from './theme'
import './styles.css'

ModuleRegistry.registerModules([AllCommunityModule])
if (import.meta.env.DEV) {
  enableDevValidations()
}

createApp(App)
  .use(createPinia())
  .use(PrimeVue, {
    theme: { preset: primePreset, options: { darkModeSelector: 'none' } },
    license: import.meta.env.VITE_PRIMEUI_LICENSE,
  })
  .use(ToastService)
  .mount('#app')
