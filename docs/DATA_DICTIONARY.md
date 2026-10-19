# MindMate Data Dictionary & Schema Specification

This document details the schema, data types, constraints, and semantics across MindMate's application storage and machine learning recommendation pipeline.

---

## 1. Entities and Fields

### `UserProfile`
| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique user identifier (`usr_...`). |
| `name` | `string` | No | Display name. |
| `email` | `string` | No | Unique normalized lowercase email. |
| `role` | `'user' \| 'admin'` | No | System role for access control. |
| `createdAt` | `ISO 8601 string`| No | Account creation timestamp. |
| `lastLogin` | `ISO 8601 string`| No | Last authenticated session timestamp. |
| `isActive` | `boolean` | No | Account active status. |
| `preferences` | `object` | No | Detailed user preference settings (see below). |

### `UserProfile.preferences`
- `theme`: `'light' | 'dark' | 'calm'`
- `timezone`: e.g. `'UTC'` or `'America/New_York'`
- `musicGenres`: `string[]` (e.g. `['Acoustic', 'Indie Folk', 'Ambient', 'Lo-Fi']`)
- `movieGenres`: `string[]` (e.g. `['Drama', 'Animation', 'Whimsical Comedy']`)
- `preferredIntentions`: `string[]` (e.g. `['calm', 'comfort', 'focus', 'joy', 'reset']`)
- `excludedCategories`: `string[]` (genres or themes never to recommend)
- `personalizationEnabled`: `boolean` (user control to disable machine learning personalization)
- `journalConsent`: `boolean` (consent to allow journal theme context sharing; default `false`)
- `onboardingCompleted`: `boolean`

---

### `MoodRecord`
| Field | Type | Range / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `mood_...` | Unique mood entry identifier. |
| `userId` | `string` | FK -> UserProfile | Owner identifier. |
| `moodLevel` | `number` | `1, 2, 3, 4, 5` | 1 = Struggling, 2 = Low, 3 = Okay, 4 = Good, 5 = Great. |
| `moodLabel` | `MoodCategory` | Enum | Stated emotional category. |
| `energyLevel` | `number` | `1 to 10` | 1 = Exhausted, 10 = Vibrant energy. |
| `stressLevel` | `number` | `1 to 10` | Optional self-reported tension. |
| `emotions` | `string[]` | e.g. `['Calm', 'Hopeful']` | Emotion descriptors. |
| `contextTags` | `string[]` | e.g. `['Work', 'Nature']` | Environmental context tags. |
| `desiredExperience` | `string` | e.g. `'Comfort', 'Reset'` | Intended emotional outcome. |
| `note` | `string` | Text | Optional private self-reflection. |
| `date` | `string` | `YYYY-MM-DD` | Calendar reference date. |
| `timestamp` | `string` | ISO 8601 | Exact creation timestamp. |

---

### `RecommendationItem` (Unified Catalog Entity)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Stable catalog ID (`rec_music_01`, `rec_mov_02`, etc.). |
| `type` | `'music' \| 'movie' \| 'activity' \| 'tool'` | Content medium category. |
| `title` | `string` | Official item title. |
| `subtitle` | `string` | Subtitle or creator credit (e.g. Artist, Director, Runtime). |
| `categoryBadge` | `string` | UI badge text (e.g. `'deep focus'`, `'comfort & warmth'`). |
| `badgeVariant` | `'mint' \| 'peach' \| 'lavender' \| 'cyan' \| 'amber'` | Aesthetic badge style. |
| `duration` | `string` | Formatted duration (e.g. `'42 min'`, `'1h 56m'`). |
| `imageUrl` | `string` | High-fidelity verified artwork or poster URL. |
| `genre` | `string` | Primary and secondary genre taxonomies. |
| `synopsis` | `string` | Grounded plot summary, album description, or guide. |
| `moodAffinities` | `Array<MoodCategory \| 'All'>` | Mood states this item harmonizes with. |
| `energyFit` | `'low' \| 'medium' \| 'high' \| 'all'` | Target user energy band. |
| `stressFit` | `'high_stress' \| 'moderate_stress' \| 'low_stress' \| 'all'` | Target stress alleviation band. |
| `intentions` | `string[]` | Target emotional outcomes (`comfort`, `calm`, `reset`, etc.). |
| `explanation` | `string` | Base reasoning text for transparent recommendation. |
| `externalUrl` | `string` | Legitimate provider/catalog URL (IMDb, Bandcamp, Spotify, etc.). |

---

### `UserItemInteraction`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Event identifier (`fb_...`). |
| `userId` | `string` | Interacting user identifier. |
| `contentId` | `string` | Target catalog item identifier. |
| `action` | `enum` | `'save' \| 'unsave' \| 'dismiss' \| 'rate' \| 'fit_feedback'` |
| `value` | `string \| number` | Rating value (1-5) or fit feedback (`'yes'`, `'somewhat'`, `'not_for_me'`). |
| `createdAt` | `ISO 8601 string` | Timestamp of event. |
