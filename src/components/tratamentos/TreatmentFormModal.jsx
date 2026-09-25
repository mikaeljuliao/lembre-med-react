import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Plus, Trash2, Clock } from 'lucide-react';

export default function TreatmentFormModal({
  isOpen,
  onClose,
  onSave,
  treatmentToEdit = null,
  availableMedications = [],
}) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    status: 'active',
    medicamentos: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (treatmentToEdit) {
      setFormData({
        nome: treatmentToEdit.nome || '',
        descricao: treatmentToEdit.descricao || '',
        dataInicio: treatmentToEdit.dataInicio || new Date().toISOString().split('T')[0],
        dataFim: treatmentToEdit.dataFim || '',
        status: treatmentToEdit.status || 'active',
        medicamentos: treatmentToEdit.medicamentos || [],
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        dataInicio: new Date().toISOString().split('T')[0],
        dataFim: '',
        status: 'active',
        medicamentos: availableMedications.length > 0
          ? [
              {
                medicamentoId: availableMedications[0].id,
                nome: availableMedications[0].nome,
                dosagem: '1 comprimido',
                quantidadePorDose: 1,
                vezesPorDia: 1,
                horarios: ['08:00'],
              },
            ]
          : [],
      });
    }
    setErrors({});
  }, [treatmentToEdit, isOpen, availableMedications]);

  const handleAddMedicationRow = () => {
    if (availableMedications.length === 0) return;
    const defaultMed = availableMedications[0];
    setFormData((prev) => ({
      ...prev,
      medicamentos: [
        ...prev.medicamentos,
        {
          medicamentoId: defaultMed.id,
          nome: defaultMed.nome,
          dosagem: '1 comprimido',
          quantidadePorDose: 1,
          vezesPorDia: 1,
          horarios: ['08:00'],
        },
      ],
    }));
  };

  const handleRemoveMedicationRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.medicamentos];
      if (field === 'medicamentoId') {
        const found = availableMedications.find((m) => String(m.id) === String(value));
        updated[index] = {
          ...updated[index],
          medicamentoId: value,
          nome: found ? found.nome : updated[index].nome,
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, medicamentos: updated };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome do tratamento é obrigatório';
    if (formData.medicamentos.length === 0)
      newErrors.medicamentos = 'Adicione ao menos um medicamento ao tratamento';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: treatmentToEdit ? treatmentToEdit.id : `treat-${Date.now()}`,
      ...formData,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={treatmentToEdit ? 'Editar Tratamento' : 'Novo Tratamento'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-xs font-bold text-slate-700 mb-1">
            Nome do Tratamento / Rotina *
          </label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Controle de Pressão, Antibiótico Infecção"
            className={`w-full px-3 py-2 border rounded-xl text-sm focus-ring ${
              errors.nome ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label htmlFor="descricao" className="block text-xs font-bold text-slate-700 mb-1">
            Descrição / Recomendações
          </label>
          <textarea
            id="descricao"
            rows="2"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: Prescrição médica do Dr. Carlos por 7 dias"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="dataInicio" className="block text-xs font-bold text-slate-700 mb-1">
              Data de Início
            </label>
            <input
              type="date"
              id="dataInicio"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>

          <div>
            <label htmlFor="dataFim" className="block text-xs font-bold text-slate-700 mb-1">
              Data Prevista Término
            </label>
            <input
              type="date"
              id="dataFim"
              value={formData.dataFim}
              onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-bold text-slate-700 mb-1">
              Status do Tratamento
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus-ring bg-white"
            >
              <option value="active">Ativo (em andamento)</option>
              <option value="paused">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Associated Medications List */}
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900">
              Medicamentos e Posologia Cadastrados
            </h4>
            <button
              type="button"
              onClick={handleAddMedicationRow}
              className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Medicamento</span>
            </button>
          </div>

          {errors.medicamentos && (
            <p className="text-xs text-red-600 mb-2">{errors.medicamentos}</p>
          )}

          <div className="space-y-3">
            {formData.medicamentos.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medicamento
                    </label>
                    <select
                      value={item.medicamentoId}
                      onChange={(e) => handleMedicationChange(index, 'medicamentoId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus-ring"
                    >
                      {availableMedications.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome} ({m.concentracao})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-32">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dosagem Ex: 1 comp
                    </label>
                    <input
                      type="text"
                      value={item.dosagem}
                      onChange={(e) => handleMedicationChange(index, 'dosagem', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus-ring"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMedicationRow(index)}
                    className="p-1 text-slate-400 hover:text-red-600 self-end mb-1"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Horário principal (HH:MM)</span>
                    </label>
                    <input
                      type="time"
                      value={(item.horarios || ['08:00'])[0]}
                      onChange={(e) =>
                        handleMedicationChange(index, 'horarios', [e.target.value])
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus-ring"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Consumo p/ Dose
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidadePorDose || 1}
                      onChange={(e) =>
                        handleMedicationChange(index, 'quantidadePorDose', Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus-ring"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {treatmentToEdit ? 'Salvar Tratamento' : 'Criar Tratamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
