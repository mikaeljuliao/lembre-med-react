import React, { useMemo, useState } from 'react';
import { Pill, HeartPulse, Plus, CheckCircle2, Clock3 } from 'lucide-react';
import ProximaMedicacaoCard from './ProximaMedicacaoCard';
import DoseTomadaModal from './DoseTomadaModal';

function formatToday() {
  const value = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function InicioView({
  doses = [],
  medications = [],
  treatments = [],
  onToggleDoseStatus,
  onNavigate,
}) {
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    dose: null,
    nextDose: null,
  });

  const sortedDoses = useMemo(
    () => [...doses].sort((a, b) => String(a.horario).localeCompare(String(b.horario))),
    [doses]
  );

  const pendingDoses = sortedDoses.filter((dose) => dose.status === 'pending');
  const takenDoses = sortedDoses.filter((dose) => dose.status === 'taken');

  const handleDoseTaken = (dose, nextDose) => {
    setConfirmModal({ open: true, dose, nextDose });
  };

  const handleCloseConfirm = () => {
    setConfirmModal({ open: false, dose: null, nextDose: null });
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      <header className="pt-2">
        <p className="text-sm font-semibold text-slate-500">{formatToday()}</p>
        <h1 className="mt-1 text-2xl font-black leading-tight text-slate-900">
          O que você precisa fazer agora?
        </h1>
      </header>

      <ProximaMedicacaoCard
        doses={sortedDoses}
        onToggleDoseStatus={onToggleDoseStatus}
        onDoseTaken={handleDoseTaken}
      />

      {medications.length === 0 ? (
        <section className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-center">
          <Pill className="mx-auto mb-3 h-10 w-10 text-blue-600" />
          <h2 className="text-xl font-black text-slate-900">Vamos começar?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Adicione seu primeiro medicamento e o DoseFácil cuidará dos lembretes.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('remedios')}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-base font-extrabold text-white shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Adicionar medicamento
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-black text-slate-900">Hoje</h2>
              <p className="mt-1 text-sm text-slate-500">
                {takenDoses.length > 0
                  ? `${takenDoses.length} dose${takenDoses.length !== 1 ? 's' : ''} registrada${takenDoses.length !== 1 ? 's' : ''}`
                  : pendingDoses.length > 0
                    ? 'Veja abaixo o que está programado.'
                    : 'Nenhum lembrete para hoje.'}
              </p>
            </div>

            {sortedDoses.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {sortedDoses.map((dose) => {
                  const taken = dose.status === 'taken';

                  return (
                    <div key={dose.id} className="flex items-center gap-3 px-5 py-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${taken ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {taken ? <CheckCircle2 className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-extrabold text-slate-900">{dose.medicationNome}</p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {dose.horario} · {dose.dosagem}
                        </p>
                      </div>

                      <span className={`shrink-0 text-xs font-extrabold ${taken ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {taken ? 'Tomado' : 'Pendente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-6 text-sm text-slate-500">
                Seus medicamentos estão cadastrados, mas nenhum lembrete está programado para hoje.
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('remedios')}
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <Pill className="h-7 w-7 text-blue-600" />
              <span className="text-sm font-extrabold text-slate-900">Meus remédios</span>
              <span className="text-xs text-slate-500">
                {medications.length} cadastrado{medications.length !== 1 ? 's' : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('saude')}
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <HeartPulse className="h-7 w-7 text-teal-600" />
              <span className="text-sm font-extrabold text-slate-900">Saúde</span>
              <span className="text-xs text-slate-500">Informações de saúde</span>
            </button>
          </div>
        </>
      )}

      <DoseTomadaModal
        isOpen={confirmModal.open}
        dose={confirmModal.dose}
        nextDose={confirmModal.nextDose}
        onClose={handleCloseConfirm}
      />
    </div>
  );
}
