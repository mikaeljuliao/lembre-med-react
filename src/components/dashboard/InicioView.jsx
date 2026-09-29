import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListChecks,
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

function getDayStatus(summary, overdueCount) {
  if (summary.total === 0) {
    return {
      title: 'Nenhum lembrete para hoje',
      description: 'Sua rotina está livre de doses programadas hoje.',
      tone: 'slate',
    };
  }

  if (overdueCount > 0) {
    return {
      title: 'Há uma dose aguardando registro',
      description: 'Confira as doses pendentes e registre o que aconteceu.',
      tone: 'amber',
    };
  }

  if (summary.pending === 0) {
    return {
      title: 'Tudo registrado por hoje',
      description: 'Você já registrou todas as doses programadas para hoje.',
      tone: 'emerald',
    };
  }

  return {
    title: 'Dia em andamento',
    description: 'Continue registrando cada dose conforme ela acontecer.',
    tone: 'blue',
  };
}

function DayOverview({ summary, overdueCount }) {
  const resolved = summary.taken + summary.skipped;
  const progress = summary.total > 0
    ? Math.round((resolved / summary.total) * 100)
    : 0;
  const status = getDayStatus(summary, overdueCount);

  const toneClasses = {
    slate: {
      icon: 'bg-slate-100 text-slate-600',
      panel: 'border-slate-200 bg-white',
      progress: 'bg-slate-400',
      text: 'text-slate-900',
      description: 'text-slate-500',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-700',
      panel: 'border-blue-100 bg-white',
      progress: 'bg-blue-600',
      text: 'text-slate-900',
      description: 'text-slate-600',
    },
    amber: {
      icon: 'bg-amber-100 text-amber-700',
      panel: 'border-amber-200 bg-amber-50/40',
      progress: 'bg-amber-500',
      text: 'text-amber-950',
      description: 'text-amber-900/70',
    },
    emerald: {
      icon: 'bg-emerald-100 text-emerald-700',
      panel: 'border-emerald-200 bg-emerald-50/40',
      progress: 'bg-emerald-600',
      text: 'text-emerald-950',
      description: 'text-emerald-900/70',
    },
  };

  const colors = toneClasses[status.tone];

  return (
    <section className={'overflow-hidden rounded-3xl border shadow-sm ' + colors.panel}>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <div className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ' + colors.icon}>
            {status.tone === 'emerald' ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : status.tone === 'amber' ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <ListChecks className="h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Resumo do dia
            </p>
            <h2 className={'mt-1 text-xl font-black ' + colors.text}>
              {status.title}
            </h2>
            <p className={'mt-1 text-sm font-semibold leading-5 ' + colors.description}>
              {status.description}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-black tabular-nums text-slate-900">
              {progress}%
            </p>
            <p className="text-xs font-bold text-slate-400">
              resolvido
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={'h-full rounded-full transition-all duration-500 ' + colors.progress}
              style={{ width: progress + '%' }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
            <span>{summary.taken} tomadas</span>
            <span>{summary.pending} pendentes</span>
            {summary.skipped > 0 && (
              <span>{summary.skipped} não tomada{summary.skipped === 1 ? '' : 's'}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DoseRow({ dose, status, now, onToggleDoseStatus, onRequestSkip }) {
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

      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <span
          className={
            'rounded-full px-3 py-1.5 text-center text-xs font-black ' +
            (isTaken
              ? 'bg-emerald-100 text-emerald-700'
              : isSkipped
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-100 text-amber-800')
          }
        >
          {isTaken ? 'Tomado' : isSkipped ? 'Não tomada' : 'Pendente'}
        </span>

        {status === 'pending' && onToggleDoseStatus && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToggleDoseStatus(dose.id, 'taken')}
              className="min-h-10 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={'Registrar como tomada: ' + dose.medicationNome}
            >
              JÁ TOMEI
            </button>
            <button
              type="button"
              onClick={() => onRequestSkip?.(dose)}
              className="min-h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label={'Registrar como não tomada: ' + dose.medicationNome}
            >
              NÃO TOMEI
            </button>
          </div>
        )}

        {(isTaken || isSkipped) && onToggleDoseStatus && (
          <button
            type="button"
            onClick={() => onToggleDoseStatus(dose.id, 'pending')}
            className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={'Corrigir registro de ' + dose.medicationNome}
          >
            Corrigir
          </button>
        )}
      </div>
    </div>
  );
}

function UpcomingDoses({ doses, now, onToggleDoseStatus, onRequestSkip }) {
  const upcoming = useMemo(
    () =>
      sortReminderStates(
        doses
          .filter((dose) => dose.status === 'pending')
          .map((dose) => getReminderState(dose, now))
      )
    ,
    [doses, now]
  ).filter((dose) => dose.remainingMs > 0).slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Próximos lembretes
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              O que vem depois
            </h2>
          </div>
          <Clock3 className="h-6 w-6 text-blue-600" />
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Assim você sabe o que esperar sem precisar procurar.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {upcoming.map((dose) => (
          <DoseRow
            key={dose.id}
            dose={dose}
            status="pending"
            now={now}
            onToggleDoseStatus={onToggleDoseStatus}
            onRequestSkip={onRequestSkip}
          />
        ))}
      </div>
    </section>
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
    <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <CalendarDays className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                Depois de hoje
              </p>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700">
                {nextDay.count} dose{nextDay.count === 1 ? '' : 's'}
              </span>
            </div>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              {nextDay.label}
            </h2>

            <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">
              Seu próximo dia com lembretes já está programado.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Primeiro lembrete
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                {formatClockTime(nextDay.nextDose.target)}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-base font-black text-slate-900">
              {nextDay.nextDose.medicationNome}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">
              {nextDay.nextDose.dosagem}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3">
          <CalendarDays className="h-5 w-5 shrink-0 text-blue-700" />
          <p className="text-sm font-bold leading-5 text-blue-900">
            As demais doses desse dia ficam programadas automaticamente.
          </p>
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
  onRequestSkip,
  onUpdateDose,
  onSnoozeDose,
  onNavigate,
}) {
  const now = new Date();

  const activeDoses = useMemo(
    () => doses.filter((dose) => isDoseForActiveMedication(dose, medications)),
    [doses, medications]
  );

  const pendingDoses = useMemo(
    () =>
      activeDoses
        .filter((dose) => dose.status === 'pending')
        .map((dose) => getReminderState(dose, now))
        .sort((a, b) => a.target.getTime() - b.target.getTime()),
    [activeDoses, now]
  );

  const overdueDoses = useMemo(
    () => pendingDoses.filter((dose) => dose.isOverdue),
    [pendingDoses]
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
  const dailySummary = getDailyDoseSummary(doses, medications, now);

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

      {!hasMedications ? (
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-blue-50 via-white to-white px-6 py-8 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Plus className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Comece pela sua rotina de remédios
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-base font-semibold leading-6 text-slate-600">
              Cadastre um remédio e seus horários. Depois, o Início mostrará o que você precisa fazer ao longo do dia.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('remedios')}
              className="mt-6 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Plus className="h-6 w-6" />
              Adicionar meu primeiro remédio
            </button>
          </div>
        </section>
      ) : (
        <>
          <DayOverview summary={dailySummary} overdueCount={overdueDoses.length} />

          <ProximaMedicacaoCard
            doses={doses}
            futureDoses={futureDoses}
            medications={medications}
            onToggleDoseStatus={onToggleDoseStatus}
            onRequestSkip={onRequestSkip}
            onUpdateDose={onUpdateDose}
            onSnoozeDose={onSnoozeDose}
          />

          {overdueDoses.length > 0 && (
            <section className="overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm">
              <div className="border-b border-amber-200 px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-amber-950">
                      {overdueDoses.length === 1
                        ? 'Uma dose está aguardando registro'
                        : overdueDoses.length + ' doses estão aguardando registro'}
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-5 text-amber-900/75">
                      Se você já tomou, registre. Se não tomou, marque o motivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-amber-200">
                {overdueDoses.map((dose) => (
                  <DoseRow
                    key={dose.id}
                    dose={dose}
                    status="pending"
                    now={now}
                    onToggleDoseStatus={onToggleDoseStatus}
                    onRequestSkip={onRequestSkip}
                  />
                ))}
              </div>
            </section>
          )}

          <UpcomingDoses
            doses={activeDoses}
            now={now}
            onToggleDoseStatus={onToggleDoseStatus}
            onRequestSkip={onRequestSkip}
          />

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Registros de hoje
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    O que já aconteceu
                  </h2>
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Confira suas doses sem precisar abrir outra tela.
              </p>
            </div>

            {takenDoses.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="bg-emerald-50 px-5 py-3 sm:px-6">
                  <p className="text-sm font-black text-emerald-900">
                    Já tomadas
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {takenDoses.map((dose) => (
                    <DoseRow
                      key={dose.id}
                      dose={dose}
                      status="taken"
                      now={now}
                      onToggleDoseStatus={onToggleDoseStatus}
                    />
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
                    <DoseRow
                      key={dose.id}
                      dose={dose}
                      status="skipped"
                      now={now}
                      onToggleDoseStatus={onToggleDoseStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {takenDoses.length === 0 && skippedDoses.length === 0 && (
              <div className="px-5 py-7 sm:px-6">
                <p className="text-base font-black text-slate-800">
                  Nenhuma dose foi concluída ainda.
                </p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                  Quando você registrar uma dose, ela aparecerá aqui.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('remedios')}
              className="flex min-h-12 w-full items-center justify-center gap-2 border-t border-slate-100 px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            >
              Ver medicamentos e histórico
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <FutureDaySummary
            futureDoses={futureDoses}
            medications={medications}
            now={now}
          />
        </>
      )}
    </div>
  );
}
