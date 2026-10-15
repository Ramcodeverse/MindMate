# Architecture Documentation — MindMate

## System Overview

MindMate is a full-stack mental wellness and reflection platform architected with React 18, TypeScript, Tailwind CSS, Express.js, and the `@google/genai` SDK.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 18 SPA · MindMate Calm Design System · Web Audio API │
│  (Landing Page, Dashboard, Mood, Journal, Habits, AI Chat)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (/api/v1/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                           │
│  Node.js 22 · Express.js · tsx · Vite Dev Middleware        │
│  - Auth & Ownership Middleware                              │
│  - Request Validation & CORS                                │
│  - Server-Side Gemini API Proxy                             │
│  - Crisis Pattern Detection Engine                          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│       Data Storage Layer      │ │      External AI API      │
│  In-Memory / Indexed Store    │ │  Google Gemini 3.8 Flash  │
│  - Multi-tenant user records  │ │  (Server-Side Only)       │
│  - Cascade deletion support   │ │  - Empathetic System Prompt│
│  - Export archive generator   │ │  - Offline Fallback Engine│
└───────────────────────────────┘ └───────────────────────────┘
```

## Key Architectural Decisions

### 1. Unified Dev & Full-Stack Server
- In development, `server.ts` mounts `vite.createServer({ server: { middlewareMode: true } })`.
- This ensures single-port execution on port 3000 (`0.0.0.0:3000`) without running disparate processes or reverse proxies.
- In production, Express statically serves the optimized Vite `dist/` bundle with single-page app fallback routing.

### 2. Zero-External-Asset Sound Sanctuary
- Rather than loading brittle audio files from external CDNs, MindMate features a native Web Audio API sound synthesizer (`src/utils/audio.ts`).
- Generates gentle pink noise filtered with a 450Hz low-pass filter to simulate rain and forest wind.
- Produces a 528Hz pure sine chime when completing habits or logging check-ins.
- Zero network dependencies, zero licensing issues, 100% reliable offline.

### 3. Server-Authoritative AI Service
- Gemini API calls are strictly executed via `server/aiService.ts` using `@google/genai`.
- Employs `gemini-3.8-flash` with custom system instructions encouraging active listening, validation, and gentle grounding questions.
- Includes automated crisis keyword detection and instant redirection to free emergency hotlines (988 Lifeline).
- Fallback reflective engine activates seamlessly if `GEMINI_API_KEY` is not supplied, ensuring the application is always functional.

### 4. Deterministic Streak Calculation
- The streak calculation algorithm (`calculateConsecutiveStreak`) evaluates daily completion records.
- If neither today nor yesterday has a completed record, the streak is accurately marked as 0.
- Consecutive daily entries backward from the latest eligible date are counted without assuming daily-only frequencies.
