import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck, ExternalLink, AlertTriangle, FileText } from 'lucide-react';

const GUIDE_TOPICS = [
  {
    id: 'dor-de-cabeca',
    titulo: 'Dor de cabeça',
    resumo: 'A dor de cabeça pode ter diferentes causas. O que você pode fazer depende da intensidade, frequência e dos sintomas associados.',
    oQuePodeCausar: 'Tensão, sono insuficiente, enjoo, febre, sinusite, pressão alta ou outras causas específicas.',
    oQueFazer: 'Descanse em ambiente tranquilo, beba água, evite esforço excessivo e siga a orientação da pessoa responsável se houver prescrição ou acompanhamento médico.',
    sinaisDeAlerta: 'Dor intensa e súbita, febre alta, desmaio, fraqueza, confusão, vômitos persistentes ou piora rápida. Procure atendimento.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
  {
    id: 'febre',
    titulo: 'Febre',
    resumo: 'A febre pode ser um sinal da resposta do corpo a uma infecção ou a outra causa temporária.',
    oQuePodeCausar: 'Infecções virais ou bacterianas, ambiente quente, desidratação ou outras causas temporárias.',
    oQueFazer: 'Beba água, observe a temperatura e repouse. Se a febre for alta ou persistente, procure orientação profissional.',
    sinaisDeAlerta: 'Febre alta associada a confusão, dificuldade para respirar, rigidez no pescoço ou dores fortes. Procure atendimento imediatamente.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
  {
    id: 'resfriado',
    titulo: 'Resfriado',
    resumo: 'Sintomas comuns de resfriado costumam melhorar com descanso, hidratação e acompanhamento de sinais de agravamento.',
    oQuePodeCausar: 'Vírus que afetam o trato respiratório superior.',
    oQueFazer: 'Mantenha hidratação, descanse e evite esforço físico. Evite compartilhar objetos de uso pessoal.',
    sinaisDeAlerta: 'Dificuldade para respirar, febre muito alta, dor forte no peito ou piora contínua. Procure atendimento.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
  {
    id: 'pressao-alta',
    titulo: 'Pressão alta',
    resumo: 'A pressão alta pode acontecer por diversos fatores e pode exigir cuidado se houver sintomas fortes.',
    oQuePodeCausar: 'Estresse, excesso de sal, sono insuficiente, obesidade ou uso de alguns remédios.',
    oQueFazer: 'Descanse, reduza a carga de estresse e siga a orientação da pessoa responsável pelo tratamento. Veja se há sinais de piora.',
    sinaisDeAlerta: 'Dor forte no peito, falta de ar, confusão, desmaio ou pressão muito alta e persistente. Procure atendimento.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
  {
    id: 'tontura',
    titulo: 'Tontura',
    resumo: 'A tontura pode acontecer por mudança de posição, desidratação, sono ruim ou outra causa simples.',
    oQuePodeCausar: 'Ficar em pé rápido, desidratação, ansiedade, sono baixo ou algum remédio.',
    oQueFazer: 'Sente-se devagar, beba água e evite ficar de pé muito rápido. Se continuar, procure orientação.',
    sinaisDeAlerta: 'Desmaio, fraqueza intensa, confusão, dor no peito ou dificuldade para andar. Procure atendimento.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
  {
    id: 'enjoo',
    titulo: 'Enjoo',
    resumo: 'O enjoo pode ser por alimentação, movimento, infeccao, ou outro motivo temporário.',
    oQuePodeCausar: 'Comer muito rápido, viagem, mal-estar gástrico, febre ou outras causas temporárias.',
    oQueFazer: 'Beba água aos poucos, coma leve e descanse em ambiente tranquilo.',
    sinaisDeAlerta: 'Vomito constante, dor forte no abdômen, febre alta ou desidratação. Procure atendimento.',
    fonte: 'Ministério da Saúde',
    link: 'https://www.gov.br/saude/pt-br',
  },
];

export default function HealthGuideView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(GUIDE_TOPICS[0]);

  const filteredTopics = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return GUIDE_TOPICS;
    return GUIDE_TOPICS.filter((item) => item.titulo.toLowerCase().includes(term));
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4" />
          <span>Guia de saúde</span>
        </div>
        <h1 className="mt-3 text-2xl font-black text-slate-900">O que você está sentindo?</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite um problema como dor de cabeça"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            Nenhum tema encontrado para essa busca.
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`w-full text-left rounded-3xl border p-4 transition-colors ${
                selectedTopic.id === topic.id
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <p className="text-lg font-extrabold text-slate-900">{topic.titulo}</p>
              <p className="mt-1 text-sm text-slate-600">{topic.resumo}</p>
            </button>
          ))
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Informação de saúde</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">{selectedTopic.titulo}</h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <p className="font-extrabold text-slate-900 mb-1">O que pode causar?</p>
            <p>{selectedTopic.oQuePodeCausar}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <p className="font-extrabold text-slate-900 mb-1">O que você pode fazer?</p>
            <p>{selectedTopic.oQueFazer}</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Quando procurar atendimento?
            </p>
            <p>{selectedTopic.sinaisDeAlerta}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Fonte</p>
          <p className="mt-2 text-base font-bold text-slate-900">{selectedTopic.fonte}</p>
          <a
            href={selectedTopic.link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
          >
            <FileText className="w-4 h-4" />
            Ver fonte oficial
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
