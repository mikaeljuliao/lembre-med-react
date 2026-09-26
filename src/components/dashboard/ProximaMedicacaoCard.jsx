import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  buildReminderSpeech,
  formatClockTime,
  formatCountdown,
  formatRemainingForUser,
  getCalendarLabel,
  getReminderDateDescription,
  getReminderState,
  isDoseForActiveMedication,
  sortReminderStates,
} from '../../utils/reminderEngine';
import { speakText, stopSpeaking } from '../../utils/speech';


function createAlarmTone(audioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.45
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.45);
}

export default function ProximaMedicacaoCard({
  doses = [],
  futureDoses = [],
  medications = [],
  onToggleDoseStatus,
  onUpdateDose,
  onSnoozeDose,
}) {
  const [now, setNow] = useState(() => new Date());
  const [selectedDoseId, setSelectedDoseId] = useState(null);
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const announcedAlarmRef = useRef(null);

  const activeTodayDoses = useMemo(
    () => doses.filter((dose) => isDoseForActiveMedication(dose, medications)),
    [doses, medications]
  );

  const todayPendingDoses = useMemo(
    () =>
      sortReminderStates(
        activeTodayDoses
          .filter((dose) => dose.status === 'pending')
          .map((dose) => getReminderState(dose, now))
      ),
    [activeTodayDoses, now]
  );

  const nearestFutureDose = useMemo(
    () =>
      sortReminderStates(
        futureDoses
          .filter((dose) => isDoseForActiveMedication(dose, medications))
          .filter((dose) => dose.status === 'pending')
          .map((dose) => getReminderState(dose, now))
      )[0] || null,
    [futureDoses, medications, now]
  );

  const selectedTodayDose = useMemo(
    () =>
      todayPendingDoses.find((dose) => dose.id === selectedDoseId) ||
      todayPendingDoses[0] ||
      null,
    [todayPendingDoses, selectedDoseId]
  );

  const selectedDose = selectedTodayDose;
  const nextFutureReminder =
    todayPendingDoses.length === 0 ? nearestFutureDose : null;


  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (todayPendingDoses.length === 0) {
      setSelectedDoseId(null);
      return;
    }

    const selectedStillPending = todayPendingDoses.some(
      (dose) => dose.id === selectedDoseId
    );

    if (!selectedStillPending) {
      setSelectedDoseId(todayPendingDoses[0].id);
    }
  }, [todayPendingDoses, selectedDoseId]);

  const dueDose = useMemo(
    () => todayPendingDoses.find((dose) => dose.isDue) || null,
    [todayPendingDoses]
  );

  useEffect(() => {
    if (!dueDose || dueDose.alarmMuted) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }

      if (!dueDose) {
        stopSpeaking();
      }

      return;
    }

    const AudioCtor = window.AudioContext || window.webkitAudioContext;

    if (AudioCtor) {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtor();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      if (audioContext.state === 'running') {
        createAlarmTone(audioContext);
      }

      alarmIntervalRef.current = window.setInterval(() => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }

        if (audioContext.state === 'running') {
          createAlarmTone(audioContext);
        }
      }, 2500);
    }

    if (announcedAlarmRef.current !== dueDose.id) {
      speakText(buildReminderSpeech(dueDose, new Date()));
      announcedAlarmRef.current = dueDose.id;
    }

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [dueDose?.id, dueDose?.isDue, dueDose?.alarmMuted]);

  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
      }

      stopSpeaking();

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const stopAlarmSound = () => {
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    stopSpeaking();
  };

  const handleTake = () => {
    if (!selectedDose) return;

    stopAlarmSound();
    announcedAlarmRef.current = null;
    const currentIndex = todayPendingDoses.findIndex(
      (dose) => dose.id === selectedDose.id
    );
    const nextDose = todayPendingDoses[currentIndex + 1];

    onToggleDoseStatus(selectedDose.id, 'taken');
    setSelectedDoseId(nextDose?.id || null);
  };

  const handleMute = () => {
    if (!selectedDose || !onUpdateDose) return;

    stopAlarmSound();
    onUpdateDose(selectedDose.id, { alarmMuted: true });
  };

  const handleEnableAlarm = () => {
    if (!selectedDose || !onUpdateDose) return;

    onUpdateDose(selectedDose.id, { alarmMuted: false });
  };

  const handleSnooze = () => {
    if (!selectedDose || !onSnoozeDose) return;

    stopAlarmSound();
    announcedAlarmRef.current = null;
    onSnoozeDose(selectedDose.id, 10);
  };

  const handleListen = async () => {
    const doseToRead = selectedDose || nextFutureReminder;
    if (!doseToRead) return;

    const AudioCtor = window.AudioContext || window.webkitAudioContext;

    if (AudioCtor) {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtor();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume().catch(() => {});
      }
    }

    speakText(buildReminderSpeech(doseToRead, new Date()));
  };

  if (medications.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
          💊
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-900">
          Vamos começar
        </h2>
        <p className="mx-auto mt-2 max-w-md text-base leading-6 text-slate-600">
          Adicione seu primeiro medicamento para receber um lembrete na hora certa.
        </p>
      </section>
    );
  }

  if (!selectedDose) {
    const takenCount = activeTodayDoses.filter((dose) => dose.status === 'taken').length;
    const skippedCount = activeTodayDoses.filter((dose) => dose.status === 'skipped').length;
    const allTaken =
      activeTodayDoses.length > 0 &&
      takenCount === activeTodayDoses.length;

    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Hoje
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                {allTaken
                  ? 'Todas as doses de hoje foram registradas'
                  : 'Não há mais doses pendentes hoje'}
              </h2>
              <p className="mt-2 text-base font-semibold leading-6 text-slate-600">
                {allTaken
                  ? takenCount + ' de ' + activeTodayDoses.length + ' doses registradas.'
                  : skippedCount > 0
                    ? skippedCount + ' dose' + (skippedCount === 1 ? '' : 's') + ' marcada' + (skippedCount === 1 ? '' : 's') + ' como não tomada.'
                    : 'Você não tem mais doses pendentes neste dia.'}
              </p>
            </div>
          </div>
        </div>

        {nextFutureReminder && (
          <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Próximo lembrete
                </p>
                <p className="mt-1 text-xl font-black text-slate-900">
                  {getCalendarLabel(nextFutureReminder.target, now)}, às {formatClockTime(nextFutureReminder.target)}
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {nextFutureReminder.medicationNome}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  {nextFutureReminder.dosagem}
                </p>
              </div>

              <button
                type="button"
                onClick={handleListen}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-blue-100 bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label={'Ouvir informações do próximo lembrete de ' + nextFutureReminder.medicationNome}
              >
                <Volume2 className="h-5 w-5" />
                <span>Ouvir</span>
              </button>
            </div>
          </div>
        )}

      </section>
    );
  }

  const selectedDoseIndex = todayPendingDoses.findIndex(
    (dose) => dose.id === selectedDose.id
  );
  const isShowingNearestDose = selectedDoseIndex === 0;
  const hasPreviousDose = selectedDoseIndex > 0;
  const hasNextDose = selectedDoseIndex >= 0 && selectedDoseIndex < todayPendingDoses.length - 1;

  const handlePreviousDose = () => {
    if (!hasPreviousDose) return;
    setSelectedDoseId(todayPendingDoses[selectedDoseIndex - 1].id);
  };

  const handleNextDose = () => {
    if (!hasNextDose) return;
    setSelectedDoseId(todayPendingDoses[selectedDoseIndex + 1].id);
  };

  const handleReturnToNearestDose = () => {
    if (!todayPendingDoses[0]) return;
    setSelectedDoseId(todayPendingDoses[0].id);
  };

  const alarmActive = selectedDose.isDue && !selectedDose.alarmMuted;
  const cardClass = selectedDose.isDue ? 'bg-red-600' : 'bg-blue-600';
  const calendarLabel = getCalendarLabel(selectedDose.target, now);
  const targetDescription = getReminderDateDescription(selectedDose.target, now);

  return (
    <section className="space-y-4">
      <div className={`overflow-hidden rounded-3xl text-white shadow-lg ${cardClass}`}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-extrabold uppercase tracking-wider text-white/75">
                {selectedDose.isDue ? 'Está na hora' : 'Próximo remédio'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-2xl font-black">
                  Alarme às {formatClockTime(selectedDose.target)}
                </span>
                <span className="text-sm font-bold text-white/75">
                  {calendarLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleListen}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`Ouvir informações do lembrete de ${selectedDose.medicationNome}`}
            >
              <Volume2 className="h-5 w-5" />
              <span>Ouvir</span>
            </button>
          </div>

          <div className="mt-7">
            <p className="text-3xl font-black leading-tight sm:text-4xl">
              {selectedDose.medicationNome}
            </p>
            <p className="mt-2 text-lg font-bold text-white/85">
              {selectedDose.dosagem}
              {selectedDose.concentracao ? ' · ' + selectedDose.concentracao : ''}
            </p>
            {selectedDose.orientacaoAlimentacao &&
              selectedDose.orientacaoAlimentacao !== 'sem_orientacao' && (
                <p className="mt-2 text-sm font-bold text-white/75">
                  Orientação cadastrada: {
                    {
                      jejum: 'em jejum',
                      antes: 'antes da refeição',
                      durante: 'durante a refeição',
                      depois: 'depois da refeição',
                    }[selectedDose.orientacaoAlimentacao] || selectedDose.orientacaoAlimentacao
                  }
                </p>
              )}
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/70">
              {selectedDose.isDue ? 'Agora' : 'Tempo restante'}
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums sm:text-4xl">
              {selectedDose.isDue
                ? '00:00:00'
                : formatCountdown(selectedDose.remainingMs)}
            </p>
            <p className="mt-2 text-sm font-bold text-white/80">
              {selectedDose.isDue
                ? `Horário do alarme: ${formatClockTime(selectedDose.target)}.`
                : `${formatRemainingForUser(selectedDose.remainingMs)} · ${targetDescription}`}
            </p>
          </div>

          {selectedDose.snoozedUntil && !selectedDose.isDue && (
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-sm font-bold text-white/90">
                Lembrete adiado para {formatClockTime(new Date(selectedDose.snoozedUntil))}.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white/90">
              {selectedDose.isDue
                ? alarmActive
                  ? 'O lembrete está ativo.'
                  : 'O som está silenciado. O lembrete continua pendente.'
                : `O próximo alarme será às ${formatClockTime(selectedDose.target)}.`}
            </p>
          </div>

          {todayPendingDoses.length > 1 && (
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePreviousDose}
                  disabled={!hasPreviousDose}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Ver dose pendente anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="min-w-0 text-center">
                  <p className="text-xs font-black uppercase tracking-wider text-white/65">
                    Doses pendentes hoje
                  </p>
                  <p className="mt-0.5 text-sm font-black text-white">
                    {selectedDoseIndex + 1} de {todayPendingDoses.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextDose}
                  disabled={!hasNextDose}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Ver próxima dose pendente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                {todayPendingDoses.map((dose, index) => (
                  <span
                    key={dose.id}
                    className={
                      'h-1.5 rounded-full transition-all ' +
                      (index === selectedDoseIndex
                        ? 'w-7 bg-white'
                        : 'w-2 bg-white/30')
                    }
                    aria-hidden="true"
                  />
                ))}
              </div>

              {!isShowingNearestDose && (
                <button
                  type="button"
                  onClick={handleReturnToNearestDose}
                  className="mt-3 flex min-h-10 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Voltar para a próxima dose
                </button>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handleTake}
              className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-xl font-black text-blue-700 shadow-md transition active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              <Check className="h-6 w-6" strokeWidth={3} />
              JÁ TOMEI
            </button>

            {selectedDose.isDue && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="min-h-12 rounded-2xl border-2 border-white/35 bg-white/10 px-3 py-3 text-sm font-black text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Adiar 10 min
                </button>

                {selectedDose.alarmMuted ? (
                  <button
                    type="button"
                    onClick={handleEnableAlarm}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/35 bg-white/10 px-3 py-3 text-sm font-black text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Volume2 className="h-4 w-4" />
                    Ativar som
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleMute}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-white/35 bg-white/10 px-3 py-3 text-sm font-black text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <VolumeX className="h-4 w-4" />
                    Silenciar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


    </section>
  );
}