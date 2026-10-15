import React from 'react';
import { 
  Smile, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Wind, 
  Flame, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ViewType } from './Sidebar';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
  onOpenBreathing: () => void;
  onOpenCheckIn: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenBreathing,
  onOpenCheckIn,
}) => {
  const { user } = useAuth();
  const { summary, habits, toggleHabit } = useData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const moodLevels = [
    { level: 1, label: 'Terrible', emoji: '😢' },
    { level: 2, label: 'Not Great', emoji: '😕' },
    { level: 3, label: 'Okay', emoji: '😐' },
    { level: 4, label: 'Good', emoji: '😊' },
    { level: 5, label: 'Excellent', emoji: '😄' },
  ];

  const todayStr = summary?.today || new Date().toISOString().split('T')[0];
  const todayMood = summary?.todayMood;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-[#EAF2EC]/60 border border-[#D5E3DA] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">
            <span>{todayFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>Mindful Space</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#163327]">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Friend'}
          </h2>
          <p className="text-sm text-[#4E6B5D] max-w-xl">
            Take a slow breath. Your wellness journey is built one quiet, intentional choice at a time.
          </p>
        </div>

        {/* Quick KPI stats strip */}
        <div className="flex items-center gap-6 sm:gap-8 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-[#D5E3DA] shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-[#2D5A46]">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="text-xl font-bold tabular-nums text-[#163327]">
                {summary?.activeHabitStreak || 0}
              </span>
            </div>
            <p className="text-[11px] text-[#5C7A6D]">Day Streak</p>
          </div>

          <div className="w-px h-8 bg-stone-200" />

          <div>
            <div className="flex items-center gap-1.5 text-[#2D5A46]">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A46]" />
              <span className="text-xl font-bold tabular-nums text-[#163327]">
                {summary?.habitsCompletedToday || 0}/{summary?.habitsTotal || 0}
              </span>
            </div>
            <p className="text-[11px] text-[#5C7A6D]">Habits Today</p>
          </div>

          <div className="w-px h-8 bg-stone-200" />

          <div>
            <div className="flex items-center gap-1.5 text-[#2D5A46]">
              <BookOpen className="w-4 h-4 text-[#2D5A46]" />
              <span className="text-xl font-bold tabular-nums text-[#163327]">
                {summary?.totalJournals || 0}
              </span>
            </div>
            <p className="text-[11px] text-[#5C7A6D]">Reflections</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Mood & Habits) - Right (Journal & AI Reflection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Today's Mood Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EDE7] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Daily Check-In</span>
                <h3 className="text-lg font-bold text-[#163327] mt-0.5">How is your energy today?</h3>
              </div>
              <button
                onClick={onOpenCheckIn}
                className="text-xs font-semibold text-[#2D5A46] hover:text-[#163327] flex items-center gap-1 transition-colors"
              >
                <span>{todayMood ? 'Update Check-in' : 'Full Check-in'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayMood ? (
              <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E0EBE3] flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF2EC] flex items-center justify-center text-2xl shadow-xs">
                    {moodLevels.find(m => m.level === todayMood.moodLevel)?.emoji || '😊'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#163327]">{todayMood.moodLabel}</span>
                      <span className="text-xs text-[#5C7A6D]">· Energy {todayMood.energyLevel}/10</span>
                    </div>
                    {todayMood.note ? (
                      <p className="text-xs text-[#4E6B5D] mt-1 leading-relaxed">"{todayMood.note}"</p>
                    ) : (
                      <p className="text-xs text-[#5C7A6D] mt-1">Logged today without note</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
                  {todayMood.emotions?.slice(0, 3).map((e, idx) => (
                    <span key={idx} className="text-[11px] text-[#2D5A46] bg-[#EAF2EC] px-2 py-0.5 rounded-md font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#F7FAF8] border border-dashed border-[#D5E3DA] text-center space-y-3">
                <p className="text-sm text-[#4E6B5D]">
                  You haven't logged today's check-in yet. A 15-second reflection helps track patterns over time.
                </p>
                <button
                  onClick={onOpenCheckIn}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
                >
                  <Smile className="w-4 h-4" />
                  <span>Check In for {todayFormatted}</span>
                </button>
              </div>
            )}

            {/* Weekly Mood Trend Mini Visualization */}
            <div className="pt-4 border-t border-[#F0F4F1]">
              <div className="flex items-center justify-between text-xs text-[#5C7A6D] mb-3">
                <span className="font-medium text-[#163327]">7-Day Emotional Rhythm</span>
                <span>Levels 1 to 5</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {(summary?.weeklyTrend || []).map((day, idx) => {
                  const isToday = day.date === todayStr;
                  const mood = day.moodLevel;
                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-colors ${
                        isToday ? 'bg-[#EAF2EC] border border-[#2D5A46]/30' : 'bg-[#F9FAF8]'
                      }`}
                    >
                      <span className="text-[10px] text-[#5C7A6D] font-medium">{day.dayLabel}</span>
                      <div className="h-10 w-full flex items-end justify-center">
                        {mood ? (
                          <div
                            style={{ height: `${(mood / 5) * 100}%` }}
                            className="w-3 rounded-full bg-[#2D5A46] transition-all"
                            title={`Level ${mood}/5`}
                          />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-300" title="No check-in" />
                        )}
                      </div>
                      <span className="text-[10px] tabular-nums font-semibold text-[#163327]">
                        {mood ? mood : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Habit Anchors Checklist */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EDE7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Daily Anchors</span>
                <h3 className="text-lg font-bold text-[#163327] mt-0.5">Today's Habits</h3>
              </div>
              <button
                onClick={() => onNavigate('habits')}
                className="text-xs font-semibold text-[#2D5A46] hover:text-[#163327] flex items-center gap-1 transition-colors"
              >
                <span>Manage Habits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {habits.slice(0, 4).map((habit) => {
                const isCompleted = habit.completions.includes(todayStr);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, todayStr)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-[#F4F9F5] border-[#D5EAD9]'
                        : 'bg-[#FDFEFC] border-[#E8ECE6] hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-[#2D5A46] text-white'
                            : 'border-2 border-stone-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${isCompleted ? 'text-[#163327] line-through opacity-80' : 'text-[#163327]'}`}>
                          {habit.name}
                        </p>
                        <span className="text-[10px] text-[#5C7A6D]">
                          {habit.category} · {habit.streak} day streak
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] tabular-nums font-semibold text-[#2D5A46]">
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <p className="text-xs text-[#5C7A6D] text-center py-4">
                  No active habits yet. Add your first habit in the Habit Anchors tab.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* AI Reflection Prompt Launcher */}
          <div className="bg-[#EAF2EC]/60 rounded-3xl p-6 sm:p-7 border border-[#D5E3DA] space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46]">
              <Sparkles className="w-4 h-4" />
              <span>AI Reflection Companion</span>
            </div>
            <h3 className="text-xl font-bold text-[#163327]">
              Need a moment to process your thoughts?
            </h3>
            <p className="text-xs text-[#3E5C4E] leading-relaxed">
              Share what is on your mind. Receive active listening, gentle reframing, and calming questions.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigate('ai-chat')}
                className="w-full text-left p-3 rounded-xl bg-white border border-[#D5E3DA] hover:border-[#2D5A46] text-xs text-[#163327] font-medium transition-all flex items-center justify-between group"
              >
                <span>"Help me reframe the stress I'm feeling"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5C7A6D] group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('ai-chat')}
                className="w-full text-left p-3 rounded-xl bg-white border border-[#D5E3DA] hover:border-[#2D5A46] text-xs text-[#163327] font-medium transition-all flex items-center justify-between group"
              >
                <span>"I want to celebrate a small win today"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5C7A6D] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => onNavigate('ai-chat')}
              className="w-full py-2.5 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-colors"
            >
              Start Reflection Session
            </button>
          </div>

          {/* Quick Guided Breathwork Banner */}
          <div className="bg-white rounded-3xl p-6 border border-[#E5EDE7] shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#2D5A46] uppercase tracking-wider">Grounding Tool</span>
              <h4 className="text-base font-bold text-[#163327]">4-7-8 Breathing Pacer</h4>
              <p className="text-xs text-[#5C7A6D]">Reset your nervous system in 60 seconds.</p>
            </div>
            <button
              onClick={onOpenBreathing}
              className="p-3.5 rounded-2xl bg-[#EAF2EC] text-[#2D5A46] hover:bg-[#D8E6DC] transition-colors shrink-0"
              title="Launch Breathing Sanctuary"
            >
              <Wind className="w-5 h-5 text-[#2D5A46]" />
            </button>
          </div>

          {/* Recent Journal Reflections */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EDE7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Private Journal</span>
                <h3 className="text-lg font-bold text-[#163327] mt-0.5">Recent Entries</h3>
              </div>
              <button
                onClick={() => onNavigate('journal')}
                className="text-xs font-semibold text-[#2D5A46] hover:text-[#163327] flex items-center gap-1 transition-colors"
              >
                <span>Write Entry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(summary?.recentJournals || []).slice(0, 2).map((journal) => (
                <div
                  key={journal.id}
                  onClick={() => onNavigate('journal')}
                  className="p-3.5 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] hover:border-stone-300 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#5C7A6D]">
                    <span>{journal.date}</span>
                    <span className="tabular-nums">{journal.wordCount} words</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#163327] line-clamp-1">{journal.title}</h4>
                  <p className="text-xs text-[#4E6B5D] line-clamp-2 leading-relaxed">
                    {journal.content}
                  </p>
                </div>
              ))}

              {(!summary?.recentJournals || summary.recentJournals.length === 0) && (
                <p className="text-xs text-[#5C7A6D] text-center py-4">
                  No journal entries yet. Capture your morning or evening thoughts.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;