<div align="center">

# 🧠 MindMate

### *Your Mental Wellness Companion*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**Mood tracking · Journaling · Habit building · AI therapy — all in one calming space.**

[📸 Screenshots](#-screenshots) · [🐛 Report Bug](https://github.com/ramcodeverse/mindmate/issues) · [✨ Request Feature](https://github.com/ramcodeverse/mindmate/issues)

</div>

---

## 📌 About

**MindMate** is a full-stack mental wellness app that combines **mood tracking**, **habit management**, **personal journaling**, and an **AI therapy chatbot** in one thoughtfully designed space.

It's built to give you a quiet, safe corner of the internet to reflect, grow, and feel supported — every single day.

---

## ✨ Features

| Feature | Description |
|---|---|
| 😄 **Mood Tracker** | Log your mood with emojis and notes; spot emotional patterns over time |
| 📓 **Daily Journal** | Private, timestamped journaling with emotional context |
| 📊 **Habit Tracker** | Build and maintain healthy habits with visual progress tracking |
| 🤖 **AI Therapist** | Conversational AI chatbot for support, reflection, and motivation |
| 📅 **Calendar View** | See your mood and habit history at a glance |
| 🔐 **Auth System** | Secure JWT-based login and registration |
| ☁️ **Cloud Sync** | Real-time data sync via MongoDB Atlas |

---

## 🛠️ Tech Stack

**Frontend** — React.js, Tailwind CSS / Chakra UI, React Router, Framer Motion

**Backend** — Node.js, Express.js, MongoDB + Mongoose, JWT

**Deployment** — Vercel (frontend) · Render (backend)

---

## 📸 Screenshots

| Dashboard | AI Therapist | Habit Tracker |
|:-:|:-:|:-:|
| ![Dashboard](https://github.com/user-attachments/assets/e476a2ec-d8d9-4495-8d0f-9f9f6f3b6cb7) | ![AI Chat](https://github.com/user-attachments/assets/9978f2ab-20bb-4040-a6f5-780502ac6941) | ![Habits](https://github.com/user-attachments/assets/19ade466-93fd-4594-b68a-2c8f53ac25b5) |

| Mood Tracker | Journal | Calendar |
|:-:|:-:|:-:|
| ![Mood](https://github.com/user-attachments/assets/6502e21a-e01a-425a-9b57-c28ad9a47314) | ![Journal](https://github.com/user-attachments/assets/4378e332-117c-47d0-95dd-5f73dbc5e80b) | ![Calendar](https://github.com/user-attachments/assets/418ea715-1acf-43d2-a0db-9cc656856a3d) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** account
- **AI API key** (for the chatbot)

### 1. Clone the Repository

```bash
git clone https://github.com/ramcodeverse/mindmate.git
cd mindmate
```

### 2. Set Up Environment Variables

```bash
cp .env.example server/.env
```

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AI_API_KEY=your_api_key
```

### 3. Run the Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Run the Backend

```bash
cd server
npm install
npm run start
```

> Frontend: `http://localhost:5173` · API: `http://localhost:5000`

---

## 📂 Project Structure

```
mindmate/
├── client/               # React frontend
│   ├── components/
│   ├── pages/
│   └── assets/
├── server/               # Express backend
│   ├── routes/
│   ├── models/
│   └── controllers/
├── .env.example
└── README.md
```

---

## 🗺️ Roadmap

- [x] Mood Tracker
- [x] Daily Journal
- [x] Habit Tracker with Calendar
- [x] AI Therapy Chatbot
- [ ] Push notifications & reminders
- [ ] Habit badges and streaks
- [ ] Voice note journaling
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add: your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📃 License

Licensed under the **MIT License**. Free to use and build upon with proper attribution.

---

<div align="center">

*"Healing doesn't mean the damage never existed. It means the damage no longer controls your life."*

Made with 💚 by [@ramcodeverse](https://github.com/ramcodeverse)

</div>
