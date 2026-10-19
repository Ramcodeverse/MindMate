import { RecommendationItem } from '../types.js';

/**
 * Algorithm 8: Diversity-Aware Ranking with Maximal Marginal Relevance (MMR)
 * Prevents recommendation list fatigue by penalizing redundant genres, artists, and tones.
 * 
 * MMR balances relevance with novelty:
 * MMR = argmax [ lambda * Relevance(item) - (1 - lambda) * max_similarity(item, selected) ]
 */
export class DiversityReranker {
  /**
   * Computes item-item redundancy similarity based on genre overlap and creator.
   */
  public computeRedundancy(itemA: RecommendationItem, itemB: RecommendationItem): number {
    let sim = 0;

    // Same primary genre (+0.6)
    if (itemA.genre.toLowerCase() === itemB.genre.toLowerCase()) {
      sim += 0.6;
    } else {
      // Partial genre match (+0.3)
      const genresA = new Set(itemA.genre.toLowerCase().split(/[\/,·\s]+/));
      const genresB = itemB.genre.toLowerCase().split(/[\/,·\s]+/);
      if (genresB.some(g => genresA.has(g) && g.length > 2)) {
        sim += 0.3;
      }
    }

    // Same category badge (+0.2)
    if (itemA.categoryBadge.toLowerCase() === itemB.categoryBadge.toLowerCase()) {
      sim += 0.2;
    }

    // Same type (+0.2)
    if (itemA.type === itemB.type) {
      sim += 0.2;
    }

    return Math.min(1.0, sim);
  }

  /**
   * Reranks a list of candidate items using MMR.
   * @param candidates Candidates sorted by relevance score
   * @param lambda Trade-off parameter: 1.0 = pure relevance, 0.0 = pure diversity. Default: 0.7
   * @param limit Maximum items to return
   */
  public rerank(
    candidates: Array<{ item: RecommendationItem; score: number }>,
    lambda = 0.7,
    limit = 10
  ): Array<{ item: RecommendationItem; score: number }> {
    if (candidates.length <= 1) return candidates;

    const selected: Array<{ item: RecommendationItem; score: number }> = [];
    const remaining = [...candidates];

    // Pick top relevance item first
    const first = remaining.shift()!;
    selected.push(first);

    while (selected.length < limit && remaining.length > 0) {
      let bestIdx = -1;
      let bestMMR = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        
        // Find max similarity to already selected items
        let maxSim = 0;
        for (const sel of selected) {
          const sim = this.computeRedundancy(candidate.item, sel.item);
          if (sim > maxSim) maxSim = sim;
        }

        // Normalized relevance (0 to 1)
        const normRel = candidate.score / 100;

        // MMR Objective
        const mmrScore = lambda * normRel - (1 - lambda) * maxSim;

        if (mmrScore > bestMMR) {
          bestMMR = mmrScore;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0) {
        selected.push(remaining.splice(bestIdx, 1)[0]);
      } else {
        break;
      }
    }

    return selected;
  }
}

export const diversityReranker = new DiversityReranker();
