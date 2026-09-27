import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-fade-in max-w-sm">
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg border ${
          isSuccess
            ? 'bg-emerald-900 text-white border-emerald-700'
            : isError
            ? 'bg-red-900 text-white border-red-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white focus:outline-hidden"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
