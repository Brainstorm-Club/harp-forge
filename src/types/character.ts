/**
 * HARP character data model — mirrors the canonical fixture pal-ula500.json,
 * which is the authoritative shape (per CLAUDE.md + the sheet).
 *
 * Design rule (planning §4): the JSON stores ONLY inputs. Every derived value —
 * stat bonus, skill total, DP spent, budget status, resistance rolls — is
 * (re)computed by the engine and never persisted. This kills the "362 vs 350"
 * class of hand-summing errors at the root.
 */

/** The eight HARP statistics. */
export type StatKey = 'St' | 'Co' | 'Ag' | 'Qu' | 'Sd' | 'Re' | 'In' | 'Pr'

export const STAT_KEYS: readonly StatKey[] = ['St', 'Co', 'Ag', 'Qu', 'Sd', 'Re', 'In', 'Pr']

/** One statistic as authored on the sheet: raw value plus flat modifiers. */
export interface StatEntry {
  /** Raw stat value, 1–105. Drives the base bonus via the HARP formula. */
  value: number
  /** Racial modifier column. */
  race: number
  /** Special/other modifier column (implants, etc.). */
  spec: number
}

export type Stats = Record<StatKey, StatEntry>

/** A profession slot with its level. HARP characters can hold several. */
export interface Profession {
  name: string
  level: number
}

/** A named special-bonus contribution to a skill (e.g. an implant grant). */
export interface SpecBonus {
  value: number
  source?: string
}

/** A skill row on the sheet. Totals are computed, never stored. */
export interface Skill {
  /** Stable id, also used to resolve cost/stats from the ruleset catalog. */
  id: string
  /** Category label (matches ruleset.categories). */
  category: string
  name: string
  /** The stat pair whose Total bonuses feed the skill (may repeat a stat). */
  stats: [StatKey, StatKey]
  ranks: number
  /**
   * Per-rank cost as written on the sheet (in this adaptation it is fixed per
   * skill: 2/4/6/8). When absent, the engine resolves it from the ruleset by
   * profession; when present, it acts as the explicit value / GM override.
   */
  cost?: number
  /** Special bonuses (implants, gear). Always an array; summed into the total. */
  spec?: SpecBonus[]
}

/** Something an implant grants to the character. */
export interface Grant {
  /** e.g. "skill:percezione", "stat:In", "weapon:scarica-luminen", "special". */
  target: string
  type?: 'spec' | 'special' | 'enable'
  value?: number
  note?: string
}

export interface Implant {
  id: string
  name: string
  description?: string
  grants?: Grant[]
}

export interface Weapon {
  id?: string
  name: string
  /** Free-form OB expression (e.g. "bonusTot:St + rankBonus:wp-ascia-potenza"). */
  obFormula?: string
  fumble?: string
  range?: string | null
  damage?: string
  size?: string | null
  damageType?: string
  ammo?: string
  notes?: string
}

export interface ArmourItem {
  name: string
  armourBonus?: number
  magicBonus?: number
  armourPenalty?: number
  weight?: string | null
  notes?: string
}

export interface EquipmentItem {
  name: string
  weight?: string
  notes?: string
}

/** Campaign counters; some may legitimately go negative (corruption). */
export interface Counters {
  fate?: number
  insanity?: number
  corruption?: number
  hp?: number | null
  pp?: number | null
}

export interface GmNote {
  date: string
  note: string
}

/** A versioned snapshot of the character (planning R11, Epic 4). */
export interface VersionSnapshot {
  version: number
  timestamp: string
  label: string
  /** Optional pointer to a stored full snapshot. */
  snapshotRef?: string
}

export interface CharacterMeta {
  schemaVersion: string
  app: string
  createdAt: string
  updatedAt: string
  /** Id of the ruleset this character is built against. */
  ruleset: string
}

export interface Character {
  meta: CharacterMeta
  identity: {
    name: string
    race: string
    professions: Profession[]
    origin?: string
    /** 40K flavour role (e.g. "Techsorcist — Ex Xenogenetista"). */
    role?: string
    description?: string
    /** Backstory prose (distinct from the top-level version `history`). */
    history?: string
    portraitPrompt?: string
    /** Optional free "Personal Information" panel: sex, hair, eyes, likes… */
    personal?: Record<string, string>
  }
  stats: {
    /** Optional stat-points budget, separate from the DP budget. */
    budget?: number | null
    values: Stats
  }
  /** Optional flat race/other modifiers on the resistance-roll rows. */
  saves?: {
    tempra?: { race?: number; other?: number }
    volonta?: { race?: number; other?: number }
    psi?: { race?: number; other?: number }
  }
  dp: {
    /** Total DP budget for the build, or null if untracked. */
    budget: number | null
    overrideNote?: string
  }
  skills: Skill[]
  implants: Implant[]
  weapons: Weapon[]
  armour: ArmourItem[]
  counters: Counters
  equipment?: EquipmentItem[]
  gmNotes?: GmNote[]
  /** Version snapshots (event log, Epic 4). */
  history?: VersionSnapshot[]
}
