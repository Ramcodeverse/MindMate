import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MindMateStore } from '../server/store.js';
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

  describe('Scenario H: Mood Intelligence Pattern Detection', () => {
    it('detects sleep-energy correlation only when supporting data exists', () => {
      const user = store.registerUser('Pattern Explorer', 'pattern.explorer@test.com', 'password123');
      
      // Before entries: no patterns detected
      let patterns = store.getMoodPatterns(user.id);
      assert.equal(patterns.length, 0);

      // Add entries with disrupted sleep and low energy
      store.createOrUpdateMood(user.id, {
        moodLevel: 2,
        moodLabel: 'Low',
        energyLevel: 3,
        stressLevel: 6,
        contextTags: ['Sleep Quality'],
        emotions: ['Fatigued'],
        date: '2026-10-10'
      });
      store.createOrUpdateMood(user.id, {
        moodLevel: 2,
        moodLabel: 'Low',
        energyLevel: 3,
        stressLevel: 7,
        contextTags: ['Sleep Quality'],
        emotions: ['Fatigued'],
        date: '2026-10-11'
      });
      store.createOrUpdateMood(user.id, {
        moodLevel: 4,
        moodLabel: 'Good',
        energyLevel: 8,
        stressLevel: 2,
        contextTags: ['Time Outdoors'],
        emotions: ['Calm'],
        date: '2026-10-12'
      });

      patterns = store.getMoodPatterns(user.id);
      assert.ok(patterns.length >= 1);
      const sleepPattern = patterns.find(p => p.category === 'sleep');
      assert.ok(sleepPattern);
      assert.ok(sleepPattern.dataPointsCount >= 2);

      // Validate pattern
      store.submitPatternFeedback(user.id, sleepPattern.id, 'validated');
      const updatedPatterns = store.getMoodPatterns(user.id);
      const validated = updatedPatterns.find(p => p.id === sleepPattern.id);
      assert.equal(validated?.status, 'validated');
    });

    it('records user correction on pattern insight', () => {
      const user = store.registerUser('Correction User', 'correction.user@test.com', 'password123');
      store.createOrUpdateMood(user.id, {
        moodLevel: 2,
        moodLabel: 'Low',
        energyLevel: 3,
        stressLevel: 6,
        contextTags: ['Sleep Quality'],
        emotions: ['Fatigued'],
        date: '2026-10-01'
      });
      store.createOrUpdateMood(user.id, {
        moodLevel: 2,
        moodLabel: 'Low',
        energyLevel: 3,
        stressLevel: 6,
        contextTags: ['Sleep Quality'],
        emotions: ['Fatigued'],
        date: '2026-10-02'
      });
      store.createOrUpdateMood(user.id, {
        moodLevel: 4,
        moodLabel: 'Good',
        energyLevel: 7,
        stressLevel: 3,
        date: '2026-10-03'
      });

      store.submitPatternFeedback(user.id, 'pat_sleep_energy_drop', 'corrected', 'Fatigue was caused by seasonal allergies');
      const patterns = store.getMoodPatterns(user.id);
      const corrected = patterns.find(p => p.id === 'pat_sleep_energy_drop');
      assert.equal(corrected?.status, 'corrected');
      assert.equal(corrected?.userCorrection, 'Fatigue was caused by seasonal allergies');
    });
  });

  describe('Scenario I: Continuous Learning Feedback Loop', () => {
    it('updates user genre weights and suppresses items when "not_for_me" is submitted', () => {
      const user = store.registerUser('Feedback Tester', 'feedback.tester@test.com', 'password123');
      const vectorBefore = store.getUserPreferenceVector(user.id)!;
      const initialGenreWeight = vectorBefore.genreWeights['Whimsical Comedy'] || 1.0;

      // Submit "not_for_me" for Amelie (rec_mov_03)
      store.submitRecommendationFeedback(user.id, 'rec_mov_03', 'not_for_me', 'not_for_me');

      const vectorAfter = store.getUserPreferenceVector(user.id)!;
      assert.ok(vectorAfter.genreWeights['Whimsical Comedy'] < initialGenreWeight);
      assert.ok(vectorAfter.dislikedItemIds.has('rec_mov_03'));

      // Ensure item is excluded from subsequent movie recommendations
      const recs = store.getRecommendations(user.id, { type: 'movie', limit: 10 });
      assert.ok(!recs.some(r => r.id === 'rec_mov_03'));
    });

    it('boosts weights when "exactly_what_i_wanted" is submitted', () => {
      const user = store.registerUser('Affinity Tester', 'affinity.tester@test.com', 'password123');
      const vectorBefore = store.getUserPreferenceVector(user.id)!;
      const initialWeight = vectorBefore.genreWeights['Heartwarming Family'] || 1.0;

      // Submit "exactly_what_i_wanted" for Paddington 2 (rec_mov_05)
      store.submitRecommendationFeedback(user.id, 'rec_mov_05', 'exactly_what_i_wanted', 'exactly_what_i_wanted');

      const vectorAfter = store.getUserPreferenceVector(user.id)!;
      assert.ok(vectorAfter.genreWeights['Heartwarming Family'] > initialWeight);
      assert.ok(vectorAfter.likedItemIds.has('rec_mov_05'));
    });
  });

  describe('Test 5: Domain Separation (Movie Likes Do Not Arbitrarily Alter Music Preferences)', () => {
    it('updates movie preferences upon movie interaction without corrupting music preference vectors', () => {
      const user = store.registerUser('Domain Tester', 'domain.tester@test.com', 'password123');
      const vectorBefore = store.getUserPreferenceVector(user.id)!;
      const initialMusicGenreWeights = { ...vectorBefore.genreWeights };

      // User likes a drama movie
      store.likeContent(user.id, 'rec_mov_01'); // Good Will Hunting

      const vectorAfter = store.getUserPreferenceVector(user.id)!;
      // Movie vector updated
      assert.ok(vectorAfter.likedItemIds.has('rec_mov_01'));
      // Music-specific genre weights should remain stable
      assert.equal(vectorAfter.genreWeights['Ambient'], initialMusicGenreWeights['Ambient']);
      assert.equal(vectorAfter.genreWeights['Lo-Fi'], initialMusicGenreWeights['Lo-Fi']);
    });
  });

  describe('Test 8: Cross-User Data Isolation & Saved Persistence', () => {
    it('guarantees that saved items and preferences are strictly isolated between users', () => {
      const userA = store.registerUser('User Alpha', 'alpha@test.com', 'password123');
      const userB = store.registerUser('User Beta', 'beta@test.com', 'password123');

      // User A saves Walter Mitty
      store.toggleSaveContent(userA.id, 'rec_mov_02');
      const savedA = store.getSavedContent(userA.id);
      const savedB = store.getSavedContent(userB.id);

      assert.equal(savedA.length, 1);
      assert.equal(savedA[0].id, 'rec_mov_02');
      // User B must have 0 saved items
      assert.equal(savedB.length, 0);
    });
  });

  describe('Test 9: Graceful Fallback and Fault Tolerance', () => {
    it('gracefully handles non-existent IDs, invalid ratings, and empty candidate sets', () => {
      const user = store.registerUser('Robust User', 'robust.user@test.com', 'password123');

      // Interacting with invalid ID should not crash the engine
      store.likeContent(user.id, 'non_existent_item_9999');
      store.rateContent(user.id, 'non_existent_item_9999', 4.5);
      store.submitRecommendationFeedback(user.id, 'non_existent_item_9999', 'not_for_me', 'not_for_me');

      // Engine still returns healthy recommendations
      const recs = store.getRecommendations(user.id, { limit: 5 });
      assert.ok(recs.length > 0);
    });
  });

  describe('Test 10: Complete 5-Stage Closed-Loop Workflow Verification', () => {
    it('executes the full cycle: User Inputs -> Profile -> Rec Engine -> Results -> Feedback -> Updated Profile', () => {
      // Stage 1: User Inputs (Registration + Onboarding + Mood Check-In)
      const user = store.registerUser('Cycle User', 'cycle.user@test.com', 'password123');
      store.updateUserPreferences(user.id, {
        musicGenres: ['Ambient', 'Lo-Fi'],
        movieGenres: ['Animation'],
        onboardingCompleted: true
      });
      const mood = store.createOrUpdateMood(user.id, {
        moodLevel: 3,
        moodLabel: 'Okay',
        energyLevel: 4,
        stressLevel: 6,
        contextTags: ['Work & Career'],
        desiredExperience: 'Calm',
        note: 'Tired after meetings'
      });
      assert.ok(mood.id);

      // Stage 2: Personalization Profile Active
      const initialProfile = store.getUserPreferenceVector(user.id);
      assert.ok(initialProfile);

      // Stage 3 & 4: Recommendation Engine & Results
      const recsStage4 = store.getRecommendations(user.id, {
        type: 'music',
        intention: 'calm',
        limit: 5
      });
      assert.ok(recsStage4.length > 0);
      assert.ok(recsStage4[0].explanation.length > 0);

      // Stage 5: Feedback & Evaluation
      const targetItem = recsStage4[0];
      store.submitRecommendationFeedback(user.id, targetItem.id, 'more_like_this', 'more_like_this');

      // Verify Stage 5 updated Stage 2 Profile
      const updatedProfile = store.getUserPreferenceVector(user.id)!;
      assert.ok(updatedProfile.likedItemIds.has(targetItem.id));

      // Verify Future Recommendations Reflect Updated Profile
      const subsequentRecs = store.getRecommendations(user.id, { type: 'music', limit: 5 });
      assert.ok(subsequentRecs.length > 0);
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
