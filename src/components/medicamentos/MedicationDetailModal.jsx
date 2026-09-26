import React from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { Pill, BookOpenText, Calendar, Clock3, Utensils, Info, Pencil } from 'lucide-react';
import { OFFICIAL_MEDICINES } from '../../data/officialMedicines';

const MEAL_LABELS = {
  sem_orientacao: 'Sem orientação',
  jejum: 'Em jejum',
  antes: 'Antes da refeição',
  durante: 'Durante a refeição',
  depois: 'Depois da refeição',
};

export default function MedicationDetailModal({ isOpen, onClose, medication, onOpenOfficialInfo, onEdit }) {
  if (!medication) return null;

  const officialMatch = OFFICIAL_MEDICINES.find(
    (off) => off.nome.toLowerCase() === medication.nome.toLowerCase()
  );
  const horarios = Array.isArray(medication.horarios) ? medication.horarios : [];
  const isAsNeeded = medication.tipoUso === 'as_needed';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu medicamento">
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => onEdit(medication)} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200">
          <Pencil className="h-4 w-4" />
          Editar informações
        </button>
      </div>
      <div className="max-h-[78vh] space-y-4 overflow-y-auto pr-1">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Pill className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xl font-extrabold text-slate-900">{medication.nome}</h4>
              <p className="truncate text-sm font-semibold text-slate-500">{medication.principioAtivo || 'Princípio ativo não informado'}</p>
            </div>
          </div>
          <Badge variant="teal">{medication.apresentacao || 'Medicamento'}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs font-bold text-slate-400">Dose por vez</span>
            <span className="text-base font-black text-slate-900">{medication.dosagem || String(medication.quantidadePorDose || 1) + ' ' + (medication.unidadeDose || 'unidade')}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs font-bold text-slate-400">Concentração</span>
            <span className="text-base font-black text-slate-900">{medication.concentracao || 'Não informada'}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs font-bold text-slate-400">Via</span>
            <span className="text-base font-black text-slate-900">{medication.viaAdministracao || 'Não informada'}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs font-bold text-slate-400">Validade</span>
            <span className="flex items-center gap-1 text-sm font-bold text-slate-900">
              <Calendar className="h-4 w-4 text-slate-400" />
              {medication.validade ? new Date(medication.validade + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-blue-600" />
            <div>
              <h5 className="text-base font-extrabold text-slate-900">Como usar no DoseFácil</h5>
              <p className="text-xs font-semibold text-slate-500">Informações cadastradas para os lembretes</p>
            </div>
          </div>
          {isAsNeeded ? (
            <div className="rounded-xl bg-white px-4 py-3">
              <p className="text-base font-black text-slate-900">Quando precisar</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Este remédio não possui alarme fixo.</p>
              {medication.condicaoUso && <p className="mt-3 text-sm font-bold text-slate-800">Quando usar: {medication.condicaoUso}</p>}
              {(medication.intervaloMinimoHoras || medication.limiteDosesDia) && (
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {medication.intervaloMinimoHoras ? 'Intervalo mínimo: ' + medication.intervaloMinimoHoras + 'h' : ''}
                  {medication.intervaloMinimoHoras && medication.limiteDosesDia ? ' · ' : ''}
                  {medication.limiteDosesDia ? 'Máximo: ' + medication.limiteDosesDia + ' por dia' : ''}
                </p>
              )}
            </div>
          ) : medication.tipoUso === 'interval' ? (
            <div className="rounded-xl bg-white px-4 py-3">
              <p className="text-base font-black text-slate-900">A cada {medication.intervaloHoras} horas</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Primeiro horário: {medication.horarioInicial || horarios[0] || '--:--'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {horarios.map((horario) => (
                <div key={horario} className="rounded-xl border border-blue-100 bg-white px-3 py-3 text-center">
                  <span className="block text-xl font-black text-blue-700">{String(horario).slice(0, 5)}</span>
                  <span className="text-xs font-semibold text-slate-500">{medication.dosagem || 'Dose configurada'}</span>
                </div>
              ))}
            </div>
          )}
          {medication.dataFim && <p className="mt-3 text-sm font-bold text-blue-800">Lembrete até {new Date(medication.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}.</p>}
        </div>

        {(MEAL_LABELS[medication.orientacaoAlimentacao] || medication.finalidade || medication.observacoes) && (
          <div className="space-y-3">
            {MEAL_LABELS[medication.orientacaoAlimentacao] && medication.orientacaoAlimentacao !== 'sem_orientacao' && <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <Utensils className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div><p className="text-xs font-black uppercase tracking-wide text-amber-700">Refeição</p><p className="mt-1 text-sm font-bold text-amber-900">{MEAL_LABELS[medication.orientacaoAlimentacao]}</p></div>
            </div>}
            {medication.finalidade && <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Para que uso</p><p className="mt-1 text-sm font-bold text-slate-800">{medication.finalidade}</p></div>}
            {medication.observacoes && <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><p className="text-xs font-black uppercase tracking-wide text-blue-700">Observações</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{medication.observacoes}</p></div>}
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-900"><BookOpenText className="h-4 w-4 text-teal-600" /><span>Informações Oficiais de Saúde</span></h5>
            {officialMatch ? <Badge variant="success">Disponível via ANVISA</Badge> : <Badge variant="slate">Não vinculado</Badge>}
          </div>
          {officialMatch ? (
            <div className="space-y-2 rounded-xl border border-teal-200/70 bg-teal-50/50 p-3 text-xs">
              <p className="font-medium text-teal-900">Bula oficial cadastrada na base de dados oficial.</p>
              <button type="button" onClick={() => { onClose(); onOpenOfficialInfo(officialMatch.id); }} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 font-bold text-white transition-colors hover:bg-teal-700 focus-ring">
                <BookOpenText className="h-3.5 w-3.5" />
                <span>Consultar Bula ANVISA</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500"><Info className="h-4 w-4 shrink-0" /><span>Nenhum documento oficial está vinculado a este nome exato.</span></div>
          )}
        </div>
      </div>
    </Modal>
  );
}
