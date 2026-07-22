/**
 * HARP stat bonus from a raw stat value.
 *
 * Rule (verified against the Pal Ula500 sheet and the HARP core table):
 *   - value ≤ 100:  bonus = ceil((value − 50) / 5)
 *   - value > 100:  +1 per point above 100, capped at 105 → +15
 *
 * Checks: 83→7, 92→9, 62→3, 57→2, 95→9, 20→−6, 100→10, 105→15.
 * Source: HARP core stat table (rolemasterblog.com/harp-stats-culture).
 */
export function statBonus(value: number): number {
  if (value > 100) return 10 + Math.min(value, 105) - 100
  return Math.ceil((value - 50) / 5)
}
