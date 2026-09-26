import React, { useState } from 'react';
import { Pill, Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';

export default function MedicationListView({
  medications = [],
  onOpenAdd,
  onDelete,
  onViewDetails,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = medications.filter((m) =>
    (m.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.principioAtivo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Pill className="w-6 h-6 text-blue-600" />
            <span>Meus Medicamentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Adicione o remédio e o lembrete já é criado automaticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs focus-ring transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar medicamento</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Buscar por nome ou princípio ativo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus-ring"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="Nenhum medicamento encontrado"
          description={
            searchTerm
              ? 'Tente ajustar os termos de pesquisa.'
              : 'Você ainda não possui medicamentos cadastrados.'
          }
          actionLabel="Adicionar primeiro medicamento"
          onAction={onOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((med) => {
            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{med.nome}</h3>
                      <p className="text-xs text-slate-500">{med.principioAtivo || 'Sem princípio ativo'}</p>
                    </div>
                    <Badge variant="teal">{med.apresentacao || 'Medicamento'}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Concentração:</span>
                      <span className="font-bold text-slate-800">{med.concentracao}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onViewDetails(med)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 focus-ring"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDelete(med.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg focus-ring"
                      title="Excluir medicamento"
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
