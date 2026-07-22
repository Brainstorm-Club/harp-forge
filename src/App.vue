<script setup lang="ts">
import { computed, ref } from 'vue'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'
import { STAT_KEYS } from '@/types/character'
import { statBonus } from '@/engine/statBonus'
import { statTotal, statDpIncome, skillTotal, skillDpSpent, dpBudgetStatus, savingThrows } from '@/engine/calculations'
import { usePdfExport } from '@/composables/usePdfExport'
import { useTheme } from '@/composables/useTheme'

// Smoke-test view: the whole sheet is derived live from the engine.
const c = ula500
const rs = harp40k

const { theme, toggle } = useTheme()
const { exportPdf } = usePdfExport()

const statRows = computed(() =>
  STAT_KEYS.map((k) => ({
    key: k,
    value: c.stats.values[k].value,
    bon: statBonus(c.stats.values[k].value),
    race: c.stats.values[k].race,
    spec: c.stats.values[k].spec,
    total: statTotal(c.stats.values, k),
    dp: Math.max(0, statBonus(c.stats.values[k].value)),
  })),
)

const skillRows = computed(() =>
  c.skills.map((s) => ({
    name: s.name,
    ranks: s.ranks,
    total: skillTotal(s, c.stats.values, rs),
    dp: skillDpSpent(s, c.identity.professions, rs),
  })),
)

const dpIncome = computed(() => statDpIncome(c.stats.values))
const budget = computed(() => dpBudgetStatus(c, rs))
const rr = computed(() => savingThrows(c))

const exporting = ref(false)
const exportMsg = ref('')

async function onExport() {
  exporting.value = true
  exportMsg.value = ''
  try {
    const { unmatched } = await exportPdf(c, rs)
    exportMsg.value = unmatched.length
      ? `PDF esportato. Skill senza slot nel template: ${unmatched.join(', ')}`
      : 'PDF esportato ✓'
  } catch (e) {
    exportMsg.value = `Errore export: ${(e as Error).message}`
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <a class="brand" href="https://www.brainstormclub.it" target="_blank" rel="noopener">
        <span class="brand__mark">harp<span class="brand__spark">·</span>forge</span>
        <span class="brand__tag">Brainstorm Club</span>
      </a>
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

  <main class="wrap">
    <h1>Character builder HARP</h1>
    <p class="sub">
      Motore di calcolo live. Anteprima: <strong>{{ c.identity.name }}</strong>
      · {{ c.identity.professions.map((p) => `${p.name} L${p.level}`).join(' / ') }}
      · ruleset <span class="badge">{{ rs.id }}</span>
    </p>

    <div class="toolbar">
      <button class="btn" type="button" :disabled="exporting" @click="onExport">
        {{ exporting ? 'Esporto…' : '⤓ Esporta PDF' }}
      </button>
      <span class="hint">Compila il template HARP italiano già pronto (AcroForm editabile).</span>
    </div>
    <p v-if="exportMsg" class="hint" role="status">{{ exportMsg }}</p>

    <h2>Statistiche · DP da stat: <span class="total">{{ dpIncome }}</span></h2>
    <table>
      <thead>
        <tr>
          <th>Stat</th>
          <th class="num">Valore</th>
          <th class="num">Bon</th>
          <th class="num">Race</th>
          <th class="num">Spec</th>
          <th class="num">Totale</th>
          <th class="num">DP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in statRows" :key="r.key">
          <td>{{ r.key }}</td>
          <td class="num">{{ r.value }}</td>
          <td class="num">{{ r.bon }}</td>
          <td class="num">{{ r.race || '' }}</td>
          <td class="num">{{ r.spec || '' }}</td>
          <td class="num total">{{ r.total }}</td>
          <td class="num">{{ r.dp }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Tiri Salvezza</h2>
    <p class="sub">
      Tempra <span class="total">{{ rr.tempra }}</span> ·
      Volontà <span class="total">{{ rr.volonta }}</span> ·
      PSI <span class="total">{{ rr.psi }}</span>
    </p>

    <h2>
      Abilità · DP spesi: <span class="total">{{ budget.spent }}</span> / {{ budget.budget }}
      <span v-if="!budget.over" class="ok">✓ nel budget</span>
      <span v-else class="badge badge--over">sforamento {{ Math.abs(budget.remaining ?? 0) }}</span>
    </h2>
    <table>
      <thead>
        <tr>
          <th>Abilità</th>
          <th class="num">Rank</th>
          <th class="num">Totale</th>
          <th class="num">DP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in skillRows" :key="r.name">
          <td>{{ r.name }}</td>
          <td class="num">{{ r.ranks }}</td>
          <td class="num total">{{ r.total }}</td>
          <td class="num">{{ r.dp }}</td>
        </tr>
      </tbody>
    </table>
  </main>

  <footer class="site-footer">
    <div class="site-footer__inner">
      Un progetto del <a href="https://www.brainstormclub.it" target="_blank" rel="noopener">Brainstorm Club</a>.
      Local-first, zero server. Design system BSC ·
      <a href="https://github.com/Brainstorm-Club/harp-forge" target="_blank" rel="noopener">codice su GitHub</a>.
    </div>
  </footer>
</template>
