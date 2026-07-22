/* ==========================================================================
   Brainstorm Club — Design System · gestione unificata del tema
   --------------------------------------------------------------------------
   UNO switch per tutte le app (sito, character builder, Harp Forge, tracker).
   Default = carbone (scuro); il chiaro (carta) si attiva col toggle e si
   ricorda (localStorage). Zero configurazione: metti un pulsante con
   l'attributo data-bsc-theme-toggle e chiama initTheme().

     import { initTheme } from '@brainstorm/design-system/theme.js'
     initTheme()

     <button class="bsc-theme-toggle" data-bsc-theme-toggle aria-label="Cambia tema">◐</button>

   Per evitare il "flash" al caricamento, aggiungi nell'<head>, PRIMA del CSS:
     <script>try{document.documentElement.setAttribute('data-theme',
       localStorage.getItem('bsc-theme')||'dark')}catch(e){}</script>

   In un framework (Vue/React) usa getTheme()/setTheme()/toggleTheme() e
   ascolta l'evento `bsc:themechange` per aggiornare la UI.
   ========================================================================== */

import { getTheme, setTheme, THEME_KEY } from './tokens.js';

export { getTheme, setTheme, THEME_KEY };

/** Alterna carbone ⇄ carta. Ritorna il nuovo tema. */
export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/** Allinea l'aspetto dei pulsanti [data-bsc-theme-toggle] al tema attivo. */
function syncToggles() {
  const t = getTheme();
  document.querySelectorAll('[data-bsc-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(t === 'light'));
    btn.setAttribute('aria-label', t === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro');
    const icon = btn.querySelector('[data-bsc-theme-icon]');
    const glyph = t === 'dark' ? '◐' : '◑';
    if (icon) icon.textContent = glyph;
    else if (!btn.children.length) btn.textContent = glyph;
  });
}

/** Applica il tema persistito (o scuro di default) e collega tutti i toggle. */
export function initTheme() {
  if (typeof document === 'undefined') return;
  setTheme(getTheme());          // riafferma persistito/default + notifica
  syncToggles();
  document.addEventListener('bsc:themechange', syncToggles);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-bsc-theme-toggle]');
    if (btn) { e.preventDefault(); toggleTheme(); }
  });
}

export default initTheme;
