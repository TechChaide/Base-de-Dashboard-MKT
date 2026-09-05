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
        className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${
          alert.level === 'critical'
            ? 'bg-slate-900/95 border-rose-600/80 text-white'
            : alert.level === 'positive'
            ? 'bg-slate-900/95 border-emerald-600/80 text-white'
            : 'bg-slate-900/95 border-amber-600/80 text-white'
        }`}
      >
        <div className="p-1 rounded-full bg-slate-800 shrink-0">
          {alert.level === 'critical' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : alert.level === 'positive' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 font-mono">
              Notificación Push Crítica
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
          </div>

          <h4 className="text-xs font-bold text-white mt-0.5 truncate">{alert.title}</h4>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">{alert.message}</p>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-200">
              {alert.entityName}: {alert.metricValue}
            </span>
            <button
              onClick={() => {
                onDismiss();
                onOpenCenter();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
            >
              Ver en Centro →
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
