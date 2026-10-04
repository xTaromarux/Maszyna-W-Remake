# Application types

This is the single location for application interfaces, type aliases and enums. Components and shared utilities import these contracts with `import type`; enums that are also used as values use normal imports.

- `components.ts`: React props, events and callbacks, including generic segmented controls.
- `simulator.ts`: register values, settings, signals, execution state, actions, subscriptions and logs.
- `chat.ts`: messages, streamed replies, health responses, rate limits, component state and worker lifecycle.
- `colors.ts`: RGB/HSV data and LED brightness payloads.
- `common.ts` and `react.d.ts`: common callbacks, number formats and CSS custom properties.
- `assemblerIR.ts`, `model.ts`, `registry.ts`, `instructions.ts`, `parser.ts`, `commandAdapter.ts`, `microGenerator.ts`, `asmPipeline.ts`: compiler and runtime contracts.
- `diagnostics.ts`, `errors.ts`, `editor.ts`, `mnemonics.ts`: error details, editor completions and command aliases.

The migration was checked against commit `b60e154`, including the chat configuration (now `src/Components/AiChat/ChatConfig.ts`), the assembler types, the editor contracts and the Vue components' props. React-specific state and callback contracts describe the current implementation. Conditional microcode retains source-line and branch metadata without `any` casts.

`npm run typecheck` checks all `.ts` and `.tsx` application files with `strict: true`. Generated Lezer parsers and existing JavaScript language/data modules remain importable through `allowJs`; React components and shared utilities use `.tsx` and `.ts` respectively. TypeScript errors also fail the production build.
