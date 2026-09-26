import React, { useMemo } from 'react';
import {
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Plus,
} from 'lucide-react';
import ProximaMedicacaoCard from './ProximaMedicacaoCard';
import {
  formatClockTime,
  getCalendarLabel,
  getDailyDoseSummary,
  getReminderState,
  isDoseForActiveMedication,
  sortReminderStates,
} from '../../utils/reminderEngine';

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

function DoseRow({ dose, status, now }) {
  const target = getReminderState(dose, now).target;
  const isTaken = status === 'taken';
  const isSkipped = status === 'skipped';

  return (
    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
      <div
        className={
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' +
          (isTaken
            ? 'bg-emerald-100 text-emerald-700'
            : isSkipped
              ? 'bg-slate-100 text-slate-500'
              : 'bg-amber-100 text-amber-700')
        }
      >
        {isTaken ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : isSkipped ? (
          <CircleAlert className="h-5 w-5" />
        ) : (
          <Clock3 className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-black text-slate-900">
          {dose.medicationNome}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">
          {dose.dosagem} · {formatClockTime(target)}
        </p>
      </div>

      <span
        className={
          'shrink-0 rounded-full px-3 py-1.5 text-xs font-black ' +
          (isTaken
            ? 'bg-emerald-100 text-emerald-700'
            : isSkipped
              ? 'bg-slate-100 text-slate-600'
              : 'bg-amber-100 text-amber-800')
        }
      >
        {isTaken ? 'Tomado' : isSkipped ? 'Não tomada' : 'Pendente'}
      </span>
    </div>
  );
}

function FutureDaySummary({ futureDoses, medications, now }) {
  const nextDay = useMemo(() => {
    const states = sortReminderStates(
      futureDoses
        .filter((dose) => isDoseForActiveMedication(dose, medications))
        .filter((dose) => dose.status === 'pending')
        .map((dose) => getReminderState(dose, now))
    );

    if (states.length === 0) return null;

    const first = states[0];
    const firstDate = first.target.toDateString();
    const sameDay = states.filter(
      (dose) => dose.target.toDateString() === firstDate
    );

    return {
      label: getCalendarLabel(first.target, now),
      count: sameDay.length,
      nextDose: first,
    };
  }, [futureDoses, medications, now]);

  if (!nextDay) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-blue-200 bg-blue-50 shadow-sm">
      <div className="flex items-start gap-4 px-5 py-5 sm:px-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
          <CalendarDays className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-blue-700">
            Depois de hoje
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-900">
            {nextDay.label} · {nextDay.count} dose{nextDay.count === 1 ? '' : 's'} programada{nextDay.count === 1 ? '' : 's'}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
            Essas doses não entram no controle de hoje. Elas já estão programadas para o próximo dia.
          </p>

          <div className="mt-3 rounded-2xl bg-white px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Próxima dose
            </p>
            <p className="mt-1 text-base font-black text-slate-900">
              {formatClockTime(nextDay.nextDose.target)} · {nextDay.nextDose.medicationNome}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
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
  const activeDoses = useMemo(
    () => doses.filter((dose) => isDoseForActiveMedication(dose, medications)),
    [doses, medications]
  );

  const pendingDoses = useMemo(
    () =>
      activeDoses
        .filter((dose) => dose.status === 'pending')
        .map((dose) => getReminderState(dose))
        .sort((a, b) => a.target.getTime() - b.target.getTime()),
    [activeDoses]
  );

  const takenDoses = useMemo(
    () =>
      activeDoses
        .filter((dose) => dose.status === 'taken')
        .sort((a, b) => getDoseTime(b) - getDoseTime(a)),
    [activeDoses]
  );

  const skippedDoses = useMemo(
    () =>
      activeDoses
        .filter((dose) => dose.status === 'skipped')
        .sort((a, b) => getDoseTime(b) - getDoseTime(a)),
    [activeDoses]
  );

  const hasMedications = medications.length > 0;
  const dailySummary = getDailyDoseSummary(doses, medications);

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

      {hasMedications && (
        <>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Controle de hoje
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    {dailySummary.taken} de {dailySummary.total} doses registradas
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700">
                    {dailySummary.taken} tomadas
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
                    {dailySummary.pending} pendentes
                  </span>
                  {dailySummary.skipped > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      {dailySummary.skipped} não tomada{dailySummary.skipped === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">
                Aqui você confere tudo o que aconteceu hoje. O cartão acima mostra a próxima ação.
              </p>
            </div>

            {pendingDoses.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="bg-amber-50 px-5 py-3 sm:px-6">
                  <p className="text-sm font-black text-amber-900">
                    Ainda pendentes
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-amber-800">
                    Essas doses ainda precisam ser registradas hoje.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {pendingDoses.map((dose) => (
                    <DoseRow key={dose.id} dose={dose} status="pending" now={new Date()} />
                  ))}
                </div>
              </div>
            )}

            {takenDoses.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="bg-emerald-50 px-5 py-3 sm:px-6">
                  <p className="text-sm font-black text-emerald-900">
                    Já tomadas
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-800">
                    Estas doses já foram registradas como tomadas hoje.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {takenDoses.map((dose) => (
                    <DoseRow key={dose.id} dose={dose} status="taken" now={new Date()} />
                  ))}
                </div>
              </div>
            )}

            {skippedDoses.length > 0 && (
              <div>
                <div className="bg-slate-50 px-5 py-3 sm:px-6">
                  <p className="text-sm font-black text-slate-700">
                    Marcadas como não tomadas
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {skippedDoses.map((dose) => (
                    <DoseRow key={dose.id} dose={dose} status="skipped" now={new Date()} />
                  ))}
                </div>
              </div>
            )}

            {pendingDoses.length === 0 && takenDoses.length === 0 && skippedDoses.length === 0 && (
              <div className="px-5 py-6 text-sm font-semibold text-slate-500 sm:px-6">
                Nenhuma dose foi registrada para hoje.
              </div>
            )}
          </section>

          <FutureDaySummary
            futureDoses={futureDoses}
            medications={medications}
            now={new Date()}
          />
        </>
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
