import React from 'react';
import { Calendar, CheckCircle2, Clock, Activity } from 'lucide-react';

export default function TodaySummaryCard({ doses = [], activeTreatmentsCount = 0 }) {
  const total = doses.length;
  const taken = doses.filter((d) => d.status === 'taken').length;
  const pending = doses.filter((d) => d.status === 'pending').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-slate-500 mb-1">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold">Previstas Hoje</span>
        </div>
        <div className="text-2xl font-extrabold text-slate-900">{total}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">doses agendadas</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-emerald-600 mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-xs font-semibold">Registradas</span>
        </div>
        <div className="text-2xl font-extrabold text-emerald-700">{taken}</div>
        <p className="text-[11px] text-emerald-600/70 mt-0.5">doses tomadas</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-amber-600 mb-1">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold">Pendentes</span>
        </div>
        <div className="text-2xl font-extrabold text-amber-700">{pending}</div>
        <p className="text-[11px] text-amber-600/70 mt-0.5">aguardando tomada</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-teal-600 mb-1">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-semibold">Tratamentos</span>
        </div>
        <div className="text-2xl font-extrabold text-teal-700">{activeTreatmentsCount}</div>
        <p className="text-[11px] text-teal-600/70 mt-0.5">rotinas ativas</p>
      </div>
    </div>
  );
}
