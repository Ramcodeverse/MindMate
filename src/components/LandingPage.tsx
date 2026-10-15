import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Wind, 
  ArrowRight, 
  Smile, 
  Lock, 
  Volume2, 
  ChevronDown, 
  ChevronUp,
  Compass,
  Users
} from 'lucide-react';
import { calmAudio } from '../utils/audio';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleSoundscape = () => {
    const playing = calmAudio.toggleAmbientSound();
    setIsPlayingAudio(playing);
  };

  const faqs = [
    {
      q: 'How does MindMate protect my personal journal and mood records?',
      a: 'Your reflections are private. All data is scoped to your account with resource-level authorization. When you reflect with the AI companion, you control whether your recent mood or habits are shared as context, and your data is never used to train public language models.'
    },
    {
      q: 'Is the AI Companion a substitute for professional mental health therapy?',
      a: 'No. MindMate is designed as a daily wellness and reflection companion to assist with mindfulness, gentle reframing, and habit tracking. It does not provide medical diagnoses, treatment plans, or clinical therapy. If you are experiencing a crisis, we provide immediate 24/7 crisis hotlines including the 988 Lifeline.'
    },
    {
      q: 'Can I export my personal data at any time?',
      a: 'Yes! Under your profile settings, you can download a complete, unencrypted JSON archive of all your moods, journals, and habit histories with a single click.'
    },
    {
      q: 'Does MindMate work offline or without external services?',
      a: 'Yes! The entire wellness suite—mood tracking, habits, journaling, calendar, breathing exercises, and ambient audio—functions completely offline with local storage and built-in Web Audio synthesis.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#142E1F] p-2 sm:p-4 lg:p-6 text-[#142E1F] selection:bg-[#EDF4EF]">
      {/* Outer framing container creating the curated device / architectural border shown in Image 1 */}
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#FAFCF9] shadow-2xl border border-white/20">
        
        {/* HERO SECTION WITH NATURE BACKGROUND (Matching Image 1 & Image 2 panel 01) */}
        <div className="relative min-h-[92vh] flex flex-col justify-between">
          {/* Nature Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/nature_misty_mountain_lake_1792066034905.jpg"
              alt="Misty mountain lake with pine trees at sunrise"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Soft ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAFCF9]/85 via-[#FAFCF9]/55 to-[#FAFCF9]/95" />
          </div>

          {/* Floating Pill Header (Top Bar Contract) */}
          <header className="relative z-20 pt-6 px-4 sm:px-8 max-w-7xl mx-auto w-full">
            <div className="glass-pill rounded-full px-5 py-3 flex items-center justify-between gap-6 shadow-sm border border-white/70">
              {/* Brand */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#1F3D2B] text-white flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-white text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif-display text-lg font-bold tracking-tight text-[#142E1F] leading-none">
                    MINDMATE
                  </span>
                  <span className="text-[9px] tracking-widest text-[#4A6B56] uppercase font-semibold">
                    Wellness
                  </span>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#3D5C49]">
                <a href="#home" className="text-[#142E1F] border-b-2 border-[#1F3D2B] pb-0.5">Home</a>
                <a href="#features" className="hover:text-[#142E1F] transition-colors">Features</a>
                <a href="#habits" className="hover:text-[#142E1F] transition-colors">Habits</a>
                <a href="#reflection" className="hover:text-[#142E1F] transition-colors">AI Companion</a>
                <a href="#privacy" className="hover:text-[#142E1F] transition-colors">Privacy</a>
                <a href="#faq" className="hover:text-[#142E1F] transition-colors">FAQ</a>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleSoundscape}
                  title={isPlayingAudio ? 'Mute soundscape' : 'Play ambient soundscape'}
                  className={`p-2 rounded-full border transition-colors ${
                    isPlayingAudio 
                      ? 'bg-[#1F3D2B] text-white border-[#1F3D2B]' 
                      : 'bg-white/80 text-[#3D5C49] border-white/60 hover:bg-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-[#1F3D2B] hover:text-black transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={onEnterApp}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1F3D2B] rounded-full hover:bg-[#142E1F] shadow-sm transition-all inline-flex items-center gap-1.5"
                >
                  <span>Start your journey</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>

          {/* Hero Content Center */}
          <div className="relative z-10 px-4 sm:px-8 py-12 max-w-5xl mx-auto text-center flex flex-col items-center justify-center space-y-6">
            {/* Social Proof Pill (Image 1 reference) */}
            <div className="glass-pill px-3.5 py-1.5 rounded-full inline-flex items-center gap-2.5 text-xs font-semibold text-[#2D5A46] shadow-xs">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-[#2C5E43] text-white text-[9px] flex items-center justify-center font-bold">S</div>
                <div className="w-5 h-5 rounded-full bg-[#1F3D2B] text-white text-[9px] flex items-center justify-center font-bold">M</div>
                <div className="w-5 h-5 rounded-full bg-[#3B7258] text-white text-[9px] flex items-center justify-center font-bold">A</div>
              </div>
              <span>10,000+ people found their calm</span>
            </div>

            {/* Serif Display Headline */}
            <div className="space-y-1">
              <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#142E1F] leading-[1.08]">
                Find balance.
              </h1>
              <h2 className="font-serif-display italic text-4xl sm:text-6xl lg:text-7xl text-[#2C5E43] leading-[1.08]">
                Live with intention.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#3D5C49] max-w-xl mx-auto leading-relaxed font-medium">
              Designed with nature at its core, MindMate helps you reconnect with serenity and create mindful moments in your everyday life.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onEnterApp}
                className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#1F3D2B] hover:bg-[#142E1F] rounded-full shadow-md transition-all inline-flex items-center gap-2 group"
              >
                <span>Start your journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onOpenAuth}
                className="glass-pill px-6 py-3 text-xs sm:text-sm font-semibold text-[#1F3D2B] hover:bg-white rounded-full shadow-xs transition-colors"
              >
                Explore MindMate
              </button>
            </div>

            {/* Floating Live Product Preview Widgets (Matching Image 2 Panel 01) */}
            <div className="w-full pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto">
              {/* Widget 1: Mood Today */}
              <div className="glass-panel p-4 rounded-2xl border border-white/60 shadow-sm space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3D5C49] block">
                  Mood Today
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl" title="Calm">😊</span>
                  <span className="text-2xl" title="Balanced">😐</span>
                  <span className="text-2xl" title="Tired">😴</span>
                  <span className="text-2xl" title="Joyful">😄</span>
                </div>
                <p className="text-[11px] text-[#4A6B56] pt-1">How are you feeling?</p>
              </div>

              {/* Widget 2: Weekly Habits */}
              <div className="glass-panel p-4 rounded-2xl border border-white/60 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#3D5C49]">
                  <span className="uppercase tracking-wider">Weekly Habits</span>
                  <span className="text-[#1F3D2B]">4/7</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-[#142E1F]">
                    <span>Meditate</span>
                    <span className="font-semibold text-[#2C5E43]">4/7</span>
                  </div>
                  <div className="w-full bg-stone-200/70 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1F3D2B] h-full rounded-full w-[60%]" />
                  </div>
                  <div className="flex items-center justify-between text-[#142E1F] pt-0.5">
                    <span>Exercise</span>
                    <span className="font-semibold text-[#2C5E43]">5/7</span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Journal */}
              <div className="glass-panel p-4 rounded-2xl border border-white/60 shadow-sm space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#3D5C49] block">
                  Journal
                </span>
                <p className="text-xs font-semibold text-[#142E1F] line-clamp-2">
                  "A new day, a fresh perspective. Quiet tea in the morning sun."
                </p>
                <span className="text-[10px] text-[#5C7A6D] block pt-1">Today, 10:24 AM</span>
              </div>

              {/* Widget 4: AI Companion */}
              <div className="glass-panel p-4 rounded-2xl border border-white/60 shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3D5C49]">
                  <Sparkles className="w-3.5 h-3.5 text-[#2C5E43]" />
                  <span>AI Companion</span>
                </div>
                <p className="text-xs font-semibold text-[#142E1F]">
                  "You're doing better than you think. Take a deep, gentle breath. 🌿"
                </p>
                <span className="text-[10px] text-[#5C7A6D] block pt-1">Active listening</span>
              </div>
            </div>
          </div>

          {/* Bottom Floating Glass Feature Strip (Image 1 reference) */}
          <div className="relative z-20 pb-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 border border-white/60 shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142E1F]">Nature Inspired</h4>
                  <p className="text-[11px] text-[#4A6B56]">Rooted in calm to restore inner balance.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center shrink-0">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142E1F]">Mindful Living</h4>
                  <p className="text-[11px] text-[#4A6B56]">Simple practices for everyday well-being.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142E1F]">Community Driven</h4>
                  <p className="text-[11px] text-[#4A6B56]">A safe, supportive space that uplifts you.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#142E1F]">Lasting Impact</h4>
                  <p className="text-[11px] text-[#4A6B56]">Create meaningful change within and around you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 02: FEATURES TOOLKIT (Matching Image 2 Panel 02) */}
        <section id="features" className="py-24 px-6 lg:px-12 bg-white border-t border-[#E8ECE6]">
          <div className="max-w-6xl mx-auto space-y-16 text-center">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2C5E43] block">
                WHY MINDMATE
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#142E1F]">
                A complete wellness toolkit for a healthier you.
              </h2>
              <p className="text-sm text-[#4A6B56]">
                Everything you need to understand, support, and improve your mental well-being — in one beautiful place.
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {/* Card 1 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <Smile className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">Mood Tracking</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Check in with your emotions daily, note energy levels, and spot emotional patterns over weeks.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">Journaling</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Capture thoughts freely in a private, distraction-free editor with live autosave and public privacy blur.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">Habit Building</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Build supportive daily anchors like hydration, walking, and meditation with streak calculations.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">Calendar & Insights</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Inspect your holistic monthly calendar to view mood check-ins, habit milestones, and reflections.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">AI Companion</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Receive empathetic active listening and gentle reframing powered by server-side Gemini 3.8 Flash.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-8 rounded-3xl bg-[#FAFCF9] border border-[#E5ECE7] hover:border-[#2C5E43]/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4EF] text-[#1F3D2B] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#142E1F]">Privacy First</h3>
                <p className="text-xs text-[#4A6B56] leading-relaxed">
                  Your data is strictly yours. Enjoy 1-click full JSON export and permanent cascade account purge anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03: PRIVACY & RESPONSIBLE AI PLEDGE */}
        <section id="privacy" className="py-20 px-6 lg:px-12 bg-[#EDF4EF]/50 border-t border-[#E5ECE7]">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#1F3D2B]" />
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#142E1F]">
                Our Privacy & Responsible AI Pledge
              </h3>
            </div>
            <p className="text-sm text-[#3D5C49] leading-relaxed">
              MindMate is built with transparency and user sovereignty as first principles. Your mental health entries are private, encrypted, and isolated to your account.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-[#D8E4DC] space-y-2">
                <h4 className="font-bold text-xs text-[#142E1F]">Strict Resource Scoping</h4>
                <p className="text-xs text-[#4A6B56]">
                  All records, habits, and journals are strictly bound to your authenticated user identifier.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-[#D8E4DC] space-y-2">
                <h4 className="font-bold text-xs text-[#142E1F]">24/7 Crisis Resource Guarantee</h4>
                <p className="text-xs text-[#4A6B56]">
                  Immediate detection of self-harm phrases surfaces the 988 Suicide & Crisis Lifeline and text resources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: FAQ */}
        <section id="faq" className="py-20 px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5E43] block">
              CLARITY & TRUST
            </span>
            <h3 className="font-serif-display text-3xl font-bold text-[#142E1F] mt-1">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-[#DCE6DF] bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[#142E1F] text-sm"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#1F3D2B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#4A6B56] shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-[#4A6B56] leading-relaxed border-t border-[#F0F4F1]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 05: FOOTER (Matching Image 2 Panel 10) */}
        <footer className="relative bg-[#1F3D2B] text-white pt-16 pb-12 px-6 lg:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white text-[#1F3D2B] flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-[#1F3D2B]" />
                </div>
                <span className="font-serif-display text-xl font-bold tracking-tight">MindMate</span>
              </div>
              <p className="text-xs text-[#D5EAD9] leading-relaxed max-w-sm">
                Make space for how you feel. A personal wellness platform for mood tracking, journaling, habit building, and AI support.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#D5EAD9] pt-2">
                <a href="https://github.com/ramcodeverse/mindmate" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
                <a href="https://rams-portfolio-site.netlify.app" target="_blank" rel="noreferrer" className="hover:text-white">Portfolio</a>
                <span>MIT License</span>
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs">
              <span className="font-semibold text-white uppercase tracking-wider block mb-2">Product</span>
              <p><a href="#features" className="text-[#D5EAD9] hover:text-white">Dashboard</a></p>
              <p><a href="#features" className="text-[#D5EAD9] hover:text-white">Mood Rhythm</a></p>
              <p><a href="#features" className="text-[#D5EAD9] hover:text-white">Private Journal</a></p>
              <p><a href="#features" className="text-[#D5EAD9] hover:text-white">Habit Anchors</a></p>
              <p><a href="#reflection" className="text-[#D5EAD9] hover:text-white">AI Companion</a></p>
            </div>

            <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-3">
              <h4 className="font-serif-display text-lg font-bold text-white">Start your journey</h4>
              <p className="text-xs text-[#D5EAD9]">Your well-being matters. Experience the demo right now.</p>
              <button
                onClick={onEnterApp}
                className="w-full py-2.5 bg-white text-[#1F3D2B] rounded-full text-xs font-bold hover:bg-[#FAFCF9] transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A6CEB3]">
            <span>© 2026 MindMate. All rights reserved.</span>
            <span>Built with 💚 for better mental health.</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;
