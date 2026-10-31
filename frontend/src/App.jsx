import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal';
import SoundboxModal from './components/voice/SoundboxModal';
import ProfileDrawer from './components/layout/ProfileDrawer';
import { apiClient } from './api/client';

// Public Views
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';

// The 5 Core Surfaces + Appendix
import DashboardPage from './pages/DashboardPage';       // 1. Aaj (Today)
import VoiceAssistantPage from './pages/VoiceAssistantPage'; // 2. Vichara (Ask)
import KriyaPage from './pages/KriyaPage';               // 3. Kriya (Actions: Waiting, Done, Results)
import GrahakPage from './pages/GrahakPage';             // 4. Grahak (Customers: Segment -> Campaign -> Results)
import MaalPaisaPage from './pages/MaalPaisaPage';       // 5. Maal & Paisa (Stock & Money)
import WhatIfLabPage from './pages/WhatIfLabPage';         // 6. What-If Business Simulator
import StockRescuePage from './pages/StockRescuePage';     // 7. Stock Rescue Agent
import AppendixPage from './pages/AppendixPage';         // Developer / Evaluator Appendix

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [merchant, setMerchant] = useState(null);
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('gullak_language') || 'mr';
  });
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSoundboxOpen, setIsSoundboxOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLangChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('gullak_language', lang);
  };

  useEffect(() => {
    const token = apiClient.getToken();
    const storedMerchant = apiClient.getMerchant();
    if (token && storedMerchant) {
      setMerchant(storedMerchant);
      if (!localStorage.getItem('gullak_language') && storedMerchant?.preferred_language) {
        handleLangChange(storedMerchant.preferred_language);
      }
      setCurrentPage('aaj');
      fetchPendingApprovals();
    }
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const res = await apiClient.getApprovals('PENDING');
      setPendingApprovalsCount(res.length);
    } catch {
      // Ignore initial background fetch error
    }
  };

  const handleLoginSuccess = (loggedInMerchant) => {
    setMerchant(loggedInMerchant);
    if (!localStorage.getItem('gullak_language') && loggedInMerchant?.preferred_language) {
      handleLangChange(loggedInMerchant.preferred_language);
    }
    setCurrentPage('aaj');
    fetchPendingApprovals();
  };

  const handleLaunchDemo = async () => {
    try {
      const data = await apiClient.demoLogin();
      apiClient.setToken(data.access_token);
      apiClient.setMerchant(data.merchant);
      handleLoginSuccess(data.merchant);
    } catch (err) {
      setCurrentPage('login');
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    apiClient.setMerchant(null);
    setMerchant(null);
    setCurrentPage('landing');
  };

  // Public unauthenticated routes
  if (currentPage === 'landing') {
    return (
      <LandingPage
        onLaunchDemo={handleLaunchDemo}
        onLogin={() => setCurrentPage('login')}
        onRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={(m) => {
          setMerchant(m);
          setCurrentPage('onboarding');
        }}
        onGoToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'onboarding') {
    return (
      <OnboardingPage
        merchant={merchant}
        onComplete={() => setCurrentPage('aaj')}
      />
    );
  }

  // Determine active surface from currentPage
  const renderCurrentSurface = () => {
    switch (currentPage) {
      case 'aaj':
      case 'dashboard':
        return (
          <DashboardPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenSoundbox={() => setIsSoundboxOpen(true)}
            currentLang={currentLang}
          />
        );

      case 'vichara':
      case 'voice':
        return (
          <VoiceAssistantPage
            onNavigate={setCurrentPage}
            currentLang={currentLang}
            onLangChange={handleLangChange}
            merchant={merchant}
          />
        );

      case 'kriya':
      case 'approvals':
      case 'audit':
        return (
          <KriyaPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            currentLang={currentLang}
          />
        );

      case 'grahak':
      case 'customers':
      case 'campaigns':
      case 'hyperlocal':
        return (
          <GrahakPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            currentLang={currentLang}
          />
        );

      case 'maal_paisa':
      case 'inventory':
      case 'suppliers':
      case 'sales':
      case 'transactions':
      case 'capital':
        return (
          <MaalPaisaPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            currentLang={currentLang}
          />
        );

      case 'what_if':
      case 'simulator':
        return (
          <WhatIfLabPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            currentLang={currentLang}
          />
        );

      case 'stock_rescue':
      case 'rescue':
        return (
          <StockRescuePage
            merchant={merchant}
            onNavigate={setCurrentPage}
            currentLang={currentLang}
          />
        );

      case 'appendix':
        return (
          <AppendixPage
            onNavigate={setCurrentPage}
          />
        );

      default:
        return (
          <DashboardPage
            merchant={merchant}
            onNavigate={setCurrentPage}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenSoundbox={() => setIsSoundboxOpen(true)}
            currentLang={currentLang}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A] flex flex-col font-sans antialiased selection:bg-[#002970]/10 selection:text-[#002970]">
      
      {/* Top Navbar */}
      <div className="relative z-30">
        <Navbar
          merchant={merchant}
          currentLang={currentLang}
          onLangChange={handleLangChange}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onNavigate={setCurrentPage}
          onOpenSoundbox={() => setIsSoundboxOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          pendingApprovals={pendingApprovalsCount}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto relative z-10">
        
        {/* Desktop Sidebar (Refined, minimal outline icons, subtle active state) */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsMobileMenuOpen(false);
          }}
          onOpenSoundbox={() => setIsSoundboxOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          pendingApprovals={pendingApprovalsCount}
          currentLang={currentLang}
        />

        {/* Mobile Slide-out Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-[#071E46]/40 backdrop-blur-xs md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] mb-4">
                  <span className="font-bold text-sm text-[#002970]">Paytm Merchant</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-stone-400 hover:text-stone-700 text-sm p-1"
                  >
                    ✕
                  </button>
                </div>
                <Sidebar
                  currentPage={currentPage}
                  onNavigate={(page) => {
                    setCurrentPage(page);
                    setIsMobileMenuOpen(false);
                  }}
                  onOpenSoundbox={() => {
                    setIsMobileMenuOpen(false);
                    setIsSoundboxOpen(true);
                  }}
                  onOpenProfile={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileOpen(true);
                  }}
                  pendingApprovals={pendingApprovalsCount}
                  currentLang={currentLang}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          {renderCurrentSurface()}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation */}
      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenVoice={() => setIsVoiceOpen(true)}
        pendingApprovals={pendingApprovalsCount}
        currentLang={currentLang}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onNavigate={setCurrentPage}
        currentLang={currentLang}
        onLangChange={handleLangChange}
        merchant={merchant}
      />

      {/* Soundbox Daily Brief Modal */}
      <SoundboxModal
        isOpen={isSoundboxOpen}
        onClose={() => setIsSoundboxOpen(false)}
        merchant={merchant}
        currentLang={currentLang}
      />

      {/* Merchant Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        merchant={merchant}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        currentLang={currentLang}
      />

    </div>
  );
}
