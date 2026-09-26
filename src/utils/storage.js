import { generateDosesForDate, getDoseScheduledAt, sanitizeStoredData } from './businessLogic';
import { getLocalDateString } from './reminderEngine';

const STORAGE_KEYS = {
  MEDICATIONS: 'dosefacil_medications',
  TREATMENTS: 'dosefacil_treatments',
  DOSES: 'dosefacil_doses',
  HISTORY: 'dosefacil_history',
};

const INITIAL_MEDICATIONS = [];
const INITIAL_TREATMENTS = [];

const LEGACY_MOCK_IDS = new Set(['med-1', 'med-2', 'med-3', 'med-4', 'treat-1', 'treat-2', 'treat-3', 'hist-1']);

function isLegacyMock(item) {
  return Boolean(item?.id && LEGACY_MOCK_IDS.has(String(item.id)));
}

function normalizeDose(dose, dateStr) {
  if (!dose || typeof dose !== 'object') return null;
  const normalizedDate = dose.data || dateStr;
  const horario = String(dose.horario || '00:00');
  const scheduledAt = dose.scheduledAt || getDoseScheduledAt(normalizedDate, horario);
  const status = ['pending', 'taken', 'skipped', 'missed'].includes(dose.status) ? dose.status : 'pending';

  return {
    ...dose,
    data: normalizedDate,
    scheduledAt,
    status,
    takenAt: status === 'taken' ? dose.takenAt || null : null,
    snoozedUntil: dose.snoozedUntil || null,
    alarmMuted: Boolean(dose.alarmMuted),
  };
}

export function getStoredMedications() {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(INITIAL_MEDICATIONS));
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    const cleaned = sanitizeStoredData({ medications: parsed }).medications.filter((medication) => !isLegacyMock(medication));
    if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(cleaned));
    return cleaned;
  } catch {
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
    const cleaned = sanitizeStoredData({ treatments: parsed }).treatments.filter((treatment) => !isLegacyMock(treatment));
    if (JSON.stringify(parsed) !== JSON.stringify(cleaned)) localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(cleaned));
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredTreatments(treatments) {
  localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(treatments));
}

export function getStoredDoses(dateStr = getLocalDateString()) {
  const allDosesData = localStorage.getItem(STORAGE_KEYS.DOSES);
  let allDosesMap = {};
  if (allDosesData) {
    try {
      allDosesMap = JSON.parse(allDosesData);
    } catch {
      allDosesMap = {};
    }
  }

  const treatments = getStoredTreatments();
  const generated = generateDosesForDate(treatments, dateStr);
  const stored = Array.isArray(allDosesMap[dateStr])
    ? allDosesMap[dateStr]
        .filter((dose) => !isLegacyMock(dose) && !['treat-1', 'treat-2', 'treat-3'].includes(String(dose?.treatmentId)))
        .map((dose) => normalizeDose(dose, dateStr))
        .filter(Boolean)
    : [];
  const storedById = new Map(stored.map((dose) => [dose.id, dose]));
  const normalized = generated.map((dose) => {
    const previous = storedById.get(dose.id);
    if (!previous) return dose;
    return {
      ...dose,
      status: previous.status,
      takenAt: previous.takenAt,
      skipReason: previous.skipReason || null,
      snoozedUntil: previous.snoozedUntil || null,
      alarmMuted: Boolean(previous.alarmMuted),
    };
  });

  allDosesMap[dateStr] = normalized;
  localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(allDosesMap));
  return normalized;
}

export function saveStoredDosesForDate(dateStr, doses) {
  const allDosesData = localStorage.getItem(STORAGE_KEYS.DOSES);
  let allDosesMap = {};
  if (allDosesData) {
    try {
      allDosesMap = JSON.parse(allDosesData);
    } catch {
      allDosesMap = {};
    }
  }
  allDosesMap[dateStr] = doses.map((dose) => normalizeDose(dose, dateStr)).filter(Boolean);
  localStorage.setItem(STORAGE_KEYS.DOSES, JSON.stringify(allDosesMap));
}

function reconcileHistoryWithStoredDoses(history) {
  const dosesData = localStorage.getItem(STORAGE_KEYS.DOSES);
  if (!dosesData) return history;

  let dosesMap = {};
  try {
    dosesMap = JSON.parse(dosesData);
  } catch {
    return history;
  }

  const existingDoseIds = new Set(
    history
      .map((entry) => entry?.doseId)
      .filter(Boolean)
      .map((doseId) => String(doseId))
  );

  const reconciled = [...history];

  Object.entries(dosesMap).forEach(([dateStr, dateDoses]) => {
    if (!Array.isArray(dateDoses)) return;

    dateDoses.forEach((dose) => {
      if (!dose || !['taken', 'skipped'].includes(dose.status)) return;

      const doseId = String(dose.id || '');
      const alreadyExistsById = doseId && existingDoseIds.has(doseId);

      const alreadyExistsByLegacyData = history.some(
        (entry) =>
          !entry.doseId &&
          String(entry.data || dateStr) === String(dose.data || dateStr) &&
          String(entry.horario || '') === String(dose.horario || '') &&
          String(entry.medicationNome || '').trim().toLowerCase() ===
            String(dose.medicationNome || '').trim().toLowerCase() &&
          entry.status === dose.status
      );

      if (alreadyExistsById || alreadyExistsByLegacyData) return;

      reconciled.push({
        id: 'hist-reconciled-' + dateStr + '-' + String(dose.id || Date.now()),
        timestamp: dose.takenAt || dose.scheduledAt || new Date(dateStr + 'T00:00:00').toISOString(),
        doseId: dose.id || null,
        data: dose.data || dateStr,
        horario: dose.horario || null,
        scheduledAt: dose.scheduledAt || null,
        medicationNome: dose.medicationNome,
        dosagem: dose.dosagem,
        treatmentNome: dose.treatmentNome,
        status: dose.status,
        observacao:
          dose.status === 'taken'
            ? 'Dose recuperada do estado salvo.'
            : 'Registro recuperado do estado salvo.',
      });

      if (doseId) existingDoseIds.add(doseId);
    });
  });

  return reconciled.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getStoredHistory() {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  let parsed = [];

  if (data) {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = [];
    }
  }

  const cleaned = sanitizeStoredData({ history: parsed }).history.filter(
    (entry) => !isLegacyMock(entry)
  );
  const reconciled = reconcileHistoryWithStoredDoses(cleaned);

  if (JSON.stringify(parsed) !== JSON.stringify(reconciled)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(reconciled));
  }

  return reconciled;
}

export function addHistoryEntry(entry) {
  const history = getStoredHistory();
  const newEntry = {
    id: 'hist-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const updated = [newEntry, ...history];
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}