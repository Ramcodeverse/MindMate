import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Wind, 
  Plus, 
  X
} from 'lucide-react';
import { calmAudio } from '../utils/audio';
import { ViewType } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { RecommendationItem } from '../types';

interface AppHeaderProps {
  currentView: ViewType;
  onOpenSidebar: () => void;
  onOpenBreathing: () => void;
  onQuickCheckIn: () => void;
  onOpenLanding?: () => void;
  onNavigate?: (view: ViewType) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenSidebar,
  onOpenBreathing,
  onQuickCheckIn,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState(calmAudio.getIsPlaying());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecommendationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Gentle check-in reminder', message: 'You usually feel calmer after an afternoon breath break.', time: '20m ago', unread: true },
    { id: '2', title: 'New playlist ready', message: '"Clean Vibes" matches your current good mood.', time: '2h ago', unread: true },
    { id: '3', title: 'Habit anchor streak', message: 'You reached an 8-day streak with your nature walks!', time: 'Yesterday', unread: false },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const toggleAudio = () => {
    const state = calmAudio.toggleAmbientSound();
    setIsPlayingAudio(state);
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchCatalog(searchQuery);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item: RecommendationItem) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (onNavigate) {
      if (item.type === 'music') onNavigate('music');
      else if (item.type === 'movie') onNavigate('movies');
      else if (item.type === 'activity') onNavigate('activities');
      else if (item.type === 'tool') onNavigate('tools');
      else onNavigate('discover');
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E4EAF0] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu + Search Bar (matching image.png) */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-xl text-[#657587] hover:text-[#172B3A] hover:bg-[#F3F7F3] lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (matching mockup header: "Search music, movies, tools, or insights...") */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A9BA8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search music, movies, tools, or insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
              className="w-full text-xs bg-[#F7F9FC] border border-[#E4EAF0] rounded-full pl-9 pr-8 py-2 text-[#172B3A] placeholder-[#8A9BA8] focus:outline-none focus:ring-1 focus:ring-[#176B57] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9BA8] hover:text-[#172B3A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E4EAF0] shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A9BA8] flex items-center justify-between">
                <span>Matching Recommendations</span>
                {isSearching && <span className="text-[10px] text-[#176B57] animate-pulse">Searching...</span>}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="p-4 text-center text-xs text-[#657587]">
                  No matching recommendations found. Try searching for "acoustic", "drama", "walk", or "breathing".
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F9FC] transition-colors text-left group"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-10 h-10 rounded-lg object-cover shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#172B3A] group-hover:text-[#176B57] truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#E8F5EF] text-[#176B57] font-medium shrink-0">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#657587] truncate">{item.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick actions + Notifications + Avatar (matching image.png) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ambient Sound Generator Toggle */}
        <button
          onClick={toggleAudio}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isPlayingAudio
              ? 'bg-[#E8F5EF] text-[#176B57] border-[#176B57]'
              : 'bg-white text-[#657587] border-[#E4EAF0] hover:bg-stone-50'
          }`}
          title={isPlayingAudio ? 'Mute ambient soundscape' : 'Play ambient rain/forest soundscape'}
        >
          {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 text-[#176B57]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8A9BA8]" />}
          <span className="text-[11px]">{isPlayingAudio ? 'Sound On' : 'Ambient'}</span>
        </button>

        {/* Breathwork shortcut */}
        <button
          onClick={onOpenBreathing}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#176B57] bg-[#E8F5EF] hover:bg-[#d9ece2] transition-colors shadow-2xs"
          title="Open guided breathing pacer"
        >
          <Wind className="w-3.5 h-3.5" />
          <span className="text-[11px]">Breathwork</span>
        </button>

        {/* Quick Check-in Button */}
        <button
          onClick={onQuickCheckIn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#176B57] hover:bg-[#104C40] shadow-2xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Log Mood</span>
        </button>

        {/* Notification Bell (matching image.png with red badge) */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-[#657587] hover:text-[#172B3A] hover:bg-[#F7F9FC] transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-[#E4EAF0] shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F8] mb-2 px-1">
                <span className="text-xs font-bold text-[#172B3A]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-semibold text-[#176B57] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.unread ? 'bg-[#F7FAF8] border border-[#E8F5EF]' : 'text-[#657587]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#172B3A]">{n.title}</span>
                      <span className="text-[10px] text-[#8A9BA8]">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#4A5D6E] mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle S with Dropdown Caret (matching image.png) */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={() => onNavigate && onNavigate('profile')}
            className="w-8 h-8 rounded-full bg-[#104C40] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:opacity-90 transition-opacity"
            title="Account Settings"
          >
            {user?.name?.charAt(0) || 'S'}
          </button>
          <ChevronDown className="w-3.5 h-3.5 text-[#8A9BA8]" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
