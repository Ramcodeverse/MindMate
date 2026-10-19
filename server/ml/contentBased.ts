import { RecommendationItem } from '../types.js';
import { UserPreferenceVector } from './types.js';

/**
 * Tokenizes text into lowercase normalized terms, stripping common stop words.
 */
function tokenizeText(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));
}

/**
 * Algorithm 2: Content-Based Filtering Recommender
 * Multi-aspect vectorization:
 * 1. Genre Taxonomy (multi-hot with IDF weighting)
 * 2. Mood Affinities (vector overlap)
 * 3. Synopsis TF-IDF representation
 * 4. Acoustic & Runtime compatibility
 */
export class ContentBasedRecommender {
  private documentFrequencies: Map<string, number> = new Map();
  private totalDocuments: number = 0;
  private itemVectors: Map<string, Map<string, number>> = new Map();

  /**
   * Index catalog items to compute IDF and feature vectors.
   */
  public indexCatalog(items: RecommendationItem[]): void {
    this.totalDocuments = items.length;
    this.documentFrequencies.clear();
    this.itemVectors.clear();

    // 1. Build document frequencies
    for (const item of items) {
      const termSet = new Set<string>();
      
      // Genre terms (high importance prefix)
      item.genre.split(/[\/,·\s]+/).forEach(g => {
        if (g.trim()) termSet.add(`genre:${g.trim().toLowerCase()}`);
      });

      // Mood tags
      item.moodAffinities.forEach(m => {
        termSet.add(`mood:${m.toLowerCase()}`);
      });

      // Intentions
      item.intentions.forEach(i => {
        termSet.add(`intent:${i.toLowerCase()}`);
      });

      // Synopsis tokens
      tokenizeText(item.synopsis + ' ' + item.title).forEach(t => {
        termSet.add(`word:${t}`);
      });

      for (const term of termSet) {
        this.documentFrequencies.set(term, (this.documentFrequencies.get(term) || 0) + 1);
      }
    }

    // 2. Build normalized TF-IDF feature vectors for each item
    for (const item of items) {
      const vector = new Map<string, number>();

      // Genre features (weight 3.0)
      item.genre.split(/[\/,·\s]+/).forEach(g => {
        const key = `genre:${g.trim().toLowerCase()}`;
        if (g.trim()) {
          const idf = Math.log((this.totalDocuments + 1) / ((this.documentFrequencies.get(key) || 1) + 1)) + 1;
          vector.set(key, 3.0 * idf);
        }
      });

      // Mood features (weight 2.5)
      item.moodAffinities.forEach(m => {
        const key = `mood:${m.toLowerCase()}`;
        const idf = Math.log((this.totalDocuments + 1) / ((this.documentFrequencies.get(key) || 1) + 1)) + 1;
        vector.set(key, 2.5 * idf);
      });

      // Intentions (weight 2.0)
      item.intentions.forEach(i => {
        const key = `intent:${i.toLowerCase()}`;
        const idf = Math.log((this.totalDocuments + 1) / ((this.documentFrequencies.get(key) || 1) + 1)) + 1;
        vector.set(key, 2.0 * idf);
      });

      // Word features (weight 1.0)
      const words = tokenizeText(item.synopsis + ' ' + item.title);
      const wordCounts: Record<string, number> = {};
      words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });

      for (const [w, count] of Object.entries(wordCounts)) {
        const key = `word:${w}`;
        const tf = count / words.length;
        const idf = Math.log((this.totalDocuments + 1) / ((this.documentFrequencies.get(key) || 1) + 1)) + 1;
        vector.set(key, 1.0 * tf * idf);
      }

      // L2 Normalize vector so long synopses don't dominate
      let sumSq = 0;
      for (const val of vector.values()) {
        sumSq += val * val;
      }
      const norm = Math.sqrt(sumSq) || 1;
      for (const [k, val] of vector.entries()) {
        vector.set(k, val / norm);
      }

      this.itemVectors.set(item.id, vector);
    }
  }

  /**
   * Computes cosine similarity between two feature vectors.
   */
  public cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dot = 0;
    for (const [term, valA] of vecA.entries()) {
      const valB = vecB.get(term);
      if (valB !== undefined) {
        dot += valA * valB;
      }
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Builds a user preference vector from their liked items and explicit preferences.
   */
  public buildUserVector(
    profile: UserPreferenceVector,
    catalog: Map<string, RecommendationItem>
  ): Map<string, number> {
    const userVector = new Map<string, number>();

    // 1. Incorporate explicit genre preferences
    for (const [genre, weight] of Object.entries(profile.genreWeights)) {
      const key = `genre:${genre.toLowerCase()}`;
      userVector.set(key, (userVector.get(key) || 0) + weight * 2.0);
    }

    // 2. Incorporate explicit mood affinity weights
    for (const [mood, weight] of Object.entries(profile.moodAffinityWeights)) {
      const key = `mood:${mood.toLowerCase()}`;
      userVector.set(key, (userVector.get(key) || 0) + weight * 1.5);
    }

    // 3. Accumulate vectors from liked items (positive) and disliked items (negative)
    for (const likedId of profile.likedItemIds) {
      const itemVec = this.itemVectors.get(likedId);
      if (itemVec) {
        for (const [term, val] of itemVec.entries()) {
          userVector.set(term, (userVector.get(term) || 0) + val * 2.0);
        }
      }
    }

    for (const savedId of profile.savedItemIds) {
      const itemVec = this.itemVectors.get(savedId);
      if (itemVec) {
        for (const [term, val] of itemVec.entries()) {
          userVector.set(term, (userVector.get(term) || 0) + val * 1.5);
        }
      }
    }

    for (const dislikedId of profile.dislikedItemIds) {
      const itemVec = this.itemVectors.get(dislikedId);
      if (itemVec) {
        for (const [term, val] of itemVec.entries()) {
          userVector.set(term, (userVector.get(term) || 0) - val * 3.0);
        }
      }
    }

    // L2 Normalize user vector
    let sumSq = 0;
    for (const val of userVector.values()) {
      sumSq += val * val;
    }
    const norm = Math.sqrt(sumSq) || 1;
    for (const [k, val] of userVector.entries()) {
      userVector.set(k, val / norm);
    }

    return userVector;
  }

  /**
   * Score an item against a user preference vector (0 to 100).
   */
  public scoreItem(item: RecommendationItem, userVector: Map<string, number>): number {
    const itemVector = this.itemVectors.get(item.id);
    if (!itemVector) return 50;

    const sim = this.cosineSimilarity(userVector, itemVector);
    return Math.round(sim * 100);
  }
}

export const contentBasedRecommender = new ContentBasedRecommender();
