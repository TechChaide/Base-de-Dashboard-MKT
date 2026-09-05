import { ForecastPoint, SalesRecord } from '../types';
import { MONTH_SHORT_NAMES } from '../data/chaideData';

export interface ProjectionSummary {
  historicalTotal: number;
  projectedRemainingTotal: number;
  projectedFullYearTotal: number;
  projectedBudgetGap: number; // positive = surplus, negative = deficit
  projectedYoYGrowth: number; // %
  forecastPoints: ForecastPoint[];
}

/**
 * Computes forward projections using seasonal moving average and linear regression slope
 */
export function computeProjections(
  filteredRecords: SalesRecord[],
  forecastHorizonMonths: number = 6
): ProjectionSummary {
  // 1. Group actual sales by Year-Month
  const monthlyTotals: Record<string, { sales: number; budget: number; year: number; month: number }> = {};

  filteredRecords.forEach(r => {
    if (!monthlyTotals[r.date]) {
      monthlyTotals[r.date] = { sales: 0, budget: 0, year: r.year, month: r.month };
    }
    monthlyTotals[r.date].sales += r.salesAmount;
    monthlyTotals[r.date].budget += r.budgetAmount;
  });

  const sortedDates = Object.keys(monthlyTotals).sort();
  if (sortedDates.length === 0) {
    return {
      historicalTotal: 0,
      projectedRemainingTotal: 0,
      projectedFullYearTotal: 0,
      projectedBudgetGap: 0,
      projectedYoYGrowth: 0,
      forecastPoints: [],
    };
  }

  // 2. Identify the last historical month in data
  const lastDateKey = sortedDates[sortedDates.length - 1];
  const lastYear = monthlyTotals[lastDateKey].year;
  const lastMonth = monthlyTotals[lastDateKey].month;

  // Monthly seasonal weights based on retail mattress patterns
  const seasonalWeights: Record<number, number> = {
    1: 0.88, 2: 0.92, 3: 0.98, 4: 1.05, 5: 1.35, 6: 1.08,
    7: 1.02, 8: 0.96, 9: 1.04, 10: 1.10, 11: 1.40, 12: 1.48
  };

  // Compute average baseline per month for historical points
  const recentPoints = sortedDates.slice(-12);
  const avgMonthly = recentPoints.reduce((acc, d) => acc + monthlyTotals[d].sales, 0) / (recentPoints.length || 1);

  // Compute trend slope over the last 12 months
  let slope = 0;
  if (recentPoints.length >= 2) {
    const n = recentPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    recentPoints.forEach((d, idx) => {
      const y = monthlyTotals[d].sales;
      sumX += idx;
      sumY += y;
      sumXY += idx * y;
      sumXX += idx * idx;
    });
    slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  }

  const forecastPoints: ForecastPoint[] = [];

  // Add historical points (last 12 months)
  recentPoints.forEach(d => {
    const item = monthlyTotals[d];
    forecastPoints.push({
      date: d,
      monthName: `${MONTH_SHORT_NAMES[item.month - 1]} '${String(item.year).slice(-2)}`,
      historicalSales: Math.round(item.sales),
      forecastBase: Math.round(item.sales),
      forecastOptimistic: Math.round(item.sales),
      forecastPessimistic: Math.round(item.sales),
      budget: Math.round(item.budget),
      isProjected: false,
    });
  });

  // Project forward
  let curYear = lastYear;
  let curMonth = lastMonth;
  let remainingProjectedSales = 0;

  for (let i = 1; i <= forecastHorizonMonths; i++) {
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }

    const dateKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
    const season = seasonalWeights[curMonth] || 1.0;
    
    // Baseline projected formula: (avgMonthly + slope * step) * seasonalWeight
    const projectedStep = recentPoints.length + i - 1;
    const baseUnadjusted = Math.max(avgMonthly * 0.7, avgMonthly + slope * (i * 0.5));
    const forecastBase = Math.round(baseUnadjusted * season);
    const forecastOptimistic = Math.round(forecastBase * 1.12);
    const forecastPessimistic = Math.round(forecastBase * 0.91);
    const budgetEstimate = Math.round(forecastBase * 1.04);

    remainingProjectedSales += forecastBase;

    forecastPoints.push({
      date: dateKey,
      monthName: `${MONTH_SHORT_NAMES[curMonth - 1]} '${String(curYear).slice(-2)}*`,
      forecastBase,
      forecastOptimistic,
      forecastPessimistic,
      budget: budgetEstimate,
      isProjected: true,
    });
  }

  // Calculate annual metrics
  const currentYearRecords = filteredRecords.filter(r => r.year === lastYear);
  const historicalYTDTotal = currentYearRecords.reduce((acc, r) => acc + r.salesAmount, 0);
  const fullYearBudget = currentYearRecords.reduce((acc, r) => acc + r.budgetAmount, 0) + (remainingProjectedSales * 1.03);
  const projectedFullYearTotal = historicalYTDTotal + remainingProjectedSales;
  const projectedBudgetGap = projectedFullYearTotal - fullYearBudget;

  const previousYearRecords = filteredRecords.filter(r => r.year === lastYear - 1);
  const previousYearTotal = previousYearRecords.reduce((acc, r) => acc + r.salesAmount, 0) || 1;
  const projectedYoYGrowth = parseFloat((((projectedFullYearTotal - previousYearTotal) / previousYearTotal) * 100).toFixed(1));

  return {
    historicalTotal: Math.round(historicalYTDTotal),
    projectedRemainingTotal: Math.round(remainingProjectedSales),
    projectedFullYearTotal: Math.round(projectedFullYearTotal),
    projectedBudgetGap: Math.round(projectedBudgetGap),
    projectedYoYGrowth,
    forecastPoints,
  };
}
