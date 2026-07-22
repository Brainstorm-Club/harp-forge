/**
 * Acceptance tests — the mandatory contract from CLAUDE.md ("Test di accettazione").
 * These mirror that table 1:1. If a refactor breaks one, the refactor is wrong.
 */
import { describe, it, expect } from 'vitest'
import { statTotal, skillStatBonus, skillTotal, skillDpSpent, dpBudgetStatus, savingThrows } from './calculations'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'
import type { Skill } from '@/types/character'

const stats = ula500.stats.values

const skill = (id: string): Skill => {
  const s = ula500.skills.find((x) => x.id === id)
  if (!s) throw new Error(`fixture skill not found: ${id}`)
  return s
}

describe('CLAUDE.md acceptance table (Pal Ula500)', () => {
  it('Bonus totale Re (95, spec +3) = 12', () => {
    expect(statTotal(stats, 'Re')).toBe(12)
  })

  it('Bonus totale In (94, spec +2) = 11', () => {
    expect(statTotal(stats, 'In')).toBe(11)
  })

  it('Bonus totale Pr (20) = -6', () => {
    expect(statTotal(stats, 'Pr')).toBe(-6)
  })

  it('Combo Re/In = 23', () => {
    expect(skillStatBonus(skill('uso-tecnologia'), stats)).toBe(23)
  })

  it('Uso Tecnologia (7 rank, cost 2, spec +15) → totale 73, DP 14', () => {
    const s = skill('uso-tecnologia')
    expect(skillTotal(s, stats, harp40k)).toBe(73)
    expect(skillDpSpent(s, ula500.identity.professions, harp40k)).toBe(14)
  })

  it('Tecno-Eresie (3 rank, cost 8, spec +15, combo In/Sd 20) → totale 50, DP 24', () => {
    const s = skill('tecno-eresie')
    expect(skillStatBonus(s, stats)).toBe(20) // In 11 + Sd 9
    expect(skillTotal(s, stats, harp40k)).toBe(50)
    expect(skillDpSpent(s, ula500.identity.professions, harp40k)).toBe(24)
  })

  it('Leadership (0 rank, combo Pr/Pr) → totale -12', () => {
    expect(skillTotal(skill('leadership'), stats, harp40k)).toBe(-12)
  })

  it('Corruzione = -3 (negativo, non azzerato)', () => {
    expect(ula500.counters.corruption).toBe(-3)
  })

  // Tiri Salvezza (CLAUDE.md §Contatori): 2 × total della stat governante.
  it('Tiri Salvezza: Tempra 18 (2×Co), Volontà 18 (2×Sd), PSI 22 (2×In)', () => {
    expect(savingThrows(ula500)).toEqual({ tempra: 18, volonta: 18, psi: 22 })
  })

  it('Somma DP totale = 362 (budget 350, deroga GM +12)', () => {
    const status = dpBudgetStatus(ula500, harp40k)
    expect(status.spent).toBe(362)
    expect(status.remaining).toBe(-12) // lo sforamento che il tool rivela
  })
})
