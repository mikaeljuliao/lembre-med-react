import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import { buildQuickReminderTreatment } from '../../utils/businessLogic';

// Medicamentos mais comuns para idosos no Brasil
const COMMON_MEDICATIONS = [
  // Cardiovascular / Pressão
  { nome: 'Losartana 50mg', categoria: 'Pressão' },
  { nome: 'Losartana 25mg', categoria: 'Pressão' },
  { nome: 'Enalapril 10mg', categoria: 'Pressão' },
  { nome: 'Enalapril 5mg', categoria: 'Pressão' },
  { nome: 'Anlodipino 5mg', categoria: 'Pressão' },
  { nome: 'Anlodipino 10mg', categoria: 'Pressão' },
  { nome: 'Atenolol 50mg', categoria: 'Coração' },
  { nome: 'Metoprolol 50mg', categoria: 'Coração' },
  { nome: 'Furosemida 40mg', categoria: 'Diurético' },
  { nome: 'Hidroclorotiazida 25mg', categoria: 'Diurético' },
  { nome: 'Espironolactona 25mg', categoria: 'Diurético' },
  { nome: 'Sinvastatina 40mg', categoria: 'Colesterol' },
  { nome: 'Sinvastatina 20mg', categoria: 'Colesterol' },
  { nome: 'Atorvastatina 20mg', categoria: 'Colesterol' },
  { nome: 'Atorvastatina 40mg', categoria: 'Colesterol' },
  { nome: 'AAS 100mg', categoria: 'Coração' },
  { nome: 'Clopidogrel 75mg', categoria: 'Coração' },
  { nome: 'Digoxina 0,25mg', categoria: 'Coração' },
  { nome: 'Carvedilol 6,25mg', categoria: 'Coração' },
  { nome: 'Carvedilol 25mg', categoria: 'Coração' },
  // Diabetes
  { nome: 'Metformina 500mg', categoria: 'Diabetes' },
  { nome: 'Metformina 850mg', categoria: 'Diabetes' },
  { nome: 'Glibenclamida 5mg', categoria: 'Diabetes' },
  { nome: 'Glipizida 5mg', categoria: 'Diabetes' },
  { nome: 'Insulina NPH', categoria: 'Diabetes' },
  { nome: 'Insulina Regular', categoria: 'Diabetes' },
  // Dor / Anti-inflamatório
  { nome: 'Paracetamol 500mg', categoria: 'Dor' },
  { nome: 'Paracetamol 750mg', categoria: 'Dor' },
  { nome: 'Ibuprofeno 400mg', categoria: 'Dor' },
  { nome: 'Dipirona 500mg', categoria: 'Dor' },
  { nome: 'Codeína 30mg', categoria: 'Dor' },
  { nome: 'Tramadol 50mg', categoria: 'Dor' },
  // Estômago / Digestivo
  { nome: 'Omeprazol 20mg', categoria: 'Estômago' },
  { nome: 'Omeprazol 40mg', categoria: 'Estômago' },
  { nome: 'Pantoprazol 40mg', categoria: 'Estômago' },
  { nome: 'Ranitidina 150mg', categoria: 'Estômago' },
  { nome: 'Domperidona 10mg', categoria: 'Estômago' },
  // Tireoide
  { nome: 'Levotiroxina 25mcg', categoria: 'Tireoide' },
  { nome: 'Levotiroxina 50mcg', categoria: 'Tireoide' },
  { nome: 'Levotiroxina 75mcg', categoria: 'Tireoide' },
  { nome: 'Levotiroxina 100mcg', categoria: 'Tireoide' },
  // Sistema Nervoso / Psiquiátrico
  { nome: 'Alprazolam 0,25mg', categoria: 'Ansiedade' },
  { nome: 'Diazepam 5mg', categoria: 'Ansiedade' },
  { nome: 'Clonazepam 0,5mg', categoria: 'Ansiedade' },
  { nome: 'Amitriptilina 25mg', categoria: 'Depressão' },
  { nome: 'Sertralina 50mg', categoria: 'Depressão' },
  { nome: 'Fluoxetina 20mg', categoria: 'Depressão' },
  // Ossos e vitaminas
  { nome: 'Carbonato de Cálcio 500mg', categoria: 'Ossos' },
  { nome: 'Vitamina D 1000 UI', categoria: 'Vitaminas' },
  { nome: 'Ácido Fólico 5mg', categoria: 'Vitaminas' },
  { nome: 'Ferro 40mg', categoria: 'Vitaminas' },
  // Outros comuns
  { nome: 'Alopurinol 300mg', categoria: 'Outros' },
  { nome: 'Colchicina 0,5mg', categoria: 'Outros' },
  { nome: 'Prednisolona 20mg', categoria: 'Outros' },
  { nome: 'Prednisona 20mg', categoria: 'Outros' },
];

const QUICK_DOSES = [
  { label: '½ comprimido', value: 0.5 },
  { label: '1 comprimido', value: 1 },
  { label: '1½ comprimido', value: 1.5 },
  { label: '2 comprimidos', value: 2 },
];

export default function QuickReminderModal({ isOpen, onClose, onSave, existingMedications = [] }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [horarios, setHorarios] = useState(['agora']);
  const [step, setStep] = useState(1);
  const [selectedQuickTime, setSelectedQuickTime] = useState('agora');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sugestões: medicamentos já cadastrados + lista comum
  const allSuggestions = useMemo(() => {
    const existingNames = (existingMedications || []).map((m) => m.nome).filter(Boolean);
    const commonNames = COMMON_MEDICATIONS.map((m) => ({ nome: m.nome, categoria: m.categoria, isExisting: false }));
    const existingItems = existingNames.map((n) => ({ nome: n, categoria: 'Meus remédios', isExisting: true }));
    // Existing first, then common (deduplicado)
    const merged = [...existingItems];
    for (const c of commonNames) {
      if (!merged.some((e) => e.nome.toLowerCase() === c.nome.toLowerCase())) {
        merged.push(c);
      }
    }
    return merged;
  }, [existingMedications]);

  const filteredSuggestions = useMemo(() => {
    const term = nome.trim().toLowerCase();
    if (!term) return allSuggestions.slice(0, 8);
    return allSuggestions.filter((item) => item.nome.toLowerCase().includes(term)).slice(0, 8);
  }, [nome, allSuggestions]);

  const handleSelectSuggestion = (item) => {
    setNome(item.nome);
    setShowSuggestions(false);
  };

  const handleAddTime = () => {
    setHorarios((prev) => [...prev, '08:00']);
  };

  const handleRemoveTime = (index) => {
    setHorarios((prev) => prev.filter((_, i) => i !== index));
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
    // Reset
    setNome('');
    setQuantidade(1);
    setHorarios(['agora']);
    setSelectedQuickTime('agora');
    setStep(1);
    setShowSuggestions(false);
  };

  const handleClose = () => {
    setNome('');
    setQuantidade(1);
    setHorarios(['agora']);
    setSelectedQuickTime('agora');
    setStep(1);
    setShowSuggestions(false);
    onClose();
  };

  const fieldStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '17px',
    fontWeight: 600,
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    background: '#f8fafc',
    color: '#0f172a',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '15px',
    fontWeight: 800,
    color: '#374151',
    marginBottom: '10px',
  };

  const stepButtonStyle = (active) => ({
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: active
      ? 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)'
      : '#e2e8f0',
    color: active ? '#ffffff' : '#94a3b8',
    fontWeight: 800,
    fontSize: '17px',
    cursor: active ? 'pointer' : 'not-allowed',
    boxShadow: active ? '0 4px 12px rgba(29,78,216,0.3)' : 'none',
    marginTop: '4px',
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Adicionar lembrete de remédio">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Indicador de progresso */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '5px',
                borderRadius: '99px',
                background: s <= step ? '#1d4ed8' : '#e2e8f0',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {/* STEP 1 — Nome */}
        {step === 1 && (
          <div>
            <p style={labelStyle}>Qual remédio você vai tomar?</p>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Digite o nome do remédio..."
                style={fieldStyle}
                autoFocus
              />

              {/* Sugestões */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: '#ffffff',
                    border: '2px solid #cbd5e1',
                    borderRadius: '20px',
                    marginTop: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {filteredSuggestions.map((item, i) => (
                    <button
                      key={`${item.nome}-${i}`}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        textAlign: 'left',
                        background: item.isExisting ? '#eff6ff' : '#ffffff',
                        border: '2px solid transparent',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = item.isExisting ? '#eff6ff' : '#ffffff';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          background: item.isExisting ? '#dbeafe' : '#f1f5f9',
                          borderRadius: '12px',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>💊</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                          {item.nome}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: item.isExisting ? '#1d4ed8' : '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {item.isExisting ? '★ Já uso' : item.categoria}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0 0', fontWeight: 500 }}>
              Ex: Losartana 50mg, Paracetamol 500mg, Omeprazol 20mg
            </p>

            <button
              type="button"
              onClick={() => { setStep(2); setShowSuggestions(false); }}
              disabled={!nome.trim()}
              style={stepButtonStyle(!!nome.trim())}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 2 — Quantidade */}
        {step === 2 && (
          <div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', fontWeight: 700, padding: 0, marginBottom: '4px' }}
            >
              ← Voltar
            </button>

            <p style={labelStyle}>
              Quantas unidades de{' '}
              <span style={{ color: '#1d4ed8' }}>{nome}</span>?
            </p>

            {/* Botões rápidos de dose */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {QUICK_DOSES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setQuantidade(d.value)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: `2px solid ${quantidade === d.value ? '#1d4ed8' : '#e2e8f0'}`,
                    background: quantidade === d.value ? '#eff6ff' : '#f8fafc',
                    color: quantidade === d.value ? '#1d4ed8' : '#374151',
                    fontWeight: 800,
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Contador manual */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantidade((prev) => Math.max(0.5, parseFloat((prev - 0.5).toFixed(1))))}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  border: 'none',
                  fontSize: '28px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                }}
              >
                −
              </button>
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <p style={{ fontSize: '42px', fontWeight: 900, color: '#1d4ed8', margin: 0, lineHeight: 1 }}>
                  {quantidade}
                </p>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0' }}>unidade(s)</p>
              </div>
              <button
                type="button"
                onClick={() => setQuantidade((prev) => parseFloat((prev + 0.5).toFixed(1)))}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#1d4ed8',
                  border: 'none',
                  fontSize: '28px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              style={stepButtonStyle(true)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* STEP 3 — Horário */}
        {step === 3 && (
          <div>
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px', fontWeight: 700, padding: 0, marginBottom: '4px' }}
            >
              ← Voltar
            </button>

            <p style={labelStyle}>
              Quando lembrar de tomar?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: '⚡ Agora', value: 'agora' },
                { label: '⏱ Em 15 min', value: '15' },
                { label: '⏱ Em 30 min', value: '30' },
                { label: '🕐 Escolher horário', value: 'custom' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => applyQuickTime(option.value)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: `2px solid ${selectedQuickTime === option.value ? '#1d4ed8' : '#e2e8f0'}`,
                    background: selectedQuickTime === option.value ? '#eff6ff' : '#f8fafc',
                    color: selectedQuickTime === option.value ? '#1d4ed8' : '#374151',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Horários personalizados */}
            {selectedQuickTime === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {horarios.map((time, index) => (
                  <div key={`${time}-${index}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, fontSize: '13px', marginBottom: '6px' }}>
                        Horário {index + 1}
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        style={{ ...fieldStyle, fontSize: '20px', fontWeight: 800 }}
                      />
                    </div>
                    {horarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(index)}
                        style={{
                          marginTop: '26px',
                          width: '42px',
                          height: '48px',
                          borderRadius: '12px',
                          background: '#fef2f2',
                          border: '2px solid #fecaca',
                          color: '#dc2626',
                          fontWeight: 900,
                          fontSize: '18px',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTime}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    border: '2px dashed #cbd5e1',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  + Adicionar outro horário
                </button>
              </div>
            )}

            {/* Resumo antes de confirmar */}
            <div
              style={{
                background: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '4px',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>
                ✓ Resumo do lembrete
              </p>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {nome} — {quantidade} unidade(s)
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                Horário:{' '}
                {selectedQuickTime === 'agora'
                  ? 'Agora'
                  : selectedQuickTime === '15'
                  ? 'Em 15 minutos'
                  : selectedQuickTime === '30'
                  ? 'Em 30 minutos'
                  : horarios.join(', ')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(5,150,105,0.35)',
                marginTop: '8px',
              }}
            >
              ✓ Criar lembrete
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
