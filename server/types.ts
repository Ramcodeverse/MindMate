export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'calm';
    timezone: string;
    aiContextSharing: boolean;
    dailyReminderTime: string;
    soundEnabled: boolean;
  };
}

export interface MoodRecord {
  id: string;
  userId: string;
  moodLevel: 1 | 2 | 3 | 4 | 5; // 1: Very Low, 2: Not Great, 3: Okay, 4: Good, 5: Thriving
  moodLabel: 'Terrible' | 'Not Great' | 'Okay' | 'Good' | 'Excellent';
  note: string;
  emotions: string[];
  energyLevel: number; // 1-10
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  createdAt: string;
}

export interface JournalRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  moodAssociation?: string;
  isPrivate: boolean;
  wordCount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface HabitRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'Mindfulness' | 'Health' | 'Growth' | 'Rest';
  frequency: 'daily' | 'weekdays' | 'custom';
  targetDaysPerWeek: number;
  archived: boolean;
  completions: string[]; // array of 'YYYY-MM-DD'
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isCrisisResponse?: boolean;
}

export interface AIConversationRecord {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}
