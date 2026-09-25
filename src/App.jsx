import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';

import InicioView from './components/dashboard/InicioView';
import RemediosView from './components/remedios/RemediosView';
import MinhaRotinaView from './components/rotina/MinhaRotinaView';
import CuidadorView from './components/cuidador/CuidadorView';

import MedicationFormModal from './components/medicamentos/MedicationFormModal';
import MedicationDetailModal from './components/medicamentos/MedicationDetailModal';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [simpleMode, setSimpleMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [medications, setMedications] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [doses, setDoses] = useState([]);
  const [history, setHistory] = useState([]);

  const [toast, setToast] = useState(null);

  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);

  const [isDetailMedOpen, setIsDetailMedOpen] = useState(false);
  const [selectedDetailMed, setSelectedDetailMed] = useState(null);

  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [treatmentToEdit, setTreatmentToEdit] = useState(null);

  useEffect(() => {
    setMedications(getStoredMedications());
    setTreatments(getStoredTreatments());
    setHistory(getStoredHistory());
  }, []);

  useEffect(() => {
    setDoses(getStoredDoses(selectedDate));
  }, [selectedDate, treatments]);

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

  const handleDeleteMedication = (medId) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    if (window.confirm(`Remover o medicamento "${med.nome}"?`)) {
      const updated = medications.filter((m) => m.id !== medId);
      setMedications(updated);
      saveStoredMedications(updated);
      showToast(`"${med.nome}" removido.`, 'info');
    }
  };

  const handleUpdateStock = (medId, newTotal) => {
    const updated = medications.map((m) =>
      m.id === medId ? { ...m, quantidadeEstoque: newTotal } : m
    );
    setMedications(updated);
    saveStoredMedications(updated);
    showToast('Estoque atualizado.');
  };

  const handleSaveTreatment = (treatmentData) => {
    const exists = treatments.some((t) => t.id === treatmentData.id);
    const updated = exists
      ? treatments.map((t) => (t.id === treatmentData.id ? treatmentData : t))
      : [treatmentData, ...treatments];
    setTreatments(updated);
    saveStoredTreatments(updated);
    showToast(exists ? `Rotina "${treatmentData.nome}" atualizada.` : `Rotina "${treatmentData.nome}" criada.`);
  };

  const handleDeleteTreatment = (treatmentId) => {
    const treat = treatments.find((t) => t.id === treatmentId);
    if (!treat) return;
    if (window.confirm(`Remover a rotina "${treat.nome}"?`)) {
      const updated = treatments.filter((t) => t.id !== treatmentId);
      setTreatments(updated);
      saveStoredTreatments(updated);
      showToast(`Rotina "${treat.nome}" removida.`, 'info');
    }
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

        if (isTaken) {
          const med = medications.find(
            (m) => String(m.id) === String(d.medicationId) || m.nome === d.medicationNome
          );
          if (med) {
            handleUpdateStock(med.id, Math.max(0, med.quantidadeEstoque - (d.quantidade || 1)));
          }
        }
      }

      return updatedItem;
    });

    setDoses(updatedDoses);
    saveStoredDosesForDate(selectedDate, updatedDoses);

    if (newStatus === 'taken') showToast('Dose registrada! ✓');
    if (newStatus === 'skipped') showToast('Dose não registrada.', 'info');
    if (newStatus === 'pending') showToast('Dose restaurada para pendente.', 'info');
  };

  const openAddMed = () => {
    setMedicationToEdit(null);
    setIsMedModalOpen(true);
  };

  const openEditMed = (med) => {
    setMedicationToEdit(med);
    setIsMedModalOpen(true);
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
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans ${simpleMode ? 'simple-mode' : ''}`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        simpleMode={simpleMode}
        onToggleSimpleMode={() => setSimpleMode((v) => !v)}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-5">
        {activeTab === 'inicio' && (
          <InicioView
            doses={doses}
            medications={medications}
            treatments={treatments}
            onToggleDoseStatus={handleToggleDoseStatus}
            onNavigate={setActiveTab}
            simpleMode={simpleMode}
          />
        )}

        {activeTab === 'remedios' && (
          <RemediosView
            medications={medications}
            onOpenAdd={openAddMed}
            onEdit={openEditMed}
            onDelete={handleDeleteMedication}
            onViewDetails={(med) => {
              setSelectedDetailMed(med);
              setIsDetailMedOpen(true);
            }}
            onNavigateOfficial={() => setActiveTab('cuidador')}
          />
        )}

        {activeTab === 'rotina' && (
          <MinhaRotinaView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            doses={doses}
            treatments={treatments}
            onToggleDoseStatus={handleToggleDoseStatus}
            onOpenAddTreatment={openAddTreatment}
            onEditTreatment={openEditTreatment}
            onDeleteTreatment={handleDeleteTreatment}
            onToggleTreatmentStatus={handleToggleTreatmentStatus}
          />
        )}

        {activeTab === 'cuidador' && (
          <CuidadorView
            medications={medications}
            treatments={treatments}
            history={history}
            onOpenAddMed={openAddMed}
            onEditMed={openEditMed}
            onDeleteMed={handleDeleteMedication}
            onViewMedDetails={(med) => {
              setSelectedDetailMed(med);
              setIsDetailMedOpen(true);
            }}
            onUpdateStock={handleUpdateStock}
            onNavigateOfficial={() => {}}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <MedicationFormModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSave={handleSaveMedication}
        medicationToEdit={medicationToEdit}
      />

      <MedicationDetailModal
        isOpen={isDetailMedOpen}
        onClose={() => setIsDetailMedOpen(false)}
        medication={selectedDetailMed}
        onOpenOfficialInfo={() => setActiveTab('cuidador')}
      />

      <TreatmentFormModal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        onSave={handleSaveTreatment}
        treatmentToEdit={treatmentToEdit}
        availableMedications={medications}
      />
    </div>
  );
}
