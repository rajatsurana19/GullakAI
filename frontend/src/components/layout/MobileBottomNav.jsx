import React from 'react';
import { Sun, CheckSquare, Mic, Users, Package } from 'lucide-react';
import { translations } from '../../i18n/translations';

export default function MobileBottomNav({ 
  currentPage, 
  onNavigate, 
  onOpenVoice, 
  pendingApprovals = 0, 
  currentLang = 'mr' 
}) {
  const t = translations[currentLang] || translations.mr;

  const items = [
    { id: 'aaj', label: currentLang === 'mr' ? 'आज' : currentLang === 'hi' ? 'आज' : 'Today', icon: Sun },
    { id: 'kriya', label: currentLang === 'mr' ? 'क्रिया' : currentLang === 'hi' ? 'क्रिया' : 'Actions', icon: CheckSquare, badge: pendingApprovals },
    { id: 'vichara_voice', label: currentLang === 'mr' ? 'विचारा' : currentLang === 'hi' ? 'पूछें' : 'Voice', icon: Mic, isVoice: true },
    { id: 'grahak', label: currentLang === 'mr' ? 'ग्राहक' : currentLang === 'hi' ? 'ग्राहक' : 'Customers', icon: Users },
    { id: 'maal_paisa', label: currentLang === 'mr' ? 'माल-पैसा' : currentLang === 'hi' ? 'माल-पैसा' : 'Stock', icon: Package }
  ];

  const isItemActive = (id) => {
    if (id === 'aaj' && (currentPage === 'aaj' || currentPage === 'dashboard')) return true;
    if (id === 'kriya' && (currentPage === 'kriya' || currentPage === 'approvals' || currentPage === 'audit')) return true;
    if (id === 'grahak' && (currentPage === 'grahak' || currentPage === 'customers' || currentPage === 'campaigns')) return true;
    if (id === 'maal_paisa' && (currentPage === 'maal_paisa' || currentPage === 'inventory' || currentPage === 'suppliers' || currentPage === 'capital')) return true;
    return currentPage === id;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] px-2 py-1 flex items-center justify-around shadow-sm">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isItemActive(item.id);

        if (item.isVoice) {
          return (
            <button
              key={item.id}
              onClick={onOpenVoice}
              className="-mt-5 w-12 h-12 rounded-full bg-[#002970] text-white flex items-center justify-center shadow-md active:scale-95 transition"
              aria-label="Ask Gullak Voice Assistant"
            >
              <Mic className="w-5 h-5" />
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition ${
              isActive ? 'text-[#002970] font-semibold' : 'text-[#6B7280] font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#002970]' : 'text-[#6B7280]'}`} />
            <span className="text-[10px] leading-tight">{item.label}</span>

            {item.badge > 0 && (
              <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-[#D92D20] text-white text-[9px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
