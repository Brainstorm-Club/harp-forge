# HARP 40K Character Builder — Planning di Progetto

**Obiettivo:** SPA web per creare, mantenere e far evolvere schede personaggio HARP (adattamento W40K), con export JSON e PDF modificabile.
**Riferimento architetturale:** [brainstorm-club/dnd-character-builder](https://github.com/brainstorm-club/dnd-character-builder/)

---

## 1. Visione

Un tool che accompagna il personaggio per tutta la vita della campagna, non solo alla creazione. La differenza chiave rispetto al riferimento D&D: là il focus è il *wizard di creazione*; qui il focus è **la manutenzione nel tempo** — livelli che salgono, DP da spendere, impianti che si aggiungono, discrepanze da tracciare col GM.

Tre principi:

1. **Local-first, zero server** — come il riferimento: localStorage, nessun account, nessun tracking. Il JSON è la fonte di verità portabile.
2. **La matematica la fa il tool** — bonus stat, totali skill (Rank + Stat + Spec), subtotali DP, validazione del budget. Mai più errori di somma da 362 vs 350.
3. **Storia del personaggio versionata** — ogni sessione di modifica produce uno snapshot; il diff tra versioni è visibile e esportabile.

---

## 2. Cosa riusare dal riferimento e cosa cambia

### Si riusa (pattern consolidati)
| Elemento | Note |
|---|---|
| Stack: Vue 3 Composition API + TypeScript + Vite | Identico |
| Pinia per stato | Store `character` + store `app` |
| pdf-lib per AcroForm | Stessa tecnica: template PDF con campi editabili |
| JSON import/export con validazione | Stesso approccio, schema diverso |
| PWA + service worker | Utile al tavolo senza rete |
| i18n it/en | Il tavolo è italiano, ma il pattern costa poco |
| localStorage + lista personaggi in home | Identico |
| Deploy GitHub Pages da `/docs` | Identico |

### Cambia (dominio HARP-40K)
| Elemento | D&D 5e (riferimento) | HARP 40K (nostro) |
|---|---|---|
| Creazione | Wizard 9 step, scelte discrete | Budget DP libero su ~80 skill con costi variabili |
| Progressione | Livelli con feature predefinite | DP per livello, spesa libera, costi per professione |
| Stat | 6 ability score, modificatori fissi | 8 stat, bonus + Race + Spec, combo a coppie (Re/In, St/Ag...) |
| Classi | 1 classe + sottoclasse | Doppia professione (es. Cleric/Warrior) che determina i costi skill |
| Extra | Spell slot | Impianti cibernetici con bonus Spec che si propagano sulle skill |
| Ciclo di vita | Crea → esporta | Crea → gioca → avanza → riesporta, in loop |

**Conseguenza principale:** il cuore del tool non è il wizard ma il **foglio di calcolo vivente** (sheet editor) + il **motore di regole configurabile**.

---

## 3. Requisiti funzionali

### MVP (v0.1 — usabile al tavolo)
- **R1. Anagrafica personaggio**: nome, razza, professioni (2 slot), livello, origine, descrizione, background testuale.
- **R2. Editor stat**: 8 stat (St, Co, Ag, Qu, Sd, Re, In, Pr) con valore → bonus automatico (tabella HARP configurabile), colonne Race e Spec, totale calcolato, DP da stat.
- **R3. Editor skill per categorie**: le 11 categorie della scheda (Fisiche, Combattimento, Mentali, Percettive, Interazione, Sotterfugio, Conoscenze comuni/accademiche/proibite, Competenze tecniche, Lingue). Per ogni skill: Cost, coppia Stats, Ranks, bonus Rank (5×rank), bonus Stat (auto dalla combo), Spec, Totale (auto), DP spesi (auto = Cost×Ranks).
- **R4. Budget DP**: budget totale impostabile (es. 350), barra di consumo live, warning su sforamento (non blocco: il GM può derogare).
- **R5. Impianti**: lista impianti con descrizione e bonus; i bonus Spec si agganciano alle skill interessate (es. Augur Array → +10 su Percezione/Intuizione/Consapevolezza).
- **R6. Armi e armatura**: schede arma con OB, Fumble, Gittata, Danno, Taglia, Tipo; armatura con bonus/penalità/totali.
- **R7. Contatori**: Punti Fato, Punti Follia, Punti Corruzione (anche negativi), PF/Endurance, Power Points.
- **R8. Salvataggio locale** + lista personaggi in home.
- **R9. Export/Import JSON** con validazione e messaggi di errore specifici.
- **R10. Export PDF** compilando il template HARP italiano (AcroForm, campi editabili).

### v0.2 — "allineate nel tempo"
- **R11. Versioning**: ogni "commit" del personaggio crea uno snapshot con timestamp e nota (es. "livello 7 — spesi 48 DP post-sessione 12"). Lo storico è navigabile.
- **R12. Diff tra versioni**: vista che evidenzia cosa è cambiato (skill aumentate, impianti aggiunti, DP spesi).
- **R13. Modalità avanzamento**: al level-up il tool propone i DP guadagnati, traccia la spesa della sessione separatamente dal totale, e valida i vincoli (es. rank massimi per livello se il GM li usa).
- **R14. Note GM / discrepanze**: sezione dedicata alle deroghe concordate (es. "sforamento 12 DP autorizzato", "background non conforme al manuale, accettato"). Le deroghe sopravvivono all'export.

### v0.3 — qualità della vita
- **R15. Sistema di regole configurabile**: costi skill per professione, tabella bonus stat, categorie e skill custom caricabili da JSON di configurazione (il "ruleset" del GM diventa un file condivisibile col gruppo).
- **R16. Libreria condivisa di impianti/armi/talenti** (dataset JSON per il setting 40K del gruppo).
- **R17. Stampa scheda compatta** (CSS print) alternativa al PDF.
- **R18. Multi-personaggio per campagna** con vista party (opzionale, per il GM).

### Fuori scope (esplicitamente)
- Sync cloud, account, realtime multi-utente.
- Automazione dei tiri di dado.
- Contenuti proprietari di manuali (solo struttura, i dati li inserisce l'utente o il GM nel ruleset).

---

## 4. Data model (JSON)

```json
{
  "meta": {
    "schemaVersion": "1.0",
    "app": "harp40k-builder",
    "createdAt": "2026-07-22T10:00:00Z",
    "updatedAt": "2026-07-22T10:00:00Z",
    "ruleset": "harp-40k-tavolo-v1"
  },
  "identity": {
    "name": "Pal Ula500",
    "race": "Umana (Forge World)",
    "professions": [
      { "name": "Cleric", "level": 6 },
      { "name": "Warrior", "level": 6 }
    ],
    "origin": "Stygies VIII",
    "description": "…",
    "history": "…",
    "portraitPrompt": "…"
  },
  "stats": {
    "budget": null,
    "values": {
      "St": { "value": 83, "race": 4, "spec": 0 },
      "Re": { "value": 95, "race": 0, "spec": 3 }
    }
  },
  "dp": { "budget": 350, "overrideNote": "GM: +12 concessi" },
  "skills": [
    {
      "id": "uso-tecnologia",
      "category": "competenze-tecniche",
      "name": "Uso Tecnologia",
      "cost": 2,
      "stats": ["Re", "In"],
      "ranks": 7,
      "spec": [{ "value": 15, "source": "MIU + Mechadendrite" }]
    }
  ],
  "implants": [
    {
      "id": "augur-array",
      "name": "Augur Array",
      "description": "…",
      "grants": [
        { "target": "skill:percezione", "type": "spec", "value": 10 },
        { "target": "special", "note": "Dark Vision" }
      ]
    }
  ],
  "weapons": [
    {
      "name": "Strumento Omnissiano",
      "obFormula": "St + rank:wp-ascia + 5",
      "fumble": "01-03",
      "damage": "ascia 2H + campo energetico",
      "size": "M",
      "type": "Slash/Energy",
      "notes": "…"
    }
  ],
  "armour": [],
  "counters": { "fate": 3, "insanity": 5, "corruption": -3, "hp": null, "pp": null },
  "equipment": [],
  "gmNotes": [
    { "date": "2026-07-22", "note": "Sforamento 12 DP autorizzato" }
  ],
  "history": [
    {
      "version": 3,
      "timestamp": "…",
      "label": "Aggiunte skill GM (Medicina, Xenologia, Archeotech, Mutanti)",
      "snapshotRef": "…"
    }
  ]
}
```

**Nota di design:** i totali (bonus stat, totale skill, DP spesi) **non si salvano** — si calcolano sempre. Il JSON contiene solo input. Questo elimina alla radice le incoerenze.

### Ruleset (file di configurazione separato, condivisibile)

```json
{
  "id": "harp-40k-tavolo-v1",
  "statBonusTable": [ { "min": 90, "max": 94, "bonus": 9 }, { "min": 95, "max": 100, "bonus": 10 } ],
  "rankBonus": 5,
  "categories": ["fisiche", "combattimento", "…"],
  "skillCatalog": [
    { "id": "uso-tecnologia", "name": "Uso Tecnologia", "category": "competenze-tecniche", "stats": ["Re","In"], "costByProfession": { "cleric": 2, "warrior": 4, "default": 4 } }
  ],
  "counters": ["fate", "insanity", "corruption"]
}
```

---

## 5. Architettura

```
src/
  components/
    layout/            # header, nav, theme switcher
    sheet/             # StatTable, SkillCategoryTable, ImplantList,
                       # WeaponCard, ArmourTable, CountersBar, DpBudgetBar
    history/           # VersionTimeline, VersionDiff
  composables/
    useCalculations.ts # bonus stat, totali skill, subtotali DP
    usePdfExport.ts    # pdf-lib + field mapping del template HARP
    useValidation.ts   # schema JSON + regole ruleset
    useVersioning.ts   # snapshot, diff, changelog
  data/
    rulesets/          # harp-40k-tavolo-v1.json (default)
    templates/         # dataset impianti/armi di esempio
  stores/
    character.ts       # personaggio corrente
    roster.ts          # lista personaggi salvati
    app.ts             # settings, ruleset attivo
  utils/
    diff.ts            # confronto snapshot
    pdfFieldMapping.ts # nome campo AcroForm → percorso dato
  views/
    HomeView           # roster + import/export
    SheetView          # editor scheda (il cuore del tool)
    HistoryView        # timeline versioni + diff
    RulesetView        # editor/loader ruleset (v0.3)
public/pdf/
  harp-sheet-it.pdf    # template AcroForm della scheda italiana
```

**Scelte tecniche chiave:**
- **Motore di calcolo puro** (`useCalculations`): funzioni pure testabili con Vitest. Tutta la matematica HARP in un modulo solo.
- **Versioning come event log leggero**: array di snapshot completi (i personaggi sono piccoli, <50KB); il diff si calcola on-demand. Niente CRDT o complicazioni.
- **PDF**: il template esistente della scheda HARP italiana va convertito in AcroForm (una tantum, con Acrobat/LibreOffice o script pdf-lib) mappando ~200 campi. È il task più noioso ma senza incognite tecniche.

---

## 6. Roadmap (incrementale, in stile iterativo)

### Epic 1 — Fondamenta (Sprint 1)
- Setup progetto (Vite, Vue3, TS, Pinia, Tailwind, Vitest)
- Schema JSON v1 + validazione
- Motore di calcolo con test (bonus stat, totali skill, DP)
- **Definition of Done:** dato il JSON di Pal Ula500, il motore riproduce esattamente i totali della scheda attuale (73 Uso Tecnologia, 362 DP, ecc.)

### Epic 2 — Sheet Editor (Sprint 2-3)
- Vista scheda completa: stat, skill per categoria, impianti, armi, contatori
- Budget DP live con warning
- Salvataggio localStorage + roster in home
- **DoD:** creo Ula500 da zero nel tool in <30 minuti senza toccare una calcolatrice

### Epic 3 — Portabilità (Sprint 4)
- Export/Import JSON con validazione e messaggi d'errore
- Template PDF AcroForm + export PDF editabile
- **DoD:** il PDF esportato è compilabile in Acrobat e stampabile per il tavolo

### Epic 4 — Tempo (Sprint 5)
- Snapshot/versioni con label, timeline, diff visuale
- Modalità avanzamento (DP di sessione separati)
- Note GM/deroghe
- **DoD:** simulo il passaggio di Ula500 da liv. 6 a 7 e il diff mostra esattamente cosa è cambiato

### Epic 5 — Ruleset & rifiniture (Sprint 6+)
- Ruleset esterno configurabile + editor
- Dataset condivisi (impianti, armi)
- PWA offline, i18n, accessibilità, stampa CSS
- **DoD:** un altro gruppo con un adattamento HARP diverso usa il tool cambiando solo il file ruleset

---

## 7. Rischi e mitigazioni

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Il template PDF non è AcroForm nativo | Ritardo export PDF | Convertirlo una tantum; in alternativa generare il PDF da zero con pdf-lib (layout fisso) |
| Regole del tavolo non formalizzate (costi skill variabili, house rules) | Motore di calcolo instabile | Ruleset esterno fin dal MVP, anche se hardcoded inizialmente; le eccezioni diventano dati, non codice |
| Scope creep verso "VTT completo" | Progetto infinito | Fuori scope esplicito (§3); il tool fa schede, non sessioni |
| Contenuti coperti da copyright (manuali HARP/40K) | Problemi di distribuzione | Il tool distribuisce solo struttura; skill/impianti specifici vivono nel ruleset privato del gruppo |
| Un solo manutentore | Bus factor | Stack identico al repo di riferimento già noto al club → chiunque del Brainstorm Club può contribuire |

---

## 8. Decisioni aperte (da prendere prima dello Sprint 1)

1. **Template PDF:** convertiamo la scheda HARP italiana esistente in AcroForm, o generiamo un PDF nostro con layout nuovo? (La conversione preserva l'estetica familiare; la generazione è più controllabile.)
2. **Granularità del versioning:** snapshot manuale ("commit" esplicito con nota) o automatico a ogni modifica? Proposta: manuale, come git — più significativo per il diff.
3. **Costi skill:** nel vostro adattamento il costo dipende dalla professione o è fisso per skill? Dalla scheda di Mos sembrano fissi per skill — se è così, il ruleset si semplifica molto.
4. **Repo:** nuovo repository nel Brainstorm Club dedicato a queste schede
5. **Nome del progetto:** `harp-forge` (la fucina delle schede, tema Forge World incluso).
