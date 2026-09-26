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
import { generateDosesForDate, normalizeMedicationName } from './utils/businessLogic';

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
    const medicationKey = normalizeMedicationName(medName);
    const existingMedication = medications.find(
      (medication) => normalizeMedicationName(medication.nome) === medicationKey
    );
    const existingTreatment = treatments.find((treatment) =>
      (treatment.medicamentos || []).some(
        (medication) =>
          String(medication.medicamentoId || '') === String(existingMedication?.id || '') ||
          normalizeMedicationName(medication.nome) === medicationKey
      )
    );

    const selectedHorario = String(medConfig?.horarios?.[0] || '').trim();
    const existingHorarios = existingTreatment?.medicamentos?.[0]?.horarios || [];
    const nextHorarios = existingTreatment
      ? [...new Set([
          ...existingHorarios,
          ...(selectedHorario ? [selectedHorario] : []),
        ])].sort()
      : medConfig?.horarios || [];

    const nextPrimeirosLembretesAt = {
      ...(existingTreatment?.medicamentos?.[0]?.primeirosLembretesAt || {}),
    };

    if (
      selectedHorario &&
      !existingHorarios.includes(selectedHorario) &&
      medConfig?.primeirosLembretesAt?.[selectedHorario]
    ) {
      nextPrimeirosLembretesAt[selectedHorario] =
        medConfig.primeirosLembretesAt[selectedHorario];
    }

    const medicationId = existingMedication?.id || medConfig?.medicamentoId || 'med-' + Date.now();
    const treatmentId = existingTreatment?.id || treatmentData.id;

    const medRecord = {
      ...(existingMedication || {}),
      id: medicationId,
      nome: existingMedication?.nome || medName,
      principioAtivo: existingMedication?.principioAtivo || '',
      apresentacao: existingMedication?.apresentacao || 'Comprimido',
      concentracao: existingMedication?.concentracao || '',
      unidade: existingMedication?.unidade || 'comprimidos',
      validade: existingMedication?.validade || '',
      observacoes: existingMedication?.observacoes || '',
      horarios: nextHorarios,
      primeirosLembretesAt: nextPrimeirosLembretesAt,
      quantidadePorDose: medConfig?.quantidadePorDose || existingMedication?.quantidadePorDose || 1,
      lembreteId: treatmentId,
    };

    const updatedTreatment = existingTreatment
      ? {
          ...existingTreatment,
          medicamentos: existingTreatment.medicamentos.map((medication, index) =>
            index === 0
              ? {
                  ...medication,
                  medicamentoId: medicationId,
                  nome: existingMedication?.nome || medName,
                  quantidadePorDose: medConfig?.quantidadePorDose || medication.quantidadePorDose || 1,
                  dosagem: String(medConfig?.quantidadePorDose || medication.quantidadePorDose || 1) + ' comprimido' + (Number(medConfig?.quantidadePorDose || medication.quantidadePorDose || 1) > 1 ? 's' : ''),
                  horarios: nextHorarios,
                  primeirosLembretesAt: nextPrimeirosLembretesAt,
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
        ? medName + ' já estava cadastrado. Novo horário adicionado ao lembrete.'
        : medName + ' adicionado e lembrete criado.',
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
            onOpenAdd={() => setIsQuickReminderModalOpen(true)}
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
        onOpenOfficialInfo={() => setActiveTab('saude')}
      />
      <QuickReminderModal
        isOpen={isQuickReminderModalOpen}
        onClose={() => setIsQuickReminderModalOpen(false)}
        onSave={handleQuickReminderSave}
        existingMedications={medications}
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