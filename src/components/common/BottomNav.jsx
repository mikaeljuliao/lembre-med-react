import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Stethoscope,
  CalendarCheck,
  Package,
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { id: 'medicamentos', label: 'Remédios', icon: Pill },
  { id: 'tratamentos', label: 'Rotinas', icon: Stethoscope },
  { id: 'agenda', label: 'Agenda', icon: CalendarCheck },
  { id: 'estoque', label: 'Estoque', icon: Package },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex justify-around items-center">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-normal'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400'}`} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
