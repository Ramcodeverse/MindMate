import { User, MoodEntry, JournalEntry, Habit, DashboardSummary, AIConversation } from '../types';

const TOKEN_KEY = 'mindmate_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || 'usr_sarah_101'; // Default to demo user if not logged in
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'An unexpected error occurred' }));
    throw new Error(errorBody.error || `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  getCurrentUser: () => apiFetch<{ user: User }>('/auth/me'),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch<{ token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboardSummary: () => apiFetch<DashboardSummary>('/dashboard/summary'),

  // Moods
  getMoods: () => apiFetch<MoodEntry[]>('/moods'),
  saveMood: (data: { moodLevel: number; moodLabel: string; note: string; emotions: string[]; energyLevel: number; date?: string }) =>
    apiFetch<MoodEntry>('/moods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteMood: (id: string) => apiFetch<{ message: string }>(`/moods/${id}`, { method: 'DELETE' }),

  // Journals
  getJournals: (query?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tag) params.set('tag', tag);
    const qs = params.toString();
    return apiFetch<JournalEntry[]>(`/journals${qs ? `?${qs}` : ''}`);
  },
  createJournal: (data: { title: string; content: string; tags?: string[]; moodAssociation?: string; isPrivate?: boolean; date?: string }) =>
    apiFetch<JournalEntry>('/journals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateJournal: (id: string, data: Partial<Pick<JournalEntry, 'title' | 'content' | 'tags' | 'moodAssociation' | 'isPrivate'>>) =>
    apiFetch<JournalEntry>(`/journals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteJournal: (id: string) => apiFetch<{ message: string }>(`/journals/${id}`, { method: 'DELETE' }),

  // Habits
  getHabits: (includeArchived = false) => apiFetch<Habit[]>(`/habits${includeArchived ? '?includeArchived=true' : ''}`),
  createHabit: (data: { name: string; description?: string; category: Habit['category']; frequency?: Habit['frequency']; targetDaysPerWeek?: number }) =>
    apiFetch<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleHabit: (id: string, date?: string) =>
    apiFetch<{ habit: Habit; completed: boolean }>(`/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    }),
  deleteHabit: (id: string) => apiFetch<{ message: string }>(`/habits/${id}`, { method: 'DELETE' }),

  // Calendar
  getCalendarData: (month?: string) => {
    return apiFetch<{ month: string; days: Record<string, { mood?: MoodEntry; journals: JournalEntry[]; habitsCompleted: string[] }> }>(
      `/calendar${month ? `?month=${month}` : ''}`
    );
  },

  // AI Reflection
  getAIConversation: () => apiFetch<AIConversation>('/ai/conversation'),
  sendAIMessage: (message: string) =>
    apiFetch<{ reply: string; isCrisis: boolean; provider: string; updatedConversation: AIConversation }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  clearAIConversation: () => apiFetch<{ message: string }>('/ai/conversation', { method: 'DELETE' }),

  // Account
  updateProfile: (data: { name?: string; preferences?: Partial<User['preferences']> }) =>
    apiFetch<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  exportDataUrl: () => `/api/v1/users/me/export`,
  deleteAccount: () => apiFetch<{ message: string }>('/users/me', { method: 'DELETE' }),
};
