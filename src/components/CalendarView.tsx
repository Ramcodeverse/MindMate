import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Smile, CheckSquare, BookOpen } from 'lucide-react';
import { api } from '../utils/api';
import { MoodEntry, JournalEntry } from '../types';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, { mood?: MoodEntry; journals: JournalEntry[]; habitsCompleted: string[] }>>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.getCalendarData(monthStr);
        setCalendarData(res.days);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      }
    };
    fetchCalendar();
  }, [monthStr]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDetails = calendarData[selectedDate] || {
    journals: [],
    habitsCompleted: [],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Holistic Timeline</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#163327] mt-1">
            Calendar History
          </h2>
          <p className="text-sm text-[#4E6B5D] mt-1">
            Browse through your days. See how consistent habits and mindful check-ins intertwine.
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-3 bg-white border border-[#E5EDE7] p-1.5 rounded-2xl shadow-xs">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[#163327] min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDE7] shadow-sm space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#5C7A6D] pb-2 border-b border-[#F0F4F1]">
            {daysShort.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty_${i}`} className="h-20 sm:h-24 rounded-2xl bg-[#FBFBF7]/40 border border-transparent" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`;
              const data = calendarData[dateStr];
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#EAF2EC] border-[#2D5A46] shadow-xs'
                      : isToday
                      ? 'bg-[#F4F8F5] border-[#D2E2D6]'
                      : 'bg-[#F9FAF8] border-[#E8ECE6] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold tabular-nums ${isSelected ? 'text-[#2D5A46]' : 'text-[#163327]'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A46]" title="Today" />
                    )}
                  </div>

                  {/* Day activity pills */}
                  <div className="space-y-1">
                    {data?.mood && (
                      <div className="flex items-center gap-1 text-[10px] text-[#2D5A46] bg-white/80 px-1 py-0.5 rounded truncate">
                        <Smile className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{data.mood.moodLabel}</span>
                      </div>
                    )}
                    {data?.habitsCompleted && data.habitsCompleted.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#2D5A46] bg-[#E0ECE3] px-1 py-0.5 rounded truncate">
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span>{data.habitsCompleted.length} habits</span>
                      </div>
                    )}
                    {data?.journals && data.journals.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-[#5C7A6D] bg-stone-100 px-1 py-0.5 rounded truncate">
                        <BookOpen className="w-2.5 h-2.5 shrink-0" />
                        <span>{data.journals.length} note</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#E5EDE7] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F4F1]">
            <div>
              <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Day Inspector</span>
              <h3 className="text-lg font-bold text-[#163327] mt-0.5">{selectedDate}</h3>
            </div>
            <CalendarIcon className="w-5 h-5 text-[#2D5A46]" />
          </div>

          {/* Mood on this date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#5C7A6D] uppercase tracking-wider">
              Emotional State
            </h4>
            {selectedDetails.mood ? (
              <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E0EBE3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#163327]">{selectedDetails.mood.moodLabel}</span>
                  <span className="text-xs text-[#5C7A6D]">Energy: {selectedDetails.mood.energyLevel}/10</span>
                </div>
                {selectedDetails.mood.note && (
                  <p className="text-xs text-[#4E6B5D] italic">"{selectedDetails.mood.note}"</p>
                )}
                {selectedDetails.mood.emotions && (
                  <div className="flex flex-wrap gap-1">
                    {selectedDetails.mood.emotions.map((e, idx) => (
                      <span key={idx} className="text-[10px] text-[#2D5A46] bg-[#EAF2EC] px-2 py-0.5 rounded">
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#5C7A6D] bg-[#F9FAF8] p-3 rounded-xl border border-stone-100">
                No mood check-in recorded for this day.
              </p>
            )}
          </div>

          {/* Habits completed on this date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#5C7A6D] uppercase tracking-wider">
              Completed Habits ({selectedDetails.habitsCompleted.length})
            </h4>
            {selectedDetails.habitsCompleted.length > 0 ? (
              <div className="space-y-1.5">
                {selectedDetails.habitsCompleted.map((hName, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#F4F9F5] border border-[#D5EAD9] text-xs font-medium text-[#163327] flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-[#2D5A46]" />
                    <span>{hName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5C7A6D] bg-[#F9FAF8] p-3 rounded-xl border border-stone-100">
                No habits checked off on this date.
              </p>
            )}
          </div>

          {/* Journals on this date */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#5C7A6D] uppercase tracking-wider">
              Journal Reflections ({selectedDetails.journals.length})
            </h4>
            {selectedDetails.journals.length > 0 ? (
              <div className="space-y-2">
                {selectedDetails.journals.map((j) => (
                  <div key={j.id} className="p-3 rounded-xl bg-[#F9FAF8] border border-[#E8ECE6] space-y-1">
                    <p className="text-xs font-bold text-[#163327]">{j.title}</p>
                    <p className="text-xs text-[#4E6B5D] line-clamp-2">{j.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5C7A6D] bg-[#F9FAF8] p-3 rounded-xl border border-stone-100">
                No journal reflections written on this day.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
