import { 
  UserProfile, 
  MoodRecord, 
  MoodCategory,
  JournalRecord, 
  HabitRecord, 
  AIConversationRecord,
  RecommendationItem,
  RecommendationFeedbackRecord
} from './types.js';
import { UserPreferenceVector } from './ml/types.js';
import { hybridEngine } from './ml/hybridEngine.js';
import { contentBasedRecommender } from './ml/contentBased.js';
import { collaborativeRecommender } from './ml/collaborative.js';
import { popularityRecommender } from './ml/popularity.js';
import { modelRegistry } from './ml/registry.js';
import { moodIntelligenceEngine, MoodPatternInsight, UserPatternFeedback } from './ml/moodIntelligence.js';

// Helper for date formatting
export const getTodayDateString = (offsetDays: number = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return d.toISOString().split('T')[0];
};

export class MindMateStore {
  private users: Map<string, UserProfile> = new Map();
  private credentials: Map<string, string> = new Map(); // email -> password
  private moods: Map<string, MoodRecord> = new Map();
  private journals: Map<string, JournalRecord> = new Map();
  private habits: Map<string, HabitRecord> = new Map();
  private conversations: Map<string, AIConversationRecord> = new Map();
  
  // Content Catalog & Recommendation Store
  private contentCatalog: Map<string, RecommendationItem> = new Map();
  private savedItems: Map<string, Set<string>> = new Map(); // userId -> Set<contentId>
  private dismissedItems: Map<string, Set<string>> = new Map(); // userId -> Set<contentId>
  private feedbackRecords: RecommendationFeedbackRecord[] = [];
  private userPreferenceVectors: Map<string, UserPreferenceVector> = new Map();
  private patternFeedbacks: Map<string, Map<string, UserPatternFeedback>> = new Map(); // userId -> patternId -> feedback

  constructor() {
    this.seedDefaultData();
    this.seedContentCatalog();
    this.initMLRecommenders();
  }

  private seedDefaultData() {
    // 1. Users
    const sarah: UserProfile = {
      id: 'usr_sarah_101',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'user',
      createdAt: '2026-09-01T08:00:00.000Z',
      lastLogin: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'calm',
        timezone: 'UTC',
        aiContextSharing: true,
        dailyReminderTime: '08:30',
        soundEnabled: true,
        musicGenres: ['Acoustic', 'Indie Folk', 'Ambient', 'Lo-Fi'],
        movieGenres: ['Drama', 'Whimsical Comedy', 'Animation', 'Adventure'],
        preferredIntentions: ['calm', 'comfort', 'reset'],
        excludedCategories: [],
        personalizationEnabled: true,
        journalConsent: false,
        onboardingCompleted: true,
      },
    };

    const admin: UserProfile = {
      id: 'usr_admin_001',
      name: 'Dr. Michael Vance',
      email: 'admin@mindmate.com',
      role: 'admin',
      createdAt: '2026-08-15T09:00:00.000Z',
      lastLogin: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'calm',
        timezone: 'UTC',
        aiContextSharing: false,
        dailyReminderTime: '09:00',
        soundEnabled: false,
        musicGenres: ['Classical', 'Ambient'],
        movieGenres: ['Documentary', 'Drama'],
        preferredIntentions: ['focus', 'calm'],
        excludedCategories: [],
        personalizationEnabled: true,
        journalConsent: false,
        onboardingCompleted: true,
      },
    };

    this.users.set(sarah.id, sarah);
    this.credentials.set(sarah.email.toLowerCase(), 'sarah123');

    this.users.set(admin.id, admin);
    this.credentials.set(admin.email.toLowerCase(), 'admin123');

    // 2. Seed Moods for Sarah (last 30 days of data for rich calendar & charts)
    const seedMoodsList: Array<{
      daysAgo: number;
      level: 1 | 2 | 3 | 4 | 5;
      label: MoodCategory;
      note: string;
      emotions: string[];
      energy: number;
      stress: number;
      context: string[];
    }> = [
      { daysAgo: 29, level: 3, label: 'Okay', note: 'Start of a new routine. Feeling steady.', emotions: ['Balanced'], energy: 5, stress: 5, context: ['Work'] },
      { daysAgo: 28, level: 4, label: 'Good', note: 'Morning tea on the porch was so peaceful.', emotions: ['Calm', 'Grateful'], energy: 7, stress: 3, context: ['Outdoors', 'Rest'] },
      { daysAgo: 27, level: 4, label: 'Good', note: 'Productive work session.', emotions: ['Focused', 'Content'], energy: 7, stress: 4, context: ['Work'] },
      { daysAgo: 26, level: 5, label: 'Great', note: 'Completed big project presentation!', emotions: ['Proud', 'Energized'], energy: 9, stress: 2, context: ['Work', 'Social'] },
      { daysAgo: 25, level: 4, label: 'Good', note: 'Walked in the park for 45 minutes.', emotions: ['Serene', 'Refreshed'], energy: 8, stress: 2, context: ['Outdoors'] },
      { daysAgo: 24, level: 3, label: 'Okay', note: 'A bit rainy, stayed indoors reading.', emotions: ['Reflective'], energy: 5, stress: 3, context: ['Rest'] },
      { daysAgo: 23, level: 2, label: 'Low', note: 'Tired and feeling slight burnout.', emotions: ['Fatigued', 'Tender'], energy: 3, stress: 7, context: ['Work'] },
      { daysAgo: 22, level: 3, label: 'Okay', note: 'Slow morning with gentle breathing exercises.', emotions: ['Patient'], energy: 5, stress: 5, context: ['Rest'] },
      { daysAgo: 21, level: 4, label: 'Good', note: 'Cooking dinner with friends helped lift mood.', emotions: ['Connected', 'Warm'], energy: 7, stress: 3, context: ['Social'] },
      { daysAgo: 20, level: 4, label: 'Good', note: 'Clear head and calm focus today.', emotions: ['Focused', 'Calm'], energy: 7, stress: 3, context: ['Work'] },
      { daysAgo: 19, level: 5, label: 'Great', note: 'Wonderful hike in the eucalyptus woods!', emotions: ['Joyful', 'Free'], energy: 9, stress: 1, context: ['Outdoors', 'Exercise'] },
      { daysAgo: 18, level: 4, label: 'Good', note: 'Gentle Sunday afternoon stretching.', emotions: ['Relaxed'], energy: 7, stress: 2, context: ['Rest'] },
      { daysAgo: 17, level: 3, label: 'Okay', note: 'Monday start, steady pacing.', emotions: ['Balanced'], energy: 6, stress: 4, context: ['Work'] },
      { daysAgo: 16, level: 2, label: 'Low', note: 'Didn\'t sleep well last night.', emotions: ['Fatigued'], energy: 3, stress: 6, context: ['Sleep'] },
      { daysAgo: 15, level: 3, label: 'Okay', note: 'Took a mindful break and afternoon walk.', emotions: ['Hopeful'], energy: 6, stress: 4, context: ['Outdoors'] },
      { daysAgo: 14, level: 4, label: 'Good', note: 'Feeling grounded and back in rhythm.', emotions: ['Calm', 'Content'], energy: 7, stress: 3, context: ['Work'] },
      { daysAgo: 13, level: 4, label: 'Good', note: 'Listened to acoustic playlists all afternoon.', emotions: ['Peaceful'], energy: 7, stress: 2, context: ['Rest'] },
      { daysAgo: 12, level: 5, label: 'Great', note: 'Celebrated a quiet win with my team.', emotions: ['Proud', 'Energized'], energy: 8, stress: 2, context: ['Work', 'Social'] },
      { daysAgo: 11, level: 4, label: 'Good', note: 'Sunny weekend morning walk.', emotions: ['Grateful', 'Happy'], energy: 8, stress: 2, context: ['Outdoors'] },
      { daysAgo: 10, level: 4, label: 'Good', note: 'Woke up feeling refreshed after yoga.', emotions: ['Grateful', 'Calm'], energy: 8, stress: 2, context: ['Exercise'] },
      { daysAgo: 9, level: 3, label: 'Okay', note: 'Busy workday, took a 10 min breather.', emotions: ['Focused', 'Tired'], energy: 6, stress: 5, context: ['Work'] },
      { daysAgo: 8, level: 4, label: 'Good', note: 'Had lunch outside in the garden breeze.', emotions: ['Peaceful', 'Content'], energy: 7, stress: 3, context: ['Outdoors'] },
      { daysAgo: 7, level: 5, label: 'Great', note: 'Finished a major milestone and celebrated.', emotions: ['Proud', 'Joyful'], energy: 9, stress: 2, context: ['Social'] },
      { daysAgo: 6, level: 4, label: 'Good', note: 'Calm evening reading and herbal tea.', emotions: ['Serene', 'Relaxed'], energy: 7, stress: 2, context: ['Rest'] },
      { daysAgo: 5, level: 2, label: 'Low', note: 'Slight head cold, resting up with blankets.', emotions: ['Fatigued', 'Patient'], energy: 4, stress: 5, context: ['Health'] },
      { daysAgo: 4, level: 3, label: 'Okay', note: 'Recovering slowly, gentle stretching helped.', emotions: ['Reflective'], energy: 5, stress: 4, context: ['Rest'] },
      { daysAgo: 3, level: 4, label: 'Good', note: 'Back to daily walk, fresh morning air.', emotions: ['Hopeful', 'Calm'], energy: 7, stress: 2, context: ['Outdoors'] },
      { daysAgo: 2, level: 4, label: 'Good', note: 'Clear mind and productive afternoon.', emotions: ['Energized', 'Grateful'], energy: 8, stress: 3, context: ['Work'] },
      { daysAgo: 1, level: 5, label: 'Great', note: 'Quiet evening reflection, heart full.', emotions: ['Content', 'Joyful'], energy: 8, stress: 1, context: ['Rest'] },
      { daysAgo: 0, level: 4, label: 'Good', note: 'Checked in today feeling grounded and present.', emotions: ['Calm', 'Content', 'Grateful'], energy: 8, stress: 2, context: ['Outdoors', 'Rest'] },
    ];

    seedMoodsList.forEach((m, idx) => {
      const dateStr = getTodayDateString(-m.daysAgo);
      const id = `mood_sarah_${idx + 1}`;
      this.moods.set(id, {
        id,
        userId: sarah.id,
        moodLevel: m.level,
        moodLabel: m.label,
        note: m.note,
        emotions: m.emotions,
        energyLevel: m.energy,
        stressLevel: m.stress,
        contextTags: m.context,
        desiredExperience: m.level <= 2 ? 'Comfort' : 'Calm',
        date: dateStr,
        timestamp: `${dateStr}T10:30:00.000Z`,
        createdAt: `${dateStr}T10:30:00.000Z`
      });
    });

    // 3. Seed Journals for Sarah
    const sampleJournals = [
      {
        title: 'Morning Light & Setting Intentions',
        content: 'Woke up at 6:45 AM before the alarm. The morning mist was hovering over the trees in the valley. Took ten minutes to sit quietly with a hot matcha tea. I realized lately I have been rushing from task to task without pausing to see how much has already gone right. Today, my intention is gentleness with myself.',
        tags: ['Morning Routine', 'Intentions', 'Mindfulness'],
        moodAssociation: 'Good',
        daysAgo: 1
      },
      {
        title: 'Finding Beauty in the Small Moments',
        content: 'During my lunch break, I closed my laptop and walked through the park. Watching the sunlight filter through the eucalyptus leaves felt like a soothing reset. Even on busy days, 15 minutes of uninterrupted quiet completely changes my emotional perspective.',
        tags: ['Outdoors', 'Nature', 'Gratitude'],
        moodAssociation: 'Great',
        daysAgo: 3
      },
      {
        title: 'Allowing Low Energy Days Without Guilt',
        content: 'Today was heavy. I woke up with zero drive. Normally, my inner critic would start telling me I am falling behind. Instead, I practiced self-compassion. I put on cozy clothes, drank chamomile tea, and read a gentle book. It is okay to be human.',
        tags: ['Self-Compassion', 'Healing', 'Rest'],
        moodAssociation: 'Low',
        daysAgo: 5
      }
    ];

    sampleJournals.forEach((j, idx) => {
      const id = `jnl_sarah_${idx + 1}`;
      const dateStr = getTodayDateString(-j.daysAgo);
      this.journals.set(id, {
        id,
        userId: sarah.id,
        title: j.title,
        content: j.content,
        tags: j.tags,
        moodAssociation: j.moodAssociation,
        isPrivate: false,
        wordCount: j.content.split(/\s+/).filter(Boolean).length,
        date: dateStr,
        createdAt: `${dateStr}T11:00:00.000Z`,
        updatedAt: `${dateStr}T11:00:00.000Z`
      });
    });

    // 4. Seed Habits for Sarah
    const seedHabits = [
      {
        name: 'Morning Hydration & Stretch',
        description: 'Drink 500ml water and 5 minutes gentle neck/shoulder stretching',
        category: 'Health' as const,
        targetDaysPerWeek: 7,
        streak: 14,
        bestStreak: 21,
        completionsDaysAgo: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      },
      {
        name: '30-Minute Outdoor Nature Walk',
        description: 'Step outside into green space without podcast or screen',
        category: 'Mindfulness' as const,
        targetDaysPerWeek: 5,
        streak: 8,
        bestStreak: 12,
        completionsDaysAgo: [0, 1, 2, 3, 4, 6, 7, 8]
      },
      {
        name: 'Evening Journal Reflection',
        description: 'Write 3 things I appreciated and 1 gentle learning',
        category: 'Growth' as const,
        targetDaysPerWeek: 6,
        streak: 5,
        bestStreak: 15,
        completionsDaysAgo: [0, 1, 3, 5, 6]
      },
      {
        name: '4-7-8 Breathing Before Sleep',
        description: '4 cycles of calming parasympathetic breathwork in bed',
        category: 'Rest' as const,
        targetDaysPerWeek: 7,
        streak: 11,
        bestStreak: 18,
        completionsDaysAgo: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      }
    ];

    seedHabits.forEach((h, idx) => {
      const id = `hab_sarah_${idx + 1}`;
      this.habits.set(id, {
        id,
        userId: sarah.id,
        name: h.name,
        description: h.description,
        category: h.category,
        frequency: 'daily',
        targetDaysPerWeek: h.targetDaysPerWeek,
        archived: false,
        streak: h.streak,
        bestStreak: h.bestStreak,
        createdAt: getTodayDateString(-30),
        completions: h.completionsDaysAgo.map(d => getTodayDateString(-d))
      });
    });

    // 5. Seed Initial Saved Items for Sarah
    const sarahSaved = new Set<string>(['rec_mus_01', 'rec_mov_01', 'rec_act_01']);
    this.savedItems.set(sarah.id, sarahSaved);
  }

  // --- Seed Content Catalog (Matching image.png & Master Prompt) ---
  private seedContentCatalog() {
    const items: RecommendationItem[] = [
      // Music (Matching image.png cards)
      {
        id: 'rec_mus_01',
        type: 'music',
        title: 'Clean Vibes',
        subtitle: 'Playlist · 50 min',
        categoryBadge: 'for a gentle reset',
        badgeVariant: 'mint',
        duration: '50 min',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        genre: 'Acoustic / Instrumental',
        synopsis: 'Gentle acoustic fingerpicking, airy piano melodies, and warm morning ambience designed to refresh focus without distraction.',
        moodAffinities: ['Good', 'Great', 'Okay', 'All'],
        energyFit: 'medium',
        intentions: ['reset', 'calm', 'focus', 'flow'],
        explanation: 'Recommended because you reported feeling calm and requested peaceful acoustic accompaniment.'
      },
      {
        id: 'rec_mus_02',
        type: 'music',
        title: 'Feel Good Pop',
        subtitle: 'Playlist · 45 min',
        categoryBadge: 'lift your energy',
        badgeVariant: 'peach',
        duration: '45 min',
        imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=600&q=80',
        genre: 'Indie Pop / Sunlit',
        synopsis: 'Sun-drenched chords, optimistic indie vocals, and buoyant rhythms that gently lift spirits without artificial urgency.',
        moodAffinities: ['Great', 'Good', 'Low', 'All'],
        energyFit: 'high',
        intentions: ['energy', 'joy', 'uplift', 'motivation'],
        explanation: 'Selected to match your positive momentum and lift daily energy.'
      },
      {
        id: 'rec_mus_03',
        type: 'music',
        title: 'Indie Calm',
        subtitle: 'Playlist · 52 min',
        categoryBadge: 'feel understood',
        badgeVariant: 'lavender',
        duration: '52 min',
        imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
        genre: 'Indie Folk / Melancholy',
        synopsis: 'Tender acoustic ballads, soulful strings, and introspective poetry that validate complex emotional moments with dignity.',
        moodAffinities: ['Low', 'Struggling', 'Okay', 'All'],
        energyFit: 'low',
        intentions: ['comfort', 'feel_understood', 'calm', 'reflection'],
        explanation: 'Recommended as a comforting companion that honors tender, quiet feelings rather than forcing cheerfulness.'
      },
      {
        id: 'rec_mus_04',
        type: 'music',
        title: 'Night Whispers',
        subtitle: 'Playlist · 1 hr',
        categoryBadge: 'for better sleep',
        badgeVariant: 'cyan',
        duration: '1 hr',
        imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80',
        genre: 'Ambient / Drone / Delta Waves',
        synopsis: 'Subtle resonant harmonics, soft pine wind field recordings, and slow analog textures calibrated for unwinding into deep sleep.',
        moodAffinities: ['Struggling', 'Low', 'Okay', 'All'],
        energyFit: 'low',
        intentions: ['sleep', 'relax', 'calm', 'comfort'],
        explanation: 'Selected for low evening energy and unwinding the nervous system before bedtime.'
      },
      {
        id: 'rec_mus_05',
        type: 'music',
        title: 'Lo-Fi Study Flow',
        subtitle: 'Playlist · 1 hr 15 min',
        categoryBadge: 'focus and flow',
        badgeVariant: 'amber',
        duration: '75 min',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
        genre: 'Lo-Fi / Downtempo',
        synopsis: 'Cozy vinyl warmth, muted Rhodes keyboards, and gentle tape-saturated beats to hold steady productive focus.',
        moodAffinities: ['Good', 'Okay', 'All'],
        energyFit: 'medium',
        intentions: ['focus', 'calm', 'flow'],
        explanation: 'Recommended because you indicated a desire for grounded, productive concentration.'
      },
      {
        id: 'rec_mus_06',
        type: 'music',
        title: 'Acoustic Hearth',
        subtitle: 'Playlist · 42 min',
        categoryBadge: 'comfort & connection',
        badgeVariant: 'mint',
        duration: '42 min',
        imageUrl: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80',
        genre: 'Folk / Cello',
        synopsis: 'Warm wooden resonance, fingerstyle guitar, and comforting melodies that feel like an evening fireside retreat.',
        moodAffinities: ['Low', 'Struggling', 'Okay', 'All'],
        energyFit: 'low',
        intentions: ['comfort', 'connection', 'calm'],
        explanation: 'Selected because you have historically saved acoustic folk when feeling low.'
      },

      // Movies & Shows (Matching image.png cards)
      {
        id: 'rec_mov_01',
        type: 'movie',
        title: 'The Secret Life of Walter Mitty',
        subtitle: 'Movie · Drama · 1h 54m',
        categoryBadge: 'for a gentle reset',
        badgeVariant: 'mint',
        duration: '1h 54m',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
        genre: 'Adventure / Drama',
        synopsis: 'When his job along with that of his coworker are threatened, Walter takes action in the real world embarking on a global journey that turns into an adventure more extraordinary than anything he ever imagined.',
        moodAffinities: ['Okay', 'Low', 'Good', 'All'],
        energyFit: 'medium',
        intentions: ['reset', 'inspiration', 'calm'],
        explanation: 'Recommended because Walter Mitty\'s journey from quiet daydreams into real courage offers a gentle, inspiring reset.'
      },
      {
        id: 'rec_mov_02',
        type: 'movie',
        title: 'Good Will Hunting',
        subtitle: 'Movie · Drama · 2h 6m',
        categoryBadge: 'lift your energy',
        badgeVariant: 'peach',
        duration: '2h 6m',
        imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
        genre: 'Drama / Connection',
        synopsis: 'Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction and accept emotional vulnerability in his life.',
        moodAffinities: ['Low', 'Struggling', 'Okay', 'All'],
        energyFit: 'medium',
        intentions: ['feel_understood', 'connection', 'energy'],
        explanation: 'Selected for its profound dialogue on mentorship, emotional honesty, and self-acceptance.'
      },
      {
        id: 'rec_mov_03',
        type: 'movie',
        title: 'Amélie',
        subtitle: 'Movie · Comedy · 2h 2m',
        categoryBadge: 'feel understood',
        badgeVariant: 'lavender',
        duration: '2h 2m',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
        genre: 'Whimsical Comedy',
        synopsis: 'Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers the beauty of quiet romantic vulnerability.',
        moodAffinities: ['Low', 'Okay', 'Good', 'All'],
        energyFit: 'medium',
        intentions: ['joy', 'comfort', 'feel_understood'],
        explanation: 'Recommended because you enjoy gentle whimsical comedies that bring warm human connection without cynicism.'
      },
      {
        id: 'rec_mov_04',
        type: 'movie',
        title: 'The Midnight Library',
        subtitle: 'Series · Drama · 45m',
        categoryBadge: 'for a calmer mind',
        badgeVariant: 'cyan',
        duration: '45m',
        imageUrl: 'https://images.unsplash.com/photo-1507842229451-9f7a6358c89c?auto=format&fit=crop&w=600&q=80',
        genre: 'Magical Realism / Philosophy',
        synopsis: 'Between life and death there is a mystical library with infinite books, where Nora explores alternate choices she could have made, discovering profound peace with the present.',
        moodAffinities: ['Struggling', 'Low', 'Okay', 'All'],
        energyFit: 'low',
        intentions: ['calm', 'comfort', 'reflection'],
        explanation: 'Selected to offer perspective on self-forgiveness and calming regret.'
      },
      {
        id: 'rec_mov_05',
        type: 'movie',
        title: 'Paddington 2',
        subtitle: 'Movie · Comedy · 1h 43m',
        categoryBadge: 'lighthearted comfort',
        badgeVariant: 'peach',
        duration: '1h 43m',
        imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
        genre: 'Heartwarming Family',
        synopsis: 'Paddington settles in with the Brown family, bringing gentle kindness, delicious marmalade sandwiches, and boundless joy to his entire neighborhood.',
        moodAffinities: ['Struggling', 'Low', 'Great', 'All'],
        energyFit: 'all',
        intentions: ['comfort', 'joy'],
        explanation: 'Recommended because you asked for something comforting, pure, and genuinely uplifting.'
      },
      {
        id: 'rec_mov_06',
        type: 'movie',
        title: 'My Neighbor Totoro',
        subtitle: 'Movie · Animation · 1h 26m',
        categoryBadge: 'peaceful wonder',
        badgeVariant: 'mint',
        duration: '1h 26m',
        imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
        genre: 'Gentle Animation',
        synopsis: 'Two young sisters explore their new countryside home and discover friendly woodland spirits who bring magic and emotional comfort during family stress.',
        moodAffinities: ['Low', 'Struggling', 'Good', 'All'],
        energyFit: 'low',
        intentions: ['calm', 'comfort'],
        explanation: 'Recommended for its serene countryside pacing and soothing hand-drawn animation.'
      },

      // Activities
      {
        id: 'rec_act_01',
        type: 'activity',
        title: '5-Minute Outdoor Grounding Walk',
        subtitle: 'Gentle Movement · 5 min',
        categoryBadge: 'for a gentle reset',
        badgeVariant: 'mint',
        duration: '5 min',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
        genre: 'Nature & Somatic',
        synopsis: 'Step outdoors, breathe cool air, and observe 5 distinct natural textures. Proven to break rumination loops and reset mental energy.',
        moodAffinities: ['Struggling', 'Low', 'Okay', 'Good', 'All'],
        energyFit: 'low',
        intentions: ['reset', 'calm', 'energy'],
        explanation: 'You\'ve consistently reported higher energy on days with outdoor time.'
      },
      {
        id: 'rec_act_02',
        type: 'activity',
        title: 'Hydration & Shoulder Drop Release',
        subtitle: 'Physical Care · 2 min',
        categoryBadge: 'quick relief',
        badgeVariant: 'peach',
        duration: '2 min',
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
        genre: 'Physical Care',
        synopsis: 'Drink a glass of cold water slowly. While swallowing, deliberately let your shoulders fall away from your ears and unclench your jaw.',
        moodAffinities: ['Struggling', 'Low', 'Okay', 'Great', 'All'],
        energyFit: 'all',
        intentions: ['reset', 'energy', 'calm'],
        explanation: 'A zero-effort physical cue to release tension immediately.'
      },
      {
        id: 'rec_act_03',
        type: 'activity',
        title: 'Stream-of-Consciousness Journaling',
        subtitle: 'Emotional Clarity · 10 min',
        categoryBadge: 'feel understood',
        badgeVariant: 'lavender',
        duration: '10 min',
        imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
        genre: 'Reflective Journaling',
        synopsis: 'Write continuously for 10 minutes without judging grammar or punctuation. Let whatever is sitting heavy on your mind flow freely onto the page.',
        moodAffinities: ['Low', 'Struggling', 'Okay', 'All'],
        energyFit: 'medium',
        intentions: ['comfort', 'feel_understood', 'calm'],
        explanation: 'Recommended to release mental clutter and process complex thoughts safely.'
      },
      {
        id: 'rec_act_04',
        type: 'activity',
        title: 'Send a Thoughtful Text to a Friend',
        subtitle: 'Heart Connection · 3 min',
        categoryBadge: 'connection & warmth',
        badgeVariant: 'peach',
        duration: '3 min',
        imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
        genre: 'Social Wellness',
        synopsis: 'Send a brief message of appreciation to someone you care about: "Just wanted to say I appreciate you and hope you are having a gentle day."',
        moodAffinities: ['Good', 'Great', 'Low', 'All'],
        energyFit: 'low',
        intentions: ['connection', 'joy', 'comfort'],
        explanation: 'Fosters mutual warmth without the pressure of an exhausting phone call.'
      },
      {
        id: 'rec_act_05',
        type: 'activity',
        title: 'Gentle Somatic Body Scan',
        subtitle: 'Restorative Reset · 7 min',
        categoryBadge: 'deep unwind',
        badgeVariant: 'cyan',
        duration: '7 min',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        genre: 'Mindfulness',
        synopsis: 'Lie down or sit comfortably. Trace sensation from your toes to the crown of your head, welcoming whatever you feel without trying to fix it.',
        moodAffinities: ['Struggling', 'Low', 'All'],
        energyFit: 'low',
        intentions: ['calm', 'relax', 'sleep'],
        explanation: 'Selected to lower acute stress and restore body connection.'
      },

      // Tools
      {
        id: 'rec_tool_01',
        type: 'tool',
        title: '60-Second Breathing Exercise',
        subtitle: 'Calm Sanctuary Pacer · 60s',
        categoryBadge: 'quick action',
        badgeVariant: 'mint',
        duration: '60s',
        imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
        genre: 'Breathwork',
        synopsis: 'A guided rhythmic visual circle for 4-7-8 breathing. Inhale for 4 seconds, hold for 7, exhale for 8 to trigger your body\'s natural relaxation response.',
        moodAffinities: ['Struggling', 'Low', 'Okay', 'Good', 'All'],
        energyFit: 'all',
        intentions: ['calm', 'reset', 'relax'],
        explanation: 'A clinically grounded 60-second breathing pacer to reduce nervous system arousal immediately.'
      },
      {
        id: 'rec_tool_02',
        type: 'tool',
        title: '5-4-3-2-1 Grounding Practice',
        subtitle: 'Sensory Anchor · 3 min',
        categoryBadge: 'sensory anchor',
        badgeVariant: 'lavender',
        duration: '3 min',
        imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
        genre: 'Grounding Technique',
        synopsis: 'Anchor yourself in the room: 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
        moodAffinities: ['Struggling', 'Low', 'All'],
        energyFit: 'low',
        intentions: ['calm', 'reset'],
        explanation: 'Recommended when experiencing sensory overwhelm or spiraling thoughts.'
      },
      {
        id: 'rec_tool_03',
        type: 'tool',
        title: 'Rain & Forest Soundscape',
        subtitle: 'Ambient Generator · Untimed',
        categoryBadge: 'ambient sanctuary',
        badgeVariant: 'cyan',
        duration: 'Untimed',
        imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=600&q=80',
        genre: 'Web Audio Ambient',
        synopsis: 'Synthesized warm pink noise filtered to match soothing coastal rain and gentle pine forest wind.',
        moodAffinities: ['All'],
        energyFit: 'all',
        intentions: ['focus', 'calm', 'sleep'],
        explanation: 'Generates real-time relaxing acoustic background audio with no external data transfer.'
      }
    ];

    items.forEach(it => this.contentCatalog.set(it.id, it));
  }

  // --- Machine Learning Recommendation Pipeline Initialization ---
  private initMLRecommenders() {
    // 1. Index content-based TF-IDF and genre vectors across all catalog items
    contentBasedRecommender.indexCatalog(Array.from(this.contentCatalog.values()));

    // 2. Seed baseline collaborative matrix from historical wellness corpus
    const seedInteractions = [
      { userId: 'usr_sample_1', itemId: 'rec_mus_01', rating: 5.0, timestamp: '2026-10-01T12:00:00Z' },
      { userId: 'usr_sample_1', itemId: 'rec_mov_01', rating: 4.5, timestamp: '2026-10-01T12:30:00Z' },
      { userId: 'usr_sample_2', itemId: 'rec_mus_01', rating: 4.8, timestamp: '2026-10-02T10:00:00Z' },
      { userId: 'usr_sample_2', itemId: 'rec_mov_03', rating: 5.0, timestamp: '2026-10-02T11:00:00Z' },
      { userId: 'usr_sample_3', itemId: 'rec_mus_02', rating: 4.7, timestamp: '2026-10-03T09:00:00Z' },
      { userId: 'usr_sample_3', itemId: 'rec_mov_01', rating: 4.2, timestamp: '2026-10-03T10:00:00Z' },
      { userId: 'usr_sample_4', itemId: 'rec_mus_03', rating: 4.9, timestamp: '2026-10-04T14:00:00Z' },
      { userId: 'usr_sample_4', itemId: 'rec_mus_01', rating: 4.6, timestamp: '2026-10-04T15:00:00Z' },
      { userId: 'usr_sarah_101', itemId: 'rec_mus_01', rating: 5.0, timestamp: '2026-10-15T08:00:00Z' },
      { userId: 'usr_sarah_101', itemId: 'rec_mov_01', rating: 4.8, timestamp: '2026-10-16T19:00:00Z' },
    ];
    collaborativeRecommender.loadInteractions(seedInteractions);

    // 3. Seed popularity counts
    for (const item of this.contentCatalog.values()) {
      popularityRecommender.recordInteraction(item.id, 4.0);
    }
  }

  public getUserPreferenceVector(userId: string): UserPreferenceVector | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    if (user.preferences.personalizationEnabled === false) {
      return null; // Personalization disabled by user
    }

    if (!this.userPreferenceVectors.has(userId)) {
      // Build baseline vector from explicit onboarding preferences
      const genreWeights: Record<string, number> = {};
      (user.preferences.musicGenres || []).forEach(g => { genreWeights[g] = 2.5; });
      (user.preferences.movieGenres || []).forEach(g => { genreWeights[g] = 2.5; });

      const moodAffinityWeights: Record<MoodCategory | 'All', number> = {
        'Great': 1.0,
        'Good': 1.0,
        'Okay': 1.0,
        'Low': 1.0,
        'Struggling': 1.0,
        'All': 1.0
      };

      const vector: UserPreferenceVector = {
        userId,
        genreWeights,
        artistWeights: {},
        directorWeights: {},
        moodAffinityWeights,
        energyPreference: 6,
        stressSensitivity: 5,
        dislikedItemIds: new Set(this.dismissedItems.get(userId) || []),
        likedItemIds: new Set(),
        savedItemIds: new Set(this.savedItems.get(userId) || []),
        ratedItems: new Map(),
        lastUpdated: new Date().toISOString()
      };
      this.userPreferenceVectors.set(userId, vector);
    }

    return this.userPreferenceVectors.get(userId)!;
  }

  // --- Machine Learning Hybrid Recommendations ---
  public getRecommendations(
    userId: string,
    options: {
      type?: 'music' | 'movie' | 'activity' | 'tool' | 'all';
      intention?: string;
      mood?: MoodCategory;
      limit?: number;
      includeSaved?: boolean;
      genreFilter?: string;
      maxDurationMinutes?: number;
    } = {}
  ): RecommendationItem[] {
    const userProfile = this.getUserPreferenceVector(userId);
    const userSaved = this.savedItems.get(userId) || new Set<string>();

    const latestMoodRecord = this.getMoodsForUser(userId)[0];
    const currentMood: MoodCategory = options.mood || latestMoodRecord?.moodLabel || 'Good';
    const currentEnergy = latestMoodRecord?.energyLevel ?? 6;
    const currentStress = latestMoodRecord?.stressLevel ?? 3;

    const hybridResults = hybridEngine.recommend(
      userId,
      userProfile,
      this.contentCatalog,
      {
        type: options.type || 'all',
        mood: currentMood,
        energyLevel: currentEnergy,
        stressLevel: currentStress,
        intention: options.intention,
        limit: options.limit || 12,
        genreFilter: options.genreFilter,
        maxDurationMinutes: options.maxDurationMinutes,
      }
    );

    return hybridResults.map(r => ({
      ...r.item,
      isSaved: userSaved.has(r.item.id),
      explanation: r.explanation
    }));
  }

  // --- Feedback & Save Operations (Online Learning Loop) ---
  public toggleSaveContent(userId: string, contentId: string): boolean {
    if (!this.savedItems.has(userId)) {
      this.savedItems.set(userId, new Set<string>());
    }
    const set = this.savedItems.get(userId)!;
    const isSaved = set.has(contentId);
    if (isSaved) {
      set.delete(contentId);
    } else {
      set.add(contentId);
    }

    const vector = this.getUserPreferenceVector(userId);
    if (vector) {
      if (isSaved) {
        vector.savedItemIds.delete(contentId);
      } else {
        vector.savedItemIds.add(contentId);
        const item = this.contentCatalog.get(contentId);
        if (item) {
          vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) + 0.8;
          collaborativeRecommender.recordInteraction(userId, contentId, 4.5);
          popularityRecommender.recordInteraction(contentId, 4.5);
        }
      }
      vector.lastUpdated = new Date().toISOString();
    }

    this.feedbackRecords.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      contentId,
      action: isSaved ? 'unsave' : 'save',
      createdAt: new Date().toISOString()
    });

    return !isSaved;
  }

  public likeContent(userId: string, contentId: string): void {
    const vector = this.getUserPreferenceVector(userId);
    if (vector) {
      vector.likedItemIds.add(contentId);
      vector.dislikedItemIds.delete(contentId);
      const item = this.contentCatalog.get(contentId);
      if (item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) + 1.5;
        collaborativeRecommender.recordInteraction(userId, contentId, 5.0);
        popularityRecommender.recordInteraction(contentId, 5.0);
      }
      vector.lastUpdated = new Date().toISOString();
    }

    this.feedbackRecords.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      contentId,
      action: 'rate',
      value: 5.0,
      createdAt: new Date().toISOString()
    });
  }

  public dislikeContent(userId: string, contentId: string): void {
    this.dismissContent(userId, contentId);
    const vector = this.getUserPreferenceVector(userId);
    if (vector) {
      vector.likedItemIds.delete(contentId);
      vector.dislikedItemIds.add(contentId);
      const item = this.contentCatalog.get(contentId);
      if (item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) - 2.5;
        collaborativeRecommender.recordInteraction(userId, contentId, 1.0);
        popularityRecommender.recordInteraction(contentId, 1.0);
      }
      vector.lastUpdated = new Date().toISOString();
    }
  }

  public rateContent(userId: string, contentId: string, rating: number): void {
    const clampedRating = Math.max(1.0, Math.min(5.0, rating));
    const vector = this.getUserPreferenceVector(userId);
    if (vector) {
      vector.ratedItems.set(contentId, clampedRating);
      if (clampedRating >= 4.0) {
        vector.likedItemIds.add(contentId);
      } else if (clampedRating <= 2.0) {
        vector.dislikedItemIds.add(contentId);
      }
      const item = this.contentCatalog.get(contentId);
      if (item) {
        const delta = (clampedRating - 3.0) * 0.8;
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) + delta;
      }
      vector.lastUpdated = new Date().toISOString();
    }

    collaborativeRecommender.recordInteraction(userId, contentId, clampedRating);
    popularityRecommender.recordInteraction(contentId, clampedRating);

    this.feedbackRecords.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      contentId,
      action: 'rate',
      value: clampedRating,
      createdAt: new Date().toISOString()
    });
  }

  public dismissContent(userId: string, contentId: string): void {
    if (!this.dismissedItems.has(userId)) {
      this.dismissedItems.set(userId, new Set<string>());
    }
    this.dismissedItems.get(userId)!.add(contentId);

    const vector = this.getUserPreferenceVector(userId);
    if (vector) {
      vector.dislikedItemIds.add(contentId);
      vector.lastUpdated = new Date().toISOString();
    }

    this.feedbackRecords.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      contentId,
      action: 'dismiss',
      createdAt: new Date().toISOString()
    });
  }

  public submitRecommendationFeedback(
    userId: string, 
    contentId: string, 
    action: string, 
    value?: string | number
  ): void {
    const vector = this.getUserPreferenceVector(userId);
    const item = this.contentCatalog.get(contentId);

    // Continuous learning loop updates
    if (action === 'exactly_what_i_wanted' || value === 'exactly_what_i_wanted' || value === 'yes') {
      if (vector && item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) + 2.0;
        vector.likedItemIds.add(contentId);
        item.moodAffinities.forEach(m => {
          vector.moodAffinityWeights[m] = (vector.moodAffinityWeights[m] || 1.0) + 1.0;
        });
        vector.lastUpdated = new Date().toISOString();
      }
      this.likeContent(userId, contentId);
    } else if (action === 'more_like_this' || value === 'more_like_this') {
      if (vector && item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) + 1.5;
        vector.likedItemIds.add(contentId);
        vector.lastUpdated = new Date().toISOString();
      }
      popularityRecommender.recordInteraction(contentId, 4.5);
      collaborativeRecommender.recordInteraction(userId, contentId, 4.5);
    } else if (action === 'not_for_me' || value === 'not_for_me' || value === 'no') {
      if (vector && item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) - 2.5;
        vector.dislikedItemIds.add(contentId);
        vector.lastUpdated = new Date().toISOString();
      }
      this.dismissContent(userId, contentId);
    } else if (action === 'less_like_this' || value === 'less_like_this') {
      if (vector && item) {
        vector.genreWeights[item.genre] = (vector.genreWeights[item.genre] || 1.0) - 1.5;
        vector.lastUpdated = new Date().toISOString();
      }
      popularityRecommender.recordInteraction(contentId, 2.0);
      collaborativeRecommender.recordInteraction(userId, contentId, 2.0);
    } else if (action === 'rate' && (typeof value === 'number' || !isNaN(Number(value)))) {
      this.rateContent(userId, contentId, Number(value));
    }

    this.feedbackRecords.push({
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      contentId,
      action: action as 'fit_feedback' | 'rate',
      value: value ?? 1,
      createdAt: new Date().toISOString()
    });
  }

  // --- Mood Intelligence Patterns ---
  public getMoodPatterns(userId: string): MoodPatternInsight[] {
    const userMoods = this.getMoodsForUser(userId);
    const userHabits = this.getHabitsForUser(userId);
    const feedbackMap = this.patternFeedbacks.get(userId) || new Map<string, UserPatternFeedback>();

    return moodIntelligenceEngine.detectPatterns(userMoods, userHabits, feedbackMap);
  }

  public submitPatternFeedback(
    userId: string, 
    patternId: string, 
    status: 'validated' | 'corrected' | 'dismissed', 
    userCorrection?: string
  ): void {
    if (!this.patternFeedbacks.has(userId)) {
      this.patternFeedbacks.set(userId, new Map());
    }
    this.patternFeedbacks.get(userId)!.set(patternId, {
      patternId,
      status,
      userCorrection,
      timestamp: new Date().toISOString()
    });
  }

  public getSavedContent(userId: string): RecommendationItem[] {
    const savedSet = this.savedItems.get(userId) || new Set<string>();
    return Array.from(savedSet)
      .map(id => this.contentCatalog.get(id))
      .filter((it): it is RecommendationItem => Boolean(it))
      .map(it => ({ ...it, isSaved: true }));
  }

  public resetLearnedPreferences(userId: string): void {
    this.dismissedItems.delete(userId);
    this.userPreferenceVectors.delete(userId);
    this.feedbackRecords = this.feedbackRecords.filter(f => f.userId !== userId);
  }

  public getModelRegistry() {
    return modelRegistry;
  }

  public searchCatalog(
    query: string,
    options: { type?: string; genre?: string; mood?: string; limit?: number } = {}
  ): RecommendationItem[] {
    const q = query.toLowerCase().trim();
    return Array.from(this.contentCatalog.values()).filter(item => {
      if (options.type && options.type !== 'all' && item.type !== options.type) {
        return false;
      }
      if (options.genre && !item.genre.toLowerCase().includes(options.genre.toLowerCase())) {
        return false;
      }
      if (options.mood && !item.moodAffinities.includes(options.mood as MoodCategory) && !item.moodAffinities.includes('All')) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.genre.toLowerCase().includes(q) ||
        item.synopsis.toLowerCase().includes(q) ||
        item.categoryBadge.toLowerCase().includes(q)
      );
    }).slice(0, options.limit || 50);
  }

  // --- User Operations ---
  public getUserById(id: string): UserProfile | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    const lower = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase().trim() === lower) return u;
    }
    return undefined;
  }

  public authenticateUser(email: string, pass: string): UserProfile | null {
    const lower = email.toLowerCase().trim();
    const storedPass = this.credentials.get(lower);
    if (!storedPass || storedPass !== pass) return null;
    const user = this.getUserByEmail(lower);
    if (user) {
      user.lastLogin = new Date().toISOString();
      return user;
    }
    return null;
  }

  public registerUser(name: string, email: string, pass: string): UserProfile {
    const lower = email.toLowerCase().trim();
    if (this.credentials.has(lower)) {
      throw new Error('An account with this email already exists.');
    }
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const user: UserProfile = {
      id,
      name,
      email: lower,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'calm',
        timezone: 'UTC',
        aiContextSharing: true,
        dailyReminderTime: '08:30',
        soundEnabled: true,
        musicGenres: ['Acoustic', 'Ambient'],
        movieGenres: ['Drama', 'Whimsical Comedy'],
        preferredIntentions: ['calm', 'comfort'],
        excludedCategories: [],
        personalizationEnabled: true,
        journalConsent: false,
        onboardingCompleted: false,
      },
    };
    this.users.set(id, user);
    this.credentials.set(lower, pass);
    return user;
  }

  public updateUserName(id: string, name: string): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    user.name = name;
    return user;
  }

  public updateUserPreferences(id: string, prefs: Partial<UserProfile['preferences']>): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...prefs };
    return user;
  }

  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  // --- Mood Operations ---
  public getMoodsForUser(userId: string): MoodRecord[] {
    return Array.from(this.moods.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createOrUpdateMood(userId: string, data: {
    moodLevel: 1 | 2 | 3 | 4 | 5;
    moodLabel: MoodCategory;
    note?: string;
    emotions?: string[];
    energyLevel?: number;
    stressLevel?: number;
    contextTags?: string[];
    desiredExperience?: string;
    date?: string;
  }): MoodRecord {
    const dateStr = data.date || getTodayDateString();
    
    // Check if an entry for this date already exists
    let existingId: string | null = null;
    for (const [id, m] of this.moods.entries()) {
      if (m.userId === userId && m.date === dateStr) {
        existingId = id;
        break;
      }
    }

    const id = existingId || `mood_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const record: MoodRecord = {
      id,
      userId,
      moodLevel: data.moodLevel,
      moodLabel: data.moodLabel,
      note: data.note || '',
      emotions: data.emotions || [],
      energyLevel: data.energyLevel ?? 7,
      stressLevel: data.stressLevel ?? 3,
      contextTags: data.contextTags || [],
      desiredExperience: data.desiredExperience || 'Calm',
      date: dateStr,
      timestamp: new Date().toISOString(),
      createdAt: existingId ? this.moods.get(existingId)!.createdAt : new Date().toISOString()
    };

    this.moods.set(id, record);
    return record;
  }

  public deleteMood(userId: string, moodId: string): boolean {
    const mood = this.moods.get(moodId);
    if (!mood || mood.userId !== userId) return false;
    return this.moods.delete(moodId);
  }

  // --- Journal Operations ---
  public getJournalsForUser(userId: string, query?: string, tag?: string): JournalRecord[] {
    let list = Array.from(this.journals.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q));
    }
    if (tag) {
      list = list.filter(j => j.tags.includes(tag));
    }
    return list;
  }

  public createJournal(userId: string, data: {
    title: string;
    content: string;
    tags?: string[];
    moodAssociation?: string;
    isPrivate?: boolean;
    date?: string;
  }): JournalRecord {
    const id = `jnl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const dateStr = data.date || getTodayDateString();
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;

    const record: JournalRecord = {
      id,
      userId,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      moodAssociation: data.moodAssociation,
      isPrivate: !!data.isPrivate,
      wordCount,
      date: dateStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.journals.set(id, record);
    return record;
  }

  public updateJournal(userId: string, journalId: string, data: Partial<Pick<JournalRecord, 'title' | 'content' | 'tags' | 'moodAssociation' | 'isPrivate'>>): JournalRecord | null {
    const j = this.journals.get(journalId);
    if (!j || j.userId !== userId) return null;

    if (data.title !== undefined) j.title = data.title;
    if (data.content !== undefined) {
      j.content = data.content;
      j.wordCount = data.content.split(/\s+/).filter(Boolean).length;
    }
    if (data.tags !== undefined) j.tags = data.tags;
    if (data.moodAssociation !== undefined) j.moodAssociation = data.moodAssociation;
    if (data.isPrivate !== undefined) j.isPrivate = data.isPrivate;
    j.updatedAt = new Date().toISOString();

    return j;
  }

  public deleteJournal(userId: string, journalId: string): boolean {
    const j = this.journals.get(journalId);
    if (!j || j.userId !== userId) return false;
    return this.journals.delete(journalId);
  }

  // --- Habit Operations ---
  public getHabitsForUser(userId: string, includeArchived = false): HabitRecord[] {
    return Array.from(this.habits.values())
      .filter(h => h.userId === userId && (includeArchived || !h.archived))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createHabit(userId: string, data: {
    name: string;
    description?: string;
    category: HabitRecord['category'];
    frequency?: HabitRecord['frequency'];
    targetDaysPerWeek?: number;
  }): HabitRecord {
    const id = `hab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const habit: HabitRecord = {
      id,
      userId,
      name: data.name,
      description: data.description,
      category: data.category,
      frequency: data.frequency || 'daily',
      targetDaysPerWeek: data.targetDaysPerWeek || 7,
      archived: false,
      completions: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  public calculateConsecutiveStreak(completions: string[]): number {
    if (!completions || completions.length === 0) return 0;
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (completions.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (dStr === getTodayDateString() && streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }

  public toggleHabitCompletion(userId: string, habitId: string, dateStr: string): { habit: HabitRecord; completed: boolean } | null {
    const habit = this.habits.get(habitId);
    if (!habit || habit.userId !== userId) return null;

    const idx = habit.completions.indexOf(dateStr);
    let completed = false;

    if (idx >= 0) {
      habit.completions.splice(idx, 1);
      completed = false;
    } else {
      habit.completions.push(dateStr);
      habit.completions.sort();
      completed = true;
    }

    // Recalculate streak using centralized method
    habit.streak = this.calculateConsecutiveStreak(habit.completions);
    if (habit.streak > habit.bestStreak) habit.bestStreak = habit.streak;

    return { habit, completed };
  }

  public updateHabit(userId: string, habitId: string, data: Partial<Pick<HabitRecord, 'name' | 'description' | 'category' | 'targetDaysPerWeek' | 'archived'>>): HabitRecord | null {
    const h = this.habits.get(habitId);
    if (!h || h.userId !== userId) return null;
    Object.assign(h, data);
    return h;
  }

  public deleteHabit(userId: string, habitId: string): boolean {
    const h = this.habits.get(habitId);
    if (!h || h.userId !== userId) return false;
    return this.habits.delete(habitId);
  }

  // --- AI Conversation Operations ---
  public getConversationForUser(userId: string): AIConversationRecord {
    let conv = Array.from(this.conversations.values()).find(c => c.userId === userId);
    if (!conv) {
      conv = {
        id: `conv_${userId}`,
        userId,
        title: 'Mindful Sanctuary Conversation',
        messages: [
          {
            id: 'init_msg_1',
            role: 'assistant',
            content: 'Hello Sarah. I am here as your mindful companion. Take a slow, quiet breath. How is your heart and mind feeling today?',
            timestamp: new Date().toISOString(),
          }
        ],
        updatedAt: new Date().toISOString(),
      };
      this.conversations.set(conv.id, conv);
    }
    return conv;
  }

  public appendAIMessage(userId: string, message: { role: 'user' | 'assistant'; content: string; isCrisisResponse?: boolean }) {
    const conv = this.getConversationForUser(userId);
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      isCrisisResponse: message.isCrisisResponse
    };
    conv.messages.push(newMsg);
    conv.updatedAt = new Date().toISOString();
    return newMsg;
  }

  public clearConversation(userId: string): void {
    const conv = this.getConversationForUser(userId);
    conv.messages = [
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Your space has been reset. Take a quiet breath. What would you like to reflect on today?',
        timestamp: new Date().toISOString(),
      }
    ];
    conv.updatedAt = new Date().toISOString();
  }

  // --- Dashboard Summary Calculation ---
  public getDashboardSummary(userId: string) {
    const today = getTodayDateString();
    const userMoods = this.getMoodsForUser(userId);
    const todayMood = userMoods.find(m => m.date === today) || null;

    const userHabits = this.getHabitsForUser(userId);
    const habitsCompletedToday = userHabits.filter(h => h.completions.includes(today)).length;
    const habitsTotal = userHabits.length;
    const habitCompletionRate = habitsTotal > 0 ? Math.round((habitsCompletedToday / habitsTotal) * 100) : 0;

    const userJournals = this.getJournalsForUser(userId);

    // Active streak across all habits
    const activeHabitStreak = userHabits.reduce((acc, h) => Math.max(acc, h.streak), 0);

    // 7-day trend
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyTrend: Array<{ date: string; dayLabel: string; moodLevel: number | null; habitCount: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayMood = userMoods.find(m => m.date === dateStr);
      const dayHabits = userHabits.filter(h => h.completions.includes(dateStr)).length;

      weeklyTrend.push({
        date: dateStr,
        dayLabel: daysShort[d.getDay()],
        moodLevel: dayMood ? dayMood.moodLevel : null,
        habitCount: dayHabits
      });
    }

    return {
      today,
      todayMood,
      habitsTotal,
      habitsCompletedToday,
      habitCompletionRate,
      totalJournals: userJournals.length,
      recentJournals: userJournals.slice(0, 3),
      recentMoods: userMoods.slice(0, 5),
      activeHabitStreak,
      weeklyTrend,
    };
  }

  // --- Calendar Data Aggregation ---
  public getCalendarData(userId: string, yearMonth: string) {
    const moods = this.getMoodsForUser(userId).filter(m => m.date.startsWith(yearMonth));
    const journals = this.getJournalsForUser(userId).filter(j => j.date.startsWith(yearMonth));
    const habits = this.getHabitsForUser(userId);

    const datesMap: Record<string, { mood?: MoodRecord; journals: JournalRecord[]; habitsCompleted: string[] }> = {};

    moods.forEach(m => {
      datesMap[m.date] = datesMap[m.date] || { journals: [], habitsCompleted: [] };
      datesMap[m.date].mood = m;
    });

    journals.forEach(j => {
      datesMap[j.date] = datesMap[j.date] || { journals: [], habitsCompleted: [] };
      datesMap[j.date].journals.push(j);
    });

    habits.forEach(h => {
      h.completions.forEach(cDate => {
        if (cDate.startsWith(yearMonth)) {
          datesMap[cDate] = datesMap[cDate] || { journals: [], habitsCompleted: [] };
          datesMap[cDate].habitsCompleted.push(h.name);
        }
      });
    });

    return datesMap;
  }

  // --- Account Export & Deletion ---
  public exportUserData(userId: string) {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    return {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
      moods: this.getMoodsForUser(userId),
      journals: this.getJournalsForUser(userId),
      habits: this.getHabitsForUser(userId, true),
      savedContent: this.getSavedContent(userId),
      conversations: Array.from(this.conversations.values()).filter(c => c.userId === userId),
    };
  }

  public deleteUserAccount(userId: string): boolean {
    this.users.delete(userId);
    this.savedItems.delete(userId);
    this.dismissedItems.delete(userId);
    for (const [id, m] of this.moods.entries()) {
      if (m.userId === userId) this.moods.delete(id);
    }
    for (const [id, j] of this.journals.entries()) {
      if (j.userId === userId) this.journals.delete(id);
    }
    for (const [id, h] of this.habits.entries()) {
      if (h.userId === userId) this.habits.delete(id);
    }
    for (const [id, c] of this.conversations.entries()) {
      if (c.userId === userId) this.conversations.delete(id);
    }
    return true;
  }
}

export const mindMateStore = new MindMateStore();
