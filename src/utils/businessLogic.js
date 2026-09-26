const KNOWN_MOCK_MEDICATIONS = new Set([
  'paracetamol',
  'losartana',
  'amoxicilina',
  'dipirona',
  'omeprazol',
  'ibuprofeno',
]);

function isUserMedicationItem(item) {
  if (!item || typeof item !== 'object') return false;
  const nome = String(item.nome || '').trim();
  if (!nome) return false;
  if (KNOWN_MOCK_MEDICATIONS.has(nome.toLowerCase())) return false;
  return true;
}

function isUserTreatmentItem(item) {
  if (!item || typeof item !== 'object') return false;
  const nome = String(item.nome || '').trim();
  if (!nome) return false;
  if (KNOWN_MOCK_MEDICATIONS.has(nome.toLowerCase())) return false;
  return true;
}

export function sanitizeStoredData(payload = {}) {
  const medications = Array.isArray(payload.medications)
    ? payload.medications.filter(isUserMedicationItem)
    : [];

  const treatments = Array.isArray(payload.treatments)
    ? payload.treatments.filter(isUserTreatmentItem)
    : [];

  const history = Array.isArray(payload.history)
    ? payload.history.filter((entry) => {
        if (!entry || typeof entry !== 'object') return false;
        const medicationNome = String(entry.medicationNome || '').trim();
        if (!medicationNome) return false;
        return !KNOWN_MOCK_MEDICATIONS.has(medicationNome.toLowerCase());
      })
    : [];

  return {
    medications,
    treatments,
    history,
  };
}

export function calculateAdherence(occurrences = []) {
  if (!Array.isArray(occurrences) || occurrences.length === 0) {
    return {
      totalDoses: 0,
      takenDoses: 0,
      skippedDoses: 0,
      missedDoses: 0,
      pendingDoses: 0,
      adherencePercentage: 100,
    };
  }

  const takenDoses = occurrences.filter((d) => d.status === 'taken').length;
  const skippedDoses = occurrences.filter((d) => d.status === 'skipped').length;
  const missedDoses = occurrences.filter((d) => d.status === 'missed').length;
  const pendingDoses = occurrences.filter((d) => d.status === 'pending').length;

  const evaluatedDoses = takenDoses + skippedDoses + missedDoses;
  const totalDoses = occurrences.length;

  const denominator = evaluatedDoses > 0 ? evaluatedDoses : totalDoses;
  const adherencePercentage =
    denominator > 0 ? Math.round((takenDoses / denominator) * 1000) / 10 : 100;

  return {
    totalDoses,
    takenDoses,
    skippedDoses,
    missedDoses,
    pendingDoses,
    adherencePercentage,
  };
}

export function calculateStockProjection(medication, activeTreatments = []) {
  if (!medication) {
    return { dailyConsumption: 0, estimatedDays: null, isLowStock: false, isCritical: false };
  }

  const currentStock = Number(medication.quantidadeEstoque) || 0;
  let dailyConsumption = 0;

  activeTreatments.forEach((treatment) => {
    if (treatment.status !== 'active') return;

    const medConfig = (treatment.medicamentos || []).find(
      (m) => String(m.medicamentoId) === String(medication.id) || m.nome === medication.nome
    );

    if (medConfig) {
      const dosePerTake = Number(medConfig.quantidadePorDose) || 1;
      const timesPerDay = Number(medConfig.vezesPorDia) || 1;
      dailyConsumption += dosePerTake * timesPerDay;
    }
  });

  if (dailyConsumption <= 0) {
    return {
      dailyConsumption: 0,
      estimatedDays: null,
      isLowStock: currentStock <= (medication.alertaEstoqueMinimo || 5),
      isCritical: currentStock === 0,
    };
  }

  const estimatedDays = Math.floor(currentStock / dailyConsumption);
  const minThreshold = medication.alertaEstoqueMinimo || 7;
  const isLowStock = estimatedDays <= minThreshold || currentStock <= 5;
  const isCritical = estimatedDays <= 2 || currentStock === 0;

  return {
    dailyConsumption,
    estimatedDays,
    isLowStock,
    isCritical,
  };
}

function padTime(value) {
  return String(value).padStart(2, '0');
}

function formatScheduleTime(date) {
  return [
    padTime(date.getHours()),
    padTime(date.getMinutes()),
    padTime(date.getSeconds()),
  ].join(':');
}

export function resolveReminderTimes(horarios = [], referenceDate = new Date()) {
  if (!Array.isArray(horarios)) return [];

  return horarios
    .filter((time) => typeof time === 'string' && time.trim())
    .map((time) => {
      const value = time.trim();

      if (value.toLowerCase() === 'agora') {
        return formatScheduleTime(referenceDate);
      }

      if (/^\d+$/.test(value)) {
        const offsetMinutes = Number(value);
        const resolved = new Date(referenceDate.getTime() + offsetMinutes * 60000);
        return formatScheduleTime(resolved);
      }

      if (/^\d{2}:\d{2}$/.test(value)) {
        return `${value}:00`;
      }

      if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
        return value;
      }

      return value;
    });
}

export function getDoseScheduledAt(dateStr, horario) {
  const [hours = 0, minutes = 0, seconds = 0] = String(horario || '00:00')
    .split(':')
    .map(Number);

  const [year, month, day] = String(dateStr)
    .split('-')
    .map(Number);

  const target = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours) || 0,
    Number(minutes) || 0,
    Number(seconds) || 0,
    0
  );

  return target.toISOString();
}

export function generateDosesForDate(
  activeTreatments = [],
  dateStr = new Date().toISOString().split('T')[0]
) {
  const doses = [];

  activeTreatments.forEach((treatment) => {
    if (treatment.status !== 'active') return;

    if (treatment.dataInicio && dateStr < treatment.dataInicio) return;
    if (treatment.dataFim && dateStr > treatment.dataFim) return;

    (treatment.medicamentos || []).forEach((med) => {
      const times = med.horarios || ['08:00'];

      times.forEach((horario) => {
        doses.push({
          id: `${treatment.id}-${med.medicamentoId || med.nome}-${dateStr}-${horario}`,
          treatmentId: treatment.id,
          treatmentNome: treatment.nome,
          medicationId: med.medicamentoId,
          medicationNome: med.nome,
          dosagem: med.dosagem || '1 unidade',
          quantidade: med.quantidadePorDose || 1,
          horario,
          scheduledAt: getDoseScheduledAt(dateStr, horario),
          data: dateStr,
          status: 'pending',
          takenAt: null,
          skipReason: null,
          snoozedUntil: null,
          alarmMuted: false,
        });
      });
    });
  });

  return doses.sort((a, b) => {
    const first = new Date(a.scheduledAt).getTime();
    const second = new Date(b.scheduledAt).getTime();

    if (first !== second) return first - second;
    return String(a.medicationNome).localeCompare(String(b.medicationNome));
  });
}

export function buildQuickReminderTreatment(nome, quantidadePorDose = 1, horarios = ['08:00']) {
  const cleanedName = String(nome || '').trim();
  const safeQuantity = Number(quantidadePorDose) > 0 ? Number(quantidadePorDose) : 1;
  const normalizedSchedules =
    Array.isArray(horarios) && horarios.length > 0
      ? resolveReminderTimes(horarios).filter(Boolean)
      : ['08:00:00'];

  return {
    id: `treat-${Date.now()}`,
    nome: cleanedName ? `Lembrete: ${cleanedName}` : 'Lembrete do remédio',
    descricao: 'Lembrete simples para uso diário',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    status: 'active',
    medicamentos: [
      {
        medicamentoId: `med-${Date.now()}`,
        nome: cleanedName || 'Medicamento',
        dosagem: `${safeQuantity} comprimido${safeQuantity > 1 ? 's' : ''}`,
        quantidadePorDose: safeQuantity,
        vezesPorDia: normalizedSchedules.length,
        horarios: normalizedSchedules,
      },
    ],
  };
}