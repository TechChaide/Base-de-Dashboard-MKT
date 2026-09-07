import React from 'react';
import { ArrowDownRight, ArrowUpRight, DollarSign, Percent, ShoppingBag, Target } from 'lucide-react';
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
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,43,102,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ventas Netas Chaide</span>
          <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-[#002B66]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-[#002B66] font-['Outfit'] tracking-tight">
            {formatCurrency(totalSales)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[11px] border ${
                salesYoY >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {salesYoY >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {Math.abs(salesYoY).toFixed(1)}% YoY
            </span>
            <span className="text-slate-500">vs año anterior</span>
          </div>
        </div>
      </div>

      {/* 2. Budget Fulfillment */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,43,102,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cumplimiento Meta</span>
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-[#0056B3]">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-[#002B66] font-['Outfit'] tracking-tight">
              {fulfillment.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Meta: {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 border border-slate-200/70 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fulfillment >= 100
                  ? 'bg-emerald-500'
                  : fulfillment >= 90
                  ? 'bg-[#002B66]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, fulfillment)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px]">
            <span className="text-slate-500">Brecha: {formatCurrency(totalSales - totalBudget)}</span>
            <span className={`font-semibold ${fulfillment >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {fulfillment >= 100 ? 'Meta Cumplida' : 'En seguimiento'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Units & Avg Ticket */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,43,102,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Volumen & Ticket Prom.</span>
          <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-[#002B66] font-['Outfit'] tracking-tight">
              {totalUnits.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 font-medium">unidades</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="text-slate-600">
              Ticket Prom: <span className="font-bold text-[#002B66]">{formatCurrency(avgTicket)}</span>
            </div>
            <span
              className={`inline-flex items-center font-bold text-[11px] px-1.5 py-0.5 rounded border ${
                unitsYoY >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {unitsYoY >= 0 ? '+' : ''}{unitsYoY.toFixed(1)}% uds
            </span>
          </div>
        </div>
      </div>

      {/* 4. Gross Margin & Return Rate */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,43,102,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Margen Bruto & Garantía</span>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-[#002B66] font-['Outfit'] tracking-tight">
              {avgGrossMargin.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Utilidad: {formatCurrency(grossProfit)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>
              Tasa Garantía: <span className="font-bold text-slate-700">{avgReturnRate.toFixed(2)}%</span>
            </span>
            <span className={`font-semibold ${marginDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {marginDiff >= 0 ? `+${marginDiff.toFixed(1)} pp` : `${marginDiff.toFixed(1)} pp`}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
