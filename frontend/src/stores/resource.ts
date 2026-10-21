import { type Ref, ref } from 'vue'
import { errorMessage } from '../api/http'

// Shared loading/error state for a list fetched from the API.
export function useResource<T>(fetcher: () => Promise<T[]>) {
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<string | null>(null)
  let latest = 0

  async function load(): Promise<void> {
    const id = ++latest
    loading.value = true
    try {
      const result = await fetcher()
      if (id !== latest) return
      items.value = result
      error.value = null
    } catch (e) {
      if (id === latest) error.value = errorMessage(e)
    } finally {
      if (id === latest) loading.value = false
    }
  }

  return { items, loading, error, load }
}
