import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true">
      <div className="flex min-h-dvh items-start justify-center p-2 text-center sm:items-center sm:p-4">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative my-2 w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-xl transition-all animate-fade-in sm:my-8 sm:max-h-[calc(100dvh-2rem)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="min-w-0 text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-ring"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[calc(100dvh-5rem)] overflow-y-auto px-4 py-4 overscroll-contain sm:px-6 sm:py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
