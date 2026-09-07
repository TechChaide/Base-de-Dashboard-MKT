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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 border border-sky-200 text-[#002B66]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#002B66] font-['Outfit']">
                Centro de Notificaciones & Alertas Críticas
              </h2>
              <p className="text-xs text-slate-500">
                Monitoreo automático de umbrales y avisos push para gerencia comercial Chaide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar / Push Permission Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Estado Notificaciones Push:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                permissionStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : permissionStatus === 'denied'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
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
                className="px-2.5 py-1 rounded bg-[#002B66] hover:bg-[#0056B3] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Permitir en Navegador
              </button>
            )}

            <button
              onClick={() => {
                playNotificationSound();
                onTriggerTestAlert();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#002B66]" />
              <span>Probar Alerta Sonora</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-white px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#002B66] text-[#002B66] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Alertas Críticas Activas ({activeAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2.5 px-4 border-b-2 transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'border-[#002B66] text-[#002B66] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
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
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Todos los indicadores en rango saludable</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    No se han detectado brechas de presupuesto, contracciones severas ni márgenes por debajo del umbral mínimo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                    <span>Lista de desviaciones críticas identificadas en tiempo real:</span>
                    <button
                      onClick={onClearAllAlerts}
                      className="text-xs text-[#002B66] font-semibold hover:underline cursor-pointer"
                    >
                      Limpiar todas
                    </button>
                  </div>

                  {activeAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        alert.level === 'critical'
                          ? 'bg-rose-50/70 border-rose-200'
                          : alert.level === 'positive'
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            alert.level === 'critical'
                              ? 'text-rose-600'
                              : alert.level === 'positive'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-slate-900">{alert.title}</h3>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {alert.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">{alert.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold">
                              {alert.metricValue}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Entidad: {alert.entityName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-white text-xs cursor-pointer"
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
              <div className="text-xs text-slate-500">
                Personaliza las condiciones que disparan notificaciones automáticas y avisos al personal:
              </div>

              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="w-4 h-4 rounded text-[#002B66] border-slate-300 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800">{rule.name}</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono font-medium">
                      Alcance: {rule.scope}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-xs pl-6">
                    <span className="text-slate-500">
                      Disparar si el indicador es{' '}
                      <span className="font-bold text-slate-800">
                        {rule.condition === 'less_than' ? 'menor que' : 'mayor que'}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={rule.threshold}
                        onChange={e => handleThresholdChange(rule.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white text-slate-900 font-mono font-bold rounded border border-slate-300 text-right focus:outline-none focus:border-[#002B66]"
                      />
                      <span className="text-slate-500 font-mono font-semibold">
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {activeAlerts.length} alerta(s) activa(s) actualmente
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#002B66] hover:bg-[#0056B3] text-white font-bold transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
