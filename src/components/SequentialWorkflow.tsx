import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Bookmark, 
  Volume2, 
  Sliders, 
  Flower2, 
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Clock,
  Heart,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Film,
  Music,
  Activity,
  Zap,
  Globe,
  Sun,
  Leaf,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { api } from '../utils/api';
import { 
  MoodCategory, 
  User, 
  UnifiedRecommendationRequest, 
  UnifiedRecommendationResponse
} from '../types';
import { calmAudio } from '../utils/audio';
import { ViewType } from './Sidebar';
import { MindMateChatbot } from './MindMateChatbot';

export type WorkflowPhase = 
  | 'phase_1_inputs'
  | 'phase_2_profile'
  | 'phase_3_conversation'
  | 'phase_4_discovering'
  | 'phase_5_results'
  | 'phase_6_feedback';

export type ConversationSection = 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD' | 'finalQuestion';
export type ProfileSubSection = 'communication_regional' | 'music_taste' | 'cinema_taste';

export interface MovieOttPlatform {
  key: string;
  name: string;
  logo: string;
  url: string;
  bgClass: string;
}

const getMovieOttList = (movie: {
  title: string;
  suggestedPlatform?: string;
  language?: string;
}): MovieOttPlatform[] => {
  const platStr = (movie.suggestedPlatform || '').toLowerCase();
  const titleLower = movie.title.toLowerCase();
  const langLower = (movie.language || '').toLowerCase();
  const list: MovieOttPlatform[] = [];

  const add = (key: 'netflix' | 'prime' | 'zee5' | 'sunnxt', name: string) => {
    if (list.some(item => item.key === key)) return;
    if (key === 'netflix') {
      list.push({
        key,
        name,
        logo: '/assets/platforms/netflix.png',
        url: `https://www.netflix.com/search?q=${encodeURIComponent(movie.title)}`,
        bgClass: 'bg-black hover:bg-neutral-900 border-neutral-700',
      });
    } else if (key === 'prime') {
      list.push({
        key,
        name,
        logo: '/assets/platforms/prime-video.png',
        url: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(movie.title)}`,
        bgClass: 'bg-white hover:bg-sky-50 border-[#00A8E1]/30',
      });
    } else if (key === 'zee5') {
      list.push({
        key,
        name,
        logo: '/assets/platforms/zee5.png',
        url: `https://www.zee5.com/search?q=${encodeURIComponent(movie.title)}`,
        bgClass: 'bg-black hover:bg-neutral-900 border-neutral-700',
      });
    } else if (key === 'sunnxt') {
      list.push({
        key,
        name,
        logo: '/assets/platforms/sun-nxt.png',
        url: `https://www.sunnxt.com/search?q=${encodeURIComponent(movie.title)}`,
        bgClass: 'bg-white hover:bg-pink-50 border-[#E5094C]/30',
      });
    }
  };

  // 1. Direct matches from suggestedPlatform string
  if (platStr.includes('netflix')) add('netflix', 'Netflix');
  if (platStr.includes('prime') || platStr.includes('amazon')) add('prime', 'Prime Video');
  if (platStr.includes('zee') || platStr.includes('zee5')) add('zee5', 'ZEE5');
  if (platStr.includes('sun') || platStr.includes('nxt')) add('sunnxt', 'Sun NXT');

  // 2. Specific known classic titles in curated fallback
  if (titleLower.includes('kancharapalem')) {
    add('netflix', 'Netflix');
  } else if (titleLower.includes('mithunam')) {
    add('prime', 'Prime Video');
    add('zee5', 'ZEE5');
  } else if (titleLower.includes('pelli choopulu')) {
    add('sunnxt', 'Sun NXT');
    add('prime', 'Prime Video');
  } else if (titleLower.includes('brochevarevarura') || titleLower.includes('sita ramam')) {
    add('prime', 'Prime Video');
  } else if (titleLower.includes('dear zindagi') || titleLower.includes('taare zameen par') || titleLower.includes('udaan')) {
    add('netflix', 'Netflix');
  } else if (titleLower.includes('lunchbox')) {
    add('prime', 'Prime Video');
  } else if (titleLower.includes('queen')) {
    add('netflix', 'Netflix');
    add('zee5', 'ZEE5');
  }

  // 3. Fallback based on language if still empty
  if (list.length === 0) {
    if (langLower.includes('telugu') || langLower.includes('tamil') || langLower.includes('kannada') || langLower.includes('malayalam')) {
      add('prime', 'Prime Video');
      add('sunnxt', 'Sun NXT');
    } else if (langLower.includes('hindi')) {
      add('netflix', 'Netflix');
      add('zee5', 'ZEE5');
    } else {
      add('netflix', 'Netflix');
      add('prime', 'Prime Video');
    }
  }

  return list;
};

export interface EmotionPsychology {
  musicDirection: string;
  musicConsideration: string;
  musicFocusOptions: string[];
  recommendedMusicGenres: string[];
  movieDirection: string;
  movieEstablish: string;
  movieGoalOptions: string[];
  recommendedMovieGenres: string[];
  recommendedDuration?: string;
  musicSoundKind?: string;
  movieExperience?: string;
}

const EMOTION_PSYCHOLOGY_GUIDELINES: Record<string, EmotionPsychology> = {
  Happy: {
    musicDirection: 'Positive, lively or feel-good music',
    musicConsideration: 'Maintain or celebrate the mood',
    musicFocusOptions: ['Maintain feel-good mood', 'Celebrate & elevate'],
    recommendedMusicGenres: ['Pop', 'Film music', 'Acoustic', 'Rock'],
    movieDirection: 'Comedy, adventure, feel-good drama',
    movieEstablish: 'Maintain the good mood or explore something exciting',
    movieGoalOptions: ['Maintain the good mood', 'Explore something exciting'],
    recommendedMovieGenres: ['Comedy', 'Adventure', 'Drama', 'Family-friendly films'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Positive, lively or feel-good music',
    movieExperience: 'Lighthearted and funny',
  },
  Calm: {
    musicDirection: 'Gentle ambient, classical or acoustic music',
    musicConsideration: 'Preserve relaxation',
    musicFocusOptions: ['Preserve relaxation', 'Gentle acoustic & ambient'],
    recommendedMusicGenres: ['Ambient', 'Classical', 'Acoustic', 'Instrumental'],
    movieDirection: 'Slice-of-life, gentle drama, nature documentaries',
    movieEstablish: 'Preserve a peaceful experience',
    movieGoalOptions: ['Preserve a peaceful experience', 'Explore nature & quiet life'],
    recommendedMovieGenres: ['Slice-of-life cinema', 'Documentary', 'Drama'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Gentle ambient, classical or acoustic music',
    movieExperience: 'Heartwarming and gentle',
  },
  Sad: {
    musicDirection: 'Comforting, reflective or gradually uplifting music',
    musicConsideration: 'Ask whether they want comfort or a mood lift',
    musicFocusOptions: ['Comforting & reflective', 'Gradually uplifting mood lift'],
    recommendedMusicGenres: ['Acoustic', 'Indie', 'Lo-fi', 'Classical'],
    movieDirection: 'Emotional drama, meaningful stories, comforting films',
    movieEstablish: 'Emotional connection or a mood lift?',
    movieGoalOptions: ['Emotional connection', 'A mood lift'],
    recommendedMovieGenres: ['Drama', 'Animation', 'Slice-of-life cinema'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Comforting, reflective or gradually uplifting music',
    movieExperience: 'Heartwarming and emotional',
  },
  Stressed: {
    musicDirection: 'Gentle, predictable, lower-intensity music',
    musicConsideration: 'Reduce stimulation if the user finds it soothing',
    musicFocusOptions: ['Reduce stimulation (Gentle & low-intensity)', 'Predictable soothing sound'],
    recommendedMusicGenres: ['Ambient', 'Lo-fi', 'Instrumental', 'Classical'],
    movieDirection: 'Light comedy, familiar stories, low-intensity documentaries',
    movieEstablish: 'Relaxation or distraction?',
    movieGoalOptions: ['Relaxation', 'Distraction'],
    recommendedMovieGenres: ['Comedy', 'Documentary', 'Family-friendly films'],
    recommendedDuration: 'Under 90 minutes',
    musicSoundKind: 'Gentle, predictable, lower-intensity music',
    movieExperience: 'Lighthearted and relaxing',
  },
  Anxious: {
    musicDirection: 'Calm, familiar or soft instrumental music',
    musicConsideration: 'Avoid automatically recommending intense sounds',
    musicFocusOptions: ['Avoid intense sounds (Soft & instrumental)', 'Calm & familiar songs'],
    recommendedMusicGenres: ['Ambient', 'Instrumental', 'Acoustic', 'Lo-fi'],
    movieDirection: 'Familiar, reassuring or gentle films',
    movieEstablish: 'Avoid unwanted suspense or choose a manageable thriller',
    movieGoalOptions: ['Avoid unwanted suspense (Reassuring)', 'Manageable gentle thriller'],
    recommendedMovieGenres: ['Animation', 'Slice-of-life cinema', 'Comedy'],
    recommendedDuration: 'Under 90 minutes',
    musicSoundKind: 'Calm, familiar or soft instrumental music',
    movieExperience: 'Reassuring and gentle',
  },
  Tired: {
    musicDirection: 'Gentle music or more energetic music',
    musicConsideration: 'Ask whether they want rest or an energy boost',
    musicFocusOptions: ['Gentle rest music', 'Energy boost music'],
    recommendedMusicGenres: ['Lo-fi', 'Ambient', 'Acoustic', 'Folk'],
    movieDirection: 'Short films, light comedy, relaxed documentaries',
    movieEstablish: 'Something easy to watch or something immersive?',
    movieGoalOptions: ['Something easy to watch', 'Something immersive'],
    recommendedMovieGenres: ['Comedy', 'Documentary', 'Animation'],
    recommendedDuration: 'Short film or episode',
    musicSoundKind: 'Gentle music or more energetic music',
    movieExperience: 'Easy to watch and light',
  },
  Lonely: {
    musicDirection: 'Familiar, warm, comforting songs',
    musicConsideration: 'Use favourite artists and preferred language',
    musicFocusOptions: ['Familiar warm comforting songs', 'Favourite artists & preferred language'],
    recommendedMusicGenres: ['Folk', 'Acoustic', 'Indie', 'Film music'],
    movieDirection: 'Relationship-focused drama, warm comedy, stories of friendship',
    movieEstablish: 'Feel understood or enjoy a sense of connection',
    movieGoalOptions: ['Feel understood', 'Enjoy a sense of connection'],
    recommendedMovieGenres: ['Drama', 'Comedy', 'Romance', 'Family-friendly films'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Familiar, warm, comforting songs',
    movieExperience: 'Stories of friendship and connection',
  },
  Motivated: {
    musicDirection: 'Rhythmic, energetic or inspiring music',
    musicConsideration: 'Support focus or motivation',
    musicFocusOptions: ['Support focus & rhythm', 'Inspire drive & ambition'],
    recommendedMusicGenres: ['Electronic', 'Pop', 'Rock', 'Instrumental'],
    movieDirection: 'Inspirational drama, achievement stories, informative documentaries',
    movieEstablish: 'Motivation, learning or ambition?',
    movieGoalOptions: ['Motivation & ambition', 'Learning & informative'],
    recommendedMovieGenres: ['Drama', 'Documentary', 'Adventure', 'Science Fiction'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Rhythmic, energetic or inspiring music',
    movieExperience: 'Inspiring and ambitious',
  },
  Overwhelmed: {
    musicDirection: 'Simple arrangements, ambient or instrumental music',
    musicConsideration: 'Avoid overwhelming sound complexity',
    musicFocusOptions: ['Simple arrangements & ambient', 'Minimal instrumental sound'],
    recommendedMusicGenres: ['Ambient', 'Instrumental', 'Classical'],
    movieDirection: 'Short, simple stories or gentle documentaries',
    movieEstablish: 'Avoid complexity or get absorbed in a story?',
    movieGoalOptions: ['Avoid complexity (Short & simple)', 'Get absorbed in a story'],
    recommendedMovieGenres: ['Animation', 'Documentary', 'Slice-of-life cinema'],
    recommendedDuration: 'Under 90 minutes',
    musicSoundKind: 'Simple arrangements, ambient or instrumental music',
    movieExperience: 'Short, simple stories',
  },
  Hopeful: {
    musicDirection: 'Warm, positive and uplifting music',
    musicConsideration: 'Reinforce the feeling of optimism',
    musicFocusOptions: ['Warm & positive melodies', 'Uplifting harmonies'],
    recommendedMusicGenres: ['Acoustic', 'Pop', 'Indie', 'Folk'],
    movieDirection: 'Uplifting drama, inspiring real-life stories',
    movieEstablish: 'Encourage optimism without forcing positivity',
    movieGoalOptions: ['Encourage optimism', 'Inspiring real-life stories'],
    recommendedMovieGenres: ['Drama', 'Documentary', 'Adventure'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Warm, positive and uplifting music',
    movieExperience: 'Uplifting drama and real stories',
  },
  Frustrated: {
    musicDirection: 'Energetic release or calming music',
    musicConsideration: 'Let the user choose between releasing tension and settling down',
    musicFocusOptions: ['Release tension (Energetic release)', 'Settle down (Calming music)'],
    recommendedMusicGenres: ['Rock', 'Electronic', 'Ambient', 'Instrumental'],
    movieDirection: 'Comedy, engaging mystery or action-oriented stories',
    movieEstablish: 'Release tension or redirect attention?',
    movieGoalOptions: ['Release tension (Action/Comedy)', 'Redirect attention (Engaging mystery)'],
    recommendedMovieGenres: ['Comedy', 'Mystery', 'Adventure', 'Thriller'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Energetic release or calming music',
    movieExperience: 'Engaging mystery or release tension',
  },
  Other: {
    musicDirection: 'Music based on their stated need',
    musicConsideration: 'Ask one brief preference question',
    musicFocusOptions: ['Based on stated need', 'Gentle balance'],
    recommendedMusicGenres: ['Acoustic', 'Ambient', 'Indie'],
    movieDirection: 'User-selected genre and viewing goal',
    movieEstablish: 'Ask what experience would help',
    movieGoalOptions: ['Personalized viewing goal', 'Comforting story'],
    recommendedMovieGenres: ['Drama', 'Comedy', 'Documentary'],
    recommendedDuration: 'Around 90–120 minutes',
    musicSoundKind: 'Music based on stated need',
    movieExperience: 'Personalized to stated goal',
  },
};

const getEmotionPsychology = (name?: string): EmotionPsychology => {
  if (!name) return EMOTION_PSYCHOLOGY_GUIDELINES.Calm;
  return EMOTION_PSYCHOLOGY_GUIDELINES[name] || EMOTION_PSYCHOLOGY_GUIDELINES.Other;
};

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

  // Active 6-Phase State Machine
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('phase_1_inputs');

  // =========================================================================
  // PHASE 1: YOUR MOOD STATE (Temporary Session Context)
  // =========================================================================
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('');
  const [secondaryEmotion, setSecondaryEmotion] = useState<string>('');
  const [otherEmotionText, setOtherEmotionText] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [primaryIntention, setPrimaryIntention] = useState<string>('');
  const [secondaryIntentions, setSecondaryIntentions] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [phase1Error, setPhase1Error] = useState<string | null>(null);

  const energySectionRef = useRef<HTMLDivElement>(null);
  const outcomeSectionRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // PHASE 2: YOUR PROFILE STATE (Persistent Taste & Preferences - Step by Step)
  // =========================================================================
  const [profileSubStep, setProfileSubStep] = useState<ProfileSubSection>('communication_regional');
  const [responseLanguage, setResponseLanguage] = useState<string>('Telugu');
  const [preferredMusicLanguages, setPreferredMusicLanguages] = useState<string[]>(['English', 'Telugu']);
  const [preferredMovieLanguages, setPreferredMovieLanguages] = useState<string[]>(['English', 'Telugu']);
  const [subtitlesOrDubbed, setSubtitlesOrDubbed] = useState<string>('Subtitles preferred');
  const [viewingRegion, setViewingRegion] = useState<string>('India');
  const [favoriteMusicGenres, setFavoriteMusicGenres] = useState<string[]>(['Acoustic', 'Ambient']);
  const [favoriteArtistsOrSongs, setFavoriteArtistsOrSongs] = useState<string>('');
  const [musicAvoidances, setMusicAvoidances] = useState<string>('');
  const [favoriteMovieGenres, setFavoriteMovieGenres] = useState<string[]>(['Drama', 'Animation', 'Adventure']);
  const [favoriteFilmmakersOrActors, setFavoriteFilmmakersOrActors] = useState<string>('');
  const [preferredMovieDuration, setPreferredMovieDuration] = useState<string>('Around 90–120 minutes');
  const [movieAvoidances, setMovieAvoidances] = useState<string>('');
  const [psychMusicFocus, setPsychMusicFocus] = useState<string>('');
  const [psychMovieGoal, setPsychMovieGoal] = useState<string>('');
  const [profileData, setProfileData] = useState<{ preferences?: User['preferences']; derivedVector?: Record<string, unknown> } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // =========================================================================
  // PHASE 3: MINDMATE CONVERSATION STATE (Frontend-Only Stateful Questionnaire)
  // =========================================================================
  // Section A: Understand Today's Situation
  const [kindOfDay, setKindOfDay] = useState<string>('Work or studies');
  const [helpfulNow, setHelpfulNow] = useState<string>('Something soothing');
  const [timeAvailable, setTimeAvailable] = useState<string>('20–45 minutes');
  const [supportStyle, setSupportStyle] = useState<string>('Suggest one small practical action');

  // Section B: Language and Personal Comfort
  const [sessionResponseLanguage, setSessionResponseLanguage] = useState<string>('English');
  const [sessionMusicLanguages, setSessionMusicLanguages] = useState<string[]>(['English']);
  const [sessionMovieLanguages, setSessionMovieLanguages] = useState<string[]>(['English']);
  const [contentToAvoid, setContentToAvoid] = useState<string[]>(['Intense violence', 'Scary or disturbing material']);
  const [avoidNote, setAvoidNote] = useState<string>('');

  // Section C: Music Discovery
  const [musicSoundKind, setMusicSoundKind] = useState<string>('Gentle and calming');
  const [listeningStyle, setListeningStyle] = useState<string>('A mixture of both');
  const [familiarVsDiscovery, setFamiliarVsDiscovery] = useState<string>('A balance of both');
  const [musicIntensity, setMusicIntensity] = useState<string>('Soft and steady');
  const [musicSessionNotes, setMusicSessionNotes] = useState<string>('');

  // Section D: Cinema, Habits and Restorative Activities
  const [movieExperience, setMovieExperience] = useState<string>('Heartwarming');
  const [movieDurationChoice, setMovieDurationChoice] = useState<string>('Around 90–120 minutes');
  const [viewingEnvironment, setViewingEnvironment] = useState<string>('Watching alone');
  const [smallActivities, setSmallActivities] = useState<string[]>([
    'A simple breathing exercise',
    'Drinking water and taking a screen break'
  ]);
  const [effortLevel, setEffortLevel] = useState<string>('Very gentle');
  const [practicalLimitations, setPracticalLimitations] = useState<string[]>(['Indoor only', 'No equipment']);

  // Final Open-Ended Question
  const [finalQuestion, setFinalQuestion] = useState<string>('');

  // =========================================================================
  // PHASE 4: DISCOVERING STATE & SINGLE GEMINI REQUEST
  // =========================================================================
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [processingMessageIndex, setProcessingMessageIndex] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // =========================================================================
  // PHASE 5: YOUR RESULTS STATE
  // =========================================================================
  const [unifiedResults, setUnifiedResults] = useState<UnifiedRecommendationResponse | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [savedItemsMap, setSavedItemsMap] = useState<Record<string, boolean>>({});

  // =========================================================================
  // PHASE 6: FEEDBACK STATE
  // =========================================================================
  const [helpfulnessRating, setHelpfulnessRating] = useState<'Very helpful' | 'Somewhat helpful' | 'Not quite right'>('Very helpful');
  const [favoriteRecText, setFavoriteRecText] = useState<string>('');
  const [wasLanguageCorrect, setWasLanguageCorrect] = useState<'Yes' | 'Partially' | 'No'>('Yes');
  const [discoveryBalanceChoice, setDiscoveryBalanceChoice] = useState<'More familiar' | 'Balanced' | 'More discoveries'>('Balanced');
  const [feedbackFeedbackNotes, setFeedbackFeedbackNotes] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // General Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync profile defaults on initial load
  useEffect(() => {
    let isMounted = true;
    setLoadingProfile(true);
    api.getPreferences()
      .then((data: unknown) => {
        if (!isMounted) return;
        const res = data as { preferences?: User['preferences']; derivedVector?: Record<string, unknown> };
        setProfileData(res);
        if (res.preferences?.musicGenres?.length) {
          setFavoriteMusicGenres(res.preferences.musicGenres);
        }
        if (res.preferences?.movieGenres?.length) {
          setFavoriteMovieGenres(res.preferences.movieGenres);
        }
      })
      .catch((err) => {
        console.warn('Could not load profile preferences:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingProfile(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Sync Section B language defaults whenever Phase 2 language changes
  useEffect(() => {
    setSessionResponseLanguage(responseLanguage);
    setSessionMusicLanguages(preferredMusicLanguages);
    setSessionMovieLanguages(preferredMovieLanguages);
  }, [responseLanguage, preferredMusicLanguages, preferredMovieLanguages]);

  // Discovering Processing Status Rotation
  useEffect(() => {
    if (currentPhase !== 'phase_4_discovering') return;
    const interval = setInterval(() => {
      setProcessingMessageIndex(prev => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(interval);
  }, [currentPhase]);

  // 6-Phase Definitions
  const workflowPhases: Array<{ id: WorkflowPhase; num: string; label: string }> = [
    { id: 'phase_1_inputs', num: '01', label: 'Your Mood' },
    { id: 'phase_2_profile', num: '02', label: 'Your Profile' },
    { id: 'phase_3_conversation', num: '03', label: 'MindMate Conversation' },
    { id: 'phase_4_discovering', num: '04', label: 'Discovering' },
    { id: 'phase_5_results', num: '05', label: 'Your Results' },
    { id: 'phase_6_feedback', num: '06', label: 'Feedback' },
  ];

  const currentPhaseIndex = workflowPhases.findIndex(p => p.id === currentPhase);

  // Available Emotion Options for Phase 1
  const emotionalStateOptions: Array<{
    name: string;
    emoji: string;
    desc: string;
    moodLevel: 1 | 2 | 3 | 4 | 5;
    category: MoodCategory;
    accent: string;
  }> = [
    { name: 'Happy', emoji: '😊', desc: 'Joyful, positive, uplifted', moodLevel: 5, category: 'Great', accent: '#F2A18B' },
    { name: 'Calm', emoji: '🌿', desc: 'Peaceful, balanced, centered', moodLevel: 4, category: 'Good', accent: '#31A878' },
    { name: 'Sad', emoji: '🌧️', desc: 'Seeking comfort or gentle encouragement', moodLevel: 2, category: 'Low', accent: '#6C8DB8' },
    { name: 'Stressed', emoji: '⚡', desc: 'Mentally overloaded or tense', moodLevel: 2, category: 'Low', accent: '#D96B43' },
    { name: 'Anxious', emoji: '🌊', desc: 'Feeling nervous or unsettled', moodLevel: 2, category: 'Low', accent: '#8C70C9' },
    { name: 'Tired', emoji: '🌙', desc: 'Low energy or depleted', moodLevel: 2, category: 'Low', accent: '#9279DB' },
    { name: 'Lonely', emoji: '🕊️', desc: 'Seeking connection or warmth', moodLevel: 2, category: 'Low', accent: '#7E9BB8' },
    { name: 'Motivated', emoji: '🔥', desc: 'Ready to create or make progress', moodLevel: 5, category: 'Great', accent: '#176B57' },
    { name: 'Overwhelmed', emoji: '🌀', desc: 'Wanting something simple and manageable', moodLevel: 1, category: 'Struggling', accent: '#D26040' },
    { name: 'Hopeful', emoji: '🌱', desc: 'Looking for encouragement and optimism', moodLevel: 4, category: 'Good', accent: '#2A9D8F' },
    { name: 'Frustrated', emoji: '🌪️', desc: 'Needing release or a change of pace', moodLevel: 2, category: 'Low', accent: '#C85A32' },
    { name: 'Other', emoji: '✨', desc: 'Describe in the optional text field', moodLevel: 3, category: 'Okay', accent: '#657587' },
  ];

  // Intention Options for Phase 1
  const intentionList: Array<{ id: string; label: string; emoji: string }> = [
    { id: 'Relax', label: 'Relax', emoji: '🌿' },
    { id: 'Feel happier', label: 'Feel happier', emoji: '✨' },
    { id: 'Feel motivated', label: 'Feel motivated', emoji: '⚡' },
    { id: 'Improve focus', label: 'Improve focus', emoji: '🎯' },
    { id: 'Feel comforted', label: 'Feel comforted', emoji: '☕' },
    { id: 'Unwind after a demanding day', label: 'Unwind after a demanding day', emoji: '🌅' },
    { id: 'Feel refreshed', label: 'Feel refreshed', emoji: '🍃' },
    { id: 'Feel creatively inspired', label: 'Feel creatively inspired', emoji: '🎨' },
    { id: 'Experience something funny or lighthearted', label: 'Experience something funny or lighthearted', emoji: '😄' },
    { id: 'Reflect quietly', label: 'Reflect quietly', emoji: '📖' },
    { id: 'Take a healthy break', label: 'Take a healthy break', emoji: '🧘' },
  ];

  // Languages Available
  const supportedLanguages = [
    'Telugu', 'English', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Other'
  ];

  // Countries / Viewing Regions
  const viewingRegions = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Other'];

  // Music Genres
  const allMusicGenres = [
    'Acoustic', 'Ambient', 'Indie', 'Classical', 'Instrumental', 'Lo-fi', 'Jazz', 
    'Pop', 'Rock', 'Devotional', 'Folk', 'Electronic', 'Film music', 'Other'
  ];

  // Cinema Genres
  const allCinemaGenres = [
    'Comedy', 'Drama', 'Thriller', 'Mystery', 'Animation', 'Romance', 
    'Science Fiction', 'Documentary', 'Family-friendly films', 'Adventure', 'Slice-of-life cinema'
  ];

  // Emotional state auto-calibration baselines (Energy /10, Stress /10)
  const EMOTION_AUTO_CALIBRATION: Record<string, { energy: number; stress: number }> = {
    Happy: { energy: 9, stress: 2 },
    Calm: { energy: 5, stress: 1 },
    Sad: { energy: 3, stress: 5 },
    Stressed: { energy: 6, stress: 8 },
    Anxious: { energy: 6, stress: 9 },
    Tired: { energy: 2, stress: 3 },
    Lonely: { energy: 3, stress: 5 },
    Motivated: { energy: 9, stress: 3 },
    Overwhelmed: { energy: 4, stress: 9 },
    Hopeful: { energy: 7, stress: 3 },
    Frustrated: { energy: 7, stress: 8 },
    Other: { energy: 5, stress: 5 },
  };

  // --- PHASE 1 STEP-BY-STEP ACTIONS & HELPERS ---
  const handleSelectPrimaryEmotion = (name: string) => {
    setPrimaryEmotion(name);
    if (secondaryEmotion === name) setSecondaryEmotion('');
    setPhase1Error(null);

    // Automatically calibrate Energy and Stress based on the primary emotion
    const baseline = EMOTION_AUTO_CALIBRATION[name] || { energy: 5, stress: 5 };
    setEnergyLevel(baseline.energy);
    setStressLevel(baseline.stress);

    // Automatically choose music and cinema options based on psychology for Step 2
    const psych = getEmotionPsychology(name);
    setFavoriteMusicGenres(psych.recommendedMusicGenres);
    setFavoriteMovieGenres(psych.recommendedMovieGenres);
    if (psych.recommendedDuration) {
      setPreferredMovieDuration(psych.recommendedDuration);
    }
    if (psych.musicSoundKind) {
      setMusicSoundKind(psych.musicSoundKind);
    }
    if (psych.movieExperience) {
      setMovieExperience(psych.movieExperience);
    }
    if (psych.musicFocusOptions?.length) {
      setPsychMusicFocus(psych.musicFocusOptions[0]);
    }
    if (psych.movieGoalOptions?.length) {
      setPsychMovieGoal(psych.movieGoalOptions[0]);
    }

    if (!primaryEmotion) {
      setTimeout(() => {
        energySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  const getEnergyDescription = (val: number) => {
    if (val <= 2) return 'Depleted · Very low stamina';
    if (val <= 4) return 'Subdued · Gentle pacing';
    if (val <= 6) return 'Moderate · Balanced energy';
    if (val <= 8) return 'Energized · Active attention';
    return 'Peak / Wired · High sensory capacity';
  };

  const getStressDescription = (val: number) => {
    if (val <= 2) return 'Deeply Relaxed · Very calm';
    if (val <= 4) return 'Mild · Low background tension';
    if (val <= 6) return 'Moderate · Noticeable tension';
    if (val <= 8) return 'Elevated · Needs soothing relief';
    return 'Overwhelmed · High sensory tension';
  };

  // --- PHASE 1 ACTIONS ---
  const handleProceedFromPhase1 = async () => {
    if (!primaryEmotion) {
      setPhase1Error('Please select a primary emotional state.');
      return;
    }
    if (!primaryIntention) {
      setPhase1Error('Please select what outcome you would like today.');
      return;
    }
    setPhase1Error(null);

    // Ensure psychology-based options are active for Step 2
    const psych = getEmotionPsychology(primaryEmotion);
    setFavoriteMusicGenres(psych.recommendedMusicGenres);
    setFavoriteMovieGenres(psych.recommendedMovieGenres);
    if (psych.recommendedDuration) {
      setPreferredMovieDuration(psych.recommendedDuration);
    }
    if (psych.musicSoundKind) {
      setMusicSoundKind(psych.musicSoundKind);
    }
    if (psych.movieExperience) {
      setMovieExperience(psych.movieExperience);
    }
    if (psych.musicFocusOptions?.length) {
      setPsychMusicFocus(prev => prev || psych.musicFocusOptions[0]);
    }
    if (psych.movieGoalOptions?.length) {
      setPsychMovieGoal(prev => prev || psych.movieGoalOptions[0]);
    }

    // Save temporary check-in to backend store without corrupting long-term entertainment preferences
    const activeEmotionObj = emotionalStateOptions.find(e => e.name === primaryEmotion) || emotionalStateOptions[1];
    try {
      await addMood({
        moodLevel: activeEmotionObj.moodLevel,
        moodLabel: activeEmotionObj.category,
        energyLevel,
        stressLevel,
        emotions: [primaryEmotion, ...(secondaryEmotion ? [secondaryEmotion] : [])],
        desiredExperience: primaryIntention,
        note: personalNote.trim(),
        date: new Date().toISOString().split('T')[0],
      });
    } catch (e) {
      console.warn('Could not save mood check-in to history:', e);
    }

    setCurrentPhase('phase_2_profile');
    setProfileSubStep('communication_regional');
  };

  // --- PHASE 2 ACTIONS ---
  const handleProceedFromPhase2 = () => {
    setCurrentPhase('phase_3_conversation');
  };

  // --- CONSOLIDATED SINGLE-REQUEST SUBMISSION ---
  const handleFinalSubmitToGemini = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setGenerationError(null);
    setCurrentPhase('phase_4_discovering');

    const psych = getEmotionPsychology(primaryEmotion);

    const payload: UnifiedRecommendationRequest = {
      mood: {
        primaryEmotion: primaryEmotion === 'Other' && otherEmotionText.trim() ? otherEmotionText.trim() : primaryEmotion,
        secondaryEmotion: secondaryEmotion || undefined,
        energyLevel,
        stressLevel,
        primaryIntention,
        secondaryIntentions: secondaryIntentions.length > 0 ? secondaryIntentions : undefined,
        personalNote: personalNote.trim() || undefined,
      },
      profile: {
        responseLanguage,
        musicLanguages: preferredMusicLanguages,
        movieLanguages: preferredMovieLanguages,
        viewingRegion,
        subtitlesOrDubbed,
        favoriteMusicGenres,
        musicArtistsOrSongs: favoriteArtistsOrSongs.trim() || undefined,
        musicAvoidances: musicAvoidances.trim() || undefined,
        favoriteMovieGenres,
        movieFilmmakersOrActors: favoriteFilmmakersOrActors.trim() || undefined,
        movieDurationPreference: preferredMovieDuration,
        movieAvoidances: movieAvoidances.trim() || undefined,
        psychologyGuidance: {
          musicDirection: psych.musicDirection,
          musicConsideration: psych.musicConsideration,
          movieDirection: psych.movieDirection,
          movieEstablish: psych.movieEstablish,
          chosenMusicFocus: psychMusicFocus || psych.musicFocusOptions?.[0],
          chosenMovieGoal: psychMovieGoal || psych.movieGoalOptions?.[0],
        },
      },
      conversation: {
        sectionA: {
          kindOfDay,
          helpfulNow,
          timeAvailable,
          supportStyle,
        },
        sectionB: {
          sessionResponseLanguage,
          sessionMusicLanguages,
          sessionMovieLanguages,
          contentToAvoid,
          avoidNote: avoidNote.trim() || undefined,
        },
        sectionC: {
          musicSoundKind,
          listeningStyle,
          familiarVsDiscovery,
          intensity: musicIntensity,
          musicNotes: musicSessionNotes.trim() || undefined,
        },
        sectionD: {
          movieExperience,
          movieDuration: movieDurationChoice,
          viewingEnvironment,
          smallActivities,
          effortLevel,
          practicalLimitations,
        },
        finalQuestion: finalQuestion.trim() || undefined,
      },
    };

    try {
      const response = await api.generateUnifiedRecommendations(payload);
      setUnifiedResults(response);
      setCurrentPhase('phase_5_results');
      showToast('Personalized wellness & media recommendations prepared!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate recommendations. Please try again.';
      console.error('[Consolidated Gemini call failed]', err);
      setGenerationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Save for Music or Movie
  const handleToggleSaveItem = async (itemId: string, title: string) => {
    try {
      await api.toggleSaveRecommendation(itemId);
      setSavedItemsMap(prev => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
      showToast(savedItemsMap[itemId] ? `Removed "${title}" from saved` : `Saved "${title}" to your library`);
    } catch (e) {
      console.warn('Failed to toggle save on item:', e);
      // Optimistic update locally
      setSavedItemsMap(prev => ({
        ...prev,
        [itemId]: !prev[itemId],
      }));
      showToast(savedItemsMap[itemId] ? `Removed "${title}" from saved` : `Saved "${title}" to your library`);
    }
  };

  // Audio preview chime
  const handlePlayAudioPreview = (itemId: string, title: string) => {
    if (playingAudioId === itemId) {
      calmAudio.stopAmbient();
      setPlayingAudioId(null);
    } else {
      calmAudio.startAmbient();
      calmAudio.playGentleChime();
      setPlayingAudioId(itemId);
      showToast(`Playing ambient sound preview for "${title}"`);
    }
  };

  // Complete Feedback in Phase 6
  const handleSaveFeedback = async () => {
    setFeedbackSubmitted(true);
    showToast('Feedback noted! Recommendation balance gently tuned.');
  };

  const handleStartFreshSession = () => {
    // Retain long-term profile preferences, reset temporary session
    setUnifiedResults(null);
    setFinalQuestion('');
    setPersonalNote('');
    setFeedbackSubmitted(false);
    setGenerationError(null);
    setCurrentPhase('phase_1_inputs');
    showToast('Started a fresh mindful recommendation session.');
  };

  // Rotating processing messages during Phase 4 Discovering
  const discoveringMessages = [
    'Organizing your responses...',
    "Connecting today's mood with your preferences...",
    'Considering your listening and viewing choices...',
    'Preparing your personalized wellness suggestions...',
    'Assembling your recommendations...',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified 6-Phase Progress Tracker */}
      <div className="bg-white rounded-2xl border border-[#E1EAF1] p-3 sm:px-6 shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          {workflowPhases.map((phase, idx) => {
            const isCompleted = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            return (
              <div key={phase.id} className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div 
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isCurrent 
                      ? 'bg-[#10594E] text-white font-semibold shadow-xs' 
                      : isCompleted 
                        ? 'bg-[#E8F5EF] text-[#147561] font-semibold' 
                        : 'text-[#71839A] font-medium'
                  }`}
                >
                  <span className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-white/20 text-white' : isCompleted ? 'bg-[#147561] text-white' : 'bg-stone-100 text-[#71839A]'
                  }`}>
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs whitespace-nowrap">{phase.label}</span>
                </div>
                {idx < workflowPhases.length - 1 && (
                  <div className="w-4 sm:w-8 h-px bg-[#E1EAF1] hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 1: YOUR MOOD (Guided Step-by-Step)                                   */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_1_inputs' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#F0F4F8]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#176B57] flex items-center justify-center text-white shadow-sm">
                <Flower2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold text-[#172B3A] tracking-tight">MindMate</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                    Guided Check-In
                  </span>
                </div>
                <p className="text-xs text-[#657587]">
                  Welcome{user?.name ? `, ${user.name}` : ''} · Step 1 of 6: Your Mood
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#176B57] uppercase tracking-wider block">Phase 01</span>
              <span className="text-[11px] text-[#8A9BA8]">
                {!primaryEmotion
                  ? 'Step 1 of 3: Mood'
                  : !primaryIntention
                    ? 'Step 2: Auto-calibrated · Step 3: Select Outcome'
                    : 'Phase 1 Complete'}
              </span>
            </div>
          </div>

          {/* Phase 1 Step-by-Step Guide Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#F0F4F8]">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !primaryEmotion
                  ? 'bg-[#176B57] text-white shadow-2xs'
                  : 'bg-[#E8F5EF] text-[#176B57] hover:bg-[#D5EFE3]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>1. Emotional State</span>
              {primaryEmotion && <Check className="w-3.5 h-3.5 text-[#176B57]" />}
            </button>

            <button
              type="button"
              disabled={!primaryEmotion}
              onClick={() => {
                if (primaryEmotion) {
                  energySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !primaryEmotion
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-[#8A9BA8]'
                  : 'bg-[#E8F5EF] text-[#176B57] hover:bg-[#D5EFE3] cursor-pointer'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>2. Energy & Stress (Auto-set)</span>
              {primaryEmotion && (
                <Check className="w-3.5 h-3.5 text-[#176B57]" />
              )}
            </button>

            <button
              type="button"
              disabled={!primaryEmotion}
              onClick={() => {
                if (primaryEmotion) {
                  outcomeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !primaryEmotion
                  ? 'opacity-40 cursor-not-allowed bg-stone-100 text-[#8A9BA8]'
                  : primaryIntention
                    ? 'bg-[#E8F5EF] text-[#176B57] hover:bg-[#D5EFE3] cursor-pointer'
                    : 'bg-[#176B57] text-white shadow-2xs cursor-pointer'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>3. Desired Outcome & Context</span>
              {primaryIntention && <Check className="w-3.5 h-3.5 text-[#176B57]" />}
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A]">
              How are you feeling right now?
            </h1>
            <p className="text-xs sm:text-sm text-[#657587] max-w-2xl leading-relaxed">
              MindMate uses a guided 3-step check-in to understand your momentary state. Your answers are captured as temporary session context—they guide tonight's recommendations without altering your established long-term preferences.
            </p>
          </div>

          {phase1Error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{phase1Error}</span>
            </div>
          )}

          {/* STEP 1: Primary Emotion Selection (Mandatory) & Optional Secondary Emotion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                    Primary Emotional State <span className="text-[#176B57]">* Mandatory</span>
                  </label>
                </div>
                <p className="text-[11px] text-[#8A9BA8] pl-7">
                  Choose the dominant feeling that best reflects your current internal landscape.
                </p>
              </div>
              {primaryEmotion && (
                <span className="text-xs font-bold text-[#176B57] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#176B57]/20 flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Selected: {primaryEmotion}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {emotionalStateOptions.map((e) => {
                const isSelected = primaryEmotion === e.name;
                return (
                  <button
                    key={e.name}
                    type="button"
                    onClick={() => handleSelectPrimaryEmotion(e.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer ${
                      isSelected 
                        ? 'border-[#176B57] bg-[#E8F5EF] shadow-2xs ring-2 ring-[#176B57]/30 scale-[1.01]' 
                        : 'border-[#E4EAF0] hover:border-[#CBD5E1] bg-white hover:bg-[#F9FBFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{e.emoji}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold mt-1.5 ${isSelected ? 'text-[#176B57]' : 'text-[#172B3A]'}`}>{e.name}</p>
                      <p className="text-[10px] text-[#657587] line-clamp-1">{e.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {primaryEmotion === 'Other' && (
              <div className="pt-2 animate-fade-in">
                <input
                  type="text"
                  value={otherEmotionText}
                  onChange={(e) => setOtherEmotionText(e.target.value)}
                  placeholder="Describe how you are feeling in your own words..."
                  className="w-full text-xs p-3 rounded-xl border border-[#E4EAF0] focus:border-[#176B57] focus:outline-none"
                />
              </div>
            )}

            {/* Optional Secondary Emotion */}
            <div className="space-y-2 pt-2 border-t border-[#F0F4F8]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-[#4A5D6E] flex items-center gap-1.5">
                    <span>Optional Secondary Emotion</span>
                    <span className="text-[10px] text-[#8A9BA8] font-normal">(Emotional nuance)</span>
                  </label>
                </div>
                {secondaryEmotion && (
                  <button
                    type="button"
                    onClick={() => setSecondaryEmotion('')}
                    className="text-[10px] text-[#D96B43] hover:underline cursor-pointer"
                  >
                    Clear secondary
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {emotionalStateOptions
                  .filter(e => e.name !== primaryEmotion)
                  .map((e) => {
                    const isSecSelected = secondaryEmotion === e.name;
                    return (
                      <button
                        key={e.name}
                        type="button"
                        onClick={() => setSecondaryEmotion(isSecSelected ? '' : e.name)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSecSelected 
                            ? 'bg-[#172B3A] text-white font-semibold shadow-2xs' 
                            : 'bg-[#F0F4F8] text-[#657587] hover:bg-[#E4EAF0]'
                        }`}
                      >
                        <span>{e.emoji}</span>
                        <span>{e.name}</span>
                        {isSecSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Guide hint when Primary Emotion is not yet selected */}
          {!primaryEmotion && (
            <div className="p-4 rounded-2xl bg-[#E8F5EF]/60 border border-[#176B57]/20 flex items-center justify-between gap-3 text-xs text-[#176B57] animate-pulse">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-[#176B57]" />
                <span className="font-medium">
                  Select your primary emotional state above. Once selected, your Energy & Stress will auto-adjust and Desired Outcome will automatically fade in below.
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#176B57]/30 shrink-0">
                Mandatory
              </span>
            </div>
          )}

          {/* STEP 2: Current Energy & Stress Sliders (Auto-calibrated based on Primary Emotion, fades in smoothly) */}
          {primaryEmotion && (
            <div 
              ref={energySectionRef} 
              className="space-y-6 pt-6 border-t border-[#F0F4F8] animate-fade-in-up"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[11px] font-bold">
                      2
                    </span>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                      Current Energy & Stress / Tension Levels
                    </label>
                  </div>
                  <p className="text-[11px] text-[#8A9BA8] pl-7">
                    Auto-calibrated from your selected mood (<span className="text-[#176B57] font-semibold">{primaryEmotion}</span>). You can freely fine-tune if needed.
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-7 sm:pl-0">
                  <span className="text-xs font-bold text-[#176B57] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#176B57]/20 flex items-center gap-1.5 animate-fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-[#176B57]" />
                    <span>Auto-Calibrated ({energyLevel}/10 Energy · {stressLevel}/10 Stress)</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Energy Slider */}
                <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-3 transition-all hover:border-[#CBD5E1]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#176B57]" />
                      <span>Current Energy Level</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#176B57]">
                        {getEnergyDescription(energyLevel)}
                      </span>
                      <span className="text-xs font-bold text-[#176B57] tabular-nums bg-white px-2.5 py-0.5 rounded-full border border-[#E4EAF0] shadow-2xs">
                        {energyLevel} / 10
                      </span>
                    </div>
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
                    <span>1 (Very low / Depleted)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Very high / Wired)</span>
                  </div>
                </div>

                {/* Stress Slider */}
                <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E4EAF0] space-y-3 transition-all hover:border-[#CBD5E1]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B3A] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[#D96B43]" />
                      <span>Current Stress & Tension</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#D96B43]">
                        {getStressDescription(stressLevel)}
                      </span>
                      <span className="text-xs font-bold text-[#D96B43] tabular-nums bg-white px-2.5 py-0.5 rounded-full border border-[#E4EAF0] shadow-2xs">
                        {stressLevel} / 10
                      </span>
                    </div>
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
                    <span>1 (Very relaxed / Calm)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Overwhelmed / High tension)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#8A9BA8]">
                <p className="italic">
                  * Automatically calibrated to match {primaryEmotion}. Tailors sound pacing and media density.
                </p>
                {EMOTION_AUTO_CALIBRATION[primaryEmotion] && (
                  (energyLevel !== EMOTION_AUTO_CALIBRATION[primaryEmotion].energy || 
                   stressLevel !== EMOTION_AUTO_CALIBRATION[primaryEmotion].stress) && (
                    <button
                      type="button"
                      onClick={() => {
                        const base = EMOTION_AUTO_CALIBRATION[primaryEmotion];
                        if (base) {
                          setEnergyLevel(base.energy);
                          setStressLevel(base.stress);
                        }
                      }}
                      className="text-[#176B57] hover:underline font-semibold text-xs cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to {primaryEmotion} defaults ({EMOTION_AUTO_CALIBRATION[primaryEmotion].energy}/10 Energy, {EMOTION_AUTO_CALIBRATION[primaryEmotion].stress}/10 Stress)</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Desired Outcome for Today & Optional Context (fades in automatically below) */}
          {primaryEmotion && (
            <div 
              ref={outcomeSectionRef} 
              className="space-y-6 pt-6 border-t border-[#F0F4F8] animate-fade-in-up"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[11px] font-bold">
                      3
                    </span>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                      Desired Outcome for Today <span className="text-[#176B57]">* Mandatory</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#8A9BA8] pl-7">
                    Select the primary intention or mood transition you are seeking tonight.
                  </p>
                </div>
                {primaryIntention && (
                  <span className="text-xs font-bold text-[#176B57] bg-[#E8F5EF] px-3 py-1 rounded-full border border-[#176B57]/20 flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Intention: {primaryIntention}</span>
                  </span>
                )}
              </div>

              {/* Grid of primary outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {intentionList.map((item) => {
                  const isSelected = primaryIntention === item.id;
                  const isSecondary = secondaryIntentions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPrimaryIntention(item.id);
                        setPhase1Error(null);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected 
                          ? 'border-[#176B57] bg-[#E8F5EF] text-[#176B57] font-bold shadow-2xs ring-2 ring-[#176B57]/20 scale-[1.01]' 
                          : isSecondary
                            ? 'border-[#172B3A] bg-stone-50 text-[#172B3A]'
                            : 'border-[#E4EAF0] bg-white text-[#4A5D6E] hover:bg-[#F7F9FC]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="text-lg">{item.emoji}</span>
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-[10px] text-[#8A9BA8] line-clamp-1">{item.desc}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#176B57] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Optional Secondary Intentions */}
              <div className="pt-2 space-y-1.5 border-t border-[#F0F4F8]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#657587] block">
                    Optional Secondary Intentions (Multi-select nuance):
                  </span>
                  {secondaryIntentions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSecondaryIntentions([])}
                      className="text-[10px] text-[#D96B43] hover:underline cursor-pointer"
                    >
                      Clear secondary ({secondaryIntentions.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {intentionList
                    .filter(i => i.id !== primaryIntention)
                    .map(sec => {
                      const isSec = secondaryIntentions.includes(sec.id);
                      return (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => {
                            setSecondaryIntentions(prev => isSec ? prev.filter(x => x !== sec.id) : [...prev, sec.id]);
                          }}
                          className={`px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isSec 
                              ? 'bg-[#172B3A] text-white font-semibold shadow-2xs' 
                              : 'bg-stone-100 text-[#4A5D6E] hover:bg-stone-200'
                          }`}
                        >
                          <span>{sec.emoji}</span>
                          <span>{sec.label}</span>
                          {isSec && <span className="text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Small Optional Reflection Field */}
              <div className="space-y-1.5 pt-2 border-t border-[#F0F4F8]">
                <span className="text-xs font-semibold text-[#4A5D6E] block">
                  Optional Context: Anything about today that would help MindMate understand what you need?
                </span>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="e.g., Just submitted a project deadline and feeling mentally drained, or had a wonderful afternoon in nature..."
                  rows={2}
                  maxLength={300}
                  className="w-full text-xs p-3 rounded-2xl border border-[#E4EAF0] focus:border-[#176B57] focus:outline-none resize-none transition-all focus:ring-1 focus:ring-[#176B57]"
                />
              </div>

              {/* Footer Controls */}
              <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={onOpenBreathing}
                  className="text-xs font-semibold text-[#176B57] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Flower2 className="w-3.5 h-3.5 text-[#176B57]" />
                  <span>Need a fast 60s breathing reset first?</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedFromPhase1}
                  className={`text-xs sm:text-sm font-bold px-7 py-3.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 group cursor-pointer ${
                    primaryEmotion && primaryIntention
                      ? 'bg-[#176B57] hover:bg-[#104C40] text-white shadow-sm hover:shadow'
                      : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
                  }`}
                >
                  <span>Continue to Step 2: Your Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: YOUR PROFILE (Step-by-Step)                                      */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_2_profile' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#F0F4F8]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
                <Sliders className="w-4 h-4 text-[#176B57]" />
                <span>
                  {profileSubStep === 'communication_regional' && 'Step 2A of 6 · Communication & Regional Preferences'}
                  {profileSubStep === 'music_taste' && 'Step 2B of 6 · Long-Term Music Taste'}
                  {profileSubStep === 'cinema_taste' && 'Step 2C of 6 · Long-Term Cinema Taste'}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A]">
                Your Stable Entertainment Preferences
              </h2>
              <p className="text-xs sm:text-sm text-[#657587] max-w-2xl leading-relaxed">
                MindMate maintains a clear distinction between your stable taste profile (genres, languages, viewing region) and your temporary session state (today's mood and intention).
              </p>
              {loadingProfile && (
                <div className="text-[11px] text-[#176B57] font-semibold flex items-center gap-1.5 animate-pulse pt-1">
                  <span>Syncing your verified library preferences...</span>
                </div>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-[#176B57] uppercase tracking-wider block">Phase 02</span>
              <span className="text-[11px] text-[#8A9BA8]">
                {profileSubStep === 'communication_regional' && 'Section 1 of 3: Regional'}
                {profileSubStep === 'music_taste' && 'Section 2 of 3: Music'}
                {profileSubStep === 'cinema_taste' && 'Section 3 of 3: Cinema'}
              </span>
            </div>
          </div>

          {/* Psychological Taste Matcher Overview Banner */}
          {(() => {
            const psych = getEmotionPsychology(primaryEmotion);
            const activeEmotionObj = emotionalStateOptions.find(e => e.name === primaryEmotion);
            const emotionEmoji = activeEmotionObj?.emoji || '🧠';
            return (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#E8F5EF] via-[#F4F9F6] to-[#FFF6EE] border border-[#176B57]/20 shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-2xs border border-[#176B57]/15 leading-none shrink-0">
                      {emotionEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-[#172B3A]">
                          Psychological Profile Auto-Configured
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#176B57] text-white shadow-2xs">
                          Active for {primaryEmotion || 'Selected Mood'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#657587] leading-relaxed">
                        MindMate automatically tuned your entertainment and psychological branches based on your current emotional state.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setProfileSubStep('music_taste')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        profileSubStep === 'music_taste'
                          ? 'bg-[#176B57] text-white border-[#176B57] shadow-2xs'
                          : 'bg-white text-[#176B57] border-[#176B57]/20 hover:bg-[#E8F5EF]'
                      }`}
                    >
                      <Music className="w-3.5 h-3.5 inline mr-1" />
                      Music: {psych.recommendedMusicGenres.slice(0, 2).join(', ')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileSubStep('cinema_taste')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        profileSubStep === 'cinema_taste'
                          ? 'bg-[#D96B43] text-white border-[#D96B43] shadow-2xs'
                          : 'bg-white text-[#D96B43] border-[#D96B43]/20 hover:bg-[#FFF6EE]'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5 inline mr-1" />
                      Cinema: {psych.recommendedMovieGenres.slice(0, 2).join(', ')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5 text-xs">
                  {/* Music Card */}
                  <div className="p-3.5 bg-white/95 rounded-xl border border-[#D5E8DE] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B57] flex items-center gap-1.5">
                        <Music className="w-3 h-3" />
                        <span>Starting Music Direction</span>
                      </span>
                      <span className="text-[10px] bg-[#E8F5EF] text-[#176B57] font-semibold px-2 py-0.5 rounded-full">
                        Auto-Chosen
                      </span>
                    </div>
                    <p className="font-semibold text-[#172B3A] text-xs leading-snug">
                      {psych.musicDirection}
                    </p>
                    <p className="text-[11px] text-[#657587]">
                      <strong className="text-[#176B57]">Psychology focus:</strong> {psych.musicConsideration}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {psych.recommendedMusicGenres.map(g => (
                        <span key={g} className="text-[10px] bg-[#E8F5EF] text-[#176B57] font-medium px-2 py-0.5 rounded-md">
                          ✓ {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cinema Card */}
                  <div className="p-3.5 bg-white/95 rounded-xl border border-[#F2D7C8] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B43] flex items-center gap-1.5">
                        <Film className="w-3 h-3" />
                        <span>Possible Movie Direction</span>
                      </span>
                      <span className="text-[10px] bg-[#FFF0E6] text-[#D96B43] font-semibold px-2 py-0.5 rounded-full">
                        Auto-Chosen
                      </span>
                    </div>
                    <p className="font-semibold text-[#172B3A] text-xs leading-snug">
                      {psych.movieDirection}
                    </p>
                    <p className="text-[11px] text-[#657587]">
                      <strong className="text-[#D96B43]">MindMate establishes:</strong> {psych.movieEstablish}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {psych.recommendedMovieGenres.map(g => (
                        <span key={g} className="text-[10px] bg-[#FFF0E6] text-[#D96B43] font-medium px-2 py-0.5 rounded-md">
                          ✓ {g}
                        </span>
                      ))}
                      {psych.recommendedDuration && (
                        <span className="text-[10px] bg-stone-100 text-[#4A5D6E] font-medium px-2 py-0.5 rounded-md">
                          ⏱ {psych.recommendedDuration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Step-by-Step Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#F0F4F8]">
            {[
              { id: 'communication_regional', stepNum: '1', title: 'Communication & Region', icon: Globe },
              { id: 'music_taste', stepNum: '2', title: 'Long-Term Music Taste', icon: Music, badge: 'Auto-Set' },
              { id: 'cinema_taste', stepNum: '3', title: 'Long-Term Cinema Taste', icon: Film, badge: 'Auto-Set' },
            ].map(step => {
              const isActive = profileSubStep === step.id;
              const isPast = (step.id === 'communication_regional' && (profileSubStep === 'music_taste' || profileSubStep === 'cinema_taste')) ||
                             (step.id === 'music_taste' && profileSubStep === 'cinema_taste');
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setProfileSubStep(step.id as ProfileSubSection)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#176B57] text-white shadow-2xs font-bold ring-2 ring-[#176B57]/20'
                      : isPast
                        ? 'bg-[#E8F5EF] text-[#176B57] hover:bg-[#D8EDE2]'
                        : 'bg-[#F7F9FC] text-[#657587] hover:bg-[#E8F5EF]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : isPast ? 'bg-[#176B57] text-white' : 'bg-[#E4EAF0] text-[#657587]'
                  }`}>
                    {isPast ? <Check className="w-3 h-3" /> : step.stepNum}
                  </span>
                  <step.icon className="w-3.5 h-3.5" />
                  <span>{step.title}</span>
                  {step.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/25 text-white' : 'bg-[#176B57]/10 text-[#176B57]'
                    }`}>
                      {step.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* STEP 1: Communication & Regional Preferences */}
          {profileSubStep === 'communication_regional' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#F7FAF8] border border-[#D5E8DE] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#176B57] flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Communication & Regional Preferences</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#176B57] bg-[#E8F5EF] px-2.5 py-0.5 rounded-full">Step 1 of 3</span>
                </div>
                <p className="text-xs text-[#4A5D6E] leading-relaxed">
                  MindMate communicates with empathetic nuance tailored to your language and viewing locale.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  {/* Response Language */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#172B3A] block">
                      Preferred Language for MindMate's Response:
                    </label>
                    <select
                      value={responseLanguage}
                      onChange={(e) => setResponseLanguage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5E8DE] bg-white text-xs text-[#172B3A] focus:outline-none focus:border-[#176B57] focus:ring-1 focus:ring-[#176B57]"
                    >
                      {supportedLanguages.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Viewing Region */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#172B3A] block">
                      Country / Viewing Region:
                    </label>
                    <select
                      value={viewingRegion}
                      onChange={(e) => setViewingRegion(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#D5E8DE] bg-white text-xs text-[#172B3A] focus:outline-none focus:border-[#176B57] focus:ring-1 focus:ring-[#176B57]"
                    >
                      {viewingRegions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subtitles Preference */}
                  <div className="space-y-2 sm:col-span-2 pt-1">
                    <label className="font-semibold text-[#172B3A] block">Subtitle & Audio Preference:</label>
                    <div className="flex flex-wrap gap-2">
                      {['Subtitles preferred', 'Dubbed preferred', 'Original audio without subtitles', 'No preference'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSubtitlesOrDubbed(opt)}
                          className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            subtitlesOrDubbed === opt
                              ? 'bg-[#176B57] text-white font-bold shadow-2xs'
                              : 'bg-white text-[#4A5D6E] border border-[#D5E8DE] hover:bg-[#E8F5EF]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-step 1 Navigation Controls */}
              <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentPhase('phase_1_inputs')}
                  className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Your Mood</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSubStep('music_taste')}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Next: Long-Term Music Taste</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Long-Term Music Taste */}
          {profileSubStep === 'music_taste' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-[#F9FAF8] border border-[#E4EAF0]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#176B57]" />
                    <span>Long-Term Music Taste</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#176B57] bg-[#E8F5EF] px-2.5 py-0.5 rounded-full">Step 2 of 3</span>
                </div>

                {/* Psychological Music Guidance Banner */}
                {(() => {
                  const psych = getEmotionPsychology(primaryEmotion);
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#E8F5EF] border border-[#176B57]/20 space-y-3 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#176B57] shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-[#172B3A]">
                            Psychological Music Direction {primaryEmotion ? `(${primaryEmotion})` : ''}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#176B57] border border-[#176B57]/20 shrink-0 self-start sm:self-auto shadow-2xs">
                          Auto-Selected for Step 2
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 bg-white/95 rounded-xl border border-[#D5E8DE] space-y-1 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A9BA8] block">
                            Starting Music Direction
                          </span>
                          <p className="font-semibold text-[#172B3A] leading-snug">
                            {psych.musicDirection}
                          </p>
                        </div>
                        <div className="p-3 bg-white/95 rounded-xl border border-[#D5E8DE] space-y-1 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A9BA8] block">
                            What MindMate Considers
                          </span>
                          <p className="font-semibold text-[#172B3A] leading-snug">
                            {psych.musicConsideration}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Psychological Branch Selector */}
                      {psych.musicFocusOptions && psych.musicFocusOptions.length > 0 && (
                        <div className="p-3 bg-white/95 rounded-xl border border-[#D5E8DE] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-[11px] font-bold text-[#172B3A] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#176B57]" />
                              <span>Psychological Musical Focus:</span>
                            </span>
                            <span className="text-[10px] text-[#176B57] font-semibold">
                              Selected: <strong>{psychMusicFocus || psych.musicFocusOptions[0]}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {psych.musicFocusOptions.map(opt => {
                              const isSel = (psychMusicFocus || psych.musicFocusOptions[0]) === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setPsychMusicFocus(opt)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isSel
                                      ? 'bg-[#176B57] text-white shadow-xs font-bold ring-2 ring-[#176B57]/20'
                                      : 'bg-[#F0F6F3] text-[#4A5D6E] hover:bg-[#E8F5EF] border border-[#D5E8DE]'
                                  }`}
                                >
                                  {isSel && <Check className="w-3 h-3 text-white" />}
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#176B57] pt-0.5">
                        <span>
                          Optimal mood genres auto-chosen: <strong>{psych.recommendedMusicGenres.join(', ')}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFavoriteMusicGenres(psych.recommendedMusicGenres);
                            if (psych.musicFocusOptions?.length) {
                              setPsychMusicFocus(psych.musicFocusOptions[0]);
                            }
                          }}
                          className="text-xs font-bold text-[#176B57] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#176B57]/20 shadow-2xs hover:bg-[#D5EFE3] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to {primaryEmotion || 'Mood'} Music</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#172B3A]">Choose favored genres</label>
                    <span className="text-[11px] text-[#8A9BA8]">{favoriteMusicGenres.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allMusicGenres.map(g => {
                      const isChecked = favoriteMusicGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setFavoriteMusicGenres(favoriteMusicGenres.filter(x => x !== g));
                            } else {
                              setFavoriteMusicGenres([...favoriteMusicGenres, g]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#176B57] text-white font-semibold shadow-2xs'
                              : 'bg-[#F0F4F8] text-[#4A5D6E] hover:bg-[#E4EAF0]'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '}{g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[#172B3A] font-semibold block">Preferred Song Languages (Multi-select):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'].map(l => {
                        const sel = preferredMusicLanguages.includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              setPreferredMusicLanguages(sel 
                                ? (preferredMusicLanguages.length > 1 ? preferredMusicLanguages.filter(x => x !== l) : preferredMusicLanguages)
                                : [...preferredMusicLanguages, l]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                              sel ? 'bg-[#172B3A] text-white font-bold shadow-2xs' : 'bg-white border border-[#E4EAF0] text-[#657587] hover:bg-stone-50'
                            }`}
                          >
                            {sel ? '✓ ' : '+ '}{l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#172B3A] font-semibold block">Favourite Artists or Songs (Optional):</label>
                    <input
                      type="text"
                      value={favoriteArtistsOrSongs}
                      onChange={(e) => setFavoriteArtistsOrSongs(e.target.value)}
                      placeholder="e.g., Sid Sriram, A.R. Rahman, Bon Iver, Prateek Kuhad..."
                      className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#172B3A] font-semibold block">Music / Sound Elements to Avoid (Optional):</label>
                    <input
                      type="text"
                      value={musicAvoidances}
                      onChange={(e) => setMusicAvoidances(e.target.value)}
                      placeholder="e.g., Heavy metal, intense screeching, aggressive distortion..."
                      className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-step 2 Navigation Controls */}
              <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setProfileSubStep('communication_regional')}
                  className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Regional Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileSubStep('cinema_taste')}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Next: Long-Term Cinema Taste</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Long-Term Cinema Taste */}
          {profileSubStep === 'cinema_taste' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-[#F9FAF8] border border-[#E4EAF0]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#172B3A] flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#D96B43]" />
                    <span>Long-Term Cinema Taste</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#176B57] bg-[#E8F5EF] px-2.5 py-0.5 rounded-full">Step 3 of 3</span>
                </div>

                {/* Psychological Cinema Guidance Banner */}
                {(() => {
                  const psych = getEmotionPsychology(primaryEmotion);
                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF6EE] border border-[#D96B43]/20 space-y-3 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#D96B43] shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-[#172B3A]">
                            Psychological Movie Direction {primaryEmotion ? `(${primaryEmotion})` : ''}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#D96B43] border border-[#D96B43]/20 shrink-0 self-start sm:self-auto shadow-2xs">
                          Auto-Selected for Step 2
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 bg-white/95 rounded-xl border border-[#F2D7C8] space-y-1 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A9BA8] block">
                            Possible Movie Direction
                          </span>
                          <p className="font-semibold text-[#172B3A] leading-snug">
                            {psych.movieDirection}
                          </p>
                        </div>
                        <div className="p-3 bg-white/95 rounded-xl border border-[#F2D7C8] space-y-1 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A9BA8] block">
                            What MindMate Establishes
                          </span>
                          <p className="font-semibold text-[#172B3A] leading-snug">
                            {psych.movieEstablish}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Psychological Cinema Goal Branch Selector */}
                      {psych.movieGoalOptions && psych.movieGoalOptions.length > 0 && (
                        <div className="p-3 bg-white/95 rounded-xl border border-[#F2D7C8] space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-[11px] font-bold text-[#172B3A] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
                              <span>Psychological Viewing Goal:</span>
                            </span>
                            <span className="text-[10px] text-[#D96B43] font-semibold">
                              Selected: <strong>{psychMovieGoal || psych.movieGoalOptions[0]}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {psych.movieGoalOptions.map(opt => {
                              const isSel = (psychMovieGoal || psych.movieGoalOptions[0]) === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setPsychMovieGoal(opt)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isSel
                                      ? 'bg-[#D96B43] text-white shadow-xs font-bold ring-2 ring-[#D96B43]/20'
                                      : 'bg-[#FFF9F5] text-[#4A5D6E] hover:bg-[#FFF0E6] border border-[#F2D7C8]'
                                  }`}
                                >
                                  {isSel && <Check className="w-3 h-3 text-white" />}
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#D96B43] pt-0.5">
                        <span>
                          Optimal mood cinema auto-chosen: <strong>{psych.recommendedMovieGenres.join(', ')}</strong>
                          {psych.recommendedDuration && <span> · Duration: <strong>{psych.recommendedDuration}</strong></span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFavoriteMovieGenres(psych.recommendedMovieGenres);
                            if (psych.recommendedDuration) {
                              setPreferredMovieDuration(psych.recommendedDuration);
                            }
                            if (psych.movieGoalOptions?.length) {
                              setPsychMovieGoal(psych.movieGoalOptions[0]);
                            }
                          }}
                          className="text-xs font-bold text-[#D96B43] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#D96B43]/20 shadow-2xs hover:bg-[#FCE8DC] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to {primaryEmotion || 'Mood'} Cinema</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#172B3A]">Choose favored genres</label>
                    <span className="text-[11px] text-[#8A9BA8]">{favoriteMovieGenres.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allCinemaGenres.map(g => {
                      const isChecked = favoriteMovieGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setFavoriteMovieGenres(favoriteMovieGenres.filter(x => x !== g));
                            } else {
                              setFavoriteMovieGenres([...favoriteMovieGenres, g]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#176B57] text-white font-semibold shadow-2xs'
                              : 'bg-[#F0F4F8] text-[#4A5D6E] hover:bg-[#E4EAF0]'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '}{g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[#172B3A] font-semibold block">Preferred Movie Languages (Multi-select):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['English', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'].map(l => {
                        const sel = preferredMovieLanguages.includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => {
                              setPreferredMovieLanguages(sel 
                                ? (preferredMovieLanguages.length > 1 ? preferredMovieLanguages.filter(x => x !== l) : preferredMovieLanguages)
                                : [...preferredMovieLanguages, l]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                              sel ? 'bg-[#172B3A] text-white font-bold shadow-2xs' : 'bg-white border border-[#E4EAF0] text-[#657587] hover:bg-stone-50'
                            }`}
                          >
                            {sel ? '✓ ' : '+ '}{l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#172B3A] font-semibold block">Preferred Duration:</label>
                    <select
                      value={preferredMovieDuration}
                      onChange={(e) => setPreferredMovieDuration(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] bg-white"
                    >
                      <option value="Short film or episode">Short film or episode</option>
                      <option value="Under 90 minutes">Under 90 minutes</option>
                      <option value="Around 90–120 minutes">Around 90–120 minutes</option>
                      <option value="Longer than 120 minutes">Longer than 120 minutes</option>
                      <option value="No preference">No preference</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#172B3A] font-semibold block">Favourite Filmmakers or Actors (Optional):</label>
                    <input
                      type="text"
                      value={favoriteFilmmakersOrActors}
                      onChange={(e) => setFavoriteFilmmakersOrActors(e.target.value)}
                      placeholder="e.g., Hayao Miyazaki, Mani Ratnam, Greta Gerwig..."
                      className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[#172B3A] font-semibold block">Cinema Content to Avoid (Optional):</label>
                    <input
                      type="text"
                      value={movieAvoidances}
                      onChange={(e) => setMovieAvoidances(e.target.value)}
                      placeholder="e.g., Jumpscares, tragic endings, gratuitous gore..."
                      className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Genuine Interaction Profile Display */}
              <div className="p-4 bg-[#F4F8F5] rounded-2xl border border-[#D3E8DC] text-xs text-[#2D5A46] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#176B57] shrink-0" />
                  <span>
                    <strong>Taste Isolation Guarantee:</strong> Your session answers will be combined with this stable profile in one consolidated Gemini request.
                  </span>
                </div>
                <span className="text-[11px] text-[#176B57] font-bold">
                  {profileData?.derivedVector?.savedCount ? `${profileData.derivedVector.savedCount} saved items in history` : 'Clean Cold-Start Profile'}
                </span>
              </div>

              {/* Sub-step 3 Navigation Controls */}
              <div className="pt-4 border-t border-[#E4EAF0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setProfileSubStep('music_taste')}
                  className="px-5 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587] hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Music Taste</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedFromPhase2}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>Continue to Step 3: MindMate Conversation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3: MINDMATE CONVERSATION (Interactive Guided Chatbot)               */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_3_conversation' && (
        <MindMateChatbot
          user={user}
          primaryEmotion={primaryEmotion}
          secondaryEmotion={secondaryEmotion}
          energyLevel={energyLevel}
          stressLevel={stressLevel}
          primaryIntention={primaryIntention}
          secondaryIntentions={secondaryIntentions}
          personalNote={personalNote}
          responseLanguage={responseLanguage}
          preferredMusicLanguages={preferredMusicLanguages}
          preferredMovieLanguages={preferredMovieLanguages}
          viewingRegion={viewingRegion}
          kindOfDay={kindOfDay}
          setKindOfDay={setKindOfDay}
          helpfulNow={helpfulNow}
          setHelpfulNow={setHelpfulNow}
          timeAvailable={timeAvailable}
          setTimeAvailable={setTimeAvailable}
          supportStyle={supportStyle}
          setSupportStyle={setSupportStyle}
          sessionResponseLanguage={sessionResponseLanguage}
          setSessionResponseLanguage={setSessionResponseLanguage}
          sessionMusicLanguages={sessionMusicLanguages}
          setSessionMusicLanguages={setSessionMusicLanguages}
          sessionMovieLanguages={sessionMovieLanguages}
          setSessionMovieLanguages={setSessionMovieLanguages}
          contentToAvoid={contentToAvoid}
          setContentToAvoid={setContentToAvoid}
          avoidNote={avoidNote}
          setAvoidNote={setAvoidNote}
          musicSoundKind={musicSoundKind}
          setMusicSoundKind={setMusicSoundKind}
          listeningStyle={listeningStyle}
          setListeningStyle={setListeningStyle}
          familiarVsDiscovery={familiarVsDiscovery}
          setFamiliarVsDiscovery={setFamiliarVsDiscovery}
          musicIntensity={musicIntensity}
          setMusicIntensity={setMusicIntensity}
          musicSessionNotes={musicSessionNotes}
          setMusicSessionNotes={setMusicSessionNotes}
          movieExperience={movieExperience}
          setMovieExperience={setMovieExperience}
          movieDurationChoice={movieDurationChoice}
          setMovieDurationChoice={setMovieDurationChoice}
          viewingEnvironment={viewingEnvironment}
          setViewingEnvironment={setViewingEnvironment}
          smallActivities={smallActivities}
          setSmallActivities={setSmallActivities}
          effortLevel={effortLevel}
          setEffortLevel={setEffortLevel}
          practicalLimitations={practicalLimitations}
          setPracticalLimitations={setPracticalLimitations}
          finalQuestion={finalQuestion}
          setFinalQuestion={setFinalQuestion}
          isSubmitting={isSubmitting}
          onSubmit={handleFinalSubmitToGemini}
          onBackToStep2={() => setCurrentPhase('phase_2_profile')}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 4: DISCOVERING                                                      */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_4_discovering' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-8 sm:p-14 shadow-2xs space-y-8 text-center animate-fade-in max-w-2xl mx-auto">
          {/* Animated Central Brand Visualizer */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#176B57]/10 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-[#176B57] to-[#31A878] text-white flex items-center justify-center shadow-md relative">
              <Flower2 className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B57]">
              Step 4 of 6 · One Consolidated Discovery Request
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#172B3A]">
              MindMate is preparing your wellness package
            </h2>
            <p className="text-xs sm:text-sm text-[#657587]">
              Aligning today's {primaryEmotion} state with your preferred music and cinema languages...
            </p>
          </div>

          {generationError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 space-y-3 text-left">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Discovery Request Notice</span>
              </div>
              <p>{generationError}</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinalSubmitToGemini}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700"
                >
                  Retry Request
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPhase('phase_3_conversation')}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-800 font-semibold rounded-xl text-xs"
                >
                  Edit Questionnaire Answers
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#F7F9FC] rounded-2xl border border-[#E4EAF0] p-6 text-left space-y-3.5 max-w-md mx-auto">
              {discoveringMessages.map((msg, index) => {
                const isDone = processingMessageIndex > index;
                const isCurrent = processingMessageIndex === index;
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
      {/* PHASE 5: YOUR RESULTS                                                     */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* PHASE 5: YOUR RESULTS (Premium Polished Dashboard)                          */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_5_results' && unifiedResults && (
        <div className="space-y-6 animate-fade-in">
          {/* ===================================================================== */}
          {/* A. PERSONALIZED RESULTS HERO CARD                                     */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 lg:p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Left: MindMate Mascot Avatar + Title & Description */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1 min-w-0">
              {/* Friendly Green MindMate Mascot Avatar */}
              <div className="relative shrink-0 w-22 h-22 sm:w-26 sm:h-26 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-[#147561]/25 via-[#34A883]/30 to-[#E8F5EF] blur-md" />
                <svg className="w-20 h-20 sm:w-24 sm:h-24 relative z-10 drop-shadow-sm" viewBox="0 0 100 100" fill="none">
                  {/* Cute Leaf Ears */}
                  <path d="M28 22 C18 10 32 4 40 16 C38 22 34 24 28 22Z" fill="#1B8770" />
                  <path d="M72 22 C82 10 68 4 60 16 C62 22 66 24 72 22Z" fill="#1B8770" />
                  <path d="M30 20 C24 13 32 9 37 17 Z" fill="#75CDB8" opacity="0.6" />
                  <path d="M70 20 C76 13 68 9 63 17 Z" fill="#75CDB8" opacity="0.6" />
                  {/* Main Body */}
                  <circle cx="50" cy="54" r="36" fill="url(#mascotGradResults)" />
                  {/* Soft Rosy Cheeks */}
                  <circle cx="34" cy="58" r="4.5" fill="#FFA5A5" opacity="0.5" />
                  <circle cx="66" cy="58" r="4.5" fill="#FFA5A5" opacity="0.5" />
                  {/* Big Friendly Eyes */}
                  <circle cx="38" cy="50" r="3.5" fill="#103B31" />
                  <circle cx="37" cy="48.5" r="1.2" fill="#FFFFFF" />
                  <circle cx="62" cy="50" r="3.5" fill="#103B31" />
                  <circle cx="61" cy="48.5" r="1.2" fill="#FFFFFF" />
                  {/* Sweet Smile */}
                  <path d="M44 58 Q50 64 56 58" stroke="#103B31" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="mascotGradResults" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#43BE9B" />
                      <stop offset="0.6" stopColor="#1B8770" />
                      <stop offset="1" stopColor="#10594E" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 min-w-0">
                <div className="text-[11px] font-bold tracking-wider uppercase text-[#147561] flex items-center justify-center sm:justify-start gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#147561] rounded-full inline-block" />
                  <span>YOUR PERSONALIZED RESULTS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#173247] tracking-tight font-serif">
                  Here’s your MindMate plan
                </h2>
                <p className="text-xs sm:text-sm text-[#71839A] leading-relaxed max-w-xl">
                  {unifiedResults.sessionSummary || "Based on what you shared today, we've curated a mix of music, movies, activities and wellness tips to help you feel more balanced and uplifted."}
                </p>
              </div>
            </div>

            {/* Middle-Right: Your Mood Summary Card */}
            <div className="bg-[#FFFDF7] lg:bg-[#F8FCF9] border border-[#E9F3ED] rounded-2xl p-4 sm:p-5 w-full lg:w-80 shrink-0 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FFF5DC] text-[#E59700] flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-[#173247]">Your Mood</span>
              </div>
              <div className="text-sm font-bold text-[#173247]">
                {primaryEmotion || 'Calm'} · Looking for {primaryIntention ? primaryIntention.toLowerCase() : 'relaxation'}
              </div>
              <p className="text-xs text-[#71839A] leading-relaxed">
                {unifiedResults.moodInterpretation || "You're seeking peace, balance and a gentle way to unwind. Your preferences lean towards soothing and uplifting content."}
              </p>
            </div>

            {/* Far-Right: "Small steps create big changes" delicate hand-drawn style accent */}
            <div className="hidden xl:flex items-center justify-center relative shrink-0 w-44 pl-2 select-none">
              <div className="relative text-center">
                <svg className="w-32 h-18 mx-auto text-[#34A883]" viewBox="0 0 120 70" fill="none">
                  <path d="M10 55 C40 45 70 30 110 15" stroke="#34A883" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  <path d="M30 48 C32 40 40 38 42 45 C38 52 32 50 30 48 Z" fill="#E8F5EF" stroke="#34A883" strokeWidth="1.2" />
                  <path d="M60 38 C62 30 72 30 74 37 C70 43 62 42 60 38 Z" fill="#E8F5EF" stroke="#34A883" strokeWidth="1.2" />
                  <path d="M90 26 C94 18 104 20 104 27 C100 32 92 31 90 26 Z" fill="#E8F5EF" stroke="#34A883" strokeWidth="1.2" />
                </svg>
                <div className="font-serif italic text-xs text-[#147561] tracking-wide mt-[-4px]">
                  Small steps<br />create big changes
                </div>
                <div className="text-center mt-1">
                  <svg className="w-3.5 h-3.5 mx-auto text-[#147561]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* B & C. BEST HABIT RIGHT NOW & RESTORATIVE EXERCISE                    */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* B. Your Best Habit Right Now */}
            <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#147561] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#147561]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#147561] tracking-wide block uppercase">
                    Your Best Habit Right Now
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#173247]">
                    {unifiedResults.recommendedHabit.title || 'Take a 5-Minute Screen Break'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#71839A] leading-relaxed">
                  {unifiedResults.recommendedHabit.whyHelpful || 'A short break can reduce mental fatigue, improve focus and help you feel more present.'}
                </p>

                {/* Concise Numbered Steps */}
                <div className="space-y-2.5 pt-1">
                  {(unifiedResults.recommendedHabit.instructions && unifiedResults.recommendedHabit.instructions.length > 0 
                    ? unifiedResults.recommendedHabit.instructions 
                    : [
                        'Step away from your screen and look at something in nature or a calm space.',
                        'Take a few deep breaths and stretch gently.',
                        'Return with a clearer mind and better focus.'
                      ]
                  ).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#173247]">
                      <span className="w-5 h-5 rounded-full bg-[#E8F5EF] text-[#147561] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Info Box */}
              <div className="bg-[#F2F9F5] border border-[#E0EFE6] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#173247]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#147561]" />
                  <span>Time: {unifiedResults.recommendedHabit.estimatedTime || '5 min'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-[#147561]" />
                  <span>Effort: {unifiedResults.recommendedHabit.effortLevel || 'Very gentle'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#71839A] text-[11px] w-full sm:w-auto">
                  <span className="font-semibold text-[#147561]">Alternative:</span>
                  <span className="line-clamp-1">{unifiedResults.recommendedHabit.alternative || "If you can't step away, try a 5-minute mindful breathing exercise."}</span>
                </div>
              </div>
            </div>

            {/* C. Your Restorative Exercise */}
            <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-full bg-[#F0EDFC] text-[#6E56CF] flex items-center justify-center">
                  <Flower2 className="w-5 h-5 text-[#6E56CF]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#6E56CF] tracking-wide block uppercase">
                    Your Restorative Exercise
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#173247]">
                    {unifiedResults.restorativeExercise.title || 'Gentle Breathing for Calm'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#71839A] leading-relaxed">
                  {unifiedResults.restorativeExercise.type 
                    ? `A simple ${unifiedResults.restorativeExercise.type.toLowerCase()} exercise to help you feel centered and relaxed.` 
                    : 'A simple breathing exercise to help you feel centered and relaxed.'}
                </p>

                {/* Concise Numbered Steps */}
                <div className="space-y-2.5 pt-1">
                  {(unifiedResults.restorativeExercise.instructions && unifiedResults.restorativeExercise.instructions.length > 0
                    ? unifiedResults.restorativeExercise.instructions
                    : [
                        'Sit or lie down comfortably.',
                        'Inhale slowly for 4 counts, hold for 4 counts.',
                        'Exhale slowly for 6 counts.',
                        'Repeat for a few minutes, letting your body relax.'
                      ]
                  ).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#173247]">
                      <span className="w-5 h-5 rounded-full bg-[#F0EDFC] text-[#6E56CF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Info Box */}
              <div className="bg-[#F7F5FE] border border-[#ECE7FC] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#173247]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#6E56CF]" />
                  <span>Time: {unifiedResults.restorativeExercise.duration || '3-5 min'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-[#6E56CF]" />
                  <span>Effort: Very gentle</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenBreathing}
                  className="text-[11px] font-bold text-[#6E56CF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Launch Breathing</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1.5 text-[#71839A] text-[11px] w-full">
                  <span className="font-semibold text-[#6E56CF]">Alternative:</span>
                  <span className="line-clamp-1">{unifiedResults.restorativeExercise.alternative || 'If breathing feels uncomfortable, try a guided body scan or simply focus on a peaceful place in your mind.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* D & E. TOP 5 MUSIC & MOVIE RECOMMENDATIONS (TEXT-ONLY)                */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* D. Top 5 Music Recommendations */}
            <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F7]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#147561] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-[#147561]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#173247]">
                        Top 5 Music Recommendations
                      </h3>
                      <p className="text-xs text-[#71839A]">
                        Soothing, uplifting and perfectly matched to your mood and preferences.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('music')}
                    className="text-xs font-semibold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Desktop Column Header */}
                <div className="hidden sm:flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#71839A] bg-[#F7FAFC] rounded-xl border border-[#EDF2F7] mb-1">
                  <span className="flex-1 min-w-0">Track & Artist</span>
                  <span className="w-24 text-left hidden sm:block">Details</span>
                  <span className="flex-1 max-w-[150px] hidden md:block">Why It Fits</span>
                  <span className="shrink-0 text-right pr-2">Listen On</span>
                </div>

                {/* Compact Music Rows with Direct Spotify & Apple Music Redirect Logos */}
                <div className="divide-y divide-[#F0F4F7]">
                  {unifiedResults.musicRecommendations.slice(0, 5).map((song, idx) => {
                    const isPlaying = playingAudioId === song.id;
                    const isSaved = !!savedItemsMap[song.id];
                    const queryEncoded = encodeURIComponent(`${song.title} ${song.artist}`.trim());
                    const spotifySearchHref = song.spotifySearchUrl || `https://open.spotify.com/search/${queryEncoded}`;
                    const appleMusicSearchHref = `https://music.apple.com/search?term=${queryEncoded}`;

                    return (
                      <div
                        key={song.id || idx}
                        className="py-3.5 flex flex-col gap-2 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Number Badge + Title & Artist */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-full bg-[#F4F7F9] text-[#173247] font-semibold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-[#173247] truncate group-hover:text-[#147561] transition-colors">
                                {song.title}
                              </h4>
                              <p className="text-xs text-[#71839A] truncate">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          {/* Language & Genre */}
                          <div className="text-xs text-[#71839A] font-medium hidden sm:block shrink-0 text-left w-24 truncate">
                            {song.language} · {song.genre}
                          </div>

                          {/* Explanation Reason */}
                          <div className="text-xs text-[#71839A] leading-relaxed hidden md:block flex-1 max-w-[150px] line-clamp-2">
                            {song.whyFits}
                          </div>

                          {/* Stream Redirect Logos & Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Spotify Logo Link */}
                            <a
                              href={spotifySearchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954]/25 text-[#117A37] text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-2xs group/spotify cursor-pointer"
                              title={`Listen to "${song.title}" on Spotify`}
                            >
                              <img
                                src="/assets/platforms/spotify.png"
                                alt="Spotify"
                                className="h-3.5 w-auto max-w-[55px] object-contain"
                              />
                            </a>

                            {/* Apple Music Logo Link */}
                            <a
                              href={appleMusicSearchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FA2D48]/10 hover:bg-[#FA2D48]/20 border border-[#FA2D48]/25 text-[#D61B35] text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-2xs group/apple cursor-pointer"
                              title={`Listen to "${song.title}" on Apple Music`}
                            >
                              <img
                                src="/assets/platforms/apple-music.png"
                                alt="Apple Music"
                                className="w-3.5 h-3.5 object-contain rounded-xs"
                              />
                              <span className="text-[10px] font-bold text-[#D61B35] hidden xl:inline">Apple</span>
                            </a>

                            {/* Audio Chime Preview */}
                            <button
                              type="button"
                              onClick={() => handlePlayAudioPreview(song.id, song.title)}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isPlaying ? 'bg-[#147561] text-white' : 'text-[#71839A] hover:text-[#147561] hover:bg-stone-100'
                              }`}
                              title="Play gentle preview chime"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Bookmark Save */}
                            <button
                              type="button"
                              onClick={() => handleToggleSaveItem(song.id, song.title)}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isSaved ? 'text-amber-600 bg-amber-50' : 'text-[#71839A] hover:text-amber-600 hover:bg-stone-100'
                              }`}
                              title="Save track"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile view of Stream on */}
                        <div className="flex sm:hidden items-center justify-between pt-1 border-t border-[#F0F4F7] text-xs">
                          <span className="text-[11px] font-semibold text-[#71839A]">Listen on:</span>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={spotifySearchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1DB954]/10 border border-[#1DB954]/25"
                            >
                              <img
                                src="/assets/platforms/spotify.png"
                                alt="Spotify"
                                className="h-3 w-auto max-w-[50px] object-contain"
                              />
                            </a>
                            <a
                              href={appleMusicSearchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FA2D48]/10 border border-[#FA2D48]/25"
                            >
                              <img
                                src="/assets/platforms/apple-music.png"
                                alt="Apple Music"
                                className="w-3 h-3 object-contain rounded-xs"
                              />
                              <span className="text-[10px] font-bold text-[#D61B35]">Apple</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* E. Top 5 Movie Recommendations */}
            <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F7]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#E8F5EF] text-[#147561] flex items-center justify-center shrink-0">
                      <Film className="w-4 h-4 text-[#147561]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#173247]">
                        Top 5 Movie Recommendations
                      </h3>
                      <p className="text-xs text-[#71839A]">
                        Heartwarming, peaceful and feel-good stories for today.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('movies')}
                    className="text-xs font-semibold text-[#147561] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Desktop Column Header with Available OTT */}
                <div className="hidden sm:flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#71839A] bg-[#F7FAFC] rounded-xl border border-[#EDF2F7] mb-1">
                  <span className="flex-1 min-w-0">Film & Details</span>
                  <span className="flex-1 max-w-[150px] hidden md:block">Why It Fits</span>
                  <span className="w-36 text-center hidden sm:block">Available OTT</span>
                  <span className="shrink-0 text-right pr-2">Save</span>
                </div>

                {/* Compact Movie Rows with Dedicated Available OTT Column */}
                <div className="divide-y divide-[#F0F4F7]">
                  {unifiedResults.movieRecommendations.slice(0, 5).map((movie, idx) => {
                    const isSaved = !!savedItemsMap[movie.id];
                    const ottPlatforms = getMovieOttList(movie);
                    const searchHref = movie.platformSearchUrl || `https://www.google.com/search?q=${encodeURIComponent(`${movie.title} movie watch online`)}`;

                    return (
                      <div
                        key={movie.id || idx}
                        className="py-3.5 flex flex-col gap-2 group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Number Badge + Title & Metadata */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-full bg-[#F4F7F9] text-[#173247] font-semibold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-[#173247] truncate group-hover:text-[#147561] transition-colors">
                                {movie.title}
                              </h4>
                              <p className="text-xs text-[#71839A] truncate">
                                {movie.year ? `${movie.year} · ` : ''}{movie.language} · {movie.genre}
                              </p>
                            </div>
                          </div>

                          {/* Description & Personalized Reason */}
                          <div className="text-xs text-[#71839A] leading-relaxed hidden md:block flex-1 max-w-[150px] line-clamp-2">
                            {movie.description || movie.whyFits}
                          </div>

                          {/* COLUMN: AVAILABLE OTT (Dedicated column with interactive OTT logos) */}
                          <div className="w-36 hidden sm:flex items-center justify-center gap-1.5 shrink-0">
                            {ottPlatforms.map(plat => (
                              <a
                                key={plat.key}
                                href={plat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-7 h-7 rounded-lg border p-1 flex items-center justify-center transition-all hover:scale-115 shadow-2xs hover:shadow-xs cursor-pointer ${plat.bgClass}`}
                                title={`Watch "${movie.title}" on ${plat.name}`}
                              >
                                <img
                                  src={plat.logo}
                                  alt={plat.name}
                                  className="w-full h-full object-contain"
                                />
                              </a>
                            ))}
                            <a
                              href={searchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 rounded-lg bg-[#F4F7F9] hover:bg-stone-200 border border-[#E1EAF1] text-[#71839A] hover:text-[#173247] flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                              title="Check other streaming providers"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Actions: Save Movie Bookmark */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSaveItem(movie.id, movie.title)}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isSaved ? 'text-amber-600 bg-amber-50' : 'text-[#71839A] hover:text-amber-600 hover:bg-stone-100'
                              }`}
                              title="Save movie"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile view of Available OTT (<640px) */}
                        <div className="flex sm:hidden items-center justify-between pt-1 border-t border-[#F0F4F7] text-xs">
                          <span className="text-[11px] font-semibold text-[#71839A]">Available OTT:</span>
                          <div className="flex items-center gap-1.5">
                            {ottPlatforms.map(plat => (
                              <a
                                key={plat.key}
                                href={plat.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-7 h-7 rounded-lg border p-1 flex items-center justify-center transition-all shadow-2xs ${plat.bgClass}`}
                                title={`Watch "${movie.title}" on ${plat.name}`}
                              >
                                <img
                                  src={plat.logo}
                                  alt={plat.name}
                                  className="w-full h-full object-contain"
                                />
                              </a>
                            ))}
                            <a
                              href={searchHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-[#147561] hover:underline flex items-center gap-0.5 ml-1"
                              title="Check other providers"
                            >
                              <span>Search</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* F. BOTTOM CARDS: USER QUESTION ANSWER & NEXT SMALL STEP               */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Your question, answered */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#147561] flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle className="w-5 h-5 text-[#147561]" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-xs font-bold text-[#147561] tracking-wide block uppercase">
                  Your question, answered.
                </span>
                <p className="font-medium text-xs sm:text-sm text-[#173247] italic">
                  "{finalQuestion || "What's a good way to stay calm when I feel overwhelmed?"}"
                </p>
                <p className="text-xs sm:text-sm text-[#71839A] leading-relaxed pt-1">
                  {unifiedResults.userQuestionAnswer || "Try a 5-minute breathing exercise, take a short walk, or listen to calming music. These small actions can help you slow down, clear your mind, and feel more in control. You can also keep a simple to-do list to focus on one thing at a time."}
                </p>
              </div>
            </div>

            {/* Card 2: Your next small step */}
            <div className="bg-white rounded-3xl border border-[#E1EAF1] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#E8F5EF] text-[#147561] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-[#147561]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm sm:text-base text-[#173247]">
                    Your next small step
                  </h4>
                  <p className="text-xs text-[#71839A] leading-relaxed">
                    {unifiedResults.nextSmallStep?.suggestion || 'Try the recommended habit or explore your music suggestions.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onOpenBreathing}
                  className="bg-[#10594E] hover:bg-[#147561] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Try Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPhase('phase_6_feedback')}
                  className="border border-[#E1EAF1] hover:bg-[#F5F8FC] text-[#173247] text-xs font-semibold px-4 py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Continue to Feedback</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentPhase('phase_3_conversation')}
              className="px-5 py-2.5 rounded-full border border-[#E1EAF1] text-xs font-semibold text-[#71839A] hover:text-[#173247] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Questionnaire Answers</span>
            </button>

            <button
              type="button"
              onClick={handleStartFreshSession}
              className="px-5 py-2.5 rounded-full bg-white border border-[#E1EAF1] hover:bg-[#F5F8FC] text-xs font-semibold text-[#173247] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Session</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 6: FEEDBACK                                                         */}
      {/* ========================================================================= */}
      {currentPhase === 'phase_6_feedback' && (
        <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 sm:p-10 shadow-2xs space-y-8 animate-fade-in max-w-2xl mx-auto">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#176B57] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B57]">
              Step 6 of 6 · Session Feedback
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#172B3A]">
              How well did MindMate understand what you needed today?
            </h2>
            <p className="text-xs text-[#657587]">
              Your ratings help refine recommendations for future check-ins without making separate external AI calls.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-6 bg-[#F4F8F5] border border-[#D3E8DC] rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#176B57] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-[#172B3A] text-sm">Thank you for your feedback!</h3>
                <p className="text-xs text-[#4A5D6E]">
                  Your session responses have been recorded in your mindful history. Your stable taste profile remains safely preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartFreshSession}
                className="bg-[#176B57] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#104C40] transition-colors"
              >
                Start A Fresh Session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Feedback Question */}
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-3">
                  {(['Very helpful', 'Somewhat helpful', 'Not quite right'] as const).map(choice => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setHelpfulnessRating(choice)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        helpfulnessRating === choice
                          ? 'bg-[#176B57] text-white shadow-2xs'
                          : 'bg-[#F7F9FC] text-[#657587] border border-[#E4EAF0] hover:bg-[#E8F5EF]'
                      }`}
                    >
                      {choice === 'Very helpful' ? '✨ ' : choice === 'Somewhat helpful' ? '👍 ' : '🤔 '}
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Question 1: Favorite Recommendation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#172B3A] block">
                  Which recommendation did you like most? (Optional)
                </label>
                <input
                  type="text"
                  value={favoriteRecText}
                  onChange={(e) => setFavoriteRecText(e.target.value)}
                  placeholder="e.g., The acoustic song or the 5-minute breathing habit..."
                  className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57]"
                />
              </div>

              {/* Optional Question 2: Language Accuracy */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#172B3A] block">
                  Was the language and regional content correct?
                </label>
                <div className="flex gap-2">
                  {(['Yes', 'Partially', 'No'] as const).map(ans => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => setWasLanguageCorrect(ans)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        wasLanguageCorrect === ans
                          ? 'bg-[#172B3A] text-white'
                          : 'bg-[#F0F4F8] text-[#657587]'
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Question 3: Discovery vs Familiarity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#172B3A] block">
                  Would you prefer more familiar content or new discoveries next time?
                </label>
                <div className="flex gap-2">
                  {(['More familiar', 'Balanced', 'More discoveries'] as const).map(ans => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => setDiscoveryBalanceChoice(ans)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        discoveryBalanceChoice === ans
                          ? 'bg-[#176B57] text-white'
                          : 'bg-[#F0F4F8] text-[#657587]'
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Question 4: Free-text note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#172B3A] block">
                  What should MindMate change next time?
                </label>
                <textarea
                  value={feedbackFeedbackNotes}
                  onChange={(e) => setFeedbackFeedbackNotes(e.target.value)}
                  placeholder="e.g., More upbeat Telugu songs or shorter documentaries..."
                  rows={2}
                  maxLength={300}
                  className="w-full p-2.5 rounded-xl border border-[#E4EAF0] text-xs focus:outline-none focus:border-[#176B57] resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#E4EAF0]">
                <button
                  type="button"
                  onClick={() => setCurrentPhase('phase_5_results')}
                  className="px-4 py-2 rounded-xl border border-[#E4EAF0] text-xs font-semibold text-[#657587]"
                >
                  Back to Results
                </button>

                <button
                  type="button"
                  onClick={handleSaveFeedback}
                  className="bg-[#176B57] hover:bg-[#104C40] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Feedback & Complete Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SequentialWorkflow;
