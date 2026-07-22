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
  <main class="wrap">
    <div class="toolbar">
      <button class="btn btn--ghost" type="button" @click="router.push('/')">← Roster</button>
      <button class="btn" type="button" @click="save">💾 Salva</button>
      <button class="btn btn--ghost" type="button" :disabled="exporting" @click="onExportPdf">
        {{ exporting ? 'Esporto…' : '⤓ PDF' }}
      </button>
      <button class="btn btn--ghost" type="button" @click="exportJson">⤓ JSON</button>
      <span v-if="msg" class="hint" role="status">{{ msg }}</span>
    </div>

    <!-- Identità -->
    <h2>Identità</h2>
    <div class="grid2">
      <label>Nome<input v-model="character.identity.name" type="text" /></label>
      <label>Razza<input v-model="character.identity.race" type="text" /></label>
      <label>Origine<input v-model="character.identity.origin" type="text" /></label>
      <label>Ruolo (40K)<input v-model="character.identity.role" type="text" /></label>
    </div>

    <h3 class="mini">Professioni</h3>
    <div v-for="(p, i) in character.identity.professions" :key="i" class="prof-row">
      <input v-model="p.name" type="text" placeholder="Professione" />
      <input v-model.number="p.level" type="number" min="1" class="w-lvl" aria-label="Livello" />
      <button class="btn btn--ghost btn--sm" type="button" @click="store.removeProfession(i)">✕</button>
    </div>
    <button class="btn btn--ghost btn--sm" type="button" @click="store.addProfession()">＋ Professione</button>

    <div class="grid2">
      <label class="span2">Descrizione<textarea v-model="character.identity.description" rows="3" /></label>
      <label class="span2">Storia<textarea v-model="character.identity.history" rows="3" /></label>
    </div>

    <!-- DP budget -->
    <h2>
      Budget DP: <span class="total">{{ budget.spent }}</span> /
      <input v-model.number="character.dp.budget" type="number" class="w-lvl" aria-label="Budget DP" />
      <span v-if="!budget.over" class="ok">✓</span>
      <span v-else class="badge badge--over">sforamento {{ Math.abs(budget.remaining ?? 0) }}</span>
      · DP da stat {{ dpIncome }}
    </h2>
    <div class="dpbar"><div class="dpbar__fill" :class="{ over: budget.over }" :style="{ width: Math.min(100, (budget.spent / (budget.budget || 1)) * 100) + '%' }" /></div>

    <!-- Stats -->
    <h2>Statistiche</h2>
    <table>
      <thead>
        <tr><th>Stat</th><th class="num">Valore</th><th class="num">Bon</th><th class="num">Race</th><th class="num">Spec</th><th class="num">Totale</th><th class="num">DP</th></tr>
      </thead>
      <tbody>
        <tr v-for="k in statOptions" :key="k">
          <td>{{ k }}</td>
          <td class="num"><input v-model.number="character.stats.values[k].value" type="number" class="w-num" /></td>
          <td class="num">{{ statBonus(character.stats.values[k].value) }}</td>
          <td class="num"><input v-model.number="character.stats.values[k].race" type="number" class="w-num" /></td>
          <td class="num"><input v-model.number="character.stats.values[k].spec" type="number" class="w-num" /></td>
          <td class="num total">{{ statTotals[k] }}</td>
          <td class="num">{{ Math.max(0, statBonus(character.stats.values[k].value)) }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Tiri Salvezza</h2>
    <p class="sub">Tempra <span class="total">{{ rr.tempra }}</span> · Volontà <span class="total">{{ rr.volonta }}</span> · PSI <span class="total">{{ rr.psi }}</span></p>

    <!-- Skills -->
    <h2>Abilità · {{ character.skills.length }}</h2>
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th>Nome</th><th>Cat.</th><th>Stat 1</th><th>Stat 2</th><th class="num">Rank</th><th class="num">Cost</th><th class="num">Spec</th><th class="num">Rank+</th><th class="num">Stat+</th><th class="num">Totale</th><th class="num">DP</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="s in character.skills" :key="s.id">
            <td><input v-model="s.name" type="text" class="w-name" /></td>
            <td><input v-model="s.category" type="text" class="w-cat" /></td>
            <td><select v-model="s.stats[0]"><option v-for="o in statOptions" :key="o" :value="o">{{ o }}</option></select></td>
            <td><select v-model="s.stats[1]"><option v-for="o in statOptions" :key="o" :value="o">{{ o }}</option></select></td>
            <td class="num"><input v-model.number="s.ranks" type="number" min="0" class="w-num" /></td>
            <td class="num"><input v-model.number="s.cost" type="number" min="0" class="w-num" /></td>
            <td class="num"><input :value="specOf(s)" type="number" class="w-num" @input="setSpec(s, Number(($event.target as HTMLInputElement).value))" /></td>
            <td class="num">{{ skillRankBonus(s.ranks, store.ruleset) }}</td>
            <td class="num">{{ skillStatBonus(s, character.stats.values) }}</td>
            <td class="num total">{{ store.skillTotalOf(s) }}</td>
            <td class="num">{{ store.skillDpOf(s) }}</td>
            <td><button class="btn btn--ghost btn--sm" type="button" @click="store.removeSkill(s.id)">✕</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn btn--ghost btn--sm" type="button" @click="addSkill">＋ Abilità</button>

    <!-- Counters -->
    <h2>Contatori</h2>
    <div class="grid2">
      <label>Punti Fato<input v-model.number="counters.fate" type="number" /></label>
      <label>Punti Follia<input v-model.number="counters.insanity" type="number" /></label>
      <label>Punti Corruzione<input v-model.number="counters.corruption" type="number" /></label>
    </div>
  </main>
</template>

<style scoped>
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 1rem; margin: 0.5rem 0 1rem; }
.grid2 .span2 { grid-column: 1 / -1; }
label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.82rem; color: var(--muted); }
input, textarea, select {
  font: inherit;
  background: var(--panel);
  color: var(--ink);
  border: 1px solid var(--line-strong);
  border-radius: 5px;
  padding: 0.3rem 0.45rem;
}
textarea { resize: vertical; }
.mini { font-family: var(--font-display); font-size: 0.9rem; color: var(--muted); margin: 0.5rem 0 0.3rem; }
.prof-row { display: flex; gap: 0.4rem; margin-bottom: 0.4rem; }
.prof-row input:first-child { flex: 1; }
.w-lvl { width: 4.5rem; }
.w-num { width: 4rem; text-align: right; }
.w-name { width: 11rem; }
.w-cat { width: 8rem; }
.btn--sm { padding: 0.25rem 0.55rem; font-size: 0.8rem; }
.table-scroll { overflow-x: auto; }
.dpbar { height: 8px; background: var(--panel-2); border-radius: 999px; overflow: hidden; margin: 0.3rem 0 1rem; }
.dpbar__fill { height: 100%; background: var(--bsc-success); }
.dpbar__fill.over { background: var(--accent); }
</style>
