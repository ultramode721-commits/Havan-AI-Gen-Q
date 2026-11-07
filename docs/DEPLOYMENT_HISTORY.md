# Deployment history

Audit date: 7 November 2026

## Production target

- Vercel team: UAT Tutorial Official
- Project: havan-ai
- Production aliases: havan-ai.vercel.app and havan-ai-uat-tutorial-official.vercel.app
- Latest observed deployment: dpl_9kUrjvpAFhrzXLCB6z95pKhi85cT
- Deployment URL: https://havan-cpb66noxo-uat-tutorial-official.vercel.app
- Created 27 October 2026 at 18:54:26 EAT; ready at 18:55:27 EAT
- Status: READY
- No deployment, alias, project setting, environment variable, or production data was changed in this audit.

## Source and framework evidence

Project metadata reports the tanstack-start-lovable framework, while the latest build log detects Next.js 16.4.3. The production page returned HTTP 200 and its HTML includes Next.js assets. The latest deployment record exposes no Git SHA or gitSource.

The project is linked to ultramode721-commits/havan-ai-production-source, a public repository with no branches, commits, or source files. The production root renders a sign-in/create-account shell. The local standalone app renders a chat workspace and has no real account system. The server-rendered page snapshot is not evidence that sign-in or account creation works.

## GitHub repositories reviewed

- ultramode721-commits/havan-ai-v1 is private and uses Vite/TanStack Start with Supabase and Lovable configuration. Its main head is c2fc7fbde3aa7cb75862ad5cf940649d832fa007, dated 16 August 2026. It was titled Rebranded to Zynix/Silva AI. It is not a compatible source tree for the standalone app.
- ultramode721-commits/havan-ai is private and uses Vite/TanStack Start. Its main head is 2a60d3cfe7d57e3191f540d7d828408f7e04063d, dated 3 August 2026, and it has a feat/groq-qwen-failover-safe branch.
- ultramode721-commits/havan-ai-production-source is public but empty. Vercel's latest deployment is not tied to a Git commit in the metadata returned.

These findings do not identify the exact source revision of the live application. Do not merge these applications or deploy the local checkout to production until a traceable preview is built and verified. The owner has designated ultramode721-commits/Havan-AI-Gen-Q as the canonical repository for the standalone app. The Vercel Git connection remains unchanged and still points to the empty production-source repository.

The local main branch preserves audit commits fc86751 and 74dd010. Origin points to the owner-designated public repository; the initial push is pending. Generated build output and node_modules are ignored. The only tracked environment file is the sanitized .env.example.

## Release record

No preview or production deployment was created for this milestone.
