import React, { useState } from 'react';
import { Pill, Search, Plus, Trash2, Clock3, ChevronRight } from 'lucide-react';

export default function MedicationListView({
  medications = [],
  onOpenAdd,
  onDelete,
  onViewDetails,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = medications.filter(
    (m) =>
      (m.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.principioAtivo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '48px' }} className="animate-fade-in">

      {/* Header com botão único de adicionar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 10px 30px rgba(29,78,216,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill style={{ width: '22px', height: '22px', color: '#ffffff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Meus Remédios
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              {medications.length === 0
                ? 'Nenhum remédio cadastrado ainda'
                : `${medications.length} remédio${medications.length !== 1 ? 's' : ''} cadastrado${medications.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            color: '#1d4ed8',
            fontWeight: 900,
            fontSize: '17px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Plus style={{ width: '22px', height: '22px' }} />
          Adicionar medicamento
        </button>
      </div>

      {/* Busca */}
      {medications.length > 0 && (
        <div style={{ position: 'relative' }}>
          <Search
            style={{
              width: '18px',
              height: '18px',
              color: '#94a3b8',
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar remédio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '42px',
              paddingRight: '16px',
              paddingTop: '14px',
              paddingBottom: '14px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              fontSize: '15px',
              color: '#0f172a',
              boxSizing: 'border-box',
              outline: 'none',
              fontWeight: 500,
            }}
          />
        </div>
      )}

      {/* Lista / Estado vazio */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '20px',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>💊</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            {searchTerm ? 'Nenhum resultado' : 'Nenhum remédio ainda'}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {searchTerm
              ? 'Tente outro nome.'
              : 'Toque em "Adicionar medicamento" acima para começar.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((med) => (
            <div
              key={med.id}
              onClick={() => onViewDetails(med)}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '2px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {/* Icone grande */}
              <div
                style={{
                  background: '#eff6ff',
                  borderRadius: '20px',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid #bfdbfe',
                }}
              >
                <Pill style={{ width: '32px', height: '32px', color: '#2563eb' }} />
              </div>

              {/* Informações */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '0 0 4px',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {med.nome}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                  {med.concentracao && (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>
                      {med.concentracao}
                    </span>
                  )}

                  {Array.isArray(med.horarios) && med.horarios.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8' }}>
                      <Clock3 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>
                        Lembrete às {med.horarios.join(' e ')}
                      </span>
                    </div>
                  )}

                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                    Toque para ver os detalhes
                  </span>
                </div>
              </div>

              <ChevronRight style={{ width: '22px', height: '22px', color: '#94a3b8', flexShrink: 0 }} />

              {/* Botão de excluir */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(med.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  border: '2px solid #fecaca',
                  background: '#fef2f2',
                  color: '#dc2626',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                aria-label="Excluir remédio"
              >
                <Trash2 style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
