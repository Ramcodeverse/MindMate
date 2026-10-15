# Security Policy — MindMate

## Overview

MindMate is committed to protecting user privacy, personal reflections, and mental wellness data through defense-in-depth principles. Because mental wellness data is deeply sensitive, security and privacy are treated as first-class architectural constraints.

## Security Controls & Architecture

### 1. Server-Side AI Credential Isolation
- All interactions with the Google Gemini API are executed strictly on the Node.js/Express backend (`server/aiService.ts`).
- `process.env.GEMINI_API_KEY` is never bundled into client assets, sent over the wire, or accessible from browser JavaScript.
- Client requests communicate exclusively via authenticated proxy routes (`/api/v1/ai/chat`).

### 2. Resource-Level Authorization (Multi-Tenancy)
- Every read, update, or deletion operation on `/api/v1/moods`, `/api/v1/journals`, `/api/v1/habits`, and `/api/v1/users` strictly verifies ownership using the authenticated user identity (`req.userId`).
- Cross-user data access is strictly rejected with `404 Not Found` or `403 Forbidden` status codes.

### 3. Non-Clinical Safety & Crisis Safeguards
- MindMate scans incoming reflective prompts for immediate distress or crisis patterns.
- When distress is detected, the companion immediately prioritizes confidential, free crisis resources (including the 988 Suicide & Crisis Lifeline and Crisis Text Line 741741) and provides grounding guidance.
- The platform transparently discloses its non-clinical nature and does not claim to replace licensed medical psychiatric care.

### 4. Data Portability & Complete Cascade Deletion
- Users maintain 100% data sovereignty.
- Account deletion (`DELETE /api/v1/users/me`) initiates a complete cascade purge of all moods, journals, habits, completions, and conversation records.
- Complete data export is available on-demand via `GET /api/v1/users/me/export`.

### 5. Transport Security & Network Boundaries
- CORS is configured to restrict unauthorized origin cross-talk.
- Request payload limits (`1mb`) mitigate memory exhaustion attacks.
- Strict input validation prevents prototype pollution and injection attacks.

## Reporting a Vulnerability

If you discover a security vulnerability or privacy concern within MindMate, please report it responsibly:

- **Email**: `ramcodeverse@gmail.com`
- Please provide a detailed description of the vulnerability, steps to reproduce, and potential impact.
- Do not disclose security vulnerabilities publicly until they have been reviewed and mitigated.
