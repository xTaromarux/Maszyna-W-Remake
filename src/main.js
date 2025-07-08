// src/main.ts
import '@/styles/main.scss'
import { createApp } from 'vue'
import App from './App.vue'
import 'monaco-editor/min/vs/editor/editor.main.css'

// 1. Importujemy instancję Monaco z paczki
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

// 2. Rejestrujemy własne języki na tej instancji
import registerMaszynaW from './monaco-langs/maszynaW'
import registerMacroW  from './monaco-langs/macroW'

registerMaszynaW(monaco)
registerMacroW(monaco)

// 3. Tworzymy aplikację i podłączamy plugin, przekazując monaco
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'

const app = createApp(App)

app.use(VueMonacoEditorPlugin, {
  // przekazujemy tę samą instancję, na której zarejestrowaliśmy języki
  monaco,
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'
  }
})

// 4. Mount
app.mount('#app')
