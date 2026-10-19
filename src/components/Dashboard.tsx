import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  Flower2, 
  Play, 
  ArrowRight, 
  Check, 
  Bookmark, 
  Info,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ViewType } from './Sidebar';
import { api } from '../utils/api';
import { RecommendationItem, MoodCategory } from '../types';
import { calmAudio } from '../utils/audio';

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
  const { summary, addMood } = useData();

  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(
    summary?.todayMood?.moodLabel || null
  );
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'30' | '7'>('30');
  const [calendarMonth, setCalendarMonth] = useState('2024-10'); // Default to mockup reference month
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [activeExplainItem, setActiveExplainItem] = useState<RecommendationItem | null>(null);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 5 Mood Cards from image.png
  const moodScale: Array<{
    level: 1 | 2 | 3 | 4 | 5;
    label: MoodCategory;
    desc: string;
    emoji: string;
    accentColor: string;
    activeBorder: string;
    activeBg: string;
  }> = [
    {
      level: 5,
      label: 'Great',
      desc: 'Happy, energized, positive',
      emoji: '😊',
      accentColor: '#F2A18B',
      activeBorder: 'border-[#F2A18B]',
      activeBg: 'bg-[#FFF5F2]'
    },
    {
      level: 4,
      label: 'Good',
      desc: 'Calm, balanced, okay',
      emoji: '🙂',
      accentColor: '#31A878',
      activeBorder: 'border-[#31A878]',
      activeBg: 'bg-[#E8F5EF]'
    },
    {
      level: 3,
      label: 'Okay',
      desc: 'Neither good nor bad',
      emoji: '😐',
      accentColor: '#E8B64C',
      activeBorder: 'border-[#E8B64C]',
      activeBg: 'bg-[#FEF8EC]'
    },
    {
      level: 2,
      label: 'Low',
      desc: 'Tired, unmotivated, down',
      emoji: '🙁',
      accentColor: '#9279DB',
      activeBorder: 'border-[#9279DB]',
      activeBg: 'bg-[#F4F0FD]'
    },
    {
      level: 1,
      label: 'Struggling',
      desc: 'Overwhelmed, upset',
      emoji: '😢',
      accentColor: '#6C8DB8',
      activeBorder: 'border-[#6C8DB8]',
      activeBg: 'bg-[#EEF4FB]'
    }
  ];

  // Fetch recommendations and calendar
  useEffect(() => {
    const loadData = async () => {
      try {
        const recs = await api.getRecommendations({ limit: 12 });
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };
    loadData();
  }, [calendarMonth]);

  // Handle Quick Mood Selection
  const handleQuickMoodClick = async (m: typeof moodScale[0]) => {
    setSelectedMood(m.label);
    try {
      await addMood({
        moodLevel: m.level,
        moodLabel: m.label,
        note: '',
        emotions: [m.label],
        energyLevel: m.level >= 4 ? 8 : m.level === 3 ? 5 : 3,
        stressLevel: m.level <= 2 ? 7 : m.level === 3 ? 4 : 2,
        contextTags: ['General'],
        desiredExperience: m.level <= 2 ? 'Comfort' : 'Calm',
      });
      calmAudio.playGentleChime();
      showToast(`Mood logged as ${m.label}. Recommendations refreshed!`);
      // Refresh recommendations for newly logged mood
      const updatedRecs = await api.getRecommendations({ mood: m.label, limit: 12 });
      setRecommendations(updatedRecs);
    } catch (err) {
      console.error('Failed to log mood:', err);
    }
  };

  const handleToggleSave = async (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveRecommendation(item.id);
      setRecommendations(prev =>
        prev.map(r => r.id === item.id ? { ...r, isSaved: res.isSaved } : r)
      );
      showToast(res.isSaved ? `Saved "${item.title}" to library` : `Removed "${item.title}" from saved`);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handlePlayAudio = (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingItemId === item.id) {
      calmAudio.stopAmbient();
      setPlayingItemId(null);
    } else {
      calmAudio.startAmbient();
      calmAudio.playGentleChime();
      setPlayingItemId(item.id);
      showToast(`Now previewing peaceful ambient soundscape for "${item.title}"`);
    }
  };

  // Music & Movie filters from recommendations
  const musicRecommendations = recommendations.filter(r => r.type === 'music').slice(0, 4);
  const movieRecommendations = recommendations.filter(r => r.type === 'movie').slice(0, 4);

  // Generate 30-day SVG line chart data
  const chartPoints = [
    { label: 'Sep 20', level: 3.2 },
    { label: 'Sep 27', level: 4.1 },
    { label: 'Oct 4', level: 3.8 },
    { label: 'Oct 11', level: 4.4 },
    { label: 'Oct 19', level: 4.7 },
  ];

  const yLabels = [
    { level: 5, emoji: '😊' },
    { level: 4, emoji: '🙂' },
    { level: 3, emoji: '😐' },
    { level: 2, emoji: '🙁' },
    { level: 1, emoji: '😢' },
  ];

  // Calendar days grid (Oct 2024: starts on Tue (1), 31 days)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Seed sample mood colors for Oct 2024 calendar grid matching image.png
  const calendarMoodPattern: Array<{ day: number; level: number; emoji: string; color: string }> = [
    { day: 1, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 2, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 3, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 4, level: 5, emoji: '😊', color: '#F2A18B' },
    { day: 5, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 6, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 7, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 8, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 9, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 10, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 11, level: 5, emoji: '😊', color: '#F2A18B' },
    { day: 12, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 13, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 14, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 15, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 16, level: 2, emoji: '🙁', color: '#9279DB' },
    { day: 17, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 18, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 19, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 20, level: 5, emoji: '😊', color: '#F2A18B' },
    { day: 21, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 22, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 23, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 24, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 25, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 26, level: 2, emoji: '🙁', color: '#9279DB' },
    { day: 27, level: 2, emoji: '🙁', color: '#9279DB' },
    { day: 28, level: 3, emoji: '😐', color: '#E8B64C' },
    { day: 29, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 30, level: 4, emoji: '🙂', color: '#31A878' },
    { day: 31, level: 5, emoji: '😊', color: '#F2A18B' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 animate-fade-in border border-white/10">
          <Check className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP GREETING & ARTWORK BANNER (Matching image.png exactly) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#F4F8F5] via-[#E8F5EF]/60 to-[#FDF8F5] border border-[#E4EAF0] p-6 sm:p-8 overflow-hidden shadow-2xs">
        {/* Soft Background Hill & Sun Art (Vector recreated from image.png) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 pointer-events-none opacity-80 overflow-hidden flex items-center justify-end pr-4">
          <svg className="w-full h-full max-h-48" viewBox="0 0 400 200" fill="none">
            {/* Warm morning sun */}
            <circle cx="210" cy="80" r="32" fill="#F2A18B" fillOpacity="0.75" />
            {/* Soft layered rolling hills */}
            <path d="M50 180 Q 150 110 260 145 T 450 180 L 450 200 L 50 200 Z" fill="#D3E8DC" fillOpacity="0.5" />
            <path d="M120 190 Q 240 120 380 160 L 400 200 L 120 200 Z" fill="#BEDCCB" fillOpacity="0.6" />
            {/* Botanical foliage branches */}
            <path d="M260 190 C 275 140, 310 110, 350 80" stroke="#176B57" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.65" />
            <ellipse cx="280" cy="145" rx="10" ry="6" fill="#176B57" fillOpacity="0.5" transform="rotate(-30 280 145)" />
            <ellipse cx="305" cy="125" rx="11" ry="6" fill="#31A878" fillOpacity="0.5" transform="rotate(25 305 125)" />
            <ellipse cx="325" cy="100" rx="12" ry="7" fill="#65B7A5" fillOpacity="0.55" transform="rotate(-20 325 100)" />
            <ellipse cx="345" cy="82" rx="10" ry="5" fill="#176B57" fillOpacity="0.6" transform="rotate(35 345 82)" />
          </svg>
          {/* Handwritten Quote in the corner: "Small steps. Big shifts." (Image reference) */}
          <div className="absolute right-6 top-6 sm:top-8 font-serif italic text-[#176B57] text-xs sm:text-sm font-semibold tracking-wide text-right transform -rotate-2 opacity-85">
            <div>Small steps.</div>
            <div>Big shifts.</div>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#176B57]">
            {getGreeting()}, {user?.name?.split(' ')[0]?.toUpperCase() || 'SARAH'}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#172B3A] tracking-tight leading-tight">
            Your mood, understood.
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5D6E] pt-1 max-w-lg leading-relaxed">
            Track how you feel, get personalized insights, and discover what helps you feel your best.
          </p>
        </div>
      </div>

      {/* ROW 1: DAILY MOOD CHECK-IN + MOOD TREND + MOOD CALENDAR (Matching image.png layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Card 1: Daily Mood Check-In (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E4EAF0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657587]">
              <span className="text-sm">🙂</span>
              <span>Daily Mood Check-In</span>
            </div>
            <h2 className="text-lg font-bold text-[#172B3A] mt-1.5">
              How are you feeling today?
            </h2>
            <p className="text-xs text-[#657587] mt-0.5 leading-relaxed">
              Choose a mood that reflects how you feel right now. There's no right or wrong answer.
            </p>
          </div>

          {/* 5 Mood Scale Cards */}
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5 pt-5 pb-2">
            {moodScale.map((m) => {
              const isSelected = selectedMood === m.label;
              return (
                <button
                  key={m.level}
                  onClick={() => handleQuickMoodClick(m)}
                  className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-center transition-all group focus:outline-none ${
                    isSelected
                      ? `${m.activeBorder} ${m.activeBg} ring-1.5 ring-offset-1 ring-[${m.accentColor}] shadow-xs scale-102`
                      : 'border-[#E4EAF0] bg-white hover:border-stone-300 hover:bg-[#F7F9FC]'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl pt-1 transform group-hover:scale-110 transition-transform">
                    {m.emoji}
                  </div>
                  <div className="pt-2">
                    <span className="text-xs font-bold text-[#172B3A] block">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-[#657587] hidden sm:block leading-tight pt-1">
                      {m.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#F0F4F8] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#8A9BA8]">
              {summary?.todayMood ? `Logged today as ${summary.todayMood.moodLabel}` : 'Not logged today yet'}
            </span>
            <button
              onClick={onOpenCheckIn}
              className="font-bold text-[#176B57] hover:underline flex items-center gap-1"
            >
              <span>Full Details Check-in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Mood Trend (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#E4EAF0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#657587]">
              <span className="text-[#176B57]">📊</span>
              <span>Mood Trend</span>
            </div>
            <div className="relative">
              <select
                value={selectedTrendPeriod}
                onChange={(e) => setSelectedTrendPeriod(e.target.value as '30' | '7')}
                className="text-xs font-semibold text-[#172B3A] bg-[#F7F9FC] border border-[#E4EAF0] rounded-lg px-2 py-1 pr-6 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="30">Last 30 days</option>
                <option value="7">Last 7 days</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#657587] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Average mood summary indicator */}
          <div className="pt-2 pb-1">
            <span className="text-[11px] text-[#657587]">Your average mood</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl">🙂</span>
              <span className="text-lg font-bold text-[#172B3A]">Good</span>
            </div>
          </div>

          {/* SVG Trend Line Graph with emoji Y-axis (Matching image.png) */}
          <div className="relative pt-2">
            <div className="flex items-stretch gap-2 h-28">
              {/* Y Axis Emojis */}
              <div className="flex flex-col justify-between text-xs select-none pr-1">
                {yLabels.map(y => (
                  <span key={y.level} className="leading-none text-xs">{y.emoji}</span>
                ))}
              </div>

              {/* Chart Line Canvas */}
              <div className="flex-1 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 180 80">
                  {/* Subtle Grid horizontal guide lines */}
                  <line x1="0" y1="5" x2="180" y2="5" stroke="#F0F4F8" strokeWidth="1" />
                  <line x1="0" y1="24" x2="180" y2="24" stroke="#F0F4F8" strokeWidth="1" />
                  <line x1="0" y1="42" x2="180" y2="42" stroke="#F0F4F8" strokeWidth="1" />
                  <line x1="0" y1="60" x2="180" y2="60" stroke="#F0F4F8" strokeWidth="1" />
                  <line x1="0" y1="78" x2="180" y2="78" stroke="#F0F4F8" strokeWidth="1" />

                  {/* Connecting Green Trend Curve */}
                  <path
                    d="M 10 52 C 30 52, 40 32, 60 32 C 80 32, 100 40, 120 28 C 140 28, 160 16, 175 14"
                    fill="none"
                    stroke="#176B57"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Plot Dots */}
                  <circle cx="10" cy="52" r="3" fill="#176B57" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="60" cy="32" r="3" fill="#176B57" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="100" cy="38" r="3" fill="#176B57" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="120" cy="28" r="3" fill="#176B57" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="150" cy="20" r="3" fill="#176B57" stroke="#FFFFFF" strokeWidth="1.5" />
                  <circle cx="175" cy="14" r="3.5" fill="#31A878" stroke="#FFFFFF" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* X Axis Date labels */}
            <div className="flex justify-between pl-6 pr-1 pt-1.5 text-[9px] text-[#8A9BA8] font-medium">
              {chartPoints.map(p => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Mood Calendar (3 cols - matching image.png calendar dot grid) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#E4EAF0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657587]">
              Mood Calendar
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-[#172B3A]">Oct 2024</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCalendarMonth('2024-09')}
                className="p-1 rounded-md text-[#8A9BA8] hover:text-[#172B3A] hover:bg-[#F7F9FC]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setCalendarMonth('2024-11')}
                className="p-1 rounded-md text-[#8A9BA8] hover:text-[#172B3A] hover:bg-[#F7F9FC]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#8A9BA8] font-semibold pt-1">
            {weekdays.map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Dots Calendar Grid (Matching image.png round smiley dots) */}
          <div className="grid grid-cols-7 gap-1.5 pt-1 pb-1">
            {/* Blank start for Tuesday */}
            <div className="w-5 h-5" />
            {calendarMoodPattern.map(item => (
              <button
                key={item.day}
                onClick={() => onNavigate('calendar')}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] hover:scale-125 transition-transform"
                title={`Oct ${item.day}: Mood was ${item.level >= 4 ? 'Positive' : 'Low'}`}
              >
                <span>{item.emoji}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#F0F4F8] text-right">
            <button
              onClick={() => onNavigate('calendar')}
              className="text-[11px] font-bold text-[#176B57] hover:underline"
            >
              Full Calendar View &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: INSIGHT CARD + QUICK ACTION (Lotus 60s Breathing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Insight Card (7 cols - matching image.png) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E4EAF0] shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657587]">
              <Lightbulb className="w-4 h-4 text-[#E8B64C]" />
              <span>Insight</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#172B3A]">
              Your energy tends to lift after time outdoors.
            </h3>
            <p className="text-xs text-[#657587] max-w-md leading-relaxed">
              You've reported higher energy and better moods on days you spend at least 30 minutes outside. Nature really does work wonders!
            </p>
          </div>

          {/* Bottom Row: explore button + illustration */}
          <div className="pt-4 flex items-center justify-between relative z-10">
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-bold text-[#176B57] hover:text-[#104C40] flex items-center gap-1.5 bg-[#E8F5EF] px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>Explore more insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Hill Vector Illustration (Matching image.png) */}
            <div className="w-28 sm:w-36 h-14 relative overflow-hidden shrink-0">
              <svg viewBox="0 0 160 70" fill="none" className="w-full h-full">
                <circle cx="50" cy="25" r="14" fill="#F2A18B" fillOpacity="0.8" />
                <path d="M0 65 Q 40 30 90 55 T 160 65 L 160 70 L 0 70 Z" fill="#D3E8DC" />
                <path d="M40 70 Q 90 35 160 55 L 160 70 L 40 70 Z" fill="#BEDCCB" />
                {/* Pine trees */}
                <polygon points="45,48 50,38 55,48" fill="#176B57" />
                <polygon points="58,52 64,40 70,52" fill="#176B57" />
                <polygon points="72,56 78,44 84,56" fill="#176B57" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Action: 60-Second Breathing Exercise (5 cols - matching image.png) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E4EAF0] shadow-2xs flex flex-col justify-between relative overflow-hidden">
          {/* Lavender Floral vector in corner (Matching image.png) */}
          <div className="absolute right-3 top-4 bottom-4 w-20 pointer-events-none opacity-40">
            <svg viewBox="0 0 80 120" fill="none" className="w-full h-full">
              <path d="M40 120 C 40 80, 50 40, 60 10" stroke="#9279DB" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="50" cy="60" rx="6" ry="3" fill="#9279DB" transform="rotate(-30 50 60)" />
              <ellipse cx="55" cy="45" rx="6" ry="3" fill="#9279DB" transform="rotate(30 55 45)" />
              <ellipse cx="58" cy="30" rx="6" ry="3" fill="#9279DB" transform="rotate(-25 58 30)" />
              <ellipse cx="60" cy="15" rx="5" ry="3" fill="#9279DB" transform="rotate(25 60 15)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#657587]">
              <Flower2 className="w-4 h-4 text-[#176B57]" />
              <span>Quick Action</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#172B3A]">
              60-Second Breathing Exercise
            </h3>
            <p className="text-xs text-[#657587] max-w-xs leading-relaxed">
              Take a short break. Calm your mind, reset your focus.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-3 relative z-10">
            <button
              onClick={onOpenBreathing}
              className="w-10 h-10 rounded-full border border-[#176B57] flex items-center justify-center text-[#176B57] hover:bg-[#E8F5EF] transition-colors shrink-0"
              title="Launch Breathing Exercise"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
            <button
              onClick={onOpenBreathing}
              className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-2xs transition-all"
            >
              Start Now
            </button>
            <span className="text-xs text-[#8A9BA8] font-semibold">60s</span>
          </div>
        </div>
      </div>

      {/* ROW 3: PERSONALIZED DISCOVERIES (Music & Movies matching image.png) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#176B57]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#172B3A]">
                Personalized Discoveries
              </h2>
              <p className="text-xs text-[#657587]">
                Based on your mood, preferences and recent activity.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('discover')}
            className="text-xs font-bold text-[#176B57] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. MUSIC FOR YOUR MOOD (Matching 4 cards in image.png) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B3A]">
            <span className="text-sm">🎵</span>
            <span>Music for Your Mood</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {musicRecommendations.map((item) => {
              const isPlaying = playingItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveExplainItem(item)}
                  className="bg-white rounded-2xl border border-[#E4EAF0] p-3 shadow-2xs hover:shadow-sm hover:border-[#176B57]/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Dark gradient for play button visibility */}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                    {/* Play circle button in bottom right corner (matching image.png) */}
                    <button
                      onClick={(e) => handlePlayAudio(item, e)}
                      className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isPlaying 
                          ? 'bg-[#176B57] text-white scale-110' 
                          : 'bg-white/95 text-[#172B3A] hover:bg-white hover:scale-105'
                      }`}
                      title={isPlaying ? 'Pause soundscape' : 'Play ambient soundscape preview'}
                    >
                      {isPlaying ? (
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Bookmark Save icon */}
                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      title={item.isSaved ? 'Remove from saved' : 'Save playlist'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-[#31A878] text-[#31A878]' : ''}`} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="pt-3 space-y-1.5">
                    {/* Badge Pill (mint, peach, lavender, cyan) */}
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeVariant === 'mint' ? 'bg-[#E8F5EF] text-[#176B57]' :
                      item.badgeVariant === 'peach' ? 'bg-[#FFF0EB] text-[#D96B43]' :
                      item.badgeVariant === 'lavender' ? 'bg-[#F2EDFD] text-[#7E57C2]' :
                      'bg-[#E6F4F9] text-[#2481A6]'
                    }`}>
                      {item.categoryBadge}
                    </span>

                    <h4 className="text-xs font-bold text-[#172B3A] group-hover:text-[#176B57] transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-[#657587]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. MOVIES & SHOWS (Matching 4 cards in image.png) */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B3A]">
            <span className="text-sm">📺</span>
            <span>Movies & Shows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {movieRecommendations.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveExplainItem(item)}
                  className="bg-white rounded-2xl border border-[#E4EAF0] p-3 shadow-2xs hover:shadow-sm hover:border-[#176B57]/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                    {/* Bookmark Save icon */}
                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      title={item.isSaved ? 'Remove from saved' : 'Save movie'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-[#31A878] text-[#31A878]' : ''}`} />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="pt-3 space-y-1.5">
                    {/* Badge Pill */}
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeVariant === 'mint' ? 'bg-[#E8F5EF] text-[#176B57]' :
                      item.badgeVariant === 'peach' ? 'bg-[#FFF0EB] text-[#D96B43]' :
                      item.badgeVariant === 'lavender' ? 'bg-[#F2EDFD] text-[#7E57C2]' :
                      'bg-[#E6F4F9] text-[#2481A6]'
                    }`}>
                      {item.categoryBadge}
                    </span>

                    <h4 className="text-xs font-bold text-[#172B3A] group-hover:text-[#176B57] transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-[#657587]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* REASONING & WHY THIS FITS EXPLANATION MODAL */}
      {activeExplainItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={activeExplainItem.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h3 className="text-sm font-bold text-[#172B3A]">{activeExplainItem.title}</h3>
                  <p className="text-xs text-[#657587]">{activeExplainItem.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveExplainItem(null)}
                className="text-[#8A9BA8] hover:text-[#172B3A]"
              >
                ✕
              </button>
            </div>

            {/* Transparent Explanation (Master Prompt Principle C) */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E8F5EF] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B57]">
                <Info className="w-4 h-4" />
                <span>Why this was recommended:</span>
              </div>
              <p className="text-xs text-[#4A5D6E] leading-relaxed">
                "{activeExplainItem.explanation}"
              </p>
            </div>

            <p className="text-xs text-[#657587] leading-relaxed">
              {activeExplainItem.synopsis}
            </p>

            {/* Feedback: Did this fit what you needed? */}
            <div className="pt-2 border-t border-[#F0F4F8] space-y-2">
              <span className="text-[11px] font-bold text-[#657587] uppercase tracking-wider block">
                Did this fit what you needed?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    api.submitRecommendationFeedback(activeExplainItem.id, 'fit_feedback', 'yes');
                    showToast('Feedback noted: tuned for your profile!');
                    setActiveExplainItem(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#E8F5EF] text-[#176B57] hover:bg-[#d5ede1] transition-colors"
                >
                  Yes, exactly
                </button>
                <button
                  onClick={() => {
                    api.submitRecommendationFeedback(activeExplainItem.id, 'fit_feedback', 'somewhat');
                    showToast('Feedback noted!');
                    setActiveExplainItem(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F7F9FC] text-[#657587] hover:bg-stone-100 transition-colors"
                >
                  Somewhat
                </button>
                <button
                  onClick={() => {
                    api.dismissRecommendation(activeExplainItem.id);
                    setRecommendations(prev => prev.filter(r => r.id !== activeExplainItem.id));
                    showToast('Dismissed from your recommendations');
                    setActiveExplainItem(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                >
                  Not for me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;