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
