import { RecommendationItem } from '../types.js';
import { UserPreferenceVector, RecommendationRequestOptions, CandidateScoreBreakdown } from './types.js';
import { popularityRecommender } from './popularity.js';
import { contentBasedRecommender } from './contentBased.js';
import { collaborativeRecommender } from './collaborative.js';
import { contextAwareReranker } from './contextReranker.js';
import { diversityReranker } from './diversity.js';

export interface ScoredRecommendationResult {
  item: RecommendationItem;
  score: number;
  explanation: string;
  breakdown: CandidateScoreBreakdown;
}

/**
 * Algorithm 4: Hybrid Recommendation Engine
 * Combines Content-Based, Collaborative Filtering, Long-Term Preferences,
 * Contextual Mood Fit, and Diversity constraints.
 */
export class HybridRecommendationEngine {
  // Configurable weights (normalized sum = 1.0)
  public weights = {
    contentBased: 0.25,
    collaborative: 0.20,
    userPreference: 0.25,
    contextFit: 0.20,
    popularity: 0.10,
  };

  /**
   * Generates personalized recommendations for a user.
   */
  public recommend(
    userId: string,
    userProfile: UserPreferenceVector | null,
    catalog: Map<string, RecommendationItem>,
    options: RecommendationRequestOptions = {}
  ): ScoredRecommendationResult[] {
    const isColdStart = !userProfile || (userProfile.likedItemIds.size === 0 && userProfile.ratedItems.size === 0);
    const personalizationEnabled = userProfile !== null;

    // Build user feature vector for content-based scoring if profile exists
    const userVector = userProfile 
      ? contentBasedRecommender.buildUserVector(userProfile, catalog) 
      : new Map<string, number>();

    // 1. Candidate Retrieval & Hard Filtering
    const candidates: RecommendationItem[] = [];
    const targetType = options.type || 'all';
    const excludedIds = new Set(options.excludeItemIds || []);
    const userDismissed = userProfile?.dislikedItemIds || new Set<string>();

    for (const item of catalog.values()) {
      // Exclude explicitly dismissed/disliked items
      if (userDismissed.has(item.id)) continue;
      if (excludedIds.has(item.id)) continue;

      // Filter by content type if specified
      if (targetType !== 'all' && item.type !== targetType) continue;

      // Filter by genre if explicitly requested
      if (options.genreFilter && !item.genre.toLowerCase().includes(options.genreFilter.toLowerCase())) {
        continue;
      }

      candidates.push(item);
    }

    // 2. Score Candidates across multiple algorithms
    const scoredCandidates: ScoredRecommendationResult[] = candidates.map(item => {
      // (a) Content-Based Score (0-100)
      const contentScore = userVector.size > 0 
        ? contentBasedRecommender.scoreItem(item, userVector)
        : 50;

      // (b) Collaborative Score (0-100)
      const collaborativeScore = collaborativeRecommender.scoreItem(userId, item.id);

      // (c) Long-Term User Preference Score (0-100)
      let preferenceScore = 50;
      const prefReasons: string[] = [];

      if (userProfile && personalizationEnabled) {
        // Check genre preference weights
        for (const [genre, weight] of Object.entries(userProfile.genreWeights)) {
          if (item.genre.toLowerCase().includes(genre.toLowerCase())) {
            preferenceScore += weight * 10;
            if (weight > 0) prefReasons.push(`you enjoy ${genre}`);
          }
        }

        // Boost if saved (+15)
        if (userProfile.savedItemIds.has(item.id)) {
          preferenceScore += 15;
          prefReasons.push('saved in your library');
        }

        // Boost if user previously gave high rating
        const rating = userProfile.ratedItems.get(item.id);
        if (rating !== undefined) {
          preferenceScore += (rating - 3) * 15;
          if (rating >= 4) prefReasons.push(`you rated this ${rating}★`);
        }
      }
      preferenceScore = Math.max(0, Math.min(100, preferenceScore));

      // (d) Context & Mood Score (0-100)
      const contextResult = contextAwareReranker.computeContextScore(item, {
        mood: options.mood,
        energyLevel: options.energyLevel,
        stressLevel: options.stressLevel,
        intention: options.intention,
        timeAvailableMinutes: options.maxDurationMinutes,
      });
      const contextScore = contextResult.score;

      // (e) Popularity Baseline Score (0-100)
      const popularityScore = Math.round(popularityRecommender.getBayesianScore(item.id, 3.5) * 20);

      // Combine scores using configured weights
      let finalScore = 0;
      if (isColdStart || !personalizationEnabled) {
        // Cold-start fallback: Rely heavily on context, explicit intention, and popularity
        finalScore = contextScore * 0.45 + popularityScore * 0.35 + preferenceScore * 0.20;
      } else {
        finalScore = (
          contentScore * this.weights.contentBased +
          collaborativeScore * this.weights.collaborative +
          preferenceScore * this.weights.userPreference +
          contextScore * this.weights.contextFit +
          popularityScore * this.weights.popularity
        );
      }

      finalScore = Math.round(Math.max(0, Math.min(100, finalScore)));

      // Generate Transparent Grounded Explanation
      const factors: string[] = [];
      if (contextResult.reasons.length > 0) {
        factors.push(...contextResult.reasons);
      }
      if (prefReasons.length > 0) {
        factors.push(...prefReasons);
      }
      if (collaborativeScore > 70) {
        factors.push('popular with members who share your wellness taste');
      }

      let explanation = item.explanation;
      if (factors.length > 0) {
        explanation = `Recommended because ${factors.slice(0, 2).join(' and ')}.`;
      } else if (isColdStart) {
        explanation = `Popular discovery to match your ${options.mood?.toLowerCase() || 'current'} reflection.`;
      }

      const breakdown: CandidateScoreBreakdown = {
        contentScore,
        collaborativeScore,
        preferenceScore,
        contextScore,
        noveltyScore: popularityScore,
        diversityPenalty: 0,
        negativePenalty: 0,
        finalScore,
        explanation,
        explanationFactors: factors
      };

      return {
        item: {
          ...item,
          score: finalScore,
          explanation
        },
        score: finalScore,
        explanation,
        breakdown
      };
    });

    // 3. Sort by raw hybrid score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 4. Apply Diversity-Aware MMR Reranking
    const limit = options.limit || 10;
    const rerankedMMR = diversityReranker.rerank(
      scoredCandidates.map(s => ({ item: s.item, score: s.score })),
      0.75, // lambda
      limit
    );

    // Re-map back to full ScoredRecommendationResult
    const finalResults: ScoredRecommendationResult[] = [];
    const resultMap = new Map(scoredCandidates.map(s => [s.item.id, s]));

    for (const reranked of rerankedMMR) {
      const original = resultMap.get(reranked.item.id);
      if (original) {
        finalResults.push({
          ...original,
          score: reranked.score,
          item: {
            ...original.item,
            score: reranked.score
          }
        });
      }
    }

    return finalResults;
  }
}

export const hybridEngine = new HybridRecommendationEngine();
