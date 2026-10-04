# Shared utilities

Reusable functions live in `src/Shared/Utils`, imported through `@/Shared/Utils/<module>` in UI code or relative paths in framework-independent modules.

| Module                | Responsibility                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- |
| `Numbers.ts`          | Clamping, positive modulo (including BigInt), signed/unsigned words, radix formatting |
| `RegisterInput.ts`    | Exact integer parsing of decimal, hexadecimal and binary register input               |
| `Colors.ts`           | HSV/RGB/hex conversions and LED brightness data                                       |
| `CommandMnemonics.ts` | Command aliases, case normalization and locale fallback chains                        |
| `Storage.ts`          | Safe local storage access; `null` removes a key, failed reads return the fallback     |
| `Json.ts`             | JSON-compatible cloning, including observable proxies                                 |
| `Async.ts`            | Timer-based delays, including yielding during fast execution                          |
| `Identifiers.ts`      | Prefixed identifiers with a UUID fallback                                             |

Import modules directly. Utilities have no React, Next.js, component or store dependencies and do not access browser globals at import time. Storage access happens only inside its functions and tolerates server rendering and disabled browser storage.

Keep component lifecycle, callbacks, simulator operations and protocol-specific behavior in their owning features. Static command and laboratory catalogs remain in `src/Shared/Utils/Data`. JSON cloning deliberately retains JSON serialization semantics; it is not a general clone for dates, sets or BigInt.

Utility functions are implemented in TypeScript; static catalogs in Data are JavaScript. Named utility contracts are defined in `src/Types`; import them from there rather than from component files. `Errors.ts` reads error messages from unknown caught values. Redundant signed-word and mnemonic-normalization wrappers have been removed from the store and compiler.
