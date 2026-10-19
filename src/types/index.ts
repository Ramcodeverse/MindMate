export type MoodCategory = 'Great' | 'Good' | 'Okay' | 'Low' | 'Struggling' | 'Terrible' | 'Not Great' | 'Excellent';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'calm';
  timezone: string;
  aiContextSharing: boolean;
  dailyReminderTime: string;
  soundEnabled: boolean;
  musicGenres?: string[];
  movieGenres?: string[];
  preferredIntentions?: string[];
  excludedCategories?: string[];
  personalizationEnabled?: boolean;
  journalConsent?: boolean;
  onboardingCompleted?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface MoodEntry {
  id: string;
  userId: string;
  moodLevel: 1 | 2 | 3 | 4 | 5;
  moodLabel: MoodCategory;
  note: string;
  emotions: string[];
  energyLevel: number; // 1-10
  stressLevel?: number; // 1-10
  contextTags?: string[];
  desiredExperience?: string;
  date: string; // YYYY-MM-DD
  timestamp?: string;
  createdAt?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  moodAssociation?: string;
  isPrivate: boolean;
  wordCount: number;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'Mindfulness' | 'Health' | 'Growth' | 'Rest';
  frequency: 'daily' | 'weekdays' | 'custom';
  targetDaysPerWeek: number;
  archived: boolean;
  completions: string[]; // YYYY-MM-DD
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

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface DashboardSummary {
  today: string;
  todayMood: MoodEntry | null;
  habitsTotal: number;
  habitsCompletedToday: number;
  habitCompletionRate: number;
  totalJournals: number;
  recentJournals: JournalEntry[];
  recentMoods: MoodEntry[];
  activeHabitStreak: number;
  weeklyTrend: Array<{
    date: string;
    dayLabel: string;
    moodLevel: number | null;
    habitCount: number;
  }>;
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