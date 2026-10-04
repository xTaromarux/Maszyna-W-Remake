# Shared types

Only contracts shared across independent areas live here:

- Common.ts: callbacks, timers, translations and JSON values.
- Numbers.ts: number formats and formatting callbacks.
- Colors.ts: RGB/HSV values and color selections.
- React.ts: common element props and CSS custom properties.
- ReactStyles.d.ts: React's CSS custom property declaration extension.

Component props live beside their owning component in Types.ts. Machine state,
laboratory data and ESP color updates belong to src/Machine/Types. Compiler
contracts belong to src/Assembler/Types. Chat state and its React-free worker
protocol belong to src/Components/AiChat/Types.

Import contracts directly with import type. npm run typecheck checks the
application and the chat worker with separate DOM and Web Worker environments.
