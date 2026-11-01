import React, { useEffect } from 'react';
import { RotateCcw, X, Trash2 } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastNoticeProps {
  message: string | null;
  action?: ToastAction;
  onDismiss: () => void;
  durationMs?: number;
}

export const ToastNotice: React.FC<ToastNoticeProps> = ({
  message,
  action,
  onDismiss,
  durationMs = 6000
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-70 max-w-md bg-slate-900 border border-rose-900/50 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 shrink-0">
          <Trash2 className="w-4 h-4" />
        </div>
        <p className="text-xs text-slate-200 truncate">{message}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950 text-rose-300 hover:text-white hover:bg-rose-900 border border-rose-800/60 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{action.label}</span>
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
