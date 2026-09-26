export const OFFICIAL_MEDICINES = [
  {
    id: 'off-1',
    nome: 'Paracetamol',
    principioAtivo: 'Paracetamol',
    apresentacoes: ['Comprimido 500mg', 'Comprimido 750mg', 'Gotas 200mg/mL'],
    indicacoes:
      'Indicado para a redução da febre e para o alívio temporário de dores leves a moderadas, tais como: dores associadas a gripes e resfriados comuns, dor de cabeça, dor de dente, dor de garganta e dores musculares.',
    contraindicacoes:
      'Contraindicado para pacientes com hipersensibilidade conhecida ao paracetamol ou a qualquer componente da fórmula. Contraindicado em casos de doença hepática grave ou insuficiência hepática grave.',
    advertencias:
      'Não exceder a dose recomendada de 4000mg por dia. O uso prolongado ou em doses elevadas pode causar lesão hepática grave. Evitar o consumo de bebidas alcoólicas durante o uso.',
    interacoes:
      'Pode interagir com anticoagulantes orais (como varfarina), medicamentos indutores de enzimas hepáticas (como carbamazepina, fenobarbital) e álcool.',
    efeitosAdversos:
      'Raros: reações alérgicas cutâneas, urticária, erupção cutânea, náuseas, diminuição de plaquetas no sangue.',
    armazenamento:
      'Conservar em temperatura ambiente (15°C a 30°C), protegido da luz e da umidade.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Paracetamol',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2023-05-15',
      updatedAt: '2024-01-10',
      retrievedAt: '2026-09-25',
    },
  },
  {
    id: 'off-2',
    nome: 'Amoxicilina',
    principioAtivo: 'Amoxicilina tri-hidratada',
    apresentacoes: ['Cápsulas 500mg', 'Comprimidos 875mg', 'Suspensão oral 250mg/5mL'],
    indicacoes:
      'Antibiótico indicado para o tratamento de infecções bacterianas causadas por germes sensíveis à amoxicilina, como infecções das vias respiratórias superiores e inferiores, infecções urinárias e de pele.',
    contraindicacoes:
      'Contraindicado para pacientes com história de hipersensibilidade às penicilinas ou a qualquer antibiótico beta-lactâmico (como cefalosporinas).',
    advertencias:
      'Utilizar estritamente pelo período recomendado pelo médico mesmo com a melhora dos sintomas, para evitar o surgimento de bactérias resistentes. Pode causar reações anafiláticas graves.',
    interacoes:
      'Pode reduzir a eficácia de anticoncepcionais orais combinados. Interage com alopurinol e probenecida.',
    efeitosAdversos:
      'Frequentes: diarreia, náuseas, erupções cutâneas. Raros: candidíase mucocutânea, alteração na coloração dos dentes em crianças (com uso da suspensão).',
    armazenamento:
      'Manter a embalagem fechada, em temperatura ambiente (15°C a 30°C). Após reconstituição, a suspensão oral deve ser mantida sob refrigeração.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Amoxicilina',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2022-11-20',
      updatedAt: '2024-03-01',
      retrievedAt: '2026-09-25',
    },
  },
  {
    id: 'off-3',
    nome: 'Losartana',
    principioAtivo: 'Losartana potássica',
    apresentacoes: ['Comprimidos revestidos 50mg', 'Comprimidos revestidos 100mg'],
    indicacoes:
      'Indicado para o tratamento da hipertensão arterial (pressão alta), redução do risco de morbidade e mortalidade cardiovascular em pacientes hipertensos com hipertrofia ventricular esquerda, e proteção renal em diabéticos tipo 2.',
    contraindicacoes:
      'Contraindicado para pacientes com hipersensibilidade à losartana potássica. Contraindicado na gravidez (segundo e terceiro trimestres) e em combinação com alisquireno em pacientes com diabetes.',
    advertencias:
      'Pode causar hipotensão ortostática e alteração da função renal em pacientes suscetíveis. Monitorar níveis de potássio sérico periodicamente.',
    interacoes:
      'Interage com diuréticos poupadores de potássio, suplementos de potássio, anti-inflamatórios não esteroides (AINEs) e lítio.',
    efeitosAdversos:
      'Tontura, hipotensão, fadiga, vertigem, hipercalemia (aumento de potássio no sangue).',
    armazenamento:
      'Conservar em temperatura ambiente (15°C a 30°C), em lugar seco e ao abrigo da luz.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Losartana Potássica',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2023-08-10',
      updatedAt: '2024-02-18',
      retrievedAt: '2026-09-25',
    },
  },
  {
    id: 'off-4',
    nome: 'Metformina',
    principioAtivo: 'Cloridrato de metformina',
    apresentacoes: ['Comprimidos 500mg', 'Comprimidos 850mg', 'Comprimidos de ação prolongada (XR) 500mg'],
    indicacoes:
      'Indicado para o tratamento do diabetes mellitus tipo 2, isoladamente ou em combinação com outros antidiabéticos orais ou insulina.',
    contraindicacoes:
      'Contraindicado em pacientes com cetoacidose diabética, pré-coma diabético, insuficiência renal grave (RFG < 30 mL/min), insuficiência hepática ou condições agudas com potencial de alterar a função renal.',
    advertencias:
      'Risco raro porém grave de acidose láctica. O tratamento deve ser suspenso temporariamente em exames que utilizem contraste iodado.',
    interacoes:
      'Álcool aumenta o risco de acidose láctica. Cimetidina e agentes de contraste iodados exigem cautela e pausa temporária do medicamento.',
    efeitosAdversos:
      'Desconforto gastrintestinal (náuseas, diarreia, dor abdominal, perda de apetite), diminuição da absorção de vitamina B12 com uso continuado.',
    armazenamento:
      'Manter em temperatura ambiente (15°C a 30°C), protegido da umidade.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Cloridrato de Metformina',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2023-01-05',
      updatedAt: '2024-04-12',
      retrievedAt: '2026-09-25',
    },
  },
  {
    id: 'off-5',
    nome: 'Omeprazol',
    principioAtivo: 'Omeprazol',
    apresentacoes: ['Cápsulas com microgrânulos gastrorresistentes 20mg', 'Cápsulas 40mg'],
    indicacoes:
      'Indicado para tratamento de úlceras gástricas e duodenais, esofagite de refluxo, síndrome de Zollinger-Ellison e erradicação do Helicobacter pylori (em associação com antibióticos).',
    contraindicacoes:
      'Contraindicado a pacientes com hipersensibilidade conhecida ao omeprazol, a benzimidazóis substituídos ou a qualquer componente da fórmula.',
    advertencias:
      'O tratamento prolongado (mais de 1 ano) pode aumentar o risco de fraturas ósseas e hipomagnesemia. Administrar preferencialmente pela manhã em jejum.',
    interacoes:
      'Pode alterar a absorção de medicamentos dependentes do pH gástrico (como cetoconazol, atazanavir) e interagir com clopidogrel e diazepam.',
    efeitosAdversos:
      'Cefaleia, dor abdominal, constipação, diarreia, flatulência, náuseas ou vômitos.',
    armazenamento:
      'Conservar em temperatura ambiente (15°C a 30°C), protegido da luz e da umidade.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Omeprazol',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2023-04-18',
      updatedAt: '2024-05-22',
      retrievedAt: '2026-09-25',
    },
  },
  {
    id: 'off-6',
    nome: 'Dipirona',
    principioAtivo: 'Dipirona monoidratada',
    apresentacoes: ['Comprimidos 500mg', 'Comprimidos 1g', 'Solução gotas 500mg/mL'],
    indicacoes:
      'Indicado como analgésico e antitérmico para o tratamento de dores e febre.',
    contraindicacoes:
      'Contraindicado em pacientes com hipersensibilidade à dipirona ou a outras pirazolonas, função da medula óssea prejudicada, broncoespasmo induzido por analgésicos e durante o terceiro trimestre de gravidez.',
    advertencias:
      'Pode causar agranulocitose (diminuição acentuada de glóbulos brancos), complicação rara porém grave. Em caso de febre alta sem causa aparente ou dor de garganta persistente, suspender o uso.',
    interacoes:
      'Pode reduzir os níveis plasmáticos de ciclosporina e bupropiona. Interage com álcool.',
    efeitosAdversos:
      'Reações hipotensivas, reações alérgicas cutâneas, urina avermelhada (devido a metabólito inofensivo).',
    armazenamento:
      'Manter em temperatura ambiente (15°C a 30°C), protegido da luz.',
    fonteOficial: {
      source: 'ANVISA',
      sourceName: 'Agência Nacional de Vigilância Sanitária',
      documentTitle: 'Bula do Paciente - Dipirona Monoidratada',
      sourceUrl: 'https://consultas.anvisa.gov.br/#/bulario/',
      publishedAt: '2023-09-12',
      updatedAt: '2024-02-05',
      retrievedAt: '2026-09-25',
    },
  },
];
