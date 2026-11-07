# Changelog

## 2026-11-08 - Milestone 2 model routing

- Added a server-side model router: Havan Pro uses Groq; Havan 2.5 Sol and Havan-3 Jarvis use separate Qwen model settings.
- Added an operator-configured HTTPS Qwen Chat Completions endpoint, bounded requests, safe errors, and an optional same-provider fallback.
- Connected model selection to both General tutor requests and strict source-quote selection; the selected provider and model are shown on assistant replies.
- Added provider readiness to the status API and disabled unconfigured models in the selector.
- Added mode-specific teaching prompts that explicitly avoid claiming unavailable web, voice, visual quiz, or simulation features.
- Direct OpenAI API use remains disabled.

## 2026-11-07 - Milestone 1 chat interface

- Added an auto-growing composer with an internal scroll limit for long prompts.
- Added a subtle generation border glow tied to the active chat request and honoring reduced-motion preferences.
- Added clearer attachment previews with filename, file type, and size; separated document preparation from response loading.
- Added a restrained shimmer over the existing Havan Academy logo, preserving the original artwork.
- Verified the existing test suite (21/21), TypeScript, and the production build.

## 2026-11-07 - Milestone 0 source and deployment audit

- Added project brief, feature status, implementation roadmap, test report, and deployment history.
- Added project-level development and safety guidance.
- Recorded the actual Next.js standalone architecture, empty authoritative datasets, and current capability limits.
- Compared the local app with Havan GitHub repositories and the specified Vercel project.
- Verified 21 automated tests, TypeScript, data validation, and the production build.
- Renamed the local branch to main and configured origin for Havan-AI-Gen-Q while preserving the audit commits.
- No application behavior, dependency manifest, GitHub repository, Vercel project, or production deployment was changed.

