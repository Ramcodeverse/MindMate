import React, { useState, useEffect } from 'react';
import { 
  Flower2, 
  Wind, 
  Eye, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';
import { calmAudio } from '../utils/audio';

export const CalmToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'breathing' | 'grounding' | 'reflection' | 'break'>('breathing');

  // Breathing state
  const [technique, setTechnique] = useState<'478' | 'box' | 'calm'>('478');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState(0);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingSteps = [
    { count: 5, label: 'Things You Can See', prompt: 'Look around your room. Notice 5 objects, colors, or shadows you haven’t paid attention to today.' },
    { count: 4, label: 'Things You Can Touch', prompt: 'Feel 4 physical sensations: the fabric of your sleeve, your feet on the floor, the texture of the desk.' },
    { count: 3, label: 'Things You Can Hear', prompt: 'Close your eyes. Listen for 3 distinct sounds: distant traffic, computer fan, or your own breath.' },
    { count: 2, label: 'Things You Can Smell', prompt: 'Notice 2 scents in the air: your tea, fresh rain, soap, or clean linen.' },
    { count: 1, label: 'Thing You Can Taste', prompt: 'Focus on 1 taste: a sip of cool water, lingering mint, or the natural neutrality of your mouth.' },
  ];

  // Mindful Break state
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(3);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(180);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Guided reflection answers
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const reflectionQuestions = [
    "What emotion or physical sensation is most noticeable right now?",
    "What is one expectation you can gently release for the rest of today?",
    "What is something small that gave you even a split-second of comfort recently?",
    "What is one kind, supportive thing you would say to a close friend in your position?"
  ];

  // Breathing cycle interval
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathTimer(prev => {
        if (prev > 1) return prev - 1;

        // Transition phases
        if (technique === '478') {
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            setBreathCyclesCompleted(c => c + 1);
            calmAudio.playGentleChime();
            return 4;
          }
        } else if (technique === 'box') {
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 4;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 4;
          } else if (breathPhase === 'Exhale') {
            setBreathPhase('Rest');
            return 4;
          } else {
            setBreathPhase('Inhale');
            setBreathCyclesCompleted(c => c + 1);
            calmAudio.playGentleChime();
            return 4;
          }
        } else {
          // Calm 4-6
          if (breathPhase === 'Inhale') {
            setBreathPhase('Exhale');
            return 6;
          } else {
            setBreathPhase('Inhale');
            setBreathCyclesCompleted(c => c + 1);
            calmAudio.playGentleChime();
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase, technique]);

  // Break timer countdown
  useEffect(() => {
    if (!isBreakActive || breakSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setBreakSecondsLeft(prev => {
        if (prev <= 1) {
          setIsBreakActive(false);
          calmAudio.playGentleChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreakActive, breakSecondsLeft]);

  const toggleAmbientSound = () => {
    const isPlaying = calmAudio.toggleAmbientSound();
    setIsAmbientPlaying(isPlaying);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
          <Flower2 className="w-4 h-4" />
          <span>Restorative Wellness</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A] mt-1">
          Calm Tools Sanctuary
        </h1>
        <p className="text-xs sm:text-sm text-[#657587] mt-1">
          Functional, clinically grounded practices to regulate your nervous system, ground racing thoughts, and grant yourself a peaceful pause.
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F0F4F8] rounded-2xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTool('breathing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'breathing' ? 'bg-white text-[#176B57] shadow-xs' : 'text-[#657587] hover:text-[#172B3A]'
          }`}
        >
          <Wind className="w-4 h-4 text-[#176B57]" />
          <span>Breathing Pacer</span>
        </button>

        <button
          onClick={() => setActiveTool('grounding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'grounding' ? 'bg-white text-[#176B57] shadow-xs' : 'text-[#657587] hover:text-[#172B3A]'
          }`}
        >
          <Eye className="w-4 h-4 text-[#9279DB]" />
          <span>5-Senses Grounding</span>
        </button>

        <button
          onClick={() => setActiveTool('reflection')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'reflection' ? 'bg-white text-[#176B57] shadow-xs' : 'text-[#657587] hover:text-[#172B3A]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-[#E8B64C]" />
          <span>Guided Reflection</span>
        </button>

        <button
          onClick={() => setActiveTool('break')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTool === 'break' ? 'bg-white text-[#176B57] shadow-xs' : 'text-[#657587] hover:text-[#172B3A]'
          }`}
        >
          <Volume2 className="w-4 h-4 text-[#31A878]" />
          <span>Mindful Sound Break</span>
        </button>
      </div>

      {/* TOOL 1: BREATHING PACER */}
      {activeTool === 'breathing' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center space-y-8">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#176B57] uppercase tracking-wider">
              Autonomic Regulation
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#172B3A]">
              Rhythmic Breathing Pacer
            </h2>
            <p className="text-xs text-[#657587] max-w-md mx-auto">
              Slow exhalations signal safety to the brain stem, lowering heart rate and soothing adrenaline.
            </p>
          </div>

          {/* Technique Picker */}
          <div className="flex items-center gap-2 p-1 bg-[#F7F9FC] rounded-xl border border-[#E4EAF0]">
            <button
              onClick={() => { setTechnique('478'); setBreathPhase('Inhale'); setBreathTimer(4); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                technique === '478' ? 'bg-white text-[#176B57] shadow-2xs' : 'text-[#657587]'
              }`}
            >
              4-7-8 Relaxing
            </button>
            <button
              onClick={() => { setTechnique('box'); setBreathPhase('Inhale'); setBreathTimer(4); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                technique === 'box' ? 'bg-white text-[#176B57] shadow-2xs' : 'text-[#657587]'
              }`}
            >
              Box (4-4-4-4)
            </button>
            <button
              onClick={() => { setTechnique('calm'); setBreathPhase('Inhale'); setBreathTimer(4); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                technique === 'calm' ? 'bg-white text-[#176B57] shadow-2xs' : 'text-[#657587]'
              }`}
            >
              Calm (4-6 Pace)
            </button>
          </div>

          {/* Expanding / Contracting Breathing Visual Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            {/* Outer soft aura */}
            <div
              className={`absolute inset-0 rounded-full bg-[#E8F5EF] transition-transform ease-in-out ${
                isBreathingActive && breathPhase === 'Inhale' ? 'scale-115 duration-[4000ms]' :
                isBreathingActive && breathPhase === 'Hold' ? 'scale-115 duration-1000' :
                isBreathingActive && (breathPhase === 'Exhale' || breathPhase === 'Rest') ? 'scale-85 duration-[6000ms]' :
                'scale-100'
              }`}
            />
            {/* Inner primary circle */}
            <div
              className={`relative z-10 w-48 h-48 rounded-full border-2 border-[#176B57]/40 bg-white flex flex-col items-center justify-center shadow-lg transition-transform ease-in-out ${
                isBreathingActive && breathPhase === 'Inhale' ? 'scale-110 duration-[4000ms]' :
                isBreathingActive && breathPhase === 'Hold' ? 'scale-110 duration-1000' :
                isBreathingActive && (breathPhase === 'Exhale' || breathPhase === 'Rest') ? 'scale-90 duration-[6000ms]' :
                'scale-100'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-[#176B57]">
                {isBreathingActive ? breathPhase : 'Ready'}
              </span>
              <span className="font-serif text-4xl font-bold text-[#172B3A] my-1 tabular-nums">
                {isBreathingActive ? breathTimer : '4'}
              </span>
              <span className="text-[10px] text-[#8A9BA8]">
                {isBreathingActive ? `Cycle ${breathCyclesCompleted + 1}` : 'Press Start'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isBreathingActive) {
                  setIsBreathingActive(false);
                } else {
                  setIsBreathingActive(true);
                  setBreathPhase('Inhale');
                  setBreathTimer(4);
                  calmAudio.playGentleChime();
                }
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#176B57] hover:bg-[#104C40] shadow-sm transition-all flex items-center gap-2"
            >
              {isBreathingActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              <span>{isBreathingActive ? 'Pause Exercise' : 'Start Breathing'}</span>
            </button>

            <button
              onClick={() => {
                setIsBreathingActive(false);
                setBreathPhase('Inhale');
                setBreathTimer(4);
                setBreathCyclesCompleted(0);
              }}
              className="p-2.5 rounded-full border border-[#E4EAF0] text-[#657587] hover:bg-[#F7F9FC]"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAmbientSound}
              className={`p-2.5 rounded-full border transition-colors ${
                isAmbientPlaying ? 'bg-[#E8F5EF] text-[#176B57] border-[#176B57]' : 'border-[#E4EAF0] text-[#657587]'
              }`}
              title="Toggle rain ambient background"
            >
              {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* TOOL 2: 5-SENSES GROUNDING */}
      {activeTool === 'grounding' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#9279DB] uppercase tracking-wider">
                Somatic Awareness
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#172B3A] mt-0.5">
                5-4-3-2-1 Sensory Grounding Practice
              </h2>
            </div>
            <span className="text-xs font-bold text-[#176B57] bg-[#E8F5EF] px-3 py-1 rounded-full">
              Step {groundingStep + 1} of 5
            </span>
          </div>

          <div className="p-8 rounded-2xl bg-[#FBFBFD] border border-[#E4EAF0] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F2EDFD] text-[#9279DB] flex items-center justify-center font-bold text-2xl mx-auto">
              {groundingSteps[groundingStep].count}
            </div>
            <h3 className="text-lg font-bold text-[#172B3A]">
              {groundingSteps[groundingStep].label}
            </h3>
            <p className="text-sm text-[#4A5D6E] max-w-lg mx-auto leading-relaxed">
              {groundingSteps[groundingStep].prompt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              disabled={groundingStep === 0}
              onClick={() => setGroundingStep(s => Math.max(0, s - 1))}
              className="text-xs font-semibold text-[#657587] disabled:opacity-30"
            >
              &larr; Previous Sense
            </button>

            {groundingStep < groundingSteps.length - 1 ? (
              <button
                onClick={() => {
                  calmAudio.playGentleChime();
                  setGroundingStep(s => s + 1);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#176B57] hover:bg-[#104C40] transition-colors"
              >
                Next Sense &rarr;
              </button>
            ) : (
              <button
                onClick={() => {
                  calmAudio.playGentleChime();
                  setGroundingStep(0);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#31A878] hover:bg-[#288a62] transition-colors"
              >
                Complete Grounding ✓
              </button>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: GUIDED REFLECTION */}
      {activeTool === 'reflection' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#E8B64C] uppercase tracking-wider">
              Gentle Inward Dialogue
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#172B3A] mt-0.5">
              Compassionate Self-Reflection
            </h2>
            <p className="text-xs text-[#657587] mt-1">
              Private prompts designed to help you process emotion without self-criticism. Answers remain encrypted and local to your session.
            </p>
          </div>

          <div className="space-y-5">
            {reflectionQuestions.map((q, idx) => (
              <div key={idx} className="space-y-2 p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0]">
                <span className="text-xs font-bold text-[#176B57]">Question {idx + 1}</span>
                <p className="text-sm font-semibold text-[#172B3A]">{q}</p>
                <textarea
                  rows={2}
                  value={reflectionAnswers[idx] || ''}
                  onChange={(e) => setReflectionAnswers({ ...reflectionAnswers, [idx]: e.target.value })}
                  placeholder="Take your time to write a gentle answer..."
                  className="w-full text-xs bg-white border border-[#E4EAF0] rounded-xl p-3 text-[#172B3A] placeholder-[#8A9BA8] focus:outline-none focus:ring-1 focus:ring-[#176B57]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOOL 4: MINDFUL BREAK WITH SOUNDSCAPE */}
      {activeTool === 'break' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center space-y-6">
          <span className="text-xs font-bold text-[#31A878] uppercase tracking-wider">
            Quiet Sensory Space
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B3A]">
            Timed Mindful Soundscape Pause
          </h2>
          <p className="text-xs sm:text-sm text-[#657587] max-w-md mx-auto">
            Step away from screens and messages. Allow our synthesized rain and forest pink noise to create an auditory cocoon of safety.
          </p>

          {/* Time Picker */}
          <div className="flex items-center gap-2">
            {[1, 3, 5, 10].map(m => (
              <button
                key={m}
                onClick={() => {
                  setBreakDurationMinutes(m);
                  setBreakSecondsLeft(m * 60);
                  setIsBreakActive(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                  breakDurationMinutes === m
                    ? 'bg-[#176B57] text-white shadow-xs'
                    : 'bg-[#F7F9FC] text-[#657587] hover:bg-stone-100'
                }`}
              >
                {m} Minutes
              </button>
            ))}
          </div>

          <div className="py-6">
            <span className="font-mono text-5xl sm:text-6xl font-bold text-[#176B57] tabular-nums">
              {Math.floor(breakSecondsLeft / 60)}:
              {String(breakSecondsLeft % 60).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isBreakActive) {
                  setIsBreakActive(false);
                  calmAudio.stopAmbient();
                  setIsAmbientPlaying(false);
                } else {
                  setIsBreakActive(true);
                  calmAudio.startAmbient();
                  setIsAmbientPlaying(true);
                  calmAudio.playGentleChime();
                }
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#176B57] hover:bg-[#104C40] transition-colors flex items-center gap-2"
            >
              {isBreakActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              <span>{isBreakActive ? 'Pause Sanctuary' : 'Begin Quiet Pause'}</span>
            </button>

            <button
              onClick={toggleAmbientSound}
              className={`p-2.5 rounded-full border transition-colors ${
                isAmbientPlaying ? 'bg-[#E8F5EF] text-[#176B57] border-[#176B57]' : 'border-[#E4EAF0] text-[#657587]'
              }`}
              title="Toggle rain audio"
            >
              {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalmToolsPage;
