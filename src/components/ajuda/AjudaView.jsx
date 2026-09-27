import {
  BookOpenText,
  Clock3,
  BellRing,
  CheckCircle2,
  Pill,
  Search,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
  Heart,
  Phone,
} from 'lucide-react';

const HELP_ITEMS = [
  {
    icon: Pill,
    title: 'Adicionar meu remédio',
    description:
      'Vá na aba "Remédios", toque em "Adicionar medicamento", escreva o nome e o horário. O lembrete é criado automaticamente.',
  },
  {
    icon: Clock3,
    title: 'Ver o que tomar agora',
    description:
      'A tela inicial mostra o próximo remédio e quanto tempo falta. Você não precisa decorar nada.',
  },
  {
    icon: BellRing,
    title: 'Receber aviso no horário',
    description:
      'Quando chega a hora, o app faz um alerta para chamar atenção. Fique com o celular por perto.',
  },
  {
    icon: CheckCircle2,
    title: 'Confirmar que tomou',
    description:
      'Toque em "Já tomei" para confirmar a dose. O app registra e mostra o próximo lembrete.',
  },
  {
    icon: Heart,
    title: 'Registrar pressão e peso',
    description:
      'Na aba "Saúde", toque em "Diário" para anotar sua pressão, glicemia e peso do dia.',
  },
  {
    icon: Phone,
    title: 'Ligar para emergência',
    description:
      'Na aba "Saúde", toque em "Contatos" para ver o SAMU (192) e adicionar o número do seu médico ou de um familiar.',
  },
];

const FAQ_ITEMS = [
  'A tela inicial mostra sempre o próximo remédio e o tempo que falta para ele.',
  'Para adicionar um remédio, vá na aba "Remédios" e toque no botão azul "Adicionar medicamento".',
  'Quando chegar a hora do remédio, o app toca e mostra um aviso grande.',
  'Para registrar que tomou o remédio, toque em "Já tomei" na tela inicial.',
  'Se errar algum dado, entre na aba "Remédios", localize o remédio e toque em "Detalhes" para ver as opções.',
];

const OFFICIAL_LINKS = [
  {
    title: 'Ministério da Saúde',
    description: 'Informações oficiais sobre saúde, doenças e cuidados.',
    url: 'https://www.gov.br/saude/pt-br',
    color: '#0891b2',
    bg: '#ecfeff',
  },
  {
    title: 'ANVISA — Consulta de Medicamentos',
    description: 'Verifique se seu remédio é registrado e veja a bula oficial.',
    url: 'https://consultas.anvisa.gov.br/#/bulario/',
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    title: 'Disque Saúde — 136',
    description:
      'Ligue 136 para tirar dúvidas de saúde gratuitamente com profissionais do governo.',
    url: 'tel:136',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
];

export default function AjudaView() {
  return (
    <div className="space-y-6 pb-24 animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>

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
          <div
            key={title}
            className="bg-white rounded-[1.75rem] border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{description}</p>
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
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700 shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900 mb-4">
          <ExternalLink className="w-4 h-4 text-emerald-600" />
          Fontes oficiais de saúde
        </div>

        <div className="space-y-3">
          {OFFICIAL_LINKS.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target={link.url.startsWith('tel:') ? '_self' : '_blank'}
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: link.bg,
                border: `1.5px solid ${link.color}30`,
                borderRadius: '16px',
                padding: '14px 16px',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  background: link.color,
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ExternalLink style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                  {link.title}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  {link.description}
                </p>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: link.color, flexShrink: 0 }} />
            </a>
          ))}
        </div>

        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            margin: '16px 0 0',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          📋 As informações deste app não substituem a orientação do seu médico.
        </p>
      </div>

      <div className="rounded-[2rem] bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2 text-blue-200 text-sm font-bold">
          <ShieldAlert className="w-4 h-4" />
          Importante
        </div>
        <p className="mt-3 text-base font-semibold leading-relaxed">
          O app foi pensado para reduzir dúvidas. Se ficar em dúvida, volte para a tela inicial: ela
          sempre mostra o próximo passo.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-200">
          <span>Voltar para Início</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
