import { useState } from 'react';
import {
  ChevronRight,
  Clock3,
  Pill,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

export default function MedicationListView({
  medications = [],
  onOpenAdd,
  onDelete,
  onViewDetails,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = medications.filter(
    (medication) =>
      (medication.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medication.principioAtivo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white shadow-lg">
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Pill className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight">Meus remédios</h1>
              <p className="mt-1 text-sm font-semibold leading-5 text-white/80">
                Aqui ficam os remédios que você cadastrou e os horários usados pelos lembretes.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-sm font-bold leading-5 text-white">
              Na página inicial, você vê o que precisa fazer agora. Aqui, você confere seus remédios e os horários deles.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAdd}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-lg font-black text-blue-700 shadow-md transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
            Adicionar remédio
          </button>
        </div>
      </div>

      {medications.length > 0 && (
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou princípio ativo..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="min-h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-4 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            aria-label="Buscar remédio por nome ou princípio ativo" autoComplete="off"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
            💊
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900">
            {searchTerm ? 'Nenhum remédio encontrado' : 'Nenhum remédio cadastrado'}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-5 text-slate-600">
            {searchTerm
              ? 'Tente buscar pelo nome do remédio ou pelo princípio ativo.'
              : 'Quando você adicionar um remédio, ele aparecerá aqui com os horários dos lembretes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {medications.length} remédio{medications.length === 1 ? '' : 's'} cadastrado{medications.length === 1 ? '' : 's'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Toque em um remédio para conferir seus detalhes e horários.
              </p>
            </div>
          </div>

          {filtered.map((medication) => {
            const horarios = Array.isArray(medication.horarios)
              ? medication.horarios.map((horario) => String(horario).slice(0, 5))
              : [];
            const isAsNeeded = medication.tipoUso === 'as_needed';

            return (
              <div
                key={medication.id}
                className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onViewDetails(medication)}
                  className="flex min-h-28 w-full items-center gap-4 px-5 py-5 text-left focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-100 sm:px-6"
                  aria-label={'Ver detalhes de ' + medication.nome}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-100 bg-blue-50 text-blue-600">
                    <Pill className="h-8 w-8" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-xl font-black text-slate-900 sm:text-2xl">
                        {medication.nome}
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                        Lembrete ativo
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                      {medication.concentracao && <span>{medication.concentracao}</span>}
                      {medication.viaAdministracao && <span>· {medication.viaAdministracao}</span>}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-blue-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" aria-hidden="true" />
                        {isAsNeeded
                          ? 'Quando precisar'
                          : medication.tipoUso === 'interval'
                            ? 'A cada ' + medication.intervaloHoras + 'h · inicia ' + (medication.horarioInicial || horarios[0] || '--:--')
                            : horarios.length > 0
                              ? horarios.join(' · ')
                              : 'Horário não informado'}
                      </span>
                      {!isAsNeeded && medication.tipoUso !== 'interval' && (
                        <span className="text-slate-500">
                          {horarios.length} {horarios.length === 1 ? 'horário por dia' : 'horários por dia'}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Toque para ver detalhes
                    </p>
                  </div>

                  <ChevronRight aria-hidden="true" className="h-6 w-6 shrink-0 text-slate-400" />
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">
                  <p className="text-sm font-semibold text-slate-500">
                    Os lembretes deste remédio aparecem na página inicial.
                  </p>
                  <button
                    type="button"
                    onClick={() => onDelete(medication.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={'Excluir ' + medication.nome}
                  >
                    <Trash2 aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
