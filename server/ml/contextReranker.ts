import { MoodCategory, RecommendationItem } from '../types.js';

export interface ContextualInputs {
  mood?: MoodCategory;
  energyLevel?: number; // 1-10
  stressLevel?: number; // 1-10
  intention?: string;   // e.g. 'comfort', 'calm', 'focus', 'joy', 'reset'
  timeAvailableMinutes?: number;
}

/**
 * Algorithm 5: Context-Aware Mood Reranker
 * Adjusts candidate scores dynamically based on the user's immediate emotional context
 * while respecting their long-term taste preferences.
 */
export class ContextAwareReranker {
  public computeContextScore(item: RecommendationItem, context: ContextualInputs): { score: number; reasons: string[] } {
    let score = 50; // Neutral baseline
    const reasons: string[] = [];

    const mood = context.mood || 'Good';
    const energy = context.energyLevel ?? 5;
    const stress = context.stressLevel ?? 3;
    const targetIntention = context.intention?.toLowerCase().trim();

    // 1. Mood Affinity Match (+25)
    if (item.moodAffinities.includes(mood)) {
      score += 25;
      reasons.push(`aligned with your ${mood.toLowerCase()} mood`);
    } else if (item.moodAffinities.includes('All')) {
      score += 15;
    } else {
      score -= 10; // Slight penalty if item explicitly conflicts with mood state
    }

    // 2. Explicit Intention Match (+30)
    if (targetIntention) {
      const matches = item.intentions.some(i => 
        i.toLowerCase().includes(targetIntention) || targetIntention.includes(i.toLowerCase())
      );
      if (matches) {
        score += 30;
        reasons.push(`matches your wish for ${targetIntention}`);
      }
    }

    // 3. Energy Level Compatibility (+15)
    if (energy <= 3) {
      if (item.energyFit === 'low') {
        score += 15;
        reasons.push('gentle pace for low energy');
      } else if (item.energyFit === 'high') {
        score -= 20; // High energy content during low energy state is exhausting
      }
    } else if (energy >= 7) {
      if (item.energyFit === 'high') {
        score += 15;
        reasons.push('matches your vibrant energy');
      }
    } else {
      // Medium energy
      if (item.energyFit === 'medium' || item.energyFit === 'all') {
        score += 10;
      }
    }

    // 4. Stress Compatibility (+15)
    if (stress >= 7) {
      // User is under high stress
      if (item.stressFit === 'high_stress' || item.intentions.includes('calm') || item.intentions.includes('comfort')) {
        score += 20;
        reasons.push('lowers acute stress');
      }
    }

    // 5. Time/Duration Compatibility
    if (context.timeAvailableMinutes) {
      const match = item.duration.match(/(\d+)\s*min/);
      if (match) {
        const itemMinutes = parseInt(match[1], 10);
        if (itemMinutes <= context.timeAvailableMinutes) {
          score += 10;
        } else {
          score -= 30; // Exceeds requested time budget
        }
      }
    }

    const clampedScore = Math.max(0, Math.min(100, score));
    return { score: clampedScore, reasons };
  }
}

export const contextAwareReranker = new ContextAwareReranker();
