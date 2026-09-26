import React from 'react';
import { BookOpenText, Clock3, BellRing, CheckCircle2, Pill, Search, ArrowRight, ShieldAlert } from 'lucide-react';

const HELP_ITEMS = [
  {
    icon: Pill,
    title: 'Adicionar meu remédio',
    description: 'Escreva o nome, escolha a dose e o horário. O lembrete é criado automaticamente.',
  },
  {
    icon: Clock3,
    title: 'Fazer o que precisa agora',
    description: 'A tela inicial mostra o próximo remédio e o tempo que falta para ele.',
  },
  {
    icon: BellRing,
    title: 'Receber aviso no horário',
    description: 'Quando chega a hora, o app faz um alerta visual e toca para chamar atenção.',
  },
  {
    icon: CheckCircle2,
    title: 'Registrar que tomou',
    description: 'Toque em “Já tomei” para confirmar a dose e ver o próximo lembrete.',
  },
];

const FAQ_ITEMS = [
  'A tela inicial mostra sempre o próximo remédio e o que falta para ele.',
  'Se não existir medicamento, o app mostra um estado vazio e pede para você adicionar o primeiro.',
  'Para adicionar um remédio, basta preencher nome, dose e horário. O lembrete é criado no mesmo passo.',
  'Quando chegar a hora, o app toca e mostra um alerta grande para você confirmar a dose.',
];

export default function AjudaView() {
  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase tracking-[0.18em]">
          <BookOpenText className="w-4 h-4" />
          <span>Ajuda</span>
        </div>
        <h1 className="mt-3 text-2xl font-black">Como usar o DoseFácil</h1>
        <p className="mt-2 text-sm text-blue-100">
          Em poucos passos, o aplicativo mostra o que você precisa fazer agora.
        </p>
      </div>

      <div className="grid gap-4">
        {HELP_ITEMS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-white rounded-[1.75rem] border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Search className="w-4 h-4 text-blue-700" />
          Dúvidas rápidas
        </div>

        <div className="mt-4 space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                {index + 1}
              </div>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2 text-blue-200 text-sm font-bold">
          <ShieldAlert className="w-4 h-4" />
          Importante
        </div>
        <p className="mt-3 text-base font-semibold leading-relaxed">
          O app foi pensado para reduzir dúvidas, não para exigir treino. Se ficar em dúvida, volte para a tela inicial: ela mostra o próximo passo.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-200">
          <span>Voltar para Início</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
