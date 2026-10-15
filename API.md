# REST API Reference — MindMate v2.0

Base URL: `/api/v1`

All authenticated endpoints require an `Authorization: Bearer <token>` header or `x-user-id: <token>`.

---

## Authentication & Session

### `POST /auth/register`
Creates a new member account and seeds welcoming starter habits.
- **Request Body**:
  ```json
  {
    "name": "Alex Chen",
    "email": "alex@example.com",
    "password": "securepassword123"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "token": "usr_1792064000000",
    "user": { "id": "...", "name": "Alex Chen", "email": "...", "role": "user" },
    "message": "Welcome to MindMate!"
  }
  ```

### `POST /auth/login`
Authenticates with email and password.
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response `200 OK`**: `{ "token": "...", "user": { ... } }`

### `POST /auth/logout`
Terminates the session.

### `GET /auth/me`
Returns current authenticated user profile.

---

## Dashboard

### `GET /dashboard/summary`
Returns the aggregated wellness dashboard snapshot:
- `today`: current date string (`YYYY-MM-DD`)
- `todayMood`: mood entry if recorded today
- `habitsTotal`: total active habits
- `habitsCompletedToday`: count of completed habits today
- `activeHabitStreak`: current maximum streak
- `weeklyTrend`: 7-day array of daily mood levels and habit completion counts
- `recentJournals`: preview of latest reflections

---

## Mood Tracking

### `GET /moods`
Returns all mood entries for the authenticated user, sorted in descending date order.

### `POST /moods`
Creates or updates a mood entry for a given date.
- **Request Body**:
  ```json
  {
    "moodLevel": 4,
    "moodLabel": "Good",
    "note": "Took a quiet walk in morning mist.",
    "emotions": ["Calm", "Grateful"],
    "energyLevel": 8,
    "date": "2026-10-15"
  }
  ```

### `DELETE /moods/:id`
Deletes a specific mood record (ownership verified).

---

## Private Journal

### `GET /journals?q={query}&tag={tag}`
Searches and filters personal journal entries.

### `POST /journals`
Creates a new journal entry.
- **Request Body**:
  ```json
  {
    "title": "Morning Intentions",
    "content": "Focusing on breath and self-compassion today...",
    "tags": ["Mindfulness", "Morning"],
    "moodAssociation": "Good",
    "isPrivate": false
  }
  ```

### `PATCH /journals/:id`
Updates title, content, or tags of an existing entry.

### `DELETE /journals/:id`
Deletes a journal entry (ownership verified).

---

## Habit Anchors

### `GET /habits?includeArchived=false`
Returns all habits for the authenticated user.

### `POST /habits`
Creates a new habit anchor.
- **Request Body**:
  ```json
  {
    "name": "10-Minute Box Breathing",
    "category": "Mindfulness",
    "frequency": "daily",
    "targetDaysPerWeek": 7,
    "description": "Ground nervous system before meetings"
  }
  ```

### `POST /habits/:id/toggle`
Toggles habit completion status for a given date (`YYYY-MM-DD`). Automatically updates consecutive streak counts.

### `DELETE /habits/:id`
Deletes a habit.

---

## AI Reflection Companion

### `GET /ai/conversation`
Retrieves conversation history with the assistant.

### `POST /ai/chat`
Sends a message to the AI Reflection service.
- **Request Body**: `{ "message": "I feel a bit scattered today." }`
- **Response `200 OK`**:
  ```json
  {
    "reply": "I hear you sharing that...",
    "isCrisis": false,
    "provider": "gemini",
    "updatedConversation": { ... }
  }
  ```

### `DELETE /ai/conversation`
Clears chat history.

---

## Account & Data Sovereignty

### `GET /users/me/export`
Generates and downloads a complete JSON archive of all personal records.

### `DELETE /users/me`
Cascade-deletes the user's account, profile, moods, habits, journals, and conversations.
