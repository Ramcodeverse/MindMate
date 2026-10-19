import { RecommendationItem } from '../types.js';

/**
 * Algorithm 1: Popularity Baseline Recommender
 * Uses Bayesian weighted mean / damped average to calculate reliable item popularity.
 * Prevents an item with a single 5-star rating from outranking an item with 1,000 4.8-star ratings.
 * 
 * Formula: WR = (v / (v + m)) * R + (m / (v + m)) * C
 * where:
 *   R = average rating/score of the item
 *   v = number of ratings/interactions for the item
 *   m = minimum interactions threshold required (prior weight)
 *   C = global mean score across the entire catalog
 */
export class PopularityRecommender {
  private itemStats: Map<string, { count: number; totalScore: number }> = new Map();
  private priorWeight: number = 3; // Minimum sample threshold 'm'
  private globalMean: number = 3.5; // Baseline prior rating 'C'

  public recordInteraction(itemId: string, score: number): void {
    const stats = this.itemStats.get(itemId) || { count: 0, totalScore: 0 };
    stats.count += 1;
    stats.totalScore += score;
    this.itemStats.set(itemId, stats);
  }

  public getBayesianScore(itemId: string, defaultRating = 3.5): number {
    const stats = this.itemStats.get(itemId);
    if (!stats || stats.count === 0) {
      // Prior-dominated score for cold items
      return defaultRating;
    }

    const v = stats.count;
    const R = stats.totalScore / v;
    const m = this.priorWeight;
    const C = this.globalMean;

    return (v / (v + m)) * R + (m / (v + m)) * C;
  }

  public rank(items: RecommendationItem[], limit = 10): RecommendationItem[] {
    const scored = items.map(item => ({
      item,
      bayesianScore: this.getBayesianScore(item.id, 3.8)
    }));

    scored.sort((a, b) => b.bayesianScore - a.bayesianScore);
    return scored.slice(0, limit).map(s => s.item);
  }
}

export const popularityRecommender = new PopularityRecommender();
