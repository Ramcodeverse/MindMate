# MindMate Data Privacy & Security Architecture

This document outlines the strict privacy boundaries and security controls enforced throughout MindMate, satisfying Master Prompt 03 specifications.

---

## 1. Zero-Leakage Architecture for Private Reflections
MindMate maintains an impenetrable boundary between a user's intimate emotional reflections and the recommendation engine:
- **Private Journals**: Free-form journal content is stored exclusively in the private journal vault. It is **never** vectorized, tokenized, or passed into recommendation training sets or interaction logs.
- **Crisis & Emotional Chat**: AI sanctuary chat interactions are isolated from third-party advertising or public telemetry.
- **Opt-In Context**: Only if a user explicitly enables `aiContextSharing` in Profile Settings is high-level mood trend context (e.g. "User logged Good mood 3 days this week") used to enrich reflection chat responses.

---

## 2. Recommendation Event Logging Boundaries
Recommendation impressions and interaction records store minimal, non-sensitive identifiers:
- `userId`: Internal pseudo-randomized user token (`usr_...`).
- `contentId`: Catalog entity reference (`rec_music_01`).
- `action`: `'like'`, `'dislike'`, `'save'`, `'dismiss'`, `'rate'`.
- `timestamp`: Event time.

No free-text queries or private notes are bundled into interaction event logs.

---

## 3. GDPR & CCPA Compliance Controls

### Right of Access & Data Portability (Article 20)
Users can download a complete, structured JSON export of their entire personal data via:
- Endpoint: `GET /api/user/export`
- UI: Profile Settings -> "Export My Data"
- Output includes: User profile, mood logs, habits, saved library items, and interaction histories in standard UTF-8 JSON format with no credentials or secrets.

### Right to Erasure / Deletion (Article 17)
Users have an irrevocable control to delete their account:
- Endpoint: `DELETE /api/user/account`
- UI: Profile Settings -> "Delete Account"
- Cascade Action: Immediately deletes the user profile, all mood entries, habits, journal vaults, conversation sessions, and removes their user vector from collaborative recommendation matrices.

### Right to Opt-Out of Automated Profiling
- In Profile Settings, users can disable machine learning personalization with a single toggle:
  `personalizationEnabled: false`.
- When disabled, all recommendation endpoints revert to non-personalized catalog discovery based purely on explicit category filters and general popularity.
