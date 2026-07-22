/**
 * Archetipi pre-costruiti per il mondo di Rogue Trader (Koronus Expanse).
 * Sei "concept" di partenza che l'utente può caricare e poi personalizzare.
 * I nomi delle skill combaciano con gli slot del template PDF, così l'export
 * funziona anche partendo da questi.
 */
import type { Character, Skill, StatKey, SpecBonus } from '@/types/character'
import { STAT_KEYS } from '@/types/character'

type SkillDef = [id: string, name: string, cat: string, s1: StatKey, s2: StatKey, ranks: number, cost: number, spec?: number]

function sk([id, name, category, s1, s2, ranks, cost, spec]: SkillDef): Skill {
  return {
    id,
    name,
    category,
    stats: [s1, s2],
    ranks,
    cost,
    spec: spec ? ([{ value: spec }] as SpecBonus[]) : [],
  }
}

function statBlock(
  vals: Record<StatKey, number>,
  mods: Partial<Record<StatKey, { race?: number; spec?: number }>> = {},
): Character['stats'] {
  const values = {} as Character['stats']['values']
  for (const k of STAT_KEYS) {
    values[k] = { value: vals[k], race: mods[k]?.race ?? 0, spec: mods[k]?.spec ?? 0 }
  }
  return { values }
}

interface ArchetypeInput {
  id: string
  name: string
  race: string
  role: string
  professions: { name: string; level: number }[]
  description: string
  history: string
  stats: Record<StatKey, number>
  statMods?: Partial<Record<StatKey, { race?: number; spec?: number }>>
  skills: SkillDef[]
  counters: Character['counters']
  weapons?: Character['weapons']
  implants?: Character['implants']
}

function mkCharacter(a: ArchetypeInput): Character {
  return {
    id: a.id,
    meta: {
      schemaVersion: '1.0',
      app: 'harp-forge',
      createdAt: '2026-07-22T10:00:00Z',
      updatedAt: '2026-07-22T10:00:00Z',
      ruleset: 'harp-40k-tavolo-v1',
    },
    identity: {
      name: a.name,
      race: a.race,
      role: a.role,
      professions: a.professions,
      description: a.description,
      history: a.history,
    },
    stats: statBlock(a.stats, a.statMods),
    dp: { budget: 350 },
    skills: a.skills.map(sk),
    implants: a.implants ?? [],
    weapons: a.weapons ?? [],
    armour: [],
    counters: a.counters,
  }
}

export interface Archetype {
  id: string
  name: string
  role: string
  blurb: string
  character: Character
}

const rogueTrader = mkCharacter({
  id: 'arch-rogue-trader',
  name: 'Aurelia von Kraff',
  race: 'Umana (Nato-nobile)',
  role: 'Lord-Capitano — Dinastia von Kraff',
  professions: [{ name: 'Rogue', level: 6 }],
  description:
    'Portamento imperioso, cappotto di velluto sanguigno e Warrant of Trade cucito nella fodera. Anelli-sigillo su ogni dito, uno per ogni mondo rivendicato.',
  history:
    'Erede di una dinastia mercantile in declino, ha riportato la Warrant nell\'Espansione di Koronus con un\'ammutinamento e tre matrimoni convenienti. Cerca il leggendario Processional of the Damned.',
  stats: { St: 62, Co: 68, Ag: 70, Qu: 66, Sd: 74, Re: 78, In: 80, Pr: 94 },
  skills: [
    ['leadership', 'Leadership', 'interazione', 'Pr', 'Pr', 5, 4],
    ['diplomazia', 'Diplomazia', 'interazione', 'Pr', 'In', 5, 4],
    ['contrattare', 'Contrattare', 'interazione', 'Pr', 'In', 5, 4, 10],
    ['affascinare', 'Affascinare', 'interazione', 'Pr', 'In', 4, 4],
    ['intimidire', 'Intimidire', 'interazione', 'Pr', 'St', 3, 4],
    ['raggirare', 'Raggirare', 'interazione', 'Pr', 'In', 3, 4],
    ['wp-pistola', 'WP Pistola', 'combattimento', 'Qu', 'In', 4, 4, 5],
    ['wp-arma-bianca', 'WP Arma Bianca', 'combattimento', 'St', 'Ag', 4, 4],
    ['schivare', 'Schivare', 'fisiche', 'Ag', 'Qu', 4, 4],
    ['intuizione', 'Intuizione', 'percettive', 'In', 'In', 4, 4],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 3, 4],
    ['imperium', 'Imperium', 'conoscenze-comuni', 'Re', 'In', 4, 2],
    ['storia-imperiale', 'Storia Imperiale', 'conoscenze-comuni', 'Re', 'In', 3, 2],
    ['legge-imperiale', 'Legge Imperiale', 'conoscenze-accademiche', 'Re', 'In', 3, 4],
    ['cifrari-di-battaglia', 'Cifrari di battaglia', 'combattimento', 'In', 'Re', 2, 4],
    ['pilotare-navette', 'Pilotare Navette', 'competenze-tecniche', 'Qu', 'In', 2, 2],
    ['alto-gotico-parlato', 'Alto Gotico parlato', 'lingue', 'Re', 'In', 3, 2],
  ],
  weapons: [
    { name: 'Laspistol da duello ancestrale', fumble: '01-04', damage: 'energia leggera', size: 'S', damageType: 'Heat', notes: 'Cimelio dinastico, qualità magistrale.' },
    { name: 'Sciabola a energia', fumble: '01-03', damage: 'taglio + campo', size: 'M', damageType: 'Slash/Energy' },
  ],
  counters: { fate: 5, insanity: 1, corruption: 0 },
})

const archMilitant = mkCharacter({
  id: 'arch-arch-militant',
  name: 'Gunnar Voss',
  race: 'Umana (Mondo-alveare)',
  role: 'Arch-Militant — Maestro d\'Armi',
  professions: [{ name: 'Fighter', level: 6 }],
  description:
    'Montagna cicatrizzata di muscoli e placche subdermali. Bandoliera di caricatori, un bolter che ha un nome e due tacche per ogni xenos abbattuto.',
  history:
    'Veterano delle guerre di gang di Necromunda, arruolato come guardia del corpo e mai più congedato. Vive per il prossimo abbordaggio.',
  stats: { St: 95, Co: 90, Ag: 86, Qu: 80, Sd: 66, Re: 54, In: 68, Pr: 52 },
  skills: [
    ['wp-laser', 'WP Laser', 'combattimento', 'St', 'Ag', 5, 4, 10],
    ['wp-pistola', 'WP Pistola', 'combattimento', 'Qu', 'In', 5, 4],
    ['wp-arma-bianca', 'WP Arma Bianca', 'combattimento', 'St', 'Ag', 5, 4],
    ['artiglieria', 'Artiglieria', 'combattimento', 'Qu', 'In', 3, 4],
    ['armature-pesanti', 'Armature pesanti', 'fisiche', 'St', 'Ag', 4, 2],
    ['armature-potenziate', 'Armature potenziate', 'fisiche', 'St', 'Ag', 4, 2],
    ['schivare', 'Schivare', 'fisiche', 'Ag', 'Qu', 4, 4],
    ['endurance', 'Endurance', 'fisiche', 'Co', 'Sd', 6, 2],
    ['resistenza-tempra', 'Resistenza Tempra', 'fisiche', 'Co', 'Co', 4, 2],
    ['tiratore-scelto', 'Tiratore scelto', 'sotterfugio', 'Sd', 'Ag', 3, 4],
    ['imboscata', 'Imboscata', 'sotterfugio', 'Sd', 'Ag', 3, 4],
    ['intimidire', 'Intimidire', 'interazione', 'Pr', 'St', 3, 4],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 3, 4],
    ['furia', 'Furia', 'mentali', 'Sd', 'Co', 2, 8],
    ['correre', 'Correre', 'fisiche', 'Ag', 'In', 2, 2],
    ['saltare', 'Saltare', 'fisiche', 'St', 'Ag', 2, 2],
    ['cifrari-di-battaglia', 'Cifrari di battaglia', 'combattimento', 'In', 'Re', 2, 4],
  ],
  weapons: [
    { name: 'Bolter "Ira di Voss"', fumble: '01-05', damage: 'proiettile esplosivo', size: 'L', damageType: 'Impact/Explosive', ammo: 'Caricatore 30 bolt' },
    { name: 'Ascia a catena', fumble: '01-03', damage: 'lame a catena', size: 'M', damageType: 'Slash' },
  ],
  counters: { fate: 3, insanity: 3, corruption: 0 },
})

const voidMaster = mkCharacter({
  id: 'arch-void-master',
  name: 'Sable Rho',
  race: 'Umana (Nato-nel-vuoto)',
  role: 'Void-Master — Timoniere',
  professions: [{ name: 'Ranger', level: 6 }],
  description:
    'Corporatura allungata dalla bassa gravità, dita affusolate sulle console. Occhi rifatti per leggere le maree del vuoto. Non ha mai messo piede su un pianeta di sua volontà.',
  history:
    'Cresciuta tra i condotti di una nave-cattedrale, ha rubato la sua prima navetta a nove anni. Sente lo spirito-macchina della nave meglio di chiunque a bordo.',
  stats: { St: 58, Co: 66, Ag: 90, Qu: 92, Sd: 66, Re: 80, In: 84, Pr: 55 },
  skills: [
    ['pilotare-navette', 'Pilotare Navette', 'competenze-tecniche', 'Qu', 'In', 6, 2, 10],
    ['guidare-auto', 'Guidare Auto', 'competenze-tecniche', 'Qu', 'In', 3, 2],
    ['artiglieria', 'Artiglieria', 'combattimento', 'Qu', 'In', 4, 4],
    ['astronavigazione', 'Astronavigazione', 'conoscenze-accademiche', 'Re', 'In', 4, 4],
    ['viaggi-spaziali', 'Viaggi spaziali', 'conoscenze-accademiche', 'Re', 'In', 3, 4],
    ['riparare-tecnologia', 'Riparare tecnologia', 'competenze-tecniche', 'Re', 'In', 3, 2],
    ['uso-tecnologia', 'Uso Tecnologia', 'competenze-tecniche', 'Re', 'In', 3, 2],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 4, 4],
    ['intuizione', 'Intuizione', 'percettive', 'In', 'In', 3, 4],
    ['cercare', 'Cercare', 'percettive', 'In', 'Re', 3, 4],
    ['schivare', 'Schivare', 'fisiche', 'Ag', 'Qu', 4, 4],
    ['wp-pistola', 'WP Pistola', 'combattimento', 'Qu', 'In', 3, 4],
    ['cifrari-di-battaglia', 'Cifrari di battaglia', 'combattimento', 'In', 'Re', 2, 4],
    ['ambiente-zero-g', 'Ambiente zero -G', 'sopravvivenza', 'Ag', 'Sd', 4, 4],
    ['endurance', 'Endurance', 'fisiche', 'Co', 'Sd', 3, 2],
    ['gotico-scritto', 'Gotico scritto', 'lingue', 'Re', 'Re', 2, 2],
  ],
  weapons: [
    { name: 'Laspistol di servizio', fumble: '01-05', damage: 'energia leggera', size: 'S', damageType: 'Heat', ammo: 'Cella 30 colpi' },
    { name: 'Coltello da vuoto', fumble: '01-04', damage: 'lama monomolecolare', size: 'S', damageType: 'Puncture' },
  ],
  counters: { fate: 3, insanity: 2, corruption: 0 },
})

const explorator = mkCharacter({
  id: 'arch-explorator',
  name: 'Magos Delphi-9',
  race: 'Umana (Adeptus Mechanicus, Lathe)',
  role: 'Explorator — Magos della Xeno-arcanologia',
  professions: [{ name: 'Cleric', level: 3 }, { name: 'Magician', level: 3 }],
  description:
    'Più macchina che carne: quattro mechadendrite, un volto di rame che non sorride mai, voce sintetizzata in binario. Cerca il sapere perduto della Golden Age.',
  history:
    'Inviato dal Forge World di Lathe a inventariare i relitti xenos dell\'Espansione. Ossessionato da un\'archeotecnologia necron che potrebbe essere STC — o dannazione.',
  stats: { St: 70, Co: 76, Ag: 55, Qu: 58, Sd: 84, Re: 95, In: 92, Pr: 30 },
  statMods: { St: { spec: 5 }, Re: { spec: 3 } },
  skills: [
    ['uso-tecnologia', 'Uso Tecnologia', 'competenze-tecniche', 'Re', 'In', 6, 2, 15],
    ['riparare-tecnologia', 'Riparare tecnologia', 'competenze-tecniche', 'Re', 'In', 6, 2, 15],
    ['tecnomanzia', 'Tecnomanzia', 'competenze-tecniche', 'Pr', 'In', 4, 2, 10],
    ['adeptus-mechanicus', 'Adeptus Mechanicus', 'conoscenze-proibite', 'Re', 'In', 5, 2, 15],
    ['archeotech', 'Archeotech', 'conoscenze-proibite', 'Re', 'In', 4, 4, 10],
    ['culto-mechanicus', 'Culto Mechanicus', 'conoscenze-comuni', 'Re', 'In', 5, 2],
    ['logica', 'Logica', 'mentali', 'Re', 'In', 3, 4],
    ['medicina', 'Medicina', 'conoscenze-accademiche', 'Re', 'In', 2, 4],
    ['biologia', 'Biologia', 'conoscenze-accademiche', 'Re', 'In', 2, 6],
    ['xenologia', 'Xenologia', 'conoscenze-accademiche', 'Re', 'In', 3, 4, 10],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 3, 4],
    ['consapevolezza', 'Consapevolezza', 'percettive', 'In', 'In', 2, 4],
    ['wp-pistola', 'WP Pistola', 'combattimento', 'Qu', 'In', 2, 4],
    ['endurance', 'Endurance', 'fisiche', 'Co', 'Sd', 4, 2],
    ['alto-gotico-scritto', 'Alto gotico scritto', 'lingue', 'Re', 'Re', 2, 2],
  ],
  implants: [
    { id: 'augur-array', name: 'Augur Array', description: 'Suite sensoriale integrata.', grants: [{ target: 'skill:percezione', type: 'spec', value: 10 }] },
    { id: 'mechadendrite', name: 'Mechadendrite (x4)', description: 'Arti meccanici da manipolazione.', grants: [{ target: 'skill:riparare-tecnologia', type: 'spec', value: 5 }] },
  ],
  weapons: [
    { name: 'Arco-flagellante', fumble: '01-06', damage: 'scarica ustionante', size: 'M', damageType: 'Energy' },
    { name: 'Laspistol', fumble: '01-05', damage: 'energia leggera', size: 'S', damageType: 'Heat' },
  ],
  counters: { fate: 2, insanity: 2, corruption: 1 },
})

const navigator = mkCharacter({
  id: 'arch-navigator',
  name: 'Espern Locarno-Faust',
  race: 'Umana (Navis Nobilite, mutante)',
  role: 'Navigatore — Casa Locarno-Faust',
  professions: [{ name: 'Mage', level: 6 }],
  description:
    'Fronte fasciata di seta nera sopra il terzo occhio, quello che nessuno deve guardare. Pelle diafana venata di blu, portamento aristocratico e antichissimo.',
  history:
    'Rampollo di una Casa Navigatoria in disgrazia, imbarcato per pagare i debiti del casato. L\'Occhio del Warp vede la Luce Astronomican — e altre cose, nel buio tra le stelle.',
  stats: { St: 55, Co: 60, Ag: 58, Qu: 62, Sd: 88, Re: 78, In: 95, Pr: 68 },
  skills: [
    ['astronavigazione', 'Astronavigazione', 'conoscenze-accademiche', 'Re', 'In', 6, 4, 15],
    ['viaggi-spaziali', 'Viaggi spaziali', 'conoscenze-accademiche', 'Re', 'In', 4, 4],
    ['immaterium', 'Immaterium', 'conoscenze-proibite', 'In', 'Sd', 5, 4, 10],
    ['psionici', 'Psionici', 'conoscenze-proibite', 'Re', 'In', 3, 4],
    ['resistenza-psi', 'Resistenza PSI', 'fisiche', 'In', 'In', 6, 2, 10],
    ['resistenza-volonta', 'Resistenza Volontà', 'fisiche', 'Sd', 'Sd', 5, 2],
    ['concentrazione', 'Concentrazione', 'mentali', 'Sd', 'Sd', 4, 4],
    ['focus-mentale', 'Focus mentale', 'mentali', 'Sd', 'Sd', 3, 4],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 4, 4],
    ['intuizione', 'Intuizione', 'percettive', 'In', 'In', 4, 4],
    ['consapevolezza', 'Consapevolezza', 'percettive', 'In', 'In', 3, 4, 10],
    ['imperium', 'Imperium', 'conoscenze-comuni', 'Re', 'In', 3, 2],
    ['storia-imperiale', 'Storia Imperiale', 'conoscenze-comuni', 'Re', 'In', 2, 2],
    ['logica', 'Logica', 'mentali', 'Re', 'In', 2, 4],
    ['alto-gotico-parlato', 'Alto Gotico parlato', 'lingue', 'Re', 'In', 3, 2],
  ],
  weapons: [
    { name: 'Occhio del Warp (Lidless Stare)', damage: 'necrosi warp', damageType: 'Warp', notes: 'Il terzo occhio: chi lo guarda rischia la morte dell\'anima.' },
    { name: 'Bastone rifinito', fumble: '01-04', damage: 'contusione', size: 'M', damageType: 'Impact' },
  ],
  counters: { fate: 3, insanity: 4, corruption: 3 },
})

const astropath = mkCharacter({
  id: 'arch-astropath',
  name: 'Vania Quill',
  race: 'Umana (Psyker sanzionato)',
  role: 'Astropate Trascendente — Legata all\'Anima',
  professions: [{ name: 'Mystic', level: 6 }],
  description:
    'Cieca dalla Legatura d\'Anima, eppure ti fissa dritto negli occhi. Robe grigie dell\'Adeptus Astra Telepathica, cranio segnato dai sigilli. Sussurra a stelle lontane.',
  history:
    'Sopravvissuta alla Legatura all\'Imperatore che le ha bruciato la vista e temprato la mente. Trasmette messaggi attraverso l\'immaterium — e talvolta sente rispondere qualcosa che non è l\'Imperatore.',
  stats: { St: 48, Co: 58, Ag: 60, Qu: 64, Sd: 92, Re: 75, In: 90, Pr: 62 },
  skills: [
    ['psionici', 'Psionici', 'conoscenze-proibite', 'Re', 'In', 6, 4, 15],
    ['immaterium', 'Immaterium', 'conoscenze-proibite', 'In', 'Sd', 5, 4, 10],
    ['resistenza-psi', 'Resistenza PSI', 'fisiche', 'In', 'In', 6, 2, 10],
    ['resistenza-volonta', 'Resistenza Volontà', 'fisiche', 'Sd', 'Sd', 6, 2],
    ['concentrazione', 'Concentrazione', 'mentali', 'Sd', 'Sd', 5, 4],
    ['focus-mentale', 'Focus mentale', 'mentali', 'Sd', 'Sd', 4, 4],
    ['consapevolezza', 'Consapevolezza', 'percettive', 'In', 'In', 5, 4, 10],
    ['percezione', 'Percezione', 'percettive', 'In', 'Re', 4, 4],
    ['intuizione', 'Intuizione', 'percettive', 'In', 'In', 4, 4],
    ['demonologia', 'Demonologia', 'conoscenze-proibite', 'In', 'Sd', 3, 8],
    ['ordo-inquisitorii', 'Ordo inquisitorii', 'conoscenze-proibite', 'Re', 'In', 2, 8],
    ['imperium', 'Imperium', 'conoscenze-comuni', 'Re', 'In', 2, 2],
    ['ecclesiarchia', 'Ecclesiarchia', 'conoscenze-comuni', 'Re', 'In', 2, 2],
    ['interrogare', 'Interrogare', 'interazione', 'Pr', 'In', 2, 4],
    ['logica', 'Logica', 'mentali', 'Re', 'In', 3, 4],
    ['cifrari-di-battaglia', 'Cifrari di battaglia', 'combattimento', 'In', 'Re', 1, 4],
  ],
  weapons: [
    { name: 'Pugnale rituale', fumble: '01-04', damage: 'lama benedetta', size: 'S', damageType: 'Puncture' },
    { name: 'Telepatia astro (potere psionico)', damage: 'attacco mentale', damageType: 'Psychic', notes: 'Comunicazione e assalto attraverso l\'immaterium.' },
  ],
  counters: { fate: 2, insanity: 5, corruption: 2 },
})

export const archetypes: Archetype[] = [
  { id: rogueTrader.id, name: rogueTrader.identity.name, role: rogueTrader.identity.role!, blurb: 'Lord-Capitano carismatico: comando, commercio e pistola da duello. Regge il gruppo con la Warrant di Trade.', character: rogueTrader },
  { id: archMilitant.id, name: archMilitant.identity.name, role: archMilitant.identity.role!, blurb: 'Maestro d\'armi: bolter, ascia a catena e armature potenziate. La violenza fatta persona negli abbordaggi.', character: archMilitant },
  { id: voidMaster.id, name: voidMaster.identity.name, role: voidMaster.identity.role!, blurb: 'Timoniere del vuoto: pilotaggio, artiglieria di bordo e riflessi da nata-nel-vuoto.', character: voidMaster },
  { id: explorator.id, name: explorator.identity.name, role: explorator.identity.role!, blurb: 'Magos del Mechanicus: tecnologia, archeotech e xeno-arcanologia. Più impianti che carne.', character: explorator },
  { id: navigator.id, name: navigator.identity.name, role: navigator.identity.role!, blurb: 'Navigatore mutante: guida la nave nel warp col terzo occhio. Aristocratico e inquietante.', character: navigator },
  { id: astropath.id, name: astropath.identity.name, role: astropath.identity.role!, blurb: 'Astropate cieco e legato all\'anima: telepatia astro, psionica e resistenza all\'immaterium.', character: astropath },
]
