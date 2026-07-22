export const THEME_KEY: string
export function getTheme(): 'dark' | 'light'
export function setTheme(theme: 'dark' | 'light'): 'dark' | 'light'
export const bsc: Record<string, unknown>
export function cssVar(name: string): string
