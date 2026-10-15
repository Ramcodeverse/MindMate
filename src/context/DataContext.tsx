import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MoodEntry, JournalEntry, Habit, DashboardSummary } from '../types';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { calmAudio } from '../utils/audio';

interface DataContextType {
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  habits: Habit[];
  summary: DashboardSummary | null;
  loading: boolean;
  addMood: (data: { moodLevel: number; moodLabel: string; note: string; emotions: string[]; energyLevel: number; date?: string }) => Promise<void>;
  addJournal: (data: { title: string; content: string; tags?: string[]; moodAssociation?: string; isPrivate?: boolean; date?: string }) => Promise<JournalEntry>;
  updateJournal: (id: string, data: Partial<Pick<JournalEntry, 'title' | 'content' | 'tags' | 'moodAssociation' | 'isPrivate'>>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  addHabit: (data: { name: string; description?: string; category: Habit['category']; frequency?: Habit['frequency']; targetDaysPerWeek?: number }) => Promise<void>;
  toggleHabit: (id: string, date?: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [moodsRes, journalsRes, habitsRes, summaryRes] = await Promise.all([
        api.getMoods(),
        api.getJournals(),
        api.getHabits(true),
        api.getDashboardSummary(),
      ]);

      setMoodEntries(moodsRes);
      setJournalEntries(journalsRes);
      setHabits(habitsRes);
      setSummary(summaryRes);
    } catch (err) {
      console.error('[DataContext] Failed to fetch data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setMoodEntries([]);
      setJournalEntries([]);
      setHabits([]);
      setSummary(null);
    }
  }, [user, refreshData]);

  const addMood = async (data: { moodLevel: number; moodLabel: string; note: string; emotions: string[]; energyLevel: number; date?: string }) => {
    const newMood = await api.saveMood(data);
    setMoodEntries(prev => [newMood, ...prev.filter(m => m.date !== newMood.date)]);
    calmAudio.playGentleChime();
    await refreshData();
  };

  const addJournal = async (data: { title: string; content: string; tags?: string[]; moodAssociation?: string; isPrivate?: boolean; date?: string }) => {
    const newJournal = await api.createJournal(data);
    setJournalEntries(prev => [newJournal, ...prev]);
    calmAudio.playGentleChime();
    await refreshData();
    return newJournal;
  };

  const updateJournal = async (id: string, data: Partial<Pick<JournalEntry, 'title' | 'content' | 'tags' | 'moodAssociation' | 'isPrivate'>>) => {
    const updated = await api.updateJournal(id, data);
    setJournalEntries(prev => prev.map(j => (j.id === id ? updated : j)));
    await refreshData();
  };

  const deleteJournal = async (id: string) => {
    await api.deleteJournal(id);
    setJournalEntries(prev => prev.filter(j => j.id !== id));
    await refreshData();
  };

  const addHabit = async (data: { name: string; description?: string; category: Habit['category']; frequency?: Habit['frequency']; targetDaysPerWeek?: number }) => {
    const newHabit = await api.createHabit(data);
    setHabits(prev => [newHabit, ...prev]);
    await refreshData();
  };

  const toggleHabit = async (id: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const res = await api.toggleHabit(id, targetDate);
    if (res.completed) {
      calmAudio.playGentleChime();
    }
    setHabits(prev => prev.map(h => (h.id === id ? res.habit : h)));
    await refreshData();
  };

  const deleteHabit = async (id: string) => {
    await api.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        moodEntries,
        journalEntries,
        habits,
        summary,
        loading,
        addMood,
        addJournal,
        updateJournal,
        deleteJournal,
        addHabit,
        toggleHabit,
        deleteHabit,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};