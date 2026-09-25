import React, { useState } from 'react';
import { Users, Pill, Package, History, BookOpenText } from 'lucide-react';
import MedicationListView from '../medicamentos/MedicationListView';
import StockView from '../estoque/StockView';
import HistoryView from '../historico/HistoryView';
import OfficialInfoView from '../informacoes/OfficialInfoView';

const TABS = [
  { id: 'remedios', label: 'Remédios', icon: Pill },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'bulas', label: 'Bulas', icon: BookOpenText },
];

export default function CuidadorView({
  medications = [],
  treatments = [],
  history = [],
  onOpenAddMed,
  onEditMed,
  onDeleteMed,
  onViewMedDetails,
  onUpdateStock,
  onNavigateOfficial,
  initialSection = 'remedios',
}) {
  const [activeSection, setActiveSection] = useState(initialSection);

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Área do Cuidador</h1>
          <p className="text-xs text-slate-500">Gerencie medicamentos, estoque, histórico e bulas</p>
        </div>
      </div>

      <div className="flex overflow-x-auto space-x-2 pb-1 no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSection === 'remedios' && (
        <MedicationListView
          medications={medications}
          onOpenAdd={onOpenAddMed}
          onEdit={onEditMed}
          onDelete={onDeleteMed}
          onViewDetails={onViewMedDetails}
          onNavigateOfficial={onNavigateOfficial}
        />
      )}

      {activeSection === 'estoque' && (
        <StockView
          medications={medications}
          treatments={treatments}
          onUpdateStock={onUpdateStock}
        />
      )}

      {activeSection === 'historico' && (
        <HistoryView history={history} />
      )}

      {activeSection === 'bulas' && (
        <OfficialInfoView />
      )}
    </div>
  );
}
