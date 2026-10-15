import React from 'react';
import { Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MoodEntry, Habit } from '../types';

export const Analytics: React.FC = () => {
  const { moodEntries, habits } = useData();

  // Calculate mood distribution
  const moodCounts = moodEntries.reduce((acc, entry) => {
    const label = entry.moodLabel || 'Okay';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodData = [
    { mood: 'Excellent', count: moodCounts['Excellent'] || 0, color: 'bg-[#2D5A46]', emoji: '😄' },
    { mood: 'Good', count: moodCounts['Good'] || 0, color: 'bg-[#3B7258]', emoji: '😊' },
    { mood: 'Okay', count: moodCounts['Okay'] || 0, color: 'bg-[#5C8A75]', emoji: '😐' },
    { mood: 'Not Great', count: moodCounts['Not Great'] || 0, color: 'bg-amber-500', emoji: '😕' },
    { mood: 'Terrible', count: moodCounts['Terrible'] || 0, color: 'bg-stone-400', emoji: '😢' },
  ];

  const maxMoodCount = Math.max(...moodData.map(d => d.count), 1);

  // Extract top emotions
  const allEmotions = moodEntries.flatMap(m => m.emotions || []);
  const emotionFrequency = allEmotions.reduce((acc, em) => {
    acc[em] = (acc[em] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedEmotions = Object.entries(emotionFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const insights = generateInsights(moodEntries, habits);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Quantified Awareness</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
          Wellness Trends & Insights
        </h2>
        <p className="text-sm text-[#4E6B5D] mt-1">
          Objective reflections on your emotional patterns and habit sustainability.
        </p>
      </div>

      {/* Insights Cards Strip */}
      <div className="bg-[#EAF2EC]/60 border border-[#D5E3DA] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Mindful Discoveries</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-[#D5E3DA] text-xs leading-relaxed text-[#163327] shadow-xs">
              {insight}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mood Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#163327]">Emotional Distribution</h3>
            <span className="text-xs text-[#5C7A6D]">{moodEntries.length} total entries</span>
          </div>

          <div className="space-y-4">
            {moodData.map((item) => {
              const percentage = Math.round((item.count / Math.max(moodEntries.length, 1)) * 100);
              return (
                <div key={item.mood} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#163327] flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.mood}</span>
                    </span>
                    <span className="tabular-nums text-[#5C7A6D] font-medium">
                      {item.count} days ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#F4F7F5] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(item.count / maxMoodCount) * 100}%` }}
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Emotions & Habit Anchors (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Emotions Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#163327]">Most Frequent Emotion Tags</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedEmotions.map(([emotion, count]) => (
                <div key={emotion} className="p-3 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] text-center">
                  <p className="text-xs font-bold text-[#163327]">{emotion}</p>
                  <p className="text-[11px] text-[#5C7A6D] tabular-nums mt-0.5">{count} occurrences</p>
                </div>
              ))}
              {sortedEmotions.length === 0 && (
                <p className="text-xs text-[#5C7A6D] col-span-3 py-4 text-center">
                  No emotion tags logged yet.
                </p>
              )}
            </div>
          </div>

          {/* Habit Completion Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#163327]">Active Habit Streaks</h3>
            <div className="space-y-3">
              {habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAF8] border border-[#E8ECE6] text-xs">
                  <div>
                    <p className="font-semibold text-[#163327]">{habit.name}</p>
                    <p className="text-[11px] text-[#5C7A6D]">{habit.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#2D5A46]">{habit.streak} day streak</span>
                    <p className="text-[10px] text-[#5C7A6D]">Best: {habit.bestStreak}d</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateInsights(moodEntries: MoodEntry[], habits: Habit[]): string[] {
  const insights: string[] = [];

  if (moodEntries.length > 0) {
    const avgMood = moodEntries.reduce((sum, entry) => sum + (entry.moodLevel || 3), 0) / moodEntries.length;
    if (avgMood >= 4) {
      insights.push("🌟 You are maintaining a predominantly calm and positive emotional baseline. Notice what conditions support this state.");
    } else if (avgMood <= 2.5) {
      insights.push("💙 Your recent check-ins reflect elevated fatigue or stress. Be gentle with expectations and schedule an intentional rest window.");
    } else {
      insights.push("📊 Your mood displays natural weekly fluctuation. Review your journal entries to see how work or sleep impacts your days.");
    }
  } else {
    insights.push("🌱 Log daily check-ins over a week to unlock personalized pattern analysis.");
  }

  if (habits.length > 0) {
    const highestStreakHabit = [...habits].sort((a, b) => b.streak - a.streak)[0];
    if (highestStreakHabit && highestStreakHabit.streak > 0) {
      insights.push(`🔥 "${highestStreakHabit.name}" is your strongest daily anchor with a ${highestStreakHabit.streak}-day streak!`);
    } else {
      insights.push("🎯 Checking off even one small habit daily establishes neurological momentum for wellness.");
    }
  }

  insights.push("🌿 Evening screen-free time and brief breathwork sessions correlate with higher morning energy levels.");

  return insights;
}

export default Analytics;