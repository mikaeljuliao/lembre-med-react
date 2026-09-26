import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Pill, BookOpenText, Calendar } from 'lucide-react';
import { OFFICIAL_MEDICINES } from '../../data/officialMedicines';

export default function MedicationDetailModal({ isOpen, onClose, medication, onOpenOfficialInfo }) {
  if (!medication) return null;

  const officialMatch = OFFICIAL_MEDICINES.find(
    (off) => off.nome.toLowerCase() === medication.nome.toLowerCase()
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes: ${medication.nome}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">{medication.nome}</h4>
              <p className="text-xs text-slate-500">
                {medication.principioAtivo || 'Princípio ativo não especificado'}
              </p>
            </div>
          </div>
          <Badge variant="teal">{medication.apresentacao || 'Medicamento'}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium mb-0.5">Concentração</span>
            <span className="font-bold text-slate-900 text-sm">{medication.concentracao || 'N/A'}</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium mb-0.5">Validade</span>
            <span className="font-bold text-slate-900 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {medication.validade ? new Date(medication.validade).toLocaleDateString('pt-BR') : 'Não informada'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium mb-0.5">Apresentação</span>
            <span className="font-bold text-slate-900 text-sm">{medication.apresentacao || 'Medicamento'}</span>
          </div>
        </div>

        {medication.observacoes && (
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-xs text-slate-700">
            <span className="font-bold text-blue-900 block mb-1">Observações do Usuário:</span>
            <p className="leading-relaxed">{medication.observacoes}</p>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <BookOpenText className="w-4 h-4 text-teal-600" />
              <span>Informações Oficiais de Saúde</span>
            </h5>
            {officialMatch ? (
              <Badge variant="success">Disponível via ANVISA</Badge>
            ) : (
              <Badge variant="slate">Não vinculado</Badge>
            )}
          </div>

          {officialMatch ? (
            <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/70 text-xs space-y-2">
              <p className="text-teal-900 font-medium">
                Bula oficial cadastrada na base de dados oficial.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOfficialInfo(officialMatch.id);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs focus-ring transition-colors"
              >
                <BookOpenText className="w-3.5 h-3.5" />
                <span>Consultar Bula ANVISA</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500">
              Nenhum documento oficial especificamente vinculado a este nome exato. Você pode buscar o princípio ativo na área de Saúde.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
