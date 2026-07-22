import { describe, it, expect } from 'vitest'
import { mapCharacterToFields, normalizeSkillName } from './pdfFieldMapping'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'

// Minimal template index for the skills asserted below (others go unmatched).
const slotIndex = new Map<string, string>([
  [normalizeSkillName('Endurance'), '001'],
  [normalizeSkillName('Uso Tecnologia'), '183'],
  [normalizeSkillName('Percezione'), '077'],
  [normalizeSkillName('Leadership'), '068'],
])

const { values, unmatched } = mapCharacterToFields(ula500, harp40k, slotIndex)

describe('pdf field mapping — header & identity', () => {
  it('name, race, professions, levels', () => {
    expect(values['char.name']).toBe('Pal Ula500')
    expect(values['char.profession.one']).toBe('Cleric')
    expect(values['char.level.one']).toBe('6')
    expect(values['char.profession.two']).toBe('Warrior')
    expect(values['char.level.total']).toBe('6')
  })

  it('fate + follia/corruzione notes (negative preserved)', () => {
    expect(values['char.fatepoints']).toBe('3')
    expect(values['char.notes']).toContain('Punti Follia 5')
    expect(values['char.notes']).toContain('Punti Corruzione -3')
  })
})

describe('pdf field mapping — stats', () => {
  it('Re: score/bonus/special/total', () => {
    expect(values['stat.re.score']).toBe('95')
    expect(values['stat.re.bonus']).toBe('9')
    expect(values['stat.re.special']).toBe('3')
    expect(values['stat.re.total']).toBe('12')
  })
  it('Pr negative total', () => {
    expect(values['stat.pr.total']).toBe('-6')
  })
})

describe('pdf field mapping — resistance rolls', () => {
  it('Tempra 18, Volontà 18, PSI(magic) 22', () => {
    expect(values['rr.stamina.total']).toBe('18')
    expect(values['rr.will.total']).toBe('18')
    expect(values['rr.magic.total']).toBe('22')
  })
})

describe('pdf field mapping — skills by slot', () => {
  it('Endurance → slot 001 (rank 40, stat 18, total 58)', () => {
    expect(values['skill.001.total']).toBe('58')
    expect(values['skill.001.bonus']).toBe('40')
    expect(values['skill.001.stats']).toBe('18')
    expect(values['skill.001.cost']).toBe('2')
  })
  it('Uso Tecnologia → slot 183 (total 73, spec 15)', () => {
    expect(values['skill.183.total']).toBe('73')
    expect(values['skill.183.special']).toBe('15')
  })
  it('Leadership → slot 068 (negative total -12, blank rank bonus)', () => {
    expect(values['skill.068.total']).toBe('-12')
    expect(values['skill.068.bonus']).toBe('') // 0 ranks → blank
  })
})

describe('pdf field mapping — alias slots (name differs from fixture)', () => {
  it('tecno-eresie → slot 180 via alias (total 50, cost 8)', () => {
    expect(values['skill.180.total']).toBe('50')
    expect(values['skill.180.cost']).toBe('8')
  })
  it('wp-ascia-potenza → slot 038 via alias (total 42)', () => {
    expect(values['skill.038.total']).toBe('42')
  })
})

describe('normalizeSkillName', () => {
  it('strips accents, dotted leaders, asterisks, colons', () => {
    expect(normalizeSkillName('Resistenza Volontà')).toBe('resistenza volonta')
    expect(normalizeSkillName('Focus mentale*')).toBe('focus mentale')
    expect(normalizeSkillName('Sport......................')).toBe('sport')
    expect(normalizeSkillName('Xeno:')).toBe('xeno')
  })
})

describe('unmatched skills are reported, not silently dropped', () => {
  it('skills without a slot land in unmatched (only 4 slots provided here)', () => {
    // We deliberately provided only 4 template slots; alias skills also match.
    expect(unmatched.length).toBeGreaterThan(0)
    expect(unmatched).not.toContain('Endurance')
    expect(unmatched).not.toContain('Tecno-Eresie') // matched via alias
  })
})
