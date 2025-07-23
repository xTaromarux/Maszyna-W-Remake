const keywords = [
  "stp", "dod", "ode", "pob", "ład", "sob", "som", "soz",
  "dns", "pwr", "pzs", "sdp", "dzi", "mno", "wpr", "wyp"
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
        // Etykieta (np. START:)
        [/^[ \t]*[a-zA-Z\u00C0-\u017F_][\w\u00C0-\u017F]*:/, "label"],

        // Rozkazy (np. ład, stp) – uwzględniamy polskie znaki
        [/[a-zA-Z\u00C0-\u017F_][\w\u00C0-\u017F_]*/, {
          cases: {
            "@keywords": "keyword",
            "IF|THEN|ELSE": "keyword",
            "@default": "identifier"
          }
        }],

        // Adres pośredni (@etykieta)
        [/@[a-zA-Z\u00C0-\u017F_][\w\u00C0-\u017F_]*/, "label"],

        // Liczby całkowite tylko jeśli samodzielne (nie część identyfikatora!)
        [/\b\d+\b/, "number"],

        // Znaki interpunkcyjne
        [/[;,.]/, "delimiter"],

        // Białe znaki
        [/\s+/, "white"]
      ]
    }
  });

  monaco.editor.defineTheme("macroTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "0000AA", fontStyle: "bold" },
      { token: "number", foreground: "098658" },
      { token: "label", foreground: "795E26", fontStyle: "italic" }
    ],
    colors: {
      "editor.foreground": "#000000",
      "editor.background": "#FCFCFC",
      "editorCursor.foreground": "#000000",
      "editor.lineHighlightBackground": "#F5F5F5",
      "editor.selectionBackground": "#C8E1FF",
      "editor.inactiveSelectionBackground": "#E5EBF5",
      "editorLineNumber.foreground": "#666666"
    }
  });
}
