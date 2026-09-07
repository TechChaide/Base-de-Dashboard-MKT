import React, { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Calendar } from 'lucide-react';
import { SalesRecord } from '../types';
import { computeProjections } from '../utils/projections';

interface ProjectionsViewProps {
  records: SalesRecord[];
}

export const ProjectionsView: React.FC<ProjectionsViewProps> = ({ records }) => {
  const [forecastMonths, setForecastMonths] = useState<number>(6);
  const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');

  const projectionData = useMemo(() => {
    return computeProjections(records, forecastMonths);
  }, [records, forecastMonths]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const chartFormattedData = useMemo(() => {
    return projectionData.forecastPoints.map(p => ({
      ...p,
      displaySales: p.isProjected ? null : p.historicalSales,
      projectedLine: p.isProjected
        ? activeScenario === 'optimistic'
          ? p.forecastOptimistic
          : activeScenario === 'pessimistic'
          ? p.forecastPessimistic
          : p.forecastBase
        : p.historicalSales,
    }));
  }, [projectionData.forecastPoints, activeScenario]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,43,102,0.04)] flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#002B66] font-['Outfit']">
              Proyecciones Comerciales & Estimación de Cierre Chaide
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-[#002B66] border border-sky-200 font-bold">
              Modelo Estadístico Predictivo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimación ajustada por estacionalidad de la industria del descanso (Día de la Madre, Black Friday, Décimos)
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Horizon slider */}
          <div className="flex items-center gap-2 bg-sky-50/70 px-3 py-1.5 rounded-lg border border-sky-100 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#002B66]" />
            <span className="text-slate-600 font-medium">Horizonte:</span>
            <span className="font-bold text-[#002B66]">{forecastMonths} meses</span>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={forecastMonths}
              onChange={e => setForecastMonths(parseInt(e.target.value))}
              className="w-20 accent-[#002B66] cursor-pointer"
            />
          </div>

          {/* Scenario buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(
              [
                { id: 'base', label: 'Base (P50)' },
                { id: 'optimistic', label: 'Optimista (+12%)' },
                { id: 'pessimistic', label: 'Conservador (-9%)' },
              ] as const
            ).map(sc => (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(sc.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeScenario === sc.id
                    ? 'bg-[#002B66] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projection KPI Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Histórico YTD</span>
          <div className="text-xl font-black text-[#002B66] font-['Outfit'] mt-1">
            {formatCurrency(projectionData.historicalTotal)}
          </div>
          <span className="text-[11px] text-slate-500">Ventas efectivas registradas</span>
        </div>

        <div className="bg-sky-50/70 p-3 rounded-lg border border-sky-200/80">
          <span className="text-[11px] font-bold text-[#0056B3] uppercase tracking-wider">Proyección Restante</span>
          <div className="text-xl font-black text-[#0056B3] font-['Outfit'] mt-1">
            {formatCurrency(projectionData.projectedRemainingTotal)}
          </div>
          <span className="text-[11px] text-slate-500">Próximos {forecastMonths} meses proyectados</span>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Cierre Anual Estimado</span>
          <div className="text-xl font-black text-emerald-700 font-['Outfit'] mt-1">
            {formatCurrency(projectionData.projectedFullYearTotal)}
          </div>
          <span className="text-[11px] text-emerald-700 font-bold">
            +{projectionData.projectedYoYGrowth}% vs año anterior
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Brecha vs Presupuesto</span>
          <div
            className={`text-xl font-black font-['Outfit'] mt-1 ${
              projectionData.projectedBudgetGap >= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {projectionData.projectedBudgetGap >= 0 ? '+' : ''}
            {formatCurrency(projectionData.projectedBudgetGap)}
          </div>
          <span className="text-[11px] text-slate-500">
            {projectionData.projectedBudgetGap >= 0 ? 'Superávit estimado' : 'Plan de contingencia sugerido'}
          </span>
        </div>
      </div>

      {/* Trajectory Forecast Chart */}
      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-[#002B66] uppercase tracking-wider">
            Trayectoria Mensual: Histórico Real vs Proyección {activeScenario.toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            * Puntos con asterisco representan meses proyectados
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartFormattedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="monthName" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Confidence Band: area between optimistic and pessimistic for projected points */}
              <Area
                type="monotone"
                dataKey="forecastOptimistic"
                name="Banda Optimista (+12%)"
                fill="#bae6fd"
                stroke="transparent"
                fillOpacity={0.25}
              />

              {/* Budget Target Line */}
              <Line
                type="monotone"
                dataKey="budget"
                name="Presupuesto Meta"
                stroke="#9333ea"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />

              {/* Actual Sales Line (for historical points) */}
              <Line
                type="monotone"
                dataKey="displaySales"
                name="Venta Real Chaide"
                stroke="#002B66"
                strokeWidth={3}
                dot={{ r: 4, fill: '#002B66' }}
              />

              {/* Projected Line (for forecast points) */}
              <Line
                type="monotone"
                dataKey="projectedLine"
                name="Proyección Modelo"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: '#0284c7' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
