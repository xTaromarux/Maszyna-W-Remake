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
