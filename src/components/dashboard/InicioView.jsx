import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Stethoscope, ShieldCheck, Clock3 } from 'lucide-react';
import ProximaMedicacaoCard from './ProximaMedicacaoCard';
import DoseTomadaModal from './DoseTomadaModal';

function formatCountdownForDose(horario, now = new Date()) {
  const [hours, minutes] = String(horario || '00:00').split(':').map(Number);
  const target = new Date(now);
  target.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);

  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.ceil(diffMs / 1000);
  const hoursLeft = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutesLeft = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secondsLeft = String(totalSeconds % 60).padStart(2, '0');

  return `${hoursLeft}:${minutesLeft}:${secondsLeft}`;
}

export default function InicioView({
  doses = [],
  medications = [],
  treatments = [],
  onToggleDoseStatus,
  onNavigate,
  simpleMode = false,
}) {
  const [confirmModal, setConfirmModal] = useState({ open: false, dose: null, nextDose: null });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const pendingDoses = doses.filter((dose) => dose.status === 'pending');
    const activeDose = pendingDoses.find((dose) => {
      const [hours, minutes] = String(dose.horario || '00:00').split(':').map(Number);
      const target = new Date(now);
      target.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
      if (target.getTime() < now.getTime()) target.setDate(target.getDate() + 1);
      return target.getTime() <= now.getTime() + 1000;
    });

    if (!activeDose) return;

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
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [doses, now]);

  const handleDoseTaken = (dose, nextDose) => {
    setConfirmModal({ open: true, dose, nextDose });
  };

  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const pendingCount = doses.filter((d) => d.status === 'pending').length;
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const nextDose = useMemo(() => {
    const pending = doses.filter((dose) => dose.status === 'pending');
    return pending.sort((a, b) => a.horario.localeCompare(b.horario))[0] || null;
  }, [doses]);

  if (simpleMode) {
    return (
      <div className="simple-mode space-y-6 pb-28 max-w-lg mx-auto">
        <div className="text-center pt-4">
          <p className="text-slate-500 text-xl">{todayCapitalized}</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1">O que eu tomo agora?</h1>
        </div>

        <ProximaMedicacaoCard
          doses={doses}
          onToggleDoseStatus={onToggleDoseStatus}
          onDoseTaken={handleDoseTaken}
          simpleMode
        />

        {doses.length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hoje</h2>
            <div className="space-y-4">
              {doses.map((dose) => (
                <div key={dose.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{dose.medicationNome}</p>
                    <p className="text-lg text-slate-500">{dose.horario} · {dose.dosagem}</p>
                  </div>
                  {dose.status === 'taken' ? (
                    <span className="text-3xl">✅</span>
                  ) : (
                    <span className="text-3xl text-slate-300">⏳</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <DoseTomadaModal
          isOpen={confirmModal.open}
          dose={confirmModal.dose}
          nextDose={confirmModal.nextDose}
          onClose={() => setConfirmModal({ open: false, dose: null, nextDose: null })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-5 text-white shadow-[0_20px_45px_rgba(37,99,235,0.25)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm font-semibold">{todayCapitalized}</p>
            <h1 className="mt-1 text-2xl font-black leading-tight">O que eu preciso fazer agora?</h1>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/20 px-3 py-2 text-right backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-100">Hoje</p>
            <p className="mt-1 text-lg font-black">{takenCount}/{Math.max(doses.length, 0)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('remedios')}
            className="rounded-2xl bg-white/10 border border-white/20 px-3 py-3 text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-100">Meus remédios</p>
            <p className="mt-1 text-xl font-black">{medications.length}</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('saude')}
            className="rounded-2xl bg-white/10 border border-white/20 px-3 py-3 text-left"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-100">Saúde</p>
            <p className="mt-1 text-xl font-black">Informações</p>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate('remedios')}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Plus className="w-5 h-5" />
          </span>
          <p className="mt-4 text-base font-extrabold text-slate-900">Adicionar remédio</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('saude')}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Stethoscope className="w-5 h-5" />
          </span>
          <p className="mt-4 text-base font-extrabold text-slate-900">Saúde</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('ajuda')}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <p className="mt-4 text-base font-extrabold text-slate-900">Ajuda</p>
        </button>
      </div>

      <ProximaMedicacaoCard
        doses={doses}
        onToggleDoseStatus={onToggleDoseStatus}
        onDoseTaken={handleDoseTaken}
      />

      {doses.length > 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hoje</p>
              <h2 className="text-lg font-black text-slate-900">Lembretes do dia</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
              <CalendarDays className="w-4 h-4" />
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {doses.map((dose) => (
              <div key={dose.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
                      dose.status === 'taken'
                        ? 'bg-emerald-100 text-emerald-700'
                        : dose.status === 'skipped'
                          ? 'bg-slate-200 text-slate-600'
                          : dose.status === 'pending' && nextDose?.id === dose.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dose.status === 'taken' ? '✓' : dose.horario.split(':')[0]}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">{dose.medicationNome}</p>
                    <p className="text-xs text-slate-500">{dose.horario} · {dose.dosagem}</p>
                    {dose.status === 'pending' && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                        <Clock3 className="h-3 w-3" />
                        {formatCountdownForDose(dose.horario)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {dose.status === 'taken' && <span className="text-sm font-bold text-emerald-600">Tomado</span>}
                  {dose.status === 'skipped' && <span className="text-xs font-bold text-slate-500">Pulado</span>}
                  {dose.status === 'pending' && (
                    <button
                      onClick={() => onToggleDoseStatus(dose.id, 'taken')}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      id={`btn-tomar-${dose.id}`}
                    >
                      Tomar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">💊</p>
          <h2 className="text-xl font-black text-slate-900">Você ainda não adicionou nenhum medicamento.</h2>
          <p className="mt-2 text-sm text-slate-500">Vamos adicionar o seu primeiro lembrete?</p>
          <button
            type="button"
            onClick={() => onNavigate('remedios')}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Adicionar medicamento
          </button>
        </div>
      )}

      <DoseTomadaModal
        isOpen={confirmModal.open}
        dose={confirmModal.dose}
        nextDose={confirmModal.nextDose}
        onClose={() => setConfirmModal({ open: false, dose: null, nextDose: null })}
      />
    </div>
  );
}
