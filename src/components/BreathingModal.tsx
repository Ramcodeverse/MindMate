import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { calmAudio } from '../utils/audio';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [technique, setTechnique] = useState<'478' | 'box'>('478');
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [ambientActive, setAmbientActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      return;
    }
    setIsActive(true);
    setPhase('Inhale');
    setTimer(4);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase transitions
        if (technique === '478') {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 7;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 8;
          } else {
            setPhase('Inhale');
            calmAudio.playGentleChime();
            return 4;
          }
        } else {
          // Box breathing (4-4-4-4)
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else if (phase === 'Exhale') {
            setPhase('Hold (Empty)');
            return 4;
          } else {
            setPhase('Inhale');
            calmAudio.playGentleChime();
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isActive, phase, technique]);

  const toggleSound = () => {
    const isPlaying = calmAudio.toggleAmbientSound();
    setAmbientActive(isPlaying);
  };

  if (!isOpen) return null;

  const getScaleClass = () => {
    if (phase === 'Inhale') return 'scale-125 duration-[4000ms]';
    if (phase === 'Hold' || phase === 'Hold (Empty)') return 'scale-125 duration-1000';
    if (phase === 'Exhale') return 'scale-90 duration-[8000ms]';
    return 'scale-100';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#163327]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBFBF7] border border-[#D8E4DC] rounded-3xl w-full max-w-md p-8 relative shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Close breathing sanctuary"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-[#2D5A46] uppercase tracking-wider">Mindful Sanctuary</span>
          <h2 className="text-2xl font-bold text-[#163327] mt-1">Guided Breathwork</h2>
        </div>

        {/* Technique Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#EAF2EC] rounded-xl mb-8">
          <button
            onClick={() => {
              setTechnique('478');
              setPhase('Inhale');
              setTimer(4);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              technique === '478' ? 'bg-white text-[#163327] shadow-sm' : 'text-[#3E5C4E]'
            }`}
          >
            4-7-8 Relaxing
          </button>
          <button
            onClick={() => {
              setTechnique('box');
              setPhase('Inhale');
              setTimer(4);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              technique === 'box' ? 'bg-white text-[#163327] shadow-sm' : 'text-[#3E5C4E]'
            }`}
          >
            4-4-4-4 Box Focus
          </button>
        </div>

        {/* Breathing Animation Canvas */}
        <div className="relative w-64 h-64 flex items-center justify-center my-4">
          {/* Outer ring */}
          <div
            className={`absolute inset-0 rounded-full bg-[#EAF2EC] border border-[#2D5A46]/20 transition-transform ease-in-out ${getScaleClass()}`}
          />
          {/* Middle glow */}
          <div className="absolute inset-4 rounded-full bg-[#3B7258]/10 blur-md" />
          {/* Center text */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#2D5A46] mb-1">
              {phase}
            </span>
            <span className="text-5xl font-bold tabular-nums text-[#163327]">{timer}</span>
            <span className="text-xs text-[#527061] mt-2">
              {technique === '478' ? 'Calm your nervous system' : 'Cultivate steady focus'}
            </span>
          </div>
        </div>

        {/* Control toolbar */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-3 rounded-full bg-[#2D5A46] text-white hover:bg-[#234739] shadow-sm transition-transform active:scale-95"
            title={isActive ? 'Pause' : 'Resume'}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setPhase('Inhale');
              setTimer(4);
            }}
            className="p-3 rounded-full bg-white border border-[#D5E0D8] text-[#2D5A46] hover:bg-stone-50 transition-colors"
            title="Reset cycle"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-3 rounded-full border transition-colors ${
              ambientActive 
                ? 'bg-[#EAF2EC] text-[#2D5A46] border-[#2D5A46]' 
                : 'bg-white border-[#D5E0D8] text-[#527061] hover:bg-stone-50'
            }`}
            title={ambientActive ? 'Mute ambient sound' : 'Play ambient rain/forest soundscape'}
          >
            {ambientActive ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
