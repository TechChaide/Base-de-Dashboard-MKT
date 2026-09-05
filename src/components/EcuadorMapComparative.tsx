import React, { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Compass, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import { CITIES_METADATA } from '../data/chaideData';
import { CityPerformance, Region, SalesRecord } from '../types';

interface EcuadorMapComparativeProps {
  currentRecords: SalesRecord[];
  previousRecords: SalesRecord[];
  onCityFilterSelect?: (cityName: string) => void;
}

export const EcuadorMapComparative: React.FC<EcuadorMapComparativeProps> = ({
  currentRecords,
  previousRecords,
  onCityFilterSelect,
}) => {
  // Selected comparison cities
  const [cityA, setCityA] = useState<string>('Quito');
  const [cityB, setCityB] = useState<string>('Guayaquil');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Calculate performance per city
  const cityStats = useMemo(() => {
    const stats: Record<string, CityPerformance> = {};

    CITIES_METADATA.forEach(meta => {
      stats[meta.name] = {
        city: meta.name,
        region: meta.region,
        currentSales: 0,
        previousSales: 0,
        yoyGrowth: 0,
        units: 0,
        budget: 0,
        fulfillment: 0,
        margin: 0,
        topProduct: '',
        topChannel: '',
      };
    });

    const productSalesMap: Record<string, Record<string, number>> = {};
    const channelSalesMap: Record<string, Record<string, number>> = {};
    const costMap: Record<string, number> = {};

    currentRecords.forEach(r => {
      if (!stats[r.city]) return;
      stats[r.city].currentSales += r.salesAmount;
      stats[r.city].units += r.units;
      stats[r.city].budget += r.budgetAmount;
      costMap[r.city] = (costMap[r.city] || 0) + r.costAmount;

      if (!productSalesMap[r.city]) productSalesMap[r.city] = {};
      productSalesMap[r.city][r.productName] = (productSalesMap[r.city][r.productName] || 0) + r.salesAmount;

      if (!channelSalesMap[r.city]) channelSalesMap[r.city] = {};
      channelSalesMap[r.city][r.channel] = (channelSalesMap[r.city][r.channel] || 0) + r.salesAmount;
    });

    previousRecords.forEach(r => {
      if (!stats[r.city]) return;
      stats[r.city].previousSales += r.salesAmount;
    });

    // Finalize ratios
    Object.keys(stats).forEach(cName => {
      const s = stats[cName];
      if (s.previousSales > 0) {
        s.yoyGrowth = Number((((s.currentSales - s.previousSales) / s.previousSales) * 100).toFixed(1));
      } else {
        s.yoyGrowth = 0;
      }
      s.fulfillment = s.budget > 0 ? Number(((s.currentSales / s.budget) * 100).toFixed(1)) : 0;
      const cost = costMap[cName] || 0;
      s.margin = s.currentSales > 0 ? Number((((s.currentSales - cost) / s.currentSales) * 100).toFixed(1)) : 0;

      // Top product
      const pEntries = Object.entries(productSalesMap[cName] || {});
      if (pEntries.length > 0) {
        pEntries.sort((a, b) => b[1] - a[1]);
        s.topProduct = pEntries[0][0];
      } else {
        s.topProduct = 'Chaide Restonic';
      }

      // Top channel
      const chEntries = Object.entries(channelSalesMap[cName] || {});
      if (chEntries.length > 0) {
        chEntries.sort((a, b) => b[1] - a[1]);
        s.topChannel = chEntries[0][0];
      } else {
        s.topChannel = 'Tiendas Propias';
      }
    });

    return stats;
  }, [currentRecords, previousRecords]);

  // Max sales for radius scaling
  const maxCitySales = useMemo(() => {
    let max = 1;
    (Object.values(cityStats) as CityPerformance[]).forEach(s => {
      if (s.currentSales > max) max = s.currentSales;
    });
    return max;
  }, [cityStats]);

  const statA = cityStats[cityA] || cityStats['Quito'];
  const statB = cityStats[cityB] || cityStats['Guayaquil'];

  const metaA = CITIES_METADATA.find(c => c.name === cityA);
  const metaB = CITIES_METADATA.find(c => c.name === cityB);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const deltaGrowth = statA && statB ? statA.yoyGrowth - statB.yoyGrowth : 0;
  const deltaSales = statA && statB ? statA.currentSales - statB.currentSales : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white font-['Outfit']">
              Mapa Comercial del Ecuador & Cruce de Ciudades
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
              Crecimiento vs Rezago
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compara el rendimiento de dos plazas comerciales simultáneamente con remarcado geográfico
          </p>
        </div>

        {/* City Selectors for Head-to-Head */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-400 font-medium">Plaza A:</span>
            <select
              value={cityA}
              onChange={e => setCityA(e.target.value)}
              className="bg-slate-900 text-white font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none"
            >
              {CITIES_METADATA.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-bold px-1">VS</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-400 font-medium">Plaza B:</span>
            <select
              value={cityB}
              onChange={e => setCityB(e.target.value)}
              className="bg-slate-900 text-white font-semibold rounded px-2 py-1 border border-slate-700 focus:outline-none"
            >
              {CITIES_METADATA.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: SVG Map on Left, Comparative Head-to-Head Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        
        {/* Map Container (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl p-3 border border-slate-800 relative flex flex-col items-center justify-center min-h-[420px]">
          
          {/* Map Legend */}
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 z-10 backdrop-blur-sm shadow-md">
            <div className="font-semibold text-slate-200 mb-1.5">Semáforo de Desempeño:</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                <span>Crecimiento Alto (+8% o más)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span>Crecimiento Estable (0% a +7%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                <span>Contracción / Rezago (Menor a 0%)</span>
              </div>
            </div>
          </div>

          {/* Region Label Pill */}
          <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Haz clic en cualquier nodo para fijarlo en la comparativa</span>
          </div>

          {/* SVG Map of Ecuador */}
          <svg
            viewBox="0 0 540 480"
            className="w-full h-auto max-h-[420px] select-none"
          >
            {/* Background subtle grid */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />

            {/* Ecuador Geography Silhouette: Costa (West), Sierra (Spine), Oriente (East) */}
            {/* Oriente Region polygon */}
            <path
              d="M 340 50 L 460 70 L 510 120 L 490 220 L 440 280 L 390 320 L 340 330 L 325 210 Z"
              fill="#064e3b"
              fillOpacity="0.25"
              stroke="#047857"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Sierra Region polygon */}
            <path
              d="M 285 45 L 340 50 L 325 210 L 340 330 L 310 440 L 270 450 L 260 380 L 280 260 L 270 140 Z"
              fill="#1e3a8a"
              fillOpacity="0.30"
              stroke="#2563eb"
              strokeWidth="1.2"
            />
            {/* Costa Region polygon */}
            <path
              d="M 210 40 L 285 45 L 270 140 L 280 260 L 260 380 L 210 420 L 195 380 L 120 330 L 130 290 L 160 210 L 180 130 L 190 70 Z"
              fill="#0f172a"
              fillOpacity="0.6"
              stroke="#475569"
              strokeWidth="1.2"
            />

            {/* Region Labels */}
            <text x="170" y="340" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.6">COSTA</text>
            <text x="295" y="105" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.6">SIERRA</text>
            <text x="280" y="345" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.6">AUSTRO</text>
            <text x="410" y="210" fill="#64748b" fontSize="11" fontWeight="700" opacity="0.6">ORIENTE</text>

            {/* Animated Vector between City A and City B */}
            {metaA && metaB && (
              <g>
                <line
                  x1={metaA.svgX}
                  y1={metaA.svgY}
                  x2={metaB.svgX}
                  y2={metaB.svgY}
                  stroke="url(#vectorGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  className="animate-pulse"
                />
                {/* Midpoint Delta growth badge */}
                <circle
                  cx={(metaA.svgX + metaB.svgX) / 2}
                  cy={(metaA.svgY + metaB.svgY) / 2}
                  r="14"
                  fill="#0f172a"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                <text
                  x={(metaA.svgX + metaB.svgX) / 2}
                  y={(metaA.svgY + metaB.svgY) / 2 + 3.5}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="bold"
                >
                  VS
                </text>
              </g>
            )}

            {/* City Nodes */}
            {CITIES_METADATA.map(city => {
              const stat = cityStats[city.name] || { currentSales: 0, yoyGrowth: 0, units: 0 };
              const isSelectedA = city.name === cityA;
              const isSelectedB = city.name === cityB;
              const isHovered = city.name === hoveredCity;

              // Color based on YoY growth
              const isGrowth = stat.yoyGrowth >= 8;
              const isModerate = stat.yoyGrowth >= 0 && stat.yoyGrowth < 8;
              const isDecline = stat.yoyGrowth < 0;

              const nodeColor = isGrowth ? '#10b981' : isModerate ? '#38bdf8' : '#f43f5e';
              const radius = 5 + Math.min(10, Math.max(3, (stat.currentSales / maxCitySales) * 12));

              return (
                <g
                  key={city.name}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => {
                    // Smart cycle: set A if not set, or set B
                    if (city.name !== cityA) {
                      setCityB(city.name);
                    }
                  }}
                >
                  {/* Selection rings */}
                  {isSelectedA && (
                    <circle
                      cx={city.svgX}
                      cy={city.svgY}
                      r={radius + 7}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      className="animate-ping opacity-75"
                    />
                  )}
                  {isSelectedB && (
                    <circle
                      cx={city.svgX}
                      cy={city.svgY}
                      r={radius + 7}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Main Node */}
                  <circle
                    cx={city.svgX}
                    cy={city.svgY}
                    r={radius}
                    fill={nodeColor}
                    stroke={isSelectedA ? '#3b82f6' : isSelectedB ? '#f59e0b' : '#0f172a'}
                    strokeWidth={isSelectedA || isSelectedB ? 3 : 1.5}
                  />

                  {/* City Label */}
                  <text
                    x={city.svgX}
                    y={city.svgY - radius - 4}
                    textAnchor="middle"
                    fill={isSelectedA ? '#60a5fa' : isSelectedB ? '#fbbf24' : isHovered ? '#ffffff' : '#cbd5e1'}
                    fontSize={city.populationTier === 'Metrópoli' ? '12' : '10'}
                    fontWeight={isSelectedA || isSelectedB || city.populationTier === 'Metrópoli' ? '700' : '500'}
                  >
                    {city.name}
                  </text>

                  {/* Growth Badge above */}
                  {(isSelectedA || isSelectedB || isHovered) && (
                    <g>
                      <rect
                        x={city.svgX - 22}
                        y={city.svgY + radius + 3}
                        width="44"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke={nodeColor}
                        strokeWidth="1"
                      />
                      <text
                        x={city.svgX}
                        y={city.svgY + radius + 14}
                        textAnchor="middle"
                        fill={nodeColor}
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {stat.yoyGrowth >= 0 ? '+' : ''}{stat.yoyGrowth}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Comparative Head-to-Head Breakdown (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          
          {/* Summary Comparison Header Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">Cruce Directo de Plazas</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {statA.region} vs {statB.region}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800">
              {/* City A Header */}
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-bold text-white text-sm font-['Outfit']">{cityA}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <span
                    className={`font-semibold ${
                      statA.yoyGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {statA.yoyGrowth >= 0 ? '+' : ''}{statA.yoyGrowth}% YoY
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({statA.yoyGrowth >= 0 ? 'En Crecimiento' : 'En Rezago'})
                  </span>
                </div>
              </div>

              {/* City B Header */}
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-white text-sm font-['Outfit']">{cityB}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <span
                    className={`font-semibold ${
                      statB.yoyGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {statB.yoyGrowth >= 0 ? '+' : ''}{statB.yoyGrowth}% YoY
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    ({statB.yoyGrowth >= 0 ? 'En Crecimiento' : 'En Rezago'})
                  </span>
                </div>
              </div>
            </div>

            {/* Gap Statement */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {deltaGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-white">
                    {deltaGrowth >= 0 ? `${cityA} lidera el ritmo` : `${cityB} tiene mejor tracción`}
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    Brecha de crecimiento de {Math.abs(deltaGrowth).toFixed(1)} pp y diferencia neta de {formatCurrency(Math.abs(deltaSales))}.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Tabla Comparativa de Indicadores Clave
            </div>

            <div className="divide-y divide-slate-800/60 text-xs">
              {/* Row 1: Net Sales */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Ventas Netas:</span>
                <span className="text-right font-mono font-bold text-blue-300">{formatCurrency(statA.currentSales)}</span>
                <span className="text-right font-mono font-bold text-amber-300">{formatCurrency(statB.currentSales)}</span>
              </div>

              {/* Row 2: Units */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Unidades Vendidas:</span>
                <span className="text-right font-mono text-slate-200">{statA.units.toLocaleString()} uds</span>
                <span className="text-right font-mono text-slate-200">{statB.units.toLocaleString()} uds</span>
              </div>

              {/* Row 3: Fulfillment */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Cumplimiento Meta:</span>
                <span className={`text-right font-mono font-semibold ${statA.fulfillment >= 100 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {statA.fulfillment}%
                </span>
                <span className={`text-right font-mono font-semibold ${statB.fulfillment >= 100 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {statB.fulfillment}%
                </span>
              </div>

              {/* Row 4: Gross Margin */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Margen Bruto:</span>
                <span className="text-right font-mono text-slate-200">{statA.margin}%</span>
                <span className="text-right font-mono text-slate-200">{statB.margin}%</span>
              </div>

              {/* Row 5: Ticket */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Ticket Promedio:</span>
                <span className="text-right font-mono text-slate-200">
                  {formatCurrency(statA.units > 0 ? statA.currentSales / statA.units : 0)}
                </span>
                <span className="text-right font-mono text-slate-200">
                  {formatCurrency(statB.units > 0 ? statB.currentSales / statB.units : 0)}
                </span>
              </div>

              {/* Row 6: Top Product */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Líder Producto:</span>
                <span className="text-right text-[11px] text-blue-300 font-medium truncate" title={statA.topProduct}>
                  {statA.topProduct.replace('Chaide', '').trim()}
                </span>
                <span className="text-right text-[11px] text-amber-300 font-medium truncate" title={statB.topProduct}>
                  {statB.topProduct.replace('Chaide', '').trim()}
                </span>
              </div>

              {/* Row 7: Top Channel */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-400">Canal Principal:</span>
                <span className="text-right text-[11px] text-slate-300 truncate" title={statA.topChannel}>
                  {statA.topChannel.replace('Chaide', '').trim()}
                </span>
                <span className="text-right text-[11px] text-slate-300 truncate" title={statB.topChannel}>
                  {statB.topChannel.replace('Chaide', '').trim()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
