# CLAUDE.md — HARP 40K Character Builder

Contesto per lo sviluppo. Leggere prima di scrivere codice.

## Cos'è questo progetto

SPA per creare e mantenere nel tempo schede personaggio **HARP standard adattato a Warhammer 40K** (homebrew di un tavolo specifico). Riferimento architetturale: [brainstorm-club/dnd-character-builder](https://github.com/brainstorm-club/dnd-character-builder/) — stesso stack (Vue 3 + TS + Vite + Pinia + Tailwind + pdf-lib + Vitest), stesso design system Brainstorm Club, stessa filosofia local-first (localStorage, zero server, zero tracking).

Il planning completo è in `docs/planning-harp-builder.md`. Le 5 decisioni aperte in fondo al planning vanno risolte col maintainer prima di implementare le parti interessate.

## Regole di dominio HARP-40K (NON inferire, NON inventare)

Queste regole vengono dalla scheda reale di riferimento e dal tavolo. Sono la fonte di verità; in caso di dubbio chiedere, non improvvisare.

### Statistiche
- 8 stat: **St, Co, Ag, Qu, Sd, Re, In, Pr** (Forza, Costituzione, Agilità, Rapidità, Volontà/Self-Discipline, Ragionamento, Intuizione, Presenza).
- Ogni stat ha: valore grezzo (1-100+) → **bonus da tabella HARP standard** + modificatore **Race** + modificatore **Spec** = totale.
- Punti dalla tabella osservati sulla scheda di riferimento: 99→10, 95→9, 94→9, 92→9, 91→9, 83→7, 76→6, 71→5, 62→3, 60→2, 59→2, 57→2, 48→0, 20→-6. Usare la tabella ufficiale HARP per il resto.
- Le stat generano anche DP (colonna DPs sulla scheda).

### Skill
- Formula del totale: **Totale = (Ranks × 5) + bonus combo stat + Spec**.
- La combo stat è la **somma dei bonus totali** delle due stat della skill (es. Re/In con Re tot 12 e In tot 11 → 23).
- Il **costo per rank è fisso per skill** (valori osservati: 2, 4, 6, 8) e stampato sulla scheda. DP spesi = Cost × Ranks.
- 11 categorie (nomi italiani esatti della scheda): Abilità Fisiche, Abilità di Combattimento, Abilità Mentali, Abilità Percettive, Abilità di Interazione, Abilità di Sotterfugio, Conoscenze Comuni, Conoscenze Accademiche, Conoscenze Proibite, Competenze Tecniche, Lingue. (La scheda cartacea ha anche Abilità Artistiche e Sopravvivenza.)
- Skill 40K custom esistono e sono normali (es. "Tecno-Eresie", "Immaterium", "Tecnomanzia", "Resistenza PSI"). Il catalogo vive nel **ruleset JSON**, non nel codice.

### Contatori speciali (adattamento 40K)
- **Punti Fato** (interi ≥ 0)
- **Punti Follia** (interi ≥ 0)
- **Punti Corruzione** — **può essere negativo** (es. -3): non usare `unsigned`/clamp a zero.
- Tiri Salvezza: Tempra = 2×bonus Co, Volontà = 2×bonus Sd, PSI = 2×bonus In (+ race + other).
- PF (endurance) e Power Points con progressioni proprie.

### Impianti cibernetici
- Un impianto concede bonus **Spec** a skill specifiche (es. Augur Array → +10 su Percezione, Intuizione, Consapevolezza; MIU + Mechadendrite → +15 su Uso/Riparare Tecnologia).
- I bonus degli impianti devono **propagarsi automaticamente** alla colonna Spec delle skill collegate: modello `grants: [{target, type, value}]`.
- Un impianto può anche dare capacità non numeriche (Dark Vision, rigenerazione): campo note/effetti.

### Doppia professione
- Un personaggio ha fino a **2 professioni** (es. Cleric/Warrior) con livello. Nell'attuale adattamento i costi skill sono fissi per skill, quindi la professione è (per ora) descrittiva — ma il ruleset deve prevedere `costByProfession` per estensioni future.

### Budget DP
- Budget impostabile (caso reale: 350). Lo sforamento genera **warning, non blocco**: il GM può derogare, e la deroga va registrata in `gmNotes` (esiste il caso reale "sforamento di 12 DP concesso").

## Test di accettazione (obbligatorio)

`fixtures/pal-ula500.json` è una scheda reale completa. Il motore di calcolo DEVE riprodurre esattamente questi valori chiave:

| Verifica | Atteso |
|---|---|
| Bonus totale Re (95, spec +3) | 12 |
| Bonus totale In (94, spec +2) | 11 |
| Bonus totale Pr (20) | -6 |
| Combo Re/In | 23 |
| Uso Tecnologia (7 rank, cost 2, spec +15) | totale 73, DP 14 |
| Tecno-Eresie (3 rank, cost 8, spec +15, combo In/Sd 20) | totale 50, DP 24 |
| Leadership (0 rank, combo Pr/Pr) | totale -12 |
| Somma DP totale | 362 (budget 350, deroga GM +12) |
| Corruzione | -3 (negativo!) |

Scrivere questi come test Vitest nel primo sprint. Se un refactor li rompe, il refactor è sbagliato.

## Convenzioni di codice

- I **totali non si persistono mai**: JSON = solo input, tutto il derivato si calcola (`useCalculations.ts`, funzioni pure, testate).
- Regole di gioco = **dati nel ruleset JSON**, mai hardcoded nei componenti. Eccezioni del tavolo = dati, non `if` nel codice.
- Lingua UI primaria: **italiano** (i18n con en come seconda; i nomi delle skill NON si traducono, sono contenuto utente).
- Terminologia: attenzione ai false friend. "Rank" resta "rank" (non "grado"), "Spec" resta "Spec", "DP" (Development Points) resta "DP". Non inventare neologismi.
- Il PDF di riferimento (scheda HARP italiana, 5 pagine, A4) è in `public/pdf/`. Il mapping campi AcroForm sta in `utils/pdfFieldMapping.ts` — un solo file, noioso ma isolato.
- Versioning personaggio: snapshot completi con label esplicita (stile commit git), diff calcolato on-demand. Niente CRDT, niente event sourcing complicato.

## Cosa NON fare

- Non aggiungere backend, account, analytics.
- Non importare contenuti di manuali HARP/GW nel repo: solo struttura; i dati specifici vivono nel ruleset privato del gruppo.
- Non "correggere" i numeri delle fixture perché sembrano strani (es. Corruzione negativa, sforamento DP): sono intenzionali.
- Non trasformare il tool in un VTT: fa schede, non sessioni di gioco.
