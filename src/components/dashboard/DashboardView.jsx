import React from 'react';
import TodaySummaryCard from './TodaySummaryCard';
import NextDosesCard from './NextDosesCard';
import QuickActions from './QuickActions';
import LowStockWidget from './LowStockWidget';
import AdherenceCard from './AdherenceCard';
import MedicalDisclaimer from '../common/MedicalDisclaimer';
import { Calendar, HeartHandshake, Pill } from 'lucide-react';

export default function DashboardView({
  doses = [],
  medications = [],
  treatments = [],
  onToggleDoseStatus,
  onOpenAddMed,
  onOpenAddTreatment,
  onNavigate,
}) {
  const activeTreatments = treatments.filter((t) => t.status === 'active');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-semibold mb-1">
            <HeartHandshake className="w-4 h-4 text-teal-300" />
            <span>Bem-vindo ao DoseFácil</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            O que você precisa saber hoje
          </h2>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Acompanhe seus horários, rotinas de tratamento e mantenha o estoque de medicamentos organizado com tranquilidade.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-right self-start md:self-auto">
          <span className="text-[11px] text-blue-200 block font-medium">Data de hoje</span>
          <span className="text-sm font-extrabold text-white flex items-center justify-end space-x-1">
            <Calendar className="w-4 h-4 text-teal-300 mr-1" />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
          </span>
        </div>
      </div>

      <QuickActions
        onOpenAddMed={onOpenAddMed}
        onOpenAddTreatment={onOpenAddTreatment}
        onNavigate={onNavigate}
      />

      <LowStockWidget
        medications={medications}
        activeTreatments={activeTreatments}
        onNavigateStock={() => onNavigate('estoque')}
      />

      <TodaySummaryCard doses={doses} activeTreatmentsCount={activeTreatments.length} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NextDosesCard doses={doses} onToggleDoseStatus={onToggleDoseStatus} />
        </div>

        <div className="space-y-6">
          <AdherenceCard doses={doses} />

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <span>Tratamentos Ativos ({activeTreatments.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('tratamentos')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Ver todos
              </button>
            </div>

            {activeTreatments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum tratamento ativo no momento.</p>
            ) : (
              <div className="space-y-2.5">
                {activeTreatments.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800">{t.nome}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{t.descricao || 'Sem descrição'}</p>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                      {(t.medicamentos || []).length} medicamentos associados
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <MedicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
