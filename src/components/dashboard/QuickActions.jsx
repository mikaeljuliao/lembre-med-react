import React from 'react';
import { PlusCircle, Stethoscope, BookOpenText, CheckSquare } from 'lucide-react';

export default function QuickActions({ onOpenAddMed, onOpenAddTreatment, onNavigate }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-6">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
        Ações Rápidas
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={onOpenAddMed}
          className="flex items-center space-x-2.5 p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-blue-700 transition-colors text-left focus-ring"
        >
          <PlusCircle className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="text-xs font-bold leading-tight">Novo Medicamento</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddTreatment}
          className="flex items-center space-x-2.5 p-3 rounded-xl bg-teal-50/70 hover:bg-teal-100/80 text-teal-700 transition-colors text-left focus-ring"
        >
          <Stethoscope className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-xs font-bold leading-tight">Novo Tratamento</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('agenda')}
          className="flex items-center space-x-2.5 p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 text-purple-700 transition-colors text-left focus-ring"
        >
          <CheckSquare className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="text-xs font-bold leading-tight">Registrar Doses</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('informacoes')}
          className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-colors text-left focus-ring"
        >
          <BookOpenText className="w-5 h-5 text-slate-600 shrink-0" />
          <span className="text-xs font-bold leading-tight">Consultar Bula ANVISA</span>
        </button>
      </div>
    </div>
  );
}
