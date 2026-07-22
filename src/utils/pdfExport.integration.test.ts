/**
 * Integration test: fills the real ready-made template against the canonical
 * character, round-trips through pdf-lib, and asserts values land correctly and
 * every skill finds a slot (validates the alias table against the live PDF).
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { PDFDocument, StandardFonts, PDFTextField } from 'pdf-lib'
import { mapCharacterToFields, normalizeSkillName } from './pdfFieldMapping'
import { harp40k } from '@/data/rulesets/harp40k'
import { ula500 } from '@/fixtures'

const templatePath = fileURLToPath(new URL('../../public/pdf/harp-sheet-it.pdf', import.meta.url))

let reloaded: PDFDocument
let unmatched: string[]

beforeAll(async () => {
  const doc = await PDFDocument.load(readFileSync(templatePath))
  const form = doc.getForm()
  const font = await doc.embedFont(StandardFonts.Helvetica)

  const fieldMap = new Map<string, PDFTextField>()
  for (const field of form.getFields()) {
    if (field instanceof PDFTextField) fieldMap.set(field.getName(), field)
  }

  const slotIndex = new Map<string, string>()
  for (const [name, field] of fieldMap) {
    const m = name.match(/^skill\.(\d+)\.name$/)
    if (!m) continue
    const label = field.getText()
    if (label && label.trim()) slotIndex.set(normalizeSkillName(label), m[1]!)
  }

  const mapped = mapCharacterToFields(ula500, harp40k, slotIndex)
  unmatched = mapped.unmatched
  for (const [name, value] of Object.entries(mapped.values)) {
    const f = fieldMap.get(name)
    if (!f) continue
    f.setText(value)
    f.updateAppearances(font)
  }

  const bytes = await doc.save({ updateFieldAppearances: false })
  reloaded = await PDFDocument.load(bytes)
})

const read = (name: string) => reloaded.getForm().getTextField(name).getText()

describe('real template fill', () => {
  it('every one of the 48 skills matched a slot (alias table complete)', () => {
    expect(unmatched).toEqual([])
  })

  it('header round-trips', () => {
    expect(read('char.name')).toBe('Pal Ula500')
    expect(read('char.profession.one')).toBe('Cleric')
  })

  it('stats round-trip', () => {
    expect(read('stat.re.total')).toBe('12')
    expect(read('stat.pr.total')).toBe('-6')
  })

  it('a known skill lands in its pre-printed slot (Uso Tecnologia = 073 total)', () => {
    // Uso Tecnologia is slot 183 on this template.
    expect(read('skill.183.total')).toBe('73')
    expect(read('skill.183.name')).toBe('Uso Tecnologia')
  })

  it('resistance rolls filled', () => {
    expect(read('rr.magic.total')).toBe('22')
  })
})
