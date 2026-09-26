import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Clock3,
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

  const pendingDoses = useMemo(() => {
    const todayPending = doses.filter((dose) => dose.status === 'pending');
    const futurePending = futureDoses.filter((dose) => dose.status === 'pending');

    return [...todayPending, ...futurePending];
  }, [doses, futureDoses]);

  const reminderStates = useMemo(
    () =>
      sortReminderStates(
        pendingDoses.map((dose) => getReminderState(dose, now))
      ),
    [pendingDoses, now]
  );

  const dueDoses = useMemo(
    () => reminderStates.filter((dose) => dose.isDue),
    [reminderStates]
  );

  const selectedDose =
    dueDoses[0] ||
    reminderStates.find((dose) => dose.id === selectedDoseId) ||
    reminderStates[0] ||
    null;

  const selectedIndex = selectedDose
    ? reminderStates.findIndex((dose) => dose.id === selectedDose.id)
    : -1;

  const takenCount = doses.filter((dose) => dose.status === 'taken').length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (reminderStates.length === 0) {
      setSelectedDoseId(null);
      return;
    }

    if (!reminderStates.some((dose) => dose.id === selectedDoseId)) {
      setSelectedDoseId(reminderStates[0].id);
    }
  }, [reminderStates, selectedDoseId]);

  useEffect(() => {
    if (!selectedDose?.isDue || selectedDose.alarmMuted) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }

      if (!selectedDose?.isDue) {
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

    if (announcedAlarmRef.current !== selectedDose.id) {
      speakText(buildReminderSpeech(selectedDose, new Date()));
      announcedAlarmRef.current = selectedDose.id;
    }

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [selectedDose?.id, selectedDose?.isDue, selectedDose?.alarmMuted]);

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
    onToggleDoseStatus(selectedDose.id, 'taken');
    setSelectedDoseId(null);
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
    if (!selectedDose) return;

    const AudioCtor = window.AudioContext || window.webkitAudioContext;

    if (AudioCtor) {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtor();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume().catch(() => {});
      }
    }

    speakText(buildReminderSpeech(selectedDose, new Date()));
  };

  if (medications.length === 0 && doses.length === 0) {
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
    return (
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
          <Check className="h-9 w-9" strokeWidth={3} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-900">
          Por hoje, está tudo certo
        </h2>
        <p className="mx-auto mt-2 max-w-md text-base leading-6 text-slate-600">
          Você não tem mais medicamentos pendentes neste dia.
        </p>
      </section>
    );
  }

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
            </p>
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
                ? `O alarme deveria tocar às ${formatClockTime(selectedDose.target)}.`
                : `${formatRemainingForUser(selectedDose.remainingMs)} · ${targetDescription}`}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white/90">
              {selectedDose.isDue
                ? alarmActive
                  ? 'O lembrete está ativo.'
                  : 'O som está silenciado. O lembrete continua pendente.'
                : `O próximo alarme será às ${formatClockTime(selectedDose.target)}.`}
            </p>
          </div>

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

      {reminderStates.length > 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="px-4 pb-2 pt-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Próximos lembretes
            </p>
          </div>

          <div className="space-y-1">
            {reminderStates.slice(0, 5).map((dose, index) => {
              const selected = dose.id === selectedDose.id;

              return (
                <button
                  key={dose.id}
                  type="button"
                  onClick={() => setSelectedDoseId(dose.id)}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  aria-current={selected ? 'true' : undefined}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      dose.isDue
                        ? 'bg-red-100 text-red-700'
                        : selected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-black text-slate-900">
                      {dose.medicationNome}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-slate-500">
                      Alarme às {formatClockTime(dose.target)} · {formatRemainingForUser(dose.remainingMs)}
                    </span>
                  </span>

                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1 text-sm">
        <span className="font-bold text-slate-500">
          {takenCount} de {doses.length} tomados hoje
        </span>
        <span className="font-bold text-slate-400">
          {selectedIndex + 1} de {reminderStates.length}
        </span>
      </div>
    </section>
  );
}