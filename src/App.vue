<script setup lang="ts">
import { computed } from 'vue'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'
import { STAT_KEYS } from '@/types/character'
import {
  statBonus,
} from '@/engine/statBonus'
import {
  statTotal,
  statDpIncome,
  skillTotal,
  skillDpSpent,
  dpBudgetStatus,
} from '@/engine/calculations'

// Smoke-test view: the whole sheet is derived live from the engine.
const c = ula500
const rs = harp40k

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
</script>

<template>
  <div class="wrap">
    <h1>HARP Forge</h1>
    <p class="sub">
      Character builder — motore di calcolo live. Anteprima:
      <strong>{{ c.identity.name }}</strong>
      · {{ c.identity.professions.map((p) => `${p.name} L${p.level}`).join(' / ') }}
      · ruleset <span class="badge">{{ rs.id }}</span>
    </p>

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

    <h2>
      Abilità · DP spesi: <span class="total">{{ budget.spent }}</span> /
      {{ budget.budget }}
      <span v-if="!budget.over" class="ok">✓ nel budget</span>
      <span v-else class="badge">sforamento</span>
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
  </div>
</template>
