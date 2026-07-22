/**
 * Ruleset: the configurable "rules of the table", kept separate from any one
 * character so a group can share it as a single JSON/TS file (planning §4, R15).
 */
import type { StatKey } from './character'

/** One entry of the shared skill catalog. */
export interface SkillCatalogEntry {
  id: string
  name: string
  category: string
  /** Default stat pair for the skill. A character may still override per-row. */
  stats: [StatKey, StatKey]
  /**
   * Per-rank cost keyed by a normalized profession id, plus a `default`.
   * The engine picks the lowest cost among the character's professions.
   */
  costByProfession: Record<string, number>
}

/** A DP-cost bracket for buying stat points (value ≤ max costs `cost` per point). */
export interface StatPurchaseBracket {
  max: number
  cost: number
}

export interface Ruleset {
  id: string
  /** Flat bonus per skill rank (HARP core: 5). */
  rankBonus: number
  /** Ordered ascending; first bracket whose `max` ≥ value applies. */
  statPurchaseCost: StatPurchaseBracket[]
  /** Ordered category labels used to group the sheet. */
  categories: string[]
  skillCatalog: SkillCatalogEntry[]
  /** Counter names tracked by this ruleset. */
  counters: string[]
}
