<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink class="brand" to="/">
        <span class="brand__mark">harp<span class="brand__spark">·</span>forge</span>
        <span class="brand__tag">Brainstorm Club</span>
      </RouterLink>
      <span class="site-header__spacer" />
      <a class="hint" href="https://www.brainstormclub.it" target="_blank" rel="noopener">brainstormclub.it ↗</a>
      <button
        class="btn btn--ghost"
        type="button"
        :aria-label="theme === 'dark' ? 'Passa al tema chiaro (carta)' : 'Passa al tema scuro (carbone)'"
        @click="toggle"
      >
        {{ theme === 'dark' ? '☾ carbone' : '☀ carta' }}
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
