# HARP Forge

SPA per **creare, mantenere e far evolvere nel tempo** schede personaggio HARP
(adattamento Warhammer 40K di un tavolo). Local-first: `localStorage`, zero
server, zero tracking. Il JSON del personaggio è la fonte di verità portabile.

Riferimento architetturale: [Brainstorm-Club/dnd-character-builder](https://github.com/Brainstorm-Club/dnd-character-builder).

## Filosofia

- **La matematica la fa il tool.** Bonus stat, totali skill, DP spesi, budget:
  tutto ricalcolato dal motore. Il JSON contiene *solo input*, mai i totali —
  così spariscono alla radice gli errori di somma a mano.
- **Regole di gioco = dati, non codice.** Le regole del tavolo vivono in un
  *ruleset* JSON condivisibile, non hardcoded nei componenti.
- **Local-first.** Nessun account, nessun backend.

Le regole di dominio HARP-40K e i test di accettazione obbligatori sono in
[`CLAUDE.md`](./CLAUDE.md); il planning completo in
[`planning-harp-builder.md`](./planning-harp-builder.md).

## Sviluppo

```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run test     # motore di calcolo — test Vitest
npm run build    # type-check + build in docs/ (pubblicato via GitHub Pages)
```

## Stato

**Epic 1 (fondamenta) — completo.** Modello dati, motore di calcolo puro,
ruleset default e fixture golden `pal-ula500`. Il motore riproduce esattamente
i totali della scheda reale (Uso Tecnologia 73, Tecno-Eresie 50, Tiri Salvezza
18/18/22, DP-da-stat 48). Prossimo: Epic 2 — sheet editor.

## Deploy

Build statico in `docs/`, pubblicato con **GitHub Pages** (source: branch
`main`, cartella `/docs`) su `https://brainstorm-club.github.io/harp-forge/`.
