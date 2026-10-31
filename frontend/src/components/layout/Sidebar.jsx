import React from 'react';
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Boxes, 
  FlaskConical, 
  PackageOpen, 
  Settings, 
  HelpCircle
} from 'lucide-react';
import { translations } from '../../i18n/translations';

export default function Sidebar({ 
  currentPage, 
  onNavigate, 
  onOpenSoundbox,
  onOpenProfile,
  pendingApprovals = 0, 
  currentLang = 'mr' 
}) {
  const t = translations[currentLang] || translations.mr;

  const primaryItems = [
    {
      id: 'aaj',
      label: t.surfaceAaj,
      icon: Home
    },
    {
      id: 'vichara',
      label: t.surfaceVichara,
      icon: MessageSquare
    },
    {
      id: 'kriya',
      label: t.surfaceKriya,
      icon: CheckSquare,
      count: pendingApprovals
    },
    {
      id: 'grahak',
      label: t.surfaceGrahak,
      icon: Users
    },
    {
      id: 'maal_paisa',
      label: t.surfaceMaalPaisa,
      icon: Boxes
    }
  ];

  const toolItems = [
    {
      id: 'what_if',
      label: t.toolWhatIf,
      icon: FlaskConical
    },
    {
      id: 'stock_rescue',
      label: t.toolStockRescue,
      icon: PackageOpen
    }
  ];

  const isCurrentActive = (id) => {
    if (id === 'aaj' && (currentPage === 'aaj' || currentPage === 'dashboard')) return true;
    if (id === 'vichara' && (currentPage === 'vichara' || currentPage === 'voice')) return true;
    if (id === 'kriya' && (currentPage === 'kriya' || currentPage === 'approvals' || currentPage === 'audit')) return true;
    if (id === 'grahak' && (currentPage === 'grahak' || currentPage === 'customers' || currentPage === 'campaigns' || currentPage === 'hyperlocal')) return true;
    if (id === 'maal_paisa' && (currentPage === 'maal_paisa' || currentPage === 'inventory' || currentPage === 'suppliers' || currentPage === 'sales' || currentPage === 'transactions' || currentPage === 'capital')) return true;
    if (id === 'what_if' && (currentPage === 'what_if' || currentPage === 'simulator')) return true;
    if (id === 'stock_rescue' && (currentPage === 'stock_rescue' || currentPage === 'rescue')) return true;
    return currentPage === id;
  };

  return (
    <aside className="w-56 bg-white border-r border-[#E5E7EB] hidden md:flex flex-col h-[calc(100vh-53px)] sticky top-[53px] overflow-y-auto py-4 px-2.5 select-none justify-between text-xs font-sans">
      
      {/* Top Navigation Sections */}
      <div className="space-y-5">
        
        {/* Primary Merchant Navigation */}
        <div className="space-y-0.5">
          <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            {t.mainNavHeading}
          </div>

          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-left transition ${
                  active
                    ? 'bg-[#002970]/8 text-[#002970] font-bold border-l-2 border-[#002970]'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#002970]' : 'text-[#6B7280]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#002970] text-white">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="space-y-0.5 pt-3 border-t border-[#E5E7EB]">
          <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            {t.toolsHeading}
          </div>

          {toolItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item.id);

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition ${
                  active
                    ? 'bg-[#002970]/8 text-[#002970] font-bold border-l-2 border-[#002970]'
                    : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#002970]' : 'text-[#6B7280]'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Settings & Support */}
      <div className="space-y-0.5 pt-3 border-t border-[#E5E7EB]">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] transition text-left font-medium"
        >
          <Settings className="w-4 h-4 text-[#6B7280]" />
          <span>{t.navSettings}</span>
        </button>

        <button
          onClick={() => onNavigate('appendix')}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F7FA] transition text-left font-medium"
        >
          <HelpCircle className="w-4 h-4 text-[#6B7280]" />
          <span>{t.navHelp}</span>
        </button>

        <div className="px-2.5 pt-2 text-[10px] text-[#6B7280] font-mono">
          Paytm for Business · Dadar Mandi
        </div>
      </div>

    </aside>
  );
}
