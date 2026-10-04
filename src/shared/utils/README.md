# Shared utilities

Reusable functions live in `src/shared/utils`, imported through `@/shared/utils/<module>` in UI code or relative paths in framework-independent modules.

| Module                | Responsibility                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- |
| `numbers.ts`          | Clamping, positive modulo (including BigInt), signed/unsigned words, radix formatting |
| `registerInput.ts`    | Exact integer parsing of decimal, hexadecimal and binary register input               |
| `colors.ts`           | HSV/RGB/hex conversions and LED brightness data                                       |
| `commandMnemonics.ts` | Command aliases, case normalization and locale fallback chains                        |
| `storage.ts`          | Safe local storage access; `null` removes a key, failed reads return the fallback     |
| `json.ts`             | JSON-compatible cloning, including observable proxies                                 |
| `async.ts`            | Timer-based delays, including yielding during fast execution                          |
| `identifiers.ts`      | Prefixed identifiers with a UUID fallback                                             |

Import modules directly. Utilities have no React, Next.js, component or store dependencies and do not access browser globals at import time. Storage access happens only inside its functions and tolerates server rendering and disabled browser storage.

Keep component lifecycle, callbacks, simulator operations and protocol-specific behavior in their owning features. Static command and laboratory catalogs remain in `src/utils/data`. JSON cloning deliberately retains JSON serialization semantics; it is not a general clone for dates, sets or BigInt.

All implementations are TypeScript. Named utility contracts are defined in `src/types`; import them from there rather than from component files. `errors.ts` reads error messages from unknown caught values. Redundant signed-word and mnemonic-normalization wrappers have been removed from the store and compiler.
