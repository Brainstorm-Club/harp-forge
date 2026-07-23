<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()

function skipToContent() {
  const el = document.getElementById('contenuto')
  if (el) {
    el.focus()
    el.scrollIntoView()
  }
}
</script>

<template>
  <a class="bsc-skip" href="#contenuto" @click.prevent="skipToContent">Salta al contenuto</a>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink class="brand" to="/">
        <span class="bsc-brandmark" aria-hidden="true" />
        <span>harp<span class="brand__spark">·</span>forge</span>
        <span class="brand__tag">Brainstorm Club</span>
      </RouterLink>
      <span class="site-header__spacer" />
      <a class="bsc-pill bsc-pill--tool" href="https://www.brainstormclub.it" target="_blank" rel="noopener">brainstormclub.it</a>
      <button
        class="bsc-theme-toggle"
        type="button"
        :aria-label="theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
        @click="toggle"
      >
        <svg class="bsc-tt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
        <svg class="bsc-tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5" stroke-width="2" /><path stroke-linecap="round" stroke-width="2" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
      </button>
    </div>
  </header>

  <RouterView />

  <footer class="site-footer">
    <div class="site-footer__inner">
      Un progetto del <a href="https://www.brainstormclub.it" target="_blank" rel="noopener">Brainstorm Club</a>.
      Local-first, zero server. Design system BSC ·
      <a href="https://github.com/Brainstorm-Club/harp-forge" target="_blank" rel="noopener">codice su GitHub</a>.
    </div>
  </footer>
</template>
