import React, { useState } from 'react';
import { Plus, Flame, Check, Trash2, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Habit } from '../types';

export const HabitTracker: React.FC = () => {
  const { habits, addHabit, toggleHabit, deleteHabit } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<Habit['category']>('Mindfulness');
  const [newHabitTarget, setNewHabitTarget] = useState(7);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Compute 7-day columns (from 6 days ago to today)
  const days: Array<{ dateStr: string; label: string; isToday: boolean }> = [];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      dateStr,
      label: daysShort[d.getDay()],
      isToday: dateStr === todayStr,
    });
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    await addHabit({
      name: newHabitName.trim(),
      description: newHabitDesc.trim(),
      category: newHabitCategory,
      targetDaysPerWeek: newHabitTarget,
    });

    setNewHabitName('');
    setNewHabitDesc('');
    setIsModalOpen(false);
  };

  const categories = ['All', 'Mindfulness', 'Health', 'Growth', 'Rest'];

  const filteredHabits = habits.filter(h => {
    if (activeCategory === 'All') return true;
    return h.category === activeCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Sustainable Habits</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
            Build gentle anchors for daily calm.
          </h2>
          <p className="text-sm text-[#4E6B5D] mt-1">
            Consistency without pressure. Small, mindful actions repeated with love compound over weeks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit Anchor</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#EAF2EC] rounded-xl max-w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeCategory === cat
                ? 'bg-white text-[#163327] shadow-xs font-semibold'
                : 'text-[#4E6B5D] hover:text-[#163327]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits Matrix Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-6">
        {/* Days Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-[#F0F4F1] text-xs font-semibold text-[#5C7A6D]">
          <div className="col-span-5 uppercase tracking-wider">Habit Anchor</div>
          <div className="col-span-4 flex items-center justify-between px-2 text-center">
            {days.map((d, i) => (
              <span key={i} className={`w-8 ${d.isToday ? 'text-[#2D5A46] font-bold' : ''}`}>
                {d.label}
              </span>
            ))}
          </div>
          <div className="col-span-2 text-right uppercase tracking-wider">Streaks</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-4">
          {filteredHabits.map((habit) => {
            return (
              <div
                key={habit.id}
                className="p-4 sm:p-3 rounded-2xl bg-[#F9FAF8] border border-[#E8ECE6] hover:border-stone-300 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
              >
                {/* Column 1: Info (5 cols) */}
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#163327]">{habit.name}</span>
                    <span className="text-[10px] text-[#2D5A46] bg-[#EAF2EC] px-2 py-0.5 rounded-md font-medium">
                      {habit.category}
                    </span>
                  </div>
                  {habit.description && (
                    <p className="text-[11px] text-[#5C7A6D]">{habit.description}</p>
                  )}
                </div>

                {/* Column 2: 7 Days Grid (4 cols) */}
                <div className="sm:col-span-4 flex items-center justify-between px-1">
                  {days.map((day) => {
                    const isDone = habit.completions.includes(day.dateStr);
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => toggleHabit(habit.id, day.dateStr)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#2D5A46] text-white shadow-xs'
                            : day.isToday
                            ? 'border-2 border-[#2D5A46]/40 bg-white text-transparent hover:border-[#2D5A46]'
                            : 'border border-stone-200 bg-white text-transparent hover:bg-stone-50'
                        }`}
                        title={`${habit.name} on ${day.dateStr}: ${isDone ? 'Completed' : 'Click to complete'}`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>

                {/* Column 3: Streaks (2 cols) */}
                <div className="sm:col-span-2 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span className="tabular-nums">{habit.streak} days</span>
                  </div>
                  <span className="text-[10px] text-[#5C7A6D]">
                    Best: {habit.bestStreak}d
                  </span>
                </div>

                {/* Column 4: Delete Action (1 col) */}
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete habit "${habit.name}"?`)) {
                        deleteHabit(habit.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredHabits.length === 0 && (
            <p className="text-xs text-[#5C7A6D] text-center py-8">
              No habits found in this category. Click "New Habit Anchor" above to create one.
            </p>
          )}
        </div>
      </div>

      {/* Modal: Create Habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#163327]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FBFBF7] border border-[#D8E4DC] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#163327] mb-1">New Habit Anchor</h3>
            <p className="text-xs text-[#5C7A6D] mb-5">
              Choose a simple, achievable action that grounds your well-being.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 Min Morning Stretch"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full text-xs bg-white border border-[#D8E4DC] rounded-xl p-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
                  Intention / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unclutter spine before sitting at desk"
                  value={newHabitDesc}
                  onChange={(e) => setNewHabitDesc(e.target.value)}
                  className="w-full text-xs bg-white border border-[#D8E4DC] rounded-xl p-3 text-[#163327] focus:outline-none focus:ring-1 focus:ring-[#2D5A46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Mindfulness', 'Health', 'Growth', 'Rest'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-colors ${
                        newHabitCategory === cat
                          ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46] font-semibold'
                          : 'bg-white text-[#4E6B5D] border-[#E0E8E2]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C7A6D] mb-1">
                  Target Frequency ({newHabitTarget} days / week)
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewHabitTarget(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                        newHabitTarget === num
                          ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46] font-semibold'
                          : 'bg-white text-[#4E6B5D] border-[#E0E8E2]'
                      }`}
                    >
                      {num} Days / wk
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5C7A6D] hover:text-[#163327]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] rounded-xl shadow-xs transition-colors"
                >
                  Create Anchor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;