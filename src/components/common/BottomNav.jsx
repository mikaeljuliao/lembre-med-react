import React from 'react';
import { Home, Pill, CalendarDays, Users } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'remedios', label: 'Remédios', icon: Pill },
  { id: 'rotina', label: 'Rotina', icon: CalendarDays },
  { id: 'cuidador', label: 'Cuidador', icon: Users },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg safe-area-bottom">
      <div className="flex justify-around items-center px-2 py-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-0 ${
                isActive ? 'text-blue-600' : 'text-slate-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className={`text-[11px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
