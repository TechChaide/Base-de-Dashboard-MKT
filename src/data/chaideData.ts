import { CityGeo, ProductCategory, Region, SalesChannel, SalesRecord } from '../types';

export const CITIES_METADATA: CityGeo[] = [
  { id: 'uio', name: 'Quito', region: 'Sierra', lat: -0.1807, lng: -78.4678, svgX: 310, svgY: 135, populationTier: 'Metrópoli' },
  { id: 'gye', name: 'Guayaquil', region: 'Costa', lat: -2.1894, lng: -79.8891, svgX: 235, svgY: 310, populationTier: 'Metrópoli' },
  { id: 'cue', name: 'Cuenca', region: 'Austro', lat: -2.9001, lng: -79.0059, svgX: 295, svgY: 375, populationTier: 'Principal' },
  { id: 'amb', name: 'Ambato', region: 'Sierra', lat: -1.2491, lng: -78.6168, svgX: 305, svgY: 225, populationTier: 'Principal' },
  { id: 'man', name: 'Manta', region: 'Costa', lat: -0.9677, lng: -80.7089, svgX: 160, svgY: 210, populationTier: 'Principal' },
  { id: 'pvo', name: 'Portoviejo', region: 'Costa', lat: -1.0546, lng: -80.4545, svgX: 180, svgY: 225, populationTier: 'Principal' },
  { id: 'std', name: 'Santo Domingo', region: 'Costa', lat: -0.2531, lng: -79.1754, svgX: 255, svgY: 155, populationTier: 'Principal' },
  { id: 'mch', name: 'Machala', region: 'Costa', lat: -3.2581, lng: -79.9554, svgX: 220, svgY: 410, populationTier: 'Principal' },
  { id: 'loj', name: 'Loja', region: 'Austro', lat: -3.9931, lng: -79.2042, svgX: 285, svgY: 445, populationTier: 'Principal' },
  { id: 'iba', name: 'Ibarra', region: 'Sierra', lat: 0.3517, lng: -78.1222, svgX: 330, svgY: 90, populationTier: 'Principal' },
  { id: 'rio', name: 'Riobamba', region: 'Sierra', lat: -1.6636, lng: -78.6546, svgX: 310, svgY: 260, populationTier: 'Principal' },
  { id: 'sal', name: 'Salinas', region: 'Costa', lat: -2.2173, lng: -80.9586, svgX: 140, svgY: 325, populationTier: 'Secundaria' },
  { id: 'lat', name: 'Latacunga', region: 'Sierra', lat: -0.9352, lng: -78.6155, svgX: 305, svgY: 185, populationTier: 'Secundaria' },
  { id: 'esm', name: 'Esmeraldas', region: 'Costa', lat: 0.9592, lng: -79.6540, svgX: 215, svgY: 70, populationTier: 'Secundaria' },
  { id: 'ten', name: 'Tena', region: 'Oriente', lat: -0.9938, lng: -77.8129, svgX: 390, svgY: 185, populationTier: 'Secundaria' },
  { id: 'puy', name: 'Puyo', region: 'Oriente', lat: -1.4878, lng: -77.9991, svgX: 380, svgY: 240, populationTier: 'Secundaria' },
  { id: 'coc', name: 'Coca (Orellana)', region: 'Oriente', lat: -0.4664, lng: -76.9872, svgX: 450, svgY: 140, populationTier: 'Secundaria' },
];

export const PRODUCTS_CATALOG: { category: ProductCategory; products: { name: string; basePrice: number; margin: number }[] }[] = [
  {
    category: 'Colchones Premium & Resortes',
    products: [
      { name: 'Chaide Restonic Royal Pocket', basePrice: 620, margin: 44.5 },
      { name: 'Chaide Continental Pillow Top', basePrice: 510, margin: 41.2 },
      { name: 'Chaide Imperial Titanium 2.0', basePrice: 690, margin: 46.0 },
      { name: 'Chaide Bio Balance Dual Spring', basePrice: 470, margin: 39.8 },
    ],
  },
  {
    category: 'Colchones Ortopédicos',
    products: [
      { name: 'Chaide Zafiro Ortopédico Extra Firme', basePrice: 380, margin: 37.5 },
      { name: 'Chaide Cliniflex Posture Care', basePrice: 420, margin: 38.9 },
      { name: 'Chaide Platino Confort Ortopédico', basePrice: 340, margin: 36.2 },
    ],
  },
  {
    category: 'Colchones Memory Foam',
    products: [
      { name: 'Chaide Cloud Dream Gel Memory', basePrice: 740, margin: 48.0 },
      { name: 'Chaide Smart Sensation Visco', basePrice: 580, margin: 43.5 },
    ],
  },
  {
    category: 'Almohadas Ergonómicas',
    products: [
      { name: 'Almohada Chaide Memory Gel Cervical', basePrice: 38, margin: 52.0 },
      { name: 'Almohada Chaide Plumón Sintético Soft', basePrice: 26, margin: 49.5 },
      { name: 'Almohada Chaide Bamboo Antiácaros', basePrice: 32, margin: 51.2 },
    ],
  },
  {
    category: 'Bases & Somieres',
    products: [
      { name: 'Somier Chaide Madera Tapizada Select', basePrice: 195, margin: 35.0 },
      { name: 'Base Ajustable Chaide Motion Flex', basePrice: 480, margin: 41.5 },
      { name: 'Base Box Spring Reforzada', basePrice: 165, margin: 33.8 },
    ],
  },
  {
    category: 'Ropa de Cama & Duvets',
    products: [
      { name: 'Protector Chaide Impermeable Dry-Tech', basePrice: 42, margin: 54.0 },
      { name: 'Duvet Chaide Microfibra 4 Estaciones', basePrice: 78, margin: 48.5 },
      { name: 'Juego de Sábanas 400 Hilos Algodón', basePrice: 65, margin: 46.0 },
    ],
  },
  {
    category: 'Línea Hotelera & Muebles',
    products: [
      { name: 'Colchón Chaide Hospitality Grand Suite', basePrice: 550, margin: 39.0 },
      { name: 'Sofá Cama Chaide Praga Confort', basePrice: 490, margin: 37.0 },
    ],
  },
];

export const CHANNELS: SalesChannel[] = [
  'Tiendas Propias Chaide',
  'Distribuidores & Cadenas',
  'Canal Digital E-commerce',
  'B2B Hotelero & Proyectos',
];

export const REGIONS: Region[] = ['Sierra', 'Costa', 'Austro', 'Oriente'];

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_SHORT_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Seeded pseudorandom generator for deterministic, consistent realistic data
function createPseudoRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Generates historical Chaide sales data across 2024, 2025, and 2026
 * Incorporates authentic Ecuadorian retail seasonality:
 * - May: Día de la Madre spike (huge for mattress / bedroom renewal)
 * - June: Día del Padre & Costa mid-year bonus
 * - Nov: Black Friday & Cyber Days
 * - Dec: Décimo Tercero bonus & Christmas renewal
 */
export function generateChaideDataset(): SalesRecord[] {
  const records: SalesRecord[] = [];
  const rng = createPseudoRandom(42);

  const years = [2024, 2025, 2026];
  let idCounter = 1000;

  // City weight multipliers
  const cityWeights: Record<string, number> = {
    'Quito': 1.45,
    'Guayaquil': 1.60,
    'Cuenca': 0.78,
    'Ambato': 0.52,
    'Manta': 0.48,
    'Portoviejo': 0.40,
    'Santo Domingo': 0.44,
    'Machala': 0.46,
    'Loja': 0.32,
    'Ibarra': 0.30,
    'Riobamba': 0.28,
    'Salinas': 0.24,
    'Latacunga': 0.22,
    'Esmeraldas': 0.20,
    'Tena': 0.14,
    'Puyo': 0.12,
    'Coca (Orellana)': 0.15,
  };

  // Monthly seasonal factor
  const monthlySeasonality: Record<number, number> = {
    1: 0.88, // January low season post holidays
    2: 0.92, // February school cycle Costa
    3: 0.98,
    4: 1.05, // Prep for Mother's Day
    5: 1.35, // Mother's Day peak campaign
    6: 1.08, // Father's Day
    7: 1.02,
    8: 0.96, // Sierra school entry
    9: 1.04,
    10: 1.10, // Trade fair campaigns
    11: 1.40, // Black Friday & Cyber Chaide
    12: 1.48, // Christmas bonuses (Décimo)
  };

  for (const year of years) {
    // 2026 goes through month 9 (historical YTD) + 10-12 are current/forecast baseline
    const maxMonth = year === 2026 ? 9 : 12;
    const yearGrowthFactor = year === 2024 ? 1.0 : year === 2025 ? 1.11 : 1.23;

    for (let month = 1; month <= maxMonth; month++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}`;
      const seasonFactor = monthlySeasonality[month] || 1.0;

      for (const cityMeta of CITIES_METADATA) {
        const cityMultiplier = cityWeights[cityMeta.name] || 0.3;

        // Specific regional growth trends
        // E.g., Costa had high e-commerce growth in 2025/2026, Austro has high premium mattresses
        let regionalTrend = 1.0;
        if (cityMeta.region === 'Austro') regionalTrend = 1.06;
        if (cityMeta.region === 'Costa' && year >= 2025) regionalTrend = 1.09;
        if (cityMeta.region === 'Sierra' && cityMeta.name === 'Quito') regionalTrend = 1.08;

        for (const cat of PRODUCTS_CATALOG) {
          // Select 1 to 2 representative products per category per city-month
          for (const prod of cat.products) {
            // Assign distribution channel
            const channel = CHANNELS[Math.floor(rng() * CHANNELS.length)];

            // Base units calculation
            const noise = 0.85 + rng() * 0.30;
            const isHighTicket = prod.basePrice > 400;
            const baseUnitCount = isHighTicket ? 12 : 55;

            const units = Math.max(
              2,
              Math.round(baseUnitCount * cityMultiplier * seasonFactor * yearGrowthFactor * regionalTrend * noise)
            );

            // Sales Amount in USD
            const salesAmount = Math.round(units * prod.basePrice * (0.95 + rng() * 0.10));

            // Budget target with realistic variance (+/- 12%)
            const budgetBias = (year === 2026 && month >= 7) ? 1.05 : 0.98;
            const budgetAmount = Math.round(salesAmount * budgetBias * (0.90 + rng() * 0.20));

            // Cost and Gross Margin
            const baseMarginPercent = prod.margin;
            const marginVariance = (rng() - 0.5) * 4; // +/- 2%
            const grossMargin = parseFloat(Math.min(60, Math.max(22, baseMarginPercent + marginVariance)).toFixed(1));
            const costAmount = Math.round(salesAmount * (1 - grossMargin / 100));

            // Return/warranty rate (typical 0.6% - 2.8%)
            const returnRate = parseFloat((0.6 + rng() * 1.8).toFixed(2));

            idCounter++;
            records.push({
              id: `REC-${idCounter}`,
              year,
              month,
              date: dateStr,
              region: cityMeta.region,
              city: cityMeta.name,
              category: cat.category,
              productName: prod.name,
              channel,
              salesAmount,
              units,
              budgetAmount,
              costAmount,
              grossMargin,
              returnRate,
            });
          }
        }
      }
    }
  }

  return records;
}

/**
 * Pre-instantiated in-memory singleton dataset with memoized indices
 */
export const INITIAL_DATASET = generateChaideDataset();

/**
 * Export data to standard CSV string
 */
export function exportToCSV(data: SalesRecord[]): string {
  const headers = [
    'ID', 'Año', 'Mes', 'Fecha', 'Región', 'Ciudad',
    'Categoría', 'Producto', 'Canal', 'Venta_USD',
    'Unidades', 'Presupuesto_USD', 'Costo_USD', 'Margen_Pct', 'Tasa_Garantia_Pct'
  ];

  const rows = data.map(r => [
    r.id,
    r.year,
    r.month,
    r.date,
    `"${r.region}"`,
    `"${r.city}"`,
    `"${r.category}"`,
    `"${r.productName}"`,
    `"${r.channel}"`,
    r.salesAmount,
    r.units,
    r.budgetAmount,
    r.costAmount,
    r.grossMargin,
    r.returnRate,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Parse uploaded CSV string into SalesRecord array
 */
export function parseCSV(csvText: string): SalesRecord[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
  const records: SalesRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex to respect quoted strings
    const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!match) continue;
    const values = match.map(v => v.replace(/^"|"$/g, '').trim());

    try {
      const year = parseInt(values[1]) || 2026;
      const month = parseInt(values[2]) || 1;
      const date = values[3] || `${year}-${String(month).padStart(2, '0')}`;
      const region = (values[4] as Region) || 'Sierra';
      const city = values[5] || 'Quito';
      const category = (values[6] as ProductCategory) || 'Colchones Ortopédicos';
      const productName = values[7] || 'Producto Chaide';
      const channel = (values[8] as SalesChannel) || 'Tiendas Propias Chaide';
      const salesAmount = parseFloat(values[9]) || 0;
      const units = parseInt(values[10]) || 0;
      const budgetAmount = parseFloat(values[11]) || salesAmount * 0.95;
      const costAmount = parseFloat(values[12]) || salesAmount * 0.6;
      const grossMargin = parseFloat(values[13]) || 40.0;
      const returnRate = parseFloat(values[14]) || 1.0;

      records.push({
        id: values[0] || `IMP-${i}`,
        year,
        month,
        date,
        region,
        city,
        category,
        productName,
        channel,
        salesAmount,
        units,
        budgetAmount,
        costAmount,
        grossMargin,
        returnRate,
      });
    } catch {
      // Continue parsing resiliently
    }
  }

  return records;
}
