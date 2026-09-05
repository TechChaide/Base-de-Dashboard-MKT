import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Sliders,
  Sparkles,
  Volume2,
  X
} from 'lucide-react';
import { AlertRule, PushNotificationItem } from '../types';
import {
  playNotificationSound,
  requestPushPermission,
  sendBrowserPush
} from '../utils/pushNotifications';

interface AlertsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AlertRule[];
  onUpdateRules: (newRules: AlertRule[]) => void;
  activeAlerts: PushNotificationItem[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  onTriggerTestAlert: () => void;
}

export const AlertsManagerModal: React.FC<AlertsManagerModalProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateRules,
  activeAlerts,
  onDismissAlert,
  onClearAllAlerts,
  onTriggerTestAlert,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const status = await requestPushPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      sendBrowserPush(
        'Notificaciones Push Chaide Activadas',
        'El sistema notificará cambios críticos en ventas, márgenes y metas comerciales.'
      );
    }
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated);
  };

  const handleThresholdChange = (ruleId: string, newThreshold: number) => {
    const updated = rules.map(r => (r.id === ruleId ? { ...r, threshold: newThreshold } : r));
    onUpdateRules(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Centro de Notificaciones & Alertas Críticas
              </h2>
              <p className="text-xs text-slate-400">
                Monitoreo automático de umbrales y avisos push para gerencia comercial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar / Push Permission Banner */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Estado Notificaciones Push:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : permissionStatus === 'denied'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}
            >
              {permissionStatus === 'granted'
                ? 'Habilitadas'
                : permissionStatus === 'denied'
                ? 'Bloqueadas en Navegador'
                : 'Pendiente de Permiso'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {permissionStatus !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Permitir en Navegador
              </button>
            )}

            <button
              onClick={() => {
                playNotificationSound();
                onTriggerTestAlert();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Probar Alerta Ahora</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Alertas Críticas Activas ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2.5 px-4 border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configuración de Reglas y Umbrales ({rules.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'alerts' ? (
            <div>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-10 bg-slate-950 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-white">Todos los indicadores en rango saludable</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No se han detectado brechas de presupuesto, contracciones severas ni márgenes por debajo del umbral mínimo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>Lista de desviaciones críticas identificadas en tiempo real:</span>
                    <button
                      onClick={onClearAllAlerts}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Limpiar todas
                    </button>
                  </div>

                  {activeAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        alert.level === 'critical'
                          ? 'bg-rose-950/30 border-rose-800/60'
                          : alert.level === 'positive'
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            alert.level === 'critical'
                              ? 'text-rose-400'
                              : alert.level === 'positive'
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-white">{alert.title}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {alert.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px] font-semibold">
                              {alert.metricValue}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Entidad: {alert.entityName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Personaliza las condiciones que disparan notificaciones automáticas y avisos al personal:
              </div>

              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white">{rule.name}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                      Alcance: {rule.scope}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs pl-6">
                    <span className="text-slate-400">
                      Disparar si el indicador es{' '}
                      <span className="font-semibold text-slate-200">
                        {rule.condition === 'less_than' ? 'menor que' : 'mayor que'}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rule.threshold}
                        onChange={e => handleThresholdChange(rule.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-slate-900 text-white font-mono rounded border border-slate-700 text-right focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400 font-mono">
                        {rule.metric === 'returnRate' || rule.metric === 'grossMargin' || rule.metric === 'yoyGrowth' || rule.metric === 'fulfillment' ? '%' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {activeAlerts.length} alerta(s) activa(s) actualmente
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
