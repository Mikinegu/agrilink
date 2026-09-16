/**
 * AgriFlow Rescue & B2B Commodity Exchange
 * Mathematical Calculation Utilities & Financial Economics Engine
 */

export interface LotEconomics {
  effectivePricePerKg: number;
  grossFarmerPayout: number;
  standardMarketValue: number;
  factorySavings: number;
  platformFee: number;
  netFarmerTakeHome: number;
}

/**
 * Computes live B2B distressed harvest discount economics:
 * - effectivePricePerKg: P_eff = P_0 * (1 - D / 100)
 * - grossFarmerPayout: V_gross = W * P_eff
 * - standardMarketValue: V_benchmark = W * P_0
 * - factorySavings: S = V_benchmark - V_gross
 * - platformFee: F = 2.5% * V_gross
 * - netFarmerTakeHome: V_net = V_gross - F
 */
export function computeLotEconomics(
  weightKg: number,
  benchmarkPricePerKg: number,
  discountPct: number
): LotEconomics {
  const safeWeight = Math.max(0, Number(weightKg) || 0);
  const safeBenchmark = Math.max(0, Number(benchmarkPricePerKg) || 0);
  const safeDiscount = Math.min(100, Math.max(0, Number(discountPct) || 0));

  const effectivePricePerKg = Number((safeBenchmark * (1 - safeDiscount / 100)).toFixed(2));
  const grossFarmerPayout = Math.round(safeWeight * effectivePricePerKg);
  const standardMarketValue = Math.round(safeWeight * safeBenchmark);
  const factorySavings = Math.max(0, standardMarketValue - grossFarmerPayout);
  const platformFee = Number((grossFarmerPayout * 0.025).toFixed(2));
  const netFarmerTakeHome = Number((grossFarmerPayout - platformFee).toFixed(2));

  return {
    effectivePricePerKg,
    grossFarmerPayout,
    standardMarketValue,
    factorySavings,
    platformFee,
    netFarmerTakeHome,
  };
}

/**
 * Calculates incremental farmer financial gain when countering with a lower discount:
 * Incremental Gain = New Gross Farmer Payout - Previous Gross Farmer Payout
 */
export function computeCounterGain(
  weightKg: number,
  benchmarkPricePerKg: number,
  prevDiscountPct: number,
  newDiscountPct: number
): {
  prevGrossPayout: number;
  newGrossPayout: number;
  gainRetained: number;
  prevEffectivePrice: number;
  newEffectivePrice: number;
} {
  const prevEcon = computeLotEconomics(weightKg, benchmarkPricePerKg, prevDiscountPct);
  const newEcon = computeLotEconomics(weightKg, benchmarkPricePerKg, newDiscountPct);
  const gainRetained = newEcon.grossFarmerPayout - prevEcon.grossFarmerPayout;

  return {
    prevGrossPayout: prevEcon.grossFarmerPayout,
    newGrossPayout: newEcon.grossFarmerPayout,
    gainRetained,
    prevEffectivePrice: prevEcon.effectivePricePerKg,
    newEffectivePrice: newEcon.effectivePricePerKg,
  };
}

/**
 * Calculates estimated freight carrier fee based on weight (kg) and distance (km).
 * Standard Ethiopian agro-logistics benchmark: ~2.50 ETB/kg for regional reefer corridor.
 */
export function computeCarrierFreightFee(weightKg: number, distanceKm: number = 80): number {
  const weightTons = Math.max(0, Number(weightKg) || 0) / 1000;
  // Base dispatch charge + ton-km rate
  const baseRateEtb = 4500;
  const tonKmRate = 12.5; // ETB per ton per km
  const total = baseRateEtb + (weightTons * distanceKm * tonKmRate);
  return Math.round(total);
}

/**
 * Evaluates industrial processing suitability based on Brix sugar density and defect %:
 */
export function evaluateIndustrialSuitability(
  commodity: string,
  brixLevel: number,
  defectSeverityPct: number
): {
  matchScorePercent: number;
  recommendedProcesses: string[];
  assessment: string;
} {
  const brix = Number(brixLevel) || 0;
  const defect = Number(defectSeverityPct) || 0;

  const lowerComm = commodity.toLowerCase();

  if (lowerComm.includes('tomato')) {
    let score = 70;
    if (brix >= 5.0) score += 20;
    else if (brix >= 4.2) score += 10;
    if (defect <= 35) score += 10;
    return {
      matchScorePercent: Math.min(99, score),
      recommendedProcesses: [
        'Concentrated 28-30°Bx Tomato Paste',
        'Bulk Puree for Industrial Ketchup',
        'Pizza Sauce Pulp Base',
      ],
      assessment: `Brix of ${brix}°Bx with ${defect}% superficial defect is optimal for industrial thermal concentration into paste.`,
    };
  }

  if (lowerComm.includes('orange') || lowerComm.includes('citrus')) {
    let score = 72;
    if (brix >= 10.5) score += 22;
    else if (brix >= 9.0) score += 12;
    if (defect <= 30) score += 6;
    return {
      matchScorePercent: Math.min(98, score),
      recommendedProcesses: [
        'Frozen Concentrated Orange Juice (FCOJ)',
        'Industrial Pectin Recovery',
        'Cold-Pressed Peel Essential Oil',
      ],
      assessment: `Rich juice sac density (${brix}°Bx) allows immediate centrifugal extraction bypassing cosmetic sorting.`,
    };
  }

  // General fallback for potatoes, mangoes, onions, etc.
  return {
    matchScorePercent: 88,
    recommendedProcesses: ['Industrial Dehydration & Powder', 'Starch / Puree Processing'],
    assessment: 'Suitable for secondary industrial food transformation with minimal defect trimming.',
  };
}

/**
 * Computes degradation deadline timestamp
 */
export function computeDegradationDeadline(degradationHours: number): Date {
  const hours = Math.max(1, Number(degradationHours) || 24);
  return new Date(Date.now() + hours * 3600 * 1000);
}

/**
 * Computes remaining shelf-life hours before soft-rot onset:
 */
export function computeHoursRemaining(deadline: Date | string): number {
  const target = new Date(deadline).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return 0;
  return Number((diffMs / (3600 * 1000)).toFixed(1));
}
