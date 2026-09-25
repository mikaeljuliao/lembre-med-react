import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const PRESENTATION_OPTIONS = [
  'Comprimido',
  'Cápsula',
  'Gotas',
  'Xarope',
  'Pomada',
  'Creme',
  'Spray',
  'Injetável',
  'Outro',
];

export default function MedicationFormModal({ isOpen, onClose, onSave, medicationToEdit = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    principioAtivo: '',
    apresentacao: 'Comprimido',
    concentracao: '',
    unidade: 'comprimidos',
    quantidadeEstoque: 10,
    alertaEstoqueMinimo: 5,
    validade: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicationToEdit) {
      setFormData({
        nome: medicationToEdit.nome || '',
        principioAtivo: medicationToEdit.principioAtivo || '',
        apresentacao: medicationToEdit.apresentacao || 'Comprimido',
        concentracao: medicationToEdit.concentracao || '',
        unidade: medicationToEdit.unidade || 'comprimidos',
        quantidadeEstoque: medicationToEdit.quantidadeEstoque ?? 10,
        alertaEstoqueMinimo: medicationToEdit.alertaEstoqueMinimo ?? 5,
        validade: medicationToEdit.validade || '',
        observacoes: medicationToEdit.observacoes || '',
      });
    } else {
      setFormData({
        nome: '',
        principioAtivo: '',
        apresentacao: 'Comprimido',
        concentracao: '',
        unidade: 'comprimidos',
        quantidadeEstoque: 10,
        alertaEstoqueMinimo: 5,
        validade: '',
        observacoes: '',
      });
    }
    setErrors({});
  }, [medicationToEdit, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome do medicamento é obrigatório';
    if (!formData.concentracao.trim()) newErrors.concentracao = 'Concentração é obrigatória (ex: 500mg, 50mg/mL)';
    if (formData.quantidadeEstoque < 0) newErrors.quantidadeEstoque = 'Quantidade em estoque não pode ser negativa';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: medicationToEdit ? medicationToEdit.id : `med-${Date.now()}`,
      ...formData,
      quantidadeEstoque: Number(formData.quantidadeEstoque),
      alertaEstoqueMinimo: Number(formData.alertaEstoqueMinimo),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicationToEdit ? 'Editar Medicamento' : 'Cadastrar Medicamento'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-xs font-bold text-slate-700 mb-1">
            Nome Comercial / Medicamento *
          </label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Paracetamol, Losartana"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus-ring ${
              errors.nome ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="principioAtivo" className="block text-xs font-bold text-slate-700 mb-1">
              Princípio Ativo
            </label>
            <input
              type="text"
              id="principioAtivo"
              value={formData.principioAtivo}
              onChange={(e) => setFormData({ ...formData, principioAtivo: e.target.value })}
              placeholder="Ex: Paracetamol, Losartana potássica"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>

          <div>
            <label htmlFor="concentracao" className="block text-xs font-bold text-slate-700 mb-1">
              Concentração *
            </label>
            <input
              type="text"
              id="concentracao"
              value={formData.concentracao}
              onChange={(e) => setFormData({ ...formData, concentracao: e.target.value })}
              placeholder="Ex: 500mg, 50mg/mL, 10mg"
              className={`w-full px-3 py-2 border rounded-xl text-sm focus-ring ${
                errors.concentracao ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.concentracao && <p className="text-xs text-red-600 mt-1">{errors.concentracao}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="apresentacao" className="block text-xs font-bold text-slate-700 mb-1">
              Forma / Apresentação
            </label>
            <select
              id="apresentacao"
              value={formData.apresentacao}
              onChange={(e) => setFormData({ ...formData, apresentacao: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring bg-white"
            >
              {PRESENTATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unidade" className="block text-xs font-bold text-slate-700 mb-1">
              Unidade de Medida
            </label>
            <input
              type="text"
              id="unidade"
              value={formData.unidade}
              onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
              placeholder="Ex: comprimidos, gotas, mL, cápsulas"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="quantidadeEstoque" className="block text-xs font-bold text-slate-700 mb-1">
              Quantidade em Estoque
            </label>
            <input
              type="number"
              id="quantidadeEstoque"
              min="0"
              value={formData.quantidadeEstoque}
              onChange={(e) => setFormData({ ...formData, quantidadeEstoque: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>

          <div>
            <label htmlFor="validade" className="block text-xs font-bold text-slate-700 mb-1">
              Data de Validade
            </label>
            <input
              type="date"
              id="validade"
              value={formData.validade}
              onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>
        </div>

        <div>
          <label htmlFor="observacoes" className="block text-xs font-bold text-slate-700 mb-1">
            Observações Gerais
          </label>
          <textarea
            id="observacoes"
            rows="3"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            placeholder="Recomendações pessoais ou observações adicionais..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs focus-ring transition-colors"
          >
            {medicationToEdit ? 'Salvar Alterações' : 'Cadastrar Medicamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
