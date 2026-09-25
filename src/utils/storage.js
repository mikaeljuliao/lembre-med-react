import { generateDosesForDate } from './businessLogic';

const STORAGE_KEYS = {
  MEDICATIONS: 'dosefacil_medications',
  TREATMENTS: 'dosefacil_treatments',
  DOSES: 'dosefacil_doses',
  HISTORY: 'dosefacil_history',
};

const INITIAL_MEDICATIONS = [
  {
    id: 'med-1',
    nome: 'Losartana',
    principioAtivo: 'Losartana Potássica',
    apresentacao: 'Comprimido',
    concentracao: '50mg',
    unidade: 'comprimidos',
    quantidadeEstoque: 14,
    alertaEstoqueMinimo: 7,
    validade: '2027-06-30',
    observacoes: 'Tomar pela manhã em jejum ou com água.',
  },
  {
    id: 'med-2',
    nome: 'Amoxicilina',
    principioAtivo: 'Amoxicilina tri-hidratada',
    apresentacao: 'Comprimido',
    concentracao: '875mg',
    unidade: 'comprimidos',
    quantidadeEstoque: 5,
    alertaEstoqueMinimo: 8,
    validade: '2026-12-01',
    observacoes: 'Completar o ciclo de 7 dias.',
  },
  {
    id: 'med-3',
    nome: 'Paracetamol',
    principioAtivo: 'Paracetamol',
    apresentacao: 'Comprimido',
    concentracao: '500mg',
    unidade: 'comprimidos',
    quantidadeEstoque: 24,
    alertaEstoqueMinimo: 10,
    validade: '2027-10-15',
    observacoes: 'Usar somente se houver dor ou febre.',
  },
  {
    id: 'med-4',
    nome: 'Dipirona',
    principioAtivo: 'Dipirona monoidratada',
    apresentacao: 'Gotas',
    concentracao: '500mg/mL',
    unidade: 'frasco 20mL',
    quantidadeEstoque: 2,
    alertaEstoqueMinimo: 1,
    validade: '2027-04-20',
    observacoes: '20 gotas para dor de cabeça forte.',
  },
];

const INITIAL_TREATMENTS = [
  {
    id: 'treat-1',
    nome: 'Controle de Pressão Arterial',
    descricao: 'Tratamento diário contínuo para hipertensão arterial',
    dataInicio: '2026-01-01',
    dataFim: '',
    status: 'active',
    medicamentos: [
      {
        medicamentoId: 'med-1',
        nome: 'Losartana',
        dosagem: '1 comprimido (50mg)',
        quantidadePorDose: 1,
        vezesPorDia: 1,
        horarios: ['08:00'],
      },
    ],
  },
  {
    id: 'treat-2',
    nome: 'Tratamento Infecção de Garganta',
    descricao: 'Ciclo de 7 dias prescrito pelo Dr. Carlos',
    dataInicio: '2026-09-20',
    dataFim: '2026-09-27',
    status: 'active',
    medicamentos: [
      {
        medicamentoId: 'med-2',
        nome: 'Amoxicilina',
        dosagem: '1 comprimido (875mg)',
        quantidadePorDose: 1,
        vezesPorDia: 2,
        horarios: ['08:00', '20:00'],
      },
    ],
  },
  {
    id: 'treat-3',
    nome: 'Alívio Sintomático de Dor',
    descricao: 'Uso pontual quando necessário',
    dataInicio: '2026-09-01',
    dataFim: '',
    status: 'paused',
    medicamentos: [
      {
        medicamentoId: 'med-3',
        nome: 'Paracetamol',
        dosagem: '1 comprimido (500mg)',
        quantidadePorDose: 1,
        vezesPorDia: 1,
        horarios: ['14:00'],
      },
    ],
  },
];

export function getStoredMedications() {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    return INITIAL_MEDICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_MEDICATIONS;
  }
}

export function saveStoredMedications(medications) {
  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
}

export function getStoredTreatments() {
  const data = localStorage.getItem(STORAGE_KEYS.TREATMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(INITIAL_TREATMENTS));
    return INITIAL_TREATMENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_TREATMENTS;
  }
}

export function saveStoredTreatments(treatments) {
  localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(treatments));
}

export function getStoredDoses(dateStr = new Date().toISOString().split('T')[0]) {
  const allDosesData = localStorage.getItem(STORAGE_KEYS.DOSES);
  let allDosesMap = {};
  if (allDosesData) {
    try {
      allDosesMap = JSON.parse(allDosesData);
    } catch (e) {
      allDosesMap = {};
    }
  }

  if (allDosesMap[dateStr]) {
    return allDosesMap[dateStr];
  }

  const treatments = getStoredTreatments();
  const generated = generateDosesForDate(treatments, dateStr);

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr === todayStr && generated.length > 0) {
    if (generated[0]) {
      generated[0].status = 'taken';
      generated[0].takenAt = `${dateStr}T08:02:00`;
    }
  }

  allDosesMap[dateStr] = generated;
  localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(allDosesMap));
  return generated;
}

export function saveStoredDosesForDate(dateStr, doses) {
  const allDosesData = localStorage.getItem(STORAGE_KEYS.DOSES);
  let allDosesMap = {};
  if (allDosesData) {
    try {
      allDosesMap = JSON.parse(allDosesData);
    } catch (e) {
      allDosesMap = {};
    }
  }
  allDosesMap[dateStr] = doses;
  localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(allDosesMap));
}

export function getStoredHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!data) {
    const defaultHistory = [
      {
        id: 'hist-1',
        medicationNome: 'Losartana',
        dosagem: '1 comprimido (50mg)',
        treatmentNome: 'Controle de Pressão Arterial',
        status: 'taken',
        timestamp: `${new Date().toISOString().split('T')[0]}T08:02:00`,
        observacao: 'Dose registrada no horário habitual.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(defaultHistory));
    return defaultHistory;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function addHistoryEntry(entry) {
  const history = getStoredHistory();
  const newEntry = {
    id: `hist-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...history];
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}
