import React from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Compass, 
  BookOpen, 
  Flower2, 
  Settings, 
  Music,
  Film,
  Activity,
  ShieldAlert, 
  LogOut, 
  X,
  ChevronRight,
  Sparkles,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ViewType = 
  | 'dashboard' 
  | 'calendar' 
  | 'analytics' 
  | 'discover' 
  | 'music'
  | 'movies'
  | 'activities'
  | 'journal' 
  | 'tools' 
  | 'profile' 
  | 'check-in'
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
  onOpenLanding,
}) => {
  const { user, logout, switchAccount } = useAuth();

  const primaryNavItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Guided Flow', icon: Home },
    { id: 'calendar', label: 'Mood Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'tools', label: 'Calm Tools', icon: Flower2 },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  const discoverySubItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'music', label: 'Music for Mood', icon: Music },
    { id: 'movies', label: 'Movies & Shows', icon: Film },
    { id: 'activities', label: 'Micro-Activities', icon: Activity },
  ];

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
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#F7F9FC] border-r border-[#E4EAF0] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Part */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header (matching image.png) */}
          <div className="p-6 pb-5 flex items-center justify-between">
            <button 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#176B57] text-white flex items-center justify-center shadow-xs group-hover:bg-[#104C40] transition-colors">
                {/* MindMate Logo Icon (curved serene loop) */}
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9s-9 4.03-9 9a9 9 0 0 0 9 9Z" />
                  <path d="M9 12a3 3 0 0 0 6 0" />
                  <path d="M9 10h.01" />
                  <path d="M15 10h.01" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#172B3A] block leading-none">
                  MindMate
                </span>
                <span className="text-[11px] text-[#657587] block mt-1 font-medium">
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

          {/* Primary Navigation List */}
          <nav className="px-3.5 py-2 space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || 
                (item.id === 'discover' && ['music', 'movies', 'activities'].includes(currentView));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[#E8F5EF] text-[#176B57] font-semibold shadow-2xs'
                      : 'text-[#4A5D6E] hover:bg-[#EEF3F7] hover:text-[#172B3A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#176B57]' : 'text-[#657587]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Sub-categories for Personal Discovery */}
            <div className="pt-3 pb-1">
              <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8A9BA8]">
                Discoveries
              </div>
              <div className="space-y-0.5 mt-0.5">
                {discoverySubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = currentView === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleNavClick(sub.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                        isSubActive
                          ? 'bg-[#E8F5EF] text-[#176B57] font-semibold'
                          : 'text-[#657587] hover:bg-[#EEF3F7] hover:text-[#172B3A]'
                      }`}
                    >
                      <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-[#176B57]' : 'text-[#8A9BA8]'}`} />
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="pt-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    currentView === 'admin'
                      ? 'bg-[#E8F5EF] text-[#176B57] font-semibold'
                      : 'text-[#4A5D6E] hover:bg-[#EEF3F7]'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#176B57]" />
                  <span>Admin Console</span>
                </button>
              </div>
            )}
          </nav>

          {/* Quick Tour Link */}
          {onOpenLanding && (
            <div className="px-3.5 pt-2">
              <button
                onClick={onOpenLanding}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#176B57] bg-[#E8F5EF]/60 hover:bg-[#E8F5EF] rounded-xl transition-colors text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#176B57]" />
                <span>Product Showcase & Tour</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Part: Botanical Graphic + Profile Card + Quote (matching image.png) */}
        <div className="relative pt-4 p-4 border-t border-[#E4EAF0] bg-[#F7F9FC] overflow-hidden">
          {/* Subtle Botanical Vector Illustration in the corner (Image 1 reference) */}
          <div className="absolute -bottom-6 -left-6 pointer-events-none opacity-20 text-[#176B57]">
            <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 90 Q 30 50 60 40 Q 50 60 90 10 Q 70 40 40 50 Q 50 70 10 90 Z" />
              <path d="M25 80 Q 40 60 70 55 Q 55 70 80 30" />
            </svg>
          </div>

          {/* User Profile Card */}
          <div className="relative z-10 bg-white rounded-2xl p-3 border border-[#E4EAF0] shadow-2xs mb-3 flex items-center justify-between gap-3">
            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2.5 text-left min-w-0 flex-1 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#176B57] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#172B3A] truncate leading-tight">
                  {user?.name || 'Sarah Johnson'}
                </p>
                <p className="text-[10px] text-[#657587] truncate mt-0.5">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard Member'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A9BA8] shrink-0" />
            </button>

            <button
              onClick={logout}
              className="p-1 text-[#8A9BA8] hover:text-red-600 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Warm Tagline & Leaf (matching image.png) */}
          <div className="relative z-10 px-1 flex items-center justify-between text-[11px] text-[#657587]">
            <div>
              <p className="font-serif italic text-xs text-[#176B57] leading-tight">A calmer you</p>
              <p className="font-serif italic text-xs text-[#176B57] leading-tight">is a brighter you.</p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#E8F5EF] flex items-center justify-center text-[#176B57]">
              <Leaf className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="relative z-10 flex items-center gap-1 pt-2.5 mt-2 border-t border-[#E4EAF0] text-[10px]">
            <span className="text-[#8A9BA8]">Demo:</span>
            <button
              onClick={() => switchAccount('user')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user?.role !== 'admin' ? 'bg-[#176B57] text-white font-semibold' : 'text-[#4A5D6E] hover:bg-stone-200/60'
              }`}
            >
              Sarah
            </button>
            <button
              onClick={() => switchAccount('admin')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user?.role === 'admin' ? 'bg-[#176B57] text-white font-semibold' : 'text-[#4A5D6E] hover:bg-stone-200/60'
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