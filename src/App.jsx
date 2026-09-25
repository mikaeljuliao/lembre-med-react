import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Toast from './components/common/Toast';

import DashboardView from './components/dashboard/DashboardView';
import MedicationListView from './components/medicamentos/MedicationListView';
import MedicationFormModal from './components/medicamentos/MedicationFormModal';
import MedicationDetailModal from './components/medicamentos/MedicationDetailModal';

import TreatmentListView from './components/tratamentos/TreatmentListView';
import TreatmentFormModal from './components/tratamentos/TreatmentFormModal';

import ScheduleView from './components/agenda/ScheduleView';
import HistoryView from './components/historico/HistoryView';
import StockView from './components/estoque/StockView';
import OfficialInfoView from './components/informacoes/OfficialInfoView';

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
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const [officialInfoSelectedId, setOfficialInfoSelectedId] = useState(null);

  useEffect(() => {
    const loadedMeds = getStoredMedications();
    const loadedTreats = getStoredTreatments();
    const loadedHistory = getStoredHistory();
    setMedications(loadedMeds);
    setTreatments(loadedTreats);
    setHistory(loadedHistory);
  }, []);

  useEffect(() => {
    const loadedDoses = getStoredDoses(selectedDate);
    setDoses(loadedDoses);
  }, [selectedDate, treatments]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSaveMedication = (medData) => {
    let updated;
    const exists = medications.some((m) => m.id === medData.id);
    if (exists) {
      updated = medications.map((m) => (m.id === medData.id ? medData : m));
      showToast(`Medicamento "${medData.nome}" atualizado com sucesso!`);
    } else {
      updated = [medData, ...medications];
      showToast(`Medicamento "${medData.nome}" cadastrado com sucesso!`);
    }
    setMedications(updated);
    saveStoredMedications(updated);
  };

  const handleDeleteMedication = (medId) => {
    const medToDelete = medications.find((m) => m.id === medId);
    if (!medToDelete) return;

    if (window.confirm(`Deseja realmente remover o medicamento "${medToDelete.nome}"?`)) {
      const updated = medications.filter((m) => m.id !== medId);
      setMedications(updated);
      saveStoredMedications(updated);
      showToast(`Medicamento "${medToDelete.nome}" removido.`, 'info');
    }
  };

  const handleUpdateStock = (medId, newTotal) => {
    const updated = medications.map((m) =>
      m.id === medId ? { ...m, quantidadeEstoque: newTotal } : m
    );
    setMedications(updated);
    saveStoredMedications(updated);
    showToast('Estoque atualizado com sucesso!');
  };

  const handleSaveTreatment = (treatmentData) => {
    let updated;
    const exists = treatments.some((t) => t.id === treatmentData.id);
    if (exists) {
      updated = treatments.map((t) => (t.id === treatmentData.id ? treatmentData : t));
      showToast(`Tratamento "${treatmentData.nome}" atualizado!`);
    } else {
      updated = [treatmentData, ...treatments];
      showToast(`Tratamento "${treatmentData.nome}" criado com sucesso!`);
    }
    setTreatments(updated);
    saveStoredTreatments(updated);
  };

  const handleDeleteTreatment = (treatmentId) => {
    const treatToDelete = treatments.find((t) => t.id === treatmentId);
    if (!treatToDelete) return;

    if (window.confirm(`Deseja remover o tratamento "${treatToDelete.nome}"?`)) {
      const updated = treatments.filter((t) => t.id !== treatmentId);
      setTreatments(updated);
      saveStoredTreatments(updated);
      showToast(`Tratamento "${treatToDelete.nome}" removido.`, 'info');
    }
  };

  const handleToggleTreatmentStatus = (treatmentId, newStatus) => {
    const updated = treatments.map((t) =>
      t.id === treatmentId ? { ...t, status: newStatus } : t
    );
    setTreatments(updated);
    saveStoredTreatments(updated);
    showToast(`Status do tratamento alterado para "${newStatus}".`, 'info');
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
          observacao: isTaken ? 'Dose registrada pelo usuário.' : 'Dose pulada pelo usuário.',
        });
        setHistory(newHist);

        if (isTaken) {
          const med = medications.find(
            (m) => String(m.id) === String(d.medicationId) || m.nome === d.medicationNome
          );
          if (med) {
            const newStock = Math.max(0, med.quantidadeEstoque - (d.quantidade || 1));
            handleUpdateStock(med.id, newStock);
          }
        }
      }

      return updatedItem;
    });

    setDoses(updatedDoses);
    saveStoredDosesForDate(selectedDate, updatedDoses);

    if (newStatus === 'taken') showToast('Dose registrada como tomada! ✓');
    if (newStatus === 'skipped') showToast('Dose marcada como pulada.', 'info');
    if (newStatus === 'pending') showToast('Dose restaurada para pendente.', 'info');
  };

  const handleNavigateOfficialWithDoc = (offId) => {
    setOfficialInfoSelectedId(offId);
    setActiveTab('informacoes');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            doses={doses}
            medications={medications}
            treatments={treatments}
            onToggleDoseStatus={handleToggleDoseStatus}
            onOpenAddMed={() => {
              setMedicationToEdit(null);
              setIsMedModalOpen(true);
            }}
            onOpenAddTreatment={() => {
              setTreatmentToEdit(null);
              setIsTreatmentModalOpen(true);
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'medicamentos' && (
          <MedicationListView
            medications={medications}
            onOpenAdd={() => {
              setMedicationToEdit(null);
              setIsMedModalOpen(true);
            }}
            onEdit={(med) => {
              setMedicationToEdit(med);
              setIsMedModalOpen(true);
            }}
            onDelete={handleDeleteMedication}
            onViewDetails={(med) => {
              setSelectedDetailMed(med);
              setIsDetailMedOpen(true);
            }}
            onNavigateOfficial={handleNavigateOfficialWithDoc}
          />
        )}

        {activeTab === 'tratamentos' && (
          <TreatmentListView
            treatments={treatments}
            onOpenAdd={() => {
              setTreatmentToEdit(null);
              setIsTreatmentModalOpen(true);
            }}
            onEdit={(t) => {
              setTreatmentToEdit(t);
              setIsTreatmentModalOpen(true);
            }}
            onDelete={handleDeleteTreatment}
            onToggleStatus={handleToggleTreatmentStatus}
          />
        )}

        {activeTab === 'agenda' && (
          <ScheduleView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            doses={doses}
            onToggleDoseStatus={handleToggleDoseStatus}
          />
        )}

        {activeTab === 'historico' && <HistoryView history={history} />}

        {activeTab === 'estoque' && (
          <StockView
            medications={medications}
            treatments={treatments}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'informacoes' && (
          <OfficialInfoView initialSelectedId={officialInfoSelectedId} />
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
        onOpenOfficialInfo={handleNavigateOfficialWithDoc}
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
