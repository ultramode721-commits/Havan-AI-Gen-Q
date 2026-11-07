# Implementation roadmap

Audit date: 7 November 2026

Development starts from the standalone Next.js app in this folder. Preserve the existing production deployment while the source relationship is unresolved.

## Milestone 0 — Source recovery and audit

Status: complete for the available source and account metadata.

- Inventory the local app, supplied images, existing documentation, and baseline checks.
- Compare the named GitHub repositories with the local framework.
- Inspect the exact Vercel project and latest production deployment.
- Record evidence, gaps, and the safest source-of-truth decision.

Outcome: this local app is the requested development base. Existing GitHub apps use TanStack Start; the production-linked repository is empty; the latest production build has no Git SHA or source metadata. No application code or production configuration was changed.

## Milestone 1 — Stability and architecture

1. Establish the dedicated private repository and development branch without replacing existing repositories.
2. Review the full dependency and secret baseline. Triage Vercel's reported dependency audit findings before a release.
3. Preserve strict versus general chat behavior, existing Groq integration, API bounds, exam signing, and data provenance.
4. Improve only defects demonstrated by the audit or new regression checks.
5. Require passing tests, typecheck, data validation, production build, and a local browser smoke check.

Acceptance: the current suite remains green; the production build succeeds; no secret enters Git; data stays fail-closed; no production deployment occurs until a preview is traceable to the reviewed commit.

## Milestone 2 — Chat experience and branding

Improve the composer, responsive navigation, accessibility, light/dark presentation, and use of supplied Havan Academy assets. Confirm real image transparency and do not use interface screenshots as application components. Tie processing visuals to actual generation state and respect reduced-motion preferences.

## Milestone 3 — Accounts, persistence, and memory

Design user identity, account isolation, durable conversations, and user-controlled memory before implementation. Select an established authentication and database approach; do not substitute the shared pilot token or browser storage for real accounts. Plan migration and recovery semantics before storing personal data.

## Milestone 4 — Model orchestration, search, documents, and voice

Keep Groq/Qwen and direct OpenAI restrictions intact. Add only configured providers and tools. Implement live search with attributable sources, page-aware document references, and voice controls with clear supported-language limits. Add usage accounting only when providers return reliable usage data.

## Milestone 5 — Learning and exam practice

Expand assessment only with reviewed source materials, deterministic answer keys, accessible interaction, and explanations. Report observed performance. Do not claim calibrated exam forecasts without a held-out historical dataset and validation method.

## Milestone 6 — Browser, Classroom, Artifacts, and Code

Separate these into independently testable features. Verify external educational links. Require explicit recording controls and consent. Keep code execution isolated from production credentials and user data.

## Milestone 7 — Image generation

Document licensing, costs, model access, and storage before enabling a provider. Keep keys server-side and display clear provider availability.

## Milestone 8 — OmniLab simulations

Start with one validated educational simulation using documented equations and bounded inputs. Do not present decorative animation as scientific computation.

## Milestone 9 — Integration, security, and release

Run the ten student scenarios and broader security, responsive, authorization, and failure-path checks. Build and test a traceable Vercel preview. Promote only a passing build after confirming the exact source commit and target.
