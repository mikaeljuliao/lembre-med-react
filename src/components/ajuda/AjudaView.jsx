import {
  BookOpenText,
  Clock3,
  BellRing,
  CheckCircle2,
  Pill,
  Search,
  ArrowRight,
  ShieldAlert,
  Heart,
  Phone,
} from 'lucide-react';

const START_ITEMS = [
  {
    icon: Pill,
    title: 'Cadastre seus remédios',
    description:
      'Abra "Remédios", toque em "Adicionar medicamento" e informe o nome, a dose e os horários.',
  },
  {
    icon: Clock3,
    title: 'Veja o próximo remédio',
    description:
      'Na tela "Início", o aplicativo mostra qual é a próxima dose e quanto tempo falta para ela.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirme quando tomar',
    description:
      'Quando tomar o remédio, toque em "Já tomei". O aplicativo registra a dose e atualiza o próximo lembrete.',
  },
];

const NAVIGATION_ITEMS = [
  {
    icon: Pill,
    title: 'Remédios',
    description: 'Cadastre, consulte e altere seus medicamentos e horários.',
  },
  {
    icon: Clock3,
    title: 'Início',
    description: 'Veja o próximo remédio e acompanhe as doses do dia.',
  },
  {
    icon: Heart,
    title: 'Cuidados',
    description: 'Encontre orientações, registre suas medidas e consulte telefones importantes.',
  },
  {
    icon: Phone,
    title: 'Emergência',
    description: 'Dentro de "Cuidados", veja o SAMU (192) e outros contatos cadastrados.',
  },
];

const FAQ_ITEMS = [
  {
    title: 'Como altero um remédio?',
    description:
      'Abra "Remédios", encontre o medicamento e entre em "Detalhes" para editar as informações.',
  },
  {
    title: 'Como registro uma medida?',
    description:
      'Abra "Cuidados", entre em "Minhas medidas" e toque em "Registrar nova medida".',
  },
  {
    title: 'Onde encontro informações sobre um sintoma?',
    description:
      'Abra "Cuidados" e entre em "Orientações". Você encontrará situações comuns, sinais de alerta e fontes oficiais.',
  },
  {
    title: 'Onde encontro os telefones de emergência?',
    description:
      'Abra "Cuidados" e entre em "Emergência". O SAMU pode ser acionado pelo número 192.',
  },
];

export default function AjudaView() {
  return (
    <div className="space-y-6 pb-24 animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-[0.18em]">
          <BookOpenText className="w-4 h-4" />
          <span>Como usar</span>
        </div>
        <h1 className="mt-3 text-2xl font-black">Aprenda a usar o aplicativo</h1>
        <p className="mt-2 text-sm text-blue-100 leading-relaxed">
          Aqui você encontra as tarefas mais comuns. Para informações sobre sintomas e cuidados,
          use "Cuidados" &gt; "Orientações".
        </p>
      </div>

      <section>
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <CheckCircle2 className="w-4 h-4 text-blue-700" />
          Comece por aqui
        </div>

        <div className="mt-4 grid gap-4">
          {START_ITEMS.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="bg-white rounded-[1.75rem] border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                    Passo {index + 1}
                  </p>
                  <h2 className="mt-1 text-base font-extrabold text-slate-900">{title}</h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <ArrowRight className="w-4 h-4 text-blue-700" />
          Onde encontrar cada coisa
        </div>

        <div className="mt-4 grid gap-3">
          {NAVIGATION_ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
              <Icon className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Search className="w-4 h-4 text-blue-700" />
          Dúvidas rápidas
        </div>

        <div className="mt-4 space-y-3">
          {FAQ_ITEMS.map(({ title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-[2rem] bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2 text-blue-200 text-sm font-bold">
          <ShieldAlert className="w-4 h-4" />
          Importante
        </div>
        <p className="mt-3 text-base font-semibold leading-relaxed">
          O aplicativo ajuda a organizar seus cuidados, mas não substitui a orientação de um
          profissional de saúde.
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-200">
          <span>Em caso de emergência, use "Cuidados" &gt; "Emergência".</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </div>
      </div>
    </div>
  );
}
