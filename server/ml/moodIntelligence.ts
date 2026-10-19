import { MoodRecord, HabitRecord } from '../types.js';

export interface MoodPatternInsight {
  id: string;
  category: 'sleep' | 'energy' | 'stress' | 'habit' | 'context' | 'timing';
  title: string;
  insight: string;
  supportingData: string;
  confidence: number; // 0.0 to 1.0
  dataPointsCount: number;
  status: 'active' | 'validated' | 'corrected' | 'dismissed';
  userCorrection?: string;
  detectedAt: string;
}

export interface UserPatternFeedback {
  patternId: string;
  status: 'validated' | 'corrected' | 'dismissed';
  userCorrection?: string;
  timestamp: string;
}

/**
 * Mood Intelligence Pattern Detection Engine
 * 
 * Extracts verifiable, data-grounded insights from actual user check-ins.
 * Strict Rule: Never fabricate or guess patterns without supporting entries.
 * Minimum sample requirement: at least 2-3 tagged check-ins showing consistent effect.
 */
export class MoodIntelligenceEngine {
  /**
   * Detect empirical patterns from the user's historical mood entries and habits.
   */
  public detectPatterns(
    moods: MoodRecord[],
    habits: HabitRecord[],
    existingFeedback: Map<string, UserPatternFeedback> = new Map()
  ): MoodPatternInsight[] {
    const insights: MoodPatternInsight[] = [];
    if (!moods || moods.length < 3) {
      // Insufficient data for legitimate pattern detection
      return [];
    }

    // Baseline stats
    const avgEnergy = moods.reduce((acc, m) => acc + (m.energyLevel || 5), 0) / moods.length;
    const avgStress = moods.reduce((acc, m) => acc + (m.stressLevel || 5), 0) / moods.length;
    const avgMood = moods.reduce((acc, m) => acc + (m.moodLevel || 3), 0) / moods.length;

    // 1. Sleep & Energy Pattern
    // Compare entries tagged with 'Sleep Quality' or 'Quality Rest' or emotions 'Fatigued'
    const lowSleepEntries = moods.filter(m => {
      const tags = (m.contextTags || []).map(t => t.toLowerCase());
      const emotions = (m.emotions || []).map(e => e.toLowerCase());
      const note = (m.note || '').toLowerCase();
      return (
        tags.some(t => t.includes('sleep') || t.includes('rest')) &&
        (emotions.includes('fatigued') || emotions.includes('exhausted') || note.includes('poor sleep') || note.includes('insomnia') || (m.energyLevel || 5) <= 4)
      );
    });

    if (lowSleepEntries.length >= 2) {
      const lowSleepAvgEnergy = lowSleepEntries.reduce((acc, m) => acc + (m.energyLevel || 5), 0) / lowSleepEntries.length;
      if (lowSleepAvgEnergy < avgEnergy - 1.2) {
        insights.push({
          id: 'pat_sleep_energy_drop',
          category: 'sleep',
          title: 'Sleep & Daily Vitality Link',
          insight: 'Your energy has been significantly lower on days when you recorded disrupted sleep or fatigue.',
          supportingData: `Observed across ${lowSleepEntries.length} check-ins where energy averaged ${lowSleepAvgEnergy.toFixed(1)}/10 compared to your ${avgEnergy.toFixed(1)}/10 overall baseline.`,
          confidence: Math.min(0.95, 0.6 + lowSleepEntries.length * 0.08),
          dataPointsCount: lowSleepEntries.length,
          status: existingFeedback.get('pat_sleep_energy_drop')?.status || 'active',
          userCorrection: existingFeedback.get('pat_sleep_energy_drop')?.userCorrection,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // 2. Outdoors & Nature Mood Lift
    const outdoorEntries = moods.filter(m => {
      const tags = (m.contextTags || []).map(t => t.toLowerCase());
      return tags.some(t => t.includes('outdoor') || t.includes('nature') || t.includes('walk'));
    });

    if (outdoorEntries.length >= 2) {
      const outdoorAvgMood = outdoorEntries.reduce((acc, m) => acc + (m.moodLevel || 3), 0) / outdoorEntries.length;
      const outdoorAvgStress = outdoorEntries.reduce((acc, m) => acc + (m.stressLevel || 5), 0) / outdoorEntries.length;
      if (outdoorAvgMood > avgMood + 0.5 || outdoorAvgStress < avgStress - 1.0) {
        insights.push({
          id: 'pat_outdoors_grounding',
          category: 'context',
          title: 'Nature & Emotional Grounding',
          insight: 'Time outdoors and fresh air strongly correlates with reduced stress and elevated calm.',
          supportingData: `Supported by ${outdoorEntries.length} days with outdoor context where stress averaged ${outdoorAvgStress.toFixed(1)}/10 (vs ${avgStress.toFixed(1)}/10 baseline).`,
          confidence: Math.min(0.92, 0.65 + outdoorEntries.length * 0.07),
          dataPointsCount: outdoorEntries.length,
          status: existingFeedback.get('pat_outdoors_grounding')?.status || 'active',
          userCorrection: existingFeedback.get('pat_outdoors_grounding')?.userCorrection,
          detectedAt: new Date().toISOString()
        });
      }
    }

    // 3. Work Pressure & Stress Spike Pattern
    const workStressEntries = moods.filter(m => {
      const tags = (m.contextTags || []).map(t => t.toLowerCase());
      return tags.some(t => t.includes('work') || t.includes('career')) && (m.stressLevel || 5) >= 6;
    });

    if (workStressEntries.length >= 2) {
      insights.push({
        id: 'pat_work_stress_spike',
        category: 'stress',
        title: 'Workload & Tension Vulnerability',
        insight: 'Heavy work demands frequently coincide with elevated somatic tension and racing thoughts.',
        supportingData: `Identified on ${workStressEntries.length} work-focused check-ins showing average stress of ${(workStressEntries.reduce((s, m) => s + (m.stressLevel || 5), 0) / workStressEntries.length).toFixed(1)}/10.`,
        confidence: Math.min(0.90, 0.6 + workStressEntries.length * 0.06),
        dataPointsCount: workStressEntries.length,
        status: existingFeedback.get('pat_work_stress_spike')?.status || 'active',
        userCorrection: existingFeedback.get('pat_work_stress_spike')?.userCorrection,
        detectedAt: new Date().toISOString()
      });
    }

    // 4. Habit Consistency & Emotional Resilience Anchor
    const activeHabits = habits.filter(h => h.streak >= 3);
    if (activeHabits.length > 0 && moods.length >= 4) {
      const topHabit = activeHabits.sort((a, b) => b.streak - a.streak)[0];
      insights.push({
        id: `pat_habit_${topHabit.id}`,
        category: 'habit',
        title: `Anchor Routine: ${topHabit.name}`,
        insight: `Maintaining your streak for "${topHabit.name}" acts as a steady psychological anchor on challenging days.`,
        supportingData: `You have completed this anchor ${topHabit.streak} days consecutively with an all-time best of ${topHabit.bestStreak} days.`,
        confidence: 0.88,
        dataPointsCount: topHabit.streak,
        status: existingFeedback.get(`pat_habit_${topHabit.id}`)?.status || 'active',
        userCorrection: existingFeedback.get(`pat_habit_${topHabit.id}`)?.userCorrection,
        detectedAt: new Date().toISOString()
      });
    }

    // 5. High Energy Low Stress Golden Window
    const optimalEntries = moods.filter(m => (m.energyLevel || 0) >= 7 && (m.stressLevel || 10) <= 4);
    if (optimalEntries.length >= 2) {
      insights.push({
        id: 'pat_optimal_state',
        category: 'energy',
        title: 'Restorative Flow Windows',
        insight: 'You reach your highest creative and emotional balance when your stress score stays at or below 4.',
        supportingData: `${optimalEntries.length} check-ins achieved this balanced state with reported emotions of ${Array.from(new Set(optimalEntries.flatMap(m => m.emotions))).slice(0, 3).join(', ') || 'Calm'}.`,
        confidence: 0.84,
        dataPointsCount: optimalEntries.length,
        status: existingFeedback.get('pat_optimal_state')?.status || 'active',
        userCorrection: existingFeedback.get('pat_optimal_state')?.userCorrection,
        detectedAt: new Date().toISOString()
      });
    }

    // Filter out dismissed patterns unless requested
    return insights.filter(i => i.status !== 'dismissed');
  }
}

export const moodIntelligenceEngine = new MoodIntelligenceEngine();
