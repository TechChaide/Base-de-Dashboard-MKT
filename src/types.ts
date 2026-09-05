export type Region = 'Sierra' | 'Costa' | 'Austro' | 'Oriente' | 'Galápagos';

export type ProductCategory =
  | 'Colchones Ortopédicos'
  | 'Colchones Premium & Resortes'
  | 'Colchones Memory Foam'
  | 'Almohadas Ergonómicas'
  | 'Bases & Somieres'
  | 'Ropa de Cama & Duvets'
  | 'Línea Hotelera & Muebles'
  | string;

export type SalesChannel =
  | '01 DISTRIBUIDORES'
  | '02 TIENDAS PROPIAS'
  | '03 INTERNET'
  | '04 EXPORTACIONES'
  | '05 VENTAS DIRECTAS'
  | '06 CADENAS TIENDAS'
  | '07 DISTRIB RESIFLEX'
  | '08 INSTITUCIONAL'
  | '10 MEDIOS DIGITALES'
  | '11 TIENDAS RESIFLEX'
  | '13 INTERNET RESIFLEX'
  | string;

export interface SalesRecord {
  id: string;
  year: number;
  month: number; // 1 - 12
  date: string; // YYYY-MM
  region: Region;
  city: string;
  category: ProductCategory;
  productName: string;
  channel: SalesChannel;
  salesAmount: number; // $ USD
  units: number;
  budgetAmount: number; // $ USD
  costAmount: number; // $ USD
  grossMargin: number; // Percentage, e.g., 38.5
  returnRate: number; // Percentage, e.g., 1.2
  brand?: string;
  seller?: string;
  salesZone?: string;
  province?: string;
}

export type MetricKey = 'salesAmount' | 'units' | 'budgetAmount' | 'grossMargin' | 'fulfillment' | 'avgTicket';

export interface MetricDefinition {
  key: MetricKey;
  label: string;
  shortLabel: string;
  format: (val: number) => string;
  unit: string;
}

export interface CityGeo {
  id: string;
  name: string;
  region: Region;
  lat: number;
  lng: number;
  svgX: number; // Normalized SVG X coordinate on Ecuador map
  svgY: number; // Normalized SVG Y coordinate on Ecuador map
  populationTier: 'Metrópoli' | 'Principal' | 'Secundaria';
}

export interface CityPerformance {
  city: string;
  region: Region;
  currentSales: number;
  previousSales: number;
  yoyGrowth: number; // % growth
  units: number;
  budget: number;
  fulfillment: number; // %
  margin: number; // %
  topProduct: string;
  topChannel: string;
}

export interface FilterState {
  years: number[];
  months: number[];
  regions: Region[];
  cities: string[];
  categories: ProductCategory[];
  channels: SalesChannel[];
  selectedMetric: MetricKey;
  searchTerm: string;
}

export type CrossPivotMode =
  | 'region_vs_product'
  | 'city_vs_channel'
  | 'month_vs_year'
  | 'product_vs_margin'
  | 'sales_vs_budget'
  | 'city_vs_city';

export interface ForecastPoint {
  date: string;
  monthName: string;
  historicalSales?: number;
  forecastBase: number;
  forecastOptimistic: number;
  forecastPessimistic: number;
  budget: number;
  isProjected: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: 'yoyGrowth' | 'grossMargin' | 'fulfillment' | 'returnRate';
  condition: 'less_than' | 'greater_than';
  threshold: number;
  scope: 'global' | 'city' | 'category';
  enabled: boolean;
}

export interface PushNotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  level: 'critical' | 'warning' | 'positive';
  entityName: string;
  metricValue: string;
  read: boolean;
}
