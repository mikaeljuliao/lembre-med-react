import { HeartPulse, Home, Pill, CircleHelp } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'remedios', label: 'Remédios', icon: Pill },
  { id: 'saude', label: 'Cuidados', icon: HeartPulse },
  { id: 'ajuda', label: 'Como usar', icon: CircleHelp },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] safe-area-bottom">
      <div className="flex justify-around items-center px-2 py-2.5">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all min-w-0 ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon
                aria-hidden="true"
                className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className={`text-[10px] font-extrabold ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
