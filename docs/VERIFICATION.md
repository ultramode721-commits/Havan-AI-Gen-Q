# Verification — 27 October 2026

Story: a student submits a question or starts practice in the React interface; the Node API validates access and input, reads the installed local JSON data, and returns a sourced answer or a deterministically graded exam for rendering.

| Check                                              | Result       | Evidence                                                                                                                                         |
| -------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production build                                   | PASS         | `next build --webpack` compiled, typechecked and generated all seven application/API routes plus the not-found route                             |
| TypeScript                                         | PASS         | Standalone `tsc --noEmit` and the production build's typecheck                                                                                   |
| Automated tests                                    | PASS         | 21 tests, 21 passed, 0 failed                                                                                                                    |
| Empty authoritative datasets                       | PASS         | `npm run validate-data` returned 0 chunks, 0 questions, demo false, issues []                                                                    |
| Production browser navigation                      | PASS         | Chat, settings, predictor setup and UAT setup rendered in the browser                                                                            |
| Browser workspace authorization                    | PASS         | A disposable local QA token unlocked status and subsequent API requests                                                                          |
| Composer → chat API → local JSON → rendered source | PASS         | Query `Explain equivalent open propositions` returned `demo-predicates`, the expected passage and one source disclosure                          |
| Browser exam start                                 | PASS         | A two-question randomized session showed a running 15-minute timer, progress and five A–E radio choices per question                             |
| Browser exam → grading API → report                | PASS         | Submitted answers D / B to the displayed sequence and analogy questions; report showed 100%, 2/2, per-domain scores and both source explanations |
| Real PDF and DOCX parser fixtures                  | PASS         | Both extracted the expected `Havan fixture` text in automated route tests                                                                        |
| Live Groq generation                               | NOT RUN      | No real Groq API key supplied; absent-key behavior and injected DNS-fallback behavior tested                                                     |
| Live image generation                              | NOT RUN      | No Together AI key supplied; clear unavailable-state behavior tested                                                                             |
| Official historical UAT paper fidelity             | NOT VERIFIED | No official JSON banks or referenced folders existed in the reviewed repository tree                                                             |
| All language fluency                               | NOT VERIFIED | Unicode handling tested; no multilingual expert benchmark or native-level guarantee                                                              |
| Mobile device/browser matrix                       | NOT RUN      | Responsive CSS is implemented; no physical-device or full viewport matrix was tested                                                             |
| Public hosting                                     | NOT RUN      | User-facing source package only; no production URL is claimed                                                                                    |

## Automated coverage

Five-choice validation; answer bounds; subject/domain consistency; Unicode tokenization; retrieval relevance/no-match behavior; UAT-only scope; context character budget; shuffle membership; signed-ticket tampering; expiry; deterministic grading; uncalibrated-prediction labeling; concise greeting; strict no-source refusal; sourced extractive output; absent Groq key; malformed chat; answer-key withholding; full signed-exam API scoring; foreign question rejection; cross-origin rejection; body-size limit; text-file extraction; unsupported images; missing image provider; DNS-error fallback; PDF and DOCX extraction; canonical-origin handling behind proxies. Related assertions are grouped into 21 test cases.

## Issues found and corrected

- The sandbox blocks the IPC socket used by the `tsx` CLI. Test/validation scripts now use `node --import tsx`, which ran successfully.
- The managed preview passes Vite-style flags. A cross-platform launcher translates the host/port flags for Next.js.
- Development preview rendered server HTML but did not reliably hydrate in this environment. Full browser verification used the optimized production build through the same preview daemon. Production client interactions worked. Local development outside this preview environment is not independently browser-tested.
- The HTTP preview does not expose `crypto.randomUUID`. Browser-local record IDs now have a compatible random-byte fallback; cryptographic exam signing remains on the server.
- The reverse proxy presents a different internal request origin. A documented explicit `HAVAN_APP_ORIGIN` setting preserves strict origin checks without trusting arbitrary forwarded headers.
- Automatic expiry submission is attempted once, preventing repeated failed network calls each second.

The temporary QA environment and test token were removed before packaging. Authoritative databases remain empty and demo mode defaults to off. No real credentials, generated build output, dependency directory or original reference checkout is included in the ZIP.
