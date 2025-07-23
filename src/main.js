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



const keywords = [
  "stp","dod","ode","pob","lad","sob","som","soz",
  "dns","pwr","pzs","sdp","dzi","mno","wpr","wyp"
];

export default function registerMacroW(monaco) {
  const id = "macroW";

  monaco.languages.register({ id });
  monaco.languages.setMonarchTokensProvider(id, {
    defaultToken: "",
    tokenPostfix: ".mwmac",
    keywords,
    tokenizer: {
      root: [
        [/[A-Za-z_]\w*:/, "label"],
        [new RegExp(`\\b(${keywords.join("|")})\\b`, "i"), "keyword"],
        [/\b(IF|THEN|ELSE)\b/, "keyword"],
        [/@[A-Za-z_]\w*/, "label"],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/\s+/, "white"]
      ]
    }
  });

  monaco.editor.defineTheme("macroTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", fontStyle: "bold" },
      { token: "number",  foreground: "098658" },
      { token: "label",   foreground: "795E26", fontStyle: "italic" }
    ],
    colors: {
      "editor.foreground":                "#000000",
      "editor.background":                "#FCFCFC",
      "editorCursor.foreground":          "#000000",
      "editor.lineHighlightBackground":   "#F5F5F5",
      "editor.selectionBackground":       "#C8E1FF",
      "editor.inactiveSelectionBackground":"#E5EBF5",
      "editorLineNumber.foreground":      "#666666"
    }
  });
}


export default function registerMaszynaW(monaco) {
  const id = "maszynaW";

  monaco.languages.register({ id });
  monaco.languages.setMonarchTokensProvider(id, {
    defaultToken: "",
    tokenPostfix: ".mw",
    keywords: [
      "il","dl","wyl","wel","wyad","wea","wei","wys","wes",
      "czyt","pisz","as","sa","dod","ode","przep","mno","dziel",
      "shr","shl","neg","lub","i","iak","dak","weak","weja","wyak","stop"
    ],
    tokenizer: {
      root: [
        [/[A-Za-z_]\w*:/, "label"],
        [/[A-Za-z_]\w*/, {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier"
          }
        }],
        [/\d+/, "number"],
        [/[;,.]/, "delimiter"],
        [/\s+/, "white"]
      ]
    }
  });

  monaco.editor.defineTheme("mwTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", fontStyle: "bold" },
      { token: "number", foreground: "098658" },
      { token: "label",  foreground: "795E26", fontStyle: "italic" }
    ],
    colors: {
      "editor.foreground":               "#000000",
      "editor.background":               "#FFFFFF",
      "editorCursor.foreground":         "#000000",
      "editor.lineHighlightBackground":  "#F0F8FF",
      "editor.selectionBackground":      "#ADD6FF",
      "editor.inactiveSelectionBackground":"#E5EBF1",
      "editorLineNumber.foreground":     "#888888"
    }
  });
}




