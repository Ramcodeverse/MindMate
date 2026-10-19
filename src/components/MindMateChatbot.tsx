import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flower2,
  RotateCcw,
  ShieldCheck,
  MessageSquare,
  SlidersHorizontal,
  Edit3,
  X
} from 'lucide-react';
import { User } from '../types';

export interface MindMateChatbotProps {
  user: User | null;
  primaryEmotion: string;
  secondaryEmotion?: string;
  energyLevel: number;
  stressLevel: number;
  primaryIntention: string;
  secondaryIntentions: string[];
  personalNote: string;
  responseLanguage: string;
  preferredMusicLanguages: string[];
  preferredMovieLanguages: string[];
  viewingRegion: string;

  // Form State and Setters
  kindOfDay: string;
  setKindOfDay: (v: string) => void;
  helpfulNow: string;
  setHelpfulNow: (v: string) => void;
  timeAvailable: string;
  setTimeAvailable: (v: string) => void;
  supportStyle: string;
  setSupportStyle: (v: string) => void;

  sessionResponseLanguage: string;
  setSessionResponseLanguage: (v: string) => void;
  sessionMusicLanguages: string[];
  setSessionMusicLanguages: (v: string[]) => void;
  sessionMovieLanguages: string[];
  setSessionMovieLanguages: (v: string[]) => void;
  contentToAvoid: string[];
  setContentToAvoid: (v: string[]) => void;
  avoidNote: string;
  setAvoidNote: (v: string) => void;

  musicSoundKind: string;
  setMusicSoundKind: (v: string) => void;
  listeningStyle: string;
  setListeningStyle: (v: string) => void;
  familiarVsDiscovery: string;
  setFamiliarVsDiscovery: (v: string) => void;
  musicIntensity: string;
  setMusicIntensity: (v: string) => void;
  musicSessionNotes: string;
  setMusicSessionNotes: (v: string) => void;

  movieExperience: string;
  setMovieExperience: (v: string) => void;
  movieDurationChoice: string;
  setMovieDurationChoice: (v: string) => void;
  viewingEnvironment: string;
  setViewingEnvironment: (v: string) => void;
  smallActivities: string[];
  setSmallActivities: (v: string[]) => void;
  effortLevel: string;
  setEffortLevel: (v: string) => void;
  practicalLimitations: string[];
  setPracticalLimitations: (v: string[]) => void;

  finalQuestion: string;
  setFinalQuestion: (v: string) => void;

  isSubmitting: boolean;
  onSubmit: () => void;
  onBackToStep2: () => void;
}

export type ChatSectionId = 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD' | 'finalQuestion';

export interface QuestionConfig {
  id: string;
  sectionId: ChatSectionId;
  sectionTitle: string;
  prompt: string;
  selectionType: 'single' | 'multiple' | 'text';
  options?: string[];
  hasOther?: boolean;
  otherPlaceholder?: string;
  hasOptionalNote?: boolean;
  optionalNoteLabel?: string;
  optionalNotePlaceholder?: string;
  placeholder?: string;
}

export const MindMateChatbot: React.FC<MindMateChatbotProps> = ({
  user,
  primaryEmotion,
  secondaryEmotion,
  energyLevel,
  stressLevel,
  primaryIntention,
  secondaryIntentions,
  personalNote,
  responseLanguage,
  preferredMusicLanguages,
  preferredMovieLanguages,
  viewingRegion,

  kindOfDay,
  setKindOfDay,
  helpfulNow,
  setHelpfulNow,
  timeAvailable,
  setTimeAvailable,
  supportStyle,
  setSupportStyle,

  sessionResponseLanguage,
  setSessionResponseLanguage,
  sessionMusicLanguages,
  setSessionMusicLanguages,
  sessionMovieLanguages,
  setSessionMovieLanguages,
  contentToAvoid,
  setContentToAvoid,
  avoidNote,
  setAvoidNote,

  musicSoundKind,
  setMusicSoundKind,
  listeningStyle,
  setListeningStyle,
  familiarVsDiscovery,
  setFamiliarVsDiscovery,
  musicIntensity,
  setMusicIntensity,
  musicSessionNotes,
  setMusicSessionNotes,

  movieExperience,
  setMovieExperience,
  movieDurationChoice,
  setMovieDurationChoice,
  viewingEnvironment,
  setViewingEnvironment,
  smallActivities,
  setSmallActivities,
  effortLevel,
  setEffortLevel,
  practicalLimitations,
  setPracticalLimitations,

  finalQuestion,
  setFinalQuestion,

  isSubmitting,
  onSubmit,
  onBackToStep2,
}) => {
  // Questions configuration strictly following user specification
  const questions: QuestionConfig[] = [
    // Section A
    {
      id: 'A1',
      sectionId: 'sectionA',
      sectionTitle: "Today's Situation",
      prompt: "What best describes the kind of day you've had?",
      selectionType: 'single',
      options: [
        'Busy or demanding',
        'Work or studies',
        'Physically tiring',
        'Social and active',
        'Quiet and peaceful',
        'Emotionally difficult',
        'A celebration or positive event',
        'Something else',
        'Prefer not to say'
      ],
      hasOther: true,
      otherPlaceholder: "Anything you'd like to add?"
    },
    {
      id: 'A2',
      sectionId: 'sectionA',
      sectionTitle: "Today's Situation",
      prompt: "What would feel most helpful right now?",
      selectionType: 'single',
      options: [
        'Something soothing',
        'A little positive energy',
        'A comforting experience',
        'A distraction or laugh',
        'An engaging challenge',
        'A quiet moment alone',
        'Help getting started with a task'
      ]
    },
    {
      id: 'A3',
      sectionId: 'sectionA',
      sectionTitle: "Today's Situation",
      prompt: "How much time do you have for yourself right now?",
      selectionType: 'single',
      options: [
        '2–5 minutes',
        '5–10 minutes',
        '10–20 minutes',
        '20–45 minutes',
        'More than 45 minutes'
      ]
    },
    {
      id: 'A4',
      sectionId: 'sectionA',
      sectionTitle: "Today's Situation",
      prompt: "How would you like me to help today?",
      selectionType: 'single',
      options: [
        'Keep it simple',
        'Suggest one small practical action',
        'Give me a structured plan',
        'Offer a few alternatives',
        'Let me explore independently'
      ]
    },

    // Section B
    {
      id: 'B1',
      sectionId: 'sectionB',
      sectionTitle: "Language & Comfort",
      prompt: "Which language would you prefer for today's recommendations and explanations?",
      selectionType: 'single',
      options: [
        'Telugu',
        'English',
        'Hindi',
        'Tamil',
        'Kannada',
        'Malayalam',
        'Bengali',
        'Marathi',
        'Other'
      ],
      hasOther: true,
      otherPlaceholder: "Enter your preferred language..."
    },
    {
      id: 'B2',
      sectionId: 'sectionB',
      sectionTitle: "Language & Comfort",
      prompt: "Which languages would you enjoy hearing in today's music?",
      selectionType: 'multiple',
      options: [
        'English',
        'Telugu',
        'Hindi',
        'Tamil',
        'Kannada',
        'Malayalam',
        'Multiple languages',
        'Other'
      ],
      hasOther: true,
      otherPlaceholder: "Enter other music language..."
    },
    {
      id: 'B3',
      sectionId: 'sectionB',
      sectionTitle: "Language & Comfort",
      prompt: "Which languages are you comfortable watching movies in today?",
      selectionType: 'multiple',
      options: [
        'English',
        'Telugu',
        'Hindi',
        'Tamil',
        'Kannada',
        'Malayalam',
        'Bengali',
        'Marathi',
        'Other'
      ],
      hasOther: true,
      otherPlaceholder: "Enter other movie language..."
    },
    {
      id: 'B4',
      sectionId: 'sectionB',
      sectionTitle: "Language & Comfort",
      prompt: "Is there anything you'd prefer me to avoid in today's recommendations?",
      selectionType: 'multiple',
      options: [
        'Intense violence',
        'Scary or disturbing material',
        'Heavy or tragic themes',
        'Explicit content',
        'Loud or intense music',
        'No specific restrictions',
        'Other'
      ],
      hasOther: true,
      otherPlaceholder: "Anything else you'd prefer to avoid? (Optional)",
      hasOptionalNote: true,
      optionalNoteLabel: "Optional note about today's content preferences",
      optionalNotePlaceholder: "e.g., I'd prefer fewer sudden loud noises or heavy emotional themes."
    },

    // Section C
    {
      id: 'C1',
      sectionId: 'sectionC',
      sectionTitle: "Music Discovery",
      prompt: "What kind of sound would fit you right now?",
      selectionType: 'single',
      options: [
        'Gentle and calming',
        'Warm and comforting',
        'Light and cheerful',
        'Motivating and rhythmic',
        'Deeply reflective',
        'Instrumental and focused',
        'Energetic and expressive',
        'Surprise me'
      ]
    },
    {
      id: 'C2',
      sectionId: 'sectionC',
      sectionTitle: "Music Discovery",
      prompt: "What would you prefer to hear?",
      selectionType: 'single',
      options: [
        'Mainly vocals',
        'Instrumental',
        'A mixture of both',
        'No preference'
      ]
    },
    {
      id: 'C3',
      sectionId: 'sectionC',
      sectionTitle: "Music Discovery",
      prompt: "Would you rather revisit familiar favourites or discover something new?",
      selectionType: 'single',
      options: [
        'Familiar and comforting',
        'New discoveries',
        'A balance of both'
      ]
    },
    {
      id: 'C4',
      sectionId: 'sectionC',
      sectionTitle: "Music Discovery",
      prompt: "How energetic should the music feel today?",
      selectionType: 'single',
      options: [
        'Very gentle',
        'Soft and steady',
        'Balanced',
        'Upbeat',
        'Powerful and energetic'
      ]
    },
    {
      id: 'C5',
      sectionId: 'sectionC',
      sectionTitle: "Music Discovery",
      prompt: "Any artists, songs, instruments, or sounds you'd particularly like—or prefer to avoid?",
      selectionType: 'text',
      placeholder: "e.g., Acoustic guitar, gentle piano, favourite artists, or no heavy drums."
    },

    // Section D
    {
      id: 'D1',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "What kind of movie experience would you enjoy today?",
      selectionType: 'single',
      options: [
        'Heartwarming',
        'Whimsical comedy',
        'Gentle animation',
        'Thoughtful drama',
        'Nature or travel documentary',
        'Inspiring journey',
        'Light adventure',
        'Mystery or suspense',
        'Something familiar',
        'Surprise me'
      ]
    },
    {
      id: 'D2',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "How long would you like your movie or viewing experience to be?",
      selectionType: 'single',
      options: [
        'A short film or episode',
        'Under 90 minutes',
        'Around 90–120 minutes',
        'Longer than 120 minutes',
        'No preference'
      ]
    },
    {
      id: 'D3',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "How will you most likely be watching?",
      selectionType: 'single',
      options: [
        'Watching alone',
        'Watching with family',
        'Watching with friends',
        'No preference'
      ]
    },
    {
      id: 'D4',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "Which small activities would you be open to today?",
      selectionType: 'multiple',
      options: [
        'Gentle stretching',
        'A short walk',
        'A simple breathing exercise',
        'Quiet reflection',
        'Journaling',
        'Listening to calming music',
        'Drinking water and taking a screen break',
        'Tidying a small space',
        'A short creative activity',
        'Resting without any task'
      ]
    },
    {
      id: 'D5',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "How much effort would you like today's activity to require?",
      selectionType: 'single',
      options: [
        'Almost none',
        'Very gentle',
        'Moderate',
        'Something active'
      ]
    },
    {
      id: 'D6',
      sectionId: 'sectionD',
      sectionTitle: "Cinema & Activities",
      prompt: "Anything I should consider to make the activity easier for you?",
      selectionType: 'multiple',
      options: [
        'Indoor only',
        'Outdoor is fine',
        'Limited space',
        'No equipment',
        'Limited time',
        'Prefer seated activities',
        'No additional limitations',
        'Other'
      ],
      hasOther: true,
      otherPlaceholder: "Any other limitations? (Optional)"
    }
  ];

  // Current active question index (0 to 18)
  // 19 corresponds to the Final Screen ("Anything else on your mind?")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  // Whether user is viewing the review modal/panel
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  // Restart confirmation modal
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);

  // Local text input buffers for Other/Optional notes
  const [otherTextMap, setOtherTextMap] = useState<Record<string, string>>({});
  const [showAvoidNoteExpand, setShowAvoidNoteExpand] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when question advances or message is updated
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestionIndex, isReviewMode]);

  // Section intros
  const sectionIntros: Record<ChatSectionId, string> = {
    sectionA: "Let's start with your day. You can share as much or as little as you feel comfortable with.",
    sectionB: "I want the suggestions to feel familiar, comfortable, and easy for you to enjoy.",
    sectionC: "Let's find a sound that feels right for you today, whether that's something soothing or something new.",
    sectionD: "Let's choose a viewing experience and an activity that fit the time and energy you have.",
    finalQuestion: "We've covered the basics. Is there anything else you'd like me to consider, or a question you'd like help with today?"
  };

  // Helper to get current answer for a question
  const getQuestionAnswer = (qId: string): string | string[] => {
    switch (qId) {
      case 'A1': return kindOfDay;
      case 'A2': return helpfulNow;
      case 'A3': return timeAvailable;
      case 'A4': return supportStyle;
      case 'B1': return sessionResponseLanguage;
      case 'B2': return sessionMusicLanguages;
      case 'B3': return sessionMovieLanguages;
      case 'B4': return contentToAvoid;
      case 'C1': return musicSoundKind;
      case 'C2': return listeningStyle;
      case 'C3': return familiarVsDiscovery;
      case 'C4': return musicIntensity;
      case 'C5': return musicSessionNotes;
      case 'D1': return movieExperience;
      case 'D2': return movieDurationChoice;
      case 'D3': return viewingEnvironment;
      case 'D4': return smallActivities;
      case 'D5': return effortLevel;
      case 'D6': return practicalLimitations;
      default: return '';
    }
  };

  // Helper to set question answer
  const handleSelectOption = (q: QuestionConfig, opt: string) => {
    if (q.selectionType === 'single') {
      switch (q.id) {
        case 'A1': setKindOfDay(opt); break;
        case 'A2': setHelpfulNow(opt); break;
        case 'A3': setTimeAvailable(opt); break;
        case 'A4': setSupportStyle(opt); break;
        case 'B1': setSessionResponseLanguage(opt); break;
        case 'C1': setMusicSoundKind(opt); break;
        case 'C2': setListeningStyle(opt); break;
        case 'C3': setFamiliarVsDiscovery(opt); break;
        case 'C4': setMusicIntensity(opt); break;
        case 'D1': setMovieExperience(opt); break;
        case 'D2': setMovieDurationChoice(opt); break;
        case 'D3': setViewingEnvironment(opt); break;
        case 'D5': setEffortLevel(opt); break;
      }
    } else if (q.selectionType === 'multiple') {
      switch (q.id) {
        case 'B2': {
          const exists = sessionMusicLanguages.includes(opt);
          setSessionMusicLanguages(
            exists
              ? (sessionMusicLanguages.length > 1 ? sessionMusicLanguages.filter(x => x !== opt) : sessionMusicLanguages)
              : [...sessionMusicLanguages, opt]
          );
          break;
        }
        case 'B3': {
          const exists = sessionMovieLanguages.includes(opt);
          setSessionMovieLanguages(
            exists
              ? (sessionMovieLanguages.length > 1 ? sessionMovieLanguages.filter(x => x !== opt) : sessionMovieLanguages)
              : [...sessionMovieLanguages, opt]
          );
          break;
        }
        case 'B4': {
          if (opt === 'No specific restrictions') {
            setContentToAvoid(['No specific restrictions']);
          } else {
            const withoutNone = contentToAvoid.filter(x => x !== 'No specific restrictions');
            if (contentToAvoid.includes(opt)) {
              setContentToAvoid(withoutNone.filter(x => x !== opt));
            } else {
              setContentToAvoid([...withoutNone, opt]);
            }
          }
          break;
        }
        case 'D4': {
          if (opt === 'Resting without any task') {
            setSmallActivities(['Resting without any task']);
          } else {
            const withoutRest = smallActivities.filter(x => x !== 'Resting without any task');
            if (smallActivities.includes(opt)) {
              setSmallActivities(withoutRest.filter(x => x !== opt));
            } else {
              setSmallActivities([...withoutRest, opt]);
            }
          }
          break;
        }
        case 'D6': {
          if (opt === 'No additional limitations') {
            setPracticalLimitations(['No additional limitations']);
          } else {
            const withoutNone = practicalLimitations.filter(x => x !== 'No additional limitations');
            if (practicalLimitations.includes(opt)) {
              setPracticalLimitations(withoutNone.filter(x => x !== opt));
            } else {
              setPracticalLimitations([...withoutNone, opt]);
            }
          }
          break;
        }
      }
    }
  };

  // Advance to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Back to previous question
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBackToStep2();
    }
  };

  // Jump to specific question (e.g. from Review or edit pill)
  const jumpToQuestion = (index: number) => {
    setIsReviewMode(false);
    setCurrentQuestionIndex(index);
  };

  // Current active question
  const currentQ = questions[currentQuestionIndex];
  const isFinalScreen = currentQuestionIndex >= questions.length;

  // Determine current active section
  const currentSectionId: ChatSectionId = isFinalScreen
    ? 'finalQuestion'
    : currentQ.sectionId;

  // Section progress stats
  const sectionList: Array<{ id: ChatSectionId; title: string; num: string }> = [
    { id: 'sectionA', title: "Today's Situation", num: 'A' },
    { id: 'sectionB', title: 'Language & Comfort', num: 'B' },
    { id: 'sectionC', title: 'Music Discovery', num: 'C' },
    { id: 'sectionD', title: 'Cinema & Activities', num: 'D' },
    { id: 'finalQuestion', title: 'Final AI Question', num: 'E' },
  ];

  const getSectionIndex = (sec: ChatSectionId) => {
    return sectionList.findIndex(s => s.id === sec);
  };

  const isSectionComplete = (sec: ChatSectionId) => {
    const curIdx = getSectionIndex(currentSectionId);
    const targetIdx = getSectionIndex(sec);
    return curIdx > targetIdx;
  };

  // Format answer string for user bubbles
  const renderAnswerText = (val: string | string[]) => {
    if (Array.isArray(val)) {
      if (val.length === 0) return 'None specified';
      return val.join(', ');
    }
    return val || 'Skipped';
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E1EAF1] p-5 sm:p-8 md:p-10 shadow-2xs space-y-6 animate-fade-in relative">
      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#E1EAF1] space-y-4 animate-fade-in">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#173247]">
              Restart questionnaire?
            </h3>
            <p className="text-xs text-[#71839A] leading-relaxed">
              This will reset your conversation answers to default preferences and restart from question 1. Your mood and long-term profile will not be affected.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRestartModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E1EAF1] text-xs font-semibold text-[#71839A] hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRestartModal(false);
                  setCurrentQuestionIndex(0);
                  setIsReviewMode(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
              >
                Restart From Step 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#F0F4F8] gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#147561]">
            <MessageSquare className="w-4 h-4 text-[#147561]" />
            <span>STEP 3 OF 6 · MINDMATE CONVERSATION</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173247] tracking-tight">
            Let's understand what would help you today
          </h1>
          <p className="text-xs text-[#71839A] max-w-2xl leading-relaxed">
            Let's take this one step at a time. Choose the answers that feel right for you, and you can add anything else at the end.
          </p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-[#10594E] uppercase tracking-wider bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#147561]/20">
            Phase 03 · Ready to personalize
          </span>
          <span className="text-[11px] text-[#71839A] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            No Gemini API calls yet (Local)
          </span>
        </div>
      </div>

      {/* Compact Section Progress Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#F0F4F8]">
        {sectionList.map((sec) => {
          const isActive = currentSectionId === sec.id;
          const isDone = isSectionComplete(sec.id);
          // Find first question index of this section
          const targetIndex = sec.id === 'finalQuestion'
            ? questions.length
            : questions.findIndex(q => q.sectionId === sec.id);

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setIsReviewMode(false);
                if (targetIndex !== -1) {
                  setCurrentQuestionIndex(targetIndex);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#147561] text-white shadow-2xs font-bold ring-2 ring-[#147561]/20'
                  : isDone
                    ? 'bg-[#E8F5EF] text-[#10594E] hover:bg-[#D8EDE2]'
                    : 'bg-[#F7FAFC] text-[#71839A] hover:bg-[#E8F5EF]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : isDone ? 'bg-[#147561] text-white' : 'bg-[#E1EAF1] text-[#71839A]'
              }`}>
                {isDone ? <Check className="w-3 h-3 text-white" /> : sec.num}
              </span>
              <span>{sec.title}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsReviewMode(true)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            isReviewMode
              ? 'bg-[#173247] text-white shadow-2xs'
              : 'bg-stone-100 text-[#173247] hover:bg-stone-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Review Answers</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* REVIEW ANSWERS SCREEN                                                     */}
      {/* ========================================================================= */}
      {isReviewMode ? (
        <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F7]">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173247]">
                Session Questionnaire Review
              </h2>
              <p className="text-xs text-[#71839A]">
                Review all your conversational responses before generating your MindMate plan. Click edit on any section to jump directly back to that question.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewMode(false)}
              className="p-2 rounded-xl border border-[#E1EAF1] text-xs font-semibold text-[#71839A] hover:bg-[#F7FAFC] flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Today's Mood (From Step 1) */}
            <div className="p-4 rounded-2xl bg-[#F7FAFC] border border-[#E1EAF1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#147561] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Flower2 className="w-3.5 h-3.5" />
                  <span>Today's Mood & Intention</span>
                </span>
                <span className="text-[10px] text-[#71839A]">From Step 1</span>
              </div>
              <div className="space-y-1 text-[#173247]">
                <div><strong>Primary Emotion:</strong> {primaryEmotion || 'Calm'}</div>
                {secondaryEmotion && <div><strong>Secondary Emotion:</strong> {secondaryEmotion}</div>}
                {secondaryIntentions.length > 0 && <div><strong>Secondary Intentions:</strong> {secondaryIntentions.join(', ')}</div>}
                <div><strong>Energy / Stress:</strong> {energyLevel}/10 Energy · {stressLevel}/10 Stress</div>
                <div><strong>Intended Outcome:</strong> {primaryIntention || 'Relax'}</div>
                {personalNote && <div><strong>Personal Note:</strong> "{personalNote}"</div>}
              </div>
            </div>

            {/* 2. Today's Context (Section A) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E1EAF1] space-y-2 relative group hover:border-[#147561] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#147561] uppercase tracking-wider text-[11px]">
                  A. Today's Situation
                </span>
                <button
                  type="button"
                  onClick={() => jumpToQuestion(0)}
                  className="text-xs font-bold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-1 text-[#173247]">
                <div><strong>Kind of day:</strong> {kindOfDay}</div>
                <div><strong>Most helpful:</strong> {helpfulNow}</div>
                <div><strong>Available time:</strong> {timeAvailable}</div>
                <div><strong>Support style:</strong> {supportStyle}</div>
              </div>
            </div>

            {/* 3. Language & Comfort (Section B) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E1EAF1] space-y-2 relative group hover:border-[#147561] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#147561] uppercase tracking-wider text-[11px]">
                  B. Language & Comfort
                </span>
                <button
                  type="button"
                  onClick={() => jumpToQuestion(4)}
                  className="text-xs font-bold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-1 text-[#173247]">
                <div><strong>Response language:</strong> {sessionResponseLanguage} (Saved: {responseLanguage})</div>
                <div><strong>Song languages:</strong> {sessionMusicLanguages.join(', ')} (Saved: {preferredMusicLanguages.join(', ')})</div>
                <div><strong>Movie languages:</strong> {sessionMovieLanguages.join(', ')} (Saved: {preferredMovieLanguages.join(', ')})</div>
                <div><strong>Viewing region:</strong> {viewingRegion}</div>
                <div><strong>Content exclusions:</strong> {contentToAvoid.join(', ') || 'None'}</div>
                {avoidNote && <div><strong>Exclusion note:</strong> "{avoidNote}"</div>}
              </div>
            </div>

            {/* 4. Music Discovery (Section C) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E1EAF1] space-y-2 relative group hover:border-[#147561] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#147561] uppercase tracking-wider text-[11px]">
                  C. Music Discovery
                </span>
                <button
                  type="button"
                  onClick={() => jumpToQuestion(8)}
                  className="text-xs font-bold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="space-y-1 text-[#173247]">
                <div><strong>Preferred sound:</strong> {musicSoundKind}</div>
                <div><strong>Listening style:</strong> {listeningStyle}</div>
                <div><strong>Familiarity:</strong> {familiarVsDiscovery}</div>
                <div><strong>Musical intensity:</strong> {musicIntensity}</div>
                {musicSessionNotes && <div><strong>Details/Notes:</strong> "{musicSessionNotes}"</div>}
              </div>
            </div>

            {/* 5. Cinema & Activities (Section D) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E1EAF1] space-y-2 md:col-span-2 relative group hover:border-[#147561] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#147561] uppercase tracking-wider text-[11px]">
                  D. Cinema, Habits & Restorative Activities
                </span>
                <button
                  type="button"
                  onClick={() => jumpToQuestion(13)}
                  className="text-xs font-bold text-[#176B57] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#173247]">
                <div><strong>Movie atmosphere:</strong> {movieExperience}</div>
                <div><strong>Movie duration:</strong> {movieDurationChoice}</div>
                <div><strong>Viewing environment:</strong> {viewingEnvironment}</div>
                <div><strong>Desired effort:</strong> {effortLevel}</div>
                <div className="sm:col-span-2"><strong>Open activities:</strong> {smallActivities.join(', ') || 'Resting without any task'}</div>
                <div className="sm:col-span-2"><strong>Practical limitations:</strong> {practicalLimitations.join(', ') || 'No additional limitations'}</div>
              </div>
            </div>

            {/* 6. Final Question */}
            <div className="p-4 rounded-2xl bg-[#E8F5EF] border border-[#147561]/20 space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10594E] uppercase tracking-wider text-[11px]">
                  Optional Question for Gemini
                </span>
                <button
                  type="button"
                  onClick={() => jumpToQuestion(questions.length)}
                  className="text-xs font-bold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-xs text-[#173247] italic">
                {finalQuestion ? `"${finalQuestion}"` : 'None provided (will be skipped cleanly in recommendations).'}
              </p>
            </div>
          </div>

          {/* Bottom Bar in Review Screen */}
          <div className="p-5 rounded-2xl bg-[#F7FAFC] border border-[#E1EAF1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm text-[#173247]">
                Everything is ready for your personalized plan.
              </div>
              <p className="text-[11px] text-[#71839A]">
                MindMate will synthesize this conversation, your mood, and profile in 1 single Gemini request.
              </p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmit}
              className="w-full sm:w-auto bg-[#147561] hover:bg-[#10594E] disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Generate My MindMate Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* INTERACTIVE CHATBOT VIEW (ONE QUESTION AT A TIME)                         */
        /* ========================================================================= */
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Central Chat Stream */}
          <div 
            ref={chatScrollContainerRef}
            className="space-y-5 min-h-[380px] max-h-[620px] overflow-y-auto px-1 sm:px-2 py-2 scrollbar-thin scrollbar-thumb-stone-200"
          >
            {/* Initial Welcome Bubble */}
            <div className="flex items-start gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-[#147561] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Flower2 className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-[#E8F5EF] border border-[#147561]/15 text-xs sm:text-sm text-[#173247] max-w-[85%] leading-relaxed shadow-2xs">
                <p className="font-semibold mb-1 text-[#10594E]">
                  Welcome to your check-in conversation{user?.name ? `, ${user.name}` : ''}!
                </p>
                <p>
                  I'm here to listen and help you choose the right wellness pacing, movies, and music for tonight. Let's walk through a few friendly questions together.
                </p>
              </div>
            </div>

            {/* Conversation History: Render all completed questions up to currentQuestionIndex */}
            {questions.slice(0, currentQuestionIndex).map((q, idx) => {
              const ans = getQuestionAnswer(q.id);
              const isSectionStart = idx === 0 || questions[idx - 1].sectionId !== q.sectionId;

              return (
                <div key={q.id} className="space-y-3 animate-fade-in">
                  {/* Section intro header if first question of a new section */}
                  {isSectionStart && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-px bg-[#E1EAF1] flex-1" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#147561] bg-[#E8F5EF] px-3 py-0.5 rounded-full border border-[#147561]/20">
                        {q.sectionTitle}
                      </span>
                      <div className="h-px bg-[#E1EAF1] flex-1" />
                    </div>
                  )}

                  {/* Bot Question Bubble */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#147561] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Flower2 className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-xs bg-[#E8F5EF] border border-[#147561]/15 text-xs sm:text-sm text-[#173247] max-w-[85%] leading-relaxed shadow-2xs">
                      {q.prompt}
                    </div>
                  </div>

                  {/* User Answer Bubble (Aligned right) */}
                  <div className="flex items-end justify-end gap-2 group">
                    <button
                      type="button"
                      onClick={() => jumpToQuestion(idx)}
                      title="Edit this answer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-xs text-[#71839A] hover:text-[#147561] hover:bg-stone-100 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-xs bg-[#147561] text-white text-xs sm:text-sm max-w-[80%] shadow-2xs leading-relaxed">
                      <div className="font-medium">
                        {renderAnswerText(ans)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Current Active Question or Final Screen */}
            {!isFinalScreen && currentQ && (
              <div className="space-y-4 pt-1 animate-fade-in">
                {/* Section header if starting a section */}
                {(currentQuestionIndex === 0 || questions[currentQuestionIndex - 1].sectionId !== currentQ.sectionId) && (
                  <div className="space-y-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-[#E1EAF1] flex-1" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#147561] bg-[#E8F5EF] px-3 py-0.5 rounded-full border border-[#147561]/20">
                        {currentQ.sectionTitle}
                      </span>
                      <div className="h-px bg-[#E1EAF1] flex-1" />
                    </div>
                    {sectionIntros[currentQ.sectionId] && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#147561] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          <Flower2 className="w-4 h-4" />
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#F7FAFC] border border-[#E1EAF1] text-xs text-[#71839A] italic max-w-[85%]">
                          {sectionIntros[currentQ.sectionId]}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bot Question Prompt */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#147561] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Flower2 className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-[#E8F5EF] border border-[#147561]/20 text-xs sm:text-sm text-[#173247] max-w-[88%] font-medium leading-relaxed shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#147561] block mb-1">
                      Question {currentQuestionIndex + 1} of {questions.length} · {currentQ.selectionType === 'multiple' ? 'Select All That Apply' : 'Choose One'}
                    </span>
                    {currentQ.prompt}
                  </div>
                </div>

                {/* Answer Options Container */}
                <div className="pl-11 pr-2 space-y-3">
                  {/* Single & Multiple Choice Options Grid */}
                  {currentQ.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {currentQ.options.map((opt) => {
                        const curAns = getQuestionAnswer(currentQ.id);
                        const isSelected = Array.isArray(curAns)
                          ? curAns.includes(opt)
                          : curAns === opt;

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectOption(currentQ, opt)}
                            className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#E8F5EF] border-[#147561] text-[#10594E] font-bold shadow-2xs ring-2 ring-[#147561]/20 scale-[1.01]'
                                : 'bg-white border-[#E1EAF1] text-[#173247] hover:border-[#147561]/50 hover:bg-[#F9FBFA]'
                            }`}
                          >
                            <span className="leading-snug">{opt}</span>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected ? 'bg-[#147561] text-white font-bold' : 'border border-[#CBD5E1]'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Other Input if 'Other' or 'Something else' is selected */}
                  {currentQ.hasOther && (() => {
                    const ans = getQuestionAnswer(currentQ.id);
                    const isOtherActive = Array.isArray(ans)
                      ? ans.includes('Other') || ans.includes('Something else')
                      : ans === 'Other' || ans === 'Something else';

                    if (!isOtherActive) return null;

                    return (
                      <div className="p-3 bg-stone-50 rounded-xl border border-[#E1EAF1] space-y-1.5 animate-fade-in">
                        <label className="text-[11px] font-bold text-[#173247] block">
                          {currentQ.otherPlaceholder || "Please specify (optional):"}
                        </label>
                        <input
                          type="text"
                          value={otherTextMap[currentQ.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOtherTextMap(prev => ({ ...prev, [currentQ.id]: val }));
                          }}
                          placeholder={currentQ.otherPlaceholder || "Type here..."}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#147561]"
                        />
                      </div>
                    );
                  })()}

                  {/* Optional Note (e.g. B4 avoidNote) */}
                  {currentQ.hasOptionalNote && (
                    <div className="pt-1">
                      {!showAvoidNoteExpand ? (
                        <button
                          type="button"
                          onClick={() => setShowAvoidNoteExpand(true)}
                          className="text-[11px] font-semibold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>+ Add optional note about today's content exclusions</span>
                        </button>
                      ) : (
                        <div className="p-3 bg-stone-50 rounded-xl border border-[#E1EAF1] space-y-1.5 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[#173247]">
                              {currentQ.optionalNoteLabel}
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowAvoidNoteExpand(false)}
                              className="text-[10px] text-[#71839A] hover:text-[#173247]"
                            >
                              Hide
                            </button>
                          </div>
                          <input
                            type="text"
                            value={avoidNote}
                            onChange={(e) => setAvoidNote(e.target.value)}
                            placeholder={currentQ.optionalNotePlaceholder}
                            className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#147561]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text-Only Question (e.g. C5) */}
                  {currentQ.selectionType === 'text' && (
                    <div className="space-y-2">
                      <textarea
                        value={musicSessionNotes}
                        onChange={(e) => setMusicSessionNotes(e.target.value)}
                        placeholder={currentQ.placeholder}
                        rows={2}
                        className="w-full text-xs p-3 rounded-xl border border-[#CBD5E1] focus:border-[#147561] focus:outline-none resize-none bg-white"
                      />
                      <div className="flex justify-between items-center text-[11px] text-[#71839A]">
                        <span>Optional. Skip if you have no specific requests.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setMusicSessionNotes('');
                            handleNext();
                          }}
                          className="text-[#71839A] hover:underline font-medium cursor-pointer"
                        >
                          Skip this question
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question Actions */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-xl border border-[#E1EAF1] text-xs font-semibold text-[#71839A] hover:bg-[#F7FAFC] flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{currentQuestionIndex === 0 ? 'Back to Step 2' : 'Back'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#147561] hover:bg-[#10594E] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-2xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentQ.selectionType === 'multiple' ? 'Confirm selection' : 'Continue'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FINAL SCREEN — ANYTHING ELSE ON YOUR MIND?                                */}
            {/* ========================================================================= */}
            {isFinalScreen && (
              <div className="space-y-5 animate-fade-in pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#147561] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Flower2 className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-[#E8F5EF] border border-[#147561]/20 text-xs sm:text-sm text-[#173247] max-w-[90%] space-y-2 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#147561] block">
                      Final Step · Anything Else on Your Mind?
                    </span>
                    <p className="font-semibold text-sm sm:text-base text-[#10594E]">
                      "We've covered the basics. Is there anything else you'd like me to consider, or a question you'd like help with today?"
                    </p>
                    <p className="text-xs text-[#71839A]">
                      This is completely optional. Your answer will be included in the same request as your questionnaire responses.
                    </p>
                  </div>
                </div>

                <div className="pl-11 pr-2 space-y-4">
                  {/* Multiline textarea with 600 chars counter */}
                  <div className="space-y-1.5">
                    <textarea
                      value={finalQuestion}
                      onChange={(e) => setFinalQuestion(e.target.value)}
                      placeholder="e.g., I've been studying all day and feel mentally tired. Could you suggest something comforting to watch and a simple way to reset?"
                      rows={4}
                      maxLength={600}
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[#CBD5E1] focus:border-[#147561] focus:ring-2 focus:ring-[#147561]/20 focus:outline-none resize-none leading-relaxed bg-white shadow-2xs"
                    />
                    <div className="flex justify-between items-center text-[11px] text-[#71839A]">
                      <span>Optional open question for personalized advice</span>
                      <span className={finalQuestion.length >= 580 ? 'text-amber-600 font-bold' : ''}>
                        {finalQuestion.length} / 600
                      </span>
                    </div>
                  </div>

                  {/* Subtle Privacy Notice */}
                  <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-[#E1EAF1] text-[11px] text-[#71839A] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#147561] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Your answers are prepared for one consolidated Gemini request. Temporary mood context and free-text reflections are not saved permanently by this flow unless you explicitly choose an available save option.
                    </p>
                  </div>

                  {/* Final Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(questions.length - 1)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E1EAF1] text-xs font-semibold text-[#71839A] hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Questions</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsReviewMode(true)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#147561] text-xs font-bold text-[#147561] hover:bg-[#E8F5EF] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Review My Answers</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onSubmit}
                        className="w-full sm:w-auto bg-[#147561] hover:bg-[#10594E] disabled:opacity-50 text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Generate My MindMate Plan</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Controls: Restart & Quick Action */}
          <div className="pt-3 border-t border-[#F0F4F8] flex items-center justify-between text-xs text-[#71839A]">
            <button
              type="button"
              onClick={() => setShowRestartModal(true)}
              className="text-[#71839A] hover:text-[#173247] flex items-center gap-1 cursor-pointer hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart conversation</span>
            </button>

            <span className="text-[11px] text-[#71839A]">
              {!isFinalScreen ? `Question ${currentQuestionIndex + 1} of ${questions.length}` : 'Completed Questionnaire'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
