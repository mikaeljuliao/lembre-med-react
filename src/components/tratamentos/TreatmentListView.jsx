import React, { useState } from 'react';
import { Stethoscope, Plus, Edit2, Trash2, Calendar, Pill, CheckCircle, PauseCircle, XCircle } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

const STATUS_MAP = {
  active: { label: 'Ativo', variant: 'success', icon: CheckCircle },
  paused: { label: 'Pausado', variant: 'warning', icon: PauseCircle },
  completed: { label: 'Concluído', variant: 'teal', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'slate', icon: XCircle },
};

export default function TreatmentListView({
  treatments = [],
  onOpenAdd,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = treatments.filter(
    (t) => filterStatus === 'all' || t.status === filterStatus
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span>Tratamentos e Rotinas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Organize suas prescrições em tratamentos com períodos e medicamentos vinculados.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs focus-ring transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Tratamento</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'active', 'paused', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors focus-ring ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st === 'all' ? 'Todos os Tratamentos' : STATUS_MAP[st]?.label || st}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="Nenhum tratamento encontrado"
          description="Você pode cadastrar novos tratamentos vinculando medicamentos e definindo a rotina diária."
          actionLabel="Cadastrar Novo Tratamento"
          onAction={onOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => {
            const statusConfig = STATUS_MAP[t.status] || STATUS_MAP.active;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{t.nome}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{t.descricao || 'Sem descrição'}</p>
                    </div>
                    <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      <span>{statusConfig.label}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 my-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Início: {t.dataInicio ? new Date(t.dataInicio).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                    </div>
                    {t.dataFim && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fim: {new Date(t.dataFim).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-600" />
                      <span>Medicamentos na Rotina</span>
                    </h4>

                    {(t.medicamentos || []).map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">{m.nome}</span>
                        <span className="text-slate-500">
                          {m.dosagem} às {(m.horarios || ['08:00']).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <select
                    value={t.status}
                    onChange={(e) => onToggleStatus(t.id, e.target.value)}
                    className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus-ring"
                  >
                    <option value="active">Marcar Ativo</option>
                    <option value="paused">Marcar Pausado</option>
                    <option value="completed">Marcar Concluído</option>
                    <option value="cancelled">Marcar Cancelado</option>
                  </select>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg focus-ring"
                      title="Editar tratamento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg focus-ring"
                      title="Excluir tratamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
