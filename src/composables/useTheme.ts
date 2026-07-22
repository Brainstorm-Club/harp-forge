/**
 * Theme toggle — thin Vue wrapper over the Brainstorm Club Design System's
 * unified theme module (src/design-system/theme.js). The theme preference is
 * shared across ALL club apps via the localStorage key `bsc-theme`, and changes
 * broadcast a `bsc:themechange` event. carbone (dark) is the default.
 */
import { ref } from 'vue'
import { getTheme, setTheme } from '@/design-system/theme.js'

export type Theme = 'dark' | 'light'

const theme = ref<Theme>(getTheme())

if (typeof document !== 'undefined') {
  document.addEventListener('bsc:themechange', (e) => {
    theme.value = (e as CustomEvent<{ theme: Theme }>).detail.theme
  })
  // Re-affirm the persisted/default theme on load (also fires the event).
  setTheme(theme.value)
}

export function useTheme() {
  const toggle = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}
