import React, { useState, useEffect } from 'react';
import { Film, Bookmark, Check } from 'lucide-react';
import { api } from '../utils/api';
import { RecommendationItem } from '../types';

export const MoviesPage: React.FC = () => {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tones = ['All', 'Comforting', 'Funny & Light', 'Thought-Provoking', 'Inspiring', 'Quiet & Reflective'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const recs = await api.getRecommendations({ type: 'movie', limit: 12 });
        setItems(recs);
      } catch (err) {
        console.error('Failed to load movie recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  const handleToggleSave = async (item: RecommendationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveRecommendation(item.id);
      setItems(prev =>
        prev.map(r => r.id === item.id ? { ...r, isSaved: res.isSaved } : r)
      );
      showToast(res.isSaved ? `Saved "${item.title}" to watchlist` : `Removed "${item.title}" from saved`);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B3A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs flex items-center gap-2 border border-white/10">
          <Check className="w-4 h-4 text-[#31A878]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B57]">
          <Film className="w-4 h-4" />
          <span>Visual Narratives</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#172B3A] mt-1">
          Stories for how you feel.
        </h1>
        <p className="text-xs sm:text-sm text-[#657587] mt-1 max-w-2xl">
          Content matched to your emotional state and current energy. We never assume low moods just need forced cheerfulness—sometimes quiet reflection, comfort, or genuine connection is what truly nourishes.
        </p>
      </div>

      {/* Tone Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tones.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTone(t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedTone === t
                ? 'bg-[#176B57] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#4A5D6E] border border-[#E4EAF0] hover:bg-[#F7F9FC]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#176B57]/20 border-t-[#176B57] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#E4EAF0] p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-16/10 bg-stone-100 mb-3.5">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/15" />

                    <button
                      onClick={(e) => handleToggleSave(item, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      title={item.isSaved ? 'Remove from saved' : 'Save to watchlist'}
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

                  <h3 className="text-sm font-bold text-[#172B3A]">{item.title}</h3>
                  <p className="text-xs text-[#657587] mt-0.5">{item.genre}</p>

                  <p className="text-xs text-[#4A5D6E] mt-2 leading-relaxed">
                    {item.synopsis}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F0F4F8] text-[11px] text-[#176B57] bg-[#E8F5EF]/50 p-2.5 rounded-xl">
                  💡 {item.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
