import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Music, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calmAudio } from '../utils/audio';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { updateUserPreferences } = useAuth();
  const [step, setStep] = useState(1);

  // Form states
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Understanding emotional patterns',
    'Finding music that fits my mood',
    'Exploring activities that fit my energy'
  ]);
  const [musicGenres, setMusicGenres] = useState<string[]>(['Acoustic', 'Indie Folk', 'Ambient']);
  const [movieGenres, setMovieGenres] = useState<string[]>(['Drama', 'Whimsical Comedy', 'Animation']);
  const [selectedIntention, setSelectedIntention] = useState<string>('Help me feel calmer');
  const [journalConsent, setJournalConsent] = useState<boolean>(false);
  const [personalizationEnabled, setPersonalizationEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const goalOptions = [
    'Understanding emotional patterns',
    'Finding music that fits my mood',
    'Discovering movies and shows',
    'Managing stressful moments',
    'Improving daily reflection',
    'Exploring activities that fit my energy'
  ];

  const musicGenreOptions = ['Acoustic', 'Indie Folk', 'Ambient', 'Lo-Fi', 'Classical', 'Jazz', 'Indie Pop'];
  const movieGenreOptions = ['Drama', 'Whimsical Comedy', 'Animation', 'Adventure', 'Documentary', 'Magical Realism'];

  const intentionOptions = [
    'Help me feel calmer',
    'Lift my energy',
    'Help me feel understood',
    'Help me focus',
    'Help me relax and unwind',
    'Match the mood I\'m already in',
    'Let me decide each time'
  ];

  const toggleGoal = (g: string) => {
    setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleMusic = (g: string) => {
    setMusicGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleMovie = (g: string) => {
    setMovieGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleFinish = async () => {
    await updateUserPreferences({
      musicGenres,
      movieGenres,
      preferredIntentions: [selectedIntention],
      personalizationEnabled,
      journalConsent,
      onboardingCompleted: true,
    });
    calmAudio.playGentleChime();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#172B3A]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E4EAF0] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Progress Dots */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#176B57]" />
            <span className="text-xs font-bold text-[#172B3A]">Personalization Setup</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === s ? 'bg-[#176B57] w-5' : s < step ? 'bg-[#31A878]' : 'bg-[#E4EAF0]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#176B57] flex items-center justify-center text-2xl">
              🌿
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              Welcome to MindMate.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D6E] leading-relaxed">
              MindMate is designed as your quiet companion for emotional self-awareness. By understanding how you feel, MindMate helps you discover movies, music, and simple practices that genuinely fit your moment.
            </p>
            <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-2 text-xs text-[#657587]">
              <div className="flex items-center gap-2 text-[#172B3A] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#176B57]" />
                <span>You are always in control</span>
              </div>
              <p>Your data is private, explainable, and never sold. All recommendations are transparent.</p>
            </div>
          </div>
        )}

        {/* STEP 2: Mood Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              What would you like support with?
            </h2>
            <p className="text-xs text-[#657587]">
              Select all goals that resonate with your current life chapter.
            </p>
            <div className="space-y-2">
              {goalOptions.map(g => {
                const active = selectedGoals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`w-full p-3 rounded-2xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                      active ? 'border-[#176B57] bg-[#E8F5EF] text-[#176B57] font-semibold' : 'border-[#E4EAF0] bg-white text-[#4A5D6E] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <span>{g}</span>
                    {active && <Check className="w-4 h-4 text-[#176B57]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Interests */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              Your content preferences
            </h2>
            <p className="text-xs text-[#657587]">
              Help our recommendation engine tune into sounds and stories you enjoy.
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#176B57]" />
                <span>Music Genres</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {musicGenreOptions.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMusic(m)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      musicGenres.includes(m) ? 'bg-[#176B57] text-white font-semibold' : 'bg-[#F7F9FC] text-[#4A5D6E] border border-[#E4EAF0]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#F0F4F8]">
              <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-[#E8B64C]" />
                <span>Movie & Show Tones</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {movieGenreOptions.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMovie(m)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      movieGenres.includes(m) ? 'bg-[#176B57] text-white font-semibold' : 'bg-[#F7F9FC] text-[#4A5D6E] border border-[#E4EAF0]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Recommendation Intention */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              Default recommendation intention
            </h2>
            <p className="text-xs text-[#657587]">
              When you log a check-in, what is your primary preference for discoveries? Matching your mood is just as valid as trying to improve it.
            </p>
            <div className="space-y-2">
              {intentionOptions.map(opt => {
                const active = selectedIntention === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedIntention(opt)}
                    className={`w-full p-3 rounded-2xl border text-xs text-left flex items-center justify-between transition-all ${
                      active ? 'border-[#176B57] bg-[#E8F5EF] text-[#176B57] font-semibold' : 'border-[#E4EAF0] bg-white text-[#4A5D6E] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <span>{opt}</span>
                    {active && <Check className="w-4 h-4 text-[#176B57]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Privacy Choice */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              Privacy & Intelligence Controls
            </h2>
            <p className="text-xs text-[#657587]">
              Confirm how your data supports your personalized experience.
            </p>

            <div className="space-y-3">
              <label className="p-3.5 rounded-2xl border border-[#E4EAF0] bg-[#F7F9FC] flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalizationEnabled}
                  onChange={(e) => setPersonalizationEnabled(e.target.checked)}
                  className="mt-0.5 accent-[#176B57] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-[#172B3A] block">Enable Mood-Based Personalization</span>
                  <p className="text-[11px] text-[#657587] leading-relaxed mt-0.5">
                    Allow recommendations to score candidates based on your check-ins and ratings. You can reset learned preferences anytime.
                  </p>
                </div>
              </label>

              <label className="p-3.5 rounded-2xl border border-[#E4EAF0] bg-[#F7F9FC] flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={journalConsent}
                  onChange={(e) => setJournalConsent(e.target.checked)}
                  className="mt-0.5 accent-[#176B57] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-[#172B3A] block">Include Journal Text in AI Reflection</span>
                  <p className="text-[11px] text-[#657587] leading-relaxed mt-0.5">
                    Defaults to off. If enabled, the AI reflection companion can read recent journal entries to provide compassionate active listening.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F0F4F8]">
          {step > 1 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-xs font-semibold text-[#657587] hover:text-[#172B3A]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#176B57] hover:bg-[#104C40] transition-colors flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#31A878] hover:bg-[#288a62] transition-colors shadow-sm"
            >
              Enter Sanctuary &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
