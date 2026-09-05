import React from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, DollarSign, Percent, ShieldCheck, ShoppingBag, Target } from 'lucide-react';
import { SalesRecord } from '../types';

interface MetricCardsProps {
  currentRecords: SalesRecord[];
  previousRecords: SalesRecord[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  currentRecords,
  previousRecords,
}) => {
  // Aggregate current
  const totalSales = currentRecords.reduce((acc, r) => acc + r.salesAmount, 0);
  const totalBudget = currentRecords.reduce((acc, r) => acc + r.budgetAmount, 0);
  const totalCost = currentRecords.reduce((acc, r) => acc + r.costAmount, 0);
  const totalUnits = currentRecords.reduce((acc, r) => acc + r.units, 0);

  const grossProfit = totalSales - totalCost;
  const avgGrossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const fulfillment = totalBudget > 0 ? (totalSales / totalBudget) * 100 : 0;
  const avgTicket = totalUnits > 0 ? totalSales / totalUnits : 0;

  const totalWeightedReturn = currentRecords.reduce((acc, r) => acc + r.returnRate * r.units, 0);
  const avgReturnRate = totalUnits > 0 ? totalWeightedReturn / totalUnits : 0;

  // Aggregate previous
  const prevSales = previousRecords.reduce((acc, r) => acc + r.salesAmount, 0);
  const prevUnits = previousRecords.reduce((acc, r) => acc + r.units, 0);
  const prevCost = previousRecords.reduce((acc, r) => acc + r.costAmount, 0);
  const prevGrossMargin = prevSales > 0 ? ((prevSales - prevCost) / prevSales) * 100 : 0;

  // YoY calculations
  const salesYoY = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;
  const unitsYoY = prevUnits > 0 ? ((totalUnits - prevUnits) / prevUnits) * 100 : 0;
  const marginDiff = avgGrossMargin - prevGrossMargin;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* 1. Total Sales */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ventas Netas</span>
          <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-white font-['Outfit'] tracking-tight">
            {formatCurrency(totalSales)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded ${
                salesYoY >= 0 ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'
              }`}
            >
              {salesYoY >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(salesYoY).toFixed(1)}% YoY
            </span>
            <span className="text-slate-400">vs periodo anterior</span>
          </div>
        </div>
      </div>

      {/* 2. Budget Fulfillment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cumplimiento Meta</span>
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-['Outfit'] tracking-tight">
              {fulfillment.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-400">
              Meta: {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fulfillment >= 100
                  ? 'bg-emerald-500'
                  : fulfillment >= 90
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, fulfillment)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
            <span>Brecha: {formatCurrency(totalSales - totalBudget)}</span>
            <span className={fulfillment >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
              {fulfillment >= 100 ? 'Superada' : 'En seguimiento'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Units & Avg Ticket */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Volumen & Ticket</span>
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-white font-['Outfit'] tracking-tight">
              {totalUnits.toLocaleString()}
            </div>
            <span className="text-xs text-slate-400 font-medium">unidades</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="text-slate-300">
              Ticket Prom: <span className="font-semibold text-white">{formatCurrency(avgTicket)}</span>
            </div>
            <span
              className={`inline-flex items-center font-semibold text-[11px] ${
                unitsYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {unitsYoY >= 0 ? '+' : ''}{unitsYoY.toFixed(1)}% uds
            </span>
          </div>
        </div>
      </div>

      {/* 4. Gross Margin & Return Rate */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Margen & Garantía</span>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-['Outfit'] tracking-tight">
              {avgGrossMargin.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-400">
              Utilidad: {formatCurrency(grossProfit)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>
              Tasa Garantía: <span className="font-semibold text-slate-200">{avgReturnRate.toFixed(2)}%</span>
            </span>
            <span className={marginDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {marginDiff >= 0 ? `+${marginDiff.toFixed(1)} pp` : `${marginDiff.toFixed(1)} pp`}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
