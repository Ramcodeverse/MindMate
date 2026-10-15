import React, { useState } from 'react';
import { Menu, Volume2, VolumeX, Wind, Plus, Compass } from 'lucide-react';
import { calmAudio } from '../utils/audio';
import { ViewType } from './Sidebar';

interface AppHeaderProps {
  currentView: ViewType;
  onOpenSidebar: () => void;
  onOpenBreathing: () => void;
  onQuickCheckIn: () => void;
  onOpenLanding?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  onOpenSidebar,
  onOpenBreathing,
  onQuickCheckIn,
  onOpenLanding,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(calmAudio.getIsPlaying());

  const viewTitles: Record<ViewType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Wellness Dashboard', subtitle: 'Your daily emotional snapshot & habits' },
    mood: { title: 'Mood Rhythm', subtitle: 'Track subtle changes in emotional energy' },
    journal: { title: 'Daily Journal', subtitle: 'Private, distraction-free emotional reflection' },
    habits: { title: 'Habit Anchors', subtitle: 'Build sustainable daily well-being rhythms' },
    'ai-chat': { title: 'AI Reflection Companion', subtitle: 'Active listening & compassionate grounding' },
    calendar: { title: 'Calendar History', subtitle: 'Aggregated view of moods, habits, and reflections' },
    analytics: { title: 'Wellness Trends', subtitle: 'Quantifiable insights into your routine' },
    profile: { title: 'Profile & Privacy', subtitle: 'Manage preferences and data export' },
    admin: { title: 'System Console', subtitle: 'Platform overview and session monitoring' },
  };

  const current = viewTitles[currentView] || viewTitles.dashboard;

  const toggleAudio = () => {
    const state = calmAudio.toggleAmbientSound();
    setIsPlayingAudio(state);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAF7]/90 backdrop-blur-md border-b border-[#E5EDE7] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile menu button + Title/Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#163327] tracking-tight leading-tight">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-[#5C7A6D]">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Soundscape toggle + Breathing + Quick Check-in + Showcase */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#2D5A46] bg-white border border-[#E0E8E2] hover:bg-stone-50 transition-colors shadow-2xs"
            title="View public landing page & features showcase"
          >
            <Compass className="w-3.5 h-3.5 text-[#2D5A46]" />
            <span>Showcase & Tour</span>
          </button>
        )}

        <button
          onClick={toggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            isPlayingAudio
              ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46]'
              : 'bg-white text-[#5C7A6D] border-[#E0E8E2] hover:bg-stone-50'
          }`}
          title={isPlayingAudio ? 'Mute ambient soundscape' : 'Play ambient rain/forest soundscape'}
        >
          {isPlayingAudio ? <Volume2 className="w-4 h-4 text-[#2D5A46]" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden md:inline">{isPlayingAudio ? 'Sound On' : 'Ambient'}</span>
        </button>

        <button
          onClick={onOpenBreathing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#2D5A46] bg-[#EAF2EC] hover:bg-[#DCE7DF] transition-colors"
          title="Open guided breathing pacer"
        >
          <Wind className="w-4 h-4 text-[#2D5A46]" />
          <span className="hidden sm:inline">Breathwork</span>
        </button>

        <button
          onClick={onQuickCheckIn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#2D5A46] hover:bg-[#234739] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Log Mood</span>
        </button>
      </div>
    </header>
  );
};
