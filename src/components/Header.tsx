import React from 'react';
import { Bell, Download, RefreshCw, Upload, Sparkles, Building2 } from 'lucide-react';
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
    <header className="bg-white border-b border-sky-100/90 text-slate-800 sticky top-0 z-30 shadow-[0_1px_4px_rgba(0,43,102,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#002B66] flex items-center justify-center font-extrabold text-white tracking-wider text-base shadow-sm ring-2 ring-sky-100">
              CH
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xl text-[#002B66] tracking-wider font-['Outfit']">CHAIDE</span>
                <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-sky-100 text-[#002B66] font-bold border border-sky-200">
                  Analytics Hub
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">• Inteligencia Comercial & Operativa</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Panel Institucional de Ventas, Proyecciones y Rendimiento por Región
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Records indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-700 font-semibold">
                {filteredRecordsCount.toLocaleString()} / {totalRecordsCount.toLocaleString()}
              </span>
              <span className="text-slate-500">registros</span>
            </div>

            {/* Test Simulation Alert Button */}
            <button
              onClick={onTriggerTestAlert}
              title="Simular cambio crítico en indicadores y disparar notificación push"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#002B66] text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Simular Alerta Crítica</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenAlertsModal}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              title="Ver notificaciones y configuración de alertas críticas"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              title="Cargar base de datos personalizada o descargar CSV"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Datos CSV</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetData}
              className="inline-flex items-center p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
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
