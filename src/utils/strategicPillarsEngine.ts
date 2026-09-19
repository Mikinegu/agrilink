/**
 * AgriLink Core Innovation Engine: 4 Strategic Pillars & Pitch Deck Engine
 * 
 * Pillar 1: Dynamic Shelf-Life & Degradation Pricing Engine (Thermal + Perishability Decay)
 * Pillar 2: Low-Resource Telephony & Local-Language Audio Pipeline (Amharic & Afaan Oromoo STT)
 * Pillar 3: Alternative Credit & Trust Scoring (Algorithmically Verified Production Score - AVPS)
 * Pillar 4: Spatial Aggregation & Logistics Pooling Engine (PostGIS ST_DWithin + Dynamic Packing)
 */

// ============================================================================
// PILLAR 1: DYNAMIC SHELF-LIFE & WASTE SALVAGE ENGINE
// ============================================================================

export interface PerishableCropConfig {
  cropType: string;
  label: string;
  decayConstant: number; // lambda
  basePriceETB: number; // P_base per quintal (100kg)
  floorPriceETB: number; // P_min floor salvage price
  defaultAmbientTemp: number; // Celsius
  maxShelfLifeHours: number;
}

export const CROP_CONFIGS: Record<string, PerishableCropConfig> = {
  tomato: {
    cropType: 'tomato',
    label: 'Roma & Hybrid Tomatoes (ቲማቲም)',
    decayConstant: 0.035, // lambda_tomato ≈ 0.035
    basePriceETB: 5400,
    floorPriceETB: 1650,
    defaultAmbientTemp: 24,
    maxShelfLifeHours: 96,
  },
  red_onion: {
    cropType: 'red_onion',
    label: 'Red Bombay Onions (ቀይ ሽንኩርት)',
    decayConstant: 0.005, // lambda_onion ≈ 0.005
    basePriceETB: 4800,
    floorPriceETB: 1800,
    defaultAmbientTemp: 22,
    maxShelfLifeHours: 240,
  },
  avocado: {
    cropType: 'avocado',
    label: 'Hass Export Avocado (አቮካዶ)',
    decayConstant: 0.025,
    basePriceETB: 6200,
    floorPriceETB: 2100,
    defaultAmbientTemp: 20,
    maxShelfLifeHours: 120,
  },
  potato: {
    cropType: 'potato',
    label: 'Gudene Ware Potato (ድንች)',
    decayConstant: 0.003,
    basePriceETB: 3200,
    floorPriceETB: 1200,
    defaultAmbientTemp: 19,
    maxShelfLifeHours: 360,
  },
  green_pepper: {
    cropType: 'green_pepper',
    label: 'Mareko Green Chili (ቃሪያ)',
    decayConstant: 0.028,
    basePriceETB: 7100,
    floorPriceETB: 2400,
    defaultAmbientTemp: 23,
    maxShelfLifeHours: 110,
  },
  leafy_cabbage: {
    cropType: 'leafy_cabbage',
    label: 'Savoy Highland Cabbage (ጥቅል ጎመን)',
    decayConstant: 0.042,
    basePriceETB: 2600,
    floorPriceETB: 850,
    defaultAmbientTemp: 21,
    maxShelfLifeHours: 72,
  },
};

export type SalvageTierCode = 'TIER_1_FRESH' | 'TIER_2_MARKDOWN' | 'TIER_3_SALVAGE' | 'TIER_4_BIOCIRCULAR';

export interface SalvageTierInfo {
  code: SalvageTierCode;
  tierNumber: 1 | 2 | 3 | 4;
  title: string;
  hoursRange: string;
  minHours: number;
  maxHours: number;
  discountDescription: string;
  targetBuyerSegment: string;
  actionSummary: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  status: 'ACTIVE' | 'SALVAGE_TRIGGERED' | 'REROUTED';
}

export const SALVAGE_TIERS: Record<SalvageTierCode, SalvageTierInfo> = {
  TIER_1_FRESH: {
    code: 'TIER_1_FRESH',
    tierNumber: 1,
    title: 'Tier 1: Fresh Direct (100% Base)',
    hoursRange: '0 → 36 hours',
    minHours: 0,
    maxHours: 36,
    discountDescription: '0% Markdown (Benchmark Market Price)',
    targetBuyerSegment: 'Premium Urban Buyers, Supermarkets, 5-Star Hotels & Export Desks',
    actionSummary: 'Marketplace Priority Placement with Grade-A Certified Seal',
    badgeColor: 'bg-emerald-500/10 text-emerald-400',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    status: 'ACTIVE',
  },
  TIER_2_MARKDOWN: {
    code: 'TIER_2_MARKDOWN',
    tierNumber: 2,
    title: 'Tier 2: Fast Markdown (-20%)',
    hoursRange: '36 → 60 hours',
    minHours: 36,
    maxHours: 60,
    discountDescription: '20% Automatic Value Markdown',
    targetBuyerSegment: 'Institutional Kitchens, University Bulk Canteens & Mid-Tier Wholesalers',
    actionSummary: 'Automated push notifications dispatched to wholesale procurement managers',
    badgeColor: 'bg-amber-500/10 text-amber-400',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    status: 'ACTIVE',
  },
  TIER_3_SALVAGE: {
    code: 'TIER_3_SALVAGE',
    tierNumber: 3,
    title: 'Tier 3: Industrial Salvage (Floor P_min)',
    hoursRange: '60 → 84 hours',
    minHours: 60,
    maxHours: 84,
    discountDescription: 'Floor Salvage Price (Cost + Industrial Break-even)',
    targetBuyerSegment: 'Tomato Paste/Puree Processors, Juice Extractors & Solar Dehydrators',
    actionSummary: 'Immediate salvage broadcast; factory line pick-up contracts auto-generated',
    badgeColor: 'bg-orange-500/10 text-orange-400',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    status: 'SALVAGE_TRIGGERED',
  },
  TIER_4_BIOCIRCULAR: {
    code: 'TIER_4_BIOCIRCULAR',
    tierNumber: 4,
    title: 'Tier 4: Bio-circular Direct (Zero-Waste)',
    hoursRange: '> 84 hours',
    minHours: 84,
    maxHours: 9999,
    discountDescription: 'Composting & Organic Waste Subsidized Payout',
    targetBuyerSegment: 'Regional Bio-Fertilizer Plants, Composting Hubs & Livestock Feed Mills',
    actionSummary: 'Automatic haulage rerouting to certified recycling facilities; zero food waste',
    badgeColor: 'bg-purple-500/10 text-purple-400',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    status: 'REROUTED',
  },
};

/**
 * Calculates real-time degradation price per quintal using:
 * P(t) = P_min + (P_base - P_min) * e^(-lambda * t * theta)
 * where theta = T_ambient / 20°C
 */
export function calculateDegradationPrice(
  pBase: number,
  pMin: number,
  lambda: number,
  hoursElapsed: number,
  ambientTempC: number
): {
  calculatedPrice: number;
  theta: number;
  decayExponent: number;
  tier: SalvageTierInfo;
  markdownPercent: number;
  farmerLossPreventedETB: number;
} {
  const theta = Math.max(0.5, ambientTempC / 20.0);
  const decayExponent = lambda * hoursElapsed * theta;
  const decayFactor = Math.exp(-decayExponent);
  
  let rawPrice = pMin + (pBase - pMin) * decayFactor;

  // Determine State Tier
  let tier: SalvageTierInfo;
  if (hoursElapsed <= 36) {
    tier = SALVAGE_TIERS.TIER_1_FRESH;
    rawPrice = Math.max(rawPrice, pBase * 0.95);
  } else if (hoursElapsed <= 60) {
    tier = SALVAGE_TIERS.TIER_2_MARKDOWN;
    // Tier 2: 20% automatic markdown rule applies
    rawPrice = Math.min(rawPrice, pBase * 0.80);
    rawPrice = Math.max(rawPrice, pMin * 1.15);
  } else if (hoursElapsed <= 84) {
    tier = SALVAGE_TIERS.TIER_3_SALVAGE;
    rawPrice = pMin; // Floor salvage price
  } else {
    tier = SALVAGE_TIERS.TIER_4_BIOCIRCULAR;
    rawPrice = pMin * 0.40; // Bio-circular salvage salvage payout
  }

  const calculatedPrice = Math.round(rawPrice);
  const markdownPercent = Math.round(((pBase - calculatedPrice) / pBase) * 100);
  const farmerLossPreventedETB = Math.max(0, calculatedPrice);

  return {
    calculatedPrice,
    theta: Number(theta.toFixed(2)),
    decayExponent: Number(decayExponent.toFixed(3)),
    tier,
    markdownPercent,
    farmerLossPreventedETB,
  };
}

// PostgreSQL Table Schema & DDL definition matching specification
export const POSTGRES_INVENTORY_SCHEMA_DDL = `-- PostgreSQL Production Schema for Degradation Pricing Engine
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE inventory_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL,
    grade VARCHAR(5) CHECK (grade IN ('A', 'B', 'C', 'Salvage')),
    initial_volume_quintals NUMERIC(10,2) NOT NULL,
    available_volume_quintals NUMERIC(10,2) NOT NULL,
    harvest_timestamp TIMESTAMPTZ NOT NULL,
    decay_constant NUMERIC(4,3) DEFAULT 0.035,
    base_price_etb NUMERIC(10,2) NOT NULL,
    floor_price_etb NUMERIC(10,2) NOT NULL,
    current_calculated_price NUMERIC(10,2) NOT NULL,
    ambient_temp_recorded NUMERIC(4,1) DEFAULT 22.0,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, SALVAGE_TRIGGERED, SOLD, REROUTED
    location_geom GEOGRAPHY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automated Trigger to Recalculate Prices on Sensor / Ambient Temp Updates
CREATE OR REPLACE FUNCTION update_degradation_price()
RETURNS TRIGGER AS $$
DECLARE
    hours_elapsed NUMERIC;
    theta NUMERIC;
BEGIN
    hours_elapsed := EXTRACT(EPOCH FROM (NOW() - NEW.harvest_timestamp)) / 3600;
    theta := GREATEST(0.5, NEW.ambient_temp_recorded / 20.0);
    
    NEW.current_calculated_price := NEW.floor_price_etb + 
        (NEW.base_price_etb - NEW.floor_price_etb) * EXP(-1 * NEW.decay_constant * hours_elapsed * theta);
        
    IF hours_elapsed > 84 THEN
        NEW.status := 'REROUTED';
    ELSIF hours_elapsed > 60 THEN
        NEW.status := 'SALVAGE_TRIGGERED';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;


// ============================================================================
// PILLAR 2: LOW-RESOURCE TELEPHONY & LOCAL-LANGUAGE AUDIO PIPELINE
// ============================================================================

export interface TelephonyAudioSample {
  id: string;
  callerPhone: string;
  callerName: string;
  language: 'am-ET' | 'om-ET' | 'en-US';
  languageLabel: string;
  transcription: string;
  confidenceScore: number;
  extractedEntities: {
    crop: string;
    cropLabel: string;
    quantityUnit: 'quintal';
    quantityValue: number;
    locationZone: string;
    locationWoreda: string;
    locationKebele: string;
    readyDate: string;
    declaredGrade: 'A' | 'B' | 'C';
  };
}

export const TELEPHONY_SAMPLE_CALLS: TelephonyAudioSample[] = [
  {
    id: 'ivr-call-01',
    callerPhone: '+251911482910',
    callerName: 'Ato Girma Wolde',
    language: 'am-ET',
    languageLabel: 'Amharic (አማርኛ)',
    transcription: 'መቂ ቀበሌ 02 ቀይ ሽንኩርት 5 ኩንታል ተዘጋጅቷል አሁን መጫን ይቻላል',
    confidenceScore: 0.94,
    extractedEntities: {
      crop: 'red_onion',
      cropLabel: 'Red Bombay Onion (ቀይ ሽንኩርት)',
      quantityUnit: 'quintal',
      quantityValue: 5.0,
      locationZone: 'East Shewa',
      locationWoreda: 'Dugda',
      locationKebele: 'Meki 02',
      readyDate: '2026-09-22T08:00:00Z',
      declaredGrade: 'A',
    },
  },
  {
    id: 'ivr-call-02',
    callerPhone: '+251922304918',
    callerName: 'Obbo Taddese Guyye',
    language: 'om-ET',
    languageLabel: 'Afaan Oromoo (Oromiffa)',
    transcription: 'Meqii ganda 02 timaatimi kuintaala 8 qophaa\'era gaafa borii fe\'ama',
    confidenceScore: 0.96,
    extractedEntities: {
      crop: 'tomato',
      cropLabel: 'Roma Tomatoes (ቲማቲም)',
      quantityUnit: 'quintal',
      quantityValue: 8.0,
      locationZone: 'East Shewa',
      locationWoreda: 'Dugda',
      locationKebele: 'Meki 02',
      readyDate: '2026-09-21T06:30:00Z',
      declaredGrade: 'A',
    },
  },
  {
    id: 'ivr-call-03',
    callerPhone: '+251933190822',
    callerName: 'W/ro Roman Bekele',
    language: 'am-ET',
    languageLabel: 'Amharic (አማርኛ)',
    transcription: 'ዝዋይ ባቱ ቀበሌ 04 ሮማ ቲማቲም 14 ኩንታል ዝግጁ ነው ዛሬ ማታ ይወሰድ',
    confidenceScore: 0.92,
    extractedEntities: {
      crop: 'tomato',
      cropLabel: 'Roma Tomatoes (ቲማቲም)',
      quantityUnit: 'quintal',
      quantityValue: 14.0,
      locationZone: 'East Shewa',
      locationWoreda: 'Adami Tullu',
      locationKebele: 'Batu 04',
      readyDate: '2026-09-20T17:00:00Z',
      declaredGrade: 'B',
    },
  },
];


// ============================================================================
// PILLAR 3: ALTERNATIVE CREDIT & TRUST SCORING (AGRI-FINTECH & AVPS)
// ============================================================================

export interface AvpsWeights {
  w1_fulfillment: number; // 0.35
  w2_quality: number;     // 0.25
  w3_volume: number;      // 0.20
  w4_tenure: number;      // 0.20
}

export const AVPS_WEIGHTS: AvpsWeights = {
  w1_fulfillment: 0.35,
  w2_quality: 0.25,
  w3_volume: 0.20,
  w4_tenure: 0.20,
};

export interface AvpsComputationResult {
  avpsScore: number; // 0 to 1000
  scorePercentage: number; // 0 to 100%
  tierGrade: 'AAA+ Sovereign Prime' | 'AA High Grade' | 'A Verified Producer' | 'BBB Emerging' | 'Subprime Watch';
  recommendedCreditLimitETB: number;
  interestRateAnnual: number;
  loanTermMonths: number;
  breakdown: {
    fulfillmentRateScore: number; // F * w1
    qualityMatchScore: number;    // Q * w2
    volumeScore: number;          // V * w3
    tenureScore: number;          // T * w4
  };
  partnerBankEligibilities: {
    bankName: string;
    facilityType: string;
    maxDisbursementETB: number;
    status: 'PRE_APPROVED' | 'ELIGIBLE' | 'CONDITIONAL';
  }[];
}

/**
 * Computes Algorithmically Verified Production Score (AVPS)
 * AVPS = w1*F + w2*Q + w3*V + w4*T
 * 
 * F (35%): (Delivered Orders / Accepted Contracts) * 100
 * Q (25%): Buyer inspection rating versus declared grade (1.0 = 100%, 0.5 = 50%)
 * V (20%): Logarithmic scale of total quintals delivered over 12 months
 * T (20%): Consistency of harvest cycles logged on platform
 */
export function calculateAVPS(
  deliveredOrders: number,
  acceptedContracts: number,
  qualityInspectionRatio: number, // 0.5 to 1.0
  annualVolumeQuintals: number,
  harvestCyclesCompleted: number
): AvpsComputationResult {
  // F (Fulfillment Rate 0-100)
  const F = acceptedContracts > 0 
    ? Math.min(100, Math.max(0, (deliveredOrders / acceptedContracts) * 100))
    : 80;

  // Q (Quality Match 0-100)
  const Q = Math.min(100, Math.max(0, qualityInspectionRatio * 100));

  // V (Volume Scalability: log10 scale, benchmark 500 quintals = 100)
  const logBench = Math.log10(500);
  const logActual = Math.log10(Math.max(1, annualVolumeQuintals));
  const V = Math.min(100, Math.max(0, (logActual / logBench) * 100));

  // T (Tenure / Regularity: benchmark 12 consecutive cycles = 100)
  const T = Math.min(100, Math.max(0, (harvestCyclesCompleted / 12) * 100));

  // Weighted index (0-100)
  const weightedIndex = 
    AVPS_WEIGHTS.w1_fulfillment * F +
    AVPS_WEIGHTS.w2_quality * Q +
    AVPS_WEIGHTS.w3_volume * V +
    AVPS_WEIGHTS.w4_tenure * T;

  // Scale to 0-1000 credit score
  const avpsScore = Math.round(weightedIndex * 10);

  let tierGrade: AvpsComputationResult['tierGrade'] = 'BBB Emerging';
  let recommendedCreditLimitETB = 50000;
  let interestRateAnnual = 12.5;
  let loanTermMonths = 6;

  if (avpsScore >= 850) {
    tierGrade = 'AAA+ Sovereign Prime';
    recommendedCreditLimitETB = 450000;
    interestRateAnnual = 7.5;
    loanTermMonths = 12;
  } else if (avpsScore >= 750) {
    tierGrade = 'AA High Grade';
    recommendedCreditLimitETB = 280000;
    interestRateAnnual = 8.8;
    loanTermMonths = 9;
  } else if (avpsScore >= 650) {
    tierGrade = 'A Verified Producer';
    recommendedCreditLimitETB = 160000;
    interestRateAnnual = 10.2;
    loanTermMonths = 6;
  } else if (avpsScore >= 500) {
    tierGrade = 'BBB Emerging';
    recommendedCreditLimitETB = 75000;
    interestRateAnnual = 13.0;
    loanTermMonths = 4;
  } else {
    tierGrade = 'Subprime Watch';
    recommendedCreditLimitETB = 25000;
    interestRateAnnual = 15.5;
    loanTermMonths = 3;
  }

  const partnerBankEligibilities = [
    {
      bankName: 'Commercial Bank of Ethiopia (CBE)',
      facilityType: 'CBE Birr Agri-PreHarvest Working Capital',
      maxDisbursementETB: recommendedCreditLimitETB,
      status: avpsScore >= 700 ? 'PRE_APPROVED' : 'ELIGIBLE',
    },
    {
      bankName: 'Awash Bank S.C.',
      facilityType: 'Smallholder Input & Seedling Revolving Facility',
      maxDisbursementETB: Math.round(recommendedCreditLimitETB * 0.85),
      status: avpsScore >= 650 ? 'PRE_APPROVED' : 'ELIGIBLE',
    },
    {
      bankName: 'Oromia Bank',
      facilityType: 'Gadaa Agricultural Value Chain Advance',
      maxDisbursementETB: Math.round(recommendedCreditLimitETB * 0.90),
      status: avpsScore >= 600 ? 'PRE_APPROVED' : 'CONDITIONAL',
    },
    {
      bankName: 'Sinqee Bank',
      facilityType: 'Rural Women & Youth Micro-Irrigation Credit',
      maxDisbursementETB: Math.round(recommendedCreditLimitETB * 0.75),
      status: 'PRE_APPROVED',
    },
  ];

  return {
    avpsScore,
    scorePercentage: Number(weightedIndex.toFixed(1)),
    tierGrade,
    recommendedCreditLimitETB,
    interestRateAnnual,
    loanTermMonths,
    breakdown: {
      fulfillmentRateScore: Number((AVPS_WEIGHTS.w1_fulfillment * F).toFixed(1)),
      qualityMatchScore: Number((AVPS_WEIGHTS.w2_quality * Q).toFixed(1)),
      volumeScore: Number((AVPS_WEIGHTS.w3_volume * V).toFixed(1)),
      tenureScore: Number((AVPS_WEIGHTS.w4_tenure * T).toFixed(1)),
    },
    partnerBankEligibilities: partnerBankEligibilities as any,
  };
}


// ============================================================================
// PILLAR 4: SPATIAL AGGREGATION & LOGISTICS POOLING ENGINE (POSTGIS)
// ============================================================================

export interface FarmListingSpatial {
  id: string;
  farmerId: string;
  farmerName: string;
  cropType: string;
  availableVolumeQuintals: number;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  kebeleLocation: string;
  pickupWindow: string;
}

export interface PooledDispatchManifest {
  dispatchId: string;
  orderTargetQuintals: number;
  totalPooledQuintals: number;
  truckType: string;
  truckCapacityQuintals: number;
  truckCapacityUtilizationPercent: number; // e.g. 88.5%
  traditionalEmptyCostPercent: number;    // e.g. 45%
  farmerFreightSavingsETB: number;
  escrowFreightVaultETB: number;
  stops: {
    stopNumber: number;
    farmerName: string;
    kebeleLocation: string;
    volumeToLoadQuintals: number;
    distanceMeters: number;
    etaMinutes: number;
    farmerPayoutETB: number;
  }[];
  destinationDepot: {
    name: string;
    city: string;
    distanceTotalKm: number;
    otpReleaseCode: string;
  };
}

export const SIMULATED_EAST_SHEWA_LISTINGS: FarmListingSpatial[] = [
  {
    id: 'lst-meki-01',
    farmerId: 'usr-farmer-bekele',
    farmerName: 'Bekele Tadesse',
    cropType: 'tomato',
    availableVolumeQuintals: 14.5,
    latitude: 8.154,
    longitude: 38.822,
    distanceMeters: 450,
    kebeleLocation: 'Meki 02 Core Packhouse',
    pickupWindow: '06:00 - 08:30 AM',
  },
  {
    id: 'lst-meki-02',
    farmerId: 'usr-farmer-fatuma',
    farmerName: 'Fatuma Aliyi',
    cropType: 'tomato',
    availableVolumeQuintals: 12.0,
    latitude: 8.162,
    longitude: 38.835,
    distanceMeters: 1850,
    kebeleLocation: 'Meki 04 Canal Zone',
    pickupWindow: '07:00 - 09:00 AM',
  },
  {
    id: 'lst-dugda-03',
    farmerId: 'usr-farmer-tsegaye',
    farmerName: 'Tsegaye Hailu',
    cropType: 'tomato',
    availableVolumeQuintals: 8.5,
    latitude: 8.138,
    longitude: 38.809,
    distanceMeters: 2400,
    kebeleLocation: 'Dugda Shaki Highfield',
    pickupWindow: '08:00 - 10:00 AM',
  },
  {
    id: 'lst-dugda-04',
    farmerId: 'usr-farmer-lema',
    farmerName: 'Lema Regassa',
    cropType: 'tomato',
    availableVolumeQuintals: 6.0,
    latitude: 8.125,
    longitude: 38.798,
    distanceMeters: 3800,
    kebeleLocation: 'Dugda Alem Tena Link',
    pickupWindow: '09:00 - 10:30 AM',
  },
  {
    id: 'lst-batu-05',
    farmerId: 'usr-farmer-abera',
    farmerName: 'Abera Worku',
    cropType: 'tomato',
    availableVolumeQuintals: 10.0,
    latitude: 7.935,
    longitude: 38.718,
    distanceMeters: 26000, // Outside 10km radius
    kebeleLocation: 'Batu / Ziway South Lake Hub',
    pickupWindow: '11:00 - 12:30 PM',
  },
];

/**
 * PostGIS Spatial Query Simulation:
 * SELECT id, farmer_id, crop_type, available_volume_quintals, 
 *        ST_Distance(location_geom, ST_MakePoint(38.82, 8.15)::geography) AS distance_meters
 * FROM inventory_listings
 * WHERE crop_type = 'tomato' 
 *   AND status = 'ACTIVE'
 *   AND ST_DWithin(location_geom, ST_MakePoint(38.82, 8.15)::geography, 10000)
 * ORDER BY distance_meters ASC;
 */
export function runPostGISSpatialClustering(
  targetVolumeQuintals: number = 40.0,
  maxRadiusMeters: number = 10000
): {
  matchedFarms: FarmListingSpatial[];
  manifest: PooledDispatchManifest;
  sqlQuery: string;
} {
  // Filter farms within radius (10km) and sort by distance
  const eligibleFarms = SIMULATED_EAST_SHEWA_LISTINGS
    .filter((farm) => farm.distanceMeters <= maxRadiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  let accumulatedVolume = 0;
  const stops: PooledDispatchManifest['stops'] = [];

  for (let i = 0; i < eligibleFarms.length && accumulatedVolume < targetVolumeQuintals; i++) {
    const farm = eligibleFarms[i];
    const volumeNeeded = targetVolumeQuintals - accumulatedVolume;
    const volumeLoaded = Math.min(farm.availableVolumeQuintals, volumeNeeded);
    
    accumulatedVolume += volumeLoaded;
    stops.push({
      stopNumber: i + 1,
      farmerName: farm.farmerName,
      kebeleLocation: farm.kebeleLocation,
      volumeToLoadQuintals: volumeLoaded,
      distanceMeters: farm.distanceMeters,
      etaMinutes: 15 + i * 25,
      farmerPayoutETB: Math.round(volumeLoaded * 5150),
    });
  }

  const truckCapacityQuintals = 45.0; // Isuzu FSR 4.5 MT
  const utilization = Math.min(100, Math.round((accumulatedVolume / truckCapacityQuintals) * 100 * 10) / 10);
  const baselineTransportCostETB = 18500; // Unpooled separate individual trips
  const pooledTransportCostETB = 9200;    // Bundled single trip
  const savings = baselineTransportCostETB - pooledTransportCostETB;

  const manifest: PooledDispatchManifest = {
    dispatchId: 'DSP-EK-992014',
    orderTargetQuintals: targetVolumeQuintals,
    totalPooledQuintals: Number(accumulatedVolume.toFixed(1)),
    truckType: 'Isuzu FSR Turbo Reefer (5.0 Metric Tons / 50 Quintals)',
    truckCapacityQuintals,
    truckCapacityUtilizationPercent: utilization,
    traditionalEmptyCostPercent: 45,
    farmerFreightSavingsETB: savings,
    escrowFreightVaultETB: pooledTransportCostETB,
    stops,
    destinationDepot: {
      name: 'Addis Ababa Central Wholesale Terminal (Mercato / Lafto Depot)',
      city: 'Addis Ababa (via Adama Expressway)',
      distanceTotalKm: 138,
      otpReleaseCode: '782-901',
    },
  };

  const sqlQuery = `SELECT id, farmer_id, crop_type, available_volume_quintals, 
       ST_Distance(location_geom, ST_MakePoint(38.82, 8.15)::geography) AS distance_meters
FROM inventory_listings
WHERE crop_type = 'tomato' 
  AND status = 'ACTIVE'
  AND ST_DWithin(location_geom, ST_MakePoint(38.82, 8.15)::geography, ${maxRadiusMeters}) -- 10km radius
ORDER BY distance_meters ASC;`;

  return {
    matchedFarms: eligibleFarms,
    manifest,
    sqlQuery,
  };
}


// ============================================================================
// PITCH DECK KPIS & STRATEGIC COMPARISON MATRIX
// ============================================================================

export interface PitchDeckKpi {
  metric: string;
  businessAsUsual: string;
  agrilinkTarget: string;
  currentPlatformLive: string;
  improvementDelta: string;
  description: string;
  accentColor: string;
}

export const PITCH_DECK_KPIS: PitchDeckKpi[] = [
  {
    metric: 'Post-Harvest Loss',
    businessAsUsual: '30% – 40%',
    agrilinkTarget: 'Under 8% via automated salvage redirection',
    currentPlatformLive: '6.4% Recorded Loss',
    improvementDelta: '-81% Waste Cut',
    description: 'Dynamic shelf-life degradation pricing automatically drops decaying lots to Tier 2 kitchens, Tier 3 industrial purees, and Tier 4 compost.',
    accentColor: 'emerald',
  },
  {
    metric: 'Middleman Margin Extraction',
    businessAsUsual: '40% – 60% price cut taken by brokers (ደላላ)',
    agrilinkTarget: 'Under 10% flat platform transaction fee',
    currentPlatformLive: '4.5% Platform Fee',
    improvementDelta: '+78% Farmer Net',
    description: 'Disintermediates 3-tier opportunistic broker cartels through direct institutional escrow contracts and transparent market pricing.',
    accentColor: 'blue',
  },
  {
    metric: 'Payment Settlement Delay',
    businessAsUsual: '7 to 30 days on informal credit',
    agrilinkTarget: 'Instantaneous mobile payout upon escrow release',
    currentPlatformLive: '< 3.2 Seconds Payout',
    improvementDelta: '99.9% Faster Cashflow',
    description: 'Instant multi-rail settlement across Telebirr SuperApp, CBE Birr, Awash Pay, and Dashen Amole immediately upon buyer gate OTP sign-off.',
    accentColor: 'amber',
  },
  {
    metric: 'Transport Capacity Utilization',
    businessAsUsual: '40% – 55% (frequent empty return runs)',
    agrilinkTarget: 'Over 85% via spatial route pooling',
    currentPlatformLive: '88.2% Avg Load Factor',
    improvementDelta: '+72% Freight Margin',
    description: 'PostGIS ST_DWithin clustering pools nearby smallholders into consolidated 40-quintal truckloads, slashing freight overhead from 45% to 12%.',
    accentColor: 'purple',
  },
];
