<div align="center">

# 🧠 MindMate

### *Your Personal Mental Wellness Companion*

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Mindful Check-Ins · Distraction-Free Journaling · Habit Anchors · Server-Side Gemini AI Reflection · Web Audio Soundscapes**

[✨ Live Demo](https://ais-dev-gdjqll5bo7ez3gyatkgok2-528799930423.asia-east1.run.app) · [💼 Developer Portfolio](https://rams-portfolio-site.netlify.app) · [📂 Architecture](ARCHITECTURE.md) · [🔒 Security Policy](SECURITY.md) · [📖 API Reference](API.md)

</div>

---

## 🌿 About MindMate

**MindMate** is a full-stack mental wellness sanctuary crafted to provide a calm, emotionally supportive space to pause, reflect, and cultivate emotional balance.

Unlike noisy wellness apps filled with aggressive gamification, social comparison, or clinical jargon, MindMate emphasizes **gentle consistency**, **100% user data sovereignty**, and **compassionate AI reflection**.

---

## ✨ Production Features

| Feature | Description |
|---|---|
| 🌿 **MindMate Calm Design** | An emotionally supportive palette of soft sage (`#EAF2EC`), warm ivory (`#FBFBF7`), and deep forest green (`#163327`) with Plus Jakarta Sans typography. |
| 📊 **5-Level Mood Rhythm** | Log daily emotional baseline, physical energy slider (1-10), and emotion nuances in 15 seconds. |
| 📓 **Private Daily Journal** | Distraction-free canvas with live autosave, keyword search, tag filtering, word count, and public **Privacy Blur mode**. |
| 🎯 **Habit Anchors & Streaks** | 7-day completion matrix with accurate consecutive day streak calculations and rewarding Web Audio chimes. |
| 🤖 **Server-Side AI Reflection** | Empathetic reflection companion powered by `@google/genai` (**Gemini 3.8 Flash**). Never exposes API keys to client browsers. Seamless offline fallback. |
| 🛡️ **Crisis Safety Safeguards** | Automated keyword scanner that instantly surfaces free 24/7 crisis hotlines (988 Lifeline, Crisis Text Line). |
| 🌬️ **Guided Breathwork Sanctuary** | Interactive **4-7-8 Relaxing** and **4-4-4-4 Box Breathing** visual pacer with synthesized ambient rain/forest soundscapes. |
| 📅 **Calendar & Day Inspector** | Month-at-a-glance visualization aggregating mood check-ins, completed habits, and journal reflections. |
| 🔒 **Data Portability & Deletion** | Instant one-click full JSON data export (`GET /api/v1/users/me/export`) and irreversible cascade account purge. |
| 🛡️ **Role-Based Admin Console** | Administrative interface for member directory inspection and system telemetry. |

---

## 🛠️ Architecture & Tech Stack

```
Frontend:   React 18 · TypeScript · Vite · Tailwind CSS · Lucide Icons · Web Audio API
Backend:    Node.js 22 · Express.js (v5) · tsx · CORS · Dotenv
AI Service: @google/genai (Gemini 3.8 Flash) with safe server-side proxy
Testing:    Node.js native test runner (`node:test`, `node:assert`) · 100% pass rate
```

---

## 🚀 Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ramcodeverse/mindmate.git
cd mindmate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
*(Optional) To enable live Gemini AI reflections, add your Gemini API key in `.env`:*
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*Note: MindMate functions fully offline even without an API key using the built-in empathetic sanctuary engine.*

### 4. Run the Full-Stack Dev Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Run Automated Tests
```bash
npm test
```

---

## 👤 Sample Demo Accounts

MindMate comes pre-seeded with rich, realistic wellness histories for portfolio review:

| Role | Email | Password | What's Included |
|---|---|---|---|
| **Member** | `sarah.johnson@email.com` | `sarah123` | 10 days of mood check-ins, 3 journal entries, 4 habit anchors with 6-day streak, past reflections |
| **Admin** | `admin@mindmate.com` | `admin123` | Access to the Administrative Directory & System Console |

You can also create a new account or switch accounts instantaneously using the role switcher in the sidebar footer.

---

## 🧪 Automated Testing Evidence

MindMate includes unit and integration tests covering core wellness logic:

```bash
> npm test

TAP version 13
# Subtest: MindMate Wellness Core Logic
    # Subtest: Consecutive Streak Calculation
        ok 1 - returns 0 when completions array is empty
        ok 2 - calculates active streak up to today
        ok 3 - maintains streak if completed yesterday but not yet today
        ok 4 - breaks streak when there is a missing day before yesterday
    ok 1 - Consecutive Streak Calculation
    # Subtest: Crisis Intent Detection & Safety Guardrails
        ok 1 - detects crisis keywords correctly
        ok 2 - provides compassionate non-clinical fallback response with user context
    ok 2 - Crisis Intent Detection & Safety Guardrails
    # Subtest: Store Operations & Data Integrity
        ok 1 - creates and tracks journals with accurate word count
        ok 2 - toggles habit completion and dynamically recalculates streaks
        ok 3 - exports all user data in clean format without leaking credentials
    ok 3 - Store Operations & Data Integrity
ok 1 - MindMate Wellness Core Logic
# tests 9
# pass 9
# fail 0
```

---

## 📄 License & Attribution

Licensed under the **MIT License**.

Crafted with 💚 by **[Ram](https://github.com/ramcodeverse)** · [Portfolio](https://rams-portfolio-site.netlify.app)
