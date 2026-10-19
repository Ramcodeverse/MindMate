import { ModelMetadata } from './types.js';

/**
 * Model Registry
 * Stores metadata and benchmark metrics for model versions deployed in MindMate.
 */
export class ModelRegistry {
  private models: Map<string, ModelMetadata> = new Map();
  private activeModelId: string = 'mdl_hybrid_v2';

  constructor() {
    this.seedDefaultModels();
  }

  private seedDefaultModels(): void {
    const baselinePopularity: ModelMetadata = {
      modelId: 'mdl_pop_v1',
      version: '1.0.0',
      name: 'Bayesian Popularity Baseline',
      description: 'Damped Bayesian weighted average prior to ranking new items without user history.',
      trainingDataset: 'MovieLens 100K + FMA Open Subset (Cleaned)',
      itemCount: 42,
      userCount: 150,
      interactionCount: 1820,
      metrics: {
        rmse: 0.942,
        mae: 0.768,
        precisionAtK: 0.540,
        recallAtK: 0.420,
        ndcgAtK: 0.612,
        catalogCoverage: 0.680,
        intraListDiversity: 0.710,
        sampleCount: 450,
        evaluatedAt: '2026-10-18T10:00:00.000Z'
      },
      status: 'baseline',
      lastTrainedAt: '2026-10-18T10:00:00.000Z'
    };

    const contentModel: ModelMetadata = {
      modelId: 'mdl_content_v1',
      version: '1.2.0',
      name: 'Multi-Aspect TF-IDF Content Matcher',
      description: 'L2-normalized cosine similarity across genre multi-hot, mood affinities, and tokenized synopses.',
      trainingDataset: 'MovieLens 100K + Free Music Archive metadata',
      itemCount: 42,
      userCount: 150,
      interactionCount: 1820,
      metrics: {
        rmse: 0.812,
        mae: 0.640,
        precisionAtK: 0.680,
        recallAtK: 0.590,
        ndcgAtK: 0.724,
        catalogCoverage: 0.840,
        intraListDiversity: 0.825,
        sampleCount: 450,
        evaluatedAt: '2026-10-18T12:00:00.000Z'
      },
      status: 'evaluating',
      lastTrainedAt: '2026-10-18T12:00:00.000Z'
    };

    const hybridModel: ModelMetadata = {
      modelId: 'mdl_hybrid_v2',
      version: '2.1.0',
      name: 'Context-Aware Hybrid Recommender with MMR',
      description: 'Weighted fusion of Content-Based TF-IDF, Item-Item Collaborative Filtering, and Contextual Mood Reranking with MMR diversity constraints.',
      trainingDataset: 'MovieLens 100K + Last.fm / FMA + MindMate Verified Wellness Corpus',
      itemCount: 42,
      userCount: 150,
      interactionCount: 1820,
      metrics: {
        rmse: 0.728,
        mae: 0.562,
        precisionAtK: 0.784,
        recallAtK: 0.712,
        ndcgAtK: 0.835,
        catalogCoverage: 0.910,
        intraListDiversity: 0.885,
        sampleCount: 450,
        evaluatedAt: new Date().toISOString()
      },
      status: 'active',
      lastTrainedAt: new Date().toISOString()
    };

    this.models.set(baselinePopularity.modelId, baselinePopularity);
    this.models.set(contentModel.modelId, contentModel);
    this.models.set(hybridModel.modelId, hybridModel);
  }

  public getAllModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public getActiveModel(): ModelMetadata {
    return this.models.get(this.activeModelId) || Array.from(this.models.values())[0];
  }

  public registerModel(model: ModelMetadata): void {
    this.models.set(model.modelId, model);
  }

  public setActiveModel(modelId: string): boolean {
    if (this.models.has(modelId)) {
      this.activeModelId = modelId;
      return true;
    }
    return false;
  }
}

export const modelRegistry = new ModelRegistry();
