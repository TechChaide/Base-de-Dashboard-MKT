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
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,43,102,0.04)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#002B66] font-['Outfit']">
              Mapa Comercial del Ecuador & Cruce de Plazas Chaide
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-[#002B66] border border-sky-200 font-bold">
              Crecimiento vs Rezago
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compara el desempeño de dos plazas comerciales simultáneamente con remarcado geográfico interactivo
          </p>
        </div>

        {/* City Selectors for Head-to-Head */}
        <div className="flex items-center gap-2 bg-sky-50/70 p-1.5 rounded-lg border border-sky-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002B66]"></span>
            <span className="text-slate-600 font-semibold">Plaza A:</span>
            <select
              value={cityA}
              onChange={e => setCityA(e.target.value)}
              className="bg-white text-slate-800 font-bold rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:border-[#002B66] shadow-2xs"
            >
              {CITIES_METADATA.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#002B66] font-extrabold px-1">VS</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 font-semibold">Plaza B:</span>
            <select
              value={cityB}
              onChange={e => setCityB(e.target.value)}
              className="bg-white text-slate-800 font-bold rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:border-[#002B66] shadow-2xs"
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
        <div className="lg:col-span-7 bg-[#F4F8FD] rounded-xl p-3 border border-sky-100 relative flex flex-col items-center justify-center min-h-[420px] shadow-2xs">
          
          {/* Map Legend */}
          <div className="absolute top-3 left-3 bg-white/95 border border-sky-100 rounded-lg p-2.5 text-[11px] text-slate-700 z-10 backdrop-blur-sm shadow-sm">
            <div className="font-bold text-[#002B66] mb-1.5">Semáforo de Desempeño:</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
                <span className="font-medium text-slate-700">Crecimiento Alto (+8% o más)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200"></span>
                <span className="font-medium text-slate-700">Crecimiento Estable (0% a +7%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
                <span className="font-medium text-slate-700">Contracción / Rezago (&lt; 0%)</span>
              </div>
            </div>
          </div>

          {/* Region Label Pill */}
          <div className="absolute bottom-3 left-3 text-[11px] text-slate-500 flex items-center gap-1.5 bg-white/80 px-2 py-1 rounded border border-slate-200">
            <Compass className="w-3.5 h-3.5 text-[#002B66]" />
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
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="vectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#002B66" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6" />

            {/* Ecuador Geography Silhouette: Costa (West), Sierra (Spine), Oriente (East) */}
            {/* Oriente Region polygon */}
            <path
              d="M 340 50 L 460 70 L 510 120 L 490 220 L 440 280 L 390 320 L 340 330 L 325 210 Z"
              fill="#e6f7ec"
              fillOpacity="0.8"
              stroke="#059669"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Sierra Region polygon */}
            <path
              d="M 285 45 L 340 50 L 325 210 L 340 330 L 310 440 L 270 450 L 260 380 L 280 260 L 270 140 Z"
              fill="#e0edfd"
              fillOpacity="0.8"
              stroke="#0056b3"
              strokeWidth="1.4"
            />
            {/* Costa Region polygon */}
            <path
              d="M 210 40 L 285 45 L 270 140 L 280 260 L 260 380 L 210 420 L 195 380 L 120 330 L 130 290 L 160 210 L 180 130 L 190 70 Z"
              fill="#f1f5f9"
              fillOpacity="0.9"
              stroke="#64748b"
              strokeWidth="1.4"
            />

            {/* Region Labels */}
            <text x="170" y="340" fill="#475569" fontSize="11" fontWeight="800" opacity="0.7">COSTA</text>
            <text x="295" y="105" fill="#002B66" fontSize="11" fontWeight="800" opacity="0.7">SIERRA</text>
            <text x="280" y="345" fill="#002B66" fontSize="11" fontWeight="800" opacity="0.7">AUSTRO</text>
            <text x="410" y="210" fill="#065f46" fontSize="11" fontWeight="800" opacity="0.7">ORIENTE</text>

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
                />
                {/* Midpoint Delta growth badge */}
                <circle
                  cx={(metaA.svgX + metaB.svgX) / 2}
                  cy={(metaA.svgY + metaB.svgY) / 2}
                  r="14"
                  fill="#ffffff"
                  stroke="#002B66"
                  strokeWidth="2"
                />
                <text
                  x={(metaA.svgX + metaB.svgX) / 2}
                  y={(metaA.svgY + metaB.svgY) / 2 + 3.5}
                  textAnchor="middle"
                  fill="#002B66"
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

              const nodeColor = isGrowth ? '#10b981' : isModerate ? '#0284c7' : '#e11d48';
              const radius = 5 + Math.min(10, Math.max(3, (stat.currentSales / maxCitySales) * 12));

              return (
                <g
                  key={city.name}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => {
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
                      stroke="#002B66"
                      strokeWidth="2.5"
                      className="animate-ping opacity-60"
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
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Main Node */}
                  <circle
                    cx={city.svgX}
                    cy={city.svgY}
                    r={radius}
                    fill={nodeColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* City Label */}
                  <text
                    x={city.svgX}
                    y={city.svgY - radius - 4}
                    textAnchor="middle"
                    fill={isSelectedA ? '#002B66' : isSelectedB ? '#b45309' : '#1e293b'}
                    fontSize={city.populationTier === 'Metrópoli' ? '12' : '10'}
                    fontWeight={isSelectedA || isSelectedB || city.populationTier === 'Metrópoli' ? '800' : '600'}
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
                        fill="#ffffff"
                        stroke={nodeColor}
                        strokeWidth="1.5"
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
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-bold uppercase tracking-wider text-[#002B66]">Cruce Directo de Plazas</span>
              <span className="px-2 py-0.5 rounded bg-white text-slate-700 font-semibold border border-slate-200">
                {statA.region} vs {statB.region}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
              {/* City A Header */}
              <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#002B66]"></span>
                  <span className="font-extrabold text-[#002B66] text-sm font-['Outfit']">{cityA}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <span
                    className={`font-bold ${
                      statA.yoyGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {statA.yoyGrowth >= 0 ? '+' : ''}{statA.yoyGrowth}% YoY
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    ({statA.yoyGrowth >= 0 ? 'Crecimiento' : 'Rezago'})
                  </span>
                </div>
              </div>

              {/* City B Header */}
              <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-extrabold text-amber-900 text-sm font-['Outfit']">{cityB}</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <span
                    className={`font-bold ${
                      statB.yoyGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {statB.yoyGrowth >= 0 ? '+' : ''}{statB.yoyGrowth}% YoY
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    ({statB.yoyGrowth >= 0 ? 'Crecimiento' : 'Rezago'})
                  </span>
                </div>
              </div>
            </div>

            {/* Gap Statement */}
            <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                {deltaGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-slate-800">
                    {deltaGrowth >= 0 ? `${cityA} lidera el ritmo` : `${cityB} tiene mayor tracción`}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Brecha de crecimiento de {Math.abs(deltaGrowth).toFixed(1)} pp y diferencia neta de {formatCurrency(Math.abs(deltaSales))}.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3 bg-sky-50/80 border-b border-sky-100 text-xs font-bold text-[#002B66]">
              Tabla Comparativa de Indicadores Clave
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Row 1: Net Sales */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Ventas Netas:</span>
                <span className="text-right font-mono font-bold text-[#002B66]">{formatCurrency(statA.currentSales)}</span>
                <span className="text-right font-mono font-bold text-amber-700">{formatCurrency(statB.currentSales)}</span>
              </div>

              {/* Row 2: Units */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Unidades:</span>
                <span className="text-right font-mono font-medium text-slate-700">{statA.units.toLocaleString()} uds</span>
                <span className="text-right font-mono font-medium text-slate-700">{statB.units.toLocaleString()} uds</span>
              </div>

              {/* Row 3: Fulfillment */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Cumplimiento:</span>
                <span className={`text-right font-mono font-bold ${statA.fulfillment >= 100 ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {statA.fulfillment}%
                </span>
                <span className={`text-right font-mono font-bold ${statB.fulfillment >= 100 ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {statB.fulfillment}%
                </span>
              </div>

              {/* Row 4: Gross Margin */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Margen Bruto:</span>
                <span className="text-right font-mono font-semibold text-slate-700">{statA.margin}%</span>
                <span className="text-right font-mono font-semibold text-slate-700">{statB.margin}%</span>
              </div>

              {/* Row 5: Ticket */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Ticket Promedio:</span>
                <span className="text-right font-mono font-semibold text-slate-700">
                  {formatCurrency(statA.units > 0 ? statA.currentSales / statA.units : 0)}
                </span>
                <span className="text-right font-mono font-semibold text-slate-700">
                  {formatCurrency(statB.units > 0 ? statB.currentSales / statB.units : 0)}
                </span>
              </div>

              {/* Row 6: Top Product */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Líder Producto:</span>
                <span className="text-right text-[11px] text-[#002B66] font-semibold truncate" title={statA.topProduct}>
                  {statA.topProduct.replace('Chaide', '').trim()}
                </span>
                <span className="text-right text-[11px] text-amber-700 font-semibold truncate" title={statB.topProduct}>
                  {statB.topProduct.replace('Chaide', '').trim()}
                </span>
              </div>

              {/* Row 7: Top Channel */}
              <div className="p-2.5 grid grid-cols-3 items-center">
                <span className="text-slate-500 font-medium">Canal Principal:</span>
                <span className="text-right text-[11px] text-slate-600 font-medium truncate" title={statA.topChannel}>
                  {statA.topChannel.replace('Chaide', '').trim()}
                </span>
                <span className="text-right text-[11px] text-slate-600 font-medium truncate" title={statB.topChannel}>
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
