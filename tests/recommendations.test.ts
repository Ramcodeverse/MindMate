import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MindMateStore } from '../server/store.js';
import { hybridEngine } from '../server/ml/hybridEngine.js';
import { popularityRecommender } from '../server/ml/popularity.js';
import { contentBasedRecommender } from '../server/ml/contentBased.js';
import { collaborativeRecommender } from '../server/ml/collaborative.js';
import { modelEvaluator } from '../server/ml/evaluation.js';

describe('MindMate Machine Learning & Recommendation Systems (Master Prompt 03)', () => {
  let store: MindMateStore;

  beforeEach(() => {
    store = new MindMateStore();
  });

  describe('Scenario A: New User Cold-Start Handling', () => {
    it('returns valid recommendations without claiming unsupported historical learning', () => {
      // Create a brand new user with no interaction history
      const newUser = store.registerUser('New Explorer', 'new.explorer@test.com', 'password123');
      
      const recs = store.getRecommendations(newUser.id, {
        type: 'all',
        mood: 'Good',
        limit: 5
      });

      assert.ok(recs.length > 0);
      // Explanations must not fabricate past interactions
      for (const rec of recs) {
        assert.equal(rec.explanation.includes('because you previously liked'), false);
        assert.ok(rec.explanation.length > 0);
      }
    });
  });

  describe('Scenario B: Strong Preferences & Positive Weighting', () => {
    it('favors preferred acoustic/indie genres while preserving serendipity', () => {
      const user = store.registerUser('Folk Lover', 'folk.lover@test.com', 'password123');
      
      // Seed strong preference for Acoustic / Indie Folk
      store.likeContent(user.id, 'rec_mus_01'); // Bon Iver - Indie Folk / Acoustic
      store.likeContent(user.id, 'rec_mus_02'); // Gregory Alan Isakov - Folk

      const recs = store.getRecommendations(user.id, { type: 'music', limit: 4 });
      assert.ok(recs.length > 0);
      
      // Top item should reflect favored acoustic / folk sound
      const topGenres = recs.map(r => r.genre.toLowerCase()).join(' ');
      assert.ok(topGenres.includes('folk') || topGenres.includes('acoustic'));
    });
  });

  describe('Scenario C: General Taste vs Immediate Mood Context', () => {
    it('prioritizes immediate gentle/comfort request even if user generally likes intense cinema', () => {
      const user = store.registerUser('Movie Fan', 'movie.fan@test.com', 'password123');
      
      // User general preference includes Drama & Adventure
      store.rateContent(user.id, 'rec_mov_02', 5.0); // Walter Mitty

      // But tonight, user feels Struggling and requests Comfort
      const recs = store.getRecommendations(user.id, {
        type: 'movie',
        mood: 'Struggling',
        intention: 'comfort',
        limit: 3
      });

      assert.ok(recs.length > 0);
      // Top recommendation should match the comfort intention for struggling mood
      const topRec = recs[0];
      assert.ok(
        topRec.intentions.includes('comfort') ||
        topRec.moodAffinities.includes('Struggling') ||
        topRec.moodAffinities.includes('All')
      );
    });
  });

  describe('Scenario D: Explicit Negative Feedback & Suppression', () => {
    it('strictly suppresses disliked items from future recommendation outputs', () => {
      const user = store.registerUser('Dislike Tester', 'dislike.tester@test.com', 'password123');

      // User explicitly dislikes Walter Mitty
      store.dislikeContent(user.id, 'rec_mov_02');

      const recs = store.getRecommendations(user.id, { type: 'movie', limit: 10 });
      const containsDisliked = recs.some(r => r.id === 'rec_mov_02');
      assert.equal(containsDisliked, false, 'Disliked item must be completely excluded from recommendations');
    });
  });

  describe('Scenario E: Insufficient Data / Sparse Interaction', () => {
    it('degrades gracefully without throwing errors or calculating degenerate scores', () => {
      const user = store.registerUser('Sparse User', 'sparse.user@test.com', 'password123');
      store.rateContent(user.id, 'rec_mus_03', 4.0); // Exactly 1 rating

      const recs = store.getRecommendations(user.id, { limit: 5 });
      assert.equal(recs.length, 5);
      for (const r of recs) {
        assert.ok(typeof r.score === 'number');
        assert.ok(!isNaN(r.score));
      }
    });
  });

  describe('Scenario F: Cross-Domain Cold-Start (Movie History Known, Music Cold)', () => {
    it('recommends music based on category popularity and context without crashing', () => {
      const user = store.registerUser('Cross Domain', 'cross.domain@test.com', 'password123');
      // Only movie ratings provided
      store.rateContent(user.id, 'rec_mov_01', 5.0);
      store.rateContent(user.id, 'rec_mov_03', 5.0);

      const musicRecs = store.getRecommendations(user.id, { type: 'music', limit: 3 });
      assert.equal(musicRecs.length, 3);
      for (const m of musicRecs) {
        assert.equal(m.type, 'music');
      }
    });
  });

  describe('Scenario G: Personalization Disabled', () => {
    it('neutralizes personalized ranking weights when personalization is toggled off', () => {
      const user = store.registerUser('Privacy Minded', 'privacy.minded@test.com', 'password123');
      store.updateUserPreferences(user.id, { personalizationEnabled: false });

      // User preference vector should be null when personalization is turned off
      const vector = store.getUserPreferenceVector(user.id);
      assert.equal(vector, null);

      const recs = store.getRecommendations(user.id, { limit: 4 });
      assert.equal(recs.length, 4);
    });
  });

  describe('Offline Evaluation Metrics Accuracy', () => {
    it('accurately computes RMSE and MAE', () => {
      const testPairs = [
        { actual: 5.0, predicted: 4.0 }, // err = -1.0
        { actual: 3.0, predicted: 3.0 }, // err = 0.0
        { actual: 2.0, predicted: 3.0 }, // err = +1.0
      ];
      // sq_err = 1 + 0 + 1 = 2 -> mean = 2/3 = 0.6667 -> sqrt = 0.816
      // abs_err = 1 + 0 + 1 = 2 -> mean = 2/3 = 0.667
      const res = modelEvaluator.evaluateRatingPrediction(testPairs);
      assert.ok(Math.abs(res.rmse - 0.816) < 0.05);
      assert.ok(Math.abs(res.mae - 0.667) < 0.05);
    });

    it('computes NDCG@K correctly', () => {
      const recommended = ['item_1', 'item_2', 'item_3'];
      const relevant = new Set(['item_1', 'item_2']);
      const res = modelEvaluator.evaluateRankingMetrics(recommended, relevant, 3);
      assert.equal(res.ndcgAtK, 1.0); // Perfect ranking of top 2
      assert.equal(res.recallAtK, 1.0);
    });
  });
});
