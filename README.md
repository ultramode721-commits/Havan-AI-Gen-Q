# Havan AI

A fresh standalone Next.js + TypeScript application for Havan Academy. Local JSON retrieval, secure server-side Groq requests, timed five-choice UAT practice, and measured skill diagnostics. The existing GitHub app was reviewed as a reference; its code was not patched or copied into this implementation.

## Start on Windows, macOS, or Linux

Install Node.js 22.13+ (Node 24 recommended). Open a terminal in this folder:

```bash
npm ci
```

Copy `.env.example` to `.env.local`. Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Set `GROQ_API_KEY` in `.env.local` for General tutor and optional source-quote selection. Never paste an API key into the web UI or commit it. For a credential-free local demonstration, set `ENABLE_DEMO_DATA=true`; otherwise the four authoritative databases are empty and the application declines unsupported database queries/exams.

```bash
npm run dev
```

Open `http://localhost:3000`. The development launcher also accepts `--port` for preview tools. Restart after changing database files or environment variables.

## Build and verify

```bash
npm run typecheck
npm test
npm run validate-data
npm run build
npm start
```

`npm start` uses production checks: set `HAVAN_ACCESS_TOKEN` and `EXAM_SIGNING_SECRET` first. Generate independent random values with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Enter the workspace access token in Settings → Connect workspace. The token stays in memory only. It is not the Groq key. This is a private pilot access gate, not a multiuser identity service.

## What works

- Responsive light/dark interface with the supplied Havan Academy logo and cyan/coral Havan AI branding. No competitor logo is used.
- Searchable local conversation history, export/clear tools, project notes, Markdown tables, fenced code and KaTeX mathematics.
- Strict database chat with fail-closed retrieval and source provenance. Casual greetings receive a short greeting.
- Explicit General tutor mode with server-only Groq authentication, bounded output, an 18-second total network budget, and an optional same-provider fallback model. General mode supports user-selected languages; quality is not guaranteed or independently benchmarked.
- English/Mathematics diagnostics restricted to UAT/trained questions, domain charts, and exportable reports.
- Randomized timed practice with exactly five choices, flags, clear-choice controls, progress, server-side keys, signed tickets, scoring and explanations. Active sessions keep their deadline when switching sidebar views. Reloading the page starts over.
- On-demand file extraction: text PDFs up to 100 pages, DOCX, TXT, MD, JSON and CSV up to 5 MB. No runtime PDF parsing in the normal RAG path. Session uploads are explicitly unverified references and never silently become trusted exam data.
- Interactive quadratic-function graph calculated locally in Artifacts.
- Optional Together AI image adapter with a separate server-side image credential. This is not supplied by Groq.
- Code workspace for editing, Markdown preview and exporting; it does not execute arbitrary code.

## Two answer modes

**Database only** is the default. It searches an in-memory inverted index built once per server process from the four JSON files. It restricts context to five chunks / 6,500 characters (plus an optional session reference), avoiding runtime PDF parsing. If Groq is configured it can select exact quotes through the strict system prompt; every returned quote must be a verbatim substring of an identified context chunk. Invalid or unavailable model selection falls back only to retrieved excerpts, never generic model knowledge. No key is required to return local excerpts. Excerpts remain in the source language. This controls unsupported generation; it cannot make incorrect source material true. Retrieval relevance and database completeness still need human review.

**General tutor** must be explicitly selected. It allows the model's general knowledge, conversation and translation, marks that mode in the UI and does not imply that answers are verified database facts. This separation resolves the otherwise incompatible requirements of strict local-only answers and universal open-domain assistance. There is no automatic switch from strict to general.

## Install real datasets

See [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md). Replace the empty canonical JSON arrays with reviewed records. The reviewed GitHub commit contains no `UAT Exam Database/`, `UAT Main Data Base/`, `Trained Database/`, or any of the four named indexed JSON files. Therefore no official historical exam bank is bundled. The 12 authored demonstration questions are enabled only with `ENABLE_DEMO_DATA=true` and are labeled as demonstrations, never official 2016/2017/2018 papers.

The original repository's four-option questions are not automatically padded or represented as five-option official questions. The importer rejects incomplete data.

```bash
node --import tsx scripts/import-database.ts "UAT Exam Database" data/v3_qa_bank.json
npm run validate-data
```

Input files must use the documented canonical schema. Load other reviewed folders similarly into one of the other three files; avoid duplicate IDs across files. This is a build-time operation. Rebuild/redeploy after changing datasets. JSON data is outside `public/`, with explicit Next output tracing for server deployments.

## Vercel

1. Create a new Git repository from this folder; keep the existing Lovable-connected repository unchanged.
2. Import that repository in Vercel using the Next.js framework preset. Build command: `npm run build`.
3. Set `HAVAN_APP_ORIGIN` to the exact HTTPS origin of the deployment when a proxy presents a different internal origin. Add server environment variables from `.env.example`. `GROQ_API_KEY`, `EXAM_SIGNING_SECRET`, and `HAVAN_ACCESS_TOKEN` are required for a configured production pilot. Keep demo mode off when installing authoritative datasets.
4. Deploy. Open Settings, enter the workspace access token, and test a database query and a full exam.

No deployment was performed as part of this code delivery. A public multiuser service additionally needs real identity, user-owned durable records, distributed rate limits/quotas, usage monitoring, and provider billing controls. The shared-token pilot must not be presented as account authentication. LocalStorage is browser-local and can be read by other users of the same browser profile.

## Capability and verification limits

- No model can promise native fluency in every language, zero errors, superhuman intelligence, perfect file understanding, or 100% factual accuracy.
- Predictor reports observed practice scores, not a validated probability of exam success or a forecast of next year's questions. No calibrated outcome dataset was available.
- OCR/scanned PDFs, image understanding, voice, web browsing, code execution, real Google authentication, cloud history, paid plans, and model-weight training are not implemented. The UI does not simulate those services.
- Image generation requires a separately funded provider account. Provider model availability can change; override the documented environment variable as needed.
- Signed exam tickets prevent modification and keep answer keys off the initial client payload. They do not provide proctoring, one-time submissions or anti-cheat guarantees. Grading permits a 30-second network grace period; use a durable session service for high-stakes assessment.
- English and Mathematics are the only predictor/exam subject domains. General tutoring can discuss other freshman subjects when supported by sources or explicitly using General tutor.
- Lexical Unicode retrieval needs source-language text/translated tags for multilingual matching. No multilingual embedding benchmark is claimed.
- File extraction may lose tables/layout and is not a universal or exact reader. Uploading reference text sends the selected excerpt to Groq only when a model-assisted request is made. Keep private documents on systems you trust.

See [docs/VERIFICATION.md](docs/VERIFICATION.md) for actual checks and remaining gaps, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries, and [docs/SOURCE_REVIEW.md](docs/SOURCE_REVIEW.md) for the GitHub review.
