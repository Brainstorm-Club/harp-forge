/**
 * Typed loader for the golden reference fixture.
 *
 * `pal-ula500.json` is the canonical "real, complete sheet" from CLAUDE.md's
 * acceptance contract — a plain JSON document (the portable source of truth).
 * We cast it once here so the rest of the app consumes a typed `Character`.
 */
import type { Character } from '@/types/character'
import raw from './pal-ula500.json'

export const ula500 = raw as unknown as Character
