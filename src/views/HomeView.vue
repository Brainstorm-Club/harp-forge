<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { ula500 } from '@/fixtures'

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
  <main class="wrap">
    <h1>Le tue schede HARP</h1>
    <p class="sub">Crea e mantieni i personaggi del tavolo. Tutto in locale, nel tuo browser.</p>

    <div class="toolbar">
      <button class="btn" type="button" @click="newCharacter">＋ Nuova scheda</button>
      <button class="btn btn--ghost" type="button" @click="pickFile">⤒ Importa JSON</button>
      <button class="btn btn--ghost" type="button" @click="loadExample">Carica esempio (Ula500)</button>
      <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFile" />
    </div>
    <p v-if="importError" class="hint" role="alert">{{ importError }}</p>

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
          <button class="btn" type="button" @click="open(c.id)">Apri</button>
          <button class="btn btn--ghost" type="button" @click="store.remove(c.id)">Elimina</button>
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
</style>
