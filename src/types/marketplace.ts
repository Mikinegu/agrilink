export type ExchangeRole = 'FARMER' | 'PROCESSOR' | 'CARRIER' | 'ARBITER';

export interface PersonaProfile {
  role: ExchangeRole;
  name: string;
  organization: string;
  badge: string;
  badgeColor: string;
  location: string;
  avatarUrl: string;
  description: string;
}

export const PERSONA_PROFILES: Record<ExchangeRole, PersonaProfile> = {
  FARMER: {
    role: 'FARMER',
    name: 'Ato Bekele Tadesse',
    organization: 'Wonji Horizon Cooperative Farms',
    badge: 'Producer / Smallholder',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    location: 'Wonji Gefersa, East Shewa (Oromia)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    description: 'Holding 18.5 MT of sunscalded Roma processing tomatoes requiring salvage trade within 36 hours.',
  },
  PROCESSOR: {
    role: 'PROCESSOR',
    name: 'Dr. Henok Haile (Procurement VP)',
    organization: 'RedGold Foods & Puree Ltd.',
    badge: 'Industrial Food Processor',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-300',
    location: 'Dukem Agro-Industrial Park, Oromia',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    description: 'Operating commercial tomato paste, puree, and ketchup production lines seeking high-Brix B-grade crops.',
  },
  CARRIER: {
    role: 'CARRIER',
    name: 'Captain Yared Solomon',
    organization: 'SwiftReefer Cold-Chain Logistics',
    badge: 'Cold-Chain Fleet Carrier',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    location: 'Addis Ababa - Adama Express Depot',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    description: 'Operating temperature-controlled reefers (0°C to 4°C) equipped with IoT telematics and digital e-BoL.',
  },
  ARBITER: {
    role: 'ARBITER',
    name: 'Selamawit Kebede, CPA',
    organization: 'Ethiopian Agricultural Escrow Vault',
    badge: 'Platform Arbiter & Escrow Auditor',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    location: 'Bole Financial District, Addis Ababa',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    description: 'Guarantees tri-party fund safety, validates factory gate QA refractometer readings, and settles payouts.',
  },
};

export type DamageCause =
  | 'SUNSCALD'
  | 'TRANSIT_BRUISING'
  | 'SKIN_SPLITTING'
  | 'HAIL_MARKS'
  | 'OVER_MATURITY'
  | 'IRREGULAR_SIZING';

export interface DamageCauseMeta {
  code: DamageCause;
  label: string;
  description: string;
  industrialImpact: string;
  severityMultiplier: number;
}

export const DAMAGE_CAUSE_CONFIG: Record<DamageCause, DamageCauseMeta> = {
  SUNSCALD: {
    code: 'SUNSCALD',
    label: 'Sunscald Bleaching',
    description: 'Localized heat blistering from intense sun exposure; tissue remains firm underneath.',
    industrialImpact: '100% suitable for purees, pastes, and processed cooking sauces after skin peeling.',
    severityMultiplier: 1.1,
  },
  SKIN_SPLITTING: {
    code: 'SKIN_SPLITTING',
    label: 'Rain Skin Splitting',
    description: 'Epidermal fissure following heavy rainfall surge; pulp sugars intact, high °Bx.',
    industrialImpact: 'Prime grade for immediate industrial mash, ketchup, or hot-break tomato paste.',
    severityMultiplier: 1.3,
  },
  TRANSIT_BRUISING: {
    code: 'TRANSIT_BRUISING',
    label: 'Transit Impact Bruising',
    description: 'Mechanical surface softening from unpaved feeder road transport.',
    industrialImpact: 'Safe for paste & fermentation processing when pasteurized immediately.',
    severityMultiplier: 1.4,
  },
  HAIL_MARKS: {
    code: 'HAIL_MARKS',
    label: 'Highland Hail Scars',
    description: 'Superficial skin indentations from highland squall; flesh and juice unaffected.',
    industrialImpact: 'Ideal for juices, purees, and dehydrated flakes.',
    severityMultiplier: 1.0,
  },
  OVER_MATURITY: {
    code: 'OVER_MATURITY',
    label: 'Rapid Peak Maturity',
    description: 'High Brix accumulation with reduced firm skin; elevated natural lycopene.',
    industrialImpact: 'Premium deep red color for industrial ketchup & paste formulations.',
    severityMultiplier: 1.25,
  },
  IRREGULAR_SIZING: {
    code: 'IRREGULAR_SIZING',
    label: 'Sub-Spec Diameter',
    description: 'Non-standard retail sizing rejected by fresh supermarket packaging lines.',
    industrialImpact: 'Completely unblemished pulp; ideal for industrial chipping and dicing.',
    severityMultiplier: 0.9,
  },
};

export type LotStatus =
  | 'OPEN_FOR_BIDS'
  | 'BID_SUBMITTED'
  | 'COUNTER_OFFER_PENDING'
  | 'LOCKED_IN_ESCROW'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_GATE'
  | 'QA_VERIFIED'
  | 'SETTLED'
  | 'DECLINED';

export interface Bid {
  id: string;
  lotId: string;
  processorId: string;
  processorName: string;
  processorOrg: string;
  proposedDiscountPercent: number; // e.g. 45%
  offeredPricePerKg: number; // calculated from benchmark
  totalOfferAmount: number;
  factorySavings: number; // vs benchmark grade A
  proposedDeliveryDate: string;
  plantLocation: string;
  intendedProduct: string; // 'Industrial Ketchup & Paste'
  notes: string;
  createdAt: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
}

export interface NegotiationState {
  id: string;
  lotId: string;
  bidId: string;
  initialDiscountPercent: number; // e.g. 45
  currentDiscountPercent: number; // currently selected or agreed
  counterDiscountPercent?: number; // e.g. 28
  unitPricePerKg: number;
  grossAmountEtb: number;
  farmerIncrementalGain: number; // compared to initial 45% offer
  factorySavingsEtb: number; // compared to Grade-A benchmark
  platformFeePercent: number; // 2.5%
  platformFeeEtb: number;
  carrierEstimatedFeeEtb: number;
  netFarmerPayoutEtb: number;
  status: 'PENDING_FARMER_ACTION' | 'PENDING_PROCESSOR_REVIEW' | 'AGREED' | 'DECLINED';
  updatedAt: string;
  history: {
    actor: string;
    role: ExchangeRole;
    action: string;
    discountPercent: number;
    amountEtb: number;
    timestamp: string;
    notes?: string;
  }[];
}

export interface TelematicsPoint {
  time: string;
  temperatureCelsius: number;
  humidityPercent: number;
  batteryPercent: number;
}

export interface DispatchJob {
  id: string;
  lotId: string;
  carrierId: string;
  carrierName: string;
  carrierOrg: string;
  carrierPhone: string;
  vehicleType: 'VENTILATED_DRY_TRUCK' | 'TEMPERATURE_CONTROLLED_REEFER';
  targetTempRange: string; // '0°C to 4°C'
  currentTempCelsius: number;
  currentHumidityPercent: number;
  originLocation: string;
  destinationPlant: string;
  totalDistanceKm: number;
  transitMinutesRemaining: number;
  transitStatus: 'DISPATCHED' | 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_AT_GATE';
  bolNumber: string;
  driverName: string;
  plateNumber: string;
  waypoints: {
    name: string;
    lat: number;
    lng: number;
    passed: boolean;
    time?: string;
  }[];
  telematicsStream: TelematicsPoint[];
}

export interface GateQaInspection {
  inspectorName: string;
  inspectorRole: string;
  verifiedBrix: number;
  verifiedDefectRate: number;
  pulpIntegrityPassed: boolean;
  foreignMatterPassed: boolean;
  overallPassed: boolean;
  inspectionNotes: string;
  inspectedAt: string;
}

export interface EscrowVaultRecord {
  id: string;
  lotId: string;
  totalDepositedEtb: number;
  farmerAllocationEtb: number;
  carrierAllocationEtb: number;
  platformCommissionEtb: number;
  escrowStatus: 'FUNDS_LOCKED' | 'QA_PASSED' | 'DISBURSED' | 'DISPUTED';
  depositTransactionRef: string;
  disbursedAt?: string;
  gateQa?: GateQaInspection;
}

export interface DistressedLot {
  id: string;
  lotNumber: string;
  farmerId: number;
  farmerName: string;
  farmerOrg: string;
  region: string;
  locationDetails: string;
  commodity: string;
  variety: string;
  category: 'VEGETABLE' | 'FRUIT' | 'TUBER' | 'GRAIN';
  lotWeightTons: number;
  lotWeightKg: number;
  benchmarkPricePerKg: number; // e.g. 85 ETB
  totalBenchmarkValue: number;
  farmerDiscountPercent?: number; // e.g. 35% discount offered by farmer
  discountedPricePerKg?: number; // e.g. 55.25 ETB/kg
  totalDiscountedValue?: number; // e.g. 1022125 ETB
  conditionSummary?: string; // Reason why out of prime condition & suitable for processing
  harvestDate: string;
  damageCauses: DamageCause[];
  defectPercentage: number; // 0-100%
  brixRating: number; // °Bx, e.g. 5.8
  acidityPh: number; // e.g. 4.3
  initialShelfLifeHours: number;
  softRotOnsetHoursRemaining: number; // countdown
  industrialSuitability: {
    recommendedProcesses: string[];
    matchScorePercent: number;
    scientificAssessment: string;
  };
  status: LotStatus;
  bids: Bid[];
  activeNegotiation?: NegotiationState;
  dispatchJob?: DispatchJob;
  escrowVault?: EscrowVaultRecord;
  imageUrl: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Financial & Dynamic Calculation Helpers
export interface VolumeDiscountTier {
  id: string;
  name?: string;
  minTons: number;
  maxTons?: number;
  volumeLabel: string;
  bonusDiscountPercent: number;
  description: string;
  badgeClass: string;
}

export const VOLUME_DISCOUNT_SCHEDULE: VolumeDiscountTier[] = [
  {
    id: 'tier-partial',
    name: 'Partial Load (<5 MT)',
    minTons: 0,
    maxTons: 5,
    volumeLabel: 'Partial Load (<5 MT)',
    bonusDiscountPercent: 0,
    description: 'Standard base discount for small trial batches and partial pickups.',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  {
    id: 'tier-medium',
    name: 'Single Reefer (5–10 MT)',
    minTons: 5,
    maxTons: 10,
    volumeLabel: 'Single Reefer (5–10 MT)',
    bonusDiscountPercent: 4,
    description: '+4% Fair Volume Discount for standard full-reefer truckload.',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'tier-fleet',
    name: 'Heavy Freight (10–18 MT)',
    minTons: 10,
    maxTons: 18,
    volumeLabel: 'Heavy Freight (10–18 MT)',
    bonusDiscountPercent: 7,
    description: '+7% Fair Volume Discount for multi-vehicle industrial dispatch.',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'tier-full-lot',
    name: 'Complete Field Clearance (Full Lot)',
    minTons: 18,
    volumeLabel: 'Complete Field Clearance (Full Lot)',
    bonusDiscountPercent: 10,
    description: '+10% Maximum Fair Discount: guarantees 100% crop rescue before soft rot.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
];

export function getVolumeDiscountTier(purchaseWeightTons: number, totalLotTons: number): VolumeDiscountTier {
  const isFullLot = totalLotTons > 0 && purchaseWeightTons >= totalLotTons * 0.95;
  if (isFullLot || purchaseWeightTons >= 18) {
    return VOLUME_DISCOUNT_SCHEDULE[3];
  }
  if (purchaseWeightTons >= 10) {
    return VOLUME_DISCOUNT_SCHEDULE[2];
  }
  if (purchaseWeightTons >= 5) {
    return VOLUME_DISCOUNT_SCHEDULE[1];
  }
  return VOLUME_DISCOUNT_SCHEDULE[0];
}

export function calculateVolumeAdjustedDiscount(
  baseDiscountPercent: number,
  purchaseWeightTons: number,
  totalLotTons: number
): {
  baseDiscount: number;
  bonusDiscount: number;
  volumeBonusPercent: number;
  effectiveDiscount: number;
  tier: VolumeDiscountTier;
  activeTier: VolumeDiscountTier;
} {
  const tier = getVolumeDiscountTier(purchaseWeightTons, totalLotTons);
  const bonusDiscount = tier.bonusDiscountPercent;
  const effectiveDiscount = Math.min(80, baseDiscountPercent + bonusDiscount);
  return {
    baseDiscount: baseDiscountPercent,
    bonusDiscount,
    volumeBonusPercent: bonusDiscount,
    effectiveDiscount,
    tier,
    activeTier: tier,
  };
}

export interface FinancialBreakdown {
  discountPercent: number;
  pricePerKg: number;
  grossTotalEtb: number;
  factorySavingsEtb: number;
  farmerIncrementalGain: number; // vs base discount
  platformFeeEtb: number;
  carrierEstimatedFeeEtb: number;
  netFarmerPayoutEtb: number;
}

export function calculateFinancialBreakdown(
  weightKg: number,
  benchmarkPricePerKg: number,
  selectedDiscountPercent: number,
  initialOfferedDiscountPercent: number = 45,
  carrierFeePerKg: number = 2.5
): FinancialBreakdown {
  const clampedDiscount = Math.max(5, Math.min(85, selectedDiscountPercent));
  const pricePerKg = benchmarkPricePerKg * (1 - clampedDiscount / 100);
  const grossTotalEtb = pricePerKg * weightKg;

  const fullBenchmarkTotal = benchmarkPricePerKg * weightKg;
  const factorySavingsEtb = fullBenchmarkTotal - grossTotalEtb;

  // Comparison to initial processor offer
  const initialPricePerKg = benchmarkPricePerKg * (1 - initialOfferedDiscountPercent / 100);
  const initialGrossTotal = initialPricePerKg * weightKg;
  const farmerIncrementalGain = Math.max(0, grossTotalEtb - initialGrossTotal);

  // Tri-party fees
  const platformFeeEtb = grossTotalEtb * 0.025; // 2.5% fee
  const carrierEstimatedFeeEtb = weightKg * carrierFeePerKg;
  const netFarmerPayoutEtb = Math.max(0, grossTotalEtb - platformFeeEtb);

  return {
    discountPercent: clampedDiscount,
    pricePerKg: Math.round(pricePerKg * 100) / 100,
    grossTotalEtb: Math.round(grossTotalEtb),
    factorySavingsEtb: Math.round(factorySavingsEtb),
    farmerIncrementalGain: Math.round(farmerIncrementalGain),
    platformFeeEtb: Math.round(platformFeeEtb),
    carrierEstimatedFeeEtb: Math.round(carrierEstimatedFeeEtb),
    netFarmerPayoutEtb: Math.round(netFarmerPayoutEtb),
  };
}

export function calculateSuitability(
  commodity: string,
  brix: number,
  defectPercent: number,
  causes: DamageCause[]
): { recommendedProcesses: string[]; matchScorePercent: number; scientificAssessment: string } {
  const isTomato = commodity.toLowerCase().includes('tomato');
  const isOrange = commodity.toLowerCase().includes('orange');
  const isPotato = commodity.toLowerCase().includes('potato');

  if (isTomato) {
    let score = 70;
    if (brix >= 5.2) score += 15;
    if (brix >= 5.8) score += 10;
    if (causes.includes('SKIN_SPLITTING')) score += 5; // sugar intact
    if (causes.includes('SUNSCALD')) score += 3;
    if (defectPercent > 60) score -= 15;

    const matchScore = Math.min(99, Math.max(40, score));
    return {
      recommendedProcesses: [
        'Commercial Tomato Paste (Cold-Break 28-30 °Bx)',
        'Heavy Puree & Pasta Sauces',
        'Standard Foodservice Ketchup Mash',
      ],
      matchScorePercent: matchScore,
      scientificAssessment: `High total soluble solids (${brix}°Bx) and natural lycopene make this lot an exceptional yield substrate for industrial evaporation, paste, and ketchup cooking.`,
    };
  }

  if (isOrange) {
    let score = 75;
    if (brix >= 10.5) score += 18;
    const matchScore = Math.min(98, Math.max(50, score));
    return {
      recommendedProcesses: ['Concentrated Citrus Juice', 'Citrus Pectin Extraction', 'Pulp Essence Oil'],
      matchScorePercent: matchScore,
      scientificAssessment: `Deep juice sacs and high Brix-to-acid ratio (${brix}°Bx) bypass aesthetic grading for immediate industrial centrifugal extraction.`,
    };
  }

  if (isPotato) {
    let score = 72;
    if (causes.includes('IRREGULAR_SIZING') || causes.includes('HAIL_MARKS')) score += 20;
    const matchScore = Math.min(98, Math.max(50, score));
    return {
      recommendedProcesses: ['Commercial Potato Starch', 'Flakes & Dehydrated Granules', 'Industrial French Fry Slicing'],
      matchScorePercent: matchScore,
      scientificAssessment: `Solid dry matter content (>21%) allows efficient abrasive mechanical peeling with negligible starch degradation.`,
    };
  }

  return {
    recommendedProcesses: ['Industrial Food Dehydration', 'Puree Formulation', 'Bio-Feed Recovery'],
    matchScorePercent: 82,
    scientificAssessment: `Nutrient density is well within Codex Alimentarius standards for thermal processing and pasteurization.`,
  };
}
