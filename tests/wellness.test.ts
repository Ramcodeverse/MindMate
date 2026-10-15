import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MindMateStore, getTodayDateString } from '../server/store.js';
import { detectCrisisIntent, getReflectiveFallback } from '../server/aiService.js';

describe('MindMate Wellness Core Logic', () => {
  let store: MindMateStore;

  beforeEach(() => {
    store = new MindMateStore();
  });

  describe('Consecutive Streak Calculation', () => {
    it('returns 0 when completions array is empty', () => {
      assert.equal(store.calculateConsecutiveStreak([]), 0);
    });

    it('calculates active streak up to today', () => {
      const today = getTodayDateString(0);
      const yesterday = getTodayDateString(-1);
      const twoDaysAgo = getTodayDateString(-2);

      const streak = store.calculateConsecutiveStreak([twoDaysAgo, yesterday, today]);
      assert.equal(streak, 3);
    });

    it('maintains streak if completed yesterday but not yet today', () => {
      const yesterday = getTodayDateString(-1);
      const twoDaysAgo = getTodayDateString(-2);

      const streak = store.calculateConsecutiveStreak([twoDaysAgo, yesterday]);
      assert.equal(streak, 2);
    });

    it('breaks streak when there is a missing day before yesterday', () => {
      const today = getTodayDateString(0);
      const threeDaysAgo = getTodayDateString(-3);

      const streak = store.calculateConsecutiveStreak([threeDaysAgo, today]);
      assert.equal(streak, 1);
    });
  });

  describe('Crisis Intent Detection & Safety Guardrails', () => {
    it('detects crisis keywords correctly', () => {
      assert.equal(detectCrisisIntent('I feel like I want to die'), true);
      assert.equal(detectCrisisIntent('Thinking about suicide'), true);
      assert.equal(detectCrisisIntent('I had a tiring day at work'), false);
      assert.equal(detectCrisisIntent('Feeling anxious about my presentation'), false);
    });

    it('provides compassionate non-clinical fallback response with user context', () => {
      const reply = getReflectiveFallback('I am feeling very anxious about deadlines', { userName: 'Sarah' });
      assert.ok(reply.includes('Sarah'));
      assert.ok(reply.toLowerCase().includes('breath'));
    });
  });

  describe('Store Operations & Data Integrity', () => {
    it('creates and tracks journals with accurate word count', () => {
      const journal = store.createJournal('usr_sarah_101', {
        title: 'Gratitude Walk',
        content: 'Today was quiet and peaceful in the morning sunlight.',
        tags: ['Gratitude'],
      });

      assert.ok(journal.id);
      assert.equal(journal.wordCount, 9);
      assert.equal(journal.title, 'Gratitude Walk');
    });

    it('toggles habit completion and dynamically recalculates streaks', () => {
      const habits = store.getHabitsForUser('usr_sarah_101');
      const targetHabit = habits[0];
      const today = getTodayDateString(0);

      const initialStatus = targetHabit.completions.includes(today);
      const res = store.toggleHabitCompletion('usr_sarah_101', targetHabit.id, today);

      assert.ok(res);
      assert.equal(res?.completed, !initialStatus);
    });

    it('exports all user data in clean format without leaking credentials', () => {
      const exportData = store.exportUserData('usr_sarah_101');
      assert.equal(exportData.exportVersion, '1.0');
      assert.equal(exportData.profile.email, 'sarah.johnson@email.com');
      assert.ok(exportData.moods.length > 0);
      assert.equal('password' in exportData, false);
    });
  });
});
