/**
 * Maps a HARP character onto the field names of the ready-made Italian HARP
 * sheet (public/pdf/harp-sheet-it.pdf, an AcroForm with ~1900 named fields).
 *
 * The mapping is value-only: it produces a { fieldName → string } record that
 * the export composable writes into the form. All numbers come from the engine
 * so the exported sheet is guaranteed consistent with the app.
 */
import type { Character } from '@/types/character'
import { STAT_KEYS } from '@/types/character'
import type { Ruleset } from '@/types/ruleset'
import { statBonus } from '@/engine/statBonus'
import {
  statTotal,
  skillRankBonus,
  skillStatBonus,
  skillSpecBonus,
  skillTotal,
  skillCost,
  savingThrows,
} from '@/engine/calculations'

export type PdfFieldValues = Record<string, string>

/** Skill ids whose fixture name differs from the template's pre-printed label. */
const SKILL_SLOT_ALIASES: Record<string, string> = {
  'wp-ascia-potenza': '038', // template: "WP Ascia Potenziata"
  'wp-arma-bianca': '039', // template: "WP Armi bianche"
  'tecno-eresie': '180', // template: "Techno-Eresie"
  archeotecnologia: '167', // template: "Archeotech"
  'xeno-generico': '177', // template: "Xeno:"
}

/** Normalize a skill name for matching: lowercase, strip accents/punctuation. */
export function normalizeSkillName(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[.*:]+/g, ' ') // dotted leaders, asterisks, colons
    .replace(/\s+/g, ' ')
    .trim()
}

/** Format a number for a form cell; blanks a zero when `blankZero`. */
function num(n: number, blankZero = false): string {
  if (blankZero && n === 0) return ''
  return String(n)
}

/**
 * Build the field-value record.
 * @param slotIndex normalizedSkillName → slot number (e.g. "endurance" → "001"),
 *   read from the template at export time.
 */
export function mapCharacterToFields(
  character: Character,
  ruleset: Ruleset,
  slotIndex: Map<string, string>,
): { values: PdfFieldValues; unmatched: string[] } {
  const v: PdfFieldValues = {}
  const stats = character.stats.values
  const id = character.identity

  // ─── Header ──────────────────────────────────────────────────────────────
  v['char.name'] = id.name
  v['char.race'] = id.race
  const levels = id.professions.map((p) => p.level)
  v['char.level.total'] = levels.length ? String(Math.max(...levels)) : ''
  const slots = ['one', 'two', 'three', 'four'] as const
  id.professions.slice(0, 4).forEach((p, i) => {
    v[`char.profession.${slots[i]}`] = p.name
    v[`char.level.${slots[i]}`] = String(p.level)
  })
  v['char.birthplace'] = id.origin ?? ''
  if (id.role) v['char.social.one'] = id.role
  v['char.description'] = id.description ?? ''
  v['char.history'] = id.history ?? ''
  const personal = id.personal ?? {}
  for (const [k, field] of Object.entries({
    sex: 'char.sex', hair: 'char.hair', eyes: 'char.eye', height: 'char.height',
    weight: 'char.weight', build: 'char.build',
  })) {
    if (personal[k]) v[field] = personal[k]
  }

  // General notes: Follia / Corruzione (negative allowed) + GM notes.
  const noteLines: string[] = []
  if (character.counters.insanity != null) noteLines.push(`Punti Follia ${character.counters.insanity}`)
  if (character.counters.corruption != null) noteLines.push(`Punti Corruzione ${character.counters.corruption}`)
  for (const g of character.gmNotes ?? []) noteLines.push(`GM ${g.date}: ${g.note}`)
  v['char.notes'] = noteLines.join('\n')
  if (character.counters.fate != null) v['char.fatepoints'] = String(character.counters.fate)

  // ─── Stats ───────────────────────────────────────────────────────────────
  for (const key of STAT_KEYS) {
    const k = key.toLowerCase()
    const s = stats[key]
    const bon = statBonus(s.value)
    v[`stat.${k}.score`] = String(s.value)
    v[`stat.${k}.bonus`] = num(bon)
    v[`stat.${k}.racial`] = num(s.race, true)
    v[`stat.${k}.special`] = num(s.spec, true)
    v[`stat.${k}.total`] = num(statTotal(stats, key))
    v[`stat.${k}.dp`] = num(Math.max(0, bon), true)
  }

  // ─── Resistance rolls (2× governing stat total) ──────────────────────────
  const rr = savingThrows(character)
  v['rr.stamina.stat'] = String(rr.tempra)
  v['rr.stamina.total'] = String(rr.tempra)
  v['rr.will.stat'] = String(rr.volonta)
  v['rr.will.total'] = String(rr.volonta)
  v['rr.magic.stat'] = String(rr.psi)
  v['rr.magic.total'] = String(rr.psi)

  // ─── Defensive bonus (from armour) ───────────────────────────────────────
  const armourTotal = character.armour.reduce((a, x) => a + (x.armourBonus ?? 0), 0)
  const magicTotal = character.armour.reduce((a, x) => a + (x.magicBonus ?? 0), 0)
  if (character.armour.length) {
    v['char.db.armortype'] = character.armour.map((a) => a.name).join(', ')
    v['char.db.armortotal'] = String(armourTotal)
    if (magicTotal) v['char.db.magic'] = String(magicTotal)
  }
  v['char.db.quickness'] = String(2 * statTotal(stats, 'Qu'))

  // ─── Skills → numbered slots (by pre-printed name / alias) ───────────────
  const unmatched: string[] = []
  for (const skill of character.skills) {
    const slot = SKILL_SLOT_ALIASES[skill.id] ?? slotIndex.get(normalizeSkillName(skill.name))
    if (!slot) {
      unmatched.push(skill.name)
      continue
    }
    const cost = skillCost(skill, id.professions, ruleset)
    v[`skill.${slot}.cost`] = cost == null ? '' : String(cost)
    v[`skill.${slot}.stat1`] = skill.stats[0]
    v[`skill.${slot}.stat2`] = skill.stats[1]
    v[`skill.${slot}.ranks`] = String(skill.ranks)
    v[`skill.${slot}.bonus`] = num(skillRankBonus(skill.ranks, ruleset), true)
    v[`skill.${slot}.stats`] = num(skillStatBonus(skill, stats))
    v[`skill.${slot}.special`] = num(skillSpecBonus(skill), true)
    v[`skill.${slot}.total`] = num(skillTotal(skill, stats, ruleset))
  }

  // ─── Weapons (melee = no range / contact, missile = has range) ───────────
  let mi = 0
  let si = 0
  for (const w of character.weapons) {
    const ranged = !!w.range && !/contatto|contact/i.test(w.range)
    if (ranged) {
      si++
      const p = `missile.${String(si).padStart(3, '0')}`
      v[`${p}.name`] = w.name
      if (w.fumble) v[`${p}.fumble`] = w.fumble
      if (w.damageType) v[`${p}.crit`] = w.damageType
      if (w.size) v[`${p}.size`] = w.size
      if (w.ammo) v[`${p}.ammo`] = w.ammo
      if (w.notes) v[`${p}.notes`] = w.notes
    } else {
      mi++
      const p = `melee.${String(mi).padStart(3, '0')}`
      v[`${p}.name`] = w.name
      if (w.fumble) v[`${p}.fumble`] = w.fumble
      if (w.damageType) v[`${p}.crit`] = w.damageType
      if (w.size) v[`${p}.size`] = w.size
      if (w.notes) v[`${p}.notes`] = w.notes
    }
  }

  return { values: v, unmatched }
}
