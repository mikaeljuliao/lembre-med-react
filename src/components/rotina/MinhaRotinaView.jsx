import React, { useState } from 'react';
import { CalendarDays, Settings2 } from 'lucide-react';
import ScheduleView from '../agenda/ScheduleView';
import TreatmentListView from '../tratamentos/TreatmentListView';

const TABS = [
  { id: 'agenda', label: 'Agenda do dia' },
  { id: 'tratamentos', label: 'Rotinas configuradas' },
];

export default function MinhaRotinaView({
  selectedDate,
  setSelectedDate,
  doses = [],
  treatments = [],
  onToggleDoseStatus,
  onOpenAddTreatment,
  onEditTreatment,
  onDeleteTreatment,
  onToggleTreatmentStatus,
}) {
  const [activeSection, setActiveSection] = useState('agenda');

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Minha Rotina</h1>
          <p className="text-xs text-slate-500">Agenda de doses e rotinas cadastradas</p>
        </div>
      </div>

      <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeSection === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'agenda' && (
        <ScheduleView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          doses={doses}
          onToggleDoseStatus={onToggleDoseStatus}
          embedded
        />
      )}

      {activeSection === 'tratamentos' && (
        <TreatmentListView
          treatments={treatments}
          onOpenAdd={onOpenAddTreatment}
          onEdit={onEditTreatment}
          onDelete={onDeleteTreatment}
          onToggleStatus={onToggleTreatmentStatus}
        />
      )}
    </div>
  );
}
