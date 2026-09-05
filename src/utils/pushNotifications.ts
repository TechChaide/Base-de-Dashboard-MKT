import { AlertRule, PushNotificationItem, SalesRecord } from '../types';

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-yoy-drop',
    name: 'Caída de Ventas YoY > 10% (Alerta Comercial)',
    metric: 'yoyGrowth',
    condition: 'less_than',
    threshold: -10,
    scope: 'city',
    enabled: true,
  },
  {
    id: 'rule-low-margin',
    name: 'Margen Bruto Crítico < 33% (Rentabilidad)',
    metric: 'grossMargin',
    condition: 'less_than',
    threshold: 33,
    scope: 'category',
    enabled: true,
  },
  {
    id: 'rule-low-fulfillment',
    name: 'Cumplimiento Presupuesto < 88% (Meta Mensual)',
    metric: 'fulfillment',
    condition: 'less_than',
    threshold: 88,
    scope: 'global',
    enabled: true,
  },
  {
    id: 'rule-high-returns',
    name: 'Tasa de Garantía / Reclamos > 2.2% (Calidad)',
    metric: 'returnRate',
    condition: 'greater_than',
    threshold: 2.2,
    scope: 'category',
    enabled: true,
  },
  {
    id: 'rule-demand-surge',
    name: 'Pico de Demanda Inusual > +25% (Riesgo Stock Fábrica)',
    metric: 'yoyGrowth',
    condition: 'greater_than',
    threshold: 25,
    scope: 'city',
    enabled: true,
  },
];

/**
 * Clean Web Audio API subtle chime
 */
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio might be restricted until user interaction
  }
}

/**
 * Requests browser native notification permission
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

/**
 * Fires a native push notification if permitted
 */
export function sendBrowserPush(title: string, body: string) {
  playNotificationSound();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'chaide-alert-' + Date.now(),
      });
    } catch {
      // Fallback handled in-app
    }
  }
}

/**
 * Analyzes records and triggers alert items according to active rules
 */
export function evaluateAlertRules(
  records: SalesRecord[],
  rules: AlertRule[]
): PushNotificationItem[] {
  const alerts: PushNotificationItem[] = [];
  const activeRules = rules.filter(r => r.enabled);

  if (records.length === 0 || activeRules.length === 0) return [];

  // Group by City for city-scoped rules
  const cityAggregates: Record<string, { current: number; previous: number; budget: number }> = {};
  // Group by Category for category-scoped rules
  const catAggregates: Record<string, { sales: number; cost: number; returnWeighted: number; units: number }> = {};

  let totalSales = 0;
  let totalBudget = 0;

  const currentYear = Math.max(...records.map(r => r.year));
  const previousYear = currentYear - 1;

  records.forEach(r => {
    if (r.year === currentYear) {
      totalSales += r.salesAmount;
      totalBudget += r.budgetAmount;

      // City aggregate
      if (!cityAggregates[r.city]) {
        cityAggregates[r.city] = { current: 0, previous: 0, budget: 0 };
      }
      cityAggregates[r.city].current += r.salesAmount;
      cityAggregates[r.city].budget += r.budgetAmount;

      // Category aggregate
      if (!catAggregates[r.category]) {
        catAggregates[r.category] = { sales: 0, cost: 0, returnWeighted: 0, units: 0 };
      }
      catAggregates[r.category].sales += r.salesAmount;
      catAggregates[r.category].cost += r.costAmount;
      catAggregates[r.category].units += r.units;
      catAggregates[r.category].returnWeighted += r.returnRate * r.units;
    } else if (r.year === previousYear) {
      if (!cityAggregates[r.city]) {
        cityAggregates[r.city] = { current: 0, previous: 0, budget: 0 };
      }
      cityAggregates[r.city].previous += r.salesAmount;
    }
  });

  // Evaluate each rule
  activeRules.forEach(rule => {
    // 1. Global fulfillment rule
    if (rule.scope === 'global' && rule.metric === 'fulfillment') {
      const fulfillment = totalBudget > 0 ? (totalSales / totalBudget) * 100 : 100;
      const isBreached = rule.condition === 'less_than' ? fulfillment < rule.threshold : fulfillment > rule.threshold;
      if (isBreached) {
        alerts.push({
          id: `alert-${rule.id}-global`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Desvío de Meta Global: ${fulfillment.toFixed(1)}%`,
          message: `El cumplimiento global está por debajo del umbral mínimo del ${rule.threshold}%. Se requiere revisión de presupuestos comerciales.`,
          level: 'critical',
          entityName: 'Total Empresa Chaide',
          metricValue: `${fulfillment.toFixed(1)}% (Meta: ${rule.threshold}%)`,
          read: false,
        });
      }
    }

    // 2. City scope rules
    if (rule.scope === 'city' && rule.metric === 'yoyGrowth') {
      Object.entries(cityAggregates).forEach(([cityName, data]) => {
        if (data.previous > 0) {
          const yoy = ((data.current - data.previous) / data.previous) * 100;
          const isBreached = rule.condition === 'less_than' ? yoy < rule.threshold : yoy > rule.threshold;
          if (isBreached) {
            const isCritical = rule.condition === 'less_than';
            alerts.push({
              id: `alert-${rule.id}-${cityName}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: isCritical ? `Caída Crítica en ${cityName}: ${yoy.toFixed(1)}%` : `Pico Extraordinario en ${cityName}: +${yoy.toFixed(1)}%`,
              message: isCritical
                ? `Las ventas en ${cityName} registran una contracción del ${Math.abs(yoy).toFixed(1)}% vs periodo anterior. Alerta para jefatura regional.`
                : `Demanda acelerada en ${cityName} superando el umbral de alerta de +${rule.threshold}%. Verificar disponibilidad en centro de acopio.`,
              level: isCritical ? 'critical' : 'positive',
              entityName: cityName,
              metricValue: `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}% YoY`,
              read: false,
            });
          }
        }
      });
    }

    // 3. Category scope rules (Margin or Return Rate)
    if (rule.scope === 'category') {
      Object.entries(catAggregates).forEach(([catName, data]) => {
        if (rule.metric === 'grossMargin' && data.sales > 0) {
          const margin = ((data.sales - data.cost) / data.sales) * 100;
          const isBreached = rule.condition === 'less_than' ? margin < rule.threshold : margin > rule.threshold;
          if (isBreached) {
            alerts.push({
              id: `alert-${rule.id}-${catName.slice(0, 10)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: `Margen en Riesgo: ${catName}`,
              message: `El margen bruto registrado es del ${margin.toFixed(1)}%, inferior al objetivo de control (${rule.threshold}%).`,
              level: 'warning',
              entityName: catName,
              metricValue: `${margin.toFixed(1)}% Margen`,
              read: false,
            });
          }
        }

        if (rule.metric === 'returnRate' && data.units > 0) {
          const avgReturn = data.returnWeighted / data.units;
          const isBreached = rule.condition === 'greater_than' ? avgReturn > rule.threshold : avgReturn < rule.threshold;
          if (isBreached) {
            alerts.push({
              id: `alert-${rule.id}-${catName.slice(0, 10)}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: `Tasa Elevada de Garantías: ${catName}`,
              message: `Reclamos de garantía al ${avgReturn.toFixed(2)}% (límite: ${rule.threshold}%). Reportar a aseguramiento de calidad Chaide.`,
              level: 'critical',
              entityName: catName,
              metricValue: `${avgReturn.toFixed(2)}% Garantías`,
              read: false,
            });
          }
        }
      });
    }
  });

  return alerts.slice(0, 8); // Top most critical
}
