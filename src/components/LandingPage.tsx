import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Volume2, 
  VolumeX,
  ChevronDown, 
  ChevronUp,
  Calendar,
  Check,
  Flame,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { AmbientVideo } from './motion/AmbientVideo';
import { RevealOnScroll } from './motion/RevealOnScroll';
import { calmAudio } from '../utils/audio';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDemoMood, setSelectedDemoMood] = useState<number>(4);
  const [demoHabitCompleted, setDemoHabitCompleted] = useState<Record<string, boolean>>({
    'Morning meditation': true,
    'Hydration (2L)': true,
    'Evening quiet read': false,
  });
  const [activePreviewTab, setActivePreviewTab] = useState<'dashboard' | 'mood' | 'journal' | 'habits' | 'calendar' | 'ai'>('dashboard');

  // Sticky header transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSoundscape = () => {
    const playing = calmAudio.toggleAmbientSound();
    setIsPlayingAudio(playing);
  };

  const toggleDemoHabit = (name: string) => {
    setDemoHabitCompleted(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const faqs = [
    {
      q: 'How does MindMate protect my personal journal and mood records?',
      a: 'Your reflections are strictly private. All records are scoped to your user identity with zero public leaks. When reflecting with the AI companion, you decide whether recent mood or streak context is shared, and your entries are never sent to train external foundation models.'
    },
    {
      q: 'Is the AI Companion a substitute for professional mental health therapy?',
      a: 'No. MindMate is designed as a daily mindfulness, habit, and self-reflection companion. It does not provide medical diagnoses, clinical treatment, or psychiatric prescriptions. If you or someone you know is in crisis, we provide 24/7 direct access to compassionate emergency resources including the 988 Lifeline.'
    },
    {
      q: 'Can I export my personal data at any time?',
      a: 'Yes! Under your profile settings, you can download a complete, unencrypted JSON archive of all your moods, journals, and habit histories with a single click at any time.'
    },
    {
      q: 'Does MindMate work offline or without external services?',
      a: 'Yes. The core wellness suite—mood tracking, habits, journaling, calendar views, breathing exercises, and ambient synthesized soundscapes—functions reliably even without third-party internet connections.'
    }
  ];

  const demoMoods = [
    { level: 1, emoji: '😔', label: 'Very Low' },
    { level: 2, emoji: '😕', label: 'Low' },
    { level: 3, emoji: '😐', label: 'Okay' },
    { level: 4, emoji: '😊', label: 'Good' },
    { level: 5, emoji: '✨', label: 'Very Good' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F1] text-[#20352C] selection:bg-[#E2F1E6]">
      {/* 
        SECTION 3 — GLOBAL NAVIGATION 
        Transparent-to-glass sticky top bar conforming strictly to the Top Bar Contract:
        [Brand wordmark, 1 line] — [4-5 clean single-line nav links] — [1 primary action + audio toggle]
      */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md border-b border-[#E3E9E2] py-3 shadow-subtle' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a 
            href="#hero" 
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-[#174C3C] text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#102F27]">
              MindMate
            </span>
          </a>

          {/* Zone 2: 4-5 clean single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-[#66766C]">
            <a href="#act-notice" className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0">
              Mood Rhythm
            </a>
            <a href="#act-reflect" className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0">
              Private Journal
            </a>
            <a href="#act-build" className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0">
              Habit Anchors
            </a>
            <a href="#act-connect" className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0">
              AI Companion
            </a>
            <a href="#act-trust" className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0">
              Privacy Pledge
            </a>
          </nav>

          {/* Zone 3: 1 primary action + ambient sound toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSoundscape}
              title={isPlayingAudio ? 'Mute ambient soundscape' : 'Play peaceful ambient soundscape'}
              aria-label={isPlayingAudio ? 'Mute ambient soundscape' : 'Play peaceful ambient soundscape'}
              className={`p-2 rounded-full border transition-colors ${
                isPlayingAudio 
                  ? 'bg-[#174C3C] text-white border-[#174C3C]' 
                  : 'bg-white/80 text-[#174C3C] border-[#E3E9E2] hover:bg-white shadow-xs'
              }`}
            >
              {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#174C3C] hover:text-[#102F27] transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27] shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Start your journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#20352C] hover:text-[#174C3C]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#E3E9E2] px-6 py-5 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#20352C]">
              <a 
                href="#act-notice" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                Mood Rhythm
              </a>
              <a 
                href="#act-reflect" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                Private Journal
              </a>
              <a 
                href="#act-build" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                Habit Anchors
              </a>
              <a 
                href="#act-connect" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                AI Companion
              </a>
              <a 
                href="#act-trust" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                Privacy Pledge
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#174C3C]"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-2 border-t border-[#E3E9E2] flex items-center justify-between">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="text-xs font-semibold text-[#174C3C]"
              >
                Sign in
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onEnterApp(); }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 
        ACT 1: ARRIVE — HERO SECTION: CINEMATIC FIRST IMPRESSION
        Cinematic natural background video + carefully controlled green-to-ivory overlay
      */}
      <section id="hero" className="relative min-h-[96vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AmbientVideo 
          scene="morning-mist" 
          poster="/src/assets/images/nature_misty_mountain_lake_1792066034905.jpg"
          overlayGradient="bg-gradient-to-b from-[#F8F7F1]/80 via-[#F8F7F1]/60 to-[#F8F7F1]"
          className="absolute inset-0 w-full h-full"
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <RevealOnScroll direction="down" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E3E9E2] text-[11px] font-semibold text-[#174C3C] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#174C3C]" aria-hidden="true" />
              <span>YOUR SPACE TO RESET</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#66766C]">10,000+ mindful daily check-ins</span>
            </div>
          </RevealOnScroll>

          {/* Main Headline */}
          <RevealOnScroll delay={0.2}>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#102F27] leading-[1.08] text-balance">
              Make space for <span className="italic font-normal text-[#174C3C]">how you feel.</span>
            </h1>
          </RevealOnScroll>

          {/* Supporting Text */}
          <RevealOnScroll delay={0.3}>
            <p className="text-sm sm:text-base text-[#66766C] max-w-2xl mx-auto leading-relaxed font-normal">
              A serene personal sanctuary for mood tracking, private journaling, healthy habit building, and empathetic AI reflection. Rooted in nature and designed for calm.
            </p>
          </RevealOnScroll>

          {/* Primary & Secondary CTAs */}
          <RevealOnScroll delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="px-7 py-3 text-xs sm:text-sm font-semibold text-white bg-[#174C3C] hover:bg-[#102F27] rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 group"
              >
                <span>Start your journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="#act-notice"
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-[#174C3C] bg-white/85 hover:bg-white border border-[#E3E9E2] rounded-full shadow-xs transition-colors"
              >
                Explore MindMate
              </a>
            </div>
            <p className="text-[11px] text-[#66766C] pt-3">
              Free to explore · No credit card required · Instant demo account
            </p>
          </RevealOnScroll>

          {/* Floating Interactive Live Preview Widgets */}
          <RevealOnScroll delay={0.5} className="pt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
              {/* Widget 1: Mood Today */}
              <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#174C3C]">
                  <span className="uppercase tracking-wider">Mood Today</span>
                  <span className="text-[10px] text-[#66766C] font-normal">Live selection</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  {demoMoods.map((m) => (
                    <button
                      key={m.level}
                      onClick={() => setSelectedDemoMood(m.level)}
                      className={`text-2xl p-1 rounded-xl transition-all ${
                        selectedDemoMood === m.level ? 'bg-[#E2F1E6] scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#66766C] pt-0.5">
                  Selected: <span className="font-semibold text-[#174C3C]">{demoMoods.find(m => m.level === selectedDemoMood)?.label}</span>
                </p>
              </div>

              {/* Widget 2: Weekly Habit Anchors */}
              <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 shadow-subtle space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#174C3C]">
                  <span className="uppercase tracking-wider">Habit Anchors</span>
                  <span className="font-mono tabular-nums text-[#174C3C]">5 day streak</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-[#20352C]">
                    <span>Morning meditation</span>
                    <span className="font-semibold text-[#174C3C]">Done</span>
                  </div>
                  <div className="w-full bg-[#E3E9E2] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#174C3C] h-full rounded-full w-[85%]" />
                  </div>
                  <div className="flex items-center justify-between text-[#20352C] pt-0.5">
                    <span>Evening calm tea</span>
                    <span className="font-semibold text-[#174C3C]">Done</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Private Journal */}
              <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 shadow-subtle space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#174C3C]">
                  <span className="uppercase tracking-wider">Private Journal</span>
                  <Lock className="w-3 h-3 text-[#66766C]" />
                </div>
                <p className="text-xs font-semibold text-[#20352C] line-clamp-2">
                  "A quiet morning walk by the misty lake. Breathing in calm, leaving worry behind."
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#66766C] pt-1">
                  <span>Autosaved</span>
                  <span>·</span>
                  <span>142 words</span>
                </div>
              </div>

              {/* Widget 4: AI Reflection */}
              <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-sm border border-white/80 shadow-subtle space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#174C3C]">
                  <Sparkles className="w-3.5 h-3.5 text-[#174C3C]" />
                  <span className="uppercase tracking-wider">AI Companion</span>
                </div>
                <p className="text-xs text-[#20352C]">
                  "You navigated today with remarkable grace. How does your body feel right now?"
                </p>
                <span className="text-[10px] text-[#66766C] block pt-1">Active reflection</span>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 
        ACT 2: NOTICE — MOOD TRACKING & EMOTIONAL AWARENESS 
        Interactive demonstration with energy sliders and server-backed schema
      */}
      <section id="act-notice" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E3E9E2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 2 · NOTICE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Name what you feel, without judgment.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              Checking in daily takes less than 30 seconds. Track subtle shifts in emotional resonance, energy levels from 1 to 10, and identify triggers before exhaustion settles in.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#20352C]">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>5-point emotional scale paired with granular emotion descriptors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>Continuous energy tracking with tabular metrics</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>Private notes to record environmental context and gratitude</span>
              </div>
            </div>
            <button
              onClick={onEnterApp}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27] transition-all inline-flex items-center gap-2"
            >
              <span>Try Mood Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <RevealOnScroll direction="left">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3E9E2] shadow-elevated space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="text-sm font-bold text-[#102F27]">Today's Emotional Check-In</h3>
                    <p className="text-xs text-[#66766C]">Interactive demonstration</p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#174C3C] bg-[#E2F1E6] px-2.5 py-1 rounded-md">
                    Energy: 8/10
                  </span>
                </div>

                {/* Mood Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#20352C] block">
                    How are you feeling in this moment?
                  </label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {demoMoods.map((m) => (
                      <button
                        key={m.level}
                        onClick={() => setSelectedDemoMood(m.level)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedDemoMood === m.level
                            ? 'border-[#174C3C] bg-[#E2F1E6]/40 shadow-xs scale-105'
                            : 'border-[#E3E9E2] hover:border-[#174C3C]/40 bg-white'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{m.emoji}</span>
                        <span className="text-[11px] font-semibold text-[#20352C] block">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular emotion tags demo */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#20352C] block">
                    Emotions present (select all that apply):
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Peaceful', 'Grateful', 'Optimistic', 'Focused', 'Tired'].map((emotion, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          idx < 3 ? 'bg-[#174C3C] text-white border-[#174C3C]' : 'bg-[#F8F7F1] text-[#66766C] border-[#E3E9E2]'
                        }`}
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirmation banner */}
                <div className="p-3.5 rounded-xl bg-[#E2F1E6]/60 border border-[#A9C7B2]/40 text-xs flex items-center justify-between text-[#174C3C]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#174C3C]" />
                    <span className="font-medium">Ready to record to your private timeline</span>
                  </div>
                  <span className="font-mono tabular-nums text-[11px]">Synced</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 
        ACT 3: REFLECT — PRIVATE JOURNALING
        Distraction-free editor preview with live autosave indicator and privacy blur
      */}
      <section id="act-reflect" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E3E9E2]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <RevealOnScroll direction="right">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F7F1] border border-[#E3E9E2] shadow-elevated space-y-5">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E2]">
                  <div className="flex items-center gap-2 text-xs text-[#66766C]">
                    <span className="w-2 h-2 rounded-full bg-[#174C3C]" />
                    <span className="font-medium text-[#174C3C]">Autosaved to device</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">184 words</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#66766C]">Privacy:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#174C3C] bg-white px-2 py-0.5 rounded border border-[#E3E9E2]">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  </div>
                </div>

                {/* Editor Surface */}
                <div className="space-y-3">
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#102F27]">
                    Quiet morning reflections by the garden
                  </h4>
                  <div className="text-xs sm:text-sm text-[#20352C] leading-relaxed space-y-3 font-normal">
                    <p>
                      The house is completely still except for the steam rising off the chamomile tea. I noticed my shoulders were hunched when I first sat down, holding onto yesterday's unfinished work items.
                    </p>
                    <p>
                      Taking three deep, deliberate breaths helped release that tension. Today I choose to move at an intentional pace. Progress does not require anxiety.
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E3E9E2] text-xs text-[#66766C]">
                  <span className="font-semibold text-[#20352C]">Tags:</span>
                  <span className="text-[#174C3C]">#MorningReflection</span>
                  <span>·</span>
                  <span className="text-[#174C3C]">#Mindfulness</span>
                  <span>·</span>
                  <span className="text-[#174C3C]">#Gratitude</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 3 · REFLECT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Your private space to unburden thoughts.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              A distraction-free writing canvas engineered for clarity. Continuous live autosave ensures not a single thought is lost, while end-to-end privacy guarantees your entries remain strictly yours.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-[#20352C]">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>Zero-interruption editor with automatic save status</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>Full-text search across past journal entries</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#174C3C]" />
                <span>Instant privacy screen blur toggle for public workspaces</span>
              </div>
            </div>
            <button
              onClick={onEnterApp}
              className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27] transition-all inline-flex items-center gap-2"
            >
              <span>Explore Journal Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 
        ACT 4: BUILD — HEALTHY HABITS & DAILY ANCHORS
        Interactive habit cards with streak rings and celebratory feedback
      */}
      <section id="act-build" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E3E9E2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 4 · BUILD
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Small daily anchors, lasting resilience.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              Wellness isn't built in massive overhauls—it flourishes through consistent, gentle daily practices. Track meditation, outdoor walks, sleep consistency, and hydration.
            </p>
            <div className="p-4 rounded-2xl bg-[#E2F1E6]/40 border border-[#A9C7B2]/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#174C3C] text-white flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-[#F4DDD0]" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#102F27] block">Streak Protection</span>
                <span className="text-xs text-[#66766C]">
                  Missed yesterday? Gentle return without shaming or resetting your progress history.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <RevealOnScroll direction="left">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3E9E2] shadow-elevated space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="text-sm font-bold text-[#102F27]">Daily Habit Anchors</h3>
                    <p className="text-xs text-[#66766C]">Click to toggle completion</p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[#174C3C] font-semibold">
                    {Object.values(demoHabitCompleted).filter(Boolean).length}/3 completed today
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(demoHabitCompleted).map(([name, completed]) => (
                    <div
                      key={name}
                      onClick={() => toggleDemoHabit(name)}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        completed 
                          ? 'border-[#174C3C] bg-[#E2F1E6]/30 shadow-xs' 
                          : 'border-[#E3E9E2] hover:border-[#174C3C]/40 bg-[#F8F7F1]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            completed ? 'bg-[#174C3C] border-[#174C3C] text-white' : 'border-[#E3E9E2] bg-white'
                          }`}
                        >
                          {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className={`text-xs font-semibold block ${completed ? 'text-[#102F27]' : 'text-[#66766C]'}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-[#66766C]">Daily habit</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#174C3C]">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{completed ? '6 days' : '5 days'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#66766C]">
                  <span>Weekly consistency: <strong className="text-[#174C3C]">88%</strong></span>
                  <span className="text-[#174C3C] font-medium">Auto-synced</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 
        ACT 5: UNDERSTAND — CALENDAR & PERSONAL INSIGHTS
        Holistic timeline showing how moods, habits, and journals weave together
      */}
      <section id="act-understand" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E3E9E2]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 5 · UNDERSTAND
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              See the big picture of your well-being.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              Explore your monthly wellness calendar where moods, habit streaks, and journal notes align into clear, comforting patterns.
            </p>
          </div>

          <RevealOnScroll>
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F8F7F1] border border-[#E3E9E2] shadow-elevated">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E3E9E2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E3E9E2] text-[#174C3C] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#102F27]">October 2026 Overview</h3>
                    <p className="text-xs text-[#66766C]">28 of 31 days logged · 90% habit consistency</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-[#66766C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#174C3C]" /> Good / Very Good
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A9C7B2]" /> Balanced
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F4DDD0]" /> Low Energy
                  </span>
                </div>
              </div>

              {/* Sample 7-day mini calendar view */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-6">
                {[
                  { day: 'Mon', date: 'Oct 09', emoji: '😊', mood: 'Good', habits: '3/3', journals: 1 },
                  { day: 'Tue', date: 'Oct 10', emoji: '✨', mood: 'Very Good', habits: '3/3', journals: 2 },
                  { day: 'Wed', date: 'Oct 11', emoji: '😐', mood: 'Balanced', habits: '2/3', journals: 1 },
                  { day: 'Thu', date: 'Oct 12', emoji: '😊', mood: 'Good', habits: '3/3', journals: 0 },
                  { day: 'Fri', date: 'Oct 13', emoji: '✨', mood: 'Very Good', habits: '3/3', journals: 1 },
                  { day: 'Sat', date: 'Oct 14', emoji: '😊', mood: 'Peaceful', habits: '3/3', journals: 2 },
                  { day: 'Sun', date: 'Oct 15', emoji: '😊', mood: 'Refreshed', habits: '3/3', journals: 1 },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#E3E9E2] space-y-2 hover:border-[#174C3C]/50 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#66766C]">
                      <span>{item.day}</span>
                      <span className="font-mono tabular-nums">{item.date}</span>
                    </div>
                    <div className="text-2xl text-center py-1">{item.emoji}</div>
                    <div className="space-y-1 text-[10px] text-[#66766C] border-t border-[#F0F4F1] pt-1.5">
                      <div className="flex justify-between">
                        <span>Habits:</span>
                        <span className="font-semibold text-[#174C3C]">{item.habits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Journal:</span>
                        <span className="font-semibold text-[#102F27]">{item.journals > 0 ? 'Logged' : 'None'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 
        ACT 6: CONNECT — AI-ASSISTED REFLECTION
        Empathetic active listening, non-clinical reframing, and crisis safety
      */}
      <section id="act-connect" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E3E9E2]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 6 · CONNECT
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Empathetic active listening, always ready.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              When feelings feel overwhelming or tangled, converse with your AI reflection companion. Powered by server-side Gemini 3.8 Flash, it offers gentle reframing, grounding breathing exercises, and warm validation.
            </p>
            <div className="p-4 rounded-2xl bg-[#EAE6F7]/50 border border-[#E3E9E2] space-y-2 text-xs">
              <span className="font-bold text-[#102F27] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#174C3C]" />
                Responsible Safety Guardrails
              </span>
              <p className="text-[#66766C]">
                Never claims to be a doctor or therapist. Immediate 24/7 crisis hotlines appear automatically if distress is detected.
              </p>
            </div>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27] transition-all inline-flex items-center gap-2"
            >
              <span>Reflect with AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <RevealOnScroll direction="left">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3E9E2] shadow-elevated space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E2]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#174C3C] text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#102F27]">MindMate AI Companion</h3>
                      <p className="text-[10px] text-[#66766C]">Server-side reflection engine · Private</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#174C3C] bg-[#E2F1E6] px-2.5 py-1 rounded-full">
                    Active Session
                  </span>
                </div>

                {/* Staggered conversation bubbles */}
                <div className="space-y-3.5 pt-2">
                  {/* User Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-md p-3.5 rounded-2xl bg-[#174C3C] text-white text-xs leading-relaxed rounded-tr-xs">
                      "I've been feeling anxious about everything I have to finish by Friday. My chest feels tight."
                    </div>
                  </div>

                  {/* AI Response Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-md p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] text-[#20352C] text-xs leading-relaxed rounded-tl-xs space-y-2">
                      <p>
                        Thank you for sharing that with me. Anxiety often feels like your body is sounding an alarm for things that haven't happened yet.
                      </p>
                      <p>
                        Let's take a gentle pause together right here. Feel your feet resting against the floor, and release any tension in your jaw. What is one small task you can set aside for tomorrow? You do not have to carry all of Friday today.
                      </p>
                      <div className="pt-1 flex items-center gap-2 text-[10px] text-[#66766C]">
                        <span className="text-[#174C3C] font-semibold">Suggested grounding:</span>
                        <span>4-4-4 Box Breathing</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated message bar */}
                <div className="pt-2 flex items-center gap-2">
                  <div className="flex-1 py-2.5 px-4 rounded-full bg-[#F8F7F1] border border-[#E3E9E2] text-xs text-[#66766C]">
                    Type a reflection or feeling...
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="p-2.5 rounded-full bg-[#174C3C] text-white hover:bg-[#102F27] transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 
        ACT 7: TRUST — PRIVACY, SECURITY, & DATA SOVEREIGNTY
      */}
      <section id="act-trust" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E3E9E2]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              ACT 7 · TRUST
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Your mental health data belongs to you. Always.
            </h2>
            <p className="text-sm text-[#66766C] leading-relaxed">
              We hold mental wellness data to the highest standard of ethical guardianship. No covert tracking, no behavioral ads, and no training on private thoughts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E2F1E6] text-[#174C3C] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#102F27]">Strict Resource Scoping</h3>
              <p className="text-xs text-[#66766C] leading-relaxed">
                All records, habits, and journals are strictly bound to your authenticated user identifier. No cross-account leakage.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E2F1E6] text-[#174C3C] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#102F27]">100% Data Sovereignty</h3>
              <p className="text-xs text-[#66766C] leading-relaxed">
                Export all your records in unencrypted JSON format with one click. Permanently delete your entire account whenever you choose.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E2F1E6] text-[#174C3C] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#102F27]">24/7 Crisis Guarantee</h3>
              <p className="text-xs text-[#66766C] leading-relaxed">
                Automated detection of self-harm phrases immediately surfaces the 988 Suicide & Crisis Lifeline with zero diagnostic latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        SECTION 11 — LIVE PRODUCT PREVIEW CARDS
        Interactive showcase allowing users to explore views before entering
      */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E3E9E2]">
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              PLATFORM SHOWCASE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102F27] leading-tight text-balance">
              Explore the MindMate suite.
            </h2>
            <p className="text-sm text-[#66766C]">
              Every tool crafted with intentional typography, soothing earth tones, and responsive interaction design.
            </p>

            {/* Interactive Preview Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white border border-[#E3E9E2] rounded-full max-w-xl mx-auto shadow-xs">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'mood', label: 'Mood Rhythm' },
                { id: 'journal', label: 'Journal' },
                { id: 'habits', label: 'Habits' },
                { id: 'calendar', label: 'Calendar' },
                { id: 'ai', label: 'AI Reflection' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as typeof activePreviewTab)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap shrink-0 ${
                    activePreviewTab === tab.id
                      ? 'bg-[#174C3C] text-white shadow-xs'
                      : 'text-[#66766C] hover:text-[#102F27]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Preview Showcase Display */}
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E3E9E2] shadow-elevated">
            {activePreviewTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">Personal Wellness Sanctuary</h3>
                    <p className="text-xs text-[#66766C]">Comprehensive overview of streaks, mood history, and daily anchors</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27] transition-colors"
                  >
                    Open Live Sanctuary
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#174C3C]">Active Streak</span>
                    <p className="text-2xl font-bold font-mono tabular-nums text-[#102F27]">5 Days</p>
                    <span className="text-[11px] text-[#66766C]">Consistent daily check-ins</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#174C3C]">Recent Mood</span>
                    <p className="text-2xl font-bold text-[#102F27]">😊 Good (8/10)</p>
                    <span className="text-[11px] text-[#66766C]">Logged today at 9:15 AM</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#174C3C]">Habit Progress</span>
                    <p className="text-2xl font-bold font-mono tabular-nums text-[#102F27]">3 of 4 Done</p>
                    <span className="text-[11px] text-[#66766C]">75% daily target achieved</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'mood' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">Mood Rhythm & Energy Log</h3>
                    <p className="text-xs text-[#66766C]">5-point scale, energy metrics, and context tags</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27]"
                  >
                    Open Mood Tracker
                  </button>
                </div>
                <div className="flex items-center justify-around py-4 bg-[#F8F7F1] rounded-2xl border border-[#E3E9E2]">
                  {demoMoods.map((m) => (
                    <div key={m.level} className="text-center space-y-1">
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-xs font-semibold block text-[#102F27]">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePreviewTab === 'journal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">Private Reflection Journal</h3>
                    <p className="text-xs text-[#66766C]">Live autosave, privacy blur, and tag categorization</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27]"
                  >
                    Open Journal
                  </button>
                </div>
                <div className="p-5 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#102F27]">
                    <span>Morning Sun on the Pine Needles</span>
                    <span className="font-mono tabular-nums text-[#66766C]">Oct 15, 2026</span>
                  </div>
                  <p className="text-xs text-[#66766C] leading-relaxed">
                    "Taking twenty minutes today to disconnect from email. Walked through the park and noticed the autumn colors beginning to shift..."
                  </p>
                </div>
              </div>
            )}

            {activePreviewTab === 'habits' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">Habit Anchors & Streak Calculations</h3>
                    <p className="text-xs text-[#66766C]">Celebrate consistency with gentle return</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27]"
                  >
                    Open Habit Tracker
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['Meditation', 'Hydration', 'Evening Wind-Down'].map((h, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#102F27]">
                        <span>{h}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#174C3C]" />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-[#66766C] block">Streak: 5 days</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePreviewTab === 'calendar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">Monthly Wellness Calendar</h3>
                    <p className="text-xs text-[#66766C]">Unified calendar tracking moods, habits, and journals</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27]"
                  >
                    Open Calendar
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] text-xs text-[#66766C] text-center">
                  Full 31-day visual rhythm with day-level drill down, habit heatmaps, and journal timelines.
                </div>
              </div>
            )}

            {activePreviewTab === 'ai' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E2]">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#102F27]">AI Reflection Companion</h3>
                    <p className="text-xs text-[#66766C]">Empathetic active listening with 988 lifeline protection</p>
                  </div>
                  <button
                    onClick={onEnterApp}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#174C3C] rounded-full hover:bg-[#102F27]"
                  >
                    Open AI Reflection
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F7F1] border border-[#E3E9E2] space-y-2 text-xs">
                  <span className="font-bold text-[#174C3C]">Thoughtful Reframing Example:</span>
                  <p className="text-[#20352C] italic">
                    "When perfectionism whispers that today wasn't enough, remember that showing up for yourself—even in small quiet ways—is the true foundation of well-being."
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        FAQ ACCORDION SECTION
      */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#E3E9E2]">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#174C3C] block">
              CLARITY & CONFIDENCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#102F27] leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#66766C]">
              Transparent answers regarding data privacy, security, and our wellness philosophy.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-[#E3E9E2] bg-white overflow-hidden transition-all shadow-subtle"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[#102F27] text-sm hover:bg-[#F8F7F1]/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#174C3C] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#66766C] shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#66766C] leading-relaxed border-t border-[#E3E9E2]/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ACT 8: BEGIN — FINAL CALL TO ACTION
        Smooth visual transition into the intentional footer
      */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#174C3C] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A9C7B2] block">
            BEGIN TODAY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight text-balance">
            Make space for your mind to breathe.
          </h2>
          <p className="text-sm sm:text-base text-[#E2F1E6] max-w-xl mx-auto leading-relaxed">
            Join thousands who have found daily balance, emotional clarity, and gentle consistency with MindMate.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-7 py-3 text-xs sm:text-sm font-semibold text-[#174C3C] bg-white hover:bg-[#F8F7F1] rounded-full shadow-md transition-all inline-flex items-center gap-2 group"
            >
              <span>Start your journey now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
            >
              Sign in to Account
            </button>
          </div>
        </div>
      </section>

      {/* 
        SECTION 12 — INTENTIONAL CONCLUSION FOOTER
      */}
      <footer className="bg-[#102F27] text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[#102F27] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-[#102F27]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">MindMate</span>
            </div>
            <p className="text-xs text-[#A9C7B2] leading-relaxed max-w-sm">
              Make space for how you feel. A personal wellness platform for mood tracking, journaling, habit building, and AI-assisted emotional reflection.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#A9C7B2] pt-1">
              <a 
                href="https://github.com/Ramcodeverse/MindMate" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-white transition-colors inline-flex items-center gap-1"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span aria-hidden="true">·</span>
              <span>MIT License</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block mb-2">Product Navigation</span>
            <p><a href="#act-notice" className="text-[#A9C7B2] hover:text-white transition-colors">Mood Tracking</a></p>
            <p><a href="#act-reflect" className="text-[#A9C7B2] hover:text-white transition-colors">Private Journaling</a></p>
            <p><a href="#act-build" className="text-[#A9C7B2] hover:text-white transition-colors">Habit Anchors</a></p>
            <p><a href="#act-understand" className="text-[#A9C7B2] hover:text-white transition-colors">Calendar & Insights</a></p>
            <p><a href="#act-connect" className="text-[#A9C7B2] hover:text-white transition-colors">AI Companion</a></p>
            <p><a href="#act-trust" className="text-[#A9C7B2] hover:text-white transition-colors">Privacy Pledge</a></p>
          </div>

          <div className="md:col-span-4 bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
            <h4 className="font-serif text-lg font-bold text-white">Responsible AI Disclosure</h4>
            <p className="text-xs text-[#A9C7B2] leading-relaxed">
              MindMate is designed for mindfulness and self-care. It does not replace professional therapy. In crisis situations, please reach out to the 988 Suicide & Crisis Lifeline immediately.
            </p>
            <button
              onClick={onEnterApp}
              className="w-full py-2.5 bg-white text-[#102F27] rounded-full text-xs font-bold hover:bg-[#F8F7F1] transition-colors"
            >
              Launch Sanctuary Demo
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9C7B2]">
          <span>© 2026 MindMate. All rights reserved.</span>
          <span>Crafted with 💚 for mental wellness and emotional presence.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
