import { useState } from 'react';
import { HeartPulse, BookOpen, TrendingUp, Phone } from 'lucide-react';
import HealthGuideView from './HealthGuideView';
import HealthDiaryView from './HealthDiaryView';
import EmergencyContactsView from './EmergencyContactsView';

const SUB_TABS = [
  {
    id: 'guia',
    label: 'Guia',
    sublabel: 'O que fazer?',
    icon: BookOpen,
    color: '#0891b2',
    bg: '#ecfeff',
  },
  {
    id: 'diario',
    label: 'Diário',
    sublabel: 'Pressão, peso...',
    icon: TrendingUp,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'contatos',
    label: 'Contatos',
    sublabel: 'Emergência',
    icon: Phone,
    color: '#dc2626',
    bg: '#fef2f2',
  },
];

export default function SaudeView() {
  const [activeSubTab, setActiveSubTab] = useState('guia');

  return (
    <div className="animate-fade-in">

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px 8px',
                borderRadius: '18px',
                border: `2px solid ${isActive ? tab.color : '#e2e8f0'}`,
                background: isActive ? tab.color : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? `0 6px 16px ${tab.color}40` : '0 2px 6px rgba(0,0,0,0.05)',
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <div
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : tab.bg,
                  borderRadius: '12px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  style={{
                    width: '22px',
                    height: '22px',
                    color: isActive ? '#ffffff' : tab.color,
                  }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: isActive ? '#ffffff' : '#0f172a',
                    margin: '0 0 2px',
                  }}
                >
                  {tab.label}
                </p>
                <p
                  style={{
                    fontSize: '11px',
                    color: isActive ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  {tab.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {activeSubTab === 'guia' && <HealthGuideView />}
      {activeSubTab === 'diario' && <HealthDiaryView />}
      {activeSubTab === 'contatos' && <EmergencyContactsView />}
    </div>
  );
}
