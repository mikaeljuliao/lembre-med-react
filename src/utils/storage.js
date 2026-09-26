import { generateDosesForDate, sanitizeStoredData } from './businessLogic';

const STORAGE_KEYS = {
  MEDICATIONS: 'dosefacil_medications',
  TREATMENTS: 'dosefacil_treatments',
  DOSES: 'dosefacil_doses',
  HISTORY: 'dosefacil_history',
};

const INITIAL_MEDICATIONS = [];

const INITIAL_TREATMENTS = [];

export function getStoredMedications() {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    const cleaned = sanitizeStoredData({ medications: parsed }).medications;
    if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
  }
}

export function saveStoredMedications(medications) {
  localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
}

export function getStoredTreatments() {
  const data = localStorage.getItem(STORAGE_KEYS.TREATMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(INITIAL_TREATMENTS));
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    const cleaned = sanitizeStoredData({ treatments: parsed }).treatments;
    if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) {
      localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    return [];
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
    const filtered = allDosesMap[dateStr].filter((dose) => {
      const medicationName = String(dose?.medicationNome || '').trim();
      return medicationName && !['paracetamol', 'losartana', 'amoxicilina', 'dipirona', 'omeprazol', 'ibuprofeno'].includes(medicationName.toLowerCase());
    });
    if (filtered.length !== allDosesMap[dateStr].length) {
      allDosesMap[dateStr] = filtered;
      localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(allDosesMap));
    }
    return filtered;
  }

  const treatments = getStoredTreatments();
  const generated = generateDosesForDate(treatments, dateStr);

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
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    const cleaned = sanitizeStoredData({ history: parsed }).history;
    if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(cleaned));
    }
    return cleaned;
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
