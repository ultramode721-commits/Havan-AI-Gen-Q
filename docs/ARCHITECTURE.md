# Architecture

## Runtime boundaries

`components/HavanApp.tsx` owns navigation, browser-local chat state, settings and the composer. `components/Exam.tsx` owns timed exam presentation; answers and explanations arrive only from the grading endpoint. `components/Portals.tsx` provides document inspection, local projects, Artifacts and code export. `components/MathLab.tsx` calculates an interactive quadratic plot. Markdown uses React Markdown without raw HTML execution; KaTeX trust is disabled.

`app/api/chat` validates payloads, authorizes the workspace token, performs local retrieval and enforces an explicit answer-mode boundary. `lib/grounding.ts` implements the strict system prompt and verifies exact quoted substrings. The generative model cannot introduce new prose into strict output. `lib/models.ts` maps Havan Pro to the configured Groq model and Havan 2.5 Sol / Havan-3 Jarvis to separately configurable Qwen models. `lib/groq.ts` and `lib/qwen.ts` keep provider credentials server-side, apply bounded request deadlines, and use same-provider fallback models when configured. The Qwen adapter requires the operator's HTTPS regional chat-completions endpoint. A profile changes its actual provider/model route and teaching instructions; unavailable providers return clear setup errors in General tutor mode. Voice, live search, generated interactive quizzes, image analysis, and Jarvis simulations remain unavailable until separately connected.

`lib/database.ts` reads fs/path JSON once per process, validates all records, checks duplicate IDs and creates a Unicode inverted index. Each query scores only matching postings using inverse document frequency. This is a lexical retrieval system, not a vector database or a semantic knowledge-graph reasoning engine. The graph-named JSON file is searched as flattened textual records.

`app/api/exam` selects and shuffles only UAT/trained questions in English/Mathematics. `lib/exams.ts` signs question IDs and the deadline with HMAC-SHA256. `app/api/grade` verifies the ticket and answer range, rejects foreign IDs and calculates deterministic scores against server-side answers. Keys never appear in the initial exam response. Grading is stateless practice, not proctoring.

`app/api/ingest` is deliberately separate from the normal chat retrieval pipeline. It bounds input size, extracts supported document text and returns a short session reference for review. It never writes to authoritative data, trains model weights or executes code. `app/api/image` is an optional Together AI adapter, separate from Groq. No image API key means a clear unavailable state.

## Security and operations

All API routes use same-origin checks, server-side validation, no-store responses and a production workspace bearer-token gate. No secret is prefixed NEXT_PUBLIC_. Error messages omit upstream bodies and API secrets. The pilot is suitable for an authorized small group behind controlled access; shared tokens are not a substitute for per-user sessions and quotas.

Before a public multiuser release, add real identity, durable user/session storage, distributed abuse controls, privacy and retention controls, deployment monitoring, provider budgets and data-source review. JSON is immutable at runtime and rebuilt with each deployment. Uploads and notes are not automatically published or added to trusted sources.

Prompt constraints and substring verification reduce unsupported generation. They do not prove the correctness, relevance or completeness of retrieved source text. General tutor is explicitly non-strict and has no guarantee of correctness.

## File structure

```text
app/
  layout.tsx, page.tsx, globals.css
  api/chat/route.ts
  api/exam/route.ts
  api/grade/route.ts
  api/ingest/route.ts
  api/image/route.ts
  api/status/route.ts
components/
  HavanApp.tsx, Markdown.tsx, Exam.tsx, Portals.tsx, MathLab.tsx
lib/
  schema.ts, database.ts, grounding.ts, groq.ts, exams.ts, http.ts, client.ts
data/
  v1_indexed_modules.json
  v2_knowledge_graph.json
  v3_qa_bank.json
  v4_logic_reasoning.json
  demo.json
scripts/
  dev.mjs, validate-data.ts, import-database.ts, make-demo.py
public/havan-academy.png
tests/core.test.ts, fixtures/
docs/
```

## Source and deployment state - 7 November 2026

The standalone application in this folder is Next.js 16.4.3, React 19.3.1, and TypeScript. It is the development base designated by the owner. The supplied checkout has no Git metadata.

The local baseline now uses branch main with audit commits fc86751 and 74dd010 preserved. Origin points to the owner-designated Havan-AI-Gen-Q repository.

The private GitHub repositories ultramode721-commits/havan-ai and ultramode721-commits/havan-ai-v1 use Vite/TanStack Start and are separate applications. Do not merge them into this codebase without a reviewed migration plan. The Vercel project havan-ai is linked to an empty public repository, while its latest READY deployment reports no Git commit metadata. Its framework setting says TanStack Start, but its latest build log and live Next.js assets indicate Next.js. Its root page presents a sign-in shell unlike this local chat workspace. The exact production source revision remains unverified.

The local project passed its 21-test suite, TypeScript check, data validation, and Next.js production build on 7 November 2026. See docs/TEST_REPORT.md and docs/DEPLOYMENT_HISTORY.md for evidence and deployment identifiers.

Before sharing source, scan for credentials because the canonical repository is public. Keep production unchanged until a preview can be traced to the reviewed commit and its behavior is verified.

