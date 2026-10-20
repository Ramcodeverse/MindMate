import { GoogleGenAI } from '@google/genai';
import { MoodRecord } from './types.js';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself',
  'cutting myself', 'hanging myself', 'no reason to live', 'better off dead'
];

export interface ReflectionContext {
  userName: string;
  recentMood?: MoodRecord | null;
  activeHabitStreak?: number;
  recentHabitsCount?: number;
}

export function detectCrisisIntent(message: string): boolean {
  const lower = message.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

export function getCrisisResponse(): string {
  return `I hear how much pain you are holding right now, and I want you to know that your life matters and you do not have to carry this alone. 

Because I am an AI wellness companion and not a human doctor or emergency service, please reach out directly to compassionate, trained professionals right now:

• **988 Suicide & Crisis Lifeline**: Call or text **988** (Available 24/7 in the US and Canada, free and confidential)
• **Crisis Text Line**: Text **HOME** to **741741** to connect with a crisis counselor
• **International Support**: Visit [findahelpline.com](https://findahelpline.com) for immediate support in your country
• **Emergency Services**: Call your local emergency number (e.g. 911, 999, 112) or go to the nearest hospital.

Please reach out to one of these resources or contact a trusted friend or family member right now. You deserve support and care.`;
}

// Fallback reflection responses when Gemini API key is not configured or in case of network timeout
export function getReflectiveFallback(userMessage: string, context?: ReflectionContext): string {
  const lower = userMessage.toLowerCase();
  const name = context?.userName ? ` ${context.userName}` : '';

  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('panic') || lower.includes('worry')) {
    return `Thank you for expressing that,${name}. Anxiety often feels like your nervous system is sounding an alarm. 
    
Take a gentle pause right here. Notice your feet resting against the floor, and take a long, slow breath out through your mouth. What is one tangible, steady thing you can touch or look at in your room right now? You are safe in this moment.`;
  }

  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('burnout') || lower.includes('drained')) {
    return `I hear the fatigue in your words,${name}. It takes energy just to admit when you are depleted.
    
Give yourself permission to pause without feeling guilty. What is one demand or expectation you could gently set aside for the rest of today? Rest is not a reward you earn; it is a fundamental need.`;
  }

  if (lower.includes('grateful') || lower.includes('happy') || lower.includes('proud') || lower.includes('good') || lower.includes('win')) {
    return `What a wonderful gift to pause and celebrate that,${name}! It is so easy to let good moments slip past unnoticed, but taking time to savor this builds resilience and joy. 
    
How does this feeling register in your body right now? Let yourself really soak in this warmth today.`;
  }

  if (lower.includes('habit') || lower.includes('streak') || lower.includes('routine')) {
    return `Building daily consistency is not about flawless perfection,${name}—it is about gentle return. Even on days when you can only do 1% of a habit, showing up for yourself reinforces that your well-being matters. How did your routine feel today?`;
  }

  return `Thank you for sharing that with me,${name}. In a fast-paced world, simply taking a minute to type out how you are feeling is an act of mindfulness.

When you sit with what you just described, what emotion feels most prominent underneath? I am here to listen and reflect with you.`;
}

export async function generateReflectionReply(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: ReflectionContext
): Promise<{ text: string; isCrisis: boolean; provider: 'gemini' | 'reflective-engine' }> {
  // 1. Mandatory crisis safety check
  if (detectCrisisIntent(userMessage)) {
    return {
      text: getCrisisResponse(),
      isCrisis: true,
      provider: 'reflective-engine',
    };
  }

  // 2. Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      text: getReflectiveFallback(userMessage, context),
      isCrisis: false,
      provider: 'reflective-engine',
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'mindmate-app',
        },
      },
    });

    const systemInstruction = `You are MindMate's AI Reflection Companion. You are a calm, compassionate, emotionally intelligent wellness companion.
Your role:
- Offer active listening, thoughtful gentle questions, cognitive reframing, and grounding exercises.
- Speak in warm, concise, emotionally supportive language (2-4 brief paragraphs).
- NEVER diagnose illnesses, prescribe medication, or claim to be a licensed therapist or psychiatrist.
- Validate the user's feelings first before offering perspectives or gentle breathwork suggestions.
- If the user shares a win or gratitude, savor it with them.
${context?.userName ? `The user's name is ${context.userName}.` : ''}
${context?.recentMood ? `Their recent mood was logged as ${context.recentMood.moodLabel} (energy: ${context.recentMood.energyLevel}/10).` : ''}
${context?.activeHabitStreak ? `They currently have an active habit streak of ${context.activeHabitStreak} days.` : ''}`;

    // Convert past messages into conversation context
    const recentHistory = history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Companion'}: ${h.content}`).join('\n\n');
    const prompt = `${recentHistory ? `Previous conversation:\n${recentHistory}\n\n` : ''}User: ${userMessage}\n\nCompanion:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text?.trim() || getReflectiveFallback(userMessage, context);
    return {
      text: reply,
      isCrisis: false,
      provider: 'gemini',
    };
  } catch (error) {
    console.warn('[AI Reflection Service] Gemini call failed or timed out, using fallback:', error);
    return {
      text: getReflectiveFallback(userMessage, context),
      isCrisis: false,
      provider: 'reflective-engine',
    };
  }
}

// =========================================================================
// UNIFIED RECOMMENDATION ENGINE TYPES & CONSOLIDATED GEMINI PIPELINE
// =========================================================================

export interface UnifiedRecommendationRequest {
  mood: {
    primaryEmotion: string;
    secondaryEmotion?: string;
    energyLevel: number;
    stressLevel: number;
    primaryIntention: string;
    secondaryIntentions?: string[];
    personalNote?: string;
  };
  profile: {
    responseLanguage?: string;
    musicLanguages?: string[];
    movieLanguages?: string[];
    viewingRegion?: string;
    subtitlesOrDubbed?: string;
    favoriteMusicGenres?: string[];
    musicArtistsOrSongs?: string;
    musicAvoidances?: string;
    favoriteMovieGenres?: string[];
    movieFilmmakersOrActors?: string;
    movieDurationPreference?: string;
    movieAvoidances?: string;
  };
  conversation: {
    sectionA: {
      kindOfDay: string;
      helpfulNow?: string;
      timeAvailable: string;
      supportStyle: string;
    };
    sectionB: {
      sessionResponseLanguage: string;
      sessionMusicLanguages: string[];
      sessionMovieLanguages: string[];
      contentToAvoid: string[];
      avoidNote?: string;
    };
    sectionC: {
      musicSoundKind: string;
      listeningStyle: string;
      familiarVsDiscovery: string;
      intensity: string;
      musicNotes?: string;
    };
    sectionD: {
      movieExperience: string;
      movieDuration: string;
      viewingEnvironment: string;
      smallActivities: string[];
      effortLevel: string;
      practicalLimitations: string[];
    };
    finalQuestion?: string;
  };
  historyStats?: {
    totalCompletions?: number;
    savedCount?: number;
    ratedCount?: number;
  };
}

export interface UnifiedSongItem {
  id: string;
  title: string;
  artist: string;
  language: string;
  genre: string;
  whyFits: string;
  isSavedMatchOrDiscovery: 'Saved Preference' | 'New Discovery' | 'Curated Match';
  searchUrl: string;
  spotifySearchUrl: string;
  youtubeSearchUrl: string;
}

export interface UnifiedMovieItem {
  id: string;
  title: string;
  year: string | number;
  language: string;
  genre: string;
  description: string;
  whyFits: string;
  duration: string;
  suggestedPlatform: string;
  platformSearchUrl: string;
  ottVerified: false;
}

export interface UnifiedRecommendationResponse {
  sessionSummary: string;
  moodInterpretation: string;
  reasoningExplanation: string;
  recommendedHabit: {
    title: string;
    whyHelpful: string;
    estimatedTime: string;
    instructions: string[];
    effortLevel: string;
    alternative: string;
  };
  restorativeExercise: {
    title: string;
    type: string;
    duration: string;
    instructions: string[];
    alternative: string;
    isOptional: boolean;
  };
  musicRecommendations: UnifiedSongItem[];
  movieRecommendations: UnifiedMovieItem[];
  userQuestionAnswer?: string | null;
  nextSmallStep: {
    action: string;
    suggestion: string;
  };
  uncertaintiesOrLimitations: string;
  meta: {
    provider: 'gemini' | 'mindmate-curated-fallback';
    generatedAt: string;
    isCrisis?: boolean;
  };
}

function buildMusicSearchUrls(title: string, artist: string): { searchUrl: string; spotifySearchUrl: string; youtubeSearchUrl: string } {
  const query = encodeURIComponent(`${title} ${artist}`.trim());
  const spotify = `https://open.spotify.com/search/${query}`;
  const youtube = `https://music.youtube.com/search?q=${query}`;
  return {
    searchUrl: spotify,
    spotifySearchUrl: spotify,
    youtubeSearchUrl: youtube,
  };
}

function buildMovieSearchUrls(title: string, year: string | number, platform?: string): string {
  const cleanTitle = title.trim();
  const cleanPlatform = (platform || '').toLowerCase();
  
  if (cleanPlatform.includes('netflix')) {
    return `https://www.netflix.com/search?q=${encodeURIComponent(cleanTitle)}`;
  }
  if (cleanPlatform.includes('prime') || cleanPlatform.includes('amazon')) {
    return `https://www.amazon.com/s?k=${encodeURIComponent(`${cleanTitle} movie`)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${cleanTitle} ${year} ${platform || 'movie'} watch online`)}`;
}

// Fallback Curated Recommendation Engine for zero-Gemini-key / offline operation
export function generateCuratedFallbackRecommendations(
  req: UnifiedRecommendationRequest,
  userName: string = 'Friend'
): UnifiedRecommendationResponse {
  const primaryEmotion = req.mood?.primaryEmotion || 'Calm';
  const intention = req.mood?.primaryIntention || 'Relax';
  const responseLang = req.conversation?.sectionB?.sessionResponseLanguage || req.profile?.responseLanguage || 'English';
  const musicLangs = req.conversation?.sectionB?.sessionMusicLanguages?.length
    ? req.conversation.sectionB.sessionMusicLanguages
    : (req.profile?.musicLanguages?.length ? req.profile.musicLanguages : ['English']);
  const movieLangs = req.conversation?.sectionB?.sessionMovieLanguages?.length
    ? req.conversation.sectionB.sessionMovieLanguages
    : (req.profile?.movieLanguages?.length ? req.profile.movieLanguages : ['English']);

  const isTeluguPreferred = musicLangs.some(l => l.toLowerCase().includes('telugu')) || movieLangs.some(l => l.toLowerCase().includes('telugu'));
  const isHindiPreferred = musicLangs.some(l => l.toLowerCase().includes('hindi')) || movieLangs.some(l => l.toLowerCase().includes('hindi'));
  const isTamilPreferred = musicLangs.some(l => l.toLowerCase().includes('tamil')) || movieLangs.some(l => l.toLowerCase().includes('tamil'));

  // Build authentic 5 songs
  const songsRaw = isTeluguPreferred ? [
    { title: 'Samajavaragamana', artist: 'Sid Sriram', lang: 'Telugu', genre: 'Acoustic Melody', fit: 'Soulful melodic cadence that helps quiet an active mind.' },
    { title: 'Inkem Inkem Inkem Kaavaale', artist: 'Sid Sriram & Gopi Sundar', lang: 'Telugu', genre: 'Romantic Melody', fit: 'Gentle rhythmic tempo offering uplifting warmth.' },
    { title: 'Priyamitham', artist: 'K. S. Chithra', lang: 'Telugu', genre: 'Devotional Classical', fit: 'Serene instrumental and vocal texture for grounding.' },
    { title: 'Neeli Neeli Aakasam', artist: 'Sid Sriram & Sunitha', lang: 'Telugu', genre: 'Contemporary Folk', fit: 'Lighthearted, open frequency providing effortless relaxation.' },
    { title: 'Undiporaadhey (Sad / Soul)', artist: 'Sid Sriram', lang: 'Telugu', genre: 'Introspective Soul', fit: 'Warm acoustic instrumentation for quiet evening decompression.' },
  ] : isHindiPreferred ? [
    { title: 'Kasoor (Acoustic)', artist: 'Prateek Kuhad', lang: 'Hindi', genre: 'Indie Folk', fit: 'Soft acoustic guitar and mellow vocals for an easy unwind.' },
    { title: 'Iktara', artist: 'Kavita Seth & Amit Trivedi', lang: 'Hindi', genre: 'Sufi Folk', fit: 'Warm, spiritually grounded soundscape offering calm reassurance.' },
    { title: 'Kabira (Encore)', artist: 'Harshdeep Kaur & Arijit Singh', lang: 'Hindi', genre: 'Contemporary Acoustic', fit: 'Gently reflective melody that honors emotional balance.' },
    { title: 'Kun Faya Kun', artist: 'A.R. Rahman & Javed Ali', lang: 'Hindi', genre: 'Devotional Ambient', fit: 'Spacious orchestration promoting tranquility and mental stillness.' },
    { title: 'Kho Gaye Hum Kahan', artist: 'Jasleen Royal & Prateek Kuhad', lang: 'Hindi', genre: 'Lo-Fi Acoustic', fit: 'Delicate, intimate harmonies ideal for winding down.' },
  ] : isTamilPreferred ? [
    { title: 'Munbe Vaa', artist: 'Naresh Iyer & Shreya Ghoshal', lang: 'Tamil', genre: 'Melodic Classical', fit: 'Spacious classical arrangement providing deep auditory peace.' },
    { title: 'Poove Sempoove', artist: 'K. J. Yesudas & Ilaiyaraaja', lang: 'Tamil', genre: 'Nostalgic Classical', fit: 'Legendary serene orchestration that relaxes the nervous system.' },
    { title: 'Marakkuma Nenjam', artist: 'A.R. Rahman', lang: 'Tamil', genre: 'Acoustic Soul', fit: 'Warm low frequencies designed for evening calm.' },
    { title: 'Kadhaippoma', artist: 'Sid Sriram', lang: 'Tamil', genre: 'Light Indie Melody', fit: 'Bright and comforting vocal textures to lift the heart.' },
    { title: 'Thendral Vanthu Theendumbothu', artist: 'Ilaiyaraaja & S. Janaki', lang: 'Tamil', genre: 'Golden Melody', fit: 'Timeless gentle breezes of flute and strings.' },
  ] : [
    { title: 'Holocene', artist: 'Bon Iver', lang: 'English', genre: 'Indie Folk / Ambient', fit: 'Delicate acoustic guitar and layered harmonies that ground anxious thoughts.' },
    { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', lang: 'Instrumental', genre: 'Neo-Classical Piano', fit: 'Flowing, unobtrusive piano cadence that fosters deep calm.' },
    { title: 'San Luis', artist: 'Gregory Alan Isakov', lang: 'English', genre: 'Acoustic Folk', fit: 'Warm analog warmth and gentle fingerpicking to unwind tension.' },
    { title: 'Weightless', artist: 'Marconi Union', lang: 'Instrumental', genre: 'Ambient Soundscape', fit: 'Engineered in collaboration with sound therapists to slow heart rate.' },
    { title: 'Daylight', artist: 'David Kushner', lang: 'English', genre: 'Reflective Soul', fit: 'Deep resonant frequencies that provide a comforting emotional outlet.' },
  ];

  const musicRecommendations: UnifiedSongItem[] = songsRaw.map((s, idx) => {
    const urls = buildMusicSearchUrls(s.title, s.artist);
    return {
      id: `fallback_mus_${idx + 1}`,
      title: s.title,
      artist: s.artist,
      language: s.lang,
      genre: s.genre,
      whyFits: s.fit,
      isSavedMatchOrDiscovery: idx === 0 ? 'Saved Preference' : idx === 3 ? 'Curated Match' : 'New Discovery',
      searchUrl: urls.searchUrl,
      spotifySearchUrl: urls.spotifySearchUrl,
      youtubeSearchUrl: urls.youtubeSearchUrl,
    };
  });

  // Build authentic 5 movies
  const moviesRaw = isTeluguPreferred ? [
    { title: 'C/o Kancharapalem', year: 2018, lang: 'Telugu', genre: 'Heartwarming Slice-of-Life', desc: 'Four unconventional, deeply touching love stories set in a quaint Andhra village.', fit: 'Genuinely heartwarming without artificial melodrama; restores faith in ordinary people.', dur: '152 min', platform: 'Netflix' },
    { title: 'Mithunam', year: 2012, lang: 'Telugu', genre: 'Gentle Drama', desc: 'An elderly retired couple living in self-sustained peace discover daily joys together.', fit: 'Slow, nourishing pacing that calms mental clutter and celebrates simplicity.', dur: '124 min', platform: 'YouTube / Prime Video' },
    { title: 'Pelli Choopulu', year: 2016, lang: 'Telugu', genre: 'Whimsical Romantic Comedy', desc: 'Two ambitious youths meet during an arranged matchmaking meeting and start a food truck.', fit: 'Uplifting modern humor with relatable, lighthearted charm.', dur: '127 min', platform: 'Sun Nxt / Prime Video' },
    { title: 'Brochevarevarura', year: 2019, lang: 'Telugu', genre: 'Lighthearted Comedy / Drama', desc: 'Three easygoing college friends try to pull off a harmless plan with hilarious mix-ups.', fit: 'Fun, clever pacing that provides an engaging, guilt-free distraction.', dur: '138 min', platform: 'Prime Video' },
    { title: 'Sita Ramam', year: 2022, lang: 'Telugu', genre: 'Poetic Period Romance', desc: 'An orphaned soldier receives mysterious compassionate letters from an unknown woman named Sita.', fit: 'Visually lush cinematography and gentle emotional warmth.', dur: '163 min', platform: 'Prime Video' },
  ] : isHindiPreferred ? [
    { title: 'Taare Zameen Par', year: 2007, lang: 'Hindi', genre: 'Heartwarming Drama', desc: 'An empathetic art teacher discovers the unique creative brilliance in a struggling 8-year-old child.', fit: 'Deeply comforting and emotionally validating without cynicism.', dur: '165 min', platform: 'Netflix' },
    { title: 'Dear Zindagi', year: 2016, lang: 'Hindi', genre: 'Mindfulness & Healing Drama', desc: 'A young cinematographer meets an unconventional psychologist who helps her reframe life.', fit: 'Directly addresses everyday anxiety, burnout, and self-compassion.', dur: '151 min', platform: 'Netflix' },
    { title: 'The Lunchbox', year: 2013, lang: 'Hindi', genre: 'Poetic Slice-of-Life', desc: 'A mistaken delivery in Mumbai connects a lonely housewife with an older widower through handwritten letters.', fit: 'Intimate, warm, and restorative with gentle nostalgic pacing.', dur: '104 min', platform: 'Prime Video' },
    { title: 'Queen', year: 2014, lang: 'Hindi', genre: 'Uplifting Comedy / Self-Discovery', desc: 'After a wedding falls through, a sheltered young woman embarks on a solo honeymoon abroad.', fit: 'Sparks self-reliance, radiant optimism, and genuine joy.', dur: '144 min', platform: 'Netflix / JioCinema' },
    { title: 'Udaan', year: 2010, lang: 'Hindi', genre: 'Inspirational Coming-of-Age', desc: 'A young boy who dreams of becoming a poet finds his inner courage to forge his own path.', fit: 'Resilient and quietly motivating when you need renewal.', dur: '134 min', platform: 'Netflix' },
  ] : [
    { title: 'The Secret Life of Walter Mitty', year: 2013, lang: 'English', genre: 'Inspiring Adventure / Comedy', desc: 'A daydreamer leaves his routine darkroom job on an expansive global journey through Iceland and the Himalayas.', fit: 'Expands your mental horizon and gently sparks curiosity without tension.', dur: '114 min', platform: 'Disney+ / Prime Video' },
    { title: 'My Neighbor Totoro', year: 1988, lang: 'Japanese / English Dub', genre: 'Gentle Animation', desc: 'Two young sisters move to the countryside and befriend playful, benevolent forest spirits.', fit: 'Pure whimsical calm; proven to lower stress through serene nature visuals.', dur: '86 min', platform: 'Netflix / Max' },
    { title: 'Amélie', year: 2001, lang: 'French / Subtitles', genre: 'Whimsical Romantic Comedy', desc: 'An imaginative Parisian waitress secretly orchestrates small acts of quiet happiness for strangers.', fit: 'Delightfully creative, visually warm, and profoundly comforting.', dur: '122 min', platform: 'Apple TV / Prime Video' },
    { title: 'A Beautiful Day in the Neighborhood', year: 2019, lang: 'English', genre: 'Warm Biographical Drama', desc: 'A cynical investigative journalist is assigned to profile the beloved Fred Rogers and learns emotional grace.', fit: 'Masterclass in gentle validation, emotional regulation, and kindness.', dur: '109 min', platform: 'Netflix / Prime Video' },
    { title: 'Fantastic Fungi', year: 2019, lang: 'English', genre: 'Nature Documentary', desc: 'A mesmerizing visual journey into the subterranean mycelial networks that sustain life on Earth.', fit: 'Breathtaking time-lapse nature photography that naturally decelerates racing thoughts.', dur: '81 min', platform: 'Netflix' },
  ];

  const movieRecommendations: UnifiedMovieItem[] = moviesRaw.map((m, idx) => {
    return {
      id: `fallback_mov_${idx + 1}`,
      title: m.title,
      year: m.year,
      language: m.lang,
      genre: m.genre,
      description: m.desc,
      whyFits: m.fit,
      duration: m.dur,
      suggestedPlatform: m.platform,
      platformSearchUrl: buildMovieSearchUrls(m.title, m.year, m.platform),
      ottVerified: false,
    };
  });

  const question = req.conversation?.finalQuestion?.trim();
  let questionAnswer: string | null = null;
  if (question) {
    questionAnswer = `Thank you for sharing that question, ${userName}. When you find yourself in this exact space—navigating ${primaryEmotion.toLowerCase()} feelings while seeking to ${intention.toLowerCase()}—the most beneficial thing you can do right now is lower your internal demands. Focus on one small sensory cue (a warm drink, unclenching your jaw, or a 5-minute quiet pause). Combine the gentle restorative breathing exercise below with whichever movie or soundscape calls to you first. You do not have to finish everything today; simply letting your body unwind is your real priority.`;
  }

  return {
    sessionSummary: `Based on your check-in today, ${userName}, you are experiencing ${primaryEmotion.toLowerCase()} energy (level ${req.mood?.energyLevel ?? 5}/10, tension ${req.mood?.stressLevel ?? 5}/10) with an intention to ${intention.toLowerCase()}. We have aligned gentle, high-warmth media recommendations in ${responseLang} matching your preferred languages without altering your established taste profile.`,
    moodInterpretation: `Your self-reported ratings suggest your mind is seeking an unhurried, reassuring environment. Today's focus is on lowering friction, removing sensory overload, and offering soothing pacing.`,
    reasoningExplanation: `We balanced your long-term preferences with today's immediate emotional context. Heavy themes, explicit material, and sudden spikes in intensity were suppressed in accordance with your comfort guidelines.`,
    recommendedHabit: {
      title: '5-Minute Screen-Free Mindful Reset',
      whyHelpful: 'Allows your visual cortex and nervous system to disengage from constant digital stimulation, lowering baseline cortisol.',
      estimatedTime: '5 minutes',
      instructions: [
        'Pour a glass of cool or warm water and sit comfortably away from your screens.',
        'Close your eyes or soften your gaze downward for 60 seconds.',
        'Take three long, unhurried exhalations through your mouth, letting your shoulders drop.',
        'Sip your water slowly, noticing the temperature and physical sensation of swallowing.'
      ],
      effortLevel: req.conversation?.sectionD?.effortLevel || 'Very gentle',
      alternative: 'If you prefer not to step away right now, simply adjust your display brightness down 20% and look at an object 20 feet away for 30 seconds.'
    },
    restorativeExercise: {
      title: 'Gentle Box Breathing & Vagus Nerve Release',
      type: 'Breathing & Grounding',
      duration: '4 minutes',
      instructions: [
        'Find a comfortable seated position with your feet resting flat on the ground.',
        'Inhale slowly through your nose for a count of 4.',
        'Hold the breath gently without tension for a count of 4.',
        'Exhale smoothly through parted lips for a count of 4.',
        'Pause empty for a count of 4, then repeat for 4 cycles.'
      ],
      alternative: 'If breath counting feels stressful, simply lengthen your exhale to be slightly longer than your inhale.',
      isOptional: true
    },
    musicRecommendations,
    movieRecommendations,
    userQuestionAnswer: questionAnswer,
    nextSmallStep: {
      action: 'Start with 60 seconds of gentle breathing',
      suggestion: 'Queue up your preferred soundscape, dim the room lights, and let yourself rest.'
    },
    uncertaintiesOrLimitations: 'Streaming platform availability fluctuates across regional libraries and is Not verified live; please check your local subscription. Music links open verified official search results on streaming providers.',
    meta: {
      provider: 'mindmate-curated-fallback',
      generatedAt: new Date().toISOString()
    }
  };
}

// Consolidated Single-Request Gemini Generator
export async function generateUnifiedRecommendations(
  req: UnifiedRecommendationRequest,
  context: { userName: string; historyStats?: { savedCount?: number; likedCount?: number; ratedCount?: number } }
): Promise<UnifiedRecommendationResponse> {
  const userName = context?.userName || 'Friend';

  // 1. Check for immediate crisis indications in personal notes or final question
  const combinedText = `${req.mood?.personalNote || ''} ${req.conversation?.finalQuestion || ''}`.trim();
  if (detectCrisisIntent(combinedText)) {
    const crisisFallback = generateCuratedFallbackRecommendations(req, userName);
    return {
      ...crisisFallback,
      sessionSummary: getCrisisResponse(),
      moodInterpretation: 'Safety First: We detected words indicating severe emotional distress. Your well-being and safety are the absolute priority.',
      userQuestionAnswer: getCrisisResponse(),
      meta: {
        provider: 'mindmate-curated-fallback',
        generatedAt: new Date().toISOString(),
        isCrisis: true,
      }
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[MindMate AI] No GEMINI_API_KEY configured. Utilizing curated recommendation engine.');
    return generateCuratedFallbackRecommendations(req, userName);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'mindmate-app',
        },
      },
    });

    const systemInstruction = `You are MindMate AI's master recommendation engine.
You personalize music, cinema, and wellness activities based on the user's immediate emotional state, temporary session needs, and long-term taste profile.

CRITICAL RULES:
1. GATHER ALL CONTEXT: Formulate the entire recommendation response in ONE consolidated JSON object.
2. RECOMMENDATIONS:
   - Provide EXACTLY 5 real, authentic, well-known music tracks that genuinely fit the user's requested languages, mood, and listening style.
   - Provide EXACTLY 5 real, well-regarded feature films or documentaries that match their preferred languages, duration, and viewing context.
   - For every music and movie item, provide a clear, concise 'whyFits' explanation connecting the item to their stated mood or intention.
   - Respect content exclusions (e.g., avoid violence, horror, or loud music if requested).
3. OTT AVAILABILITY DISCLAIMER:
   - You MUST acknowledge that streaming platform availability varies by country and is "Not verified live".
   - Set 'ottVerified' to false for all movie entries.
4. WELLNESS ACTIONS:
   - Suggest 1 practical, achievable habit for right now (with clear numbered steps and an alternative).
   - Suggest 1 restorative self-care exercise (clearly marked optional).
   - Never diagnose medical or psychiatric conditions; use compassionate non-clinical language.
5. OPEN-ENDED QUESTION:
   - If the user submitted a question in 'finalQuestion', provide a thoughtful, empathetic, direct answer in 'userQuestionAnswer' in their preferred response language.
   - If 'finalQuestion' was empty or omitted, set 'userQuestionAnswer' to null.
6. STABILITY OF PROFILE:
   - Explicitly note in 'reasoningExplanation' how today's temporary session context was honored without overwriting or corrupting their long-term taste profile.
7. PSYCHOLOGICAL ALIGNMENT:
   - When 'psychologyGuidance' is present in userProfilePreferences, strictly align the music recommendations with the stated starting music direction and considerations, and the movie recommendations with the stated movie direction and what MindMate should establish based on psychology.
8. OUTPUT FORMAT:
   - Output valid JSON strictly matching the requested schema. Do NOT include markdown code fences or conversational preambles.`;

    const userPayloadJson = JSON.stringify({
      userName,
      userMoodContext: req.mood,
      userProfilePreferences: req.profile,
      conversationSectionA_Situation: req.conversation?.sectionA,
      conversationSectionB_ComfortAndLanguage: req.conversation?.sectionB,
      conversationSectionC_MusicDiscovery: req.conversation?.sectionC,
      conversationSectionD_CinemaAndActivity: req.conversation?.sectionD,
      optionalFinalQuestion: req.conversation?.finalQuestion || null,
      interactionHistoryStats: context?.historyStats || null,
    }, null, 2);

    const prompt = `Here is the user's comprehensive MindMate questionnaire submission:
${userPayloadJson}

Generate the complete personalized recommendation package as a strictly valid JSON object with the following structure:
{
  "sessionSummary": "Brief personalized session summary (2-3 sentences)",
  "moodInterpretation": "Interpretation of their stated mood, energy, and stress (2 sentences)",
  "reasoningExplanation": "Transparent explanation of the recommendation logic, including separation of today's mood from long-term taste (2-3 sentences)",
  "recommendedHabit": {
    "title": "Habit Title",
    "whyHelpful": "Why it helps right now",
    "estimatedTime": "e.g. 5 minutes",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "effortLevel": "Almost none | Very gentle | Moderate | Something active",
    "alternative": "Gentle alternative if unable to do this"
  },
  "restorativeExercise": {
    "title": "Exercise Title",
    "type": "Breathing | Gentle Stretch | Sensory Grounding | Quiet Reflection | Short Walk",
    "duration": "e.g. 4 minutes",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "alternative": "Alternative option",
    "isOptional": true
  },
  "musicRecommendations": [
    {
      "id": "gem_mus_1",
      "title": "Real Song Title",
      "artist": "Real Artist Name",
      "language": "Song Language (honor user request)",
      "genre": "Genre",
      "whyFits": "Specific reason why this track matches today's state",
      "isSavedMatchOrDiscovery": "Saved Preference | New Discovery | Curated Match"
    }
    // EXACTLY 5 items
  ],
  "movieRecommendations": [
    {
      "id": "gem_mov_1",
      "title": "Real Movie Title",
      "year": 2020,
      "language": "Movie Language (honor user request)",
      "genre": "Genre",
      "description": "Short spoiler-free synopsis",
      "whyFits": "Specific reason why this film fits today's viewing context",
      "duration": "e.g. 105 min",
      "suggestedPlatform": "Suggested platform name (e.g. Netflix, Prime Video, Disney+ Hotstar)",
      "ottVerified": false
    }
    // EXACTLY 5 items
  ],
  "userQuestionAnswer": "Direct answer to optional user question if asked, or null if empty",
  "nextSmallStep": {
    "action": "Immediate small action",
    "suggestion": "Supportive closing thought"
  },
  "uncertaintiesOrLimitations": "Notice clarifying that OTT availability is Not verified live across all regions, and music links are streaming search links."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const rawText = response.text?.trim() || '';
    if (!rawText) {
      throw new Error('Empty response received from Gemini model');
    }

    // Parse JSON
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      // Clean possible fences if any
      const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned) as Record<string, unknown>;
    }

    // Validate and attach safe links to music
    const rawMusicRecs = Array.isArray(parsed.musicRecommendations) ? (parsed.musicRecommendations as Record<string, unknown>[]) : [];
    const musicItems: UnifiedSongItem[] = rawMusicRecs
      .slice(0, 5)
      .map((item, idx: number) => {
        const title = String(item.title || `Curated Track ${idx + 1}`).trim();
        const artist = String(item.artist || 'Various Artists').trim();
        const urls = buildMusicSearchUrls(title, artist);
        const discoveryStatus = (item.isSavedMatchOrDiscovery === 'Saved Preference' || item.isSavedMatchOrDiscovery === 'Curated Match')
          ? item.isSavedMatchOrDiscovery
          : (idx === 0 ? 'Saved Preference' : 'New Discovery');
        return {
          id: String(item.id || `gem_mus_${idx + 1}`),
          title,
          artist,
          language: String(item.language || req.conversation?.sectionB?.sessionMusicLanguages?.[0] || 'English'),
          genre: String(item.genre || 'Ambient / Melody'),
          whyFits: String(item.whyFits || 'Carefully chosen to align with your emotional state today.'),
          isSavedMatchOrDiscovery: discoveryStatus,
          searchUrl: urls.searchUrl,
          spotifySearchUrl: urls.spotifySearchUrl,
          youtubeSearchUrl: urls.youtubeSearchUrl,
        };
      });

    // Validate and attach safe search links to movies
    const rawMovieRecs = Array.isArray(parsed.movieRecommendations) ? (parsed.movieRecommendations as Record<string, unknown>[]) : [];
    const movieItems: UnifiedMovieItem[] = rawMovieRecs
      .slice(0, 5)
      .map((item, idx: number) => {
        const title = String(item.title || `Curated Film ${idx + 1}`).trim();
        const year = typeof item.year === 'number' || typeof item.year === 'string' ? item.year : '';
        const platform = String(item.suggestedPlatform || 'Popular Streaming').trim();
        return {
          id: String(item.id || `gem_mov_${idx + 1}`),
          title,
          year,
          language: String(item.language || req.conversation?.sectionB?.sessionMovieLanguages?.[0] || 'English'),
          genre: String(item.genre || 'Drama / Comfort'),
          description: String(item.description || 'A thoughtful story chosen for this session.'),
          whyFits: String(item.whyFits || 'Selected to offer the viewing experience you requested today.'),
          duration: String(item.duration || '90-120 min'),
          suggestedPlatform: platform,
          platformSearchUrl: buildMovieSearchUrls(title, year, platform),
          ottVerified: false,
        };
      });

    // If less than 5 items returned, supplement from curated fallback
    const fallback = generateCuratedFallbackRecommendations(req, userName);
    while (musicItems.length < 5 && fallback.musicRecommendations[musicItems.length]) {
      musicItems.push(fallback.musicRecommendations[musicItems.length]);
    }
    while (movieItems.length < 5 && fallback.movieRecommendations[movieItems.length]) {
      movieItems.push(fallback.movieRecommendations[movieItems.length]);
    }

    return {
      sessionSummary: typeof parsed.sessionSummary === 'string' ? parsed.sessionSummary : fallback.sessionSummary,
      moodInterpretation: typeof parsed.moodInterpretation === 'string' ? parsed.moodInterpretation : fallback.moodInterpretation,
      reasoningExplanation: typeof parsed.reasoningExplanation === 'string' ? parsed.reasoningExplanation : fallback.reasoningExplanation,
      recommendedHabit: (parsed.recommendedHabit && typeof parsed.recommendedHabit === 'object') ? (parsed.recommendedHabit as UnifiedRecommendationResponse['recommendedHabit']) : fallback.recommendedHabit,
      restorativeExercise: (parsed.restorativeExercise && typeof parsed.restorativeExercise === 'object') ? (parsed.restorativeExercise as UnifiedRecommendationResponse['restorativeExercise']) : fallback.restorativeExercise,
      musicRecommendations: musicItems,
      movieRecommendations: movieItems,
      userQuestionAnswer: req.conversation?.finalQuestion?.trim()
        ? (typeof parsed.userQuestionAnswer === 'string' ? parsed.userQuestionAnswer : fallback.userQuestionAnswer)
        : null,
      nextSmallStep: (parsed.nextSmallStep && typeof parsed.nextSmallStep === 'object') ? (parsed.nextSmallStep as UnifiedRecommendationResponse['nextSmallStep']) : fallback.nextSmallStep,
      uncertaintiesOrLimitations: typeof parsed.uncertaintiesOrLimitations === 'string' ? parsed.uncertaintiesOrLimitations : fallback.uncertaintiesOrLimitations,
      meta: {
        provider: 'gemini',
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (geminiError) {
    console.warn('[MindMate AI] Gemini unified recommendation call failed, using graceful curated fallback:', geminiError);
    return generateCuratedFallbackRecommendations(req, userName);
  }
}

