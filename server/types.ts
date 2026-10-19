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
    musicGenres: string[];
    movieGenres: string[];
    preferredIntentions: string[];
    excludedCategories: string[];
    personalizationEnabled: boolean;
    journalConsent: boolean;
    onboardingCompleted: boolean;
  };
}

export type MoodCategory = 'Great' | 'Good' | 'Okay' | 'Low' | 'Struggling';

export interface MoodRecord {
  id: string;
  userId: string;
  moodLevel: 1 | 2 | 3 | 4 | 5; // 1: Struggling, 2: Low, 3: Okay, 4: Good, 5: Great
  moodLabel: MoodCategory;
  note: string;
  emotions: string[];
  energyLevel: number; // 1-10
  stressLevel?: number; // 1-10
  contextTags?: string[]; // Work, Rest, Outdoors, Social, etc.
  desiredExperience?: string; // Comfort, Calm, Energy, Focus, etc.
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

export type ContentType = 'music' | 'movie' | 'activity' | 'tool';

export interface RecommendationItem {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string;
  categoryBadge: string;
  badgeVariant: 'mint' | 'peach' | 'lavender' | 'cyan' | 'amber';
  duration: string;
  imageUrl: string;
  genre: string;
  synopsis: string;
  moodAffinities: Array<MoodCategory | 'All'>;
  energyFit: 'low' | 'medium' | 'high' | 'all';
  stressFit?: 'high_stress' | 'moderate_stress' | 'low_stress' | 'all';
  intentions: string[];
  explanation: string;
  score?: number;
  isSaved?: boolean;
  externalUrl?: string;
}

export interface RecommendationFeedbackRecord {
  id: string;
  userId: string;
  contentId: string;
  action: 'save' | 'unsave' | 'dismiss' | 'rate' | 'fit_feedback';
  value?: string | number | boolean;
  createdAt: string;
}
