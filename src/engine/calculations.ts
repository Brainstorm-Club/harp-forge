/**
 * Pure HARP calculation engine.
 *
 * Every function here is a pure function of (character/skill, ruleset) — no
 * side effects, no persisted state. This is the single place where HARP math
 * lives, so it can be exhaustively unit-tested against real sheets.
 */
import type { Character, Profession, Skill, Stats, StatKey } from '@/types/character'
import { STAT_KEYS } from '@/types/character'
import type { Ruleset } from '@/types/ruleset'
import { statBonus } from './statBonus'

/** Total bonus for one stat: base bonus + race + spec columns. */
export function statTotal(stats: Stats, key: StatKey): number {
  const s = stats[key]
  return statBonus(s.value) + s.race + s.spec
}

/**
 * Development points granted by stats = sum of the positive BASE bonuses
 * (race/spec do not contribute). Matches Ula500's "Total DPs 48".
 */
export function statDpIncome(stats: Stats): number {
  return STAT_KEYS.reduce((sum, k) => sum + Math.max(0, statBonus(stats[k].value)), 0)
}

/** Stat contribution to a skill = sum of the Total bonuses of its stat pair. */
export function skillStatBonus(skill: Skill, stats: Stats): number {
  return skill.stats.reduce((sum, k) => sum + statTotal(stats, k), 0)
}

/**
 * Resistance Roll (Tiro Salvezza) = 2 × the governing stat's TOTAL bonus
 * (base + race + spec) plus flat race/other modifiers on the save row.
 *
 * Governing stats (CLAUDE.md): Tempra→Co, Volontà→Sd, PSI→In.
 * Verified on Ula500: PSI = 2 × In total (11) = 22.
 */
export function savingThrow(
  stats: Stats,
  stat: StatKey,
  mods: { race?: number; other?: number } = {},
): number {
  return 2 * statTotal(stats, stat) + (mods.race ?? 0) + (mods.other ?? 0)
}

export interface SavingThrows {
  tempra: number
  volonta: number
  psi: number
}

/** The three standard resistance rolls for a character. */
export function savingThrows(character: Character): SavingThrows {
  const s = character.stats.values
  const rr = character.saves
  return {
    tempra: savingThrow(s, 'Co', rr?.tempra),
    volonta: savingThrow(s, 'Sd', rr?.volonta),
    psi: savingThrow(s, 'In', rr?.psi),
  }
}

/**
 * Rank contribution to a skill (HARP tiered progression, verified on real
 * sheets): ranks 1-10 give the ruleset's per-rank bonus (5), ranks 11-20 give
 * +2 each, ranks 21+ give +1 each.
 *   8→40, 10→50, 11→52, 12→54, 20→70, 21→71.
 */
export function skillRankBonus(ranks: number, ruleset: Ruleset): number {
  const tier1 = Math.min(ranks, 10) * ruleset.rankBonus
  const tier2 = Math.max(0, Math.min(ranks, 20) - 10) * 2
  const tier3 = Math.max(0, ranks - 20) * 1
  return tier1 + tier2 + tier3
}

/** Sum of a skill's special bonuses (implants, gear). */
export function skillSpecBonus(skill: Skill): number {
  return (skill.spec ?? []).reduce((sum, b) => sum + b.value, 0)
}

/** Full skill total bonus = rank + stat pair + specials. */
export function skillTotal(skill: Skill, stats: Stats, ruleset: Ruleset): number {
  return (
    skillRankBonus(skill.ranks, ruleset) +
    skillStatBonus(skill, stats) +
    skillSpecBonus(skill)
  )
}

/** Normalize a profession display name to a catalog id (lowercase, spaceless). */
export function normalizeProfession(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}

/**
 * Resolve the per-rank cost of a skill.
 *   1. an authored `cost` on the row wins (explicit value / GM override);
 *   2. otherwise the ruleset catalog is consulted and the LOWEST cost among
 *      the character's professions is taken (HARP: cheapest profession pays);
 *   3. otherwise the catalog `default`;
 *   4. otherwise `null` (unknown — caller decides how to surface it).
 */
export function skillCost(
  skill: Skill,
  professions: Profession[],
  ruleset: Ruleset,
): number | null {
  if (skill.cost != null) return skill.cost

  const entry = ruleset.skillCatalog.find((e) => e.id === skill.id)
  if (!entry) return null

  const costs = professions
    .map((p) => entry.costByProfession[normalizeProfession(p.name)])
    .filter((c): c is number => typeof c === 'number')

  if (costs.length > 0) return Math.min(...costs)
  return entry.costByProfession.default ?? null
}

/** DP spent on a single skill = resolved per-rank cost × ranks (0 if unknown). */
export function skillDpSpent(
  skill: Skill,
  professions: Profession[],
  ruleset: Ruleset,
): number {
  const cost = skillCost(skill, professions, ruleset)
  return cost == null ? 0 : cost * skill.ranks
}

/** Total DP spent across all skills. */
export function totalSkillDp(character: Character, ruleset: Ruleset): number {
  return character.skills.reduce(
    (sum, s) => sum + skillDpSpent(s, character.identity.professions, ruleset),
    0,
  )
}

export interface DpBudgetStatus {
  spent: number
  budget: number | null
  /** budget − spent, or null when no budget is set. */
  remaining: number | null
  /** true when spent exceeds a set budget. */
  over: boolean
  /** Skills whose cost could not be resolved (need a ruleset entry or a cost). */
  unresolved: string[]
}

/** Live DP budget status for the whole character. */
export function dpBudgetStatus(character: Character, ruleset: Ruleset): DpBudgetStatus {
  const spent = totalSkillDp(character, ruleset)
  const budget = character.dp.budget
  const unresolved = character.skills
    .filter((s) => skillCost(s, character.identity.professions, ruleset) == null)
    .map((s) => s.id)
  return {
    spent,
    budget,
    remaining: budget == null ? null : budget - spent,
    over: budget != null && spent > budget,
    unresolved,
  }
}
