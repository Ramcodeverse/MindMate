import React, { useState } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import Dashboard from './components/Dashboard';
import MoodCheckInPage from './components/MoodCheckInPage';
import DiscoverPage from './components/DiscoverPage';
import MusicPage from './components/MusicPage';
import MoviesPage from './components/MoviesPage';
import ActivitiesPage from './components/ActivitiesPage';
import CalmToolsPage from './components/CalmToolsPage';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import Journal from './components/Journal';
import ProfileSettings from './components/ProfileSettings';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import { LandingPage } from './components/LandingPage';
import { BreathingModal } from './components/BreathingModal';
import { PageTransition } from './components/motion/PageTransition';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Home, Smile, Compass, Calendar, BarChart2 } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
            onOpenCheckIn={() => setCurrentView('check-in')}
          />
        );
      case 'check-in':
        return (
          <MoodCheckInPage 
            onBack={() => setCurrentView('dashboard')}
            onSaved={() => setCurrentView('dashboard')}
          />
        );
      case 'discover':
        return <DiscoverPage />;
      case 'music':
        return <MusicPage />;
      case 'movies':
        return <MoviesPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'tools':
        return <CalmToolsPage />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <Analytics />;
      case 'journal':
        return <Journal />;
      case 'profile':
        return <ProfileSettings />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : (
          <Dashboard 
            onNavigate={(view) => setCurrentView(view)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenCheckIn={() => setCurrentView('check-in')}
          />
        );
      default:
        return (
          <Dashboard 
            onNavigate={(view) => setCurrentView(view)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenCheckIn={() => setCurrentView('check-in')}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-3 border-[#176B57]/20 border-t-[#176B57] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#176B57] tracking-wider uppercase">
          Opening Your Sanctuary...
        </p>
      </div>
    );
  }

  // If user is not logged in or explicitly clicked Showcase/Landing page
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

  // Mobile Bottom Navigation Bar (WCAG 44x44px touch targets)
  const mobileNavItems: Array<{ id: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'check-in', label: 'Check-in', icon: Smile },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172B3A] flex flex-col font-sans">
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
          onQuickCheckIn={() => setCurrentView('check-in')}
          onOpenLanding={() => setShowLanding(true)}
          onNavigate={(view) => setCurrentView(view)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl w-full mx-auto">
          <PageTransition viewKey={currentView}>
            {renderView()}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation (lg:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4EAF0] px-2 py-2 flex items-center justify-around lg:hidden shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors min-h-[44px] justify-center ${
                isActive ? 'text-[#176B57] font-bold' : 'text-[#657587]'
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

      {/* Onboarding Modal if triggered */}
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
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