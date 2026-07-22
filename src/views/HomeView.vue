<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { ula500 } from '@/fixtures'
import { archetypes, type Archetype } from '@/data/archetypes'

const store = useCharacterStore()
const router = useRouter()
const importError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function newCharacter() {
  store.newCharacter()
  router.push('/scheda')
}

function open(id: string) {
  store.load(id)
  router.push('/scheda')
}

function loadExample() {
  store.importJson(JSON.stringify(ula500))
  store.character.id = crypto.randomUUID() // a fresh copy, not the fixture id
  router.push('/scheda')
}

function loadArchetype(a: Archetype) {
  store.importJson(JSON.stringify(a.character))
  store.character.id = crypto.randomUUID() // a fresh, independent copy
  router.push('/scheda')
}

function pickFile() {
  importError.value = ''
  fileInput.value?.click()
}

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    store.importJson(await file.text())
    router.push('/scheda')
  } catch (err) {
    importError.value = `Import fallito: ${(err as Error).message}`
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

function professions(c: (typeof store.roster)[number]): string {
  return c.identity.professions.map((p) => `${p.name || '—'} L${p.level}`).join(' / ')
}
</script>

<template>
  <main id="contenuto" class="wrap" tabindex="-1">
    <h1>Le tue schede HARP</h1>
    <p class="sub">Crea e mantieni i personaggi del tavolo. Tutto in locale, nel tuo browser.</p>

    <div class="toolbar">
      <button class="btn" type="button" @click="newCharacter">＋ Nuova scheda</button>
      <button class="btn btn--ghost" type="button" @click="pickFile">⤒ Importa JSON</button>
      <button class="btn btn--ghost" type="button" @click="loadExample">Carica esempio (Ula500)</button>
      <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />
    </div>
    <p v-if="importError" class="hint" role="alert">{{ importError }}</p>

    <h2 id="archetipi-heading">Parti da un archetipo <span class="hint">· mondo di Rogue Trader</span></h2>
    <ul class="archetypes" aria-labelledby="archetipi-heading">
      <li v-for="a in archetypes" :key="a.id" class="arch-card">
        <span class="arch-card__name">{{ a.name }}</span>
        <span class="arch-card__role">{{ a.role }}</span>
        <span class="arch-card__blurb">{{ a.blurb }}</span>
        <button
          class="btn btn--ghost btn--sm"
          type="button"
          :aria-label="`Usa l'archetipo ${a.name} (${a.role})`"
          @click="loadArchetype(a)"
        >
          Usa questo archetipo →
        </button>
      </li>
    </ul>

    <h2>Roster · {{ store.roster.length }} {{ store.roster.length === 1 ? 'personaggio' : 'personaggi' }}</h2>

    <p v-if="!store.roster.length" class="sub">
      Nessuna scheda salvata. Crea la prima con <strong>Nuova scheda</strong> o parti dall'esempio.
    </p>

    <ul v-else class="roster">
      <li v-for="c in store.roster" :key="c.id" class="roster__card">
        <div class="roster__main">
          <span class="roster__name">{{ c.identity.name || 'Senza nome' }}</span>
          <span class="hint">{{ c.identity.race }}</span>
          <span class="hint">{{ professions(c) }}</span>
        </div>
        <div class="roster__actions">
          <button class="btn" type="button" :aria-label="`Apri ${c.identity.name || 'scheda'}`" @click="open(c.id)">Apri</button>
          <button class="btn btn--ghost" type="button" :aria-label="`Elimina ${c.identity.name || 'scheda'}`" @click="store.remove(c.id)">Elimina</button>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.roster { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.6rem; }
.roster__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: var(--panel);
}
.roster__main { display: flex; flex-direction: column; gap: 0.1rem; }
.roster__name { font-family: var(--font-display); font-weight: 700; }
.roster__actions { display: flex; gap: 0.5rem; }

.archetypes {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.7rem;
}
.arch-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  background: var(--panel);
}
.arch-card__name { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; }
.arch-card__role { color: var(--gold); font-size: 0.82rem; }
.arch-card__blurb { color: var(--muted); font-size: 0.86rem; flex: 1; }
.arch-card .btn { align-self: flex-start; margin-top: 0.2rem; }
</style>
