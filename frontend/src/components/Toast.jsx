import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-sky-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 text-xs shadow-2xl">
      {icons[toast.type || 'info']}
      <span className="font-medium">{toast.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 ml-2 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
