import {
  getLocalDateString,
  resolveReminderSelection,
} from './reminderEngine';

export function normalizeMedicationName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function isUserMedicationItem(item) {
  if (!item || typeof item !== 'object') return false;
  return Boolean(normalizeMedicationName(item.nome));
}

function isUserTreatmentItem(item) {
  if (!item || typeof item !== 'object') return false;
  return Boolean(String(item.nome || '').trim());
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
        return Boolean(String(entry.medicationNome || '').trim());
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

export function resolveReminderTimes(horarios = [], referenceDate = new Date()) {
  if (!Array.isArray(horarios)) return [];

  return horarios
    .map((time) => resolveReminderSelection(time, referenceDate))
    .filter(Boolean)
    .map((selection) => selection.horario);
}

export function getDoseScheduledAt(dateStr, horario) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  const parsed = String(horario || '00:00:00').split(':').map(Number);
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(parsed[0]) || 0,
    Number(parsed[1]) || 0,
    Number(parsed[2]) || 0,
    0
  );

  return date.toISOString();
}

export function generateDosesForDate(
  activeTreatments = [],
  dateStr = getLocalDateString()
) {
  const doses = [];

  activeTreatments.forEach((treatment) => {
    if (treatment.status !== 'active') return;

    if (treatment.dataInicio && dateStr < treatment.dataInicio) return;
    if (treatment.dataFim && dateStr > treatment.dataFim) return;

    (treatment.medicamentos || []).forEach((med) => {
      if (med.tipoUso === 'as_needed') return;

      const times = Array.isArray(med.horarios) && med.horarios.length > 0
        ? med.horarios
        : ['08:00'];

      times.forEach((horario) => {
        const scheduleFirstReminderAt =
          med.primeirosLembretesAt?.[horario] ||
          (med.primeiroLembreteHorario === horario ? med.primeiroLembreteAt : null);

        if (scheduleFirstReminderAt) {
          const scheduleFirstDate = getLocalDateString(new Date(scheduleFirstReminderAt));

          if (dateStr < scheduleFirstDate) return;
        }

        const isFirstReminder =
          scheduleFirstReminderAt &&
          getLocalDateString(new Date(scheduleFirstReminderAt)) === dateStr;

        const firstReminderAt = isFirstReminder
          ? scheduleFirstReminderAt
          : getDoseScheduledAt(dateStr, horario);

        doses.push({
          id: `${treatment.id}-${med.medicamentoId || med.nome}-${dateStr}-${horario}`,
          treatmentId: treatment.id,
          treatmentNome: treatment.nome,
          medicationId: med.medicamentoId,
          medicationNome: med.nome,
          dosagem:
            med.dosagem ||
            String(med.quantidadePorDose || 1) + ' ' + (med.unidadeDose || 'unidade'),
          quantidade: med.quantidadePorDose || 1,
          unidadeDose: med.unidadeDose || 'unidade',
          principioAtivo: med.principioAtivo || '',
          concentracao: med.concentracao || '',
          apresentacao: med.apresentacao || 'Medicamento',
          viaAdministracao: med.viaAdministracao || '',
          orientacaoAlimentacao: med.orientacaoAlimentacao || 'sem_orientacao',
          finalidade: med.finalidade || '',
          observacoes: med.observacoes || '',
          horario,
          scheduledAt: firstReminderAt,
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
    return String(a.medicationNome).localeCompare(String(b.medicationNome), 'pt-BR');
  });
}

export function buildMedicationTreatment(
  data = {},
  referenceDate = new Date()
) {
  const cleanedName = String(data.nome || '').trim();
  const safeQuantity =
    Number(data.quantidadePorDose) > 0 ? Number(data.quantidadePorDose) : 1;
  const unidadeDose = String(data.unidadeDose || 'unidade').trim() || 'unidade';
  const tipoUso = data.tipoUso === 'as_needed' ? 'as_needed' : 'scheduled';
  const horarios = tipoUso === 'scheduled'
    ? [...new Set((Array.isArray(data.horarios) ? data.horarios : []).filter(Boolean))]
    : [];

  const firstSelection = horarios[0]
    ? resolveReminderSelection(horarios[0], referenceDate)
    : null;
  const fallback = resolveReminderSelection('08:00', referenceDate);
  const reminder = firstSelection || fallback;
  const medicationId = data.medicamentoId || 'med-' + Date.now();
  const treatmentId = data.treatmentId || 'treat-' + Date.now();
  const primeirosLembretesAt = {};

  if (tipoUso === 'scheduled') {
    horarios.forEach((horario) => {
      const selection = resolveReminderSelection(horario, referenceDate);
      if (selection) {
        primeirosLembretesAt[selection.horario] = selection.scheduledAt.toISOString();
      }
    });
  }

  const medication = {
    medicamentoId: medicationId,
    nome: cleanedName || 'Medicamento',
    principioAtivo: String(data.principioAtivo || '').trim(),
    concentracao: String(data.concentracao || '').trim(),
    apresentacao: String(data.apresentacao || 'Comprimido').trim(),
    viaAdministracao: String(data.viaAdministracao || '').trim(),
    unidadeDose,
    quantidadePorDose: safeQuantity,
    dosagem: String(safeQuantity) + ' ' + unidadeDose,
    vezesPorDia: horarios.length,
    horarios,
    primeirosLembretesAt,
    primeiroLembreteAt: firstSelection?.scheduledAt?.toISOString() || null,
    primeiroLembreteHorario: firstSelection?.horario || null,
    tipoLembrete: tipoUso === 'as_needed' ? 'as_needed' : 'scheduled',
    tipoUso,
    orientacaoAlimentacao: data.orientacaoAlimentacao || 'sem_orientacao',
    finalidade: String(data.finalidade || '').trim(),
    observacoes: String(data.observacoes || '').trim(),
    validade: String(data.validade || '').trim(),
  };

  return {
    id: treatmentId,
    nome: cleanedName ? 'Lembrete: ' + cleanedName : 'Lembrete do remédio',
    descricao: String(data.finalidade || '').trim() || 'Lembrete para uso do medicamento',
    dataInicio: data.dataInicio || reminder.dataInicio,
    dataFim: data.dataFim || '',
    status: 'active',
    tipoUso,
    orientacaoAlimentacao: data.orientacaoAlimentacao || 'sem_orientacao',
    finalidade: String(data.finalidade || '').trim(),
    observacoes: String(data.observacoes || '').trim(),
    medicamentos: [medication],
  };
}

export function buildQuickReminderTreatment(
  nome,
  quantidadePorDose = 1,
  horarios = ['08:00'],
  referenceDate = new Date()
) {
  return buildMedicationTreatment(
    {
      nome,
      quantidadePorDose,
      unidadeDose: 'comprimido' + (Number(quantidadePorDose) > 1 ? 's' : ''),
      horarios,
      apresentacao: 'Comprimido',
    },
    referenceDate
  );
}
