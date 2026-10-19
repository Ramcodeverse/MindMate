import React, { useState, useEffect } from 'react';
import { Music, Play, Volume2, Bookmark, Check, Info, Sparkles } from 'lucide-react';
import { api } from '../utils/api';
import { RecommendationItem } from '../types';
import { calmAudio } from '../utils/audio';

export const MusicPage: React.FC = () => {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<RecommendationItem | null>(null);

  const genres = ['All', 'Acoustic / Instrumental', 'Indie Pop / Sunlit', 'Indie Folk / Melancholy', 'Ambient / Drone / Delta Waves', 'Lo-Fi / Downtempo'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadMusic = async () => {
    try {
      setLoading(true);
      const recs = await api.getRecommendations({ type: 'music', limit: 20 });
      setItems(recs);
    } catch (err) {
      console.error('Failed to load music recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusic();
  }, []);

  const handleToggleSave = async (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveRecommendation(item.id);
      setItems(prev =>
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

  const handleFeedback = async (item: RecommendationItem, action: string) => {
    try {
      await api.submitRecommendationFeedback(item.id, action, action);
      if (action === 'not_for_me') {
        setItems(prev => prev.filter(r => r.id !== item.id));
        showToast(`Suppressed "${item.title}". Genre downweighted.`);
      } else if (action === 'exactly_what_i_wanted') {
        showToast(`Saved: Added "${item.title}" to favorites.`);
      } else if (action === 'more_like_this') {
        showToast(`Preference updated: Boosting similar soundscapes.`);
      } else if (action === 'less_like_this') {
        showToast(`Preference adjusted: Downweighting soundscape tone.`);
      }
      setActiveModalItem(null);
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  const handleRate = async (item: RecommendationItem, rating: number) => {
    try {
      await api.rateRecommendation(item.id, rating);
      showToast(`Rated "${item.title}" ${rating}★! Collaborative matrix updated.`);
      setActiveModalItem(null);
    } catch (err) {
      console.error('Failed to rate:', err);
    }
  };

  const filteredItems = items.filter(it => {
    if (selectedGenre === 'All') return true;
    return it.genre.toLowerCase().includes(selectedGenre.toLowerCase().split('/')[0].trim());
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10 animate-fade-in-up">
          <Check className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
          <Music className="w-4 h-4" />
          <span>Auditory Sanctuary & Soundscapes</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A] mt-1">
          Music that respects your state of mind.
        </h1>
        <p className="text-xs sm:text-sm text-[#657587] mt-1 max-w-2xl">
          Discover soundscapes that match how you feel and what you need right now. MindMate learns from your likes and feedback while honoring your current emotional intention.
        </p>
      </div>

      {/* Genre Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedGenre === g
                ? 'bg-[#176B57] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#4A5D6E] border border-[#E4EAF0] hover:bg-[#F7F9FC]'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Music Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#176B57]/20 border-t-[#176B57] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const isPlaying = playingId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className="bg-white rounded-3xl border border-[#E4EAF0] p-4 shadow-2xs hover:shadow-md hover:border-[#176B57]/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-100 mb-3.5">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />

                    {/* Play circle */}
                    <button
                      onClick={(e) => handlePlayAudio(item, e)}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                        isPlaying 
                          ? 'bg-[#176B57] text-white scale-110' 
                          : 'bg-white/95 text-[#172B3A] hover:bg-white hover:scale-105'
                      }`}
                      title={isPlaying ? 'Pause soundscape' : 'Play ambient soundscape preview'}
                    >
                      {isPlaying ? (
                        <Volume2 className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Bookmark Save icon */}
                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      title={item.isSaved ? 'Remove from saved' : 'Save playlist'}
                    >
                      <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-[#31A878] text-[#31A878]' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeVariant === 'mint' ? 'bg-[#E8F5EF] text-[#176B57]' :
                      item.badgeVariant === 'peach' ? 'bg-[#FFF0EB] text-[#D96B43]' :
                      item.badgeVariant === 'lavender' ? 'bg-[#F2EDFD] text-[#7E57C2]' :
                      'bg-[#E6F4F9] text-[#2481A6]'
                    }`}>
                      {item.categoryBadge}
                    </span>
                    <span className="text-[10px] text-[#8A9BA8] font-medium">{item.duration}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#172B3A] group-hover:text-[#176B57] transition-colors">{item.title}</h3>
                  <p className="text-xs text-[#657587] mt-0.5">{item.subtitle}</p>

                  <p className="text-xs text-[#4A5D6E] mt-2 leading-relaxed line-clamp-2">
                    {item.synopsis}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F0F4F8] space-y-2">
                  <div className="text-[11px] text-[#176B57] bg-[#E8F5EF]/60 p-2.5 rounded-xl flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#176B57]" />
                    <span className="leading-snug">{item.explanation}</span>
                  </div>

                  {/* Feedback Bar */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#8A9BA8]">Tune feed:</span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleFeedback(item, 'more_like_this')}
                        className="px-2 py-1 rounded-lg bg-[#F4F8F5] text-[#176B57] hover:bg-[#e4f0e9] font-medium transition-colors"
                      >
                        + More
                      </button>
                      <button
                        onClick={() => handleFeedback(item, 'not_for_me')}
                        className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                      >
                        ✕ Not for me
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL & CONTINUOUS LEARNING MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4EAF0] p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={activeModalItem.imageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#176B57]">
                    {activeModalItem.genre}
                  </span>
                  <h3 className="text-base font-bold text-[#172B3A] mt-1">{activeModalItem.title}</h3>
                  <p className="text-xs text-[#657587]">{activeModalItem.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-[#8A9BA8] hover:text-[#172B3A] p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-[#F7FAF8] rounded-2xl border border-[#E8F5EF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#176B57]">
                <Info className="w-4 h-4" />
                <span>Why this fits your profile right now:</span>
              </div>
              <p className="text-xs text-[#4A5D6E] leading-relaxed">
                "{activeModalItem.explanation}"
              </p>
            </div>

            <p className="text-xs text-[#657587] leading-relaxed">
              {activeModalItem.synopsis}
            </p>

            {/* Continuous Learning Loop Controls */}
            <div className="pt-3 border-t border-[#F0F4F8] space-y-3">
              <span className="text-xs font-bold text-[#172B3A] block">
                Continuous Learning Feedback
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleFeedback(activeModalItem, 'exactly_what_i_wanted')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#E8F5EF] text-[#176B57] hover:bg-[#d5ede1] text-left flex items-center gap-1.5"
                >
                  <span>🌟</span>
                  <span>Exactly what I wanted</span>
                </button>
                <button
                  onClick={() => handleFeedback(activeModalItem, 'more_like_this')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#F4F8F5] text-[#176B57] hover:bg-[#e4f0e9] text-left flex items-center gap-1.5"
                >
                  <span>✨</span>
                  <span>More like this</span>
                </button>
                <button
                  onClick={() => handleFeedback(activeModalItem, 'less_like_this')}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-[#F7F9FC] text-[#657587] hover:bg-stone-100 text-left flex items-center gap-1.5"
                >
                  <span>📉</span>
                  <span>Less like this</span>
                </button>
                <button
                  onClick={() => handleFeedback(activeModalItem, 'not_for_me')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 text-left flex items-center gap-1.5"
                >
                  <span>✕</span>
                  <span>Not for me</span>
                </button>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#657587]">Explicit Star Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(activeModalItem, star)}
                      className="p-1 hover:scale-125 transition-transform text-amber-400 hover:text-amber-500 text-sm"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPage;
