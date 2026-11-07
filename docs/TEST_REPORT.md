# Test report

Run date: 7 November 2026

## Environment

- Node.js 24.18.1
- npm 11.6.0
- Dependencies were installed from the checked-in package lock after the initial checkout was found without node_modules.
- No application environment secrets or provider credentials were supplied.
- Source-control scan: .env.example was the only environment file; a credential-pattern scan found no likely keys or private-key blocks. This was a bounded scan, not a complete secret-scanning service.

## Baseline results

| Check | Result | Details |
| --- | --- | --- |
| npm test | PASS | 21 tests passed; 0 failed. |
| npm run typecheck | PASS | TypeScript completed with no diagnostics. |
| npm run validate-data | PASS | 0 chunks, 0 questions, demo false, no schema issues. |
| npm run build | PASS | Next.js 16.4.3 production build completed; seven API routes and the application page were emitted. |

The suite covers schema and domain validation, Unicode tokenization, retrieval limits, exam shuffling and signing, deterministic grading, strict/general chat boundaries, request validation and origin checks, PDF/DOCX text extraction, image-provider failure behavior, and Groq fallback behavior.

## Milestone 1 interface verification

| Check | Result | Details |
| --- | --- | --- |
| npm test | PASS | 21 tests passed; 0 failed. |
| npm run typecheck | PASS | TypeScript completed with no diagnostics after the production build generated Next.js types. |
| npm run build | PASS | Next.js production build completed and emitted the app page and API routes. |

The milestone adds an auto-growing message field, a document preview with type and size, upload status separate from response generation, and a generation glow attached to the live request state. The existing academy logo has a shimmer animation unless reduced motion is enabled. A browser preview was not available in this environment, so visual device coverage remains unverified.

## Milestone 2 model routing verification

The model routing suite verifies that Havan Pro sends its configured model to Groq, Havan 2.5 Sol sends its configured model to the server-configured Qwen endpoint, provider readiness contains no credentials, and Jarvis reports a clear not-connected error without Qwen configuration. Live provider calls were not made because no provider credentials were supplied. No direct OpenAI API route was added.

Latest checks on 8 November 2026: `npm test` passed 25/25, `npm run typecheck` passed, and `npm run build` passed. The four added routing tests use mocked provider responses and do not incur provider charges.

## End-to-end student scenario plan

This plan is required before the broader learning features are considered complete. These scenarios were not executed in this audit. Items depending on absent features are marked blocked, not passed.

| # | Student scenario | Expected result | Status |
| --- | --- | --- | --- |
| 1 | Ask a Mathematics question in strict mode | Answer uses a relevant installed passage or clearly says the source is unavailable. | Not run; authoritative data is empty. |
| 2 | Ask for a physics equation and explanation | Equation renders with KaTeX and the answer states its source or uncertainty. | Not run; no physics source data is installed. |
| 3 | Upload a PDF before sending a question | Extracted text is shown as an unverified reference and stays attached until send or removal. | Partially covered by parser unit tests; full UI flow not run. |
| 4 | Ask about a specific page in an uploaded PDF | The answer gives a page reference only when extraction metadata supports it. | Not run; page-aware chat retrieval is not implemented. |
| 5 | Ask for a chemistry reaction equation | The equation renders clearly and is not presented as scientifically validated without a source. | Not run; chemistry source data is absent. |
| 6 | Complete a quiz and request explanations | Server-side answer keys determine the score and each response includes the stored explanation. | API grading is covered by unit tests; full student browser flow not run. |
| 7 | Ask a current-events question requiring live search | Retrieved sources and citations are visible and distinguishable from generated explanation. | Blocked; live search is not implemented. |
| 8 | Save and restore a conversation | The same browser profile can restore local history; no cloud sync is claimed. | Not run end-to-end; localStorage is used. |
| 9 | Ask a question in a non-English language | General mode responds in the selected language when supported and does not claim native-level quality. | Not run against a live provider. |
| 10 | Export a study conversation to PDF | A branded PDF preserves headings and mathematical text with page breaks. | Blocked; PDF export is not implemented. |

Additional release checks must cover registration and sign-in, logout persistence, session isolation, provider/API failures, rate limits, upload limits and failures, responsive layouts, and database authorization. Authentication, per-user isolation, distributed rate limits, and durable database authorization are not present in this checkout.

## Execution notes

The first sandboxed test invocation failed before loading tests because Node's user-profile lookup returned uv_os_get_passwd ENOMEM. Rerunning the same command with normal OS access completed successfully. The data validator had the same environment issue and passed when rerun with normal OS access.

## Not verified

- Live Groq or Together AI calls; no provider keys were supplied.
- Live search, voice, account registration, OAuth, cloud persistence, or generated PDF export; these features are absent.
- The live Vercel page's interactive sign-in behavior; only its HTTP response and server-rendered HTML were inspected.
- Mobile device matrix, assistive-technology testing, and end-to-end browser flows.
- A local dependency audit. Vercel's latest build log reported 12 dependency advisories (4 low, 6 moderate, 2 high); details need triage before release.

## Historical test-count reconciliation

The supplied directive mentioned 52 tests as a historical claim. This checkout contains one test file with 21 test cases, and all 21 passed in this run. No 52-test suite was found or executed.

