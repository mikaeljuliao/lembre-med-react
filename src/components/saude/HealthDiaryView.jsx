import { useState, useEffect } from 'react';
import {
  Heart,
  Thermometer,
  Droplets,
  Scale,
  Plus,
  Trash2,
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
  const [historyMetric, setHistoryMetric] = useState('todos');

  useEffect(() => {
    setEntries(getStored());
  }, []);

  const handleSave = () => {
    if (!form.value.trim()) return;
    const metric = METRICS.find((m) => m.id === form.metricId);
    const newEntry = {
      id: `hd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metricId: form.metricId,
      metricLabel: metric.label,
      unit: metric.unit,
      value: form.value.trim(),
      context: form.context.trim(),
      note: form.note.trim(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStored(updated);
    setForm({ metricId: 'pressao', value: '', context: '', note: '' });
    setShowForm(false);
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
            Nova medida
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
              onClick={() => setShowForm(false)}
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
              Salvar medida
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
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#cbd5e1',
                      padding: '6px',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 style={{ width: '18px', height: '18px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {historyEntries.length > 0 && (
        <section aria-labelledby="history-title">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            aria-controls="health-history-list"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              cursor: 'pointer',
              padding: '16px 18px',
              textAlign: 'left',
            }}
          >
            <div>
              <p
                id="history-title"
                style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}
              >
                Histórico
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                {historyEntries.length} {historyEntries.length === 1 ? 'registro anterior' : 'registros anteriores'}
              </p>
            </div>
            {showHistory ? (
              <ChevronUp aria-hidden="true" style={{ width: '20px', height: '20px', color: '#64748b' }} />
            ) : (
              <ChevronDown aria-hidden="true" style={{ width: '20px', height: '20px', color: '#64748b' }} />
            )}
          </button>

          {showHistory && (
            <div
              id="health-history-list"
              style={{ marginTop: '12px' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  marginBottom: '14px',
                }}
              >
                {[
                  { id: 'todos', label: 'Todas' },
                  ...METRICS.map((metric) => ({ id: metric.id, label: metric.label })),
                ].map((filter) => {
                  const isActive = historyMetric === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setHistoryMetric(filter.id)}
                      aria-pressed={isActive}
                      style={{
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
                        borderRadius: '999px',
                        padding: '8px 12px',
                        background: isActive ? '#ede9fe' : '#ffffff',
                        color: isActive ? '#6d28d9' : '#64748b',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {(() => {
                const filteredEntries =
                  historyMetric === 'todos'
                    ? historyEntries
                    : historyEntries.filter((entry) => entry.metricId === historyMetric);

                const groups = filteredEntries.reduce((acc, entry) => {
                  const dateKey = entry.timestamp.slice(0, 10);
                  if (!acc[dateKey]) acc[dateKey] = [];
                  acc[dateKey].push(entry);
                  return acc;
                }, {});

                const groupEntries = Object.entries(groups);

                if (groupEntries.length === 0) {
                  return (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '16px',
                        padding: '24px 18px',
                        textAlign: 'center',
                        border: '1px dashed #cbd5e1',
                      }}
                    >
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                        Nenhuma medida deste tipo no histórico.
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {groupEntries.map(([dateKey, dateEntries]) => (
                      <section key={dateKey} aria-labelledby={`history-date-${dateKey}`}>
                        <p
                          id={`history-date-${dateKey}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#475569',
                            margin: '0 0 8px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {formatDate(dateEntries[0].timestamp)}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dateEntries.map((entry) => {
                            const metric = METRICS.find((m) => m.id === entry.metricId);
                            const Icon = metric?.icon || Heart;

                            return (
                              <div
                                key={entry.id}
                                className="health-diary-history-entry"
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '14px',
                                  padding: '14px 16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
                                }}
                              >
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: metric?.bg || '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Icon
                                    aria-hidden="true"
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      color: metric?.color || '#64748b',
                                    }}
                                  />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      justifyContent: 'space-between',
                                      gap: '12px',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: '14px',
                                        color: '#334155',
                                        margin: 0,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {entry.metricLabel}
                                    </p>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                      {formatTime(entry.timestamp)}
                                    </span>
                                  </div>

                                  <p
                                    style={{
                                      fontSize: '18px',
                                      fontWeight: 900,
                                      color: metric?.color || '#0f172a',
                                      margin: '2px 0 0',
                                    }}
                                  >
                                    {entry.value}{' '}
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                                      {entry.unit}
                                    </span>
                                  </p>

                                  {entry.context && (
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                                      {entry.context}
                                    </p>
                                  )}

                                  {entry.note && (
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                                      {entry.note}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(entry.id)}
                                  aria-label={`Excluir registro de ${entry.metricLabel} de ${formatDate(entry.timestamp)} às ${formatTime(entry.timestamp)}`}
                                  title="Excluir registro"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    padding: '7px',
                                    borderRadius: '8px',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Trash2 aria-hidden="true" style={{ width: '17px', height: '17px' }} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
