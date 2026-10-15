import React from 'react';
import { 
  LayoutDashboard, 
  Smile, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ShieldAlert, 
  User as UserIcon, 
  LogOut, 
  Wind, 
  Heart,
  X,
  Volume2,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calmAudio } from '../utils/audio';

export type ViewType = 
  | 'dashboard' 
  | 'mood' 
  | 'journal' 
  | 'habits' 
  | 'ai-chat' 
  | 'calendar' 
  | 'analytics' 
  | 'profile' 
  | 'admin';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenBreathing: () => void;
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen,
  onOpenBreathing,
  onOpenLanding,
}) => {
  const { user, logout, switchAccount } = useAuth();

  const navItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mood', label: 'Mood Rhythm', icon: Smile },
    { id: 'journal', label: 'Daily Journal', icon: BookOpen },
    { id: 'habits', label: 'Habit Anchors', icon: CheckSquare },
    { id: 'ai-chat', label: 'AI Reflection', icon: Sparkles },
    { id: 'calendar', label: 'Calendar History', icon: CalendarIcon },
    { id: 'analytics', label: 'Wellness Trends', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Privacy', icon: UserIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Console', icon: ShieldAlert });
  }

  const handleNavClick = (id: ViewType) => {
    setCurrentView(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FBFBF7] border-r border-[#E5EDE7] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E5EDE7] flex items-center justify-between">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2D5A46] text-white flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#163327] block leading-none">
                MindMate
              </span>
              <span className="text-[11px] text-[#5C7A6D] block mt-1">
                Calm Companion
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5C7A6D]">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#EAF2EC] text-[#163327] font-semibold'
                    : 'text-[#3E5C4E] hover:bg-[#F2F6F3] hover:text-[#163327]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2D5A46]' : 'text-[#5C7A6D]'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'ai-chat' && (
                  <span className="ml-auto text-[10px] bg-[#2D5A46] text-white px-1.5 py-0.5 rounded-md font-semibold">
                    AI
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Sanctuary Tools */}
          <div className="pt-4 mt-4 border-t border-[#E5EDE7] space-y-2">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C7A6D]">
              Quick Calm
            </div>
            <button
              onClick={onOpenBreathing}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#2D5A46] bg-[#EAF2EC]/60 hover:bg-[#EAF2EC] transition-colors text-left"
            >
              <Wind className="w-4 h-4 text-[#2D5A46]" />
              <span>4-7-8 Breathing Pacer</span>
            </button>
            <button
              onClick={() => calmAudio.toggleAmbientSound()}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#4E6B5D] hover:text-[#163327] hover:bg-stone-100 rounded-lg transition-colors text-left"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#5C7A6D]" />
              <span>Toggle Rain/Forest Audio</span>
            </button>
            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#2D5A46] hover:bg-[#EAF2EC] rounded-lg transition-colors text-left font-medium"
              >
                <Compass className="w-3.5 h-3.5 text-[#2D5A46]" />
                <span>Showcase & Tour</span>
              </button>
            )}
          </div>
        </div>

        {/* User Footer & Switcher */}
        <div className="p-4 border-t border-[#E5EDE7] bg-[#F7F9F6]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#2D5A46] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#163327] truncate">
                  {user?.name || 'Guest User'}
                </p>
                <p className="text-[10px] text-[#5C7A6D] capitalize truncate">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-stone-200/60 text-[11px]">
            <span className="text-[#5C7A6D]">Role:</span>
            <button
              onClick={() => switchAccount('user')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.role !== 'admin' ? 'bg-[#2D5A46] text-white' : 'text-[#3E5C4E] hover:bg-stone-200/60'
              }`}
            >
              Sarah (User)
            </button>
            <button
              onClick={() => switchAccount('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                user?.role === 'admin' ? 'bg-[#2D5A46] text-white' : 'text-[#3E5C4E] hover:bg-stone-200/60'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;