import React, { useState, useEffect } from 'react';
import { Sparkles, Check, CheckCircle2, Edit3, X, HelpCircle, Activity } from 'lucide-react';
import { useData } from '../context/DataContext';
import { MoodPatternInsight } from '../types';
import { api } from '../utils/api';

export const Analytics: React.FC = () => {
  const { moodEntries, habits } = useData();
  const [patterns, setPatterns] = useState<MoodPatternInsight[]>([]);
  const [sufficientData, setSufficientData] = useState(true);
  const [loadingPatterns, setLoadingPatterns] = useState(true);
  const [correctionModalPattern, setCorrectionModalPattern] = useState<MoodPatternInsight | null>(null);
  const [userCorrectionText, setUserCorrectionText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPatterns = async () => {
    try {
      setLoadingPatterns(true);
      const res = await api.getMoodPatterns();
      setPatterns(res.patterns);
      setSufficientData(res.sufficientData);
    } catch (err) {
      console.error('Failed to load empirical patterns:', err);
    } finally {
      setLoadingPatterns(false);
    }
  };

  useEffect(() => {
    loadPatterns();
  }, [moodEntries.length]);

  const handleValidate = async (p: MoodPatternInsight) => {
    try {
      await api.submitPatternFeedback(p.id, 'validated');
      setPatterns(prev => prev.map(item => item.id === p.id ? { ...item, status: 'validated' } : item));
      showToast('Pattern validated: Added as a confirmed anchor in your emotional profile.');
    } catch (err) {
      console.error('Failed to validate pattern:', err);
    }
  };

  const handleDismiss = async (p: MoodPatternInsight) => {
    try {
      await api.submitPatternFeedback(p.id, 'dismissed');
      setPatterns(prev => prev.filter(item => item.id !== p.id));
      showToast('Insight dismissed. This observation will not influence your recommendations.');
    } catch (err) {
      console.error('Failed to dismiss pattern:', err);
    }
  };

  const handleSaveCorrection = async () => {
    if (!correctionModalPattern) return;
    try {
      await api.submitPatternFeedback(correctionModalPattern.id, 'corrected', userCorrectionText.trim());
      setPatterns(prev => prev.map(item =>
        item.id === correctionModalPattern.id
          ? { ...item, status: 'corrected', userCorrection: userCorrectionText.trim() }
          : item
      ));
      showToast('Your correction has been recorded to tune future insights.');
      setCorrectionModalPattern(null);
      setUserCorrectionText('');
    } catch (err) {
      console.error('Failed to save correction:', err);
    }
  };

  // Calculate mood distribution
  const moodCounts = moodEntries.reduce((acc, entry) => {
    const label = entry.moodLabel || 'Okay';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodData = [
    { mood: 'Great', count: moodCounts['Great'] || 0, color: 'bg-[#31A878]', emoji: '😊' },
    { mood: 'Good', count: moodCounts['Good'] || 0, color: 'bg-[#4FA87F]', emoji: '🙂' },
    { mood: 'Okay', count: moodCounts['Okay'] || 0, color: 'bg-[#E8B64C]', emoji: '😐' },
    { mood: 'Low', count: moodCounts['Low'] || 0, color: 'bg-[#9279DB]', emoji: '🙁' },
    { mood: 'Struggling', count: moodCounts['Struggling'] || 0, color: 'bg-[#6C8DB8]', emoji: '😢' },
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

  // Calculate average energy and stress
  const avgEnergy = moodEntries.length > 0
    ? (moodEntries.reduce((acc, m) => acc + (m.energyLevel || 5), 0) / moodEntries.length).toFixed(1)
    : '7.0';
  const avgStress = moodEntries.length > 0
    ? (moodEntries.reduce((acc, m) => acc + (m.stressLevel || 3), 0) / moodEntries.length).toFixed(1)
    : '3.0';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#176B57] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Mood Intelligence & Emotional Analytics</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172B3A] mt-1">
            Empirical Patterns & Grounded Insights
          </h2>
          <p className="text-sm text-[#657587] mt-1 max-w-2xl">
            Objective reflections extracted exclusively from your verified check-ins and habits. No speculative or fabricated claims.
          </p>
        </div>

        {/* Quick summary metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-[#E4EAF0] px-3.5 py-2 rounded-2xl shadow-2xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9BA8] block">Avg Energy</span>
            <span className="text-sm font-bold text-[#176B57] tabular-nums">{avgEnergy}/10</span>
          </div>
          <div className="bg-white border border-[#E4EAF0] px-3.5 py-2 rounded-2xl shadow-2xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9BA8] block">Avg Stress</span>
            <span className="text-sm font-bold text-[#D96B43] tabular-nums">{avgStress}/10</span>
          </div>
          <div className="bg-white border border-[#E4EAF0] px-3.5 py-2 rounded-2xl shadow-2xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9BA8] block">Entries</span>
            <span className="text-sm font-bold text-[#172B3A] tabular-nums">{moodEntries.length}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: EMPIRICAL PATTERN INTELLIGENCE */}
      <div className="bg-[#F4F8F5] border border-[#D3E8DC] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#176B57] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#176B57]" />
            <span>Observed Patterns (Verified from Entries)</span>
          </div>
          <span className="text-[11px] text-[#657587]">
            {patterns.length} pattern{patterns.length === 1 ? '' : 's'} identified
          </span>
        </div>

        {loadingPatterns ? (
          <div className="p-8 text-center text-xs text-[#657587] space-y-2">
            <div className="w-6 h-6 border-2 border-[#176B57]/30 border-t-[#176B57] rounded-full animate-spin mx-auto" />
            <p>Analyzing check-in correlations and context tags...</p>
          </div>
        ) : patterns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((p) => {
              const isValidated = p.status === 'validated';
              const isCorrected = p.status === 'corrected';
              return (
                <div
                  key={p.id}
                  className={`p-5 bg-white rounded-2xl border transition-all space-y-3 flex flex-col justify-between shadow-2xs ${
                    isValidated ? 'border-[#31A878]/60 bg-[#F7FCF9]' : 'border-[#E4EAF0]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-semibold text-[#8A9BA8] tabular-nums">
                        {p.dataPointsCount} data points · {Math.round(p.confidence * 100)}% match
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#172B3A]">
                      {p.title}
                    </h4>

                    <p className="text-xs text-[#4A5D6E] leading-relaxed">
                      "{p.insight}"
                    </p>

                    <div className="p-2.5 bg-[#F9FAF8] rounded-xl border border-[#E8ECE6] text-[11px] text-[#657587] leading-normal">
                      <span className="font-semibold text-[#172B3A] block mb-0.5">Supporting Data:</span>
                      {p.supportingData}
                    </div>

                    {isCorrected && p.userCorrection && (
                      <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-normal">
                        <span className="font-semibold block">Your Correction:</span>
                        "{p.userCorrection}"
                      </div>
                    )}
                  </div>

                  {/* User Feedback & Correction Controls */}
                  <div className="pt-3 border-t border-[#F0F4F8] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleValidate(p)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isValidated
                            ? 'bg-[#176B57] text-white'
                            : 'bg-[#E8F5EF] text-[#176B57] hover:bg-[#d5ede1]'
                        }`}
                        title="Confirm that this reflects your genuine experience"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isValidated ? 'Confirmed' : 'Accurate for me'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setCorrectionModalPattern(p);
                          setUserCorrectionText(p.userCorrection || '');
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#657587] hover:text-[#172B3A] hover:bg-stone-100 transition-colors flex items-center gap-1"
                        title="Provide your perspective or correct this insight"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Correct</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDismiss(p)}
                      className="p-1.5 rounded-lg text-[#8A9BA8] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Dismiss this insight"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-[#D5E3DA] text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-[#176B57]/50 mx-auto" />
            <h4 className="text-xs font-bold text-[#172B3A]">Awaiting More Check-In History</h4>
            <p className="text-xs text-[#657587] max-w-md mx-auto leading-relaxed">
              {sufficientData
                ? 'Your recent entries have not yet diverged into distinct context correlations. Patterns will appear as you continue logging with context tags.'
                : 'MindMate strictly requires at least 3-5 check-ins with context tags (sleep, outdoors, work) before calculating patterns. No synthetic trends are fabricated.'}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: VISUAL TRENDS & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Mood Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EAF0] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172B3A]">Emotional Distribution</h3>
              <p className="text-xs text-[#657587]">Aggregated across all verified entries</p>
            </div>
            <span className="text-xs font-bold text-[#176B57] bg-[#E8F5EF] px-2.5 py-1 rounded-full tabular-nums">
              {moodEntries.length} entries
            </span>
          </div>

          <div className="space-y-4">
            {moodData.map((item) => {
              const percentage = Math.round((item.count / Math.max(moodEntries.length, 1)) * 100);
              return (
                <div key={item.mood} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172B3A] flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.mood}</span>
                    </span>
                    <span className="tabular-nums text-[#657587] font-medium">
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
          {/* Top Emotion Tags */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EAF0] shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#172B3A]">Most Frequent Emotion Tags</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedEmotions.map(([emotion, count]) => (
                <div key={emotion} className="p-3 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] text-center">
                  <p className="text-xs font-bold text-[#172B3A]">{emotion}</p>
                  <p className="text-[11px] text-[#657587] tabular-nums mt-0.5">{count} entries</p>
                </div>
              ))}
              {sortedEmotions.length === 0 && (
                <p className="text-xs text-[#657587] col-span-3 py-4 text-center">
                  No emotion tags logged yet.
                </p>
              )}
            </div>
          </div>

          {/* Active Habit Anchors */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4EAF0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172B3A]">Active Habit Anchors</h3>
              <span className="text-xs text-[#8A9BA8]">{habits.length} habits tracked</span>
            </div>
            <div className="space-y-3">
              {habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAF8] border border-[#E8ECE6] text-xs">
                  <div>
                    <p className="font-semibold text-[#172B3A]">{habit.name}</p>
                    <p className="text-[11px] text-[#657587]">{habit.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold tabular-nums text-[#176B57]">{habit.streak} day streak</span>
                    <p className="text-[10px] text-[#8A9BA8]">Best: {habit.bestStreak}d</p>
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-xs text-[#657587] text-center py-3">No habits configured yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* USER CORRECTION MODAL */}
      {correctionModalPattern && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172B3A]">Correct This Observation</h3>
                <p className="text-xs text-[#657587] mt-0.5">Help MindMate understand your true subjective experience.</p>
              </div>
              <button
                onClick={() => setCorrectionModalPattern(null)}
                className="text-[#8A9BA8] hover:text-[#172B3A] p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E8F5EF] text-xs text-[#4A5D6E] leading-relaxed">
              <span className="font-semibold block text-[#176B57] mb-1">{correctionModalPattern.title}</span>
              "{correctionModalPattern.insight}"
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172B3A]">What actually occurred?</label>
              <textarea
                value={userCorrectionText}
                onChange={(e) => setUserCorrectionText(e.target.value)}
                placeholder="e.g., My low energy was due to seasonal allergies rather than poor sleep..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[#E4EAF0] focus:border-[#176B57] focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCorrectionModalPattern(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#657587] hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#176B57] text-white hover:bg-[#104C40] transition-colors"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;