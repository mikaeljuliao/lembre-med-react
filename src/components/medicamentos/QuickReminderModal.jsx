import React, { useMemo, useState } from 'react';
import { Check, Clock3, Minus, Pill, Plus, Search } from 'lucide-react';
import Modal from '../common/Modal';
import { buildQuickReminderTreatment } from '../../utils/businessLogic';

const COMMON_MEDICATIONS = [
  { nome: 'Losartana 50mg', categoria: 'Pressão' },
  { nome: 'Losartana 25mg', categoria: 'Pressão' },
  { nome: 'Enalapril 10mg', categoria: 'Pressão' },
  { nome: 'Anlodipino 5mg', categoria: 'Pressão' },
  { nome: 'Atenolol 50mg', categoria: 'Coração' },
  { nome: 'Metoprolol 50mg', categoria: 'Coração' },
  { nome: 'Furosemida 40mg', categoria: 'Diurético' },
  { nome: 'Hidroclorotiazida 25mg', categoria: 'Diurético' },
  { nome: 'Sinvastatina 20mg', categoria: 'Colesterol' },
  { nome: 'Metformina 500mg', categoria: 'Diabetes' },
  { nome: 'Paracetamol 500mg', categoria: 'Dor' },
  { nome: 'Ibuprofeno 400mg', categoria: 'Dor' },
  { nome: 'Dipirona 500mg', categoria: 'Dor' },
  { nome: 'Omeprazol 20mg', categoria: 'Estômago' },
  { nome: 'Pantoprazol 40mg', categoria: 'Estômago' },
  { nome: 'Levotiroxina 50mcg', categoria: 'Tireoide' },
  { nome: 'Sertralina 50mg', categoria: 'Depressão' },
  { nome: 'Vitamina D 1000 UI', categoria: 'Vitaminas' },
];

const QUICK_TIMES = [
  { label: 'Agora', value: 'agora' },
  { label: 'Em 15 min', value: '15' },
  { label: 'Em 30 min', value: '30' },
  { label: 'Em 1 hora', value: '60' },
];

const QUICK_DOSES = [
  { label: '½', value: 0.5 },
  { label: '1', value: 1 },
  { label: '1½', value: 1.5 },
  { label: '2', value: 2 },
];

export default function QuickReminderModal({
  isOpen,
  onClose,
  onSave,
  existingMedications = [],
}) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [horario, setHorario] = useState('15');
  const [customTime, setCustomTime] = useState('');

  const suggestions = useMemo(() => {
    const existing = (existingMedications || [])
      .map((medication) => ({
        nome: String(medication?.nome || '').trim(),
        categoria: 'Meus remédios',
        isExisting: true,
      }))
      .filter((item) => item.nome);

    const existingNames = new Set(existing.map((item) => item.nome.toLowerCase()));

    return [
      ...existing,
      ...COMMON_MEDICATIONS.filter(
        (item) => !existingNames.has(item.nome.toLowerCase())
      ),
    ];
  }, [existingMedications]);

  const filteredSuggestions = useMemo(() => {
    const term = nome.trim().toLowerCase();

    if (!term) return suggestions.slice(0, 6);

    return suggestions
      .filter((item) => item.nome.toLowerCase().includes(term))
      .slice(0, 6);
  }, [nome, suggestions]);

  const reset = () => {
    setNome('');
    setQuantidade(1);
    setHorario('15');
    setCustomTime('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    const selectedTime = horario === 'custom' ? customTime : horario;

    if (!nome.trim() || !selectedTime) return;

    onSave(buildQuickReminderTreatment(nome, quantidade, [selectedTime]));
    reset();
  };

  const isReady = Boolean(nome.trim() && (horario !== 'custom' || customTime));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar remédio">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="nome-remedio"
            className="mb-2 block text-base font-black text-slate-900"
          >
            Qual remédio você quer lembrar?
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="nome-remedio"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite o nome"
              autoFocus
              className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-lg font-bold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {filteredSuggestions.map((item) => {
              const selected = nome.trim().toLowerCase() === item.nome.toLowerCase();

              return (
                <button
                  key={item.nome}
                  type="button"
                  onClick={() => setNome(item.nome)}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    selected
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selected ? (
                      <Check className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <Pill className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black">{item.nome}</span>
                    <span className="block truncate text-xs font-semibold text-slate-400">
                      {item.categoria}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-base font-black text-slate-900">
            Quantos você toma?
          </p>

          <div className="grid grid-cols-4 gap-2">
            {QUICK_DOSES.map((dose) => (
              <button
                key={dose.value}
                type="button"
                onClick={() => setQuantidade(dose.value)}
                className={`min-h-14 rounded-2xl border-2 text-lg font-black transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  quantidade === dose.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-pressed={quantidade === dose.value}
              >
                {dose.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-5 rounded-2xl bg-slate-50 p-3">
            <button
              type="button"
              onClick={() =>
                setQuantidade((value) =>
                  Math.max(0.5, Number((value - 0.5).toFixed(1)))
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-5 w-5" />
            </button>

            <span className="min-w-16 text-center text-2xl font-black text-slate-900">
              {quantidade}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantidade((value) => Number((value + 0.5).toFixed(1)))
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-3 text-base font-black text-slate-900">
            Quando você quer ser lembrado?
          </p>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_TIMES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setHorario(option.value)}
                className={`min-h-14 rounded-2xl border-2 px-3 text-base font-black transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  horario === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-pressed={horario === option.value}
              >
                <span className="flex items-center justify-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  {option.label}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setHorario('custom')}
              className={`min-h-14 rounded-2xl border-2 px-3 text-base font-black transition focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                horario === 'custom'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              aria-pressed={horario === 'custom'}
            >
              Escolher horário
            </button>
          </div>

          {horario === 'custom' && (
            <div className="mt-3">
              <label
                htmlFor="horario-remedio"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                Horário
              </label>
              <input
                id="horario-remedio"
                type="time"
                value={customTime}
                onChange={(event) => setCustomTime(event.target.value)}
                className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-2xl font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isReady}
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-xl font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <Check className="h-6 w-6" strokeWidth={3} />
          Criar lembrete
        </button>
      </div>
    </Modal>
  );
}