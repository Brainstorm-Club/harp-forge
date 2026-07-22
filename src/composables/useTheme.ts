/**
 * Theme toggle — carbone (dark, default) ↔ carta (light).
 * Persists the choice in localStorage and reflects it on <html data-theme>.
 */
import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'
const STORAGE_KEY = 'harp-forge:theme'

function initial(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return 'dark' // carbone default
}

const theme = ref<Theme>(initial())

function apply(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
}
apply(theme.value)

watch(theme, (t) => {
  apply(t)
  localStorage.setItem(STORAGE_KEY, t)
})

export function useTheme() {
  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  return { theme, toggle }
}
