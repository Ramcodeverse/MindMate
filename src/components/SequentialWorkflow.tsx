import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Bookmark, 
  Play, 
  Volume2, 
  Info, 
  RotateCcw, 
  Sliders, 
  Compass, 
  Flower2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { api } from '../utils/api';
import { RecommendationItem, MoodCategory, User } from '../types';
import { calmAudio } from '../utils/audio';
import { ViewType } from './Sidebar';

export type WorkflowPhase = 
  | 'phase_1_inputs'
  | 'phase_2_profile'
  | 'phase_3_processing'
  | 'phase_4_results'
  | 'phase_5_feedback';

interface DerivedVectorStats {
  genreWeights?: Record<string, number>;
  likedCount?: number;
  dislikedCount?: number;
  savedCount?: number;
  ratedCount?: number;
  lastUpdated?: string;
}

interface SequentialWorkflowProps {
  onNavigate: (view: ViewType) => void;
  onOpenBreathing: () => void;
}

export const SequentialWorkflow: React.FC<SequentialWorkflowProps> = ({
  onNavigate,
  onOpenBreathing,
}) => {
  const { user } = useAuth();
  const { addMood } = useData();

  // Workflow State Machine
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('phase_1_inputs');

  // Phase 1 Inputs State
  const [selectedMoodId, setSelectedMoodId] = useState<string>('calm');
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [selectedIntention, setSelectedIntention] = useState<string>('relax');
  const [selectedMusicGenres, setSelectedMusicGenres] = useState<string[]>(['Acoustic', 'Ambient']);
  const [selectedMovieGenres, setSelectedMovieGenres] = useState<string[]>(['Drama', 'Whimsical Comedy']);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Phase 2 Profile State
  const [profileData, setProfileData] = useState<{ preferences?: User['preferences']; derivedVector?: DerivedVectorStats } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Phase 3 Processing State
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Phase 4 Results State
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [activeExplainItem, setActiveExplainItem] = useState<RecommendationItem | null>(null);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [resultsCategoryFilter, setResultsCategoryFilter] = useState<'all' | 'music' | 'movie' | 'activity'>('all');

  // Phase 5 Feedback State
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [itemFeedbacks, setItemFeedbacks] = useState<Record<string, string>>({});
  const [feedbackConfirmed, setFeedbackConfirmed] = useState<boolean>(false);

  // General Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available Mood Options for Phase 1 (Happy, Calm, Sad, Stressed, Anxious, Tired, Motivated)
  const moodOptions: Array<{
    id: string;
    level: 1 | 2 | 3 | 4 | 5;
    category: MoodCategory;
    label: string;
    emoji: string;
    desc: string;
    accentColor: string;
    activeBorder: string;
    activeBg: string;
  }> = [
    {
      id: 'happy',
      level: 5,
      category: 'Great',
      label: 'Happy',
      emoji: '😊',
      desc: 'Joyful, radiant, positive',
      accentColor: '#F2A18B',
      activeBorder: 'border-[#F2A18B]',
      activeBg: 'bg-[#FFF5F2]'
    },
    {
      id: 'calm',
      level: 4,
      category: 'Good',
      label: 'Calm',
      emoji: '🙂',
      desc: 'Balanced, centered, peaceful',
      accentColor: '#31A878',
      activeBorder: 'border-[#31A878]',
      activeBg: 'bg-[#E8F5EF]'
    },
    {
      id: 'sad',
      level: 2,
      category: 'Low',
      label: 'Sad',
      emoji: '😢',
      desc: 'Heavy heart, needing comfort',
      accentColor: '#6C8DB8',
      activeBorder: 'border-[#6C8DB8]',
      activeBg: 'bg-[#EEF4FB]'
    },
    {
      id: 'stressed',
      level: 2,
      category: 'Low',
      label: 'Stressed',
      emoji: '😰',
      desc: 'Racing thoughts, high tension',
      accentColor: '#D96B43',
      activeBorder: 'border-[#D96B43]',
      activeBg: 'bg-[#FFF0EB]'
    },
    {
      id: 'anxious',
      level: 2,
      category: 'Low',
      label: 'Anxious',
      emoji: '😟',
      desc: 'Nervous energy, on edge',
      accentColor: '#8C70C9',
      activeBorder: 'border-[#8C70C9]',
      activeBg: 'bg-[#F3EFFB]'
    },
    {
      id: 'tired',
      level: 2,
      category: 'Low',
      label: 'Tired',
      emoji: '🙁',
      desc: 'Depleted energy, low stamina',
      accentColor: '#9279DB',
      activeBorder: 'border-[#9279DB]',
      activeBg: 'bg-[#F4F0FD]'
    },
    {
      id: 'motivated',
      level: 5,
      category: 'Great',
      label: 'Motivated',
      emoji: '⚡',
      desc: 'Creative spark, ready to build',
      accentColor: '#176B57',
      activeBorder: 'border-[#176B57]',
      activeBg: 'bg-[#EAF5EF]'
    }
  ];

  // Intention Options for Phase 1 ("What would help you right now?")
  const intentionOptions = [
    { id: 'relax', label: 'Relax', emoji: '🌿', desc: 'Gentle downbeat pacing to slow mental chatter' },
    { id: 'joy', label: 'Feel Happier', emoji: '✨', desc: 'Lighthearted humor and uplifting warmth' },
    { id: 'energy', label: 'Get Motivated', emoji: '⚡', desc: 'Uplifting rhythms to spark physical momentum' },
    { id: 'focus', label: 'Focus', emoji: '🎯', desc: 'Unobtrusive instrumental soundscapes for deep clarity' },
    { id: 'unwind', label: 'Unwind', emoji: '🕊️', desc: 'Decompress tension and ease nervous system' },
  ];

  const quickMusicOptions = ['Acoustic', 'Ambient', 'Indie Folk', 'Lo-Fi', 'Neo-Classical', 'Downtempo', 'Jazz'];
  const quickMovieOptions = ['Heartwarming', 'Whimsical Comedy', 'Thoughtful Drama', 'Gentle Animation', 'Nature Doc'];

  const selectedMoodConfig = moodOptions.find(m => m.id === selectedMoodId) || moodOptions[1];

  // Phase tracker definition
  const phasesList: Array<{ id: WorkflowPhase; num: string; label: string }> = [
    { id: 'phase_1_inputs', num: '01', label: 'Your Mood' },
    { id: 'phase_2_profile', num: '02', label: 'Your Profile' },
    { id: 'phase_3_processing', num: '03', label: 'Discovering' },
    { id: 'phase_4_results', num: '04', label: 'Your Results' },
    { id: 'phase_5_feedback', num: '05', label: 'Feedback' },
  ];

  const currentPhaseIndex = phasesList.findIndex(p => p.id === currentPhase);

  // --- PHASE 1 -> PHASE 2 TRANSITION ---
  const handleCompletePhase1 = async () => {
    if (!selectedMoodId) {
      setValidationError('Please select how you are feeling today.');
      return;
    }
    if (!selectedIntention) {
      setValidationError('Please select what would help you right now.');
      return;
    }
    setValidationError(null);

    try {
      // 1. Save Mood check-in to persistent backend
      await addMood({
        moodLevel: selectedMoodConfig.level,
        moodLabel: selectedMoodConfig.category,
        energyLevel,
        stressLevel,
        emotions: [selectedMoodConfig.label.split('&')[0].trim()],
        contextTags: stressLevel > 5 ? ['Work & Career'] : ['Quality Rest'],
        desiredExperience: selectedIntention,
        note: personalNote.trim(),
        date: new Date().toISOString().split('T')[0],
      });

      // 2. Persist chosen preferences to backend
      try {
        await api.updatePreferences({
          musicGenres: selectedMusicGenres,
          movieGenres: selectedMovieGenres,
        });
      } catch (prefErr) {
        console.warn('Could not update backend preferences:', prefErr);
      }

      // 3. Transition to Phase 2
      setCurrentPhase('phase_2_profile');
      loadPersonalizationProfile();
    } catch (err) {
      console.error('Failed to save Phase 1 check-in:', err);
      // Even if network fails, transition gracefully
      setCurrentPhase('phase_2_profile');
      loadPersonalizationProfile();
    }
  };

  // --- PHASE 2 LOAD PROFILE ---
  const loadPersonalizationProfile = async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const data = await api.getPreferences();
      setProfileData(data as { preferences?: User['preferences']; derivedVector?: DerivedVectorStats });
    } catch (err) {
      console.warn('Could not load profile preferences:', err);
      setProfileError('Unable to synthesize preference profile. Please retry.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // --- PHASE 2 -> PHASE 3 TRANSITION & PROCESSING ---
  const handleStartRecommendationEngine = () => {
    setCurrentPhase('phase_3_processing');
    setProcessingStep(0);
    setProcessingError(null);

    // Realistic multi-step progress sequence
    const stepTimers: NodeJS.Timeout[] = [];

    stepTimers.push(setTimeout(() => setProcessingStep(1), 400));
    stepTimers.push(setTimeout(() => setProcessingStep(2), 900));
    stepTimers.push(setTimeout(() => setProcessingStep(3), 1400));
    stepTimers.push(setTimeout(() => setProcessingStep(4), 1900));

    // Real API fetch
    api.getRecommendations({
      mood: selectedMoodConfig.category,
      intention: selectedIntention,
      limit: 12
    })
      .then((data) => {
        setRecommendations(data);
        stepTimers.push(setTimeout(() => {
          setProcessingStep(5);
          setTimeout(() => {
            setCurrentPhase('phase_4_results');
          }, 600);
        }, 2400));
      })
      .catch((err) => {
        console.error('Recommendation engine failed:', err);
        setProcessingError('Unable to generate recommendations. Please retry.');
      });
  };

  // Toggle Save in Phase 4
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

  // Audio preview in Phase 4
  const handlePlayAudio = (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingItemId === item.id) {
      calmAudio.stopAmbient();
      setPlayingItemId(null);
    } else {
      calmAudio.startAmbient();
      calmAudio.playGentleChime();
      setPlayingItemId(item.id);
      showToast(`Playing ambient sound preview for "${item.title}"`);
    }
  };

  // Submit Feedback in Phase 5
  const handleItemFeedback = async (item: RecommendationItem, action: string) => {
    try {
      await api.submitRecommendationFeedback(item.id, action, action);
      setItemFeedbacks(prev => ({ ...prev, [item.id]: action }));
      if (action === 'not_for_me') {
        showToast(`Suppressed "${item.title}". Genre penalized.`);
      } else if (action === 'exactly_what_i_wanted') {
        showToast(`High affinity recorded for "${item.title}"!`);
      } else if (action === 'more_like_this') {
        showToast(`Boosting similar candidates in future sessions.`);
      } else if (action === 'less_like_this') {
        showToast(`Downweighting tone for "${item.title}".`);
      }
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  const handleCompleteSession = async () => {
    try {
      if (feedbackNotes.trim()) {
        await api.createJournal({
          title: `Session Reflection · ${selectedMoodConfig.label}`,
          content: feedbackNotes.trim(),
          moodAssociation: selectedMoodConfig.category,
          tags: ['Recommendation Feedback', selectedIntention],
        });
      }
    } catch (err) {
      console.warn('Could not save session journal reflection:', err);
    }
    setFeedbackConfirmed(true);
    showToast('Feedback noted! Recommendation weights updated.');
  };

  const handleStartNewSession = () => {
    // Reset workflow back to Phase 1, keeping long-term preferences
    setFeedbackConfirmed(false);
    setItemFeedbacks({});
    setProcessingStep(0);
    setCurrentPhase('phase_1_inputs');
    showToast('Started a new mindful session.');
  };

  // Filter recommendations by type in Phase 4
  const filteredRecs = recommendations.filter(item => {
    if (resultsCategoryFilter === 'all') return true;
    return item.type === resultsCategoryFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Progress Tracker (Sticky header) */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#E4EAF0] p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {phasesList.map((step, idx) => {
            const isCompleted = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            return (
              <div key={step.id} className="flex items-center gap-2 shrink-0">
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isCurrent 
                      ? 'bg-[#176B57] text-white font-bold shadow-2xs' 
                      : isCompleted 
                        ? 'bg-[#E8F5EF] text-[#176B57] font-semibold' 
                        : 'text-[#8A9BA8] font-medium'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? 'bg-white/20 text-white' : isCompleted ? 'bg-[#176B57] text-white' : 'bg-stone-100 text-[#8A9BA8]'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                  </span>
                  <span>{step.label}</span>
                </div>
                {idx < phasesList.length - 1 && (
                  <div className="w-4 h-px bg-[#E4EAF0] hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 1: INITIAL SCREEN AND USER INPUTS                                   */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_1_inputs' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#F0F4F8]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#176B57] flex items-center justify-center text-white shadow-sm">
                <Flower2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold text-[#172B3A] tracking-tight">MindMate</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                    AI Sanctuary
                  </span>
                </div>
                <p className="text-xs text-[#657587]">
                  Welcome{user?.name ? `, ${user.name}` : ''} · Intelligent & Personalized Wellness System
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#176B57] uppercase tracking-wider block">Step 1 of 5</span>
              <span className="text-[11px] text-[#8A9BA8]">Initial Inputs</span>
            </div>
          </div>

          {/* Heading & Explanation */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A]">
              How are you feeling today?
            </h1>
            <p className="text-xs sm:text-sm text-[#657587] max-w-2xl leading-relaxed">
              MindMate understands what you are experiencing right now and personalizes music, cinema, and restorative activities to meet your emotional intention without altering your established long-term preferences.
            </p>
          </div>

          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. Mood Cards Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A] block">
              1. Select your current emotional state
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {moodOptions.map((m) => {
                const isSelected = selectedMoodId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMoodId(m.id);
                      setValidationError(null);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[110px] ${
                      isSelected 
                        ? `${m.activeBorder} ${m.activeBg} shadow-sm ring-2 ring-[${m.accentColor}]/30` 
                        : 'border-[#E4EAF0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{m.emoji}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#172B3A] mt-2">{m.label}</p>
                      <p className="text-[10px] text-[#657587] mt-0.5 line-clamp-1">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sliders: Energy & Stress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Energy Slider */}
            <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                  <span className="text-sm">⚡</span>
                  <span>Energy Level</span>
                </span>
                <span className="text-xs font-bold text-[#176B57] tabular-nums bg-white px-2.5 py-0.5 rounded-full border border-[#E4EAF0]">
                  {energyLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-[#176B57] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8A9BA8] font-medium">
                <span>1 (Depleted)</span>
                <span>5 (Steady)</span>
                <span>10 (Vibrant)</span>
              </div>
            </div>

            {/* Stress Slider */}
            <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                  <span className="text-sm">🌊</span>
                  <span>Stress / Tension</span>
                </span>
                <span className="text-xs font-bold text-[#D96B43] tabular-nums bg-white px-2.5 py-0.5 rounded-full border border-[#E4EAF0]">
                  {stressLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-[#D96B43] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8A9BA8] font-medium">
                <span>1 (Peaceful)</span>
                <span>5 (Moderate)</span>
                <span>10 (Overwhelmed)</span>
              </div>
            </div>
          </div>

          {/* 3. "What would help you right now?" (Intention) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A] block">
              2. What would help you right now?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {intentionOptions.map((opt) => {
                const isSelected = selectedIntention === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedIntention(opt.id);
                      setValidationError(null);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      isSelected 
                        ? 'border-[#176B57] bg-[#E8F5EF] shadow-2xs' 
                        : 'border-[#E4EAF0] bg-white hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{opt.emoji}</span>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-[#176B57]' : 'text-[#172B3A]'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-[#657587] mt-0.5 leading-normal">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Genre Preferences */}
          <div className="pt-2 border-t border-[#F0F4F8] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#657587] block">
              Optional Taste Preferences
            </span>
            <div className="space-y-2">
              <span className="text-xs text-[#4A5D6E] block font-medium">Preferred Music Styles:</span>
              <div className="flex flex-wrap gap-2">
                {quickMusicOptions.map((g) => {
                  const isChecked = selectedMusicGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedMusicGenres(prev => 
                          isChecked ? prev.filter(x => x !== g) : [...prev, g]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        isChecked 
                          ? 'bg-[#176B57] text-white font-semibold' 
                          : 'bg-[#F0F4F8] text-[#4A5D6E] hover:bg-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{g}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-[#4A5D6E] block font-medium">Preferred Cinema Tones:</span>
              <div className="flex flex-wrap gap-2">
                {quickMovieOptions.map((g) => {
                  const isChecked = selectedMovieGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedMovieGenres(prev => 
                          isChecked ? prev.filter(x => x !== g) : [...prev, g]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        isChecked 
                          ? 'bg-[#176B57] text-white font-semibold' 
                          : 'bg-[#F0F4F8] text-[#4A5D6E] hover:bg-stone-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}{g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Note / Context */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-[#4A5D6E] block font-medium">Optional Note for Today's Reflection:</span>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="e.g., Finished a long day of meetings, looking forward to unwinding with something calming..."
                rows={2}
                className="w-full text-xs p-3 rounded-2xl border border-[#E4EAF0] focus:border-[#176B57] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
            <button
              onClick={onOpenBreathing}
              className="text-xs font-medium text-[#176B57] hover:underline flex items-center gap-1.5"
            >
              <span>Need a fast 60s reset first?</span>
            </button>

            <button
              onClick={handleCompletePhase1}
              className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Continue to Step 2: Build Profile</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: BUILD THE PERSONALIZATION PROFILE                                */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_2_profile' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
              <Sliders className="w-4 h-4 text-[#176B57]" />
              <span>Step 2 of 5 · Profile Synthesis</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A]">
              Getting to know your preferences
            </h2>
            <p className="text-xs sm:text-sm text-[#657587] max-w-2xl leading-relaxed">
              MindMate synthesizes your immediate emotional state with your long-term preferences, ensuring today's recommendation matches tonight's intention without erasing your established taste.
            </p>
          </div>

          {/* Loading or Error State */}
          {loadingProfile && (
            <div className="p-4 bg-[#E8F5EF] border border-[#31A878]/30 rounded-2xl flex items-center gap-3 text-xs text-[#176B57]">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#176B57]" />
              <span>Building your personalization profile using your mood inputs and stored history...</span>
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
              <button
                onClick={loadPersonalizationProfile}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Profile Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box A: Today's Context Window */}
            <div className="p-6 rounded-2xl bg-[#F7FAF8] border border-[#D5E8DE] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#176B57] block">
                Today's Context Window (Temporary)
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8F2EC]">
                  <span className="text-[#657587]">Reported Mood:</span>
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <span>{selectedMoodConfig.emoji}</span>
                    <span>{selectedMoodConfig.label}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8F2EC]">
                  <span className="text-[#657587]">Energy & Stress:</span>
                  <span className="font-bold text-[#172B3A] tabular-nums">
                    Energy {energyLevel}/10 · Stress {stressLevel}/10
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#657587]">Primary Intention:</span>
                  <span className="font-bold text-[#176B57] capitalize">
                    {intentionOptions.find(i => i.id === selectedIntention)?.label || selectedIntention}
                  </span>
                </div>
              </div>
            </div>

            {/* Box B: Long-Term Preference Profile */}
            <div className="p-6 rounded-2xl bg-[#F9FAF8] border border-[#E4EAF0] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D6E] block">
                Long-Term Taste Profile (Persistent)
              </span>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8ECE6]">
                  <span className="text-[#657587]">Favored Music:</span>
                  <span className="font-bold text-[#172B3A]">
                    {selectedMusicGenres.join(', ') || 'Acoustic, Ambient'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8ECE6]">
                  <span className="text-[#657587]">Favored Cinema:</span>
                  <span className="font-bold text-[#172B3A]">
                    {selectedMovieGenres.join(', ') || 'Drama, Whimsical Comedy'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#657587]">Learned Signals:</span>
                  <span className="font-bold text-[#176B57]">
                    {loadingProfile 
                      ? 'Loading vectors...' 
                      : profileData?.derivedVector 
                        ? `${profileData.derivedVector.likedCount || 0} likes · ${profileData.derivedVector.savedCount || 0} saved` 
                        : 'Active · Cold-Start Baseline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Weights Breakdown */}
          <div className="p-5 rounded-2xl bg-white border border-[#E4EAF0] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#172B3A]">
              <span>Dynamic Scoring Breakdown for this Session</span>
              <span className="text-[10px] text-[#8A9BA8] uppercase">Configured Weights</span>
            </div>
            <div className="h-3 w-full bg-[#F4F7F5] rounded-full overflow-hidden flex">
              <div style={{ width: '30%' }} className="bg-[#176B57]" title="30% Long-term Genre Taste" />
              <div style={{ width: '25%' }} className="bg-[#31A878]" title="25% Immediate Intention & Mood" />
              <div style={{ width: '20%' }} className="bg-[#9279DB]" title="20% Collaborative Matrix" />
              <div style={{ width: '15%' }} className="bg-[#E8B64C]" title="15% Duration & Format Fit" />
              <div style={{ width: '10%' }} className="bg-[#6C8DB8]" title="10% Discovery & MMR Novelty" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#657587] pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#176B57]" /> 30% Long-term Taste</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#31A878]" /> 25% Today's Context</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9279DB]" /> 20% Collaborative CF</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E8B64C]" /> 15% Format Fit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6C8DB8]" /> 10% Diversity MMR</span>
            </div>
          </div>

          <div className="p-4 bg-[#F4F8F5] rounded-2xl border border-[#D3E8DC] text-xs text-[#2D5A46] leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-[#176B57] mt-0.5" />
            <span>
              <strong>Guaranteed Separation:</strong> If you generally enjoy intense cinema but requested gentle comfort today, MindMate will prioritize comfort cinema without corrupting your long-term action preference vector.
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
            <button
              onClick={() => setCurrentPhase('phase_1_inputs')}
              className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Mood</span>
            </button>

            <button
              onClick={handleStartRecommendationEngine}
              className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Proceed to Step 3: Run Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: RECOMMENDATION ENGINE PROCESSING                                 */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_3_processing' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 sm:p-14 shadow-2xs space-y-8 text-center animate-fade-in max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EF] text-[#176B57] flex items-center justify-center mx-auto relative">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B57]">
              Step 3 of 5 · Machine Learning Inference
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B3A]">
              Finding recommendations just for you
            </h2>
            <p className="text-xs sm:text-sm text-[#657587]">
              Evaluating candidate soundscapes, cinema, and restorative activities...
            </p>
          </div>

          {processingError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 space-y-3">
              <p>{processingError}</p>
              <button
                onClick={handleStartRecommendationEngine}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs"
              >
                Retry Recommendation Inference
              </button>
            </div>
          ) : (
            <div className="bg-[#F7F9FC] rounded-2xl border border-[#E4EAF0] p-6 text-left space-y-3.5 max-w-md mx-auto">
              {[
                `Analyzing ${selectedMoodConfig.label} state & energy (${energyLevel}/10)...`,
                `Matching content with genre weights (${selectedMusicGenres[0] || 'Acoustic'})...`,
                `Computing collaborative filtering with shrinkage dampening...`,
                `Selecting restorative activities for ${intentionOptions.find(i => i.id === selectedIntention)?.label || 'Calm'}...`,
                `Synthesizing diversity-aware MMR rankings & explanations...`
              ].map((msg, index) => {
                const isDone = processingStep > index;
                const isCurrent = processingStep === index;
                return (
                  <div key={index} className="flex items-center gap-3 text-xs">
                    {isDone ? (
                      <span className="w-5 h-5 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✓
                      </span>
                    ) : isCurrent ? (
                      <span className="w-5 h-5 rounded-full border-2 border-[#176B57] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-[#E4EAF0] text-[#8A9BA8] shrink-0" />
                    )}
                    <span className={isDone ? 'text-[#172B3A] font-semibold' : isCurrent ? 'text-[#176B57] font-bold' : 'text-[#8A9BA8]'}>
                      {msg}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 4: PERSONALIZED RESULTS DASHBOARD                                   */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_4_results' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
                <Compass className="w-4 h-4 text-[#176B57]" />
                <span>Step 4 of 5 · Your Personalized Results</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B3A]">
                Your MindMate recommendations
              </h2>
              <p className="text-xs text-[#657587]">
                Matched for your {selectedMoodConfig.label} state ({energyLevel}/10 energy) and intention to {intentionOptions.find(i => i.id === selectedIntention)?.label.toLowerCase() || 'relax'}.
              </p>
            </div>

            {/* Next Action: Proceed to Feedback */}
            <button
              onClick={() => setCurrentPhase('phase_5_feedback')}
              className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0 group cursor-pointer"
            >
              <span>Continue to Step 5: Feedback</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Category Filter Switcher */}
          <div className="flex items-center justify-between gap-3 border-b border-[#E4EAF0] pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Recommendations' },
                { id: 'music', label: '🎵 Music Soundscapes' },
                { id: 'movie', label: '📺 Movies & Cinema' },
                { id: 'activity', label: '🌿 Restorative Activities' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setResultsCategoryFilter(t.id as 'all' | 'music' | 'movie' | 'activity')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    resultsCategoryFilter === t.id
                      ? 'bg-[#176B57] text-white shadow-2xs'
                      : 'bg-white text-[#657587] border border-[#E4EAF0] hover:bg-[#F7F9FC]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartRecommendationEngine}
              className="text-xs font-semibold text-[#657587] hover:text-[#176B57] flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E4EAF0] bg-white hover:bg-[#F7F9FC] shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecs.map((item) => {
              const isPlaying = playingItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveExplainItem(item)}
                  className="bg-white rounded-3xl border border-[#E4EAF0] p-4 shadow-2xs hover:shadow-md hover:border-[#176B57]/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-100 mb-3.5">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                      {/* Play button for music */}
                      {item.type === 'music' && (
                        <button
                          onClick={(e) => handlePlayAudio(item, e)}
                          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                            isPlaying 
                              ? 'bg-[#176B57] text-white scale-110' 
                              : 'bg-white/95 text-[#172B3A] hover:bg-white'
                          }`}
                          title="Preview soundscape"
                        >
                          {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                      )}

                      {/* Bookmark icon */}
                      <button
                        onClick={(e) => handleToggleSave(item, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                        title={item.isSaved ? 'Remove from saved' : 'Save to library'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-[#31A878] text-[#31A878]' : ''}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                        {item.categoryBadge}
                      </span>
                      <span className="text-[10px] text-[#8A9BA8] font-medium">{item.duration}</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#176B57] transition-colors">{item.title}</h3>
                    <p className="text-xs text-[#657587] mt-0.5">{item.subtitle}</p>

                    <p className="text-xs text-[#4A5D6E] mt-2 leading-relaxed line-clamp-2">
                      {item.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F0F4F8] space-y-2">
                    <div className="text-[11px] text-[#176B57] bg-[#E8F5EF]/60 p-2.5 rounded-xl flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#176B57]" />
                      <span className="leading-snug">{item.explanation}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-[#8A9BA8]">Click card to inspect</span>
                      <span className="font-semibold text-[#176B57] group-hover:underline">Details & Feedback →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
            <button
              onClick={() => setCurrentPhase('phase_2_profile')}
              className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </button>

            <button
              onClick={() => setCurrentPhase('phase_5_feedback')}
              className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Proceed to Step 5: Feedback & Tuning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 5: FEEDBACK AND CONTINUOUS PERSONALIZATION                          */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_5_feedback' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
              <CheckCircle2 className="w-4 h-4 text-[#176B57]" />
              <span>Step 5 of 5 · Continuous Learning Loop</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A]">
              Help MindMate understand what works for you
            </h2>
            <p className="text-xs sm:text-sm text-[#657587] max-w-2xl leading-relaxed">
              Your feedback directly tunes your machine-learning preference vector. Mark items that hit the mark or suppress choices that didn't feel right for today.
            </p>
          </div>

          {feedbackConfirmed && (
            <div className="p-4 bg-[#E8F5EF] border border-[#31A878]/30 rounded-2xl text-xs text-[#176B57] flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>Session completed! Your feedback has been recorded and will shape future recommendation rankings.</span>
            </div>
          )}

          {/* Overall Session Rating */}
          <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#172B3A]">Overall Session Accuracy</h4>
                <p className="text-[11px] text-[#657587]">Did these suggestions match your emotional intention?</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setSessionRating(star);
                      showToast(`Rated session ${star}★`);
                    }}
                    className={`text-lg p-1 transition-transform hover:scale-125 ${
                      sessionRating >= star ? 'text-amber-400' : 'text-stone-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Per-Item Feedback Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A] block">
              Item-by-Item Feedback (Tuning your profile)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 6).map((item) => {
                const currentAction = itemFeedbacks[item.id];
                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-[#E4EAF0] bg-white flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#172B3A] truncate">{item.title}</p>
                          {currentAction && (
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                              currentAction === 'exactly_what_i_wanted' ? 'bg-[#E8F5EF] text-[#176B57]' :
                              currentAction === 'more_like_this' ? 'bg-[#E8F5EF] text-[#176B57]' :
                              currentAction === 'less_like_this' ? 'bg-amber-50 text-amber-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {currentAction === 'exactly_what_i_wanted' ? 'Loved (+2.0)' :
                               currentAction === 'more_like_this' ? 'Boosted (+1.5)' :
                               currentAction === 'less_like_this' ? 'Downweighted' :
                               'Suppressed'}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#8A9BA8] truncate">{item.genre} · {item.type}</p>
                      </div>
                    </div>

                    {/* 4 action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleItemFeedback(item, 'exactly_what_i_wanted')}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentAction === 'exactly_what_i_wanted'
                            ? 'bg-[#176B57] text-white shadow-xs'
                            : 'bg-[#F4F8F5] text-[#176B57] hover:bg-[#e4f0e9]'
                        }`}
                        title="Exactly what I wanted (+2.0 genre weight)"
                      >
                        🌟
                      </button>
                      <button
                        onClick={() => handleItemFeedback(item, 'more_like_this')}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentAction === 'more_like_this'
                            ? 'bg-[#176B57] text-white shadow-xs'
                            : 'bg-[#F4F8F5] text-[#176B57] hover:bg-[#e4f0e9]'
                        }`}
                        title="More like this (+1.5 affinity)"
                      >
                        ✨
                      </button>
                      <button
                        onClick={() => handleItemFeedback(item, 'less_like_this')}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentAction === 'less_like_this'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-stone-100 text-[#657587] hover:bg-stone-200'
                        }`}
                        title="Less like this (-1.5 tone weight)"
                      >
                        📉
                      </button>
                      <button
                        onClick={() => handleItemFeedback(item, 'not_for_me')}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          currentAction === 'not_for_me'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                        title="Not for me (Suppress item)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#172B3A]">
              Optional Mindful Note for your Journal
            </label>
            <textarea
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g., Felt calmer after listening to acoustic tracks; the grounding exercise was right on time..."
              rows={2}
              className="w-full text-xs p-3 rounded-2xl border border-[#E4EAF0] focus:border-[#176B57] focus:outline-none resize-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#E4EAF0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setCurrentPhase('phase_4_results')}
              className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Results</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('analytics')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#657587] hover:text-[#172B3A] border border-[#E4EAF0] bg-white hover:bg-[#F7F9FC] transition-colors"
              >
                View Analytics
              </button>
              <button
                onClick={() => onNavigate('calendar')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#657587] hover:text-[#172B3A] border border-[#E4EAF0] bg-white hover:bg-[#F7F9FC] transition-colors"
              >
                View Calendar
              </button>
              {!feedbackConfirmed ? (
                <button
                  onClick={handleCompleteSession}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Feedback & Complete</span>
                </button>
              ) : (
                <button
                  onClick={handleStartNewSession}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Start a New Session</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHY THIS FITS EXPLANATION MODAL */}
      {activeExplainItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={activeExplainItem.imageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                    {activeExplainItem.genre}
                  </span>
                  <h3 className="text-sm font-bold text-[#172B3A] mt-1">{activeExplainItem.title}</h3>
                  <p className="text-xs text-[#657587]">{activeExplainItem.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveExplainItem(null)}
                className="text-[#8A9BA8] hover:text-[#172B3A] p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-[#F7FAF8] rounded-2xl border border-[#E8F5EF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B57]">
                <Info className="w-4 h-4" />
                <span>Why MindMate recommended this:</span>
              </div>
              <p className="text-xs text-[#4A5D6E] leading-relaxed">
                "{activeExplainItem.explanation}"
              </p>
            </div>

            <p className="text-xs text-[#657587] leading-relaxed">
              {activeExplainItem.synopsis}
            </p>

            <div className="pt-2 border-t border-[#F0F4F8] flex items-center justify-between">
              <button
                onClick={(e) => {
                  handleToggleSave(activeExplainItem, e);
                  setActiveExplainItem(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E8F5EF] text-[#176B57] flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{activeExplainItem.isSaved ? 'Saved in Library' : 'Save to Library'}</span>
              </button>

              <button
                onClick={() => setActiveExplainItem(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#657587] hover:bg-stone-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequentialWorkflow;
