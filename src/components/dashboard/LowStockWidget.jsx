import React from 'react';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { calculateStockProjection } from '../../utils/businessLogic';

export default function LowStockWidget({ medications = [], activeTreatments = [], onNavigateStock }) {
  const lowStockItems = medications
    .map((med) => ({
      med,
      projection: calculateStockProjection(med, activeTreatments),
    }))
    .filter((item) => item.projection.isLowStock || item.projection.isCritical);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-2xs mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <h4 className="text-sm font-bold">Aviso de Estoque Baixo ({lowStockItems.length})</h4>
        </div>
        <button
          onClick={onNavigateStock}
          className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center space-x-1 focus-ring"
        >
          <span>Gerenciar Estoque</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {lowStockItems.map(({ med, projection }) => (
          <div key={med.id} className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">{med.nome}</span>
              <p className="text-[11px] text-slate-500">
                Restam <strong className="text-amber-700">{med.quantidadeEstoque} {med.unidade || 'unidades'}</strong>
              </p>
            </div>
            {projection.estimatedDays !== null && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                ~{projection.estimatedDays} {projection.estimatedDays === 1 ? 'dia' : 'dias'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
