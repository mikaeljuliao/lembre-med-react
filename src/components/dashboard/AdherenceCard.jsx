import React from 'react';
import { Target, TrendingUp, Info } from 'lucide-react';
import { calculateAdherence } from '../../utils/businessLogic';

export default function AdherenceCard({ doses = [] }) {
  const { totalDoses, takenDoses, adherencePercentage } = calculateAdherence(doses);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">Taxa de Adesão</h3>
        </div>
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
          <span>Derivada de dados reais</span>
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-teal-500 transition-all duration-500"
              strokeDasharray={`${adherencePercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-slate-900">{adherencePercentage}%</span>
        </div>

        <div>
          <p className="text-xs text-slate-600 font-medium">
            <strong className="text-slate-900">{takenDoses}</strong> de <strong className="text-slate-900">{totalDoses}</strong> doses agendadas registradas.
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Métrica calculada dinamicamente sem simulações.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
