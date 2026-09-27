import React, { useState, useEffect } from 'react';
import {
  Phone,
  Plus,
  Trash2,
  UserCircle2,
  Stethoscope,
  Heart,
  Star,
  Edit2,
  X,
  Check,
} from 'lucide-react';

const STORAGE_KEY = 'dosefacil_emergency_contacts';

const CONTACT_TYPES = [
  { id: 'familia', label: 'Família', icon: Heart, color: '#e11d48', bg: '#fff1f2' },
  { id: 'medico', label: 'Médico', icon: Stethoscope, color: '#0891b2', bg: '#ecfeff' },
  { id: 'outro', label: 'Outro', icon: UserCircle2, color: '#7c3aed', bg: '#f5f3ff' },
];

const FIXED_CONTACTS = [
  {
    id: 'samu',
    nome: 'SAMU',
    telefone: '192',
    tipo: 'fixo',
    label: 'Emergência Médica',
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    id: 'bombeiros',
    nome: 'Bombeiros',
    telefone: '193',
    tipo: 'fixo',
    label: 'Incêndio / Resgate',
    color: '#ea580c',
    bg: '#fff7ed',
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

function saveStored(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

const EMPTY_FORM = { nome: '', telefone: '', tipo: 'familia', nota: '' };

export default function EmergencyContactsView() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    setContacts(getStored());
  }, []);

  const handleSave = () => {
    if (!form.nome.trim() || !form.telefone.trim()) return;
    let updated;
    if (editId) {
      updated = contacts.map((c) =>
        c.id === editId ? { ...c, ...form } : c
      );
    } else {
      const newContact = { id: `ec-${Date.now()}`, ...form };
      updated = [newContact, ...contacts];
    }
    setContacts(updated);
    saveStored(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (contact) => {
    setForm({
      nome: contact.nome,
      telefone: contact.telefone,
      tipo: contact.tipo,
      nota: contact.nota || '',
    });
    setEditId(contact.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveStored(updated);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditId(null);
  };

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
      className="animate-fade-in"
    >

      <div
        style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 10px 30px rgba(220,38,38,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Star style={{ width: '24px', height: '24px', color: '#fca5a5' }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#fca5a5',
            }}
          >
            Contatos de Emergência
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
          Ligar com 1 toque
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
          Médico, família e emergências sempre à mão.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {FIXED_CONTACTS.map((c) => (
          <a
            key={c.id}
            href={`tel:${c.telefone}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: c.bg,
              borderRadius: '20px',
              padding: '18px 20px',
              textDecoration: 'none',
              border: `2px solid ${c.color}30`,
              boxShadow: `0 4px 12px ${c.color}20`,
            }}
          >
            <div
              style={{
                background: c.color,
                borderRadius: '14px',
                width: '54px',
                height: '54px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Phone style={{ width: '26px', height: '26px', color: '#ffffff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: c.color,
                  margin: '0 0 2px',
                }}
              >
                {c.nome} — {c.telefone}
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, fontWeight: 600 }}>
                {c.label}
              </p>
            </div>
            <div
              style={{
                background: c.color,
                borderRadius: '12px',
                padding: '10px 16px',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              Ligar
            </div>
          </a>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>
          Meus contatos
        </span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
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
            background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
            borderRadius: '18px',
            padding: '18px',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '17px',
            boxShadow: '0 6px 16px rgba(220,38,38,0.35)',
          }}
        >
          <Plus style={{ width: '24px', height: '24px' }} />
          Adicionar contato
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
            }}
          >
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {editId ? 'Editar contato' : 'Novo contato'}
            </p>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '10px',
                padding: '8px',
                color: '#64748b',
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {CONTACT_TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = form.tipo === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: t.id }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    border: `2px solid ${isActive ? t.color : '#e2e8f0'}`,
                    background: isActive ? t.bg : '#f8fafc',
                    color: isActive ? t.color : '#64748b',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px' }} />
                  {t.label}
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
              Nome
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Dra. Maria Silva"
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
                fontWeight: 600,
              }}
            />
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
              Telefone
            </label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              placeholder="Ex: (11) 99999-9999"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '18px',
                fontWeight: 700,
                border: '2px solid #e2e8f0',
                borderRadius: '14px',
                background: '#f8fafc',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Obs (opcional)
            </label>
            <input
              type="text"
              value={form.nota}
              onChange={(e) => setForm((f) => ({ ...f, nota: e.target.value }))}
              placeholder="Ex: Cardiologista, segunda a sexta"
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleCancel}
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
              disabled={!form.nome.trim() || !form.telefone.trim()}
              style={{
                flex: 2,
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background:
                  form.nome.trim() && form.telefone.trim()
                    ? 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)'
                    : '#e2e8f0',
                color: form.nome.trim() && form.telefone.trim() ? '#ffffff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '16px',
                cursor:
                  form.nome.trim() && form.telefone.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Salvar contato
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !showForm ? (
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
            Adicione o número do seu médico e de um familiar de confiança.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contacts.map((contact) => {
            const contactType = CONTACT_TYPES.find((t) => t.id === contact.tipo);
            const color = contactType?.color || '#64748b';
            const bg = contactType?.bg || '#f8fafc';
            const Icon = contactType?.icon || UserCircle2;
            return (
              <div
                key={contact.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  border: `2px solid ${color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    background: bg,
                    borderRadius: '12px',
                    width: '46px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 2px',
                    }}
                  >
                    {contact.nome}
                  </p>
                  <p style={{ fontSize: '14px', color, fontWeight: 700, margin: 0 }}>
                    {contact.telefone}
                  </p>
                  {contact.nota && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
                      {contact.nota}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <a
                    href={`tel:${contact.telefone.replace(/\D/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: color,
                      borderRadius: '12px',
                      width: '42px',
                      height: '42px',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <Phone style={{ width: '20px', height: '20px' }} />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleEdit(contact)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '12px',
                      width: '42px',
                      height: '42px',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    <Edit2 style={{ width: '18px', height: '18px' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: '12px',
                      width: '42px',
                      height: '42px',
                      cursor: 'pointer',
                      color: '#dc2626',
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
  );
}
