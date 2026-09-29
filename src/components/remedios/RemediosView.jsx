import { Check, ClipboardList, History, XCircle } from 'lucide-react';
import { useState } from 'react';
import MedicationListView from '../medicamentos/MedicationListView';
import { calculateAdherence } from '../../utils/businessLogic';

export default function RemediosView({
  medications = [],
  history = [],
  onOpenAdd,
  onDelete,
  onViewDetails,
}) {
  const [historyMedicationFilter, setHistoryMedicationFilter] = useState('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [showAllHistory, setShowAllHistory] = useState(false);

  const recentHistory = history.slice(0, 10);
  const historyEntries = showAllHistory ? history : recentHistory;
  const historyMedications = medications.filter((medication) =>
    history.some(
      (entry) => String(entry.medicationId || '') === String(medication.id)
    )
  );
  const filteredHistory = historyEntries.filter((entry) => {
    const matchesMedication =
      historyMedicationFilter === 'all' ||
      String(entry.medicationId || '') === historyMedicationFilter;
    const matchesStatus =
      historyStatusFilter === 'all' || entry.status === historyStatusFilter;

    return matchesMedication && matchesStatus;
  });

  const adherenceByMedication = Object.values(
    history.reduce((groups, entry) => {
      const medicationKey = entry.medicationId
        ? String(entry.medicationId)
        : String(entry.medicationNome || '').trim().toLowerCase();

      if (!medicationKey) return groups;

      if (!groups[medicationKey]) {
        groups[medicationKey] = {
          medicationId: entry.medicationId || null,
          medicationNome: entry.medicationNome || 'Medicamento',
          events: [],
        };
      }

      groups[medicationKey].events.push(entry);
      return groups;
    }, {})
  )
    .map((group) => ({
      ...group,
      adherence: calculateAdherence(group.events),
    }))
    .sort((first, second) =>
      first.medicationNome.localeCompare(second.medicationNome, 'pt-BR')
    );

  return (
    <div className="space-y-6 pb-24">
      <MedicationListView
        medications={medications}
        onOpenAdd={onOpenAdd}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />

      {recentHistory.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <History className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-900">
                    Histórico de uso
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                    {history.length} {history.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                  Veja o que foi registrado para os seus medicamentos.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Registradas</p>
                <p className="mt-1 text-xl font-black text-slate-900">{history.filter((entry) => entry.status === 'taken').length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Não tomadas</p>
                <p className="mt-1 text-xl font-black text-slate-900">{history.filter((entry) => entry.status === 'skipped').length}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Medicamentos</p>
                <p className="mt-1 text-xl font-black text-slate-900">{adherenceByMedication.length}</p>
              </div>
            </div>
          </div>

          {adherenceByMedication.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Adesão registrada por medicamento
                </h3>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                  Considera apenas doses que foram registradas como tomadas ou não tomadas.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {adherenceByMedication.map((item) => (
                  <div
                    key={item.medicationId || item.medicationNome}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-black text-slate-900">
                        {item.medicationNome}
                      </p>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-sm font-black text-slate-700">
                        {item.adherence.adherencePercentage}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-500">
                      {item.adherence.takenDoses} tomada
                      {item.adherence.takenDoses === 1 ? '' : 's'} ·{' '}
                      {item.adherence.skippedDoses} não tomada
                      {item.adherence.skippedDoses === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Registros recentes</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Mostrando {filteredHistory.length} registro{filteredHistory.length === 1 ? '' : 's'}.
                  {showAllHistory ? ' Histórico completo.' : ' Últimos 10 registros.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-600">
                  Medicamento
                  <select
                    value={historyMedicationFilter}
                    onChange={(event) => setHistoryMedicationFilter(event.target.value)}
                    className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="all">Todos os medicamentos</option>
                    {historyMedications.map((medication) => (
                      <option key={medication.id} value={String(medication.id)}>
                        {medication.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-600">
                  Situação
                  <select
                    value={historyStatusFilter}
                    onChange={(event) => setHistoryStatusFilter(event.target.value)}
                    className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="all">Todas</option>
                    <option value="taken">Tomadas</option>
                    <option value="skipped">Não tomadas</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <div className="px-5 py-8 text-center sm:px-6">
                <p className="text-sm font-bold text-slate-600">
                  Nenhum registro encontrado para este medicamento.
                </p>
              </div>
            ) : (
              filteredHistory.map((entry) => {
              const isTaken = entry.status === 'taken';
              const scheduledAt = entry.scheduledAt ? new Date(entry.scheduledAt) : null;
              const recordedAt = entry.timestamp ? new Date(entry.timestamp) : null;
              const hasValidScheduledAt = scheduledAt && !Number.isNaN(scheduledAt.getTime());
              const hasValidRecordedAt = recordedAt && !Number.isNaN(recordedAt.getTime());
              const wasRecordedLate =
                isTaken &&
                hasValidScheduledAt &&
                hasValidRecordedAt &&
                recordedAt.getTime() - scheduledAt.getTime() >= 60000;

              return (
                <div key={entry.id} className="px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' +
                        (isTaken
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500')
                      }
                    >
                      {isTaken ? (
                        <Check className="h-5 w-5" strokeWidth={3} />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-black text-slate-900">
                          {entry.medicationNome}
                        </p>
                        <span
                          className={
                            'rounded-full px-2.5 py-1 text-xs font-black ' +
                            (isTaken
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600')
                          }
                        >
                          {isTaken ? 'Tomada' : 'Não tomada'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {isTaken ? 'Tomada' : 'Não tomada'}{' '}
                        {hasValidRecordedAt
                          ? 'em ' +
                            recordedAt.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }) +
                            ' às ' +
                            recordedAt.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'sem horário registrado'}
                      </p>

                      {hasValidScheduledAt && (
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {isTaken ? 'Programada para' : 'Estava programada para'}{' '}
                          {scheduledAt.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {wasRecordedLate && ' · tomada depois do horário'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {history.length > 10 && (
            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setShowAllHistory((current) => !current)}
                className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showAllHistory ? 'Mostrar somente os 10 mais recentes' : 'Ver histórico completo'}
              </button>
            </div>
          )}

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p className="text-sm font-semibold leading-5 text-slate-600">
                Este histórico mostra registros já realizados. As próximas doses continuam sendo acompanhadas em <strong className="font-black text-slate-800">Início</strong>.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
