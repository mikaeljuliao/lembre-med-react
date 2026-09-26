import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlarmClock,
  Check,
  ChevronRight,
  Clock3,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';

function getDoseTarget(dose) {
  if (dose?.snoozedUntil) {
    const snoozedTarget = new Date(dose.snoozedUntil);
    if (!Number.isNaN(snoozedTarget.getTime())) return snoozedTarget;
  }

  if (dose?.scheduledAt) {
    const scheduledTarget = new Date(dose.scheduledAt);
    if (!Number.isNaN(scheduledTarget.getTime())) return scheduledTarget;
  }

  const [hours = 0, minutes = 0, seconds = 0] = String(dose?.horario || '00:00')
    .split(':')
    .map(Number);

  const target = new Date();
  target.setHours(
    Number(hours) || 0,
    Number(minutes) || 0,
    Number(seconds) || 0,
    0
  );

  return target;
}

function getDoseState(dose, now) {
  const target = getDoseTarget(dose);
  const remainingMs = target.getTime() - now.getTime();

  return {
    ...dose,
    target,
    remainingMs,
    isDue: remainingMs <= 0,
  };
}

function sortDoses(doses) {
  return [...doses].sort((a, b) => {
    if (a.remainingMs !== b.remainingMs) return a.remainingMs - b.remainingMs;

    const nameDifference = String(a.medicationNome).localeCompare(
      String(b.medicationNome)
    );

    if (nameDifference !== 0) return nameDifference;
    return String(a.id).localeCompare(String(b.id));
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function buildSpeechText(dose) {
  return `Está na hora de tomar ${dose.dosagem} de ${dose.medicationNome}.`;
}

function getTargetDescription(dose, now) {
  if (dose.isDue) {
    return `Horário: ${formatTime(dose.target)}`;
  }

  const difference = dose.target.getTime() - now.getTime();
  const minutes = Math.max(1, Math.ceil(difference / 60000));

  if (minutes < 60) {
    return `Em ${minutes} minuto${minutes !== 1 ? 's' : ''} · ${formatTime(dose.target)}`;
  }

  return `Hoje às ${formatTime(dose.target)}`;
}

function createAlarmTone(audioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.06, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.5
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

export default function ProximaMedicacaoCard({
  doses = [],
  medications = [],
  onToggleDoseStatus,
  onUpdateDose,
  onSnoozeDose,
}) {
  const [now, setNow] = useState(() => new Date());
  const [selectedDoseId, setSelectedDoseId] = useState(null);
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);

  const pendingDoses = useMemo(
    () => doses.filter((dose) => dose.status === 'pending'),
    [doses]
  );

  const dosesWithState = useMemo(
    () => sortDoses(pendingDoses.map((dose) => getDoseState(dose, now))),
    [pendingDoses, now]
  );

  const selectedDose =
    dosesWithState.find((dose) => dose.id === selectedDoseId) ||
    dosesWithState[0] ||
    null;

  const selectedIndex = selectedDose
    ? dosesWithState.findIndex((dose) => dose.id === selectedDose.id)
    : -1;

  const takenDoses = useMemo(
    () => doses.filter((dose) => dose.status === 'taken'),
    [doses]
  );

  const todayCount = doses.length;
  const takenCount = takenDoses.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (dosesWithState.length === 0) {
      setSelectedDoseId(null);
      return;
    }

    if (!dosesWithState.some((dose) => dose.id === selectedDoseId)) {
      setSelectedDoseId(dosesWithState[0].id);
    }
  }, [dosesWithState, selectedDoseId]);

  useEffect(() => {
    if (!selectedDose?.isDue || selectedDose.alarmMuted) {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }

      stopSpeaking();
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

      createAlarmTone(audioContext);
      alarmIntervalRef.current = window.setInterval(() => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }

        if (audioContext.state === 'running') {
          createAlarmTone(audioContext);
        }
      }, 2500);
    }

    speakText(buildSpeechText(selectedDose));

    return () => {
      if (alarmIntervalRef.current) {
        window.clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }

      stopSpeaking();
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

  const handleTake = () => {
    if (!selectedDose) return;

    stopSpeaking();

    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    onToggleDoseStatus(selectedDose.id, 'taken');
    setSelectedDoseId(null);
  };

  const handleMute = () => {
    if (!selectedDose || !onUpdateDose) return;

    stopSpeaking();

    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    onUpdateDose(selectedDose.id, { alarmMuted: true });
  };

  const handleSnooze = () => {
    if (!selectedDose || !onSnoozeDose) return;

    stopSpeaking();

    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }

    onSnoozeDose(selectedDose.id, 10);
  };

  const handleEnableAlarm = () => {
    if (!selectedDose || !onUpdateDose) return;
    onUpdateDose(selectedDose.id, { alarmMuted: false });
  };

  const handleListen = () => {
    if (!selectedDose) return;
    speakText(buildSpeechText(selectedDose));
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
  const cardClass = alarmActive
    ? 'bg-red-600'
    : selectedDose.isDue
      ? 'bg-red-500'
      : 'bg-blue-600';

  return (
    <section className="space-y-4">
      <div className={`overflow-hidden rounded-3xl text-white shadow-lg ${cardClass}`}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wider text-white/75">
                {selectedDose.isDue ? 'Está na hora' : 'Próximo remédio'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Clock3 className="h-5 w-5 shrink-0 text-white/80" />
                <span className="text-2xl font-black">
                  {formatTime(selectedDose.target)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleListen}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`Ouvir lembrete de ${selectedDose.medicationNome}`}
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

          <div className="mt-7 rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-white/70">
              {selectedDose.isDue ? 'Agora' : 'Falta'}
            </p>
            <p className="mt-1 text-3xl font-black tabular-nums sm:text-4xl">
              {selectedDose.isDue ? '00:00:00' : formatCountdown(selectedDose.remainingMs)}
            </p>
            <p className="mt-2 text-sm font-bold text-white/80">
              {getTargetDescription(selectedDose, now)}
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

            {selectedDose.isDue && selectedDose.alarmMuted && (
              <p className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-bold text-white/90">
                Alarme silenciado. O lembrete continua pendente.
              </p>
            )}
          </div>
        </div>
      </div>

      {dosesWithState.length > 1 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="px-4 pb-2 pt-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Próximos remédios
            </p>
          </div>

          <div className="space-y-1">
            {dosesWithState.slice(0, 5).map((dose, index) => {
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
                      {formatTime(dose.target)} · {dose.dosagem}
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
          {takenCount} de {todayCount} tomados hoje
        </span>
        <span className="font-bold text-slate-400">
          {selectedIndex + 1} de {dosesWithState.length}
        </span>
      </div>
    </section>
  );
}