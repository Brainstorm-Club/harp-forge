import { describe, it, expect } from 'vitest'
import { statBonus } from './statBonus'

describe('statBonus', () => {
  // Verified against the Pal Ula500 sheet's Stats block.
  it.each([
    [83, 7],
    [92, 9],
    [62, 3],
    [57, 2],
    [94, 9],
    [95, 9],
    [20, -6],
  ])('value %i → bonus %i (Ula500)', (value, bonus) => {
    expect(statBonus(value)).toBe(bonus)
  })

  it('handles table breakpoints', () => {
    expect(statBonus(50)).toBe(0)
    expect(statBonus(51)).toBe(1)
    expect(statBonus(100)).toBe(10)
  })

  it('grants +1 per point above 100, capped at 105 → +15', () => {
    expect(statBonus(101)).toBe(11)
    expect(statBonus(105)).toBe(15)
    expect(statBonus(120)).toBe(15) // hard cap
  })
})
