import React, { useMemo, useState } from 'react';
import { Check, Clock3, Minus, Pill, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../common/Modal';
import { buildMedicationTreatment, isSameMedication } from '../../utils/businessLogic';
import { formatClockTime, getCalendarLabel, resolveNextScheduledAt } from '../../utils/reminderEngine';

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
  { nome: 'Sertralina 50mg', categoria: 'Saúde mental' },
  { nome: 'Vitamina D 1000 UI', categoria: 'Vitaminas' },
];

const PRESENTATIONS = [
  ['Comprimido', 'comprimido'],
  ['Cápsula', 'cápsula'],
  ['Gotas', 'gota'],
  ['Líquido', 'mL'],
  ['Spray', 'jato'],
  ['Inalador', 'inalação'],
  ['Creme ou pomada', 'aplicação'],
  ['Outro', 'unidade'],
];

const UNITS_BY_PRESENTATION = {
  Comprimido: ['comprimido'],
  Cápsula: ['cápsula'],
  Gotas: ['gota'],
  Líquido: ['mL'],
  Spray: ['jato'],
  Inalador: ['inalação'],
  'Creme ou pomada': ['aplicação'],
  Outro: ['unidade'],
};

const MEAL_OPTIONS = [
  ['sem_orientacao', 'Sem orientação'],
  ['jejum', 'Em jejum'],
  ['antes', 'Antes da refeição'],
  ['durante', 'Durante a refeição'],
  ['depois', 'Depois da refeição'],
];

const ROUTES = ['Oral', 'Tópica', 'Nasal', 'Inalatória', 'Ocular', 'Auricular', 'Outra'];

function formatDose(quantity, unit) {
  return String(quantity) + ' ' + unit;
}

export default function QuickReminderModal({
  isOpen,
  onClose,
  onSave,
  existingMedications = [],
  initialMedication = null,
  isEditing = false,
}) {
  const [nome, setNome] = useState('');
  const [apresentacao, setApresentacao] = useState('Comprimido');
  const [quantidade, setQuantidade] = useState(1);
  const [unidadeDose, setUnidadeDose] = useState('comprimido');
  const [tipoUso, setTipoUso] = useState('scheduled');
  const [horarios, setHorarios] = useState(['08:00']);
  const [intervaloHoras, setIntervaloHoras] = useState('');
  const [horarioInicial, setHorarioInicial] = useState('08:00');
  const [dataFim, setDataFim] = useState('');
  const [orientacaoAlimentacao, setOrientacaoAlimentacao] = useState('sem_orientacao');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [concentracao, setConcentracao] = useState('');
  const [viaAdministracao, setViaAdministracao] = useState('Oral');
  const [finalidade, setFinalidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [intervaloMinimoHoras, setIntervaloMinimoHoras] = useState('');
  const [limiteDosesDia, setLimiteDosesDia] = useState('');
  const [condicaoUso, setCondicaoUso] = useState('');
  const [validade, setValidade] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const suggestions = useMemo(() => {
    const existing = (existingMedications || [])
      .map((medication) => ({
        nome: String(medication?.nome || '').trim(),
        categoria: 'Meus remédios',
        isExisting: true,
        medication,
      }))
      .filter((item) => item.nome);
    const existingNames = new Set(existing.map((item) => item.nome.toLowerCase()));
    return [...existing, ...COMMON_MEDICATIONS.filter((item) => !existingNames.has(item.nome.toLowerCase()))];
  }, [existingMedications]);

  const filteredSuggestions = useMemo(() => {
    const term = nome.trim().toLowerCase();
    if (!term) return suggestions.slice(0, 6);
    return suggestions.filter((item) => item.nome.toLowerCase().includes(term)).slice(0, 6);
  }, [nome, suggestions]);

  const reset = () => {
    setNome('');
    setApresentacao('Comprimido');
    setQuantidade(1);
    setUnidadeDose('comprimido');
    setTipoUso('scheduled');
    setHorarios(['08:00']);
    setIntervaloHoras('');
    setHorarioInicial('08:00');
    setDataFim('');
    setOrientacaoAlimentacao('sem_orientacao');
    setPrincipioAtivo('');
    setConcentracao('');
    setViaAdministracao('Oral');
    setFinalidade('');
    setObservacoes('');
    setIntervaloMinimoHoras('');
    setLimiteDosesDia('');
    setCondicaoUso('');
    setValidade('');
    setShowDetails(false);
  };

  React.useEffect(() => {
    if (isOpen && initialMedication) handleSuggestionSelect({ nome: initialMedication.nome, medication: initialMedication });
    if (isOpen && !initialMedication) reset();
  }, [isOpen, initialMedication]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSuggestionSelect = (item) => {
    setNome(item.nome);
    if (!item.medication) return;

    const medication = item.medication;
    setApresentacao(medication.apresentacao || 'Comprimido');
    setQuantidade(medication.quantidadePorDose || 1);
    setUnidadeDose(medication.unidadeDose || 'unidade');
    setTipoUso(medication.tipoUso || 'scheduled');
    setOrientacaoAlimentacao(medication.orientacaoAlimentacao || 'sem_orientacao');
    setPrincipioAtivo(medication.principioAtivo || '');
    setConcentracao(medication.concentracao || '');
    setViaAdministracao(medication.viaAdministracao || 'Oral');
    setFinalidade(medication.finalidade || '');
    setObservacoes(medication.observacoes || '');
    setValidade(medication.validade || '');
    setIntervaloMinimoHoras(medication.intervaloMinimoHoras || '');
    setLimiteDosesDia(medication.limiteDosesDia || '');
    setCondicaoUso(medication.condicaoUso || '');
    setIntervaloHoras(medication.intervaloHoras || '');
    setHorarioInicial(medication.horarioInicial || medication.horarios?.[0] || '08:00');
    setHorarios(Array.isArray(medication.horarios) && medication.horarios.length ? medication.horarios : ['08:00']);
  };

  const handlePresentationChange = (value) => {
    setApresentacao(value);
    setUnidadeDose(UNITS_BY_PRESENTATION[value]?.[0] || 'unidade');
    const defaultRoutes = {
      Comprimido: 'Oral',
      Cápsula: 'Oral',
      Gotas: 'Oral',
      Líquido: 'Oral',
      Spray: 'Nasal',
      Inalador: 'Inalatória',
      'Creme ou pomada': 'Tópica',
      Outro: 'Outra',
    };
    setViaAdministracao(defaultRoutes[value] || 'Oral');
  };

  const updateHorario = (index, value) => {
    setHorarios((current) => current.map((horario, horarioIndex) => horarioIndex === index ? value : horario));
  };

  const addHorario = () => {
    if (horarios.length >= 4) return;
    const last = horarios[horarios.length - 1] || '08:00';
    const date = new Date('2020-01-01T' + last + ':00');
    date.setHours(date.getHours() + 4);
    const next = String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
    setHorarios((current) => [...current, next]);
  };

  const removeHorario = (index) => {
    if (horarios.length <= 1) return;
    setHorarios((current) => current.filter((_, horarioIndex) => horarioIndex !== index));
  };

  const selectedSchedule = horarios[0];
  const previewTarget = tipoUso === 'scheduled' && selectedSchedule
    ? resolveNextScheduledAt(selectedSchedule, new Date())
    : null;

  const isExistingMedication = !isEditing && existingMedications.some((medication) =>
    isSameMedication(medication, {
      nome,
      apresentacao,
      concentracao,
      viaAdministracao,
      principioAtivo,
    })
  );

  const isReady = Boolean(
    nome.trim() &&
      Number(quantidade) > 0 &&
      (tipoUso === 'scheduled' ||
        (tipoUso === 'interval' && Number(intervaloHoras) > 0 && horarioInicial) ||
        (tipoUso === 'as_needed' && Number(intervaloMinimoHoras) > 0 && Number(limiteDosesDia) > 0 && condicaoUso.trim())) &&
      (tipoUso !== 'scheduled' || horarios.every(Boolean))
  );

  const handleSave = () => {
    if (!isReady) return;
    const treatment = buildMedicationTreatment({
      nome,
      apresentacao,
      quantidadePorDose: quantidade,
      unidadeDose,
      tipoUso,
      horarios,
      dataFim: tipoUso === 'scheduled' ? dataFim : '',
      orientacaoAlimentacao,
      principioAtivo,
      concentracao,
      viaAdministracao,
      finalidade,
      observacoes,
      intervaloMinimoHoras,
      limiteDosesDia,
      condicaoUso,
      validade,
      intervaloHoras,
      horarioInicial,
      medicamentoId: initialMedication?.id,
    });
    onSave(treatment);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? "Editar remédio" : "Adicionar remédio"}>
      <div className="max-h-[78vh] space-y-6 overflow-y-auto pr-1">
        <div>
          <label htmlFor="nome-remedio" className="mb-2 block text-base font-black text-slate-900">
            Qual remédio você quer cadastrar?
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input id="nome-remedio" type="text" value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Digite o nome do remédio" autoFocus className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-12 pr-4 text-lg font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100" />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredSuggestions.map((item) => {
              const selected = nome.trim().toLowerCase() === item.nome.toLowerCase();
              return (
                <button key={item.nome} type="button" onClick={() => handleSuggestionSelect(item)} className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left ${selected ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`} aria-pressed={selected}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {selected ? <Check className="h-5 w-5" strokeWidth={3} /> : <Pill className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black">{item.nome}</span>
                    <span className="block truncate text-xs font-semibold text-slate-400">{item.categoria}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-base font-black text-slate-900">Como você usa este remédio?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESENTATIONS.map(([label]) => (
              <button key={label} type="button" onClick={() => handlePresentationChange(label)} className={`min-h-14 rounded-2xl border-2 px-3 text-sm font-black ${apresentacao === label ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} aria-pressed={apresentacao === label}>{label}</button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
            <div>
              <label htmlFor="quantidade-dose" className="mb-2 block text-sm font-black text-slate-700">Quantidade por vez</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQuantidade((value) => Math.max(0.5, Number((Number(value) - 0.5).toFixed(1))))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700"><Minus className="h-5 w-5" /></button>
                <input id="quantidade-dose" type="number" min="0.5" step="0.5" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-center text-xl font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setQuantidade((value) => Number((Number(value) + 0.5).toFixed(1)))} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"><Plus className="h-5 w-5" /></button>
              </div>
            </div>
            <div>
              <label htmlFor="unidade-dose" className="mb-2 block text-sm font-black text-slate-700">Unidade</label>
              <select id="unidade-dose" value={unidadeDose} onChange={(event) => setUnidadeDose(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-base font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
                {(UNITS_BY_PRESENTATION[apresentacao] || ['unidade']).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">Exemplo: 1 comprimido, 20 gotas, 5 mL ou 2 jatos.</p>
        </div>

        <div>
          <p className="mb-3 text-base font-black text-slate-900">Quando você precisa usar?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => setTipoUso('scheduled')} className={tipoUso === 'scheduled' ? 'min-h-16 rounded-2xl border-2 border-blue-600 bg-blue-50 px-4 text-left' : 'min-h-16 rounded-2xl border-2 border-slate-200 bg-white px-4 text-left'} aria-pressed={tipoUso === 'scheduled'}>
              <span className="block text-base font-black text-slate-900">Horários fixos</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">Ex.: 08:00 e 20:00</span>
            </button>
            <button type="button" onClick={() => setTipoUso('interval')} className={tipoUso === 'interval' ? 'min-h-16 rounded-2xl border-2 border-blue-600 bg-blue-50 px-4 text-left' : 'min-h-16 rounded-2xl border-2 border-slate-200 bg-white px-4 text-left'} aria-pressed={tipoUso === 'interval'}>
              <span className="block text-base font-black text-slate-900">A cada intervalo</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">Ex.: a cada 8 horas</span>
            </button>
            <button type="button" onClick={() => setTipoUso('as_needed')} className={tipoUso === 'as_needed' ? 'min-h-16 rounded-2xl border-2 border-blue-600 bg-blue-50 px-4 text-left' : 'min-h-16 rounded-2xl border-2 border-slate-200 bg-white px-4 text-left'} aria-pressed={tipoUso === 'as_needed'}>
              <span className="block text-base font-black text-slate-900">Quando precisar</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">Sem alarme fixo</span>
            </button>
          </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="intervalo-horas" className="mb-2 block text-sm font-black text-slate-700">A cada quantas horas?</label>
                <input id="intervalo-horas" type="number" min="1" max="24" step="1" value={intervaloHoras} onChange={(event) => setIntervaloHoras(event.target.value)} placeholder="Ex.: 8" className="min-h-13 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-center text-xl font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="horario-inicial" className="mb-2 block text-sm font-black text-slate-700">Primeiro horário</label>
                <input id="horario-inicial" type="time" value={horarioInicial} onChange={(event) => setHorarioInicial(event.target.value)} className="min-h-13 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-xl font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500">Exemplo: 06:00 a cada 8 horas → 06:00, 14:00 e 22:00.</p>
          </div>
        )}

        {tipoUso === 'scheduled' && (
          <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-black text-slate-900">Horários dos lembretes</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Escolha os horários conforme a orientação que você recebeu.</p>
              </div>
              {horarios.length < 4 && <button type="button" onClick={addHorario} className="min-h-11 rounded-xl bg-white px-3 text-sm font-black text-blue-700 shadow-sm">Adicionar horário</button>}
            </div>
            <div className="mt-4 space-y-2">
              {horarios.map((horario, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 shrink-0 text-blue-600" />
                  <input type="time" value={horario} onChange={(event) => updateHorario(index, event.target.value)} className="min-h-13 flex-1 rounded-xl border-2 border-blue-100 bg-white px-4 text-xl font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" aria-label={'Horário ' + (index + 1)} />
                  {horarios.length > 1 && <button type="button" onClick={() => removeHorario(index)} className="min-h-12 rounded-xl px-3 text-sm font-black text-red-600">Remover</button>}
                </div>
              ))}
            </div>
            {previewTarget && <div className="mt-4 rounded-xl bg-white px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500">Primeiro lembrete</p>
              <p className="mt-1 text-lg font-black text-blue-800">{getCalendarLabel(previewTarget, new Date())}, às {formatClockTime(previewTarget)}</p>
            </div>}
            <div className="mt-4">
              <label htmlFor="data-fim" className="mb-2 block text-sm font-black text-slate-700">Até quando?</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDataFim('')} className={`min-h-12 rounded-xl border-2 text-sm font-black ${!dataFim ? 'border-blue-600 bg-white text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>Sem data para terminar</button>
                <input id="data-fim" type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} className="min-h-12 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" aria-label="Data de término" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Útil para tratamentos que terminam depois de alguns dias.</p>
            </div>
          </div>
        )}

        {tipoUso === 'as_needed' && (
          <div className="space-y-4 rounded-2xl border-2 border-amber-100 bg-amber-50 p-4">
            <div>
              <p className="text-base font-black text-amber-900">Uso conforme necessidade</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-amber-800">
                Não haverá alarme fixo. Para registrar este tipo de uso com segurança, informe os limites que constam na sua orientação profissional.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="intervalo-minimo" className="mb-2 block text-sm font-black text-slate-700">Intervalo mínimo (horas)</label>
                <input id="intervalo-minimo" type="number" min="1" step="1" value={intervaloMinimoHoras} onChange={(event) => setIntervaloMinimoHoras(event.target.value)} placeholder="Ex.: 6" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-center text-lg font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="limite-doses" className="mb-2 block text-sm font-black text-slate-700">Máximo por dia</label>
                <input id="limite-doses" type="number" min="1" step="1" value={limiteDosesDia} onChange={(event) => setLimiteDosesDia(event.target.value)} placeholder="Ex.: 4" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-center text-lg font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label htmlFor="condicao-uso" className="mb-2 block text-sm font-black text-slate-700">Quando usar?</label>
              <input id="condicao-uso" value={condicaoUso} onChange={(event) => setCondicaoUso(event.target.value)} placeholder="Ex.: se estiver com dor" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </div>
          </div>
        )}

        <div>
          <button type="button" onClick={() => setShowDetails((value) => !value)} className="flex min-h-12 w-full items-center justify-between rounded-2xl border-2 border-slate-200 bg-white px-4 text-left text-base font-black text-slate-800">
            <span>Mais informações (opcional)</span>
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          {showDetails && <div className="mt-3 space-y-4 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="principio-ativo" className="mb-2 block text-sm font-black text-slate-700">Princípio ativo</label>
                <input id="principio-ativo" value={principioAtivo} onChange={(event) => setPrincipioAtivo(event.target.value)} placeholder="Se souber" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
              <div>
                <label htmlFor="concentracao" className="mb-2 block text-sm font-black text-slate-700">Concentração</label>
                <input id="concentracao" value={concentracao} onChange={(event) => setConcentracao(event.target.value)} placeholder="Ex.: 50 mg" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label htmlFor="via-administracao" className="mb-2 block text-sm font-black text-slate-700">Via de administração</label>
              <select id="via-administracao" value={viaAdministracao} onChange={(event) => setViaAdministracao(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
                {ROUTES.map((route) => <option key={route} value={route}>{route}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-2 text-sm font-black text-slate-700">Orientação sobre refeição</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MEAL_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setOrientacaoAlimentacao(value)} className={`min-h-11 rounded-xl border-2 px-3 text-sm font-bold ${orientacaoAlimentacao === value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'}`} aria-pressed={orientacaoAlimentacao === value}>{label}</button>)}
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Use esta opção apenas para registrar uma orientação que você já recebeu.</p>
            </div>
            <div>
              <label htmlFor="finalidade" className="mb-2 block text-sm font-black text-slate-700">Para que você usa este remédio?</label>
              <input id="finalidade" value={finalidade} onChange={(event) => setFinalidade(event.target.value)} placeholder="Ex.: pressão alta" className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="observacoes" className="mb-2 block text-sm font-black text-slate-700">Observações</label>
              <textarea id="observacoes" value={observacoes} onChange={(event) => setObservacoes(event.target.value)} placeholder="Alguma orientação importante para lembrar" rows="3" className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-3 font-semibold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="validade-remedio" className="mb-2 block text-sm font-black text-slate-700">Validade da embalagem</label>
              <input id="validade-remedio" type="date" value={validade} onChange={(event) => setValidade(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 font-black outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
            </div>
          </div>}
        </div>

        {isExistingMedication && <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-bold leading-5 text-amber-800">Este remédio já está cadastrado. O novo horário será adicionado aos lembretes dele.</p>
        </div>}

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm font-bold text-slate-700">Resumo</p>
          <p className="mt-1 text-base font-black text-slate-900">{formatDose(quantidade, unidadeDose)}{tipoUso === 'scheduled' ? ' · ' + horarios.join(' · ') : ' · quando precisar'}</p>
          {orientacaoAlimentacao !== 'sem_orientacao' && <p className="mt-1 text-sm font-semibold text-slate-500">Orientação: {MEAL_OPTIONS.find(([value]) => value === orientacaoAlimentacao)?.[1]}</p>}
          {tipoUso === 'as_needed' && <p className="mt-1 text-sm font-semibold text-slate-500">Máximo: {limiteDosesDia} por dia · intervalo mínimo: {intervaloMinimoHoras}h</p>}
        </div>

        <button type="button" onClick={handleSave} disabled={!isReady} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-xl font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-200">
          <Check className="h-6 w-6" strokeWidth={3} />
          {isEditing ? 'Salvar alterações' : isExistingMedication ? 'Adicionar horário' : 'Cadastrar remédio'}
        </button>
      </div>
    </Modal>
  );
}
