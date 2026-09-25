import React from 'react';
import { Volume2, Check, Clock, ChevronRight } from 'lucide-react';
import { speakText } from '../../utils/speech';

function getNextPendingDose(doses) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const pending = doses
    .filter((d) => d.status === 'pending')
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const upcoming = pending.find((d) => d.horario >= currentTime);
  return upcoming || pending[0] || null;
}

function getSecondNextDose(doses, firstDose) {
  if (!firstDose) return null;
  const pending = doses
    .filter((d) => d.status === 'pending' && d.id !== firstDose.id)
    .sort((a, b) => a.horario.localeCompare(b.horario));
  return pending[0] || null;
}

function buildSpeechText(dose) {
  return `Você deve tomar ${dose.dosagem} de ${dose.medicationNome} às ${dose.horario.replace(':', ' horas e ')} minutos.`;
}

export default function ProximaMedicacaoCard({ doses = [], onToggleDoseStatus, onDoseTaken, simpleMode = false }) {
  const nextDose = getNextPendingDose(doses);
  const secondDose = getSecondNextDose(doses, nextDose);

  const takenCount = doses.filter((d) => d.status === 'taken').length;
  const pendingCount = doses.filter((d) => d.status === 'pending').length;
  const totalCount = doses.length;

  if (totalCount === 0) {
    return (
      <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm text-center ${simpleMode ? 'p-10' : 'p-8'}`}>
        <div className={`${simpleMode ? 'text-6xl mb-6' : 'text-4xl mb-4'}`}>💊</div>
        <p className={`font-bold text-slate-700 ${simpleMode ? 'text-2xl mb-3' : 'text-lg mb-2'}`}>
          Nenhum medicamento cadastrado
        </p>
        <p className={`text-slate-500 ${simpleMode ? 'text-lg' : 'text-sm'}`}>
          Peça a um familiar para configurar seus remédios.
        </p>
      </div>
    );
  }

  if (!nextDose) {
    return (
      <div className={`bg-emerald-600 rounded-3xl shadow-lg text-white text-center ${simpleMode ? 'p-10' : 'p-8'}`}>
        <div className={`${simpleMode ? 'text-6xl mb-6' : 'text-4xl mb-4'}`}>✅</div>
        <p className={`font-extrabold ${simpleMode ? 'text-3xl mb-3' : 'text-2xl mb-2'}`}>
          Parabéns!
        </p>
        <p className={`${simpleMode ? 'text-xl' : 'text-base'} text-emerald-100`}>
          Todos os remédios de hoje foram tomados.
        </p>
        <p className={`mt-2 font-semibold ${simpleMode ? 'text-lg' : 'text-sm'} text-emerald-200`}>
          {takenCount} de {totalCount} remédio{totalCount !== 1 ? 's' : ''} tomado{takenCount !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  const handleTomar = () => {
    onToggleDoseStatus(nextDose.id, 'taken');
    if (onDoseTaken) onDoseTaken(nextDose, secondDose);
  };

  const handleOuvir = () => {
    speakText(buildSpeechText(nextDose));
  };

  if (simpleMode) {
    return (
      <div className="bg-blue-600 rounded-3xl shadow-xl text-white overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <p className="text-blue-200 text-lg font-semibold mb-1">Seu próximo remédio</p>
          <p className="text-5xl font-black tracking-tight mb-1">{nextDose.horario}</p>
          <p className="text-4xl font-extrabold mt-4 mb-2">{nextDose.medicationNome}</p>
          <p className="text-2xl text-blue-100 mb-6">{nextDose.dosagem}</p>

          <button
            onClick={handleTomar}
            className="w-full bg-white text-blue-700 font-black text-2xl py-6 rounded-2xl shadow-lg active:scale-95 transition-transform"
            id="btn-ja-tomei-simples"
          >
            ✓ JÁ TOMEI
          </button>
        </div>

        {secondDose && (
          <div className="bg-blue-700/50 px-8 py-4 flex items-center justify-between">
            <span className="text-blue-200 text-lg">Próximo:</span>
            <span className="text-white font-bold text-lg">{secondDose.horario} — {secondDose.medicationNome}</span>
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
    <div className="bg-blue-600 rounded-3xl shadow-lg text-white overflow-hidden">
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Próximo remédio</p>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <span className="text-3xl font-black tracking-tight">{nextDose.horario}</span>
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

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold mb-1">{nextDose.medicationNome}</h2>
          <p className="text-blue-100 text-base">{nextDose.dosagem}</p>
        </div>

        <button
          onClick={handleTomar}
          className="w-full bg-white text-blue-700 font-extrabold text-lg py-4 rounded-2xl shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center space-x-2"
          id="btn-ja-tomei"
        >
          <Check className="w-5 h-5" />
          <span>JÁ TOMEI</span>
        </button>
      </div>

      {secondDose && (
        <div className="bg-blue-700/40 px-7 py-3 flex items-center justify-between">
          <span className="text-blue-300 text-sm">Próximo:</span>
          <div className="flex items-center space-x-2 text-sm text-white font-semibold">
            <span>{secondDose.horario} — {secondDose.medicationNome}</span>
            <ChevronRight className="w-4 h-4 text-blue-300" />
          </div>
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
