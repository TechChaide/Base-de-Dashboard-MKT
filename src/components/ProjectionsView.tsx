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
import { TrendingUp, Target, Calendar, Sparkles } from 'lucide-react';
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Proyecciones Comerciales & Estimación de Cierre
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
              Modelo Estadístico Predictivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Estimación ajustada por estacionalidad ecuatoriana (Día de la Madre, Black Friday, Décimos)
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Horizon slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Horizonte:</span>
            <span className="font-bold text-blue-400">{forecastMonths} meses</span>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={forecastMonths}
              onChange={e => setForecastMonths(parseInt(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Scenario buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
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
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activeScenario === sc.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Histórico YTD</span>
          <div className="text-xl font-bold text-white font-['Outfit'] mt-1">
            {formatCurrency(projectionData.historicalTotal)}
          </div>
          <span className="text-[11px] text-slate-400">Ventas efectivas registradas</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Proyección Restante</span>
          <div className="text-xl font-bold text-blue-400 font-['Outfit'] mt-1">
            {formatCurrency(projectionData.projectedRemainingTotal)}
          </div>
          <span className="text-[11px] text-slate-400">Próximos {forecastMonths} meses proyectados</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cierre Anual Estimado</span>
          <div className="text-xl font-bold text-emerald-400 font-['Outfit'] mt-1">
            {formatCurrency(projectionData.projectedFullYearTotal)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            +{projectionData.projectedYoYGrowth}% vs año anterior
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Brecha vs Presupuesto</span>
          <div
            className={`text-xl font-bold font-['Outfit'] mt-1 ${
              projectionData.projectedBudgetGap >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {projectionData.projectedBudgetGap >= 0 ? '+' : ''}
            {formatCurrency(projectionData.projectedBudgetGap)}
          </div>
          <span className="text-[11px] text-slate-400">
            {projectionData.projectedBudgetGap >= 0 ? 'Superávit proyectado' : 'Requiere plan de contingencia'}
          </span>
        </div>
      </div>

      {/* Trajectory Forecast Chart */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider">
            Trayectoria Mensual: Histórico vs Proyección {activeScenario.toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            * Los puntos con asterisco representan meses proyectados
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartFormattedData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#f8fafc',
                  borderRadius: '8px',
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
                fill="#3b82f6"
                stroke="transparent"
                fillOpacity={0.08}
              />

              {/* Budget Target Line */}
              <Line
                type="monotone"
                dataKey="budget"
                name="Presupuesto Asignado"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />

              {/* Actual Sales Line (for historical points) */}
              <Line
                type="monotone"
                dataKey="displaySales"
                name="Venta Real Registrada"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
              />

              {/* Projected Line (for forecast points) */}
              <Line
                type="monotone"
                dataKey="projectedLine"
                name="Proyección Modelo"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: '#10b981' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
