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
    <div className="bg-white border-b border-sky-100 text-slate-700 py-3 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,43,102,0.03)]">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Years selection */}
          <div className="flex items-center gap-1.5 bg-sky-50/70 p-1 rounded-lg border border-sky-100">
            <span className="text-[11px] font-bold text-[#002B66] px-2 uppercase tracking-wider">Año:</span>
            {availableYears.map(year => {
              const active = filters.years.includes(year);
              return (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                    active
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 bg-sky-50/70 p-1 rounded-lg border border-sky-100">
            <span className="text-[11px] font-bold text-[#002B66] px-2 uppercase tracking-wider">Métrica:</span>
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
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0056B3] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
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
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/80 text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:border-[#002B66] focus:bg-white placeholder-slate-400 transition-colors"
              />
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors whitespace-nowrap cursor-pointer"
                title="Limpiar filtros seleccionados"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar ({activeFiltersCount})</span>
              </button>
            )}
          </div>

        </div>

        {/* Secondary filter chips row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          
          {/* Regions */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Región:</span>
            <div className="flex items-center gap-1">
              {REGIONS.map(reg => {
                const active = filters.regions.length === 0 || filters.regions.includes(reg);
                return (
                  <button
                    key={reg}
                    onClick={() => toggleRegion(reg)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-100 text-[#002B66] border-sky-200 shadow-2xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-white'
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
            <span className="text-slate-500 font-semibold">Línea Chaide:</span>
            <select
              value={filters.categories.length === 1 ? filters.categories[0] : 'ALL'}
              onChange={handleCategorySelect}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#002B66] focus:bg-white font-medium"
            >
              <option value="ALL">Todas las Líneas de Producto</option>
              {PRODUCTS_CATALOG.map(c => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Canal:</span>
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
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-[#0056B3] border-blue-200 shadow-2xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-white'
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
