import { useState, useEffect } from 'react';
import {
  Heart,
  Thermometer,
  Droplets,
  Scale,
  Plus,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEY = 'dosefacil_health_diary';

const METRICS = [
  {
    id: 'pressao',
    label: 'Pressão Arterial',
    icon: Heart,
    color: '#e11d48',
    bg: '#fff1f2',
    unit: 'mmHg',
    placeholder: 'Ex: 120/80',
    hint: 'Sistólica / Diastólica',
  },
  {
    id: 'temperatura',
    label: 'Temperatura',
    icon: Thermometer,
    color: '#dc2626',
    bg: '#fef2f2',
    unit: '°C',
    placeholder: 'Ex: 36,5',
    hint: 'Temperatura corporal',
  },
  {
    id: 'glicemia',
    label: 'Glicemia',
    icon: Droplets,
    color: '#0891b2',
    bg: '#ecfeff',
    unit: 'mg/dL',
    placeholder: 'Ex: 110',
    hint: 'Açúcar no sangue',
  },
  {
    id: 'peso',
    label: 'Peso',
    icon: Scale,
    color: '#7c3aed',
    bg: '#f5f3ff',
    unit: 'kg',
    placeholder: 'Ex: 72,5',
    hint: 'Peso em quilos',
  },
];

function getStored() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStored(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HealthDiaryView() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ metricId: 'pressao', value: '', context: '', note: '' });
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);

  useEffect(() => {
    setEntries(getStored());
  }, []);

  const resetForm = () => {
    setForm({ metricId: 'pressao', value: '', context: '', note: '' });
    setEditingEntryId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.value.trim()) return;

    const metric = METRICS.find((m) => m.id === form.metricId);
    const entryData = {
      metricId: form.metricId,
      metricLabel: metric.label,
      unit: metric.unit,
      value: form.value.trim(),
      context: form.context.trim(),
      note: form.note.trim(),
    };

    const updated = editingEntryId
      ? entries.map((entry) =>
          entry.id === editingEntryId ? { ...entry, ...entryData } : entry
        )
      : [
          {
            id: `hd-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...entryData,
          },
          ...entries,
        ];

    setEntries(updated);
    saveStored(updated);
    resetForm();
  };

  const handleEdit = (entry) => {
    setForm({
      metricId: entry.metricId,
      value: entry.value || '',
      context: entry.context || '',
      note: entry.note || '',
    });
    setEditingEntryId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveStored(updated);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter((e) => e.timestamp.startsWith(todayStr));
  const historyEntries = entries.filter((e) => !e.timestamp.startsWith(todayStr));

  const selectedMetric = METRICS.find((m) => m.id === form.metricId);

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        paddingBottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      className="health-diary animate-fade-in"
    >

      <div
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 10px 30px rgba(124,58,237,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <TrendingUp style={{ width: '26px', height: '26px', color: '#c4b5fd' }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#c4b5fd',
            }}
          >
            Diário de Saúde
          </span>
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 900,
            margin: '0 0 6px',
            color: '#ffffff',
            lineHeight: 1.2,
          }}
        >
          Suas medidas de hoje
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
          Registre pressão, temperatura, glicemia e peso.
        </p>
      </div>

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: '18px',
            padding: '18px',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '17px',
            boxShadow: '0 6px 16px rgba(124,58,237,0.35)',
          }}
        >
          <Plus style={{ width: '24px', height: '24px' }} />
          Registrar nova medida
        </button>
      )}

      {showForm && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            border: '2px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>
            {editingEntryId ? 'Editar medida' : 'Nova medida'}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {METRICS.map((m) => {
              const Icon = m.icon;
              const isActive = form.metricId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, metricId: m.id }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${isActive ? m.color : '#e2e8f0'}`,
                    background: isActive ? m.bg : '#f8fafc',
                    color: isActive ? m.color : '#64748b',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Valor ({selectedMetric?.unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder={selectedMetric?.placeholder}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '20px',
                fontWeight: 700,
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 0' }}>
              {selectedMetric?.hint}
            </p>
          </div>

          {form.metricId === 'glicemia' && (
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Quando foi medida?
              </label>
              <select
                value={form.context}
                onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                <option value="">Selecione uma opção</option>
                <option value="Em jejum">Em jejum</option>
                <option value="Antes da refeição">Antes da refeição</option>
                <option value="Após a refeição">Após a refeição</option>
                <option value="Outro momento">Outro momento</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Observação (opcional)
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Ex: tomei o remédio antes"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div className="health-diary-actions" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={resetForm}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                border: '2px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.value.trim()}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: form.value.trim()
                  ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                  : '#e2e8f0',
                color: form.value.trim() ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '16px',
                cursor: form.value.trim() ? 'pointer' : 'not-allowed',
                boxShadow: form.value.trim() ? '0 4px 12px rgba(124,58,237,0.35)' : 'none',
              }}
            >
              {editingEntryId ? 'Salvar alterações' : 'Salvar medida'}
            </button>
          </div>
        </div>
      )}

      <div>
        <p
          style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 12px',
          }}
        >
          Hoje
        </p>

        {todayEntries.length === 0 ? (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '18px',
              padding: '28px 20px',
              textAlign: 'center',
              border: '2px dashed #e2e8f0',
            }}
          >
            <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>
              Nenhuma medida registrada hoje ainda.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayEntries.map((entry) => {
              const metric = METRICS.find((m) => m.id === entry.metricId);
              const Icon = metric?.icon || Heart;
              return (
                <div
                  key={entry.id}
                  className="health-diary-entry" style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '16px 18px',
                    border: `2px solid ${metric?.color || '#e2e8f0'}20`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      background: metric?.bg || '#f8fafc',
                      borderRadius: '12px',
                      width: '46px',
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      style={{ width: '22px', height: '22px', color: metric?.color || '#64748b' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: 600,
                        margin: '0 0 2px',
                      }}
                    >
                      {entry.metricLabel} · {formatTime(entry.timestamp)}
                    </p>
                    <p
                      style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: metric?.color || '#0f172a',
                        margin: 0,
                      }}
                    >
                      {entry.value}{' '}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
                        {entry.unit}
                      </span>
                    </p>
                    {entry.context && (
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                        {entry.context}
                      </p>
                    )}
                    {entry.note && (
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      aria-label={`Editar medida de ${entry.metricLabel}`}
                      title="Editar medida"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '8px',
                        borderRadius: '8px',
                      }}
                    >
                      <Pencil style={{ width: '18px', height: '18px' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      aria-label={`Excluir medida de ${entry.metricLabel}`}
                      title="Excluir medida"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '8px',
                        borderRadius: '8px',
                      }}
                    >
                      <Trash2 style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {historyEntries.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 12px',
            }}
          >
            <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Histórico anterior
            </p>
            {showHistory ? (
              <ChevronUp style={{ width: '20px', height: '20px', color: '#64748b' }} />
            ) : (
              <ChevronDown style={{ width: '20px', height: '20px', color: '#64748b' }} />
            )}
          </button>

          {showHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {historyEntries.slice(0, 20).map((entry) => {
                const metric = METRICS.find((m) => m.id === entry.metricId);
                const Icon = metric?.icon || Heart;
                return (
                  <div
                    key={entry.id}
                    className="health-diary-history-entry" style={{
                      background: '#f8fafc',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Icon
                      style={{ width: '18px', height: '18px', color: metric?.color || '#64748b', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 2px', fontWeight: 600 }}>
                        {entry.metricLabel} · {formatDate(entry.timestamp)}
                      </p>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {entry.value} {entry.unit}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(entry)}
                        aria-label={`Editar medida de ${entry.metricLabel}`}
                        title="Editar medida"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          padding: '6px',
                          borderRadius: '8px',
                        }}
                      >
                        <Pencil style={{ width: '16px', height: '16px' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        aria-label={`Excluir medida de ${entry.metricLabel}`}
                        title="Excluir medida"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          padding: '6px',
                          borderRadius: '8px',
                        }}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
