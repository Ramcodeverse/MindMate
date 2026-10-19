import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Music, 
  Film, 
  Activity, 
  Flower2, 
  Bookmark, 
  Play, 
  Volume2, 
  Info, 
  RotateCcw,
  Check,
  Search
} from 'lucide-react';
import { api } from '../utils/api';
import { RecommendationItem, ContentType } from '../types';
import { calmAudio } from '../utils/audio';

export const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  const [selectedIntention, setSelectedIntention] = useState<string>('all');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [explainItem, setExplainItem] = useState<RecommendationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const intentions = [
    { id: 'all', label: 'All Intentions' },
    { id: 'comfort', label: 'Comfort & Warmth' },
    { id: 'calm', label: 'Gentle Calm' },
    { id: 'energy', label: 'Lift My Energy' },
    { id: 'focus', label: 'Flow & Focus' },
    { id: 'connection', label: 'Connection' },
    { id: 'reset', label: 'Gentle Reset' },
    { id: 'sleep', label: 'Wind Down' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const type = activeTab === 'all' ? undefined : activeTab;
        const intention = selectedIntention === 'all' ? undefined : selectedIntention;
        const data = await api.getRecommendations({ type, intention, limit: 20 });
        if (isMounted) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error('Failed to load discoveries:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecs();

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedIntention]);

  const handleToggleSave = async (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveRecommendation(item.id);
      setRecommendations(prev =>
        prev.map(r => r.id === item.id ? { ...r, isSaved: res.isSaved } : r)
      );
      showToast(res.isSaved ? `Saved "${item.title}" to library` : `Removed "${item.title}" from saved`);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handlePlayAudio = (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === item.id) {
      calmAudio.stopAmbient();
      setPlayingId(null);
    } else {
      calmAudio.startAmbient();
      calmAudio.playGentleChime();
      setPlayingId(item.id);
      showToast(`Playing ambient sound preview for "${item.title}"`);
    }
  };

  const handleDismiss = async (item: RecommendationItem) => {
    try {
      await api.dismissRecommendation(item.id);
      setRecommendations(prev => prev.filter(r => r.id !== item.id));
      showToast(`Dismissed "${item.title}" from your recommendations.`);
      setExplainItem(null);
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleResetPreferences = async () => {
    if (window.confirm('Reset learned recommendation preferences? Your past mood entries will be preserved.')) {
      await api.resetRecommendationPreferences();
      showToast('Learned preferences reset to default baseline.');
      fetchRecs();
    }
  };

  // Filter recommendations by client search query if present
  const filteredRecs = recommendations.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.genre.toLowerCase().includes(q) ||
      item.synopsis.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10">
          <Check className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
            <Compass className="w-4 h-4" />
            <span>Personalized Intelligence Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A] mt-1">
            Discover what works for you.
          </h1>
          <p className="text-xs sm:text-sm text-[#657587] mt-1 max-w-2xl">
            Thoughtfully matched playlists, stories, micro-activities, and grounding tools based on your emotional state, energy levels, and explicit preferences.
          </p>
        </div>

        <button
          onClick={handleResetPreferences}
          className="text-xs font-semibold text-[#657587] hover:text-[#172B3A] border border-[#E4EAF0] px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F9FC] transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          title="Reset learned recommendation ranking"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Learned Preferences</span>
        </button>
      </div>

      {/* Intention Chips Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#657587]">
          What would feel right for you right now?
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {intentions.map((intent) => {
            const isSelected = selectedIntention === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => setSelectedIntention(intent.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#176B57] text-white shadow-2xs font-semibold'
                    : 'bg-white text-[#4A5D6E] border border-[#E4EAF0] hover:bg-[#F7F9FC]'
                }`}
              >
                {intent.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#E4EAF0]">
        <div className="flex items-center gap-1 p-1 bg-[#F0F4F8] rounded-xl max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-white text-[#172B3A] shadow-2xs' : 'text-[#657587] hover:text-[#172B3A]'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'music' ? 'bg-white text-[#172B3A] shadow-2xs' : 'text-[#657587] hover:text-[#172B3A]'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-[#176B57]" />
            <span>Music</span>
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'movie' ? 'bg-white text-[#172B3A] shadow-2xs' : 'text-[#657587] hover:text-[#172B3A]'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#E8B64C]" />
            <span>Movies & Shows</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'activity' ? 'bg-white text-[#172B3A] shadow-2xs' : 'text-[#657587] hover:text-[#172B3A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#31A878]" />
            <span>Activities</span>
          </button>
          <button
            onClick={() => setActiveTab('tool')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'tool' ? 'bg-white text-[#172B3A] shadow-2xs' : 'text-[#657587] hover:text-[#172B3A]'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-[#9279DB]" />
            <span>Calm Tools</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8A9BA8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-[#E4EAF0] rounded-xl pl-9 pr-3 py-2 text-[#172B3A] placeholder-[#8A9BA8] focus:outline-none focus:ring-1 focus:ring-[#176B57]"
          />
        </div>
      </div>

      {/* Discovery Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-[#176B57]/20 border-t-[#176B57] rounded-full animate-spin" />
          <p className="text-xs text-[#657587] font-medium">Scoring personalized recommendations...</p>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E4EAF0] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5EF] text-[#176B57] flex items-center justify-center mx-auto text-xl">
            ✨
          </div>
          <h3 className="text-sm font-bold text-[#172B3A]">No recommendations found</h3>
          <p className="text-xs text-[#657587] max-w-sm mx-auto">
            Try switching to another intention chip or resetting search filters to see all available discoveries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredRecs.map((item) => {
            const isPlaying = playingId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExplainItem(item)}
                className="bg-white rounded-3xl border border-[#E4EAF0] p-3.5 shadow-2xs hover:shadow-md hover:border-[#176B57]/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                    {/* Bookmark Save icon */}
                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
                      title={item.isSaved ? 'Remove from saved' : 'Save recommendation'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-[#31A878] text-[#31A878]' : ''}`} />
                    </button>

                    {/* Audio Preview if music */}
                    {item.type === 'music' && (
                      <button
                        onClick={(e) => handlePlayAudio(item, e)}
                        className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${
                          isPlaying 
                            ? 'bg-[#176B57] text-white scale-110' 
                            : 'bg-white/95 text-[#172B3A] hover:bg-white hover:scale-105'
                        }`}
                        title={isPlaying ? 'Pause soundscape' : 'Play ambient sound preview'}
                      >
                        {isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      </button>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="pt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeVariant === 'mint' ? 'bg-[#E8F5EF] text-[#176B57]' :
                        item.badgeVariant === 'peach' ? 'bg-[#FFF0EB] text-[#D96B43]' :
                        item.badgeVariant === 'lavender' ? 'bg-[#F2EDFD] text-[#7E57C2]' :
                        'bg-[#E6F4F9] text-[#2481A6]'
                      }`}>
                        {item.categoryBadge}
                      </span>
                      <span className="text-[10px] font-semibold text-[#8A9BA8] capitalize">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#172B3A] group-hover:text-[#176B57] transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-[#657587] line-clamp-1">
                      {item.subtitle}
                    </p>

                    {/* Traceable explanation pill */}
                    <div className="pt-1">
                      <p className="text-[10px] text-[#176B57] bg-[#E8F5EF]/60 p-2 rounded-xl line-clamp-2 leading-tight">
                        💡 {item.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0F4F8] flex items-center justify-between text-[11px]">
                  <span className="text-[#8A9BA8] font-medium">{item.duration}</span>
                  <span className="text-[#176B57] font-bold group-hover:underline">Details &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WHY THIS FITS EXPLANATION & FEEDBACK MODAL */}
      {explainItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={explainItem.imageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                      {explainItem.type}
                    </span>
                    <span className="text-xs text-[#8A9BA8]">{explainItem.duration}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#172B3A] mt-0.5">{explainItem.title}</h3>
                  <p className="text-xs text-[#657587]">{explainItem.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setExplainItem(null)}
                className="text-[#8A9BA8] hover:text-[#172B3A] p-1"
              >
                ✕
              </button>
            </div>

            {/* Traceable Explanation (Master Prompt Principle C) */}
            <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E8F5EF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B57]">
                <Info className="w-4 h-4" />
                <span>Why MindMate recommended this:</span>
              </div>
              <p className="text-xs text-[#4A5D6E] leading-relaxed">
                "{explainItem.explanation}"
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#172B3A]">Synopsis / Description</span>
              <p className="text-xs text-[#657587] leading-relaxed">
                {explainItem.synopsis}
              </p>
            </div>

            {/* Feedback: Did this fit what you needed? */}
            <div className="pt-3 border-t border-[#F0F4F8] space-y-2">
              <span className="text-xs font-bold text-[#172B3A] block">
                Did this fit what you needed?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    api.submitRecommendationFeedback(explainItem.id, 'fit_feedback', 'yes');
                    showToast('Feedback saved! Future recommendations will reflect this.');
                    setExplainItem(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E8F5EF] text-[#176B57] hover:bg-[#d5ede1] transition-colors"
                >
                  Yes, exactly
                </button>
                <button
                  onClick={() => {
                    api.submitRecommendationFeedback(explainItem.id, 'fit_feedback', 'somewhat');
                    showToast('Thank you for your feedback!');
                    setExplainItem(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#F7F9FC] text-[#657587] hover:bg-stone-100 transition-colors"
                >
                  Somewhat
                </button>
                <button
                  onClick={() => handleDismiss(explainItem)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                >
                  Not for me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
