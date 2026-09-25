import React, { useState } from 'react';
import { CalendarCheck, Calendar, Check, X, RotateCcw } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function ScheduleView({
  selectedDate,
  setSelectedDate,
  doses = [],
  onToggleDoseStatus,
  embedded = false,
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDoses = doses.filter(
    (d) => filterStatus === 'all' || d.status === filterStatus
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <CalendarCheck className="w-6 h-6 text-purple-600" />
              <span>Agenda de Doses</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualização diária dos eventos de dose calculados a partir dos seus tratamentos.
            </p>
          </div>

          {/* Date Selector input & quick 'Hoje' button */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                isToday
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Hoje
            </button>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus-ring"
              />
            </div>
          </div>
        </div>
      )}

      {embedded && (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
              isToday
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hoje
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus-ring"
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Todas as Doses' },
          { id: 'pending', label: 'Pendentes' },
          { id: 'taken', label: 'Tomadas' },
          { id: 'skipped', label: 'Puladas' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterStatus(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors focus-ring ${
              filterStatus === item.id
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Dose Occurrence Timeline */}
      {filteredDoses.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma dose cadastrada para esta data"
          description="Certifique-se de que existem tratamentos ativos configurados para a data selecionada."
        />
      ) : (
        <div className="space-y-3">
          {filteredDoses.map((dose) => {
            const isTaken = dose.status === 'taken';
            const isSkipped = dose.status === 'skipped';
            const isPending = dose.status === 'pending';

            return (
              <div
                key={dose.id}
                className={`bg-white rounded-2xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                  isTaken
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isSkipped
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`px-3 py-2 rounded-xl text-sm font-extrabold tracking-tight shrink-0 ${
                      isTaken
                        ? 'bg-emerald-600 text-white'
                        : isSkipped
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {dose.horario}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-slate-900">{dose.medicationNome}</h3>
                      {isTaken && <Badge variant="success">Tomado</Badge>}
                      {isSkipped && <Badge variant="slate">Pulado</Badge>}
                      {isPending && <Badge variant="warning">Pendente</Badge>}
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Dosagem: <strong className="text-slate-800">{dose.dosagem}</strong> • Tratamento:{' '}
                      <span className="font-semibold text-slate-700">{dose.treatmentNome}</span>
                    </p>

                    {isTaken && dose.takenAt && (
                      <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                        ✓ Horário registrado: {new Date(dose.takenAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dose Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => onToggleDoseStatus(dose.id, 'taken')}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs focus-ring transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Marcar Tomado</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleDoseStatus(dose.id, 'skipped')}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold focus-ring transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                        <span>Pular</span>
                      </button>
                    </>
                  )}

                  {(isTaken || isSkipped) && (
                    <button
                      type="button"
                      onClick={() => onToggleDoseStatus(dose.id, 'pending')}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl text-xs font-semibold focus-ring transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Voltar a Pendente</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
