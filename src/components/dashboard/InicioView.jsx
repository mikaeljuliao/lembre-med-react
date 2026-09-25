import React, { useState } from 'react';
import { Zap, List, AlertTriangle } from 'lucide-react';
import ProximaMedicacaoCard from './ProximaMedicacaoCard';
import DoseTomadaModal from './DoseTomadaModal';
import { calculateStockProjection } from '../../utils/businessLogic';

function getLowStockMeds(medications, treatments) {
  const activeTreatments = treatments.filter((t) => t.status === 'active');
  return medications.filter((med) => {
    const inActive = activeTreatments.some((t) =>
      (t.medicamentos || []).some((m) => String(m.medicamentoId) === String(med.id))
    );
    if (!inActive) return false;
    const dailyConsumption = activeTreatments.reduce((acc, t) => {
      (t.medicamentos || []).forEach((m) => {
        if (String(m.medicamentoId) === String(med.id)) {
          acc += (m.quantidadePorDose || 1) * (m.vezesPorDia || 1);
        }
      });
      return acc;
    }, 0);
    const daysLeft = dailyConsumption > 0 ? Math.floor(med.quantidadeEstoque / dailyConsumption) : Infinity;
    return daysLeft <= 7 || med.quantidadeEstoque <= (med.alertaEstoqueMinimo || 5);
  });
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

  const handleDoseTaken = (dose, nextDose) => {
    setConfirmModal({ open: true, dose, nextDose });
  };

  const lowStockMeds = getLowStockMeds(medications, treatments);

  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const pendingCount = doses.filter((d) => d.status === 'pending').length;
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{todayCapitalized}</p>
          <h1 className="text-xl font-extrabold text-slate-900">O que eu tomo agora?</h1>
        </div>
        {doses.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Hoje</p>
            <p className="text-sm font-bold text-slate-800">
              {takenCount}/{doses.length} tomado{takenCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      <ProximaMedicacaoCard
        doses={doses}
        onToggleDoseStatus={onToggleDoseStatus}
        onDoseTaken={handleDoseTaken}
      />

      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">Estoque baixo</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowStockMeds.map((m) => m.nome).join(', ')} precisam de reposição em breve.
            </p>
          </div>
          <button
            onClick={() => onNavigate('cuidador')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap"
          >
            Ver
          </button>
        </div>
      )}

      {doses.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <List className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-800">Remédios de hoje</h2>
            </div>
            <button
              onClick={() => onNavigate('rotina')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Ver agenda completa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {doses.map((dose) => (
              <div key={dose.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      dose.status === 'taken'
                        ? 'bg-emerald-100 text-emerald-700'
                        : dose.status === 'skipped'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {dose.horario}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{dose.medicationNome}</p>
                    <p className="text-xs text-slate-500">{dose.dosagem}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {dose.status === 'taken' && <span className="text-emerald-600 text-sm font-bold">✓</span>}
                  {dose.status === 'skipped' && <span className="text-slate-400 text-xs font-semibold">Pulado</span>}
                  {dose.status === 'pending' && (
                    <button
                      onClick={() => onToggleDoseStatus(dose.id, 'taken')}
                      className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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
