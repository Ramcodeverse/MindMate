import { RecommendationItem } from '../types.js';
import { EvaluationMetrics } from './types.js';
import { diversityReranker } from './diversity.js';

export interface TestInteraction {
  userId: string;
  itemId: string;
  actualRating: number;
}

/**
 * Offline Recommendation Evaluation Framework
 * Evaluates ranking accuracy, coverage, and diversity.
 */
export class ModelEvaluator {
  /**
   * Computes RMSE and MAE between predicted ratings and ground-truth ratings.
   */
  public evaluateRatingPrediction(
    predictions: Array<{ actual: number; predicted: number }>
  ): { rmse: number; mae: number } {
    if (predictions.length === 0) return { rmse: 0, mae: 0 };

    let sumSqErr = 0;
    let sumAbsErr = 0;

    for (const { actual, predicted } of predictions) {
      const err = predicted - actual;
      sumSqErr += err * err;
      sumAbsErr += Math.abs(err);
    }

    const rmse = Math.sqrt(sumSqErr / predictions.length);
    const mae = sumAbsErr / predictions.length;

    return {
      rmse: Math.round(rmse * 1000) / 1000,
      mae: Math.round(mae * 1000) / 1000
    };
  }

  /**
   * Computes Precision@K and Recall@K.
   * Ground truth: items with actual rating >= threshold (e.g. 4.0).
   */
  public evaluateRankingMetrics(
    recommendedItemIds: string[],
    relevantItemIds: Set<string>,
    k: number = 5
  ): { precisionAtK: number; recallAtK: number; ndcgAtK: number } {
    const topK = recommendedItemIds.slice(0, k);
    let hitCount = 0;
    let dcg = 0;
    let idcg = 0;

    topK.forEach((id, idx) => {
      const isRelevant = relevantItemIds.has(id);
      if (isRelevant) {
        hitCount++;
        dcg += 1 / Math.log2(idx + 2); // 1-indexed rank
      }
    });

    const numRelevant = relevantItemIds.size;
    const maxHits = Math.min(k, numRelevant);
    for (let i = 0; i < maxHits; i++) {
      idcg += 1 / Math.log2(i + 2);
    }

    const precisionAtK = topK.length > 0 ? hitCount / topK.length : 0;
    const recallAtK = numRelevant > 0 ? hitCount / numRelevant : 0;
    const ndcgAtK = idcg > 0 ? dcg / idcg : 0;

    return {
      precisionAtK: Math.round(precisionAtK * 1000) / 1000,
      recallAtK: Math.round(recallAtK * 1000) / 1000,
      ndcgAtK: Math.round(ndcgAtK * 1000) / 1000
    };
  }

  /**
   * Computes Catalog Coverage: fraction of all catalog items recommended at least once.
   */
  public evaluateCatalogCoverage(
    allRecommendedIds: Set<string>,
    totalCatalogItems: number
  ): number {
    if (totalCatalogItems === 0) return 0;
    return Math.round((allRecommendedIds.size / totalCatalogItems) * 1000) / 1000;
  }

  /**
   * Computes Intra-List Diversity (ILD): average pairwise distance between recommended items.
   * ILD = 1 - average pairwise redundancy similarity
   */
  public evaluateIntraListDiversity(items: RecommendationItem[]): number {
    if (items.length <= 1) return 1.0;

    let pairCount = 0;
    let sumSim = 0;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        sumSim += diversityReranker.computeRedundancy(items[i], items[j]);
        pairCount++;
      }
    }

    if (pairCount === 0) return 1.0;
    const avgSim = sumSim / pairCount;
    return Math.round((1.0 - avgSim) * 1000) / 1000;
  }

  /**
   * Generates a comprehensive evaluation metrics summary.
   */
  public generateFullBenchmark(
    testPredictions: Array<{ actual: number; predicted: number }>,
    recommendedLists: Array<{ recommended: string[]; relevant: Set<string> }>,
    sampleItems: RecommendationItem[],
    totalCatalogCount: number
  ): EvaluationMetrics {
    const { rmse, mae } = this.evaluateRatingPrediction(testPredictions);

    let sumP = 0;
    let sumR = 0;
    let sumN = 0;
    const allRecIds = new Set<string>();

    for (const { recommended, relevant } of recommendedLists) {
      const res = this.evaluateRankingMetrics(recommended, relevant, 5);
      sumP += res.precisionAtK;
      sumR += res.recallAtK;
      sumN += res.ndcgAtK;
      recommended.forEach(id => allRecIds.add(id));
    }

    const listCount = recommendedLists.length || 1;
    const precisionAtK = Math.round((sumP / listCount) * 1000) / 1000;
    const recallAtK = Math.round((sumR / listCount) * 1000) / 1000;
    const ndcgAtK = Math.round((sumN / listCount) * 1000) / 1000;

    const catalogCoverage = this.evaluateCatalogCoverage(allRecIds, totalCatalogCount);
    const intraListDiversity = this.evaluateIntraListDiversity(sampleItems);

    return {
      rmse,
      mae,
      precisionAtK,
      recallAtK,
      ndcgAtK,
      catalogCoverage,
      intraListDiversity,
      sampleCount: testPredictions.length,
      evaluatedAt: new Date().toISOString()
    };
  }
}

export const modelEvaluator = new ModelEvaluator();
