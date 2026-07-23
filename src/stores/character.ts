import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, Skill, StatKey, Profession } from '@/types/character'
import { STAT_KEYS } from '@/types/character'
import { harp40k } from '@/data/rulesets/harp40k'
import { createBlankSkills } from '@/data/sheetSkills'
import {
  statTotal,
  statDpIncome,
  skillTotal,
  skillDpSpent,
  dpBudgetStatus,
  savingThrows,
} from '@/engine/calculations'

const RULESET = harp40k

function nowIso(): string {
  return new Date().toISOString()
}

/** A fresh, empty HARP character (all stats at 50 → bonus 0). */
export function createEmptyCharacter(): Character {
  const stats = Object.fromEntries(
    STAT_KEYS.map((k) => [k, { value: 50, race: 0, spec: 0 }]),
  ) as Character['stats']['values']
  return {
    id: crypto.randomUUID(),
    meta: {
      schemaVersion: '1.0',
      app: 'harp-forge',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ruleset: RULESET.id,
    },
    identity: { name: '', race: '', professions: [{ name: '', level: 1 }] },
    stats: { values: stats },
    dp: { budget: 350 },
    skills: createBlankSkills(),
    implants: [],
    weapons: [],
    armour: [],
    counters: { fate: 0, insanity: 0, corruption: 0 },
  }
}

/** Maximum localStorage budget for the roster (5 MB). */
const MAX_STORAGE_BYTES = 5 * 1024 * 1024

export const useCharacterStore = defineStore(
  'character',
  () => {
    const character = ref<Character>(createEmptyCharacter())
    const roster = ref<Character[]>([])

    // ─── Derived (all via the pure engine) ──────────────────────────────────
    const statTotals = computed(() =>
      Object.fromEntries(
        STAT_KEYS.map((k) => [k, statTotal(character.value.stats.values, k)]),
      ) as Record<StatKey, number>,
    )
    const dpIncome = computed(() => statDpIncome(character.value.stats.values))
    const budget = computed(() => dpBudgetStatus(character.value, RULESET))
    const rr = computed(() => savingThrows(character.value))

    function skillTotalOf(skill: Skill): number {
      return skillTotal(skill, character.value.stats.values, RULESET)
    }
    function skillDpOf(skill: Skill): number {
      return skillDpSpent(skill, character.value.identity.professions, RULESET)
    }

    // ─── Roster CRUD ────────────────────────────────────────────────────────
    function newCharacter() {
      character.value = createEmptyCharacter()
    }

    function touch() {
      character.value.meta.updatedAt = nowIso()
    }

    function save() {
      touch()
      const copy: Character = JSON.parse(JSON.stringify(character.value))
      const idx = roster.value.findIndex((c) => c.id === copy.id)
      const tentative =
        idx >= 0
          ? [...roster.value.slice(0, idx), copy, ...roster.value.slice(idx + 1)]
          : [...roster.value, copy]
      if (new Blob([JSON.stringify(tentative)]).size > MAX_STORAGE_BYTES) {
        throw new Error('STORAGE_LIMIT_EXCEEDED')
      }
      if (idx >= 0) roster.value[idx] = copy
      else roster.value.push(copy)
    }

    function load(id: string) {
      const found = roster.value.find((c) => c.id === id)
      if (found) character.value = JSON.parse(JSON.stringify(found))
    }

    function remove(id: string) {
      roster.value = roster.value.filter((c) => c.id !== id)
    }

    // ─── Skills & professions helpers ───────────────────────────────────────
    function addSkill(skill: Skill) {
      if (character.value.skills.some((s) => s.id === skill.id)) return
      character.value.skills.push(skill)
    }
    function removeSkill(id: string) {
      character.value.skills = character.value.skills.filter((s) => s.id !== id)
    }
    function addProfession(p: Profession = { name: '', level: 1 }) {
      character.value.identity.professions.push(p)
    }
    function removeProfession(index: number) {
      character.value.identity.professions.splice(index, 1)
    }

    // ─── Portability ────────────────────────────────────────────────────────
    function exportJson(): string {
      return JSON.stringify(character.value, null, 2)
    }

    /** Validate + import a character JSON. Throws Error('...') on failure. */
    function importJson(json: string): Character {
      let raw: unknown
      try {
        raw = JSON.parse(json)
      } catch {
        throw new Error('JSON_PARSE_ERROR')
      }
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw new Error('JSON_NOT_OBJECT')
      }
      const r = raw as Record<string, unknown>

      // Stats: accept the canonical { values: {...} }.
      const statsObj = (r.stats as { values?: unknown })?.values
      if (!statsObj || typeof statsObj !== 'object') throw new Error('MISSING_STATS')
      for (const k of STAT_KEYS) {
        const s = (statsObj as Record<string, unknown>)[k] as { value?: unknown } | undefined
        if (!s || typeof s.value !== 'number') throw new Error(`INVALID_STAT_${k}`)
      }
      if (!Array.isArray(r.skills)) throw new Error('INVALID_SKILLS')

      const empty = createEmptyCharacter()
      const data: Character = {
        ...empty,
        ...(r as Partial<Character>),
        id: typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID(),
        meta: { ...empty.meta, ...(r.meta as object) },
      }
      // Tutte le abilità del foglio sempre presenti (le mancanti → ranks 0), in
      // ordine di foglio; le skill importate mantengono i loro valori, le eventuali
      // skill personalizzate (fuori foglio) restano in coda.
      const imported = Array.isArray(data.skills) ? data.skills : []
      const importedById = new Map(imported.map((s) => [s.id, s]))
      const merged: Skill[] = createBlankSkills().map((b) => importedById.get(b.id) ?? b)
      for (const s of imported) {
        if (!merged.some((m) => m.id === s.id)) merged.push(s)
      }
      data.skills = merged
      character.value = data
      return data
    }

    return {
      character,
      roster,
      statTotals,
      dpIncome,
      budget,
      rr,
      ruleset: RULESET,
      skillTotalOf,
      skillDpOf,
      newCharacter,
      save,
      load,
      remove,
      addSkill,
      removeSkill,
      addProfession,
      removeProfession,
      exportJson,
      importJson,
    }
  },
  {
    persist: { pick: ['roster'] },
  },
)
