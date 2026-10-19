export interface UserInteractionEntry {
  userId: string;
  itemId: string;
  rating: number; // 1.0 to 5.0
  timestamp: string;
}

/**
 * Algorithm 3: Collaborative Filtering Recommender
 * Implements Item-Item Collaborative Filtering with shrinkage regularization:
 * sim(i, j) = (sum(r_ui * r_uj)) / (sqrt(sum(r_ui^2)) * sqrt(sum(r_uj^2)) + lambda)
 * 
 * Supports cold-start detection, rating-aware prediction, and fallback.
 */
export class CollaborativeRecommender {
  private userItemMatrix: Map<string, Map<string, number>> = new Map(); // userId -> (itemId -> rating)
  private itemUserMatrix: Map<string, Map<string, number>> = new Map(); // itemId -> (userId -> rating)
  private itemSimilarityCache: Map<string, Map<string, number>> = new Map(); // itemId -> (itemId -> similarity)
  private shrinkage: number = 2.0; // Shrinkage parameter for small sample dampening

  /**
   * Load historical interaction records into the matrix.
   */
  public loadInteractions(interactions: UserInteractionEntry[]): void {
    this.userItemMatrix.clear();
    this.itemUserMatrix.clear();
    this.itemSimilarityCache.clear();

    for (const { userId, itemId, rating } of interactions) {
      if (!this.userItemMatrix.has(userId)) {
        this.userItemMatrix.set(userId, new Map());
      }
      this.userItemMatrix.get(userId)!.set(itemId, rating);

      if (!this.itemUserMatrix.has(itemId)) {
        this.itemUserMatrix.set(itemId, new Map());
      }
      this.itemUserMatrix.get(itemId)!.set(userId, rating);
    }
  }

  /**
   * Record a single interaction incrementally.
   */
  public recordInteraction(userId: string, itemId: string, rating: number): void {
    if (!this.userItemMatrix.has(userId)) {
      this.userItemMatrix.set(userId, new Map());
    }
    this.userItemMatrix.get(userId)!.set(itemId, rating);

    if (!this.itemUserMatrix.has(itemId)) {
      this.itemUserMatrix.set(itemId, new Map());
    }
    this.itemUserMatrix.get(itemId)!.set(userId, rating);

    // Invalidate affected similarity cache entries
    this.itemSimilarityCache.delete(itemId);
  }

  /**
   * Compute adjusted cosine similarity between two items across co-rating users.
   */
  public getItemSimilarity(itemA: string, itemB: string): number {
    if (itemA === itemB) return 1.0;

    const cached = this.itemSimilarityCache.get(itemA)?.get(itemB);
    if (cached !== undefined) return cached;

    const usersA = this.itemUserMatrix.get(itemA);
    const usersB = this.itemUserMatrix.get(itemB);

    if (!usersA || !usersB) return 0;

    // Find intersection of users who interacted with both items
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    let overlapCount = 0;

    for (const [userId, ratingA] of usersA.entries()) {
      normA += ratingA * ratingA;
      const ratingB = usersB.get(userId);
      if (ratingB !== undefined) {
        dotProduct += ratingA * ratingB;
        overlapCount++;
      }
    }

    for (const ratingB of usersB.values()) {
      normB += ratingB * ratingB;
    }

    if (overlapCount === 0 || normA === 0 || normB === 0) {
      return 0;
    }

    // Cosine similarity with shrinkage for low sample counts
    const rawSim = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    const dampenedSim = (overlapCount / (overlapCount + this.shrinkage)) * rawSim;

    if (!this.itemSimilarityCache.has(itemA)) {
      this.itemSimilarityCache.set(itemA, new Map());
    }
    this.itemSimilarityCache.get(itemA)!.set(itemB, dampenedSim);

    return dampenedSim;
  }

  /**
   * Predict rating for a target user and candidate item based on items the user has rated.
   * R_hat(u, i) = sum(sim(i, j) * r_uj) / (sum(|sim(i, j)|) + eps)
   */
  public predictRating(userId: string, targetItemId: string): { predictedRating: number; confidence: number } {
    const userRatings = this.userItemMatrix.get(userId);
    if (!userRatings || userRatings.size === 0) {
      // User cold start
      return { predictedRating: 3.5, confidence: 0 };
    }

    let weightedSum = 0;
    let simSum = 0;

    for (const [ratedItemId, rating] of userRatings.entries()) {
      if (ratedItemId === targetItemId) continue;
      const sim = this.getItemSimilarity(targetItemId, ratedItemId);
      if (sim > 0.05) {
        weightedSum += sim * rating;
        simSum += sim;
      }
    }

    if (simSum === 0) {
      return { predictedRating: 3.5, confidence: 0 };
    }

    const predicted = weightedSum / simSum;
    const confidence = Math.min(1.0, simSum / 2.0); // Higher confidence with more similar items
    return {
      predictedRating: Math.max(1.0, Math.min(5.0, predicted)),
      confidence
    };
  }

  /**
   * Score an item for a user on a 0-100 scale.
   */
  public scoreItem(userId: string, targetItemId: string): number {
    const { predictedRating, confidence } = this.predictRating(userId, targetItemId);
    // Scale 1-5 rating to 0-100, blending towards neutral 50 when confidence is low
    const normalizedScore = ((predictedRating - 1) / 4) * 100;
    return Math.round(confidence * normalizedScore + (1 - confidence) * 50);
  }
}

export const collaborativeRecommender = new CollaborativeRecommender();
