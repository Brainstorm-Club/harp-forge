import type { Skill, StatKey } from '@/types/character'

/**
 * Abilità pre-stampate sul foglio HARP-40K (le 48 righe della scheda, nell'ordine
 * del foglio). Sorgente: la scheda reale di Ula500 da cui è stato generato il
 * template PDF `public/pdf/harp-sheet-it.pdf` mantenendo i nomi-skill pre-stampati.
 * Una scheda nuova (o importata) mostra SEMPRE tutte queste abilità: quelle senza
 * valore restano a `ranks: 0`.
 */
export interface SheetSkillDef {
  id: string
  name: string
  category: string
  stats: [StatKey, StatKey]
  /** Costo per rank fisso come stampato sul foglio (2/4/6/8). */
  cost: number
}

export const SHEET_SKILLS: readonly SheetSkillDef[] = [
  { id: "endurance", name: "Endurance", category: "fisiche", stats: ["Co", "Sd"], cost: 2 },
  { id: "correre", name: "Correre", category: "fisiche", stats: ["Ag", "In"], cost: 2 },
  { id: "arrampicarsi", name: "Arrampicarsi", category: "fisiche", stats: ["Ag", "St"], cost: 2 },
  { id: "armature-medie", name: "Armature medie", category: "fisiche", stats: ["St", "Ag"], cost: 2 },
  { id: "armature-potenziate", name: "Armature potenziate", category: "fisiche", stats: ["St", "Ag"], cost: 2 },
  { id: "resistenza-tempra", name: "Resistenza Tempra", category: "fisiche", stats: ["Co", "Co"], cost: 2 },
  { id: "resistenza-psi", name: "Resistenza PSI", category: "fisiche", stats: ["In", "In"], cost: 2 },
  { id: "resistenza-volonta", name: "Resistenza Volontà", category: "fisiche", stats: ["Sd", "Sd"], cost: 2 },
  { id: "wp-ascia-potenza", name: "WP Ascia Potenza", category: "combattimento", stats: ["St", "Ag"], cost: 4 },
  { id: "wp-arma-bianca", name: "WP Arma Bianca", category: "combattimento", stats: ["St", "Ag"], cost: 4 },
  { id: "wp-pistola", name: "WP Pistola", category: "combattimento", stats: ["Qu", "In"], cost: 4 },
  { id: "cifrari-di-battaglia", name: "Cifrari di battaglia", category: "combattimento", stats: ["In", "Re"], cost: 4 },
  { id: "logica", name: "Logica", category: "mentali", stats: ["Re", "In"], cost: 4 },
  { id: "concentrazione", name: "Concentrazione", category: "mentali", stats: ["Sd", "Sd"], cost: 4 },
  { id: "focus-mentale", name: "Focus mentale", category: "mentali", stats: ["Sd", "Sd"], cost: 4 },
  { id: "furia", name: "Furia", category: "mentali", stats: ["Sd", "Co"], cost: 8 },
  { id: "intuizione", name: "Intuizione", category: "percettive", stats: ["In", "In"], cost: 4 },
  { id: "percezione", name: "Percezione", category: "percettive", stats: ["In", "Re"], cost: 4 },
  { id: "cercare", name: "Cercare", category: "percettive", stats: ["In", "Re"], cost: 4 },
  { id: "consapevolezza", name: "Consapevolezza", category: "percettive", stats: ["In", "In"], cost: 4 },
  { id: "interrogare", name: "Interrogare", category: "interazione", stats: ["Pr", "In"], cost: 4 },
  { id: "intimidire", name: "Intimidire", category: "interazione", stats: ["Pr", "St"], cost: 4 },
  { id: "diplomazia", name: "Diplomazia", category: "interazione", stats: ["Pr", "In"], cost: 4 },
  { id: "leadership", name: "Leadership", category: "interazione", stats: ["Pr", "Pr"], cost: 4 },
  { id: "uso-veleni", name: "Uso veleni", category: "sotterfugio", stats: ["In", "Sd"], cost: 4 },
  { id: "scienza-criminale", name: "Scienza criminale", category: "sotterfugio", stats: ["Sd", "In"], cost: 4 },
  { id: "culto-mechanicus", name: "Culto Mechanicus", category: "conoscenze-comuni", stats: ["Re", "In"], cost: 2 },
  { id: "dottrina-imperiale", name: "Dottrina imperiale", category: "conoscenze-comuni", stats: ["Re", "In"], cost: 2 },
  { id: "imperium", name: "Imperium", category: "conoscenze-comuni", stats: ["Re", "In"], cost: 2 },
  { id: "pronto-soccorso", name: "Pronto soccorso", category: "conoscenze-comuni", stats: ["Re", "In"], cost: 2 },
  { id: "biologia", name: "Biologia", category: "conoscenze-accademiche", stats: ["Re", "In"], cost: 6 },
  { id: "chimica", name: "Chimica", category: "conoscenze-accademiche", stats: ["Re", "In"], cost: 6 },
  { id: "medicina", name: "Medicina", category: "conoscenze-accademiche", stats: ["Re", "In"], cost: 4 },
  { id: "xenologia", name: "Xenologia", category: "conoscenze-accademiche", stats: ["Re", "In"], cost: 4 },
  { id: "adeptus-mechanicus", name: "Adeptus Mechanicus", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 2 },
  { id: "tecno-eresie", name: "Tecno-Eresie", category: "conoscenze-proibite", stats: ["In", "Sd"], cost: 8 },
  { id: "archeotecnologia", name: "Archeotecnologia", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 4 },
  { id: "psionici", name: "Psionici", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 4 },
  { id: "immaterium", name: "Immaterium", category: "conoscenze-proibite", stats: ["In", "Sd"], cost: 4 },
  { id: "ordo-inquisitorii", name: "Ordo inquisitorii", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 8 },
  { id: "eresia", name: "Eresia", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 4 },
  { id: "xeno-generico", name: "Xeno (generico)", category: "conoscenze-proibite", stats: ["Re", "In"], cost: 2 },
  { id: "mutanti", name: "Mutanti", category: "conoscenze-proibite", stats: ["Re", "Sd"], cost: 6 },
  { id: "uso-tecnologia", name: "Uso Tecnologia", category: "competenze-tecniche", stats: ["Re", "In"], cost: 2 },
  { id: "riparare-tecnologia", name: "Riparare Tecnologia", category: "competenze-tecniche", stats: ["Re", "In"], cost: 2 },
  { id: "tecnomanzia", name: "Tecnomanzia", category: "competenze-tecniche", stats: ["Pr", "In"], cost: 2 },
  { id: "pilotare-navette", name: "Pilotare Navette", category: "competenze-tecniche", stats: ["Qu", "In"], cost: 2 },
  { id: "gotico-scritto", name: "Gotico scritto", category: "lingue", stats: ["Re", "Re"], cost: 2 },
]

/** Set completo delle abilità del foglio, azzerate (ranks 0). Oggetti freschi. */
export function createBlankSkills(): Skill[] {
  return SHEET_SKILLS.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    stats: [d.stats[0], d.stats[1]],
    ranks: 0,
    cost: d.cost,
    spec: [],
  }))
}
