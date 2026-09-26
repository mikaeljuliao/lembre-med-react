import React, { useState } from 'react';
import { History, Search, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function HistoryView({ history = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filtered = history.filter((item) => {
    const matchesSearch =
      (item.medicationNome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.treatmentNome || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>Histórico de Registros</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Registro de auditoria completo das tomadas e ocorrências realizadas em seus tratamentos.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filtrar histórico por medicamento ou tratamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus-ring"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus-ring text-slate-700"
          >
            <option value="all">Todos os Status</option>
            <option value="taken">Tomado</option>
            <option value="skipped">Pulado</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhum registro encontrado no histórico"
          description="Os registros de tomada e alterações de tratamentos ficarão salvos aqui."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((item) => {
            const isTaken = item.status === 'taken';
            const isSkipped = item.status === 'skipped';

            return (
              <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isTaken
                        ? 'bg-emerald-100 text-emerald-700'
                        : isSkipped
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isTaken && <CheckCircle2 className="w-5 h-5" />}
                    {isSkipped && <XCircle className="w-5 h-5" />}
                    {!isTaken && !isSkipped && <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{item.medicationNome}</h4>
                      {isTaken && <Badge variant="success">Tomado</Badge>}
                      {isSkipped && <Badge variant="slate">Pulado</Badge>}
                      {!isTaken && !isSkipped && <Badge variant="warning">{item.status}</Badge>}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.dosagem || 'Dose padrão'} • Tratamento: <strong className="text-slate-700">{item.treatmentNome}</strong>
                    </p>

                    {item.observacao && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">{item.observacao}</p>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date(item.timestamp).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
