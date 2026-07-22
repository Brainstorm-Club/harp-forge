import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves the built app from /docs; `base` must match the repo
// name so asset URLs resolve at https://<org>.github.io/harp-forge/.
export default defineConfig({
  plugins: [vue()],
  base: '/harp-forge/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'docs',
  },
})
