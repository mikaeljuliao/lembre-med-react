import React, { useState, useEffect } from 'react';
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
import TreatmentFormModal from './components/tratamentos/TreatmentFormModal';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [medications, setMedications] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [doses, setDoses] = useState([]);
  const [history, setHistory] = useState([]);

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
    setDoses(getStoredDoses(selectedDate));
  }, [selectedDate, treatments]);

  const refreshDoseState = (nextDate = selectedDate) => {
    setDoses(getStoredDoses(nextDate));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveMedication = (medData) => {
    const exists = medications.some((m) => m.id === medData.id);
    const updated = exists
      ? medications.map((m) => (m.id === medData.id ? medData : m))
      : [medData, ...medications];
    setMedications(updated);
    saveStoredMedications(updated);
    showToast(exists ? `"${medData.nome}" atualizado.` : `"${medData.nome}" adicionado.`);
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

    const today = new Date().toISOString().split('T')[0];
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

  const handleSaveTreatment = (treatmentData) => {
    const exists = treatments.some((t) => t.id === treatmentData.id);
    const updated = exists
      ? treatments.map((t) => (t.id === treatmentData.id ? treatmentData : t))
      : [treatmentData, ...treatments];
    setTreatments(updated);
    saveStoredTreatments(updated);
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    refreshDoseState(today);
    showToast(exists ? `Rotina "${treatmentData.nome}" atualizada.` : `Rotina "${treatmentData.nome}" criada.`);
  };

  const handleDeleteTreatment = (treatmentId) => {
    const treat = treatments.find((t) => t.id === treatmentId);
    if (!treat) return;
    setDeleteRequest({
      type: 'treatment',
      title: 'Remover lembrete',
      message: `Deseja remover "${treat.nome}"?`,
      item: treat,
      onConfirm: () => {
        const updated = treatments.filter((t) => t.id !== treatmentId);
        setTreatments(updated);
        saveStoredTreatments(updated);
        showToast(`Rotina "${treat.nome}" removida.`, 'info');
        setDeleteRequest(null);
      },
    });
  };

  const handleToggleTreatmentStatus = (treatmentId, newStatus) => {
    const updated = treatments.map((t) =>
      t.id === treatmentId ? { ...t, status: newStatus } : t
    );
    setTreatments(updated);
    saveStoredTreatments(updated);
    showToast('Status da rotina alterado.', 'info');
  };

  const handleToggleDoseStatus = (doseId, newStatus) => {
    const updatedDoses = doses.map((d) => {
      if (d.id !== doseId) return d;

      const isTaken = newStatus === 'taken';
      const updatedItem = {
        ...d,
        status: newStatus,
        takenAt: isTaken ? new Date().toISOString() : null,
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

  const openAddTreatment = () => {
    setTreatmentToEdit(null);
    setIsTreatmentModalOpen(true);
  };

  const openEditTreatment = (t) => {
    setTreatmentToEdit(t);
    setIsTreatmentModalOpen(true);
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
            medications={medications}
            treatments={treatments}
            onToggleDoseStatus={handleToggleDoseStatus}
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

      <TreatmentFormModal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        onSave={handleSaveTreatment}
        treatmentToEdit={treatmentToEdit}
        availableMedications={medications}
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
