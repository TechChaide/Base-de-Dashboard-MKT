import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { PushNotificationItem } from '../types';

interface PushNotificationToastProps {
  alert: PushNotificationItem | null;
  onDismiss: () => void;
  onOpenCenter: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  alert,
  onDismiss,
  onOpenCenter,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 bg-white/95 ${
          alert.level === 'critical'
            ? 'border-rose-300 ring-4 ring-rose-100/60'
            : alert.level === 'positive'
            ? 'border-emerald-300 ring-4 ring-emerald-100/60'
            : 'border-amber-300 ring-4 ring-amber-100/60'
        }`}
      >
        <div className="p-1.5 rounded-full bg-slate-50 border border-slate-200 shrink-0">
          {alert.level === 'critical' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : alert.level === 'positive' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 font-mono">
              Notificación Push Crítica
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">{alert.title}</h4>
          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">{alert.message}</p>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 font-semibold">
              {alert.entityName}: {alert.metricValue}
            </span>
            <button
              onClick={() => {
                onDismiss();
                onOpenCenter();
              }}
              className="text-xs text-[#002B66] hover:text-[#0056B3] font-bold hover:underline cursor-pointer"
            >
              Ver en Centro →
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
