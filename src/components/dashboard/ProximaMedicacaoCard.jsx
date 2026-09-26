import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { speakText } from '../../utils/speech';

function getTodayTarget(horario, referenceDate = new Date()) {
  const [hours, minutes] = String(horario || '00:00').split(':').map(Number);
  const target = new Date(referenceDate);
  target.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
  return target;
}

function getRemainingMsForTime(horario, referenceDate = new Date()) {
  const target = getTodayTarget(horario, referenceDate);

  return Math.max(0, target.getTime() - referenceDate.getTime());
}

function getUpcomingDoses(doses, referenceDate = new Date()) {
  return doses
    .filter((dose) => dose.status === 'pending')
    .map((dose) => ({
      ...dose,
      remainingMs: getRemainingMsForTime(dose.horario, referenceDate),
    }))
    .sort((a, b) => {
      if (a.remainingMs !== b.remainingMs) return a.remainingMs - b.remainingMs;
      return String(a.medicationNome).localeCompare(String(b.medicationNome));
    });
}

function formatTargetLabel(horario, referenceDate = new Date()) {
  const target = getTodayTarget(horario, referenceDate);
  return target.getTime() < referenceDate.getTime()
    ? `Amanhã, às ${horario}`
    : `Hoje, às ${horario}`;
}

function buildSpeechText(dose) {
  return `Você deve tomar ${dose.dosagem} de ${dose.medicationNome} às ${dose.horario.replace(':', ' horas e ')} minutos.`;
}

function getRemainingMsForTime(horario, referenceDate = new Date()) {
  const [hours, minutes] = String(horario || '00:00').split(':').map(Number);
  const target = new Date(referenceDate);
  target.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);

  if (target.getTime() < referenceDate.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const remaining = target.getTime() - referenceDate.getTime();
  return Math.max(0, remaining);
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function ProximaMedicacaoCard({ doses = [], onToggleDoseStatus, onDoseTaken, simpleMode = false }) {
  const [now, setNow] = useState(new Date());
  const [alarmActive, setAlarmActive] = useState(false);
  const alarmIntervalRef = useRef(null);

  const upcomingDoses = useMemo(() => getUpcomingDoses(doses, now), [doses, now]);
  const [selectedDoseId, setSelectedDoseId] = useState(null);
  const selectedDose = upcomingDoses.find((dose) => dose.id === selectedDoseId) || upcomingDoses[0] || null;
  const selectedIndex = selectedDose
    ? upcomingDoses.findIndex((dose) => dose.id === selectedDose.id)
    : -1;

  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const pendingCount = doses.filter((d) => d.status === 'pending').length;
  const totalCount = doses.length;

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (upcomingDoses.length === 0) {
      setSelectedDoseId(null);
      return;
    }

    if (!selectedDoseId || !upcomingDoses.some((dose) => dose.id === selectedDoseId)) {
      setSelectedDoseId(upcomingDoses[0].id);
    }
  }, [upcomingDoses, selectedDoseId]);

  useEffect(() => {
    if (!selectedDose) {
      setAlarmActive(false);
      return;
    }

    setAlarmActive(selectedDose.remainingMs <= 0);
  }, [selectedDose]);

  useEffect(() => {
    if (!alarmActive || !selectedDose) {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
      return;
    }

    const playAlarmTone = () => {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;

      const audioContext = new AudioCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.04;
      oscillator.connect(gainNode).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.25);
    };

    speakText(buildSpeechText(selectedDose));
    playAlarmTone();
    alarmIntervalRef.current = setInterval(playAlarmTone, 2200);

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    };
  }, [alarmActive, selectedDose]);

  if (totalCount === 0) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm text-center ${simpleMode ? 'p-10' : 'p-8'}`}>
        <div className={`${simpleMode ? 'text-6xl mb-6' : 'text-4xl mb-4'}`}>💊</div>
        <p className={`font-bold text-slate-700 ${simpleMode ? 'text-2xl mb-3' : 'text-lg mb-2'}`}>
          Nenhum lembrete ainda
        </p>
        <p className={`text-slate-500 ${simpleMode ? 'text-lg' : 'text-sm'}`}>
          Adicione um medicamento para começar.
        </p>
      </div>
    );
  }

  if (!selectedDose) {
    return (
      <div className={`bg-emerald-600 rounded-3xl shadow-lg text-white text-center ${simpleMode ? 'p-10' : 'p-8'}`}>
        <div className={`${simpleMode ? 'text-6xl mb-6' : 'text-4xl mb-4'}`}>✅</div>
        <p className={`font-extrabold ${simpleMode ? 'text-3xl mb-3' : 'text-2xl mb-2'}`}>
          Nenhum lembrete pendente
        </p>
        <p className={`${simpleMode ? 'text-xl' : 'text-base'} text-emerald-100`}>
          Você não tem mais medicamentos para tomar agora.
        </p>
        <p className={`mt-2 font-semibold ${simpleMode ? 'text-lg' : 'text-sm'} text-emerald-200`}>
          O próximo lembrete aparecerá aqui.
        </p>
      </div>
    );
  }

  const countdownMs = getRemainingMsForTime(selectedDose.horario, now);
  const countdownText = formatCountdown(countdownMs);

  const handleTomar = () => {
    setAlarmActive(false);
    onToggleDoseStatus(nextDose.id, 'taken');
    if (onDoseTaken) onDoseTaken(nextDose, secondDose);
  };

  const handleOuvir = () => {
    speakText(buildSpeechText(selectedDose));
  };

  if (simpleMode) {
    return (
      <div className={`rounded-3xl shadow-xl text-white overflow-hidden ${alarmActive ? 'bg-red-600' : 'bg-blue-600'}`}>
        <div className="px-8 pt-8 pb-6 text-center">
          <p className="text-blue-200 text-lg font-semibold mb-1">Seu próximo remédio</p>
          <p className="text-4xl font-black tracking-tight mb-1">{countdownText}</p>
          <p className="text-4xl font-extrabold mt-4 mb-2">{selectedDose.medicationNome}</p>
          <p className="text-2xl text-blue-100 mb-6">{selectedDose.dosagem}</p>

          <button
            onClick={handleTomar}
            className="w-full bg-white text-blue-700 font-black text-2xl py-6 rounded-2xl shadow-lg active:scale-95 transition-transform"
            id="btn-ja-tomei-simples"
          >
            ✓ JÁ TOMEI
          </button>

          {alarmActive && (
            <button
              type="button"
              onClick={() => setAlarmActive(false)}
              className="mt-3 w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-bold text-white"
            >
              Silenciar alarme
            </button>
          )}
        </div>

        {upcomingDoses.length > 1 && (
          <div className="bg-blue-700/50 px-5 py-3 flex items-center justify-between gap-3">
            <button type="button" onClick={selectPrevious} aria-label="Ver medicamento anterior" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-200">Lembretes próximos</p>
              <p className="mt-1 truncate text-sm font-extrabold text-white">
                {selectedIndex + 1} de {upcomingDoses.length} · {selectedDose.horario} · {selectedDose.medicationNome}
              </p>
            </div>
            <button type="button" onClick={selectNext} aria-label="Ver próximo medicamento" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="bg-blue-500/30 px-8 py-3 flex items-center justify-between">
          <button
            onClick={handleOuvir}
            className="flex items-center space-x-2 text-blue-100 text-lg font-semibold"
            id="btn-ouvir-simples"
          >
            <Volume2 className="w-6 h-6" />
            <span>Ouvir</span>
          </button>
          <span className="text-blue-200 text-base">
            {takenCount}/{totalCount} tomados hoje
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl shadow-lg text-white overflow-hidden ${alarmActive ? 'bg-red-600' : 'bg-blue-600'}`}>
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Próximo remédio</p>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <div>
                <span className="block text-3xl font-black tracking-tight">{selectedDose.horario}</span>
                <span className="block text-xs font-bold text-blue-200">{targetLabel}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleOuvir}
            className="flex items-center space-x-1.5 bg-blue-500/40 hover:bg-blue-500/60 px-3 py-2 rounded-xl text-blue-100 text-sm font-semibold transition-colors"
            id="btn-ouvir"
          >
            <Volume2 className="w-4 h-4" />
            <span>Ouvir</span>
          </button>
        </div>

        <div className={`mb-5 rounded-2xl border px-4 py-3 ${alarmActive ? 'border-red-200 bg-red-500/20' : 'border-blue-200 bg-blue-500/20'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">{alarmActive ? 'Hora do remédio' : 'Restam'}</p>
          <p className="text-3xl font-black tracking-tight mt-1">{countdownText}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold mb-1">{selectedDose.medicationNome}</h2>
          <p className="text-blue-100 text-base">{selectedDose.dosagem}</p>
        </div>

        <button
          onClick={handleTomar}
          className="w-full bg-white text-blue-700 font-extrabold text-lg py-4 rounded-2xl shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center space-x-2"
          id="btn-ja-tomei"
        >
          <Check className="w-5 h-5" />
          <span>JÁ TOMEI</span>
        </button>

        {alarmActive && (
          <button
            type="button"
            onClick={() => setAlarmActive(false)}
            className="mt-3 w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-3 text-sm font-bold text-white"
          >
            Silenciar alarme
          </button>
        )}
      </div>

      {upcomingDoses.length > 1 && (
        <div className="bg-blue-700/40 px-5 py-3 flex items-center justify-between gap-3">
          <button type="button" onClick={selectPrevious} aria-label="Ver medicamento anterior" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">Lembretes próximos</p>
            <p className="mt-1 truncate text-sm font-extrabold text-white">
              {selectedIndex + 1} de {upcomingDoses.length} · {selectedDose.horario} · {selectedDose.medicationNome}
            </p>
          </div>
          <button type="button" onClick={selectNext} aria-label="Ver próximo medicamento" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="bg-blue-700/30 px-7 py-3 flex items-center justify-between text-sm">
        <span className="text-blue-200">Hoje</span>
        <div className="flex items-center space-x-3">
          <span className="text-emerald-300 font-semibold">✓ {takenCount} tomados</span>
          {pendingCount > 0 && (
            <span className="text-blue-200">· {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}
