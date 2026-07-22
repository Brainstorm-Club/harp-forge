import { describe, it, expect } from 'vitest'
import { archetypes, tableCharacters } from './archetypes'
import { harp40k } from './rulesets/harp40k'
import { dpBudgetStatus, skillTotal } from '@/engine/calculations'
import { STAT_KEYS } from '@/types/character'

describe('Rogue Trader archetypes', () => {
  it('there are 6 distinct archetypes with unique ids', () => {
    expect(archetypes).toHaveLength(6)
    expect(new Set(archetypes.map((a) => a.id)).size).toBe(6)
  })

  for (const a of archetypes) {
    describe(a.name, () => {
      const c = a.character
      it('has identity, role, ≥12 skills and 8 stats', () => {
        expect(c.identity.name).toBeTruthy()
        expect(c.identity.role).toBeTruthy()
        expect(c.skills.length).toBeGreaterThanOrEqual(12)
        expect(STAT_KEYS.every((k) => typeof c.stats.values[k].value === 'number')).toBe(true)
      })

      it('every skill total is a finite number', () => {
        for (const s of c.skills) {
          expect(Number.isFinite(skillTotal(s, c.stats.values, harp40k))).toBe(true)
        }
      })

      it('DP spent is within the 350 budget (no accidental over-spend)', () => {
        const status = dpBudgetStatus(c, harp40k)
        expect(status.unresolved).toEqual([])
        expect(status.spent).toBeGreaterThan(150)
        expect(status.spent).toBeLessThanOrEqual(350)
      })
    })
  }
})

describe('Personaggi reali del tavolo (ula, jen, sid64)', () => {
  it('there are 3, with unique ids', () => {
    expect(tableCharacters).toHaveLength(3)
    expect(tableCharacters.map((c) => c.id).sort()).toEqual(['real-jen', 'real-sid64', 'real-ula'])
  })

  for (const a of tableCharacters) {
    describe(a.name, () => {
      const c = a.character
      it('is engine-valid: name, ≥12 skills, unique skill ids, finite totals', () => {
        expect(c.identity.name).toBeTruthy()
        expect(c.skills.length).toBeGreaterThanOrEqual(12)
        expect(new Set(c.skills.map((s) => s.id)).size).toBe(c.skills.length)
        for (const s of c.skills) {
          expect(Number.isFinite(skillTotal(s, c.stats.values, harp40k))).toBe(true)
          expect(STAT_KEYS.includes(s.stats[0])).toBe(true)
          expect(STAT_KEYS.includes(s.stats[1])).toBe(true)
        }
      })
      it('computes a positive DP spend', () => {
        expect(dpBudgetStatus(c, harp40k).spent).toBeGreaterThan(0)
      })
    })
  }
})
