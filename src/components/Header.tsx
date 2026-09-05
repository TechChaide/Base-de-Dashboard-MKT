import React from 'react';
import { Bell, Download, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { PushNotificationItem } from '../types';

interface HeaderProps {
  totalRecordsCount: number;
  filteredRecordsCount: number;
  unreadAlertsCount: number;
  activeAlerts: PushNotificationItem[];
  onOpenAlertsModal: () => void;
  onOpenImportExport: () => void;
  onResetData: () => void;
  onTriggerTestAlert: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRecordsCount,
  filteredRecordsCount,
  unreadAlertsCount,
  onOpenAlertsModal,
  onOpenImportExport,
  onResetData,
  onTriggerTestAlert,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-widest text-lg shadow-sm">
              CH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-wider font-['Outfit']">CHAIDE</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-semibold border border-blue-700/50">
                  Analytics Hub
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Sistema de Inteligencia Comercial</span>
              </div>
              <p className="text-xs text-slate-400">
                Rendimiento de Ventas, Proyecciones y Cruce Multirregional
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Records indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">
                {filteredRecordsCount.toLocaleString()} / {totalRecordsCount.toLocaleString()}
              </span>
              <span className="text-slate-400">registros activos</span>
            </div>

            {/* Test Simulation Alert Button */}
            <button
              onClick={onTriggerTestAlert}
              title="Simular cambio crítico en indicadores y disparar notificación push"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simular Alerta Crítica</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenAlertsModal}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Ver notificaciones y configuración de alertas críticas"
            >
              <Bell className="w-3.5 h-3.5 text-slate-300" />
              <span>Alertas</span>
              {unreadAlertsCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-[10px] animate-bounce">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Import / Export */}
            <button
              onClick={onOpenImportExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Cargar base de datos personalizada o descargar CSV"
            >
              <Upload className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Datos CSV</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetData}
              className="inline-flex items-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Restablecer base de datos inicial Chaide"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
