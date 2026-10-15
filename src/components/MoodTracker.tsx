import React, { useState } from 'react';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const MoodTracker: React.FC = () => {
  const { moodEntries, addMood, deleteMood } = useData();

  const [selectedLevel, setSelectedLevel] = useState<number>(4);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Calm', 'Grateful']);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [filterRange, setFilterRange] = useState<'7' | '30' | 'all'>('7');

  const moodLevels = [
    { level: 1, label: 'Terrible', emoji: '😢', desc: 'Depleted, overwhelmed, or in distress' },
    { level: 2, label: 'Not Great', emoji: '😕', desc: 'Low energy, heavy, or uneasy' },
    { level: 3, label: 'Okay', emoji: '😐', desc: 'Neutral, balanced, steady' },
    { level: 4, label: 'Good', emoji: '😊', desc: 'Calm, positive, grounded' },
    { level: 5, label: 'Excellent', emoji: '😄', desc: 'Thriving, joyful, energized' },
  ];

  const availableEmotions = [
    'Calm', 'Grateful', 'Overwhelmed', 'Anxious', 'Energized', 
    'Fatigued', 'Hopeful', 'Proud', 'Focused', 'Peaceful', 'Content', 'Restless'
  ];

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMoodConfig = moodLevels.find(m => m.level === selectedLevel) || moodLevels[3];
    setIsSubmitting(true);
    try {
      await addMood({
        moodLevel: selectedLevel,
        moodLabel: currentMoodConfig.label,
        note,
        emotions: selectedEmotions,
        energyLevel,
        date,
      });
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3000);
      setNote('');
    } catch (err) {
      console.error('Failed to log mood:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter historical entries
  const filteredMoods = moodEntries.filter(m => {
    if (filterRange === 'all') return true;
    const daysLimit = parseInt(filterRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysLimit);
    return new Date(m.date) >= cutoff;
  });

  // Calculate stats
  const averageMood = moodEntries.length > 0
    ? (moodEntries.reduce((acc, m) => acc + m.moodLevel, 0) / moodEntries.length).toFixed(1)
    : '4.0';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Intro */}
      <div className="max-w-2xl">
        <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Emotional Tracking</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
          Tune in to your inner rhythm.
        </h2>
        <p className="text-sm text-[#4E6B5D] mt-1">
          Acknowledge how you feel without judgment. Tracking your emotions builds self-compassion and reveals healing patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Check-In Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Date Selection */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A46]">
                <CalendarIcon className="w-4 h-4" />
                <span>Entry Date</span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-medium text-[#163327] border border-[#D5E3DA] rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>

            {/* 5-Level Mood Scale */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">
                1. Select Overall Mood
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {moodLevels.map((m) => {
                  const isSelected = selectedLevel === m.level;
                  return (
                    <button
                      key={m.level}
                      type="button"
                      onClick={() => setSelectedLevel(m.level)}
                      className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all text-center ${
                        isSelected
                          ? 'bg-[#EAF2EC] border-[#2D5A46] shadow-xs'
                          : 'bg-[#F9FAF8] border-[#E8ECE6] hover:border-stone-300'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#163327]' : 'text-[#5C7A6D]'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold uppercase tracking-wider text-[#5C7A6D]">
                  2. Physical Energy Level
                </label>
                <span className="font-bold tabular-nums text-[#2D5A46]">
                  {energyLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#EAF2EC] rounded-lg appearance-none cursor-pointer accent-[#2D5A46]"
              />
              <div className="flex justify-between text-[10px] text-[#5C7A6D]">
                <span>Depleted</span>
                <span>Moderate</span>
                <span>Vibrant</span>
              </div>
            </div>

            {/* Emotion Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">
                3. Emotional Nuances (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableEmotions.map((emotion) => {
                  const active = selectedEmotions.includes(emotion);
                  return (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => toggleEmotion(emotion)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#2D5A46] text-white shadow-xs'
                          : 'bg-[#F4F7F5] text-[#3E5C4E] hover:bg-stone-200/70'
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflection Note */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D]">
                4. What is contributing to this feeling? (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="A gentle walk, busy project deadlines, tea in the morning sun..."
                className="w-full text-xs text-[#163327] bg-[#F9FAF8] border border-[#E5EDE7] rounded-xl p-3 focus:ring-1 focus:ring-[#2D5A46] focus:outline-none leading-relaxed placeholder:text-stone-400"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              {successNotice ? (
                <span className="text-xs text-[#2D5A46] font-semibold animate-pulse">
                  ✓ Mood logged peacefully
                </span>
              ) : (
                <span className="text-[11px] text-[#5C7A6D]">
                  Updates your daily wellness history
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Save Check-In'}
              </button>
            </div>
          </form>
        </div>

        {/* History Timeline & Analytics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Stats Summary Card */}
          <div className="bg-[#EAF2EC]/60 border border-[#D5E3DA] rounded-3xl p-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-[#5C7A6D] block uppercase font-medium">Average Mood</span>
              <span className="text-2xl font-bold tabular-nums text-[#163327] mt-1 block">
                {averageMood} <span className="text-xs font-normal text-[#5C7A6D]">/ 5.0</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#5C7A6D] block uppercase font-medium">Logged Days</span>
              <span className="text-2xl font-bold tabular-nums text-[#163327] mt-1 block">
                {moodEntries.length}
              </span>
            </div>
          </div>

          {/* Historical Log */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EDE7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#163327]">History</h3>
              <div className="flex items-center gap-1 bg-[#F4F7F5] p-1 rounded-lg text-[11px]">
                <button
                  onClick={() => setFilterRange('7')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterRange === '7' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setFilterRange('30')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterRange === '30' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setFilterRange('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterRange === 'all' ? 'bg-white font-semibold text-[#163327] shadow-xs' : 'text-[#5C7A6D]'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredMoods.map((entry) => {
                const config = moodLevels.find(m => m.level === entry.moodLevel);
                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{config?.emoji || '😊'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#163327]">{entry.moodLabel}</span>
                            <span className="text-[10px] text-[#5C7A6D]">· Energy {entry.energyLevel}/10</span>
                          </div>
                          <span className="text-[11px] text-[#5C7A6D]">{entry.date}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteMood(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-opacity"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {entry.note && (
                      <p className="text-xs text-[#4E6B5D] leading-relaxed italic bg-white p-2 rounded-lg border border-stone-100">
                        "{entry.note}"
                      </p>
                    )}

                    {entry.emotions && entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions.map((em, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-[#2D5A46] bg-[#EAF2EC] px-2 py-0.5 rounded-md font-medium"
                          >
                            {em}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredMoods.length === 0 && (
                <p className="text-xs text-[#5C7A6D] text-center py-6">
                  No check-ins found for this timeframe.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;