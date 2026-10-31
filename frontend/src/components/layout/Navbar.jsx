import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Bell, 
  Menu, 
  ChevronDown
} from 'lucide-react';
import { translations } from '../../i18n/translations';

export default function Navbar({ 
  merchant, 
  currentLang = 'mr', 
  onLangChange, 
  onOpenVoice, 
  onNavigate, 
  onOpenSoundbox, 
  onOpenProfile, 
  pendingApprovals = 0,
  onToggleMobileMenu
}) {
  const t = translations[currentLang] || translations.mr;
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-2 transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Mobile Menu + Official Paytm for Business Logo Lockup */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] rounded-lg transition"
            aria-label={t.toggleNav}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('aaj')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="Paytm for Business — Gullak AI"
          >
            {/* Paytm for Business Official Logo */}
            <img 
              src="/paytm-for-business.png" 
              alt="Paytm for Business" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
            
            <div className="h-5 w-px bg-[#E5E7EB] hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#002970]">
                Gullak AI
              </span>
              <span className="text-[10px] font-semibold text-[#002970] bg-[#002970]/8 border border-[#002970]/15 px-1.5 py-0.2 rounded">
                Beta
              </span>
            </div>
          </div>
        </div>

        {/* Center: Compact Global Search / Ask Gullak Input */}
        <div className="flex-1 max-w-lg mx-2 hidden sm:block">
          <div 
            onClick={onOpenVoice}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 bg-[#F5F7FA] hover:bg-white border rounded-lg text-xs text-[#6B7280] transition cursor-pointer ${
              searchFocused ? 'border-[#002970] ring-1 ring-[#002970]/15 bg-white' : 'border-[#E5E7EB]'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#6B7280] flex-shrink-0" />
            <span className="truncate flex-1 font-normal text-[#6B7280]">
              {t.askGullakPlaceholder}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#6B7280] bg-white border border-[#E5E7EB] rounded">
                ⌘K
              </kbd>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVoice();
                }}
                className="w-6 h-6 rounded bg-[#002970]/10 hover:bg-[#002970] text-[#002970] hover:text-white flex items-center justify-center transition"
                title={t.askGullak}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Soundbox 4G, Language, Approvals, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
          {/* Soundbox 4G Connection Status */}
          <button
            onClick={onOpenSoundbox}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F5F7FA] hover:bg-white border border-[#E5E7EB] text-xs font-medium transition text-[#1A1A1A]"
            title={t.soundboxActive}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00875A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00875A]"></span>
            </span>
            <span className="hidden lg:inline text-[11px] font-semibold text-[#1A1A1A]">
              {t.soundboxLabel}
            </span>
            <span className="hidden xl:inline text-[10px] text-[#00875A] font-bold bg-[#00875A]/10 px-1 py-0.2 rounded border border-[#00875A]/20">
              {t.activeStatus}
            </span>
          </button>

          {/* Language Selector: Segmented, Clean */}
          <div className="flex items-center bg-[#F5F7FA] p-0.5 rounded-lg border border-[#E5E7EB] text-[11px] font-medium">
            <button
              onClick={() => onLangChange('mr')}
              className={`px-2 py-1 rounded transition ${
                currentLang === 'mr' 
                  ? 'bg-white text-[#002970] shadow-xs font-bold' 
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => onLangChange('hi')}
              className={`px-2 py-1 rounded transition ${
                currentLang === 'hi' 
                  ? 'bg-white text-[#002970] shadow-xs font-bold' 
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-2 py-1 rounded transition ${
                currentLang === 'en' 
                  ? 'bg-white text-[#002970] shadow-xs font-bold' 
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => onNavigate('kriya')}
            className="relative p-2 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] rounded-lg transition"
            title={t.notifications}
            aria-label={t.notifications}
          >
            <Bell className="w-4 h-4" />
            {pendingApprovals > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D92D20]"></span>
            )}
          </button>

          {/* Merchant Profile Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-[#F5F7FA] transition border border-transparent hover:border-[#E5E7EB] text-left select-none"
          >
            <div className="w-7 h-7 rounded bg-[#002970] text-white flex items-center justify-center font-bold text-xs">
              {merchant?.contact_name ? merchant.contact_name.charAt(0) : 'R'}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-bold text-[#1A1A1A] truncate max-w-[130px]">
                {merchant?.business_name ? merchant.business_name.replace(/,?\s*(Dadar|Mumbai|Maharashtra).*$/i, '') : 'Shree Sai Kirana'}
              </div>
              <div className="text-[10px] text-[#6B7280] truncate max-w-[130px]">
                {merchant?.contact_name || 'Rajesh Kumar'} · Dadar
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] hidden sm:block" />
          </button>

        </div>

      </div>
    </header>
  );
}
