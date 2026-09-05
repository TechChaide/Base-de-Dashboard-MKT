import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { FilterState, MetricKey, ProductCategory, Region, SalesChannel } from '../types';
import { CHANNELS, MONTH_SHORT_NAMES, PRODUCTS_CATALOG, REGIONS } from '../data/chaideData';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onResetFilters: () => void;
  availableYears: number[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableYears,
}) => {
  const toggleYear = (year: number) => {
    onFilterChange(prev => {
      const exists = prev.years.includes(year);
      const newYears = exists
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year];
      // ensure at least one year
      return { ...prev, years: newYears.length ? newYears : [year] };
    });
  };

  const toggleRegion = (region: Region) => {
    onFilterChange(prev => {
      const exists = prev.regions.includes(region);
      const newRegions = exists
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region];
      return { ...prev, regions: newRegions };
    });
  };

  const toggleChannel = (channel: SalesChannel) => {
    onFilterChange(prev => {
      const exists = prev.channels.includes(channel);
      const newChannels = exists
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels: newChannels };
    });
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange(prev => ({
      ...prev,
      categories: val === 'ALL' ? [] : [val as ProductCategory],
    }));
  };

  const handleMetricChange = (metric: MetricKey) => {
    onFilterChange(prev => ({ ...prev, selectedMetric: metric }));
  };

  const activeFiltersCount =
    (filters.regions.length > 0 && filters.regions.length < REGIONS.length ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.channels.length > 0 && filters.channels.length < CHANNELS.length ? 1 : 0) +
    (filters.months.length > 0 && filters.months.length < 12 ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Years selection */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">Año:</span>
            {availableYears.map(year => {
              const active = filters.years.includes(year);
              return (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider">Métrica:</span>
            {(
              [
                { key: 'salesAmount', label: '$ Ventas' },
                { key: 'units', label: 'Unidades' },
                { key: 'grossMargin', label: 'Margen %' },
                { key: 'fulfillment', label: '% Meta' },
              ] as const
            ).map(m => {
              const active = filters.selectedMetric === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => handleMetricChange(m.key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    active
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Search box & reset */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={e => onFilterChange(prev => ({ ...prev, searchTerm: e.target.value }))}
                placeholder="Buscar producto o ciudad..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950 text-slate-200 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors whitespace-nowrap"
                title="Limpiar filtros seleccionados"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>

        </div>

        {/* Secondary filter chips row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/60 text-xs">
          
          {/* Regions */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Región:</span>
            <div className="flex items-center gap-1">
              {REGIONS.map(reg => {
                const active = filters.regions.length === 0 || filters.regions.includes(reg);
                return (
                  <button
                    key={reg}
                    onClick={() => toggleRegion(reg)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      active
                        ? 'bg-blue-950/60 text-blue-300 border-blue-800/80'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {reg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Línea:</span>
            <select
              value={filters.categories.length === 1 ? filters.categories[0] : 'ALL'}
              onChange={handleCategorySelect}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas las Líneas Chaide</option>
              {PRODUCTS_CATALOG.map(c => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Canal:</span>
            <div className="flex items-center gap-1">
              {CHANNELS.map(ch => {
                const active = filters.channels.length === 0 || filters.channels.includes(ch);
                const shortLabel =
                  ch === 'Tiendas Propias Chaide' ? 'Tiendas' :
                  ch === 'Distribuidores & Cadenas' ? 'Cadenas' :
                  ch === 'Canal Digital E-commerce' ? 'Digital' : 'Hotelero';
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    title={ch}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                      active
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
