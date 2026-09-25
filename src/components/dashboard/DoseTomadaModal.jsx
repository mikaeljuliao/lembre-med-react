import React from 'react';
import { Check, ChevronRight, X } from 'lucide-react';

export default function DoseTomadaModal({ isOpen, dose, nextDose, onClose }) {
  if (!isOpen || !dose) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-slide-up">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="w-10 h-10 text-emerald-600" strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Dose registrada!</h2>
        <p className="text-slate-600 text-base mb-1">
          <strong className="text-slate-800">{dose.medicationNome}</strong>
        </p>
        <p className="text-slate-500 text-sm mb-6">{dose.dosagem} às {dose.horario}</p>

        {nextDose ? (
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Próximo remédio</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">{nextDose.medicationNome}</p>
                <p className="text-sm text-slate-500">{nextDose.dosagem} às {nextDose.horario}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-4 mb-6">
            <p className="text-emerald-700 font-semibold text-sm">✅ Todos os remédios de hoje foram tomados!</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg py-4 rounded-2xl transition-colors active:scale-95"
          id="btn-entendi"
        >
          Entendi
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
