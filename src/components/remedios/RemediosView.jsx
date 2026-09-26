import React from 'react';
import { Check, ClipboardList, History, XCircle } from 'lucide-react';
import MedicationListView from '../medicamentos/MedicationListView';

export default function RemediosView({
  medications = [],
  history = [],
  onOpenAdd,
  onDelete,
  onViewDetails,
}) {
  const recentHistory = history.slice(0, 10);

  return (
    <div className="space-y-6 pb-24">
      <MedicationListView
        medications={medications}
        onOpenAdd={onOpenAdd}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />

      {recentHistory.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <History className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    Registro das doses
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                    Últimos {recentHistory.length}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                  Aqui ficam as doses que você já registrou. Esta área é apenas um registro do que aconteceu.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {recentHistory.map((entry) => {
              const isTaken = entry.status === 'taken';

              return (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                  <div
                    className={
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' +
                      (isTaken
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500')
                    }
                  >
                    {isTaken ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-slate-900">
                      {entry.medicationNome}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-500">
                      {new Date(entry.timestamp).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      às{' '}
                      {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <span
                    className={
                      'shrink-0 rounded-full px-3 py-1.5 text-xs font-black ' +
                      (isTaken
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600')
                    }
                  >
                    {isTaken ? 'Tomado' : 'Não tomada'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="text-sm font-semibold leading-5 text-slate-600">
                Para saber o que você precisa fazer, volte para <strong className="font-black text-slate-800">Início</strong>. Este registro não cria novos lembretes.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
