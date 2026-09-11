# Settings, chat and proxy migration

The settings, author panels, lab catalogue, top bar and AI chat now render as React components. They do not load Vue at runtime. Existing translation keys, social links, layout classes and persisted chat keys are retained.

## Preserved behaviour

- Settings retain theme, Polish/English, DEC/HEX/BIN, signed decimal, bit widths, both execution delays, six independent extras, I/O/stack/interrupt groups, autocomplete, reset-after-compile, register reset, default settings and lab/command catalogues.
- Bit inputs follow the engine's safe bounds: 1–16 bits per field, at most 30 bits per word.
- The ESP colour picker retains the canvas colour wheel, swatches, HSV brightness, LED power, preview and queued colour updates. The popup uses a React portal so a transformed settings panel cannot clip its fixed overlay. Reopening a colour retains its base RGB and avoids applying LED power twice.
- Chat retains local history (40 stored messages), API-key entry/edit/show/hide/delete, suggestions, timestamps, cancellation, reset, panel resizing, local session ID and response typing animation. API keys still use local browser storage with the existing visible storage/sharing notices.
- Code blocks render as React text nodes and support copying. Model responses are never injected as HTML.

The worker is created from a relative `new URL('../workers/chat.worker.js', import.meta.url)` inside the client component. It accepts the established `{query, api_key, history}` request shape and `X-Session-Id` header. JSON response variants and plain text are supported; SSE responses additionally support split events, split UTF-8 characters, delta chunks and `[DONE]`. The original application animated completed JSON responses and did not implement network streaming.

## Configuration

| Variable | Runtime | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_PLATFORM` | Next build | `esp` exposes connection status and LED colour controls. |
| `NEXT_PUBLIC_API_URL` | Next build | Chat endpoint; defaults to `/api/chat`. Use an absolute URL for a static export hosted without a proxy. |
| `NEXT_PUBLIC_HEALTH_URL` | Next build | Optional explicit health endpoint. By default the final `/api/chat` or `/chat` is replaced with `/health`. |
| `API_PROXY_TARGET` | Next configuration | Server-side proxy destination configured by the Next application. |
| `HF_TARGET_URL` or `HF_SPACE` | Proxy server | Upstream chat service URL or `owner/space` slug. |
| `ALLOWED_ORIGINS` | Proxy server | Comma-separated browser origins allowed to call the proxy. Include the deployed website origin when it calls the proxy directly. |
| `PORT` | Proxy server | Proxy listening port; default `8787`. |
| `BODY_LIMIT_MB` | Proxy server | JSON body limit; default 2 MB, bounded to 1–16 MB. |

`NEXT_PUBLIC_*` values are public build configuration. A provider key must not be put in those variables. CORS restricts browser origins; it is not authentication. The migration does not add authentication or change who may use an existing proxy deployment.

## Audit findings and fixes

The old chat component and worker derived different health URLs. The worker also tried `response.text()` after failed `response.json()`, even though the body had already been consumed. Both issues are fixed. Requests now have a 120-second worker deadline, cancellation reaches pending requests and health checks, and HTTP 4xx responses are not retried. Upstream error bodies are not echoed to the UI, as they may contain diagnostics or submitted keys. The current query is sent separately from prior history, avoiding duplication of that turn.

The proxy's former timeout stopped at receipt of response headers; a stalled response body could hang indefinitely. A rejected fetch also left its timeout pending. Timeouts now cover body consumption and always clean up, and a disconnected caller aborts the upstream call.

Both `/api/chat` and `/health` have separate 60-request/minute limits. Chat validates the request before forwarding: nonempty string query (up to 32,000 characters), nonempty string key (up to 4,096 characters), at most 40 history turns with `user`/`assistant` roles and string messages (up to 64,000 characters each). Malformed bodies and disallowed origins return structured errors. Non-success upstream responses retain their status and optional `Retry-After` header without exposing the raw error body.

The old health fallback for an upstream without `/health` is retained: it posts a small synthetic query with a literal `health-check` key to `/chat`. This may report the upstream unhealthy when it requires a real provider key. Deployments should implement the upstream `/health` endpoint for reliable readiness checks. Successful proxy responses remain buffered; direct SSE endpoints can stream progressively through the browser worker.

The separate proxy package still owns Express, CORS, dotenv and express-rate-limit. Next, React and CodeMirror belong to the website package. Dependency resolution and vulnerability audit results are recorded with the main migration work.

## Verification

Install the main and proxy dependencies before running the full test suite:

```sh
npm ci
npm ci --prefix hf-proxy
npm test
```

`tests/chat-worker.test.ts` covers JSON variants, plain text, byte-split SSE/UTF-8, cancellation, client-error retry prevention, sanitized errors, wake/retry, missing-key validation and stream-error cleanup. `tests/chat-proxy.test.ts` exercises real loopback HTTP servers for health/chat/CORS, input rejection, sanitized upstream errors, a response that stalls after sending headers and legacy health fallback. These tests do not use an external service or real API key. All 13 worker/proxy tests passed during the migration.

`tests/e2e/chat.spec.ts` also passed all three tests against the production Next server in Chrome: local API-key save/show/hide/reload/delete, a genuine browser worker rendering a mocked reply with safe code copying and persisted history, and cancellation followed by another successful message. Browser-context routing mocks every chat/health endpoint and blocks other external origins. These tests use only a deliberately invalid dummy key. To run them against an already built site:

```sh
npm exec -- playwright test tests/e2e/chat.spec.ts
```

Set `PLAYWRIGHT_CHANNEL=chrome` to use an installed Chrome, or install Playwright's Chromium through the project browser setup.

Live AI answers still require a configured, available upstream and a valid key supplied by the user. Hardware communication requires the existing ESP service. These external services were not exercised by the isolated tests.
