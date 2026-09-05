import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart3,
  Compass,
  FileSpreadsheet,
  LineChart,
  MapPin,
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { AlertRule, FilterState, MetricKey, PushNotificationItem, SalesRecord } from './types';
import { INITIAL_DATASET, REGIONS } from './data/chaideData';
import { DEFAULT_ALERT_RULES, evaluateAlertRules, playNotificationSound, sendBrowserPush } from './utils/pushNotifications';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MetricCards } from './components/MetricCards';
import { CrossAnalyticsView } from './components/CrossAnalyticsView';
import { EcuadorMapComparative } from './components/EcuadorMapComparative';
import { ProjectionsView } from './components/ProjectionsView';
import { AlertsManagerModal } from './components/AlertsManagerModal';
import { DataImportExportModal } from './components/DataImportExportModal';
import { PushNotificationToast } from './components/PushNotificationToast';

export default function App() {
  // 1. Data state
  const [dataset, setDataset] = useState<SalesRecord[]>(() => INITIAL_DATASET);

  // Available years in dataset
  const availableYears = useMemo(() => {
    const ySet = new Set<number>();
    dataset.forEach(r => ySet.add(r.year));
    return Array.from(ySet).sort((a, b) => b - a);
  }, [dataset]);

  // 2. Dynamic filter state
  const [filters, setFilters] = useState<FilterState>({
    years: [2026],
    months: [],
    regions: [],
    cities: [],
    categories: [],
    channels: [],
    selectedMetric: 'salesAmount',
    searchTerm: '',
  });

  // 3. Navigation view tabs
  const [activeTab, setActiveTab] = useState<'all' | 'cross' | 'map' | 'projections'>('all');

  // 4. Alerts & Notifications state
  const [alertRules, setAlertRules] = useState<AlertRule[]>(() => DEFAULT_ALERT_RULES);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<PushNotificationItem | null>(null);

  // 5. Filtered records (Memoized for high performance)
  const filteredRecords = useMemo(() => {
    const sTerm = filters.searchTerm.trim().toLowerCase();
    return dataset.filter(r => {
      // Year filter
      if (filters.years.length > 0 && !filters.years.includes(r.year)) return false;
      // Month filter
      if (filters.months.length > 0 && !filters.months.includes(r.month)) return false;
      // Region filter
      if (filters.regions.length > 0 && !filters.regions.includes(r.region)) return false;
      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(r.city)) return false;
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(r.category)) return false;
      // Channel filter
      if (filters.channels.length > 0 && !filters.channels.includes(r.channel)) return false;
      // Search term (product name or city)
      if (sTerm && !r.productName.toLowerCase().includes(sTerm) && !r.city.toLowerCase().includes(sTerm)) {
        return false;
      }
      return true;
    });
  }, [dataset, filters]);

  // 6. Previous period records (for accurate YoY variance)
  const previousPeriodRecords = useMemo(() => {
    const primaryYear = filters.years.length > 0 ? Math.max(...filters.years) : 2026;
    const targetPrevYear = primaryYear - 1;
    const sTerm = filters.searchTerm.trim().toLowerCase();

    return dataset.filter(r => {
      if (r.year !== targetPrevYear) return false;
      if (filters.months.length > 0 && !filters.months.includes(r.month)) return false;
      if (filters.regions.length > 0 && !filters.regions.includes(r.region)) return false;
      if (filters.cities.length > 0 && !filters.cities.includes(r.city)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(r.category)) return false;
      if (filters.channels.length > 0 && !filters.channels.includes(r.channel)) return false;
      if (sTerm && !r.productName.toLowerCase().includes(sTerm) && !r.city.toLowerCase().includes(sTerm)) {
        return false;
      }
      return true;
    });
  }, [dataset, filters]);

  // 7. Auto-evaluate alert rules on filtered set
  const detectedAlerts = useMemo(() => {
    const allDetected = evaluateAlertRules(filteredRecords, alertRules);
    return allDetected.filter(a => !dismissedAlertIds.includes(a.id));
  }, [filteredRecords, alertRules, dismissedAlertIds]);

  // Handle simulation of critical alert
  const handleTriggerTestAlert = () => {
    playNotificationSound();
    const simulatedAlert: PushNotificationItem = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Alerta Crítica: Desvío en Plaza Guayaquil',
      message: 'Las ventas en Guayaquil cayeron 14.8% YoY y el margen en Colchones Ortopédicos bajó al 29.4%. Acción requerida.',
      level: 'critical',
      entityName: 'Guayaquil - Costa',
      metricValue: '-14.8% YoY / 29.4% Margen',
      read: false,
    };

    setToastAlert(simulatedAlert);
    sendBrowserPush(
      simulatedAlert.title,
      `${simulatedAlert.entityName}: ${simulatedAlert.message}`
    );
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds(prev => [...prev, id]);
  };

  const handleClearAllAlerts = () => {
    setDismissedAlertIds(detectedAlerts.map(a => a.id));
  };

  const handleResetDefaultData = () => {
    setDataset(INITIAL_DATASET);
  };

  const handleImportNewData = (newRecords: SalesRecord[]) => {
    setDataset(newRecords);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Corporate Header */}
      <Header
        totalRecordsCount={dataset.length}
        filteredRecordsCount={filteredRecords.length}
        unreadAlertsCount={detectedAlerts.length}
        activeAlerts={detectedAlerts}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetData={handleResetDefaultData}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* 2. Interactive Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() =>
          setFilters({
            years: [2026],
            months: [],
            regions: [],
            cities: [],
            categories: [],
            channels: [],
            selectedMetric: 'salesAmount',
            searchTerm: '',
          })
        }
        availableYears={availableYears}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        
        {/* Module Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Vista Integral</span>
            </button>

            <button
              onClick={() => setActiveTab('cross')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'cross'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Cruce de Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mapa & Ciudades</span>
            </button>

            <button
              onClick={() => setActiveTab('projections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'projections'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Proyecciones</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            <span>Filtro temporal activo:</span>
            <span className="font-mono text-slate-200 font-semibold">
              {filters.years.join(', ')}
            </span>
            <span>• Moneda: <strong className="text-slate-200">USD</strong></span>
          </div>
        </div>

        {/* 4. Executive KPI Summary Cards */}
        <MetricCards
          currentRecords={filteredRecords}
          previousRecords={previousPeriodRecords}
        />

        {/* 5. Modules based on active tab */}
        {/* Module A: Cross Analytics Pivot & Heatmap Table */}
        {(activeTab === 'all' || activeTab === 'cross') && (
          <section id="module-cross">
            <CrossAnalyticsView
              records={filteredRecords}
              activeMetric={filters.selectedMetric}
              onMetricChange={(m: MetricKey) => setFilters(prev => ({ ...prev, selectedMetric: m }))}
            />
          </section>
        )}

        {/* Module B: Interactive Ecuador Cities Map with Growth vs Drop Highlighting */}
        {(activeTab === 'all' || activeTab === 'map') && (
          <section id="module-map">
            <EcuadorMapComparative
              currentRecords={filteredRecords}
              previousRecords={previousPeriodRecords}
              onCityFilterSelect={(cityName: string) => {
                setFilters(prev => ({ ...prev, cities: [cityName] }));
              }}
            />
          </section>
        )}

        {/* Module C: Statistical Projections & Forecasting */}
        {(activeTab === 'all' || activeTab === 'projections') && (
          <section id="module-projections">
            <ProjectionsView records={filteredRecords} />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Chaide y Chaide S.A. • Centro de Control Analítico de Ventas Multirregional
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Cobertura Nacional: Sierra, Costa, Austro, Oriente</span>
            <span>Motor Predictivo v2.4</span>
          </div>
        </div>
      </footer>

      {/* Push Notification Floating Toast */}
      <PushNotificationToast
        alert={toastAlert}
        onDismiss={() => setToastAlert(null)}
        onOpenCenter={() => setIsAlertsModalOpen(true)}
      />

      {/* Alerts Manager Modal */}
      <AlertsManagerModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        rules={alertRules}
        onUpdateRules={setAlertRules}
        activeAlerts={detectedAlerts}
        onDismissAlert={handleDismissAlert}
        onClearAllAlerts={handleClearAllAlerts}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* CSV Data Import / Export Modal */}
      <DataImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        currentDataset={filteredRecords}
        onImportData={handleImportNewData}
        onResetDefault={handleResetDefaultData}
      />

    </div>
  );
}
