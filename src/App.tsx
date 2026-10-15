import React, { useState } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import Journal from './components/Journal';
import HabitTracker from './components/HabitTracker';
import AIReflection from './components/AIReflection';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import ProfileSettings from './components/ProfileSettings';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { BreathingModal } from './components/BreathingModal';
import { PageTransition } from './components/motion/PageTransition';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LayoutDashboard, Smile, BookOpen, CheckSquare, Sparkles } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const { user, loading, login } = useAuth();

  const handleEnterFromLanding = async () => {
    if (!user) {
      await login('sarah.johnson@email.com', 'sarah123');
    }
    setShowLanding(false);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={(view) => setCurrentView(view)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenCheckIn={() => setCurrentView('mood')}
          />
        );
      case 'mood':
        return <MoodTracker />;
      case 'journal':
        return <Journal />;
      case 'habits':
        return <HabitTracker />;
      case 'ai-chat':
        return <AIReflection />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <ProfileSettings />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : (
          <Dashboard 
            onNavigate={(view) => setCurrentView(view)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenCheckIn={() => setCurrentView('mood')}
          />
        );
      default:
        return (
          <Dashboard 
            onNavigate={(view) => setCurrentView(view)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenCheckIn={() => setCurrentView('mood')}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBF7] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-[#2D5A46]/20 border-t-[#2D5A46] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#2D5A46] tracking-wider uppercase">
          Opening Your Sanctuary...
        </p>
      </div>
    );
  }

  // If user is not logged in or chose landing page
  if (showLanding || !user) {
    return (
      <>
        <LandingPage 
          onEnterApp={handleEnterFromLanding}
          onOpenAuth={() => setShowAuthModal(true)}
        />
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  // Mobile Bottom Navigation Bar (under 15% viewport height cap)
  const mobileNavItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mood', label: 'Mood', icon: Smile },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'ai-chat', label: 'Reflect', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#163327] flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenLanding={() => setShowLanding(true)}
      />

      {/* Main Workspace Frame */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <AppHeader 
          currentView={currentView}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenBreathing={() => setIsBreathingOpen(true)}
          onQuickCheckIn={() => setCurrentView('mood')}
          onOpenLanding={() => setShowLanding(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          <PageTransition viewKey={currentView}>
            {renderView()}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation (lg:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5EDE7] px-2 py-2 flex items-center justify-around lg:hidden shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
                isActive ? 'text-[#2D5A46] font-bold' : 'text-[#5C7A6D]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Breathing Sanctuary Modal */}
      <BreathingModal 
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;