import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw, Info } from 'lucide-react';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { calculateStockProjection } from '../../utils/businessLogic';

export default function StockView({
  medications = [],
  treatments = [],
  onUpdateStock,
}) {
  const [selectedMed, setSelectedMed] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTreatments = treatments.filter((t) => t.status === 'active');

  const stockList = medications.map((med) => {
    const projection = calculateStockProjection(med, activeTreatments);
    return { med, projection };
  });

  const handleOpenRestock = (med) => {
    setSelectedMed(med);
    setRestockAmount(10);
    setIsModalOpen(true);
  };

  const handleConfirmRestock = (e) => {
    e.preventDefault();
    if (!selectedMed) return;

    const newTotal = Number(selectedMed.quantidadeEstoque) + Number(restockAmount);
    onUpdateStock(selectedMed.id, newTotal);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Package className="w-6 h-6 text-amber-600" />
          <span>Gestão e Projeção de Estoque</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Projeção matemática calculada a partir do consumo cadastrado em seus tratamentos ativos.
        </p>
      </div>

      {/* Math Projection Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Nota sobre Projeções:</span> Os dias estimados de estoque representam um cálculo derivado da taxa diária de consumo configurada nas suas rotinas ativas.
        </div>
      </div>

      {/* Inventory Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stockList.map(({ med, projection }) => (
          <div
            key={med.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all flex flex-col justify-between space-y-4 ${
              projection.isLowStock
                ? 'border-amber-300 bg-amber-50/10'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{med.nome}</h3>
                  <p className="text-xs text-slate-500">{med.concentracao} • {med.apresentacao}</p>
                </div>
                {projection.isCritical ? (
                  <Badge variant="danger">Crítico / Zerado</Badge>
                ) : projection.isLowStock ? (
                  <Badge variant="warning">Estoque Baixo</Badge>
                ) : (
                  <Badge variant="success">Estoque OK</Badge>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 my-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Quantidade Atual</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {med.quantidadeEstoque} {med.unidade || 'unidades'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Consumo Diário</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {projection.dailyConsumption > 0
                      ? `${projection.dailyConsumption} un/dia`
                      : 'Sem consumo ativo'}
                  </span>
                </div>
              </div>

              {/* Projection Output Text */}
              <div className="text-xs text-slate-600 space-y-1">
                {projection.estimatedDays !== null ? (
                  <p className="font-bold text-slate-800 flex items-center space-x-1">
                    <span>Estoque previsto para aproximadamente</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {projection.estimatedDays} {projection.estimatedDays === 1 ? 'dia' : 'dias'}
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-400 italic">Sem tratamentos ativos vinculados a este medicamento.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Alerta mínimo: {med.alertaEstoqueMinimo || 5} unidades
              </span>
              <button
                type="button"
                onClick={() => handleOpenRestock(med)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs focus-ring transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Estoque</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Restock Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adicionar Estoque - ${selectedMed?.nome}`}
      >
        <form onSubmit={handleConfirmRestock} className="space-y-4">
          <p className="text-xs text-slate-600">
            Informe a quantidade comprada para atualizar o saldo disponível do medicamento.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantidade a Adicionar ({selectedMed?.unidade || 'unidades'})
            </label>
            <input
              type="number"
              min="1"
              value={restockAmount}
              onChange={(e) => setRestockAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span>Novo total estimado: </span>
            <strong className="text-blue-600 font-extrabold text-sm">
              {(Number(selectedMed?.quantidadeEstoque) || 0) + Number(restockAmount)}{' '}
              {selectedMed?.unidade || 'unidades'}
            </strong>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs focus-ring"
            >
              Confirmar Entrada
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
