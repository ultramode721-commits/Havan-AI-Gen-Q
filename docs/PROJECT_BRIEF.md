# Havan AI project brief

Audit date: 7 November 2026

## Purpose

Havan AI is an educational tutoring and practice application for Havan Academy. This standalone app provides source-grounded chat, an explicitly selected general tutor mode, English and Mathematics practice, document text extraction, and local learning tools.

## Current application

The app uses Next.js 16.4.3, React 19.3.1, and TypeScript. It uses the Next.js App Router, server-side API routes, browser-local conversation storage, and four local JSON knowledge files. The validation environment used Node 24.18.1 and npm 11.6.0.

The main interface is in components/HavanApp.tsx. API routes are under app/api. Shared validation, retrieval, provider, exam, and request logic is under lib. Package scripts cover development, production build, typecheck, tests, and data validation.

## What is present

- Strict mode retrieves local passages and does not generate unsupported prose.
- General tutor can call the selected Groq or Qwen route with server-only credentials; model profiles remain unavailable until configured.
- Markdown answers support KaTeX rendering.
- Practice exams use five choices, signed sessions, server-side scoring, and explanations.
- PDF, DOCX, TXT, Markdown, JSON, and CSV text extraction is available within documented limits.
- A local quadratic graph and an editing-only code workspace are available.
- Together AI image generation is optional and requires a separate server-side key.
- Conversation history and notes are stored in the current browser, not a user account.

The four authoritative data files are empty and demo data is disabled by default. A clean installation therefore has no authoritative passages or exam questions to serve.

## Current limits

This checkout does not contain real user authentication, cloud-synced history, user-controlled persistent memory, live web search, voice interaction, generated PDF exports, arbitrary code execution, or a calibrated exam predictor. Its shared bearer-token gate is not account authentication. The app does not directly call the OpenAI API.

## Supplied image references

All five supplied screenshots were available during the audit. The first two show the same chat sidebar, another shows its settings menu, one shows a microphone selector, and one is a mobile productivity UI reference. They are design references, not app assets or functional components.

The app contains public/havan-academy.png and public/havan-ai-wordmark.svg. The supplied Academy PNG visibly has a white background, and the current SVG wordmark includes a gradient rectangle. The main interface uses a graduation-cap icon in places instead of the Academy logo. No image assets were modified in this audit.

## Source-of-truth decision

The owner designated this standalone folder as the development workspace. It is the development base for upcoming work. The supplied checkout had no Git metadata, so it was not tied to a remote commit. It now has a local main branch with the audit history preserved, and origin points to the owner-designated Havan-AI-Gen-Q repository. The initial push is pending.

The separately reviewed GitHub apps use TanStack Start. The Vercel project is linked to an empty repository, and its latest deployment contains no Git commit metadata. The production page and local app also show different root-page experiences. The local code is not proven to be the source of the live site. Keep production unchanged until a preview workflow establishes the relationship.

An untouched copy of the supplied app was made before local validation or documentation edits at the workspace root as havan-ai.baseline-2026-11-07.

## Current milestone

Milestone 0, source recovery and audit, is documented in this folder. No application features were changed in this milestone.

