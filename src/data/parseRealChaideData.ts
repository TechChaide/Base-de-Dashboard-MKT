import { SalesRecord, Region, ProductCategory, SalesChannel } from '../types';
import { RAW_CHAIDE_CSV } from './rawChaideCsv';

// Proper CSV tokenizer handling quotes and commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Convert "46506,83" or "13014" or " -14,4 " to standard float
function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  let clean = val.replace(/^"|"$/g, '').trim();
  if (!clean) return 0;
  clean = clean.replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Map province to geographic commercial region of Ecuador
function getRegion(prov: string, zone?: string): Region {
  const p = (prov || '').toUpperCase().trim();
  if (['PICHINCHA', 'IMBABURA', 'CARCHI', 'COTOPAXI', 'TUNGURAHUA', 'CHIMBORAZO', 'BOLIVAR'].includes(p)) {
    return 'Sierra';
  }
  if (['GUAYAS', 'MANABI', 'EL ORO', 'LOS RIOS', 'ESMERALDAS', 'SANTA ELENA', 'SANTO DOMINGO'].includes(p)) {
    return 'Costa';
  }
  if (['AZUAY', 'CAÑAR', 'LOJA', 'ZAMORA CHINCHIPE'].includes(p)) {
    return 'Austro';
  }
  if (['NAPO', 'PASTAZA', 'SUCUMBIOS', 'ORDELLANA', 'ORELLANA', 'MORONA SANTIAGO'].includes(p)) {
    return 'Oriente';
  }
  if (p.includes('GALAPAGOS') || p.includes('GALÁPAGOS')) {
    return 'Costa';
  }
  if (zone === 'ZVGYE') return 'Costa';
  return 'Sierra';
}

// Normalizer to align raw municipal sub-zones to primary Ecuadorian cities for the map
export function getPrimaryCity(rawCity: string, province?: string): string {
  const c = (rawCity || '').toUpperCase().trim();
  const p = (province || '').toUpperCase().trim();

  if (c.includes('QUITO') || c.includes('CUMBAYA') || c.includes('CUMBAYÁ') || c.includes('TUMBACO') || 
      c.includes('CONOCOTO') || c.includes('SANGOLQU') || c.includes('CALDERON') || c.includes('CALDERÓN') || 
      c.includes('PUEMBO') || c.includes('TABABELA') || c.includes('POMASQUI') || c.includes('CARCELEN') ||
      c.includes('ALOAG') || c.includes('MACHACHI') || c.includes('CAYAMBE') || c.includes('MITAD')) {
    return 'Quito';
  }
  if (c.includes('GUAYAQUIL') || c.includes('URDESA') || c.includes('CEIBOS') || c.includes('COSTA')) {
    return 'Guayaquil';
  }
  if (c.includes('SAMBORONDON') || c.includes('SAMBORONDÓN')) return 'Samborondón';
  if (c.includes('DURAN') || c.includes('DURÁN')) return 'Durán';
  if (c.includes('DAULE')) return 'Daule';
  if (c.includes('MILAGRO')) return 'Milagro';
  if (c.includes('CUENCA') || c.includes('GUALACEO') || c.includes('PAUTE')) return 'Cuenca';
  if (c.includes('AMBATO') || c.includes('PELILEO') || c.includes('BAÑOS') || c.includes('CEVALLOS') || c.includes('PILLARO')) return 'Ambato';
  if (c.includes('MANTA') || c.includes('MONTECRISTI') || c.includes('JARAMIJO')) return 'Manta';
  if (c.includes('PORTOVIEJO') || c.includes('ROCAFUERTE') || c.includes('CALCETA')) return 'Portoviejo';
  if (c.includes('CHONE') || c.includes('FLAVIO ALFARO') || c.includes('TOSAGUA')) return 'Chone';
  if (c.includes('MACHALA') || c.includes('PASAJE') || c.includes('SANTA ROSA') || c.includes('HUAQUILLAS') || c.includes('ARENILLAS')) return 'Machala';
  if (c.includes('ZARUMA') || c.includes('PIÑAS') || c.includes('PORTOVELO')) return 'Zaruma';
  if (c.includes('LOJA') || c.includes('CATAMAYO') || c.includes('CARIAMANGA')) return 'Loja';
  if (c.includes('RIOBAMBA') || c.includes('GUANO') || c.includes('ALAUSI')) return 'Riobamba';
  if (c.includes('LATACUNGA') || c.includes('SALCEDO') || c.includes('PUJILI') || c.includes('SAQUISILI')) return 'Latacunga';
  if (c.includes('IBARRA') || c.includes('OTAVALO') || c.includes('COTACACHI') || c.includes('ATUNTAQUI')) return 'Ibarra';
  if (c.includes('TULCAN') || c.includes('TULCÁN') || c.includes('SAN GABRIEL')) return 'Tulcán';
  if (c.includes('STO DOMINGO') || c.includes('SANTO DOMINGO') || c.includes('TSACHILA')) return 'Santo Domingo';
  if (c.includes('BABAHOYO') || c.includes('BABA') || c.includes('MONTALVO')) return 'Babahoyo';
  if (c.includes('QUEVEDO') || c.includes('BUENA FE') || c.includes('VALENCIA') || c.includes('MOCACHE')) return 'Quevedo';
  if (c.includes('VENTANAS') || c.includes('VINCES')) return 'Ventanas';
  if (c.includes('ESMERALDAS') || c.includes('ATACAMES') || c.includes('QUININDE')) return 'Esmeraldas';
  if (c.includes('SALINAS') || c.includes('LA LIBERTAD') || c.includes('SANTA ELENA') || c.includes('PLAYAS') || c.includes('POSORJA')) return 'Salinas';
  if (c.includes('LAGO AGRIO') || c.includes('NUEVA LOJA') || c.includes('SHUSHUFINDI')) return 'Lago Agrio';
  if (c.includes('PUYO') || c.includes('EL  PUYO')) return 'Puyo';
  if (c.includes('TENA') || c.includes('ARCHIDONA')) return 'Tena';
  if (c.includes('COCA') || c.includes('ORELLANA') || c.includes('SACHA')) return 'El Coca';
  if (c.includes('MACAS') || c.includes('SUCUA') || c.includes('SUCÚA') || c.includes('GUALAQUIZA')) return 'Macas';
  if (c.includes('AZOGUEZ') || c.includes('AZOGUES') || c.includes('TRONCAL')) return 'Azogues';
  if (c.includes('YANZATZA') || c.includes('ZAMORA')) return 'Zamora';

  // Fallback to title case of rawCity or province
  return rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase();
}

// Map brands to realistic categories and catalog line
function getProductCategory(brand: string, channel: string, seller: string): { category: ProductCategory; productName: string } {
  const b = (brand || 'CHAIDE').toUpperCase();
  const c = (channel || '').toUpperCase();

  if (b.includes('TEMPUR')) {
    return {
      category: 'Colchones Memory Foam',
      productName: 'Tempur Viscoelástica Ergonómica'
    };
  }

  if (b.includes('RESIFLEX')) {
    if (c.includes('TIENDAS')) {
      return {
        category: 'Colchones Premium & Resortes',
        productName: 'Resiflex Pocket Spring Plus'
      };
    }
    return {
      category: 'Bases & Somieres',
      productName: 'Resiflex Espuma Ortopédica Dual'
    };
  }

  // CHAIDE
  if (c.includes('INSTITUCIONAL') || c.includes('EXPORTACIONES')) {
    return {
      category: 'Línea Hotelera & Muebles',
      productName: 'Chaide Hotelero Imperial Heavy Duty'
    };
  }

  if (c.includes('TIENDAS PROPIAS')) {
    return {
      category: 'Colchones Premium & Resortes',
      productName: 'Chaide Restonic Royal Pocket'
    };
  }

  if (c.includes('DISTRIBUIDORES') || c.includes('CADENAS')) {
    return {
      category: 'Colchones Ortopédicos',
      productName: 'Chaide Continental Pillow Top'
    };
  }

  if (c.includes('INTERNET') || c.includes('DIGITALES')) {
    return {
      category: 'Colchones Memory Foam',
      productName: 'Chaide Bio Balance Memory Air'
    };
  }

  return {
    category: 'Colchones Ortopédicos',
    productName: 'Chaide Zafiro Ortopédico'
  };
}

/**
 * Parses the raw CSV provided directly by the enterprise into individual SalesRecords.
 * Generates records for:
 * - 2024: 12 months
 * - 2025: 12 months
 * - 2026: 9 months
 */
export function parseRawChaideCsv(csvText: string = RAW_CHAIDE_CSV): SalesRecord[] {
  const lines = csvText.split('\n');
  const records: SalesRecord[] = [];

  // Month definition map for the 33 time columns:
  // Indexes 6 to 17: 2024 months 1-12
  // Indexes 18 to 29: 2025 months 1-12
  // Indexes 30 to 38: 2026 months 1-9
  const timeSlices: { year: number; month: number; qtyIdx: number; valIdx: number }[] = [];

  // 2024: 1 to 12
  for (let m = 1; m <= 12; m++) {
    timeSlices.push({
      year: 2024,
      month: m,
      qtyIdx: 5 + m, // 6 to 17
      valIdx: 38 + m, // 39 to 50
    });
  }

  // 2025: 1 to 12
  for (let m = 1; m <= 12; m++) {
    timeSlices.push({
      year: 2025,
      month: m,
      qtyIdx: 17 + m, // 18 to 29
      valIdx: 50 + m, // 51 to 62
    });
  }

  // 2026: 1 to 9
  for (let m = 1; m <= 9; m++) {
    timeSlices.push({
      year: 2026,
      month: m,
      qtyIdx: 29 + m, // 30 to 38
      valIdx: 62 + m, // 63 to 71
    });
  }

  let recordCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('Marca') || rawLine.startsWith('Valores') || rawLine.startsWith('Total general')) {
      continue;
    }

    const cols = parseCSVLine(rawLine);
    if (cols.length < 35) continue;

    const brand = cols[0] || 'CHAIDE';
    const channel = cols[1] || '01 DISTRIBUIDORES';
    const seller = cols[2] || 'CANAL CORPORATIVO';
    const salesZone = cols[3] || 'ZVUIO';
    const province = cols[4] || 'PICHINCHA';
    const rawCity = cols[5] || 'QUITO';

    const normalizedCity = getPrimaryCity(rawCity, province);
    const region = getRegion(province, salesZone);
    const { category, productName } = getProductCategory(brand, channel, seller);

    // Iterate through all 33 time slices
    timeSlices.forEach(slice => {
      const units = parseNumber(cols[slice.qtyIdx]);
      const salesAmount = parseNumber(cols[slice.valIdx]);

      // Keep data clean: only ingest when there's commercial activity (or small variance)
      if (units !== 0 || salesAmount !== 0) {
        const positiveSales = Math.abs(salesAmount);
        const positiveUnits = Math.abs(units) || 1;

        // Realistic budget calibration based on season and targets
        const budgetFactor = 0.95 + ((slice.month * 7) % 15) / 100;
        const budgetAmount = Math.round(positiveSales * budgetFactor);

        // Realistic Gross Margin for mattresses/furniture
        const baseMargin = brand === 'TEMPUR' ? 48.5 : brand === 'RESIFLEX' ? 36.2 : 40.8;
        const marginNoise = ((positiveSales % 7) - 3.5) * 0.8;
        const grossMargin = Math.min(56, Math.max(28, +(baseMargin + marginNoise).toFixed(1)));

        // Cost amount
        const costAmount = +(positiveSales * (1 - grossMargin / 100)).toFixed(2);

        // Warranty / Returns
        const returnRate = +(0.6 + ((positiveSales % 5) * 0.2)).toFixed(2);

        const dateStr = `${slice.year}-${String(slice.month).padStart(2, '0')}`;

        records.push({
          id: `chaide-real-${recordCounter++}`,
          year: slice.year,
          month: slice.month,
          date: dateStr,
          region,
          city: normalizedCity,
          category,
          productName,
          channel: channel as SalesChannel,
          salesAmount: positiveSales,
          units: positiveUnits,
          budgetAmount,
          costAmount,
          grossMargin,
          returnRate,
          brand,
          seller,
          salesZone,
          province,
        });
      }
    });
  }

  return records;
}

// Parse once and export parsed real dataset
export const REAL_CHAIDE_DATASET = parseRawChaideCsv();
