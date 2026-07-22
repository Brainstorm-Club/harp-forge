<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { STAT_KEYS } from '@/types/character'
import type { Skill, SpecBonus } from '@/types/character'
import { statBonus } from '@/engine/statBonus'
import { skillStatBonus, skillRankBonus } from '@/engine/calculations'
import { usePdfExport } from '@/composables/usePdfExport'

const store = useCharacterStore()
const { character, budget, rr, dpIncome, statTotals } = storeToRefs(store)
const router = useRouter()
const { exportPdf } = usePdfExport()

const msg = ref('')
const exporting = ref(false)

function save() {
  store.save()
  msg.value = 'Scheda salvata ✓'
}

async function onExportPdf() {
  exporting.value = true
  msg.value = ''
  try {
    const { unmatched } = await exportPdf(character.value, store.ruleset)
    msg.value = unmatched.length
      ? `PDF esportato. Skill senza slot: ${unmatched.join(', ')}`
      : 'PDF esportato ✓'
  } catch (e) {
    msg.value = `Errore export: ${(e as Error).message}`
  } finally {
    exporting.value = false
  }
}

function exportJson() {
  const blob = new Blob([store.exportJson()], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(character.value.identity.name || 'scheda').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

// Edit a skill's spec as a single number (sum → single entry).
function specOf(s: Skill): number {
  return (s.spec ?? []).reduce((a, b) => a + b.value, 0)
}
function setSpec(s: Skill, value: number) {
  s.spec = value ? ([{ value }] as SpecBonus[]) : []
}

function addSkill() {
  store.addSkill({
    id: crypto.randomUUID(),
    category: '',
    name: 'Nuova abilità',
    stats: ['Re', 'In'],
    ranks: 0,
    cost: 4,
    spec: [],
  })
}

const statOptions = STAT_KEYS
const counters = computed(() => character.value.counters)
</script>

<template>
  <main id="contenuto" class="wrap" tabindex="-1">
    <div class="toolbar">
      <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" @click="router.push('/')">← Roster</button>
      <button class="bsc-btn bsc-btn--sm" type="button" @click="save">💾 Salva</button>
      <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" :disabled="exporting" @click="onExportPdf">
        {{ exporting ? 'Esporto…' : '⤓ PDF' }}
      </button>
      <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" @click="exportJson">⤓ JSON</button>
      <span v-if="msg" class="hint" role="status">{{ msg }}</span>
    </div>

    <!-- Identità -->
    <h2>Identità</h2>
    <div class="grid2">
      <label class="field">Nome<input class="bsc-input" v-model="character.identity.name" type="text" /></label>
      <label class="field">Razza<input class="bsc-input" v-model="character.identity.race" type="text" /></label>
      <label class="field">Origine<input class="bsc-input" v-model="character.identity.origin" type="text" /></label>
      <label class="field">Ruolo (40K)<input class="bsc-input" v-model="character.identity.role" type="text" /></label>
    </div>

    <h3 class="mini">Professioni</h3>
    <div v-for="(p, i) in character.identity.professions" :key="i" class="prof-row">
      <input class="bsc-input" v-model="p.name" type="text" placeholder="Professione" aria-label="Nome professione" />
      <input class="bsc-input w-lvl" v-model.number="p.level" type="number" min="1" aria-label="Livello professione" />
      <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" aria-label="Rimuovi professione" @click="store.removeProfession(i)">✕</button>
    </div>
    <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" @click="store.addProfession()">＋ Professione</button>

    <div class="grid2">
      <label class="field span2">Descrizione<textarea class="bsc-input" v-model="character.identity.description" rows="3" /></label>
      <label class="field span2">Storia<textarea class="bsc-input" v-model="character.identity.history" rows="3" /></label>
    </div>

    <!-- DP budget -->
    <h2>
      Budget DP: <span class="total">{{ budget.spent }}</span> /
      <input class="bsc-input w-lvl" v-model.number="character.dp.budget" type="number" aria-label="Budget DP" />
      <span v-if="!budget.over" class="bsc-badge bsc-badge--ok">✓ nel budget</span>
      <span v-else class="bsc-badge bsc-badge--flag">sforamento {{ Math.abs(budget.remaining ?? 0) }}</span>
      · DP da stat {{ dpIncome }}
    </h2>
    <div
      class="dpbar"
      role="progressbar"
      :aria-valuenow="budget.spent"
      aria-valuemin="0"
      :aria-valuemax="budget.budget ?? undefined"
      :aria-label="`DP spesi ${budget.spent} su ${budget.budget}`"
    >
      <div class="dpbar__fill" :class="{ over: budget.over }" :style="{ width: Math.min(100, (budget.spent / (budget.budget || 1)) * 100) + '%' }" />
    </div>

    <!-- Stats -->
    <h2>Statistiche</h2>
    <table class="bsc-table">
      <thead>
        <tr><th scope="col">Stat</th><th scope="col" class="bsc-num">Valore</th><th scope="col" class="bsc-num">Bon</th><th scope="col" class="bsc-num">Race</th><th scope="col" class="bsc-num">Spec</th><th scope="col" class="bsc-num">Totale</th><th scope="col" class="bsc-num">DP</th></tr>
      </thead>
      <tbody>
        <tr v-for="k in statOptions" :key="k">
          <td>{{ k }}</td>
          <td class="bsc-num"><input class="bsc-input w-num" v-model.number="character.stats.values[k].value" type="number" :aria-label="`${k} valore`" /></td>
          <td class="bsc-num">{{ statBonus(character.stats.values[k].value) }}</td>
          <td class="bsc-num"><input class="bsc-input w-num" v-model.number="character.stats.values[k].race" type="number" :aria-label="`${k} modificatore razza`" /></td>
          <td class="bsc-num"><input class="bsc-input w-num" v-model.number="character.stats.values[k].spec" type="number" :aria-label="`${k} modificatore speciale`" /></td>
          <td class="bsc-num total">{{ statTotals[k] }}</td>
          <td class="bsc-num">{{ Math.max(0, statBonus(character.stats.values[k].value)) }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Tiri Salvezza</h2>
    <p class="sub">Tempra <span class="total">{{ rr.tempra }}</span> · Volontà <span class="total">{{ rr.volonta }}</span> · PSI <span class="total">{{ rr.psi }}</span></p>

    <!-- Skills -->
    <h2>Abilità · {{ character.skills.length }}</h2>
    <div class="bsc-table-scroll" tabindex="0" role="region" aria-label="Tabella abilità, scorrevole orizzontalmente">
      <table class="bsc-table">
        <thead>
          <tr><th scope="col">Nome</th><th scope="col">Cat.</th><th scope="col">Stat 1</th><th scope="col">Stat 2</th><th scope="col" class="bsc-num">Rank</th><th scope="col" class="bsc-num">Cost</th><th scope="col" class="bsc-num">Spec</th><th scope="col" class="bsc-num">Rank+</th><th scope="col" class="bsc-num">Stat+</th><th scope="col" class="bsc-num">Totale</th><th scope="col" class="bsc-num">DP</th><th scope="col"><span class="sr-only">Azioni</span></th></tr>
        </thead>
        <tbody>
          <tr v-for="s in character.skills" :key="s.id">
            <td><input class="bsc-input w-name" v-model="s.name" type="text" aria-label="Nome abilità" /></td>
            <td><input class="bsc-input w-cat" v-model="s.category" type="text" :aria-label="`Categoria di ${s.name}`" /></td>
            <td><select class="bsc-select w-sel" v-model="s.stats[0]" :aria-label="`Prima statistica di ${s.name}`"><option v-for="o in statOptions" :key="o" :value="o">{{ o }}</option></select></td>
            <td><select class="bsc-select w-sel" v-model="s.stats[1]" :aria-label="`Seconda statistica di ${s.name}`"><option v-for="o in statOptions" :key="o" :value="o">{{ o }}</option></select></td>
            <td class="bsc-num"><input class="bsc-input w-num" v-model.number="s.ranks" type="number" min="0" :aria-label="`Rank di ${s.name}`" /></td>
            <td class="bsc-num"><input class="bsc-input w-num" v-model.number="s.cost" type="number" min="0" :aria-label="`Costo di ${s.name}`" /></td>
            <td class="bsc-num"><input class="bsc-input w-num" :value="specOf(s)" type="number" :aria-label="`Spec di ${s.name}`" @input="setSpec(s, Number(($event.target as HTMLInputElement).value))" /></td>
            <td class="bsc-num">{{ skillRankBonus(s.ranks, store.ruleset) }}</td>
            <td class="bsc-num">{{ skillStatBonus(s, character.stats.values) }}</td>
            <td class="bsc-num total">{{ store.skillTotalOf(s) }}</td>
            <td class="bsc-num">{{ store.skillDpOf(s) }}</td>
            <td><button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" :aria-label="`Rimuovi ${s.name}`" @click="store.removeSkill(s.id)">✕</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="bsc-btn bsc-btn--outline bsc-btn--sm" type="button" @click="addSkill">＋ Abilità</button>

    <!-- Counters -->
    <h2>Contatori</h2>
    <div class="grid2">
      <label class="field">Punti Fato<input class="bsc-input" v-model.number="counters.fate" type="number" /></label>
      <label class="field">Punti Follia<input class="bsc-input" v-model.number="counters.insanity" type="number" /></label>
      <label class="field">Punti Corruzione<input class="bsc-input" v-model.number="counters.corruption" type="number" /></label>
    </div>
  </main>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--bsc-space-1); font-family: var(--bsc-font-mono); font-size: var(--bsc-text-sm); color: var(--bsc-text-muted); }
textarea.bsc-input { resize: vertical; }
/* Compact form controls inside the dense skill/stat tables */
.bsc-table .bsc-input,
.bsc-table .bsc-select { padding-block: var(--bsc-space-1); }
.w-sel { width: 4.6rem; min-width: 4.6rem; padding-right: var(--bsc-space-5); }
</style>
