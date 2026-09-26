import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';
import Modal from './components/common/Modal';

import InicioView from './components/dashboard/InicioView';
import RemediosView from './components/remedios/RemediosView';
import SaudeView from './components/saude/SaudeView';
import AjudaView from './components/ajuda/AjudaView';

import MedicationDetailModal from './components/medicamentos/MedicationDetailModal';
import QuickReminderModal from './components/medicamentos/QuickReminderModal';

import {
  getStoredMedications,
  saveStoredMedications,
  getStoredTreatments,
  saveStoredTreatments,
  getStoredDoses,
  saveStoredDosesForDate,
  getStoredHistory,
  addHistoryEntry,
} from './utils/storage';
import { getLocalDateString } from './utils/reminderEngine';
import { generateDosesForDate, isSameMedication } from './utils/businessLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [medications, setMedications] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [doses, setDoses] = useState([]);
  const [history, setHistory] = useState([]);

  const futureDoses = useMemo(() => {
    const result = [];
    const baseDate = new Date();

    for (let offset = 1; offset <= 6; offset += 1) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + offset);
      result.push(...generateDosesForDate(treatments, getLocalDateString(date)));
    }

    return result;
  }, [treatments, selectedDate]);

  const [toast, setToast] = useState(null);
  const [isQuickReminderModalOpen, setIsQuickReminderModalOpen] = useState(false);
  const [isDetailMedOpen, setIsDetailMedOpen] = useState(false);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);

  useEffect(() => {
    setMedications(getStoredMedications());
    setTreatments(getStoredTreatments());
    setHistory(getStoredHistory());
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const today = getLocalDateString();
      setSelectedDate((currentDate) => currentDate === today ? currentDate : today);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setDoses(getStoredDoses(selectedDate));
  }, [selectedDate, treatments]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleQuickReminderSave = (treatmentData) => {
    const medConfig = treatmentData?.medicamentos?.[0];
    const medName = String(medConfig?.nome || 'Medicamento').trim();

    if (medConfig?.medicamentoId) {
      const existingMedication = medications.find(
        (medication) => String(medication.id) === String(medConfig.medicamentoId)
      );
      const existingTreatment = treatments.find((treatment) =>
        (treatment.medicamentos || []).some(
          (medication) => String(medication.medicamentoId) === String(medConfig.medicamentoId)
        )
      );

      if (existingMedication && existingTreatment) {
        const updatedMedication = {
          ...existingMedication,
          ...medConfig,
          id: existingMedication.id,
          medicamentoId: undefined,
        };
        delete updatedMedication.medicamentoId;

        const updatedTreatment = {
          ...existingTreatment,
          tipoUso: medConfig.tipoUso || existingTreatment.tipoUso || 'scheduled',
          dataFim: treatmentData.dataFim || '',
          finalidade: medConfig.finalidade || '',
          orientacaoAlimentacao: medConfig.orientacaoAlimentacao || 'sem_orientacao',
          observacoes: medConfig.observacoes || '',
          intervaloMinimoHoras: medConfig.intervaloMinimoHoras || null,
          limiteDosesDia: medConfig.limiteDosesDia || null,
          condicaoUso: medConfig.condicaoUso || '',
          intervaloHoras: medConfig.intervaloHoras || null,
          horarioInicial: medConfig.horarioInicial || '',
          dataInicio: existingTreatment.dataInicio || treatmentData.dataInicio,
          medicamentos: existingTreatment.medicamentos.map((medication) =>
            String(medication.medicamentoId) === String(medConfig.medicamentoId)
              ? { ...medConfig, medicamentoId: existingMedication.id }
              : medication
          ),
        };

        const updatedMedications = medications.map((medication) =>
          medication.id === existingMedication.id ? updatedMedication : medication
        );
        const updatedTreatments = treatments.map((treatment) =>
          treatment.id === existingTreatment.id ? updatedTreatment : treatment
        );

        setMedications(updatedMedications);
        saveStoredMedications(updatedMedications);
        setTreatments(updatedTreatments);
        saveStoredTreatments(updatedTreatments);

        const today = getLocalDateString();
        const refreshedDoses = getStoredDoses(today);
        setSelectedDate(today);
        setDoses(refreshedDoses);
        setIsQuickReminderModalOpen(false);
        setIsDetailMedOpen(false);
        setSelectedDetailMed(updatedMedication);
        setActiveTab('remedios');
        showToast(medName + ' atualizado. Os lembretes foram recalculados.', 'success');
        return;
      }
    }
    const existingMedication = medications.find(
      (medication) => isSameMedication(medication, medConfig)
    );
    const existingTreatment = treatments.find((treatment) =>
      (treatment.medicamentos || []).some(
        (medication) =>
          String(medication.medicamentoId || '') === String(existingMedication?.id || '') ||
          (!existingMedication?.id && isSameMedication(medication, medConfig))
      )
    );

    const incomingHorarios = Array.isArray(medConfig?.horarios) ? medConfig.horarios : [];
    const existingMedicationConfig = existingTreatment?.medicamentos?.find(
      (medication) =>
        String(medication.medicamentoId || '') === String(existingMedication?.id || '') ||
        (!existingMedication?.id && isSameMedication(medication, medConfig))
    );
    const existingHorarios = existingMedicationConfig?.horarios || [];
    const nextHorarios = [...new Set([...existingHorarios, ...incomingHorarios])].sort();
    const nextPrimeirosLembretesAt = {
      ...(existingMedicationConfig?.primeirosLembretesAt || {}),
    };

    Object.entries(medConfig?.primeirosLembretesAt || {}).forEach(([horario, value]) => {
      const currentValue = nextPrimeirosLembretesAt[horario];
      if (!currentValue || new Date(value).getTime() < new Date(currentValue).getTime()) {
        nextPrimeirosLembretesAt[horario] = value;
      }
    });

    const medicationId = existingMedication?.id || medConfig?.medicamentoId || 'med-' + Date.now();
    const treatmentId = existingTreatment?.id || treatmentData.id;
    const medRecord = {
      ...(existingMedication || {}),
      id: medicationId,
      nome: existingMedication?.nome || medName,
      principioAtivo: medConfig?.principioAtivo || existingMedication?.principioAtivo || '',
      apresentacao: medConfig?.apresentacao || existingMedication?.apresentacao || 'Medicamento',
      concentracao: medConfig?.concentracao || existingMedication?.concentracao || '',
      viaAdministracao: medConfig?.viaAdministracao || existingMedication?.viaAdministracao || '',
      unidadeDose: medConfig?.unidadeDose || existingMedication?.unidadeDose || 'unidade',
      quantidadePorDose: medConfig?.quantidadePorDose || existingMedication?.quantidadePorDose || 1,
      validade: medConfig?.validade || existingMedication?.validade || '',
      dataInicio: treatmentData?.dataInicio || existingMedication?.dataInicio || '',
      dataFim: treatmentData?.dataFim || existingMedication?.dataFim || '',
      finalidade: medConfig?.finalidade || existingMedication?.finalidade || treatmentData?.finalidade || '',
      orientacaoAlimentacao: medConfig?.orientacaoAlimentacao || existingMedication?.orientacaoAlimentacao || treatmentData?.orientacaoAlimentacao || 'sem_orientacao',
      observacoes: medConfig?.observacoes || existingMedication?.observacoes || treatmentData?.observacoes || '',
      intervaloMinimoHoras: medConfig?.intervaloMinimoHoras || existingMedication?.intervaloMinimoHoras || treatmentData?.intervaloMinimoHoras || null,
      limiteDosesDia: medConfig?.limiteDosesDia || existingMedication?.limiteDosesDia || treatmentData?.limiteDosesDia || null,
      condicaoUso: medConfig?.condicaoUso || existingMedication?.condicaoUso || treatmentData?.condicaoUso || '',
      intervaloHoras: medConfig?.intervaloHoras || existingMedication?.intervaloHoras || treatmentData?.intervaloHoras || null,
      horarioInicial: medConfig?.horarioInicial || existingMedication?.horarioInicial || treatmentData?.horarioInicial || '',
      horarios: nextHorarios,
      primeirosLembretesAt: nextPrimeirosLembretesAt,
      tipoUso: existingMedicationConfig?.tipoUso || medConfig?.tipoUso || existingMedication?.tipoUso || treatmentData?.tipoUso || 'scheduled',
      lembreteId: treatmentId,
    };

    const updatedTreatment = existingTreatment
      ? {
          ...existingTreatment,
          tipoUso: existingMedicationConfig?.tipoUso || medConfig?.tipoUso || existingTreatment.tipoUso || 'scheduled',
          dataFim: treatmentData?.dataFim || existingTreatment.dataFim || '',
          finalidade: medConfig?.finalidade || existingTreatment.finalidade || treatmentData?.finalidade || '',
          orientacaoAlimentacao: medConfig?.orientacaoAlimentacao || existingTreatment.orientacaoAlimentacao || treatmentData?.orientacaoAlimentacao || 'sem_orientacao',
          observacoes: medConfig?.observacoes || existingTreatment.observacoes || treatmentData?.observacoes || '',
          intervaloMinimoHoras: medConfig?.intervaloMinimoHoras || existingTreatment.intervaloMinimoHoras || treatmentData?.intervaloMinimoHoras || null,
          limiteDosesDia: medConfig?.limiteDosesDia || existingTreatment.limiteDosesDia || treatmentData?.limiteDosesDia || null,
          condicaoUso: medConfig?.condicaoUso || existingTreatment.condicaoUso || treatmentData?.condicaoUso || '',
          medicamentos: existingTreatment.medicamentos.map((medication) =>
            (String(medication.medicamentoId || '') === String(existingMedication?.id || '') || (!existingMedication?.id && isSameMedication(medication, medConfig)))
              ? {
                  ...medication,
                  medicamentoId: medicationId,
                  nome: existingMedication?.nome || medName,
                  principioAtivo: medConfig?.principioAtivo || medication.principioAtivo || '',
                  apresentacao: medConfig?.apresentacao || medication.apresentacao || 'Medicamento',
                  concentracao: medConfig?.concentracao || medication.concentracao || '',
                  viaAdministracao: medConfig?.viaAdministracao || medication.viaAdministracao || '',
                  unidadeDose: medConfig?.unidadeDose || medication.unidadeDose || 'unidade',
                  quantidadePorDose: medConfig?.quantidadePorDose || medication.quantidadePorDose || 1,
                  dosagem: String(medConfig?.quantidadePorDose || medication.quantidadePorDose || 1) + ' ' + (medConfig?.unidadeDose || medication.unidadeDose || 'unidade'),
                  horarios: nextHorarios,
                  primeirosLembretesAt: nextPrimeirosLembretesAt,
                  tipoUso: medConfig?.tipoUso || medication.tipoUso || 'scheduled',
                  orientacaoAlimentacao: medConfig?.orientacaoAlimentacao || medication.orientacaoAlimentacao || 'sem_orientacao',
                  finalidade: medConfig?.finalidade || medication.finalidade || '',
                  observacoes: medConfig?.observacoes || medication.observacoes || '',
                  intervaloMinimoHoras: medConfig?.intervaloMinimoHoras || medication.intervaloMinimoHoras || treatmentData?.intervaloMinimoHoras || null,
                  limiteDosesDia: medConfig?.limiteDosesDia || medication.limiteDosesDia || treatmentData?.limiteDosesDia || null,
                  condicaoUso: medConfig?.condicaoUso || medication.condicaoUso || treatmentData?.condicaoUso || '',
                  intervaloHoras: medConfig?.intervaloHoras || medication.intervaloHoras || treatmentData?.intervaloHoras || null,
                  horarioInicial: medConfig?.horarioInicial || medication.horarioInicial || treatmentData?.horarioInicial || '',
                  dataInicio: treatmentData?.dataInicio || medication.dataInicio || '',
                  dataFim: treatmentData?.dataFim || medication.dataFim || '',
                }
              : medication
          ),
        }
      : {
          ...treatmentData,
          id: treatmentId,
          medicamentos: treatmentData.medicamentos.map((medication, index) =>
            index === 0 ? { ...medication, medicamentoId: medicationId } : medication
          ),
        };

    const updatedMedications = [
      medRecord,
      ...medications.filter((medication) => medication.id !== medicationId),
    ];
    const updatedTreatments = [
      updatedTreatment,
      ...treatments.filter((treatment) => treatment.id !== treatmentId),
    ];

    setMedications(updatedMedications);
    saveStoredMedications(updatedMedications);
    setTreatments(updatedTreatments);
    saveStoredTreatments(updatedTreatments);

    const today = getLocalDateString();
    setSelectedDate(today);
    const nextDoses = getStoredDoses(today);
    setDoses(nextDoses);
    setIsQuickReminderModalOpen(false);
    setActiveTab('inicio');
    showToast(
      existingMedication
        ? medName + ' já estava cadastrado. Dados e horários atualizados.'
        : medName + ' cadastrado e lembrete configurado.',
      'success'
    );
  };
  const handleDeleteMedication = (medId) => {
    const med = medications.find((medication) => medication.id === medId);
    if (!med) return;

    setDeleteRequest({
      type: 'medication',
      title: 'Remover medicamento',
      message: 'Deseja remover "' + med.nome + '"?',
      item: med,
      onConfirm: () => {
        const updatedMedications = medications.filter((medication) => medication.id !== medId);
        const normalizedName = String(med.nome || '').trim().toLowerCase();
        const updatedTreatments = treatments
          .map((treatment) => {
            const remainingMedications = (treatment.medicamentos || []).filter((medication) => {
              const hasMedicationId = medication?.medicamentoId !== undefined && medication?.medicamentoId !== null;
              const matchesId = String(medication?.medicamentoId) === String(medId);
              const matchesName = String(medication?.nome || '').trim().toLowerCase() === normalizedName;

              return hasMedicationId ? !matchesId : !matchesName;
            });

            return remainingMedications.length > 0
              ? { ...treatment, medicamentos: remainingMedications }
              : null;
          })
          .filter(Boolean);

        setMedications(updatedMedications);
        saveStoredMedications(updatedMedications);
        setTreatments(updatedTreatments);
        saveStoredTreatments(updatedTreatments);

        const today = getLocalDateString();
        const refreshedDoses = getStoredDoses(today);
        setSelectedDate(today);
        setDoses(refreshedDoses);

        showToast('"' + med.nome + '" removido.', 'info');
        setDeleteRequest(null);
      },
    });
  };

  const handleToggleDoseStatus = (doseId, newStatus) => {
    const dose = doses.find((item) => item.id === doseId);
    if (!dose) return;

    const doseDate = dose.data || selectedDate;
    const dateDoses = doseDate === selectedDate ? doses : getStoredDoses(doseDate);
    const currentDose = dateDoses.find((item) => item.id === doseId);
    if (!currentDose) return;

    const isTaken = newStatus === 'taken';
    const previousStatus = currentDose.status;
    const updatedDoses = dateDoses.map((item) => {
      if (item.id !== doseId) return item;
      return {
        ...item,
        status: newStatus,
        takenAt: isTaken ? new Date().toISOString() : null,
        snoozedUntil: null,
        alarmMuted: false,
      };
    });

    if (previousStatus !== newStatus && (isTaken || newStatus === 'skipped')) {
      const newHist = addHistoryEntry({
        doseId: currentDose.id,
        data: currentDose.data,
        horario: currentDose.horario,
        scheduledAt: currentDose.scheduledAt,
        medicationNome: currentDose.medicationNome,
        dosagem: currentDose.dosagem,
        treatmentNome: currentDose.treatmentNome,
        status: newStatus,
        observacao: isTaken
          ? 'Dose registrada pelo usuário.'
          : 'Dose não registrada pelo usuário.',
      });
      setHistory(newHist);
    }

    saveStoredDosesForDate(doseDate, updatedDoses);
    if (doseDate === selectedDate) setDoses(updatedDoses);

    if (newStatus === 'taken') showToast('Dose registrada! ✓');
    if (newStatus === 'skipped') showToast('Dose não registrada.', 'info');
    if (newStatus === 'pending') showToast('Dose restaurada para pendente.', 'info');
  };

  const handleUpdateDose = (doseId, changes) => {
    const dose = doses.find((item) => item.id === doseId);
    if (!dose) return;

    const updatedDoses = doses.map((item) =>
      item.id === doseId ? { ...item, ...changes } : item
    );
    setDoses(updatedDoses);
    saveStoredDosesForDate(selectedDate, updatedDoses);
  };

  const handleSnoozeDose = (doseId, minutes = 10) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    handleUpdateDose(doseId, { snoozedUntil, alarmMuted: false });
    showToast('Lembrete adiado por ' + minutes + ' minutos.', 'info');
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {activeTab === 'inicio' && (
          <InicioView
            doses={doses}
            futureDoses={futureDoses}
            medications={medications}
            onToggleDoseStatus={handleToggleDoseStatus}
            onUpdateDose={handleUpdateDose}
            onSnoozeDose={handleSnoozeDose}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'remedios' && (
          <RemediosView
            medications={medications}
            history={history}
            onOpenAdd={() => {
              setSelectedDetailMed(null);
              setIsQuickReminderModalOpen(true);
            }}
            onDelete={handleDeleteMedication}
            onViewDetails={(medication) => {
              setSelectedDetailMed(medication);
              setIsDetailMedOpen(true);
            }}
          />
        )}
        {activeTab === 'saude' && <SaudeView />}
        {activeTab === 'ajuda' && <AjudaView />}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <MedicationDetailModal
        isOpen={isDetailMedOpen}
        onClose={() => setIsDetailMedOpen(false)}
        medication={selectedDetailMed}
        onEdit={(medication) => {
          setIsDetailMedOpen(false);
          setSelectedDetailMed(medication);
          setIsQuickReminderModalOpen(true);
        }}
        onOpenOfficialInfo={() => setActiveTab('saude')}
      />
      <QuickReminderModal
        isOpen={isQuickReminderModalOpen}
        onClose={() => setIsQuickReminderModalOpen(false)}
        onSave={handleQuickReminderSave}
        existingMedications={medications}
        initialMedication={selectedDetailMed}
        isEditing={Boolean(selectedDetailMed && isQuickReminderModalOpen)}
      />
      {deleteRequest && (
        <Modal
          isOpen={!!deleteRequest}
          onClose={() => setDeleteRequest(null)}
          title={deleteRequest.title}
        >
          <div className="space-y-5">
            <p className="text-sm text-slate-600">{deleteRequest.message}</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteRequest(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">Cancelar</button>
              <button type="button" onClick={deleteRequest.onConfirm} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">Remover</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}