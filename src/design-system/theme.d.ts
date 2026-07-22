// Tipi per il modulo unificato del tema del design system (theme.js / tokens.js).
export const THEME_KEY: string
export function getTheme(): 'dark' | 'light'
export function setTheme(theme: 'dark' | 'light'): 'dark' | 'light'
export function toggleTheme(): 'dark' | 'light'
export function initTheme(): void
export default initTheme
