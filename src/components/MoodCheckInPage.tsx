import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Zap, 
  ShieldAlert, 
  Lock 
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { MoodCategory } from '../types';
import { calmAudio } from '../utils/audio';

interface MoodCheckInPageProps {
  onBack: () => void;
  onSaved: () => void;
}

export const MoodCheckInPage: React.FC<MoodCheckInPageProps> = ({ onBack, onSaved }) => {
  const { addMood } = useData();

  const [selectedMood, setSelectedMood] = useState<MoodCategory>('Good');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Calm']);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [selectedContext, setSelectedContext] = useState<string[]>(['Outdoors']);
  const [desiredIntention, setDesiredIntention] = useState<string>('Calm');
  const [note, setNote] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  const moodOptions: Array<{ level: 1 | 2 | 3 | 4 | 5; label: MoodCategory; emoji: string; desc: string; accentColor: string }> = [
    { level: 5, label: 'Great', emoji: '😊', desc: 'Happy, energized, positive', accentColor: '#F2A18B' },
    { level: 4, label: 'Good', emoji: '🙂', desc: 'Calm, balanced, okay', accentColor: '#31A878' },
    { level: 3, label: 'Okay', emoji: '😐', desc: 'Neither good nor bad', accentColor: '#E8B64C' },
    { level: 2, label: 'Low', emoji: '🙁', desc: 'Tired, unmotivated, down', accentColor: '#9279DB' },
    { level: 1, label: 'Struggling', emoji: '😢', desc: 'Overwhelmed, upset', accentColor: '#6C8DB8' },
  ];

  const availableEmotions = [
    'Calm', 'Grateful', 'Energized', 'Hopeful', 'Focused', 
    'Content', 'Fatigued', 'Anxious', 'Overwhelmed', 'Tender', 'Restless', 'Proud'
  ];

  const contextOptions = [
    'Work & Career', 'Time Outdoors', 'Quality Rest', 'Social / Family', 
    'Sleep Quality', 'Physical Health', 'Creative Flow', 'Solitude'
  ];

  const intentionOptions = [
    { id: 'Comfort', label: 'Comfort & Validation', desc: 'Help me feel held and understood' },
    { id: 'Calm', label: 'Gentle Calm', desc: 'Quiet instrumental pacing to steady my breath' },
    { id: 'Energy', label: 'Lift My Energy', desc: 'Light, sunlit rhythms to spark momentum' },
    { id: 'Focus', label: 'Grounded Focus', desc: 'Downtempo beats to enter flow state' },
    { id: 'Match', label: 'Match My Mood', desc: 'Honor my current emotional space as it is' }
  ];

  const toggleEmotion = (em: string) => {
    setSelectedEmotions(prev =>
      prev.includes(em) ? prev.filter(e => e !== em) : [...prev, em]
    );
  };

  const toggleContext = (ctx: string) => {
    setSelectedContext(prev =>
      prev.includes(ctx) ? prev.filter(c => c !== ctx) : [...prev, ctx]
    );
  };

  const handleSaveCheckIn = async () => {
    setIsSaving(true);
    const chosenConfig = moodOptions.find(m => m.label === selectedMood) || moodOptions[1];
    try {
      await addMood({
        moodLevel: chosenConfig.level,
        moodLabel: chosenConfig.label,
        note: note.trim(),
        emotions: selectedEmotions,
        energyLevel,
        stressLevel,
        contextTags: selectedContext,
        desiredExperience: desiredIntention,
        date: entryDate,
      });
      calmAudio.playGentleChime();
      setSuccessSaved(true);
      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (err) {
      console.error('Failed to save mood check-in:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#176B57] hover:text-[#104C40] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#657587]">
          <CalendarIcon className="w-3.5 h-3.5" />
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="bg-white border border-[#E4EAF0] rounded-lg px-2.5 py-1 text-xs text-[#172B3A] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Check-In Container */}
      <div className="bg-white rounded-3xl border border-[#E4EAF0] shadow-sm p-6 sm:p-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#176B57]">
            Mindful Check-In
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B3A] mt-1">
            Tune in to how you feel right now.
          </h2>
          <p className="text-xs sm:text-sm text-[#657587] mt-1">
            There are no wrong answers. Tracking your emotional rhythm builds compassionate self-awareness.
          </p>
        </div>

        {/* STEP 1: Overall Mood Category */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#657587]">
            1. How is your overall mood?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {moodOptions.map((m) => {
              const isSelected = selectedMood === m.label;
              return (
                <button
                  key={m.level}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 focus:outline-none ${
                    isSelected
                      ? 'border-[#176B57] bg-[#E8F5EF] ring-2 ring-[#176B57]/30 shadow-xs scale-102'
                      : 'border-[#E4EAF0] bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-xs font-bold text-[#172B3A]">{m.label}</span>
                  <span className="text-[10px] text-[#657587] leading-tight">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Emotion Nuances */}
        <div className="space-y-3 pt-2 border-t border-[#F0F4F8]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#657587]">
            2. What feelings are present? (Select all that fit)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableEmotions.map((em) => {
              const active = selectedEmotions.includes(em);
              return (
                <button
                  key={em}
                  type="button"
                  onClick={() => toggleEmotion(em)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#176B57] text-white shadow-2xs font-semibold'
                      : 'bg-[#F7F9FC] text-[#4A5D6E] hover:bg-[#EEF3F7] border border-[#E4EAF0]'
                  }`}
                >
                  {em}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Energy & Stress Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#F0F4F8]">
          {/* Energy Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#31A878]" />
                <span>Physical Energy Level</span>
              </span>
              <span className="font-bold text-[#176B57] tabular-nums">{energyLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
              className="w-full accent-[#176B57] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8A9BA8]">
              <span>Depleted (1)</span>
              <span>Balanced (5)</span>
              <span>Energized (10)</span>
            </div>
          </div>

          {/* Stress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#E8B64C]" />
                <span>Current Stress / Tension</span>
              </span>
              <span className="font-bold text-[#176B57] tabular-nums">{stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value, 10))}
              className="w-full accent-[#E8B64C] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8A9BA8]">
              <span>Deeply Calm (1)</span>
              <span>Moderate (5)</span>
              <span>High Tension (10)</span>
            </div>
          </div>
        </div>

        {/* STEP 4: Context Factors */}
        <div className="space-y-3 pt-2 border-t border-[#F0F4F8]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#657587]">
            4. What context contributed to this feeling?
          </label>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map((ctx) => {
              const active = selectedContext.includes(ctx);
              return (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => toggleContext(ctx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#E8F5EF] text-[#176B57] border border-[#176B57] font-semibold'
                      : 'bg-white text-[#4A5D6E] hover:bg-[#F7F9FC] border border-[#E4EAF0]'
                  }`}
                >
                  {ctx}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 5: Desired Recommendation Intention */}
        <div className="space-y-3 pt-2 border-t border-[#F0F4F8]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#657587]">
            5. What kind of discovery would feel right right now?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {intentionOptions.map((intent) => {
              const active = desiredIntention === intent.id;
              return (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => setDesiredIntention(intent.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    active
                      ? 'border-[#176B57] bg-[#E8F5EF] ring-1 ring-[#176B57]'
                      : 'border-[#E4EAF0] bg-white hover:bg-[#F7F9FC]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#172B3A] block">{intent.label}</span>
                  <span className="text-[10px] text-[#657587] leading-tight block mt-0.5">{intent.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 6: Optional Private Reflection Note */}
        <div className="space-y-2 pt-2 border-t border-[#F0F4F8]">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold uppercase tracking-wider text-[#657587]">
              6. Optional Private Reflection
            </label>
            <span className="text-[11px] text-[#8A9BA8] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Encrypted & private</span>
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is sitting on your mind right now? Any small wins, tender feelings, or gentle observations..."
            className="w-full text-xs sm:text-sm bg-[#F7F9FC] border border-[#E4EAF0] rounded-2xl p-3.5 text-[#172B3A] placeholder-[#8A9BA8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#176B57]"
          />
        </div>

        {/* Actions & Submit */}
        <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-[#657587] hover:text-[#172B3A]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveCheckIn}
            className="px-6 py-3 rounded-full text-xs font-bold text-white bg-[#176B57] hover:bg-[#104C40] shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving Check-in...</span>
            ) : successSaved ? (
              <>
                <Check className="w-4 h-4 text-[#31A878]" />
                <span>Saved! Refreshing sanctuary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Save Check-in & Refresh Discoveries</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckInPage;
