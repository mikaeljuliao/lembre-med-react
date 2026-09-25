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

export function generateDosesForDate(activeTreatments = [], dateStr = new Date().toISOString().split('T')[0]) {
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
          data: dateStr,
          status: 'pending',
          takenAt: null,
          skipReason: null,
        });
      });
    });
  });

  return doses.sort((a, b) => a.horario.localeCompare(b.horario));
}
