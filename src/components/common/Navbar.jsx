import { HeartPulse, Home, Pill, CircleHelp } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'remedios', label: 'Remédios', icon: Pill },
  { id: 'saude', label: 'Saúde', icon: HeartPulse },
  { id: 'ajuda', label: 'Ajuda', icon: CircleHelp },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-200 flex items-center justify-center text-white">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900">
                Dose<span className="text-blue-600">Fácil</span>
              </div>
            </div>
          </button>
        </div>

        <nav className="hidden sm:flex gap-2 pb-3" aria-label="Navegação Principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
