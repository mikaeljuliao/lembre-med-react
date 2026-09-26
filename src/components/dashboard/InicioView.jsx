import React, { useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import ProximaMedicacaoCard from './ProximaMedicacaoCard';

function formatToday() {
  const value = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getDoseTime(dose) {
  if (dose?.scheduledAt) {
    const scheduledAt = new Date(dose.scheduledAt);

    if (!Number.isNaN(scheduledAt.getTime())) {
      return scheduledAt.getTime();
    }
  }

  const [hours = 0, minutes = 0] = String(dose?.horario || '00:00')
    .split(':')
    .map(Number);

  return (Number(hours) || 0) * 60 * 60000 + (Number(minutes) || 0) * 60000;
}

export default function InicioView({
  doses = [],
  futureDoses = [],
  medications = [],
  onToggleDoseStatus,
  onUpdateDose,
  onSnoozeDose,
  onNavigate,
}) {
  const takenDoses = useMemo(
    () =>
      [...doses]
        .filter((dose) => dose.status === 'taken')
        .sort((a, b) => getDoseTime(b) - getDoseTime(a)),
    [doses]
  );

  const hasMedications = medications.length > 0;

  return (
    <div className="space-y-5 pb-24">
      <header className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">{formatToday()}</p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            O que você precisa fazer agora?
          </h1>
        </div>

        {hasMedications && (
          <button
            type="button"
            onClick={() => onNavigate('remedios')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-blue-100 bg-white px-4 py-2.5 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <Plus className="h-5 w-5" />
            Adicionar remédio
          </button>
        )}
      </header>

      <ProximaMedicacaoCard
        doses={doses}
        futureDoses={futureDoses}
        medications={medications}
        onToggleDoseStatus={onToggleDoseStatus}
        onUpdateDose={onUpdateDose}
        onSnoozeDose={onSnoozeDose}
      />

      {takenDoses.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-black text-slate-900">Tomados hoje</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              O que você já registrou.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {takenDoses.slice(0, 5).map((dose) => (
              <div key={dose.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-black text-slate-900">
                    {dose.medicationNome}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">
                    {dose.dosagem} · {dose.horario}
                  </p>
                </div>

                <span className="shrink-0 text-sm font-black text-emerald-700">
                  Tomado
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasMedications && (
        <button
          type="button"
          onClick={() => onNavigate('remedios')}
          className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 text-lg font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <Plus className="h-6 w-6" />
          Adicionar meu primeiro remédio
        </button>
      )}
    </div>
  );
}