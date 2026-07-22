/**
 * PDF export — fills the ready-made Italian HARP AcroForm sheet with the
 * current character and downloads it. pdf-lib is imported lazily so it stays
 * out of the initial bundle (planning §5, code splitting).
 */
import type { Character } from '@/types/character'
import type { Ruleset } from '@/types/ruleset'
import { mapCharacterToFields, normalizeSkillName } from '@/utils/pdfFieldMapping'

const TEMPLATE_URL = `${import.meta.env.BASE_URL}pdf/harp-sheet-it.pdf`

function slug(name: string): string {
  return (name || 'personaggio').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export interface ExportResult {
  unmatched: string[]
}

export function usePdfExport() {
  /**
   * Fill the template and trigger a download. Keeps the form editable
   * (no flatten) so it can be tweaked in a PDF viewer afterwards.
   */
  async function exportPdf(character: Character, ruleset: Ruleset): Promise<ExportResult> {
    const { PDFDocument, StandardFonts } = await import('pdf-lib')

    const res = await fetch(TEMPLATE_URL)
    if (!res.ok) throw new Error(`Template non trovato (${res.status}) a ${TEMPLATE_URL}`)
    const bytes = await res.arrayBuffer()

    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()

    // Build "pre-printed skill name → slot number" index from the template.
    const slotIndex = new Map<string, string>()
    for (const field of form.getFields()) {
      const m = field.getName().match(/^skill\.(\d+)\.name$/)
      if (!m) continue
      const label = form.getTextField(field.getName()).getText()
      if (label && label.trim()) slotIndex.set(normalizeSkillName(label), m[1]!)
    }

    const { values, unmatched } = mapCharacterToFields(character, ruleset, slotIndex)

    // Fill only the fields we know, and regenerate appearances for JUST those.
    // The template has ~1900 fields; letting save() refresh them all blocks the
    // main thread for a long time, so we opt out of the global appearance pass.
    const font = await doc.embedFont(StandardFonts.Helvetica)
    for (const [name, value] of Object.entries(values)) {
      try {
        const f = form.getTextField(name)
        f.setText(value)
        f.updateAppearances(font)
      } catch {
        // Field absent in this template revision — skip silently.
      }
    }

    const out = await doc.save({ updateFieldAppearances: false })
    const blob = new Blob([out as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug(character.identity.name)}-harp.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    return { unmatched }
  }

  return { exportPdf }
}
