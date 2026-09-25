import React from 'react';
import { Clock, Check, X, RotateCcw } from 'lucide-react';
import Badge from '../common/Badge';

export default function NextDosesCard({ doses = [], onToggleDoseStatus }) {
  if (doses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-2xs">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">Nenhuma dose agendada para hoje.</p>
        <p className="text-xs text-slate-400 mt-1">
          Cadastre novos tratamentos para acompanhar sua agenda de medicamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Agenda de Hoje</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {doses.length} {doses.length === 1 ? 'dose' : 'doses'}
        </span>
      </div>

      <div className="space-y-3">
        {doses.map((dose) => {
          const isTaken = dose.status === 'taken';
          const isSkipped = dose.status === 'skipped';
          const isPending = dose.status === 'pending';

          return (
            <div
              key={dose.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                isTaken
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : isSkipped
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-tight ${
                    isTaken
                      ? 'bg-emerald-600 text-white'
                      : isSkipped
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {dose.horario}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>{dose.medicationNome}</span>
                    {isTaken && <Badge variant="success">Tomado</Badge>}
                    {isSkipped && <Badge variant="slate">Pulado</Badge>}
                    {isPending && <Badge variant="warning">Pendente</Badge>}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {dose.dosagem} • <span className="text-slate-400">{dose.treatmentNome}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggleDoseStatus(dose.id, 'taken')}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs focus-ring transition-colors"
                      title="Marcar como tomado"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tomar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleDoseStatus(dose.id, 'skipped')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg focus-ring"
                      title="Pular dose"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                {(isTaken || isSkipped) && (
                  <button
                    type="button"
                    onClick={() => onToggleDoseStatus(dose.id, 'pending')}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium focus-ring flex items-center space-x-1"
                    title="Desfazer e voltar a pendente"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desfazer</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
