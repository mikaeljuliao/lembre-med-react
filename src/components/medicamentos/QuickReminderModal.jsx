import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { buildQuickReminderTreatment } from '../../utils/businessLogic';

export default function QuickReminderModal({ isOpen, onClose, onSave, existingMedications = [] }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [horarios, setHorarios] = useState(['agora']);
  const [step, setStep] = useState(1);
  const [selectedQuickTime, setSelectedQuickTime] = useState('agora');

  const suggestions = useMemo(() => {
    const normalized = (existingMedications || []).map((med) => med.nome).filter(Boolean);
    return normalized.filter((item, index) => normalized.indexOf(item) === index);
  }, [existingMedications]);

  const filteredSuggestions = useMemo(() => {
    const term = nome.trim().toLowerCase();
    if (!term) return suggestions.slice(0, 6);
    return suggestions.filter((item) => item.toLowerCase().includes(term)).slice(0, 6);
  }, [nome, suggestions]);

  const handleAddTime = () => {
    setHorarios((prev) => [...prev, '20:00']);
  };

  const handleTimeChange = (index, value) => {
    setHorarios((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const applyQuickTime = (value) => {
    const next = value === 'custom' ? ['08:00'] : [value];
    setHorarios(next);
    setSelectedQuickTime(value);
  };

  const handleSubmit = () => {
    if (!nome.trim()) return;
    const reminder = buildQuickReminderTreatment(nome, quantidade, horarios);
    onSave(reminder);
    setNome('');
    setQuantidade(1);
    setHorarios(['agora']);
    setSelectedQuickTime('agora');
    setStep(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo lembrete">
      <div className="space-y-5">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700">Qual remédio você vai tomar?</p>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do medicamento"
              className="w-full px-3 py-3 border border-slate-300 rounded-2xl text-base focus-ring"
              autoFocus
            />
            {filteredSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Usados antes</p>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setNome(item)}
                      className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!nome.trim()}
              className="w-full rounded-2xl bg-blue-600 text-white font-bold py-3 disabled:bg-slate-300"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">Quantas unidades você toma?</p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                className="w-12 h-12 rounded-full bg-slate-100 text-2xl font-bold"
              >
                −
              </button>
              <div className="min-w-20 text-center text-4xl font-black text-slate-900">{quantidade}</div>
              <button
                type="button"
                onClick={() => setQuantidade((prev) => prev + 1)}
                className="w-12 h-12 rounded-full bg-slate-100 text-2xl font-bold"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full rounded-2xl bg-blue-600 text-white font-bold py-3"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">Quando esse remédio deve lembrar?</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Agora', value: 'agora' },
                { label: '15 min', value: '15' },
                { label: '30 min', value: '30' },
                { label: 'Horário', value: 'custom' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyQuickTime(option.value)}
                  className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                    selectedQuickTime === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {selectedQuickTime === 'custom' && (
              <div className="space-y-3">
                {horarios.map((time, index) => (
                  <div key={`${time}-${index}`}>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Horário {index + 1}
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="w-full px-3 py-3 border border-slate-300 rounded-2xl text-base focus-ring"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddTime}
              className="w-full rounded-2xl border border-slate-300 bg-white text-slate-700 font-semibold py-3"
            >
              + Adicionar outro horário
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-emerald-600 text-white font-bold py-3"
            >
              Criar lembrete
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
