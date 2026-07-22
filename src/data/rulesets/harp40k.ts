/**
 * Default ruleset — "harp-40k-tavolo-v1".
 *
 * This is the group's shared, editable rules file. The stat-bonus math is a
 * formula (see engine/statBonus.ts), so it isn't a table here. What lives here:
 * the rank bonus, DP brackets for buying stats, the sheet's categories, and a
 * skill catalog.
 *
 * NOTE on costByProfession: the group's per-profession cost tables are house
 * data we don't have yet, so catalog entries currently carry only a `default`
 * cost (taken from the reference sheet). As the group provides real per-
 * profession costs, add keys like `techsorcist: 2` — the engine already picks
 * the lowest cost among a character's professions.
 */
import type { Ruleset } from '@/types/ruleset'

export const harp40k: Ruleset = {
  id: 'harp-40k-tavolo-v1',
  rankBonus: 5,
  // DP cost per point when raising a stat, by value bracket (HARP core).
  statPurchaseCost: [
    { max: 90, cost: 1 },
    { max: 95, cost: 2 },
    { max: 100, cost: 3 },
    { max: 105, cost: 10 },
  ],
  categories: [
    'artistiche',
    'fisiche',
    'combattimento',
    'mentali',
    'interazione',
    'percettive',
    'sopravvivenza',
    'sotterfugio',
    'conoscenze-comuni',
    'conoscenze-accademiche',
    'conoscenze-proibite',
    'competenze-tecniche',
  ],
  skillCatalog: [
    { id: 'endurance', name: 'Endurance', category: 'fisiche', stats: ['Co', 'Sd'], costByProfession: { default: 2 } },
    { id: 'uso-tecnologia', name: 'Uso Tecnologia', category: 'competenze-tecniche', stats: ['Re', 'In'], costByProfession: { default: 2 } },
    { id: 'culto-mechanicus', name: 'Culto Mechanicus', category: 'conoscenze-comuni', stats: ['Re', 'In'], costByProfession: { default: 2 } },
    { id: 'adeptus-mechanicus', name: 'Adeptus Mechanicus', category: 'conoscenze-proibite', stats: ['Re', 'In'], costByProfession: { default: 2 } },
    { id: 'intuizione', name: 'Intuizione', category: 'percettive', stats: ['In', 'In'], costByProfession: { default: 4 } },
    { id: 'percezione', name: 'Percezione', category: 'percettive', stats: ['In', 'Re'], costByProfession: { default: 4 } },
    { id: 'logica', name: 'Logica', category: 'mentali', stats: ['Re', 'In'], costByProfession: { default: 4 } },
    { id: 'medicina', name: 'Medicina', category: 'conoscenze-accademiche', stats: ['Re', 'In'], costByProfession: { default: 4 } },
    { id: 'resistenza-psi', name: 'Resistenza PSI', category: 'fisiche', stats: ['In', 'In'], costByProfession: { default: 2 } },
    { id: 'wp-ascia-potenziata', name: 'WP Ascia Potenziata', category: 'combattimento', stats: ['St', 'Ag'], costByProfession: { default: 4 } },
    { id: 'tecno-eresie', name: 'Tecno-Eresie', category: 'conoscenze-proibite', stats: ['In', 'Sd'], costByProfession: { default: 8 } },
    { id: 'leadership', name: 'Leadership', category: 'interazione', stats: ['Pr', 'Pr'], costByProfession: { default: 4 } },
  ],
  counters: ['fate', 'insanity', 'corruption'],
}
