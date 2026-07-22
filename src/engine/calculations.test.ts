import { describe, it, expect } from 'vitest'
import {
  statTotal,
  statDpIncome,
  skillStatBonus,
  skillRankBonus,
  skillTotal,
  skillCost,
  skillDpSpent,
  dpBudgetStatus,
} from './calculations'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'
import type { Skill } from '@/types/character'

const stats = ula500.stats.values

const skill = (id: string): Skill => {
  const s = ula500.skills.find((x) => x.id === id)
  if (!s) throw new Error(`fixture skill not found: ${id}`)
  return s
}

describe('statTotal (Ula500)', () => {
  it.each([
    ['St', 11],
    ['Co', 9],
    ['Ag', 1],
    ['Qu', 2],
    ['Sd', 9],
    ['Re', 12],
    ['In', 11],
    ['Pr', -6],
  ] as const)('%s total = %i', (key, total) => {
    expect(statTotal(stats, key)).toBe(total)
  })
})

describe('statDpIncome', () => {
  it('sums positive base bonuses to the sheet total (48)', () => {
    expect(statDpIncome(stats)).toBe(48)
  })
})

describe('skillTotal (values derived from the canonical pal-ula500.json)', () => {
  it.each([
    ['endurance', 58],
    ['uso-tecnologia', 73],
    ['riparare-tecnologia', 68],
    ['adeptus-mechanicus', 63],
    ['resistenza-psi', 62],
    ['culto-mechanicus', 53], // canonical JSON has no spec (PDF shows 83)
    ['tecno-eresie', 50],
    ['percezione', 48],
    ['intuizione', 47],
    ['medicina', 43],
    ['wp-ascia-potenza', 42],
    ['tecnomanzia', 40],
    ['logica', 33],
    ['leadership', -12],
  ])('%s total = %i', (id, total) => {
    expect(skillTotal(skill(id), stats, harp40k)).toBe(total)
  })
})

describe('rank bonus tiers (HARP: 1-10 ×5, 11-20 ×2, 21+ ×1)', () => {
  it.each([
    [0, 0],
    [8, 40],
    [10, 50],
    [11, 52],
    [12, 54],
    [20, 70],
    [21, 71],
  ])('%i ranks → %i', (ranks, bonus) => {
    expect(skillRankBonus(ranks, harp40k)).toBe(bonus)
  })
})

describe('skill sub-bonuses (Uso Tecnologia)', () => {
  const uso = skill('uso-tecnologia')
  it('rank bonus = ranks × 5', () => {
    expect(skillRankBonus(uso.ranks, harp40k)).toBe(35)
  })
  it('stat pair bonus = Re total + In total', () => {
    expect(skillStatBonus(uso, stats)).toBe(23)
  })
})

describe('same-stat pairs double the stat (Intuizione In/In)', () => {
  it('In total 11 counted twice = 22', () => {
    expect(skillStatBonus(skill('intuizione'), stats)).toBe(22)
  })
})

describe('cost resolution', () => {
  it('uses the authored per-row cost when present', () => {
    expect(skillCost(skill('uso-tecnologia'), ula500.identity.professions, harp40k)).toBe(2)
  })

  it('falls back to the ruleset catalog default when no row cost', () => {
    const noCost: Skill = { ...skill('logica'), cost: undefined }
    expect(skillCost(noCost, ula500.identity.professions, harp40k)).toBe(4)
  })

  it('picks the lowest cost among the character\'s professions', () => {
    const ruleset = {
      ...harp40k,
      skillCatalog: [
        {
          id: 'logica',
          name: 'Logica',
          category: 'mentali',
          stats: ['Re', 'In'] as ['Re', 'In'],
          costByProfession: { cleric: 2, warrior: 5, default: 4 },
        },
      ],
    }
    const noCost: Skill = { ...skill('logica'), cost: undefined }
    expect(skillCost(noCost, ula500.identity.professions, ruleset)).toBe(2)
  })

  it('returns null for an unknown skill with no cost', () => {
    const orphan: Skill = { id: 'unknown-skill', category: 'mentali', name: 'X', stats: ['Re', 'In'], ranks: 1 }
    expect(skillCost(orphan, ula500.identity.professions, harp40k)).toBeNull()
  })
})

describe('DP spent', () => {
  it('per skill = cost × ranks', () => {
    // Uso Tecnologia: cost 2 × 7 ranks
    expect(skillDpSpent(skill('uso-tecnologia'), ula500.identity.professions, harp40k)).toBe(14)
  })

  it('the full sheet sums to 362 and reveals the 12-DP over-budget', () => {
    const status = dpBudgetStatus(ula500, harp40k)
    expect(status.spent).toBe(362)
    expect(status.budget).toBe(350)
    expect(status.remaining).toBe(-12)
    expect(status.over).toBe(true)
    expect(status.unresolved).toEqual([])
  })
})
