import React from 'react';
import MedicationListView from '../medicamentos/MedicationListView';

export default function RemediosView({ medications = [], history = [], onOpenAdd, onDelete, onViewDetails }) {
  const recentHistory = history.slice(0, 10);

  return (
    <div className="animate-fade-in pb-24 space-y-6">
      <MedicationListView medications={medications} onOpenAdd={onOpenAdd} onDelete={onDelete} onViewDetails={onViewDetails} />
      {recentHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Histórico recente</h3>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Últimos {recentHistory.length} registros</span>
          </div>
          <div className="space-y-3">
            {recentHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{entry.medicationNome}</p>
                  <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <span className={
                  'text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-1 ' +
                  (entry.status === 'taken' ? 'bg-emerald-100 text-emerald-700' : entry.status === 'skipped' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700')
                }>
                  {entry.status === 'taken' ? 'Tomado' : entry.status === 'skipped' ? 'Pulado' : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}