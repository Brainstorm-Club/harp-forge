import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// Hash history keeps deep links working on GitHub Pages without a 404 fallback.
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/scheda', name: 'sheet', component: () => import('@/views/SheetView.vue') },
  ],
})
