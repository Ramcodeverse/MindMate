import { Router, Request, Response, NextFunction } from 'express';
import { mindMateStore } from '../store.js';
import { generateReflectionReply, generateUnifiedRecommendations, UnifiedRecommendationRequest } from '../aiService.js';
import { MoodCategory } from '../types.js';

export const apiRouter = Router();

// Rate limiting & concurrency guard for consolidated Gemini recommendations
const activeUserGenerations = new Set<string>();
const userRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 15;

// Middleware to authenticate and attach current user
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-user-id']) {
    token = String(req.headers['x-user-id']).trim();
  }

  // If token is provided, verify against store
  if (token) {
    const user = mindMateStore.getUserById(token);
    if (user) {
      req.userId = user.id;
      req.userRole = user.role;
      return next();
    }
  }

  // In demo environment, default to Sarah Johnson if no token is passed
  const defaultUser = mindMateStore.getUserById('usr_sarah_101');
  if (defaultUser) {
    req.userId = defaultUser.id;
    req.userRole = defaultUser.role;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
};

// --- System & Health ---
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MindMate',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// --- Auth Endpoints ---
apiRouter.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = mindMateStore.registerUser(name, email, password);
    return res.status(201).json({
      token: user.id,
      user,
      message: 'Welcome to MindMate! Your account has been created.'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return res.status(409).json({ error: message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = mindMateStore.authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({
    token: user.id,
    user,
    message: 'Signed in successfully.'
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = mindMateStore.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

// --- Dashboard Summary ---
apiRouter.get('/dashboard/summary', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const summary = mindMateStore.getDashboardSummary(req.userId!);
  return res.json(summary);
});

// --- Mood Endpoints ---
apiRouter.get('/moods', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const moods = mindMateStore.getMoodsForUser(req.userId!);
  return res.json(moods);
});

apiRouter.post('/moods', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { moodLevel, moodLabel, note, emotions, energyLevel, stressLevel, contextTags, desiredExperience, date } = req.body;
  if (!moodLevel || !moodLabel) {
    return res.status(400).json({ error: 'moodLevel and moodLabel are required.' });
  }

  const record = mindMateStore.createOrUpdateMood(req.userId!, {
    moodLevel: Number(moodLevel) as 1 | 2 | 3 | 4 | 5,
    moodLabel,
    note: note || '',
    emotions: Array.isArray(emotions) ? emotions : [],
    energyLevel: Number(energyLevel) || 7,
    stressLevel: Number(stressLevel) || 3,
    contextTags: Array.isArray(contextTags) ? contextTags : [],
    desiredExperience: desiredExperience || 'Calm',
    date: date || new Date().toISOString().split('T')[0],
  });

  return res.status(201).json(record);
});

apiRouter.delete('/moods/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = mindMateStore.deleteMood(req.userId!, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Mood entry not found or unauthorized' });
  }
  return res.json({ message: 'Mood entry deleted.' });
});

// Mood Intelligence Empirical Patterns
apiRouter.get('/moods/patterns', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const patterns = mindMateStore.getMoodPatterns(req.userId!);
  return res.json({
    count: patterns.length,
    patterns,
    sufficientData: patterns.length > 0 || mindMateStore.getMoodsForUser(req.userId!).length >= 3,
    totalEntriesLogged: mindMateStore.getMoodsForUser(req.userId!).length
  });
});

apiRouter.post('/moods/patterns/:id/feedback', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, userCorrection } = req.body;
  if (!status || !['validated', 'corrected', 'dismissed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be validated, corrected, or dismissed.' });
  }
  mindMateStore.submitPatternFeedback(req.userId!, req.params.id, status, userCorrection);
  return res.json({ message: 'Pattern feedback successfully saved.' });
});

// --- Recommendation Endpoints (Personalization Engine) ---
apiRouter.get('/recommendations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const type = (req.query.type as 'music' | 'movie' | 'activity' | 'tool' | 'all') || 'all';
  const intention = req.query.intention as string | undefined;
  const mood = req.query.mood as MoodCategory | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
  const genre = req.query.genre as string | undefined;
  const maxDuration = req.query.maxDuration ? parseInt(req.query.maxDuration as string, 10) : undefined;

  const recs = mindMateStore.getRecommendations(req.userId!, {
    type,
    intention,
    mood,
    limit,
    genreFilter: genre,
    maxDurationMinutes: maxDuration
  });

  return res.json(recs);
});

// Single Consolidated Gemini Recommendation Pipeline
apiRouter.post('/recommendations/unified', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId || 'usr_guest';

  // 1. Prevent duplicate concurrent submissions
  if (activeUserGenerations.has(userId)) {
    return res.status(409).json({
      error: 'A personalized recommendation request is already in progress. Please wait for it to complete.',
    });
  }

  // 2. Enforce sliding window rate limit (15 requests / 10 min)
  const now = Date.now();
  const userTimestamps = (userRateLimits.get(userId) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (userTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = userTimestamps[0];
    const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return res.status(429).json({
      error: `Rate limit reached. Please wait ${waitSeconds}s before generating another session.`,
      retryAfterSeconds: waitSeconds,
    });
  }

  // 3. Validate request payload
  const body = req.body as UnifiedRecommendationRequest;
  if (!body || !body.mood || !body.mood.primaryEmotion) {
    return res.status(400).json({ error: 'Invalid recommendation request: mood data is required.' });
  }

  // Sanitize text fields
  if (body.conversation?.finalQuestion && body.conversation.finalQuestion.length > 600) {
    body.conversation.finalQuestion = body.conversation.finalQuestion.substring(0, 600);
  }
  if (body.mood?.personalNote && body.mood.personalNote.length > 300) {
    body.mood.personalNote = body.mood.personalNote.substring(0, 300);
  }

  activeUserGenerations.add(userId);
  userTimestamps.push(now);
  userRateLimits.set(userId, userTimestamps);

  try {
    const user = mindMateStore.getUserById(userId);
    const saved = mindMateStore.getSavedContent(userId);
    const result = await generateUnifiedRecommendations(body, {
      userName: user?.name || 'Friend',
      historyStats: {
        savedCount: saved?.length || 0,
      },
    });

    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate recommendations';
    console.error('[API /recommendations/unified error]', err);
    return res.status(500).json({ error: message });
  } finally {
    activeUserGenerations.delete(userId);
  }
});

apiRouter.post('/recommendations/:id/save', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const isSaved = mindMateStore.toggleSaveContent(req.userId!, req.params.id);
  return res.json({ id: req.params.id, isSaved });
});

apiRouter.post('/recommendations/:id/like', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.likeContent(req.userId!, req.params.id);
  return res.json({ id: req.params.id, action: 'like', message: 'Marked as liked. Preferences updated.' });
});

apiRouter.post('/recommendations/:id/dislike', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.dislikeContent(req.userId!, req.params.id);
  return res.json({ id: req.params.id, action: 'dislike', message: 'Marked as disliked. This and similar items will be suppressed.' });
});

apiRouter.post('/recommendations/:id/rate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const rating = Number(req.body.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }
  mindMateStore.rateContent(req.userId!, req.params.id, rating);
  return res.json({ id: req.params.id, rating, message: `Rated ${rating}★ successfully.` });
});

apiRouter.post('/recommendations/:id/dismiss', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.dismissContent(req.userId!, req.params.id);
  return res.json({ message: 'Recommendation dismissed from your feed.' });
});

apiRouter.post('/recommendations/:id/feedback', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { action, value } = req.body;
  mindMateStore.submitRecommendationFeedback(req.userId!, req.params.id, action || 'fit_feedback', value);
  return res.json({ message: 'Thank you for your feedback! This helps tune your recommendations.' });
});

apiRouter.get('/recommendations/saved', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const saved = mindMateStore.getSavedContent(req.userId!);
  return res.json(saved);
});

apiRouter.post('/recommendations/reset-preferences', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.resetLearnedPreferences(req.userId!);
  return res.json({ message: 'Learned recommendation preferences reset.' });
});

// --- Catalog Endpoints ---
apiRouter.get('/catalog/search', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.q as string) || '';
  const type = req.query.type as string | undefined;
  const genre = req.query.genre as string | undefined;
  const mood = req.query.mood as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const results = mindMateStore.searchCatalog(query, { type, genre, mood, limit });
  return res.json({ query, count: results.length, items: results });
});

apiRouter.get('/catalog/movies', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const genre = req.query.genre as string | undefined;
  const mood = req.query.mood as string | undefined;
  const q = req.query.q as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const movies = mindMateStore.searchCatalog(q || '', { type: 'movie', genre, mood, limit });
  return res.json(movies);
});

apiRouter.get('/catalog/music', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const genre = req.query.genre as string | undefined;
  const mood = req.query.mood as string | undefined;
  const q = req.query.q as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

  const music = mindMateStore.searchCatalog(q || '', { type: 'music', genre, mood, limit });
  return res.json(music);
});

apiRouter.get('/catalog/categories', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    moodCategories: ['Great', 'Good', 'Okay', 'Low', 'Struggling'],
    musicGenres: ['Acoustic', 'Indie Folk', 'Ambient', 'Neo-Classical', 'Lo-Fi', 'Down-tempo', 'Psych-Soul'],
    movieGenres: ['Drama', 'Whimsical Comedy', 'Adventure', 'Animation', 'Science Fiction', 'Family Comedy'],
    intentions: ['comfort', 'calm', 'reset', 'focus', 'joy', 'energy', 'feel_understood']
  });
});

apiRouter.get('/search', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = mindMateStore.searchCatalog(query);
  return res.json(results);
});

// --- Preference & ML Profile Endpoints ---
apiRouter.get('/preferences', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = mindMateStore.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const vector = mindMateStore.getUserPreferenceVector(req.userId!);
  return res.json({
    preferences: user.preferences,
    derivedVector: vector ? {
      genreWeights: vector.genreWeights,
      likedCount: vector.likedItemIds.size,
      dislikedCount: vector.dislikedItemIds.size,
      savedCount: vector.savedItemIds.size,
      ratedCount: vector.ratedItems.size,
      lastUpdated: vector.lastUpdated
    } : null
  });
});

apiRouter.put('/preferences', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = mindMateStore.updateUserPreferences(req.userId!, req.body);
  return res.json(user);
});

apiRouter.delete('/preferences/reset', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.resetLearnedPreferences(req.userId!);
  return res.json({ message: 'Preferences and derived vectors successfully reset.' });
});

// --- ML Model Registry & Benchmarks ---
apiRouter.get('/ml/models', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const registry = mindMateStore.getModelRegistry();
  return res.json({
    activeModel: registry.getActiveModel(),
    allModels: registry.getAllModels()
  });
});

// --- Journal Endpoints ---
apiRouter.get('/journals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string | undefined;
  const tag = req.query.tag as string | undefined;
  const journals = mindMateStore.getJournalsForUser(req.userId!, query, tag);
  return res.json(journals);
});

apiRouter.post('/journals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { title, content, tags, moodAssociation, isPrivate, date } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Journal content cannot be empty.' });
  }

  const record = mindMateStore.createJournal(req.userId!, {
    title: title || 'Untitled Reflection',
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : [],
    moodAssociation,
    isPrivate: !!isPrivate,
    date,
  });

  return res.status(201).json(record);
});

apiRouter.patch('/journals/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = mindMateStore.updateJournal(req.userId!, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Journal entry not found or unauthorized.' });
  }
  return res.json(updated);
});

apiRouter.delete('/journals/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = mindMateStore.deleteJournal(req.userId!, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Journal entry not found or unauthorized.' });
  }
  return res.json({ message: 'Journal entry deleted.' });
});

// --- Habits Endpoints ---
apiRouter.get('/habits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const includeArchived = req.query.includeArchived === 'true';
  const habits = mindMateStore.getHabitsForUser(req.userId!, includeArchived);
  return res.json(habits);
});

apiRouter.post('/habits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, frequency, targetDaysPerWeek } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Habit name is required.' });
  }

  const habit = mindMateStore.createHabit(req.userId!, {
    name: name.trim(),
    description,
    category: category || 'Mindfulness',
    frequency: frequency || 'daily',
    targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
  });

  return res.status(201).json(habit);
});

apiRouter.post('/habits/:id/toggle', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];
  const result = mindMateStore.toggleHabitCompletion(req.userId!, req.params.id, targetDate);

  if (!result) {
    return res.status(404).json({ error: 'Habit not found or unauthorized.' });
  }
  return res.json(result);
});

apiRouter.patch('/habits/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = mindMateStore.updateHabit(req.userId!, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Habit not found or unauthorized.' });
  }
  return res.json(updated);
});

apiRouter.delete('/habits/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = mindMateStore.deleteHabit(req.userId!, req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Habit not found or unauthorized.' });
  }
  return res.json({ message: 'Habit deleted.' });
});

// --- Calendar Endpoints ---
apiRouter.get('/calendar', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
  const month = (req.query.month as string) || currentMonth;
  const data = mindMateStore.getCalendarData(req.userId!, month);
  return res.json({ month, days: data });
});

// --- AI Reflection Endpoints ---
apiRouter.get('/ai/conversation', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const conv = mindMateStore.getConversationForUser(req.userId!);
  return res.json(conv);
});

apiRouter.post('/ai/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const user = mindMateStore.getUserById(req.userId!);
  const conv = mindMateStore.getConversationForUser(req.userId!);

  // Append user message
  mindMateStore.appendAIMessage(req.userId!, {
    role: 'user',
    content: message.trim(),
  });

  // Prepare context if user allows context sharing
  const context = user?.preferences.aiContextSharing
    ? {
        userName: user.name,
        recentMood: mindMateStore.getMoodsForUser(req.userId!)[0] || null,
        activeHabitStreak: mindMateStore.getDashboardSummary(req.userId!).activeHabitStreak,
      }
    : { userName: user?.name || 'Friend' };

  // Call server-side reflection service
  const aiResult = await generateReflectionReply(
    message.trim(),
    conv.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    context
  );

  // Append assistant message
  mindMateStore.appendAIMessage(req.userId!, {
    role: 'assistant',
    content: aiResult.text,
    isCrisisResponse: aiResult.isCrisis,
  });

  return res.json({
    reply: aiResult.text,
    isCrisis: aiResult.isCrisis,
    provider: aiResult.provider,
    updatedConversation: mindMateStore.getConversationForUser(req.userId!),
  });
});

apiRouter.delete('/ai/conversation', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.clearConversation(req.userId!);
  return res.json({ message: 'Conversation cleared.' });
});

// --- User Profile & Account Data ---
apiRouter.get('/users/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = mindMateStore.getUserById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

apiRouter.patch('/users/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name, preferences } = req.body;
  if (name) {
    mindMateStore.updateUserName(req.userId!, name);
  }
  if (preferences) {
    mindMateStore.updateUserPreferences(req.userId!, preferences);
  }
  const user = mindMateStore.getUserById(req.userId!);
  return res.json(user);
});

apiRouter.get('/users/me/export', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = mindMateStore.exportUserData(req.userId!);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mindmate-export-${req.userId}.json`);
    return res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return res.status(500).json({ error: message });
  }
});

apiRouter.delete('/users/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  mindMateStore.deleteUserAccount(req.userId!);
  return res.json({ message: 'Account and all associated records permanently deleted.' });
});

// --- Admin Endpoint ---
apiRouter.get('/admin/overview', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  const allUsers = mindMateStore.getAllUsers();
  return res.json({
    totalUsers: allUsers.length,
    users: allUsers,
    activeSessions: 3,
    systemHealth: 'Optimal',
    geminiActive: !!process.env.GEMINI_API_KEY
  });
});
