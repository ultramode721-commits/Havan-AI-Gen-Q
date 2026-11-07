# Feature status

Audit date: 7 November 2026

Status describes this local standalone checkout. It does not infer behavior from the live deployment.

| Area | Status | Evidence or limit |
| --- | --- | --- |
| Next.js application shell | Implemented | App Router page, responsive layout, and server routes are present. |
| Strict local-source chat | Implemented, data empty | Retrieval is lexical and source-bounded. The four authoritative data files have no records. |
| General tutor | Implemented, provider-dependent | Explicit mode uses server-side Groq. No key means a clear unavailable response. |
| Direct OpenAI API | Disabled | No direct integration is present; this is an owner constraint. |
| KaTeX answer rendering | Implemented | Markdown renderer supports mathematical notation; it does not perform symbolic computation. |
| Havan Academy logo shimmer | Not implemented | Existing PNG has a white background; the SVG wordmark contains a gradient rectangle. |
| Chat history | Browser-local | Stored in localStorage; no account or cloud synchronization. |
| User accounts and OAuth | Not implemented | No registration, Google/GitHub sign-in, or user-owned identity store. |
| Memory and recoverable deletion | Not implemented | Browser-local history is not user-controlled cross-session memory. |
| Live web search and web citations | Not implemented | Local source disclosures are not live-web citations. |
| File text extraction | Implemented with limits | PDF text layer, DOCX, TXT, MD, JSON, and CSV are supported. Scanned-image OCR and image understanding are absent. |
| Voice input and speech output | Not implemented | No microphone, transcription, or text-to-speech flow. |
| Exam practice and deterministic grading | Implemented, data empty | English and Mathematics only; five-choice questions and server-side answer keys. |
| Exam prediction | Not calibrated | Reports practice performance; no future-question likelihood or pass probability is validated. |
| Scientific computation | Limited | A local quadratic graph is present. No general physics/chemistry solver or validated simulator. |
| Image generation | Optional provider adapter | Requires a separate Together AI key; it is not image understanding. |
| PDF chat export | Not implemented | Existing exports do not constitute a branded PDF generator. |
| Code workspace | Editing and preview only | It does not execute arbitrary code. |
| Browser, Classroom, educational Artifacts | Partial or absent | Current portals do not provide the requested live-search, classroom recording, or curated resource systems. |
| API usage and cost dashboard | Not implemented | No per-user token accounting, budget view, or model recommendation system. |
| Rate limiting | Not implemented | Request validation and size bounds exist; distributed per-user quotas do not. |
| Security boundaries | Partial pilot controls | Same-origin checks, input validation, bounded requests, and optional shared bearer-token gate are present. No per-user authorization or durable identity isolation. |
| Existing automated suite | 21 tests pass in this audit | See docs/TEST_REPORT.md. The historical 52-test claim is not present in this checkout. |
