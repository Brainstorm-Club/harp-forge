import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore, createEmptyCharacter } from './character'
import { ula500 } from '@/fixtures'
import { STAT_KEYS } from '@/types/character'

beforeEach(() => setActivePinia(createPinia()))

describe('createEmptyCharacter', () => {
  it('has 8 stats at 50, one profession, a budget and an id', () => {
    const c = createEmptyCharacter()
    expect(Object.keys(c.stats.values).sort()).toEqual([...STAT_KEYS].sort())
    expect(STAT_KEYS.every((k) => c.stats.values[k].value === 50)).toBe(true)
    expect(c.identity.professions).toHaveLength(1)
    expect(c.dp.budget).toBe(350)
    expect(typeof c.id).toBe('string')
  })

  it('seeds all sheet skills at rank 0', () => {
    const c = createEmptyCharacter()
    expect(c.skills.length).toBeGreaterThanOrEqual(48)
    expect(c.skills.every((sk) => sk.ranks === 0)).toBe(true)
    expect(c.skills.some((sk) => sk.id === 'endurance')).toBe(true)
  })
})

describe('importJson fills the sheet', () => {
  it('adds missing sheet skills at rank 0 and keeps imported values', () => {
    const s = useCharacterStore()
    const json = JSON.stringify({
      stats: { values: Object.fromEntries(STAT_KEYS.map((k) => [k, { value: 50, race: 0, spec: 0 }])) },
      skills: [{ id: 'endurance', category: 'fisiche', name: 'Endurance', stats: ['Co', 'Sd'], ranks: 8, cost: 2 }],
    })
    s.importJson(json)
    expect(s.character.skills.length).toBeGreaterThanOrEqual(48)
    expect(s.character.skills.find((sk) => sk.id === 'endurance')?.ranks).toBe(8) // importato
    expect(s.character.skills.find((sk) => sk.id === 'correre')?.ranks).toBe(0)   // mancante → 0
  })
})

describe('roster CRUD', () => {
  it('save inserts, then updates in place; load restores; remove deletes', () => {
    const s = useCharacterStore()
    s.character.identity.name = 'Alpha'
    s.save()
    expect(s.roster).toHaveLength(1)

    s.character.identity.name = 'Alpha 2'
    s.save() // same id → update in place
    expect(s.roster).toHaveLength(1)
    expect(s.roster[0]!.identity.name).toBe('Alpha 2')

    const id = s.character.id
    s.newCharacter()
    expect(s.character.identity.name).toBe('')
    s.load(id)
    expect(s.character.identity.name).toBe('Alpha 2')

    s.remove(id)
    expect(s.roster).toHaveLength(0)
  })
})

describe('derived values via engine', () => {
  it('reproduces Ula500 after import (362 spent, PSI 22, In total 11)', () => {
    const s = useCharacterStore()
    s.importJson(JSON.stringify(ula500))
    expect(s.budget.spent).toBe(362)
    expect(s.budget.over).toBe(true)
    expect(s.rr.psi).toBe(22)
    expect(s.statTotals.In).toBe(11)
    expect(s.dpIncome).toBe(48)
  })
})

describe('importJson validation', () => {
  it('rejects non-JSON', () => {
    const s = useCharacterStore()
    expect(() => s.importJson('not json')).toThrow('JSON_PARSE_ERROR')
  })
  it('rejects missing stats', () => {
    const s = useCharacterStore()
    expect(() => s.importJson('{"skills":[]}')).toThrow('MISSING_STATS')
  })
  it('assigns a fresh id when missing', () => {
    const s = useCharacterStore()
    const json = JSON.stringify({ ...ula500, id: undefined })
    const c = s.importJson(json)
    expect(typeof c.id).toBe('string')
    expect(c.id.length).toBeGreaterThan(0)
  })
})

describe('skill & profession helpers', () => {
  it('adds/removes skills without duplicates', () => {
    const s = useCharacterStore()
    const base = s.character.skills.length // il foglio parte con tutte le abilità
    const skill = { id: 'x', category: 'mentali', name: 'X', stats: ['Re', 'In'] as ['Re', 'In'], ranks: 1, cost: 4 }
    s.addSkill(skill)
    s.addSkill(skill) // duplicate ignored
    expect(s.character.skills).toHaveLength(base + 1)
    s.removeSkill('x')
    expect(s.character.skills).toHaveLength(base)
  })
  it('adds/removes professions', () => {
    const s = useCharacterStore()
    s.addProfession({ name: 'Warrior', level: 3 })
    expect(s.character.identity.professions).toHaveLength(2)
    s.removeProfession(0)
    expect(s.character.identity.professions[0]!.name).toBe('Warrior')
  })
})
