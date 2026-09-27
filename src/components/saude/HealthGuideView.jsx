import { useMemo, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Phone,
  Droplets,
  Thermometer,
  Heart,
  Wind,
  Bone,
  Eye,
  Brain,
  Zap,
  Footprints,
  Apple,
  Moon,
} from 'lucide-react';

const GUIDE_TOPICS = [
  {
    id: 'dor-de-cabeca',
    icon: Brain,
    color: '#7c3aed',
    bg: '#f5f3ff',
    titulo: 'Dor de cabeça',
    resumo: 'Cabeça doendo, latejando ou pesada.',
    oQuePodeCausar:
      'Falta de água no corpo, tensão muscular, sono insuficiente, pressão alta, gripe ou sinusite.',
    oQueFazer:
      'Descanse num lugar calmo. Beba bastante água. Evite barulho e luz forte. Se tiver remédio indicado pelo médico, use conforme orientação.',
    sinaisDeAlerta:
      'Dor muito forte e repentina (a pior da vida), dor com febre alta, confusão mental, fraqueza em um lado do corpo ou dificuldade de falar. Nesses casos, ligue 192 (SAMU) imediatamente.',
    fonteOficial: {
      label: 'Saiba mais sobre dor de cabeça',
      url: 'https://www.gov.br/ebserh/pt-br/comunicacao/noticias/especialistas-da-rede-ebserh-apontam-sinais-de-alarme-quando-o-assunto-e-dor-de-cabeca',
    },
  },
  {
    id: 'febre',
    icon: Thermometer,
    color: '#dc2626',
    bg: '#fef2f2',
    titulo: 'Febre',
    resumo: 'Temperatura acima de 37,8 °C, corpo quente.',
    oQuePodeCausar:
      'Gripe, infecção, resfriado, infecção urinária ou outras causas. É o jeito do corpo lutar contra vírus e bactérias.',
    oQueFazer:
      'Beba muita água. Fique em repouso. Use roupas leves. Verifique a temperatura de hora em hora. Se o médico indicou, use o antitérmico conforme prescrito.',
    sinaisDeAlerta:
      'Febre acima de 39 °C, febre que dura mais de 2 dias, confusão mental, dificuldade para respirar, manchas na pele. Procure atendimento médico.',
    fonteOficial: {
      label: 'Ministério da Saúde — Saúde de A a Z',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
    },
  },
  {
    id: 'pressao-alta',
    icon: Heart,
    color: '#e11d48',
    bg: '#fff1f2',
    titulo: 'Pressão alta',
    resumo: 'Batimento forte, dor no pescoço, cabeça pesada.',
    oQuePodeCausar:
      'Estresse, sal em excesso, não tomar o remédio de pressão, emoções fortes, falta de sono.',
    oQueFazer:
      'Sente-se ou deite. Respire fundo e devagar. Evite esforço. Tome o remédio de pressão se foi prescrito. Meça a pressão e anote o valor.',
    sinaisDeAlerta:
      'Pressão muito alta (acima de 180×110), dor no peito, falta de ar, confusão, fraqueza em um lado do corpo, rosto caído, fala travada. Ligue 192 imediatamente.',
    fonteOficial: {
      label: 'Saiba mais sobre hipertensão',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/h/hipertensao',
    },
  },
  {
    id: 'tontura',
    icon: Zap,
    color: '#d97706',
    bg: '#fffbeb',
    titulo: 'Tontura',
    resumo: 'Sensação de girar, cabeça leve, instabilidade.',
    oQuePodeCausar:
      'Levantar rápido demais, desidratação, pressão baixa, labirintite, falta de açúcar no sangue ou algum remédio.',
    oQueFazer:
      'Sente-se imediatamente para evitar queda. Beba água devagar. Levante sempre devagar, apoiando em algo. Não dirija.',
    sinaisDeAlerta:
      'Desmaio, tontura com vômito muito forte, zumbido no ouvido repentino, dificuldade para andar ou falar. Procure atendimento médico.',
    fonteOficial: {
      label: 'Ministério da Saúde — Saúde de A a Z',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
    },
  },
  {
    id: 'falta-ar',
    icon: Wind,
    color: '#0891b2',
    bg: '#ecfeff',
    titulo: 'Falta de ar',
    resumo: 'Dificuldade para respirar, cansaço ao falar.',
    oQuePodeCausar:
      'Asma, bronquite, problema no coração, anemia, ansiedade, gripe forte ou reação a algum remédio.',
    oQueFazer:
      'Sente-se ereto, inclinado ligeiramente para frente. Tente respirar devagar pelo nariz. Evite esforço. Use o inalador se for prescrito.',
    sinaisDeAlerta:
      'Lábios ou unhas roxos, não conseguir completar frases, falta de ar em repouso. Ligue 192 imediatamente.',
    fonteOficial: {
      label: 'Ministério da Saúde — Saúde de A a Z',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
    },
  },
  {
    id: 'dor-peito',
    icon: Heart,
    color: '#dc2626',
    bg: '#fef2f2',
    titulo: 'Dor no peito',
    resumo: 'Aperto, queimação ou peso no peito.',
    oQuePodeCausar:
      'Problemas no coração, azia, gastrite, ansiedade, tensão muscular ou outras causas.',
    oQueFazer:
      'Sente-se ou deite. Não faça esforço. Chame alguém que esteja perto. Se tiver nitroglicerina prescrita, use conforme orientação médica.',
    sinaisDeAlerta:
      'Dor no peito com suor frio, falta de ar, dor que vai para o braço esquerdo ou mandíbula, palidez, desmaio. Ligue 192 imediatamente — pode ser infarto.',
    fonteOficial: {
      label: 'Saiba mais sobre dor no peito',
      url: 'https://linhasdecuidado.saude.gov.br/portal/dor-toracica/sou-paciente/',
    },
  },
  {
    id: 'dor-nas-juntas',
    icon: Bone,
    color: '#059669',
    bg: '#ecfdf5',
    titulo: 'Dor nas juntas',
    resumo: 'Dor nos joelhos, quadris, mãos ou coluna.',
    oQuePodeCausar:
      'Artrite, artrose, reumatismo, sobrecarga, frio intenso ou falta de movimento ao longo do dia.',
    oQueFazer:
      'Descanse a articulação dolorida. Aplique calor (bolsa de água quente) se não houver inchaço. Evite movimentos bruscos. Use os remédios prescritos pelo médico.',
    sinaisDeAlerta:
      'Inchaço grande e vermelhidão, febre na junta, dor que impede qualquer movimento ou piora muito de repente. Procure seu médico.',
    fonteOficial: {
      label: 'Ministério da Saúde — Saúde de A a Z',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
    },
  },
  {
    id: 'enjoo',
    icon: Droplets,
    color: '#7c3aed',
    bg: '#f5f3ff',
    titulo: 'Enjoo e vômito',
    resumo: 'Estômago embrulhado, vontade de vomitar.',
    oQuePodeCausar:
      'Alimentação pesada, viagem, infecção intestinal, efeito colateral de remédio, pressão baixa.',
    oQueFazer:
      'Coma de forma leve (torrada, arroz, maçã). Beba água em pequenos goles. Descanse em ambiente arejado. Evite alimentos gordurosos.',
    sinaisDeAlerta:
      'Vômito com sangue, não conseguir beber água por mais de 6 horas, sinais de desidratação (boca muito seca, urina escura). Procure atendimento.',
    fonteOficial: {
      label: 'Ministério da Saúde — Saúde de A a Z',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z',
    },
  },
  {
    id: 'queda',
    icon: Footprints,
    color: '#b45309',
    bg: '#fef9c3',
    titulo: 'Queda',
    resumo: 'Caiu ou está com medo de cair.',
    oQuePodeCausar:
      'Tapete solto, piso escorregadio, óculos desatualizados, remédio que causa tontura, fraqueza nas pernas.',
    oQueFazer:
      'Não tente levantar sozinho com pressa. Chame alguém para ajudar. Verifique se há dor intensa antes de se mover. Remova tapetes e objetos no chão de casa.',
    sinaisDeAlerta:
      'Dor intensa em alguma parte do corpo após a queda, inchaço, deformidade, incapacidade de apoiar o peso. Vá ao pronto-socorro.',
    fonteOficial: {
      label: 'Saiba mais sobre prevenção de quedas',
      url: 'https://www.gov.br/saude/pt-br/composicao/saes/seguranca-do-paciente/protocolos-de-seguranca-do-paciente/protocolo-de-prevencao-de-quedas/view',
    },
  },
  {
    id: 'visao-turva',
    icon: Eye,
    color: '#0284c7',
    bg: '#f0f9ff',
    titulo: 'Visão turva',
    resumo: 'Visão embaçada, escura ou com pontos.',
    oQuePodeCausar:
      'Pressão alta, diabetes, glaucoma, catarata, olho seco ou necessidade de trocar os óculos.',
    oQueFazer:
      'Sente-se em lugar seguro. Evite dirigir ou caminhar em lugares sem apoio. Anote quando a alteração começou.',
    sinaisDeAlerta:
      'Perda súbita de visão em um olho, visão dupla repentina, flashes de luz ou sombra preta cobrindo parte do campo visual. Vá ao pronto-socorro urgente.',
    fonteOficial: {
      label: 'Saiba mais sobre doenças oculares',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/d/doencas-oculares',
    },
  },
  {
    id: 'insonia',
    icon: Moon,
    color: '#4f46e5',
    bg: '#eef2ff',
    titulo: 'Dificuldade para dormir',
    resumo: 'Não consegue dormir bem, acorda muito.',
    oQuePodeCausar:
      'Ansiedade, dor crônica, cafeína à noite, ambiente claro ou barulhento, efeito de algum remédio.',
    oQueFazer:
      'Mantenha um horário fixo para dormir e acordar. Evite cafeína após as 15h. Deixe o quarto escuro e fresco. Não use celular antes de dormir.',
    sinaisDeAlerta:
      'Sono muito ruim por mais de 2 semanas, sonolência excessiva durante o dia, paradas na respiração durante o sono. Converse com seu médico.',
    fonteOficial: {
      label: 'Saiba mais sobre insônia e sono',
      url: 'https://www.gov.br/hubrasil/pt-br/hospitais-universitarios/regiao-nordeste/ch-ufc_old/dormir-bem-influencia-na-producao-hormonal-e-fortalece-a-cognicao',
    },
  },
  {
    id: 'prisao-de-ventre',
    icon: Droplets,
    color: '#92400e',
    bg: '#fffbeb',
    titulo: 'Prisão de ventre',
    resumo: 'Fezes duras, esforço ou dificuldade para evacuar.',
    oQuePodeCausar:
      'Pouca água, pouca fibra, pouca atividade física, alguns medicamentos ou alterações do intestino.',
    oQueFazer:
      'Beba água ao longo do dia, mantenha uma alimentação com fibras e movimente-se dentro do que for seguro para você. Se o problema persistir, converse com sua equipe de saúde.',
    sinaisDeAlerta:
      'Dor abdominal forte, vômitos, barriga muito inchada, sangue nas fezes ou incapacidade de evacuar e eliminar gases. Procure atendimento médico.',
    fonteOficial: {
      label: 'Saiba mais sobre constipação intestinal',
      url: 'https://bvsms.saude.gov.br/constipacao-intestinal/',
    },
  },
  {
    id: 'perda-de-urina',
    icon: Droplets,
    color: '#0369a1',
    bg: '#f0f9ff',
    titulo: 'Perda de urina',
    resumo: 'Urina escapa sem conseguir segurar ou chegar ao banheiro.',
    oQuePodeCausar:
      'Alterações urinárias, doenças, medicamentos e dificuldades de mobilidade ou de chegar ao banheiro a tempo.',
    oQueFazer:
      'Anote quando os escapes acontecem e converse com sua equipe de saúde. Não esconda o problema: existem causas tratáveis e formas de cuidado.',
    sinaisDeAlerta:
      'Incapacidade súbita de urinar, sangue na urina, febre, dor forte ou confusão repentina. Procure atendimento médico.',
    fonteOficial: {
      label: 'Saiba mais sobre incontinência urinária',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa',
    },
  },
  {
    id: 'confusao-memoria',
    icon: Brain,
    color: '#6d28d9',
    bg: '#f5f3ff',
    titulo: 'Confusão ou esquecimento',
    resumo: 'Esquece coisas importantes, fica desorientado ou confuso.',
    oQuePodeCausar:
      'Alterações de memória podem ter diferentes causas. Mudanças rápidas também podem estar relacionadas a dor, infecção, desidratação ou reação a medicamentos.',
    oQueFazer:
      'Anote quando começou e quais mudanças foram percebidas. Avise um familiar ou pessoa de confiança e procure sua equipe de saúde para avaliação.',
    sinaisDeAlerta:
      'Confusão que começou de repente, sonolência intensa, agitação incomum, dificuldade para falar, fraqueza de um lado do corpo ou perda de consciência. Ligue 192 imediatamente.',
    fonteOficial: {
      label: 'Saiba mais sobre demências',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/alzheimer-e-outras-demencias',
    },
  },
  {
    id: 'dificuldade-engolir',
    icon: Droplets,
    color: '#0f766e',
    bg: '#f0fdfa',
    titulo: 'Dificuldade para engolir',
    resumo: 'Engasga, tosse ao comer ou sente dificuldade para engolir.',
    oQuePodeCausar:
      'Alterações da mastigação e deglutição podem acontecer por diferentes condições e precisam ser avaliadas pela equipe de saúde.',
    oQueFazer:
      'Coma sentado e devagar. Não force alimentos que provocam engasgos. Informe a equipe de saúde para avaliar a dificuldade de engolir.',
    sinaisDeAlerta:
      'Engasgo com dificuldade para respirar, lábios arroxeados ou incapacidade de engolir líquidos. Ligue 192 imediatamente.',
    fonteOficial: {
      label: 'Orientações sobre dificuldade para engolir',
      url: 'https://bvsms.saude.gov.br/20-3-dia-nacional-de-atencao-a-disfagia-2026/',
    },
  },
  {
    id: 'saude-bucal',
    icon: Heart,
    color: '#be123c',
    bg: '#fff1f2',
    titulo: 'Dor ou problema na boca',
    resumo: 'Dor de dente, gengiva sangrando, prótese solta ou ferida.',
    oQuePodeCausar:
      'Problemas nos dentes, gengivas, próteses ou outras alterações da boca.',
    oQueFazer:
      'Mantenha a higiene da boca e procure atendimento odontológico para avaliar a causa. Não ignore feridas que não cicatrizam.',
    sinaisDeAlerta:
      'Inchaço importante, dificuldade para respirar ou engolir, sangramento que não para ou ferida na boca que não cicatriza em até 15 dias. Procure atendimento.',
    fonteOficial: {
      label: 'Saiba mais sobre saúde bucal',
      url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/saude-bucal',
    },
  },
  {
    id: 'alimentacao',
    icon: Apple,
    color: '#16a34a',
    bg: '#f0fdf4',
    titulo: 'Alimentação e hidratação',
    resumo: 'Não está comendo ou bebendo água direito.',
    oQuePodeCausar:
      'Falta de apetite, dificuldade para mastigar, solidão, tristeza ou esquecimento.',
    oQueFazer:
      'Beba pelo menos 6 a 8 copos de água por dia, mesmo sem sede. Coma em horários fixos. Prefira alimentos macios e nutritivos. Frutas e legumes são ótimas opções.',
    sinaisDeAlerta:
      'Perda de peso sem querer, boca muito seca, confusão mental por falta de água ou alimento, desmaio. Procure atendimento médico.',
    fonteOficial: {
      label: 'Saiba mais sobre os Guias Alimentares',
      url: 'https://www.gov.br/saude/pt-br/composicao/saps/promocao-da-saude/guias-alimentares',
    },
  },
];

function TopicCard({ topic, isSelected, onClick }) {
  const Icon = topic.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition-all duration-200"
      style={{
        background: isSelected ? topic.color : '#ffffff',
        border: `2px solid ${isSelected ? topic.color : '#e2e8f0'}`,
        borderRadius: '20px',
        padding: '18px 20px',
        boxShadow: isSelected
          ? `0 8px 20px ${topic.color}40`
          : '0 2px 6px rgba(0,0,0,0.06)',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            background: isSelected ? 'rgba(255,255,255,0.25)' : topic.bg,
            borderRadius: '14px',
            width: '52px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon
            style={{
              width: '26px',
              height: '26px',
              color: isSelected ? '#ffffff' : topic.color,
            }}
            strokeWidth={2}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: isSelected ? '#ffffff' : '#0f172a',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {topic.titulo}
          </p>
          <p
            style={{
              fontSize: '14px',
              color: isSelected ? 'rgba(255,255,255,0.85)' : '#64748b',
              margin: '3px 0 0',
              lineHeight: 1.4,
            }}
          >
            {topic.resumo}
          </p>
        </div>
        <div
          style={{
            color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
            flexShrink: 0,
          }}
        >
          {isSelected ? (
            <ChevronUp style={{ width: '22px', height: '22px' }} />
          ) : (
            <ChevronDown style={{ width: '22px', height: '22px' }} />
          )}
        </div>
      </div>

      {isSelected && (
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 8px',
              }}
            >
              O que pode causar?
            </p>
            <p style={{ fontSize: '15px', color: '#ffffff', margin: 0, lineHeight: 1.6 }}>
              {topic.oQuePodeCausar}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 8px',
              }}
            >
              O que fazer agora?
            </p>
            <p style={{ fontSize: '15px', color: '#ffffff', margin: 0, lineHeight: 1.6 }}>
              {topic.oQueFazer}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '14px',
              padding: '16px',
              border: '2px solid rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#fde68a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
              >
                Quando procurar atendimento?
              </p>
            </div>
            <p style={{ fontSize: '15px', color: '#fef9c3', margin: 0, lineHeight: 1.6 }}>
              {topic.sinaisDeAlerta}
            </p>
          </div>

          <a
            href={topic.fonteOficial.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <ShieldCheck style={{ width: '18px', height: '18px' }} />
            {topic.fonteOficial.label}
          </a>
        </div>
      )}
    </button>
  );
}

export default function HealthGuideView() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return GUIDE_TOPICS;
    return GUIDE_TOPICS.filter(
      (item) =>
        item.titulo.toLowerCase().includes(term) ||
        item.resumo.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        paddingBottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
      className="animate-fade-in"
    >

      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0891b2 100%)',
          borderRadius: '24px',
          padding: '28px 24px',
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(8,145,178,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <ShieldCheck style={{ width: '28px', height: '28px', color: '#a7f3d0' }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#a7f3d0',
            }}
          >
            Guia de Saúde
          </span>
        </div>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 900,
            margin: '0 0 6px',
            lineHeight: 1.2,
            color: '#ffffff',
          }}
        >
          O que você está sentindo?
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.5 }}>
          Toque no sintoma para ver o que fazer.
        </p>
      </div>

      <a
        href="tel:192"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          borderRadius: '20px',
          padding: '20px',
          color: '#ffffff',
          textDecoration: 'none',
          fontWeight: 900,
          fontSize: '20px',
          boxShadow: '0 8px 20px rgba(220,38,38,0.4)',
          letterSpacing: '0.02em',
        }}
      >
        <Phone style={{ width: '28px', height: '28px' }} />
        Emergência — Ligar 192 (SAMU)
      </a>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍  Buscar sintoma..."
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            background: '#ffffff',
            color: '#0f172a',
            boxSizing: 'border-box',
            outline: 'none',
            fontWeight: 600,
          }}
        />
      </div>

      {filteredTopics.length === 0 ? (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '20px',
            padding: '32px 24px',
            textAlign: 'center',
            border: '2px dashed #cbd5e1',
          }}
        >
          <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
            Nenhum sintoma encontrado para "{searchTerm}".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isSelected={selectedId === topic.id}
              onClick={() => handleSelect(topic.id)}
            />
          ))}
        </div>
      )}

      <div
        style={{
          background: '#f0fdf4',
          border: '2px solid #bbf7d0',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: '#166534',
            margin: 0,
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          📋 Este guia é apenas informativo. Sempre siga as orientações do seu médico e da equipe de saúde.
        </p>
      </div>
    </div>
  );
}
