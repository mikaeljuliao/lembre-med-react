import React, { useState, useEffect } from 'react';
import { BookOpenText, Search, ExternalLink, ShieldCheck, Info, FileText, AlertTriangle } from 'lucide-react';
import Badge from '../common/Badge';
import MedicalDisclaimer from '../common/MedicalDisclaimer';
import { OFFICIAL_MEDICINES } from '../../data/officialMedicines';

export default function OfficialInfoView({ initialSelectedId = null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(OFFICIAL_MEDICINES[0]);

  useEffect(() => {
    if (initialSelectedId) {
      const found = OFFICIAL_MEDICINES.find((m) => m.id === initialSelectedId);
      if (found) setSelectedMed(found);
    }
  }, [initialSelectedId]);

  const filteredMedicines = OFFICIAL_MEDICINES.filter(
    (m) =>
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.principioAtivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 text-teal-600 font-semibold text-xs mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Informações Oficiais e Rastreáveis</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Consulta de Bulas e Fontes Oficiais (ANVISA)
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Consulte princípios ativos, indicações e advertências diretamente extraídos de bulas oficiais registradas na Agência Nacional de Vigilância Sanitária (ANVISA).
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Main Grid: Search list & Selected Document Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search & Sidebar List */}
        <div className="space-y-3">
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

          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredMedicines.map((item) => {
              const isSelected = selectedMed?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedMed(item)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 border border-teal-200 text-teal-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.nome}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{item.principioAtivo}</div>
                  </div>
                  <Badge variant="teal">ANVISA</Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Official Medicine Detail */}
        <div className="lg:col-span-2">
          {selectedMed ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
              {/* Document Title & Provenance Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedMed.nome}</h3>
                    <Badge variant="teal">Fonte Oficial</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Princípio Ativo: <strong className="text-slate-800">{selectedMed.principioAtivo}</strong>
                  </p>
                </div>

                <a
                  href={selectedMed.fonteOficial.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors focus-ring self-start"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Consultar no Bulário ANVISA</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              {/* Provenance Metadata Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Órgão Oficial</span>
                  <span className="font-bold text-slate-900">{selectedMed.fonteOficial.sourceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Documento</span>
                  <span className="font-bold text-slate-900">{selectedMed.fonteOficial.documentTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Última Atualização</span>
                  <span className="font-bold text-slate-900">{selectedMed.fonteOficial.updatedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Data de Acesso</span>
                  <span className="font-bold text-slate-900">{selectedMed.fonteOficial.retrievedAt}</span>
                </div>
              </div>

              {/* Official Content Sections */}
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-extrabold text-blue-900 mb-1 flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Indicações Principais</span>
                  </h4>
                  <p>{selectedMed.indicacoes}</p>
                </div>

                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <h4 className="font-extrabold text-red-900 mb-1 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Contraindicações</span>
                  </h4>
                  <p>{selectedMed.contraindicacoes}</p>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <h4 className="font-extrabold text-amber-900 mb-1">Advertências e Precauções</h4>
                  <p>{selectedMed.advertencias}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">Interações Medicamentosas</h4>
                    <p className="text-slate-600">{selectedMed.interacoes}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">Efeitos Adversos Possíveis</h4>
                    <p className="text-slate-600">{selectedMed.efeitosAdversos}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Armazenamento Recomendações</h4>
                  <p className="text-slate-600">{selectedMed.armazenamento}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <BookOpenText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Selecione um medicamento para visualizar a bula oficial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
