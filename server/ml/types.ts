import { ContentType, MoodCategory } from '../types.js';

export interface UserPreferenceVector {
  userId: string;
  genreWeights: Record<string, number>; // e.g. { "Acoustic": 2.5, "Indie Folk": 3.0, "Heavy Metal": -4.0 }
  artistWeights: Record<string, number>;
  directorWeights: Record<string, number>;
  moodAffinityWeights: Record<MoodCategory | 'All', number>;
  energyPreference: number; // 1-10
  stressSensitivity: number; // 1-10
  dislikedItemIds: Set<string>;
  likedItemIds: Set<string>;
  savedItemIds: Set<string>;
  ratedItems: Map<string, number>; // itemId -> rating (1.0 to 5.0)
  lastUpdated: string;
}

export interface CandidateScoreBreakdown {
  contentScore: number;       // 0 - 100
  collaborativeScore: number; // 0 - 100
  preferenceScore: number;    // 0 - 100
  contextScore: number;       // 0 - 100
  noveltyScore: number;       // 0 - 100
  diversityPenalty: number;   // 0 - 50
  negativePenalty: number;    // 0 - 100
  finalScore: number;         // 0 - 100
  explanation: string;
  explanationFactors: string[];
}

export interface RecommendationRequestOptions {
  type?: ContentType | 'all';
  mood?: MoodCategory;
  energyLevel?: number;
  stressLevel?: number;
  intention?: string;
  limit?: number;
  excludeItemIds?: string[];
  maxDurationMinutes?: number;
  genreFilter?: string;
  algorithm?: 'hybrid' | 'content_based' | 'collaborative' | 'popularity';
}

export interface EvaluationMetrics {
  rmse: number;
  mae: number;
  precisionAtK: number;
  recallAtK: number;
  ndcgAtK: number;
  catalogCoverage: number; // 0 to 1
  intraListDiversity: number; // 0 to 1
  sampleCount: number;
  evaluatedAt: string;
}

export interface ModelMetadata {
  modelId: string;
  version: string;
  name: string;
  description: string;
  trainingDataset: string;
  itemCount: number;
  userCount: number;
  interactionCount: number;
  metrics: EvaluationMetrics;
  status: 'active' | 'evaluating' | 'baseline';
  lastTrainedAt: string;
}
