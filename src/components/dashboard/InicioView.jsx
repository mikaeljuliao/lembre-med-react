import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Stethoscope, ShieldCheck, Clock3, Phone, Activity } from 'lucide-react';
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

  const activeDoses = doses.filter((d) => d.status === 'pending');
  const pendingCount = activeDoses.length;
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const nextDose = useMemo(() => {
    return activeDoses.sort((a, b) => a.horario.localeCompare(b.horario))[0] || null;
  }, [activeDoses]);

  const UtilityWidgets = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
      <button
        onClick={() => onNavigate('saude')}
        style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '16px', color: '#16a34a' }}>
          <Activity style={{ width: '28px', height: '28px' }} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textAlign: 'center', lineHeight: 1.2 }}>
          Anotar<br/>Pressão
        </span>
      </button>

      <a
        href="tel:192"
        style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '16px', color: '#dc2626' }}>
          <Phone style={{ width: '28px', height: '28px' }} />
        </div>
        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textAlign: 'center', lineHeight: 1.2 }}>
          Chamar<br/>SAMU (192)
        </span>
      </a>
    </div>
  );

  if (simpleMode) {
    return (
      <div className="simple-mode space-y-6 pb-28 max-w-lg mx-auto">
        <div className="text-center pt-4">
          <p className="text-slate-500 text-xl">{todayCapitalized}</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1">O que eu tomo agora?</h1>
        </div>

        <ProximaMedicacaoCard
          doses={activeDoses}
          onToggleDoseStatus={onToggleDoseStatus}
          onDoseTaken={handleDoseTaken}
          simpleMode
        />

        {activeDoses.length > 0 ? (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hoje</h2>
            <div className="space-y-4">
              {activeDoses.map((dose) => (
                <div key={dose.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{dose.medicationNome}</p>
                    <p className="text-lg text-slate-500">{dose.horario} · {dose.dosagem}</p>
                  </div>
                  <span className="text-3xl text-slate-300">⏳</span>
                </div>
              ))}
            </div>
          </div>
        ) : medications.length > 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center shadow-sm">
            <p className="text-4xl mb-3">✅</p>
            <h2 className="text-xl font-black text-slate-900">Tudo certo por hoje!</h2>
            <p className="mt-2 text-sm text-slate-500">Você já tomou todos os seus remédios.</p>
          </div>
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center shadow-sm">
            <p className="text-4xl mb-3">💊</p>
            <h2 className="text-xl font-black text-slate-900">Nenhum remédio cadastrado.</h2>
            <p className="mt-2 text-sm text-slate-500">Vá na aba "Remédios" para adicionar.</p>
          </div>
        )}

        <UtilityWidgets />

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
      {/* Simple Greeting */}
      <div className="pt-2 pb-4">
        <p className="text-slate-500 text-sm font-semibold">{todayCapitalized}</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 leading-tight">O que você precisa fazer agora?</h1>
      </div>



      <ProximaMedicacaoCard
        doses={activeDoses}
        onToggleDoseStatus={onToggleDoseStatus}
        onDoseTaken={handleDoseTaken}
      />

      {activeDoses.length > 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hoje</p>
              <h2 className="text-lg font-black text-slate-900">Lembretes pendentes</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
              <CalendarDays className="w-4 h-4" />
              {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {activeDoses.map((dose) => (
              <div key={dose.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
                      nextDose?.id === dose.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {dose.horario.split(':')[0]}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-900">{dose.medicationNome}</p>
                    <p className="text-xs text-slate-500">{dose.horario} · {dose.dosagem}</p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                      <Clock3 className="h-3 w-3" />
                      {formatCountdownForDose(dose.horario)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleDoseStatus(dose.id, 'taken')}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    id={`btn-tomar-${dose.id}`}
                  >
                    Tomar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : medications.length > 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-xl font-black text-slate-900">Tudo certo por hoje!</h2>
          <p className="mt-2 text-sm text-slate-500">Você já tomou todos os seus remédios ou não tem lembretes ativos.</p>
        </div>
      ) : (
        <div className="rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">💊</p>
          <h2 className="text-xl font-black text-slate-900">Nenhum remédio cadastrado.</h2>
          <p className="mt-2 text-sm text-slate-500">Vá na aba "Remédios" para adicionar.</p>
          <button
            type="button"
            onClick={() => onNavigate('remedios')}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Ir para Remédios
          </button>
        </div>
      )}

      <UtilityWidgets />

      <DoseTomadaModal
        isOpen={confirmModal.open}
        dose={confirmModal.dose}
        nextDose={confirmModal.nextDose}
        onClose={() => setConfirmModal({ open: false, dose: null, nextDose: null })}
      />
    </div>
  );
}
