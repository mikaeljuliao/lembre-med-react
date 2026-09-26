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
import { generateDosesForDate } from './utils/businessLogic';
import { getLocalDateString } from './utils/reminderEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedDate, setSelectedDate] = useState(
    getLocalDateString()
  );

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

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [treatmentToEdit, setTreatmentToEdit] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);

  useEffect(() => {
    setMedications(getStoredMedications());
    setTreatments(getStoredTreatments());
    setHistory(getStoredHistory());
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const today = getLocalDateString();

      setSelectedDate((currentDate) =>
        currentDate === today ? currentDate : today
      );
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
    const medName = medConfig?.nome || 'Medicamento';
    const medicationId = medConfig?.medicamentoId || `med-${Date.now()}`;
    const medRecord = {
      id: medicationId,
      nome: medName,
      principioAtivo: '',
      apresentacao: 'Comprimido',
      concentracao: '',
      unidade: 'comprimidos',
      validade: '',
      observacoes: '',
      horarios: medConfig?.horarios || [],
      quantidadePorDose: medConfig?.quantidadePorDose || 1,
      lembreteId: treatmentData.id,
    };

    const updatedMedications = [medRecord, ...medications.filter((med) => med.id !== medicationId)];
    setMedications(updatedMedications);
    saveStoredMedications(updatedMedications);

    const today = getLocalDateString();
    setSelectedDate(today);

    const updatedTreatments = [treatmentData, ...treatments.filter((t) => t.id !== treatmentData.id)];
    setTreatments(updatedTreatments);
    saveStoredTreatments(updatedTreatments);

    const nextDoses = generateDosesForDate(updatedTreatments, today);
    saveStoredDosesForDate(today, nextDoses);
    setDoses(nextDoses);
    setIsQuickReminderModalOpen(false);
    setActiveTab('inicio');
    showToast(`${medName} adicionado e lembrete criado.`, 'success');
  };

  const handleDeleteMedication = (medId) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    setDeleteRequest({
      type: 'medication',
      title: 'Remover medicamento',
      message: `Deseja remover "${med.nome}"?`,
      item: med,
      onConfirm: () => {
        const updated = medications.filter((m) => m.id !== medId);
        setMedications(updated);
        saveStoredMedications(updated);
        showToast(`"${med.nome}" removido.`, 'info');
        setDeleteRequest(null);
      },
    });
  };

  const handleToggleDoseStatus = (doseId, newStatus) => {
    const updatedDoses = doses.map((d) => {
      if (d.id !== doseId) return d;

      const isTaken = newStatus === 'taken';
      const updatedItem = {
        ...d,
        status: newStatus,
        takenAt: isTaken ? new Date().toISOString() : null,
        snoozedUntil: null,
        alarmMuted: false,
      };

      if (isTaken || newStatus === 'skipped') {
        const newHist = addHistoryEntry({
          medicationNome: d.medicationNome,
          dosagem: d.dosagem,
          treatmentNome: d.treatmentNome,
          status: newStatus,
          observacao: isTaken
            ? 'Dose registrada pelo usuário.'
            : 'Dose não registrada pelo usuário.',
        });
        setHistory(newHist);

      }

      return updatedItem;
    });

    setDoses(updatedDoses);
    saveStoredDosesForDate(selectedDate, updatedDoses);

    if (newStatus === 'taken') showToast('Dose registrada! ✓');
    if (newStatus === 'skipped') showToast('Dose não registrada.', 'info');
    if (newStatus === 'pending') showToast('Dose restaurada para pendente.', 'info');
  };

  const handleUpdateDose = (doseId, changes) => {
    const updatedDoses = doses.map((dose) =>
      dose.id === doseId ? { ...dose, ...changes } : dose
    );

    setDoses(updatedDoses);
    saveStoredDosesForDate(selectedDate, updatedDoses);
  };

  const handleSnoozeDose = (doseId, minutes = 10) => {
    const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
    handleUpdateDose(doseId, {
      snoozedUntil,
      alarmMuted: false,
    });
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

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
            onViewDetails={(med) => {
              setSelectedDetailMed(med);
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
        <Modal isOpen={!!deleteRequest} onClose={() => setDeleteRequest(null)} title={deleteRequest.title}>
          <div className="space-y-5">
            <p className="text-sm text-slate-600">{deleteRequest.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteRequest(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={deleteRequest.onConfirm}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Remover
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
