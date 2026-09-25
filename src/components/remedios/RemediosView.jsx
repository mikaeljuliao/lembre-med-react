import React from 'react';
import MedicationListView from '../medicamentos/MedicationListView';

export default function RemediosView({
  medications = [],
  onOpenAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onNavigateOfficial,
}) {
  return (
    <div className="animate-fade-in pb-24">
      <MedicationListView
        medications={medications}
        onOpenAdd={onOpenAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onNavigateOfficial={onNavigateOfficial}
      />
    </div>
  );
}
