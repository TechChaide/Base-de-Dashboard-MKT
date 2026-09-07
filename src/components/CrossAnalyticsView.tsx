import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CrossPivotMode, MetricKey, SalesRecord } from '../types';
import { MONTH_SHORT_NAMES } from '../data/chaideData';

interface CrossAnalyticsViewProps {
  records: SalesRecord[];
  activeMetric: MetricKey;
  onMetricChange: (metric: MetricKey) => void;
}

export const CrossAnalyticsView: React.FC<CrossAnalyticsViewProps> = ({
  records,
  activeMetric,
  onMetricChange,
}) => {
  const [pivotMode, setPivotMode] = useState<CrossPivotMode>('region_vs_product');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Define cross buttons configuration
  const crossOptions: { id: CrossPivotMode; label: string; rowLabel: string; colLabel: string }[] = [
    { id: 'region_vs_product', label: 'Región × Categoría', rowLabel: 'Región', colLabel: 'Línea de Producto' },
    { id: 'city_vs_channel', label: 'Ciudad × Canal', rowLabel: 'Ciudad', colLabel: 'Canal de Venta' },
    { id: 'month_vs_year', label: 'Mes × Año (Evolución)', rowLabel: 'Mes', colLabel: 'Año' },
    { id: 'sales_vs_budget', label: 'Real vs Presupuesto', rowLabel: 'Región', colLabel: 'Comparativa' },
    { id: 'product_vs_margin', label: 'Categoría × Margen', rowLabel: 'Categoría', colLabel: 'Desempeño' },
  ];

  // Memoized aggregation for maximum speed
  const { rowKeys, colKeys, matrix, colTotals, rowTotals, grandTotal } = useMemo(() => {
    const rSet = new Set<string>();
    const cSet = new Set<string>();
    const cellMap: Record<string, Record<string, { sales: number; units: number; budget: number; cost: number }>> = {};

    records.forEach(rec => {
      let rKey = '';
      let cKey = '';

      switch (pivotMode) {
        case 'region_vs_product':
          rKey = rec.region;
          cKey = rec.category;
          break;
        case 'city_vs_channel':
          rKey = rec.city;
          cKey = rec.channel.replace('Chaide', '').trim();
          break;
        case 'month_vs_year':
          rKey = MONTH_SHORT_NAMES[rec.month - 1];
          cKey = String(rec.year);
          break;
        case 'sales_vs_budget':
          rKey = rec.region;
          cKey = rec.category;
          break;
        case 'product_vs_margin':
          rKey = rec.category;
          cKey = rec.region;
          break;
      }

      rSet.add(rKey);
      cSet.add(cKey);

      if (!cellMap[rKey]) cellMap[rKey] = {};
      if (!cellMap[rKey][cKey]) {
        cellMap[rKey][cKey] = { sales: 0, units: 0, budget: 0, cost: 0 };
      }

      cellMap[rKey][cKey].sales += rec.salesAmount;
      cellMap[rKey][cKey].units += rec.units;
      cellMap[rKey][cKey].budget += rec.budgetAmount;
      cellMap[rKey][cKey].cost += rec.costAmount;
    });

    const rows = Array.from(rSet);
    const cols = Array.from(cSet).sort();

    // Helper to evaluate value by active metric
    const getMetricValue = (cell?: { sales: number; units: number; budget: number; cost: number }) => {
      if (!cell) return 0;
      switch (activeMetric) {
        case 'salesAmount':
          return cell.sales;
        case 'units':
          return cell.units;
        case 'budgetAmount':
          return cell.budget;
        case 'grossMargin':
          return cell.sales > 0 ? ((cell.sales - cell.cost) / cell.sales) * 100 : 0;
        case 'fulfillment':
          return cell.budget > 0 ? (cell.sales / cell.budget) * 100 : 0;
        case 'avgTicket':
          return cell.units > 0 ? cell.sales / cell.units : 0;
        default:
          return cell.sales;
      }
    };

    // Calculate row and col totals
    const rTotals: Record<string, number> = {};
    const cTotals: Record<string, number> = {};
    let gTotal = 0;

    rows.forEach(r => {
      let rSum = 0;
      cols.forEach(c => {
        const val = getMetricValue(cellMap[r]?.[c]);
        rSum += val;
        cTotals[c] = (cTotals[c] || 0) + val;
      });
      rTotals[r] = rSum;
      gTotal += rSum;
    });

    // If month view, sort in chronological month order
    if (pivotMode === 'month_vs_year') {
      rows.sort((a, b) => MONTH_SHORT_NAMES.indexOf(a) - MONTH_SHORT_NAMES.indexOf(b));
    } else {
      rows.sort((a, b) => (sortAsc ? (rTotals[a] || 0) - (rTotals[b] || 0) : (rTotals[b] || 0) - (rTotals[a] || 0)));
    }

    return {
      rowKeys: rows,
      colKeys: cols,
      matrix: cellMap,
      colTotals: cTotals,
      rowTotals: rTotals,
      grandTotal: gTotal,
    };
  }, [records, pivotMode, activeMetric, sortAsc]);

  // Find max value in matrix for heatmap intensity scale
  const maxValue = useMemo(() => {
    let max = 1;
    rowKeys.forEach(r => {
      colKeys.forEach(c => {
        const cell = matrix[r]?.[c];
        if (!cell) return;
        const val =
          activeMetric === 'salesAmount' ? cell.sales :
          activeMetric === 'units' ? cell.units :
          activeMetric === 'grossMargin' ? (cell.sales > 0 ? ((cell.sales - cell.cost) / cell.sales) * 100 : 0) :
          activeMetric === 'fulfillment' ? (cell.budget > 0 ? (cell.sales / cell.budget) * 100 : 0) : cell.sales;
        if (val > max) max = val;
      });
    });
    return max;
  }, [matrix, rowKeys, colKeys, activeMetric]);

  // Format cell value
  const formatValue = (val: number) => {
    if (!val) return '-';
    if (activeMetric === 'salesAmount' || activeMetric === 'budgetAmount' || activeMetric === 'avgTicket') {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${Math.round(val)}`;
    }
    if (activeMetric === 'grossMargin' || activeMetric === 'fulfillment') {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  // Prepare chart dataset based on current cross
  const chartData = useMemo(() => {
    return rowKeys.slice(0, 10).map(rKey => {
      const point: Record<string, string | number> = { name: rKey };
      colKeys.slice(0, 5).forEach(cKey => {
        const cell = matrix[rKey]?.[cKey];
        const val =
          !cell ? 0 :
          activeMetric === 'salesAmount' ? Math.round(cell.sales) :
          activeMetric === 'units' ? cell.units :
          activeMetric === 'grossMargin' ? (cell.sales > 0 ? Number(((cell.sales - cell.cost) / cell.sales * 100).toFixed(1)) : 0) :
          activeMetric === 'fulfillment' ? (cell.budget > 0 ? Number((cell.sales / cell.budget * 100).toFixed(1)) : 0) : Math.round(cell.sales);
        point[cKey] = val;
      });
      return point;
    });
  }, [rowKeys, colKeys, matrix, activeMetric]);

  // Institutional Chaide palette: Deep Navy, Sky Blue, Cyan, Emerald, Indigo, Amber
  const paletteColors = ['#002B66', '#0284C7', '#0EA5E9', '#10B981', '#6366F1', '#F59E0B'];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,43,102,0.04)] flex flex-col gap-5">
      
      {/* Header & Cross Buttons Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#002B66] font-['Outfit']">
              Matriz de Cruce & Comparativas Comerciales
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-[#002B66] border border-sky-200 font-bold">
              Cruce Multidimensional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cruza métricas y dimensiones de Chaide con análisis instantáneo por celda
          </p>
        </div>

        {/* Pivot Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-sky-50/70 p-1.5 rounded-lg border border-sky-100">
          {crossOptions.map(opt => {
            const active = pivotMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setPivotMode(opt.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                  active
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Switcher & Sub-toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Visualizando en celdas:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(
              [
                { key: 'salesAmount', label: '$ Ventas' },
                { key: 'units', label: 'Uds' },
                { key: 'grossMargin', label: 'Margen %' },
                { key: 'fulfillment', label: 'Meta %' },
              ] as const
            ).map(m => (
              <button
                key={m.key}
                onClick={() => onMetricChange(m.key)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  activeMetric === m.key
                    ? 'bg-white text-[#002B66] font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer font-medium"
        >
          Orden: {sortAsc ? 'Menor a Mayor ↑' : 'Mayor a Menor ↓'}
        </button>
      </div>

      {/* Dynamic Heatmap Cross Matrix Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-sky-50/80 border-b border-slate-200 text-[#002B66] font-bold">
              <th className="py-2.5 px-3 whitespace-nowrap min-w-[140px] sticky left-0 bg-sky-50 z-10 border-r border-slate-200">
                {crossOptions.find(o => o.id === pivotMode)?.rowLabel || 'Dimensión'}
              </th>
              {colKeys.map(cKey => (
                <th key={cKey} className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px]">
                  {cKey}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px] text-[#002B66] bg-sky-100/70 border-l border-slate-200 font-black">
                Total Fila
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rowKeys.map(rKey => {
              const rowSum = rowTotals[rKey] || 0;
              return (
                <tr key={rKey} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200">
                    {rKey}
                  </td>
                  {colKeys.map(cKey => {
                    const cell = matrix[rKey]?.[cKey];
                    const val =
                      !cell ? 0 :
                      activeMetric === 'salesAmount' ? cell.sales :
                      activeMetric === 'units' ? cell.units :
                      activeMetric === 'grossMargin' ? (cell.sales > 0 ? ((cell.sales - cell.cost) / cell.sales) * 100 : 0) :
                      activeMetric === 'fulfillment' ? (cell.budget > 0 ? (cell.sales / cell.budget) * 100 : 0) : cell.sales;

                    // Pastel blue saturation scale
                    const intensityRatio = maxValue > 0 ? Math.min(1, Math.max(0, val / maxValue)) : 0;
                    const bgStyle =
                      val > 0
                        ? { backgroundColor: `rgba(0, 86, 179, ${0.04 + intensityRatio * 0.22})` }
                        : {};

                    return (
                      <td
                        key={cKey}
                        style={bgStyle}
                        className="py-2 px-3 text-right font-medium text-slate-800 font-mono tracking-tight"
                      >
                        {formatValue(val)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-3 text-right font-bold text-[#002B66] font-mono bg-sky-50/50 border-l border-slate-200">
                    {activeMetric === 'grossMargin' || activeMetric === 'fulfillment'
                      ? `${(rowSum / (colKeys.length || 1)).toFixed(1)}%`
                      : formatValue(rowSum)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
              <td className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 text-slate-700 border-r border-slate-200">
                Total Columna
              </td>
              {colKeys.map(cKey => {
                const cSum = colTotals[cKey] || 0;
                return (
                  <td key={cKey} className="py-2.5 px-3 text-right font-mono text-[#0056B3]">
                    {activeMetric === 'grossMargin' || activeMetric === 'fulfillment'
                      ? `${(cSum / (rowKeys.length || 1)).toFixed(1)}%`
                      : formatValue(cSum)}
                  </td>
                );
              })}
              <td className="py-2.5 px-3 text-right font-mono text-emerald-700 bg-emerald-50 border-l border-slate-200 font-black">
                {activeMetric === 'grossMargin' || activeMetric === 'fulfillment'
                  ? `${(grandTotal / (rowKeys.length * colKeys.length || 1)).toFixed(1)}%`
                  : formatValue(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Visual Comparative Chart */}
      <div className="mt-1 bg-slate-50/80 p-4 rounded-xl border border-slate-200/90">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#002B66] uppercase tracking-wider">
            Comparativa Gráfica por {crossOptions.find(o => o.id === pivotMode)?.rowLabel}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Top 5 columnas representativas</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={val => (val >= 1000 ? `${val / 1000}k` : val)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {colKeys.slice(0, 5).map((cKey, idx) => (
                <Bar
                  key={cKey}
                  dataKey={cKey}
                  fill={paletteColors[idx % paletteColors.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
