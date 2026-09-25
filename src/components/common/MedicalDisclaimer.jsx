import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-3 text-xs text-slate-600 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Aviso importante:</span> O DoseFácil é uma ferramenta de organização e acompanhamento pessoal. Não realiza diagnósticos nem prescreve tratamentos. Sempre consulte seu médico ou farmacêutico.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 flex items-start space-x-3.5 shadow-xs">
      <div className="bg-blue-100 p-2 rounded-lg shrink-0">
        <ShieldAlert className="w-5 h-5 text-blue-700" />
      </div>
      <div className="text-sm text-slate-600 leading-relaxed">
        <h4 className="font-semibold text-slate-900 mb-0.5">Ferramenta de Organização e Acompanhamento</h4>
        <p>
          O DoseFácil não substitui a orientação profissional de médicos ou farmacêuticos. As informações apresentadas servem para auxiliar no acompanhamento dos seus medicamentos e tratamentos já prescritos.
        </p>
      </div>
    </div>
  );
}
