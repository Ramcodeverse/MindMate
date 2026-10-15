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
          'User-Agent': 'aistudio-build',
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
