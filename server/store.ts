import { UserProfile, MoodRecord, JournalRecord, HabitRecord, AIConversationRecord } from './types.js';

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

  constructor() {
    this.seedDefaultData();
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
      },
    };

    this.users.set(sarah.id, sarah);
    this.credentials.set(sarah.email.toLowerCase(), 'sarah123');

    this.users.set(admin.id, admin);
    this.credentials.set(admin.email.toLowerCase(), 'admin123');

    // 2. Seed Moods for Sarah (last 10 days)
    const moodLevels: Array<{ level: 1 | 2 | 3 | 4 | 5; label: MoodRecord['moodLabel']; note: string; emotions: string[]; energy: number }> = [
      { level: 4, label: 'Good', note: 'Woke up feeling refreshed after yoga.', emotions: ['Grateful', 'Calm'], energy: 8 },
      { level: 3, label: 'Okay', note: 'Busy workday, took a 10 min breather.', emotions: ['Focused', 'Tired'], energy: 6 },
      { level: 4, label: 'Good', note: 'Had lunch outside in the garden breeze.', emotions: ['Peaceful', 'Content'], energy: 7 },
      { level: 5, label: 'Excellent', note: 'Finished a major milestone and celebrated with friends.', emotions: ['Proud', 'Joyful', 'Energized'], energy: 9 },
      { level: 4, label: 'Good', note: 'Calm evening reading and herbal tea.', emotions: ['Serene', 'Relaxed'], energy: 7 },
      { level: 2, label: 'Not Great', note: 'Slight head cold, resting up with blankets.', emotions: ['Fatigued', 'Patient'], energy: 4 },
      { level: 3, label: 'Okay', note: 'Recovering slowly, gentle stretching helped.', emotions: ['Reflective'], energy: 5 },
      { level: 4, label: 'Good', note: 'Back to daily walk, fresh morning air.', emotions: ['Hopeful', 'Calm'], energy: 7 },
      { level: 4, label: 'Good', note: 'Clear mind and productive afternoon.', emotions: ['Energized', 'Grateful'], energy: 8 },
      { level: 5, label: 'Excellent', note: 'Checked in today feeling grounded and present.', emotions: ['Calm', 'Content', 'Grateful'], energy: 9 }
    ];

    moodLevels.forEach((m, idx) => {
      const offset = -(moodLevels.length - 1 - idx);
      const dateStr = getTodayDateString(offset);
      const id = `mood_sarah_${idx + 1}`;
      this.moods.set(id, {
        id,
        userId: sarah.id,
        moodLevel: m.level,
        moodLabel: m.label,
        note: m.note,
        emotions: m.emotions,
        energyLevel: m.energy,
        date: dateStr,
        timestamp: `${dateStr}T10:30:00.000Z`,
        createdAt: `${dateStr}T10:30:00.000Z`
      });
    });

    // 3. Seed Journals for Sarah
    const sampleJournals = [
      {
        title: 'Morning Intentions & Soft Focus',
        content: 'Starting today with a slower rhythm. I often rush into email notifications before taking a breath. Today I poured warm mint tea, sat by the window for five quiet minutes, and noticed how much calmer my nervous system felt. I want to protect this sacred start to my mornings.',
        tags: ['Morning Routine', 'Mindfulness', 'Intentions'],
        moodAssociation: 'Good',
        daysAgo: 5
      },
      {
        title: 'Reflections on Setting Boundaries at Work',
        content: 'I had to tell a colleague that I could not take on an extra sprint ticket this week. In the past, I would have said yes and sacrificed sleep and calm. Saying no felt uncomfortable in my throat, but five minutes later it felt like liberation and self-respect.',
        tags: ['Work', 'Boundaries', 'Growth'],
        moodAssociation: 'Good',
        daysAgo: 2
      },
      {
        title: 'The Beauty in Ordinary Evenings',
        content: 'Nothing dramatic happened today, and that is a quiet gift. Golden sunlight across the wooden floor, the sound of rain tapping on the windowpane, and a homemade soup simmering on the stove. Peace is rarely loud; it is quiet and grounding.',
        tags: ['Gratitude', 'Peace'],
        moodAssociation: 'Excellent',
        daysAgo: 0
      }
    ];

    sampleJournals.forEach((j, idx) => {
      const dateStr = getTodayDateString(-j.daysAgo);
      const id = `jrnl_sarah_${idx + 1}`;
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
        createdAt: `${dateStr}T19:00:00.000Z`,
        updatedAt: `${dateStr}T19:00:00.000Z`
      });
    });

    // 4. Seed Habits for Sarah
    const habitsData = [
      {
        name: 'Morning Mindfulness & Breathwork',
        description: '10 minutes of box breathing or calm silence',
        category: 'Mindfulness' as const,
        targetDaysPerWeek: 7,
        daysCompletedOffsets: [-6, -5, -4, -3, -2, -1, 0]
      },
      {
        name: 'Daily Hydration (2.5L Water)',
        description: 'Keep water bottle at desk and sip throughout the day',
        category: 'Health' as const,
        targetDaysPerWeek: 7,
        daysCompletedOffsets: [-5, -4, -3, -2, -1, 0]
      },
      {
        name: 'Nature Walk / Fresh Air',
        description: 'Step outdoors for 20+ minutes of brisk walking',
        category: 'Health' as const,
        targetDaysPerWeek: 5,
        daysCompletedOffsets: [-6, -4, -3, -1, 0]
      },
      {
        name: 'Evening Screen-Free Wind Down',
        description: 'Books and journaling 30 minutes before bed',
        category: 'Rest' as const,
        targetDaysPerWeek: 6,
        daysCompletedOffsets: [-5, -4, -2, -1, 0]
      }
    ];

    habitsData.forEach((h, idx) => {
      const id = `habit_sarah_${idx + 1}`;
      const completions = h.daysCompletedOffsets.map(o => getTodayDateString(o));
      const streak = this.calculateConsecutiveStreak(completions);
      this.habits.set(id, {
        id,
        userId: sarah.id,
        name: h.name,
        description: h.description,
        category: h.category,
        frequency: 'daily',
        targetDaysPerWeek: h.targetDaysPerWeek,
        archived: false,
        completions,
        streak,
        bestStreak: Math.max(streak, 14),
        createdAt: '2026-09-15T08:00:00.000Z'
      });
    });

    // 5. Seed Conversation with AI Companion
    const convId = 'conv_sarah_01';
    this.conversations.set(convId, {
      id: convId,
      userId: sarah.id,
      title: 'Finding Ease During Busy Weeks',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_01',
          role: 'system',
          content: 'You are MindMate Reflection Companion, an empathetic, calming wellness companion.',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg_02',
          role: 'assistant',
          content: "Welcome to your reflection space, Sarah. How is your energy feeling right now, and what would bring you the most comfort today?",
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 'msg_03',
          role: 'user',
          content: "I felt a bit scattered earlier, but taking a mindful breath and looking at my habits helped me re-center.",
          timestamp: new Date(Date.now() - 3400000).toISOString()
        },
        {
          id: 'msg_04',
          role: 'assistant',
          content: "That awareness is wonderful. Recognizing the scatter and gently choosing a breath is true self-compassion in practice. Notice the physical sensation of ease in your shoulders right now. You don't have to carry everything at once.",
          timestamp: new Date(Date.now() - 3300000).toISOString()
        }
      ]
    });
  }

  // Streak calculation logic
  public calculateConsecutiveStreak(completions: string[]): number {
    if (!completions || completions.length === 0) return 0;
    const sorted = Array.from(new Set(completions)).sort().reverse();
    const today = getTodayDateString(0);
    const yesterday = getTodayDateString(-1);

    // If neither today nor yesterday is completed, the active streak is broken
    if (sorted[0] !== today && sorted[0] !== yesterday) {
      return 0;
    }

    let streak = 0;
    let expected = sorted[0];

    for (const comp of sorted) {
      if (comp === expected) {
        streak++;
        // decrement expected date by 1 day
        const d = new Date(expected + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - 1);
        expected = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    return streak;
  }

  // --- Auth & Users ---
  public authenticateUser(email: string, password: string): UserProfile | null {
    const cleanEmail = email.trim().toLowerCase();
    const storedPw = this.credentials.get(cleanEmail);
    if (!storedPw || storedPw !== password) {
      return null;
    }
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        user.lastLogin = new Date().toISOString();
        return user;
      }
    }
    return null;
  }

  public registerUser(name: string, email: string, password: string): UserProfile {
    const cleanEmail = email.trim().toLowerCase();
    if (this.credentials.has(cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const id = `usr_${Date.now()}`;
    const newUser: UserProfile = {
      id,
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: 'calm',
        timezone: 'UTC',
        aiContextSharing: true,
        dailyReminderTime: '09:00',
        soundEnabled: true,
      }
    };
    this.users.set(id, newUser);
    this.credentials.set(cleanEmail, password);

    // Seed welcoming starter data for fresh accounts
    this.createHabit(id, {
      name: '5-Minute Morning Calm',
      category: 'Mindfulness',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      description: 'Take 5 mindful breaths before looking at screens'
    });
    this.createHabit(id, {
      name: 'Hydration Anchor',
      category: 'Health',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      description: 'Glass of water upon waking'
    });

    return newUser;
  }

  public getUserById(id: string): UserProfile | null {
    return this.users.get(id) || null;
  }

  public updateUserPreferences(id: string, updates: Partial<UserProfile['preferences']>): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...updates };
    return user;
  }

  public updateUserName(id: string, name: string): UserProfile | null {
    const user = this.users.get(id);
    if (!user) return null;
    user.name = name.trim();
    return user;
  }

  public getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  // --- Moods ---
  public getMoodsForUser(userId: string): MoodRecord[] {
    return Array.from(this.moods.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  public createOrUpdateMood(userId: string, data: Omit<MoodRecord, 'id' | 'userId' | 'createdAt' | 'timestamp'>): MoodRecord {
    // Check if there is already an entry for this user and date
    const existing = Array.from(this.moods.values()).find(m => m.userId === userId && m.date === data.date);
    if (existing) {
      existing.moodLevel = data.moodLevel;
      existing.moodLabel = data.moodLabel;
      existing.note = data.note;
      existing.emotions = data.emotions || [];
      existing.energyLevel = data.energyLevel;
      return existing;
    }
    const id = `mood_${Date.now()}`;
    const newRecord: MoodRecord = {
      id,
      userId,
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.moods.set(id, newRecord);
    return newRecord;
  }

  public deleteMood(userId: string, moodId: string): boolean {
    const record = this.moods.get(moodId);
    if (!record || record.userId !== userId) return false;
    return this.moods.delete(moodId);
  }

  // --- Journals ---
  public getJournalsForUser(userId: string, query?: string, tag?: string): JournalRecord[] {
    let list = Array.from(this.journals.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (tag) {
      list = list.filter(j => j.tags && j.tags.includes(tag));
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q));
    }
    return list;
  }

  public createJournal(userId: string, data: { title: string; content: string; tags?: string[]; moodAssociation?: string; isPrivate?: boolean; date?: string }): JournalRecord {
    const id = `jrnl_${Date.now()}`;
    const now = new Date().toISOString();
    const date = data.date || getTodayDateString(0);
    const content = data.content || '';
    const newRecord: JournalRecord = {
      id,
      userId,
      title: data.title || 'Untitled Reflection',
      content,
      tags: data.tags || [],
      moodAssociation: data.moodAssociation,
      isPrivate: !!data.isPrivate,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      date,
      createdAt: now,
      updatedAt: now,
    };
    this.journals.set(id, newRecord);
    return newRecord;
  }

  public updateJournal(userId: string, journalId: string, updates: Partial<Pick<JournalRecord, 'title' | 'content' | 'tags' | 'moodAssociation' | 'isPrivate'>>): JournalRecord | null {
    const record = this.journals.get(journalId);
    if (!record || record.userId !== userId) return null;
    if (updates.title !== undefined) record.title = updates.title;
    if (updates.content !== undefined) {
      record.content = updates.content;
      record.wordCount = updates.content.split(/\s+/).filter(Boolean).length;
    }
    if (updates.tags !== undefined) record.tags = updates.tags;
    if (updates.moodAssociation !== undefined) record.moodAssociation = updates.moodAssociation;
    if (updates.isPrivate !== undefined) record.isPrivate = updates.isPrivate;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  public deleteJournal(userId: string, journalId: string): boolean {
    const record = this.journals.get(journalId);
    if (!record || record.userId !== userId) return false;
    return this.journals.delete(journalId);
  }

  // --- Habits ---
  public getHabitsForUser(userId: string, includeArchived = false): HabitRecord[] {
    return Array.from(this.habits.values())
      .filter(h => h.userId === userId && (includeArchived ? true : !h.archived))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public createHabit(userId: string, data: { name: string; description?: string; category: HabitRecord['category']; frequency?: HabitRecord['frequency']; targetDaysPerWeek?: number }): HabitRecord {
    const id = `habit_${Date.now()}`;
    const newHabit: HabitRecord = {
      id,
      userId,
      name: data.name,
      description: data.description || '',
      category: data.category,
      frequency: data.frequency || 'daily',
      targetDaysPerWeek: data.targetDaysPerWeek || 7,
      archived: false,
      completions: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  public toggleHabitCompletion(userId: string, habitId: string, date: string): { habit: HabitRecord; completed: boolean } | null {
    const habit = this.habits.get(habitId);
    if (!habit || habit.userId !== userId) return null;

    const set = new Set(habit.completions);
    let completed = false;
    if (set.has(date)) {
      set.delete(date);
      completed = false;
    } else {
      set.add(date);
      completed = true;
    }
    habit.completions = Array.from(set).sort();
    habit.streak = this.calculateConsecutiveStreak(habit.completions);
    habit.bestStreak = Math.max(habit.bestStreak, habit.streak);

    return { habit, completed };
  }

  public updateHabit(userId: string, habitId: string, updates: Partial<Pick<HabitRecord, 'name' | 'description' | 'category' | 'targetDaysPerWeek' | 'archived'>>): HabitRecord | null {
    const habit = this.habits.get(habitId);
    if (!habit || habit.userId !== userId) return null;
    if (updates.name !== undefined) habit.name = updates.name;
    if (updates.description !== undefined) habit.description = updates.description;
    if (updates.category !== undefined) habit.category = updates.category;
    if (updates.targetDaysPerWeek !== undefined) habit.targetDaysPerWeek = updates.targetDaysPerWeek;
    if (updates.archived !== undefined) habit.archived = updates.archived;
    return habit;
  }

  public deleteHabit(userId: string, habitId: string): boolean {
    const habit = this.habits.get(habitId);
    if (!habit || habit.userId !== userId) return false;
    return this.habits.delete(habitId);
  }

  // --- AI Conversations ---
  public getConversationForUser(userId: string): AIConversationRecord {
    let conv = Array.from(this.conversations.values()).find(c => c.userId === userId);
    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        userId,
        title: 'Daily Reflection Sanctuary',
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'welcome_1',
            role: 'assistant',
            content: "Hello. I am MindMate Reflection Companion, a gentle, non-judgmental space to reflect on your day, process emotions, and cultivate daily calm. How are you holding up today?",
            timestamp: new Date().toISOString()
          }
        ]
      };
      this.conversations.set(conv.id, conv);
    }
    return conv;
  }

  public appendAIMessage(userId: string, message: { role: 'user' | 'assistant'; content: string; isCrisisResponse?: boolean }): AIConversationRecord {
    const conv = this.getConversationForUser(userId);
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      isCrisisResponse: message.isCrisisResponse
    };
    conv.messages.push(msg);
    conv.updatedAt = new Date().toISOString();
    return conv;
  }

  public clearConversation(userId: string): boolean {
    for (const [id, c] of this.conversations.entries()) {
      if (c.userId === userId) {
        this.conversations.delete(id);
      }
    }
    return true;
  }

  // --- Dashboard Summary Aggregator ---
  public getDashboardSummary(userId: string) {
    const today = getTodayDateString(0);
    const moods = this.getMoodsForUser(userId);
    const todayMood = moods.find(m => m.date === today) || null;
    const habits = this.getHabitsForUser(userId);
    const todayHabitsCompleted = habits.filter(h => h.completions.includes(today)).length;
    const journals = this.getJournalsForUser(userId);

    // Calculate weekly trend
    const last7Days: Array<{ date: string; dayLabel: string; moodLevel: number | null; habitCount: number }> = [];
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const m = moods.find(x => x.date === dStr);
      const hCount = habits.filter(h => h.completions.includes(dStr)).length;
      last7Days.push({
        date: dStr,
        dayLabel: daysShort[d.getDay()],
        moodLevel: m ? m.moodLevel : null,
        habitCount: hCount,
      });
    }

    const completedHabitStreaks = habits.map(h => h.streak);
    const maxStreak = completedHabitStreaks.length > 0 ? Math.max(...completedHabitStreaks) : 0;

    return {
      today,
      todayMood,
      habitsTotal: habits.length,
      habitsCompletedToday: todayHabitsCompleted,
      habitCompletionRate: habits.length > 0 ? Math.round((todayHabitsCompleted / habits.length) * 100) : 0,
      totalJournals: journals.length,
      recentJournals: journals.slice(0, 3),
      recentMoods: moods.slice(0, 7),
      activeHabitStreak: maxStreak,
      weeklyTrend: last7Days,
    };
  }

  // --- Calendar Records Aggregator ---
  public getCalendarData(userId: string, yearMonth: string) {
    // yearMonth = 'YYYY-MM'
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
      conversations: Array.from(this.conversations.values()).filter(c => c.userId === userId),
    };
  }

  public deleteUserAccount(userId: string): boolean {
    // Cascade delete all private records
    this.users.delete(userId);
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
