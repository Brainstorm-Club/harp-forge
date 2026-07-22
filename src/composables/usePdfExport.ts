/**
 * PDF export — fills the ready-made Italian HARP AcroForm sheet with the
 * current character and downloads it. pdf-lib is imported lazily so it stays
 * out of the initial bundle (planning §5, code splitting).
 *
 * Perf note: the template has ~1900 fields. pdf-lib's `form.getTextField(name)`
 * is a linear scan, so calling it per field is O(n²) (~2s for a full sheet and
 * far worse in-browser). We build a name→field map ONCE and reuse it, and skip
 * the global appearance refresh on save (we regenerate appearances only for the
 * fields we actually fill). Result: a full export runs in well under a second.
 */
import type { PDFTextField as TextField } from 'pdf-lib'
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
  async function exportPdf(character: Character, ruleset: Ruleset): Promise<ExportResult> {
    const { PDFDocument, StandardFonts, PDFTextField } = await import('pdf-lib')

    const res = await fetch(TEMPLATE_URL)
    if (!res.ok) throw new Error(`Template non trovato (${res.status}) a ${TEMPLATE_URL}`)
    const bytes = await res.arrayBuffer()

    const doc = await PDFDocument.load(bytes)
    const form = doc.getForm()
    const font = await doc.embedFont(StandardFonts.Helvetica)

    // One pass: build name → text field map (avoids O(n²) getTextField).
    const fieldMap = new Map<string, TextField>()
    for (const field of form.getFields()) {
      if (field instanceof PDFTextField) fieldMap.set(field.getName(), field)
    }

    // Pre-printed skill name → slot number, read from the template labels.
    const slotIndex = new Map<string, string>()
    for (const [name, field] of fieldMap) {
      const m = name.match(/^skill\.(\d+)\.name$/)
      if (!m) continue
      const label = field.getText()
      if (label && label.trim()) slotIndex.set(normalizeSkillName(label), m[1]!)
    }

    const { values, unmatched } = mapCharacterToFields(character, ruleset, slotIndex)

    for (const [name, value] of Object.entries(values)) {
      const field = fieldMap.get(name)
      if (!field) continue
      try {
        field.setText(value)
        field.updateAppearances(font)
      } catch {
        // Odd field state — skip rather than abort the whole export.
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
