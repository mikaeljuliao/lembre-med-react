import React from 'react';
import {
  Pill,
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  History,
  Package,
  BookOpenText,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'medicamentos', label: 'Medicamentos', icon: Pill },
  { id: 'tratamentos', label: 'Tratamentos', icon: Stethoscope },
  { id: 'agenda', label: 'Agenda / Doses', icon: CalendarCheck },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'informacoes', label: 'Informações', icon: BookOpenText },
];

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Dose<span className="text-blue-600">Fácil</span></span>
                <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200 hidden sm:inline-block">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Organize seus medicamentos. Acompanhe seu tratamento.
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegação Principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all focus-ring ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dados Locais Seguros</span>
            </div>
          </div>
        </div>

        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
