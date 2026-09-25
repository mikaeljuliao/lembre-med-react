import React from 'react';
import { Home, Pill, CalendarDays, Users } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'remedios', label: 'Remédios', icon: Pill },
  { id: 'rotina', label: 'Minha Rotina', icon: CalendarDays },
  { id: 'cuidador', label: 'Cuidador', icon: Users },
];

export default function Navbar({ activeTab, setActiveTab, simpleMode, onToggleSimpleMode }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center space-x-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Pill className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Dose<span className="text-blue-600">Fácil</span>
            </span>
          </button>

          <div className="flex items-center space-x-2">
            {onToggleSimpleMode && (
              <button
                onClick={onToggleSimpleMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  simpleMode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                id="btn-modo-simples"
                aria-pressed={simpleMode}
              >
                {simpleMode ? '🔡 Modo Simples' : 'Modo Simples'}
              </button>
            )}
          </div>
        </div>

        <nav className="hidden sm:flex space-x-1 pb-2" aria-label="Navegação Principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all focus-ring ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
