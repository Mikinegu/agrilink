import React, { useState, useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExchangeRole,
  DistressedLot,
  calculateFinancialBreakdown,
  calculateSuitability,
  calculateVolumeAdjustedDiscount,
} from '../types/marketplace.ts';
import { Navigation } from './Navigation.tsx';
import { DistressedListingModal } from './DistressedListingModal.tsx';
import { NegotiationDrawer } from './NegotiationDrawer.tsx';
import { IndustrialBuyerFeed } from './IndustrialBuyerFeed.tsx';
import { LogisticsHub } from './LogisticsHub.tsx';
import { EscrowVault } from './EscrowVault.tsx';
import {
  Tractor,
  Building2,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';

// Error Boundary to prevent any blank white screen from unexpected data errors
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SalvageErrorBoundary extends (Component as any) {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SalvageExchange Recovered from Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 bg-zinc-900 border border-emerald-500/40 rounded-3xl shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Salvage Exchange Auto-Protected</h2>
            <p className="text-xs text-zinc-400">
              An unexpected data formatting issue occurred in the harvest lot feed. The session has been protected to ensure seamless continuity.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('agrilink_salvage_lots');
                  } catch {}
                  window.location.reload();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset & Reload Exchange
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Dismiss & Continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Baseline authentic seed lots for instant demonstration
export const INITIAL_SEED_LOTS: DistressedLot[] = [
  {
    id: 'lot-wonji-roma-01',
    lotNumber: 'SALV-882194',
    farmerId: 1,
    farmerName: 'Ato Bekele Tadesse',
    farmerOrg: 'Wonji Horizon Cooperative Farms',
    region: 'Oromia',
    locationDetails: 'Wonji Gefersa Packhouse Hub #3',
    commodity: 'Roma Processing Tomatoes',
    variety: 'Heinz 1015 Hybrid',
    category: 'VEGETABLE',
    lotWeightTons: 18.5,
    lotWeightKg: 18500,
    benchmarkPricePerKg: 85.0,
    totalBenchmarkValue: 1572500,
    farmerDiscountPercent: 40,
    discountedPricePerKg: 51.0,
    totalDiscountedValue: 943500,
    conditionSummary: '38% sunscald & skin splitting from abrupt weather changes. Interior pulp and lycopene perfectly preserved for paste and puree processing.',
    harvestDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString().split('T')[0],
    damageCauses: ['SUNSCALD', 'SKIN_SPLITTING'],
    defectPercentage: 38,
    brixRating: 5.8,
    acidityPh: 4.25,
    initialShelfLifeHours: 48,
    softRotOnsetHoursRemaining: 34,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    industrialSuitability: {
      recommendedProcesses: [
        'Commercial Tomato Paste (Cold-Break 28-30 °Bx)',
        'Heavy Puree & Pasta Sauces',
        'Standard Foodservice Ketchup Mash',
      ],
      matchScorePercent: 95,
      scientificAssessment:
        'High total soluble solids (5.8°Bx) and natural lycopene make this lot an exceptional yield substrate for industrial evaporation, paste, and ketchup cooking.',
    },
    status: 'BID_SUBMITTED',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    bids: [
      {
        id: 'bid-redgold-01',
        lotId: 'lot-wonji-roma-01',
        processorId: 'proc-redgold',
        processorName: 'Dr. Henok Haile',
        processorOrg: 'RedGold Foods & Puree Ltd.',
        proposedDiscountPercent: 45,
        offeredPricePerKg: 46.75,
        totalOfferAmount: 864875,
        factorySavings: 707625,
        proposedDeliveryDate: 'Immediate Reefer Dispatch',
        plantLocation: 'Dukem Industrial Park, Line #2',
        intendedProduct: 'Commercial Ketchup & Paste Mash',
        notes: 'Can accept full 18.5 MT lot immediately if delivered by 08:00 AM under 4°C refrigeration.',
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        status: 'SUBMITTED',
      },
    ],
    activeNegotiation: {
      id: 'neg-01',
      lotId: 'lot-wonji-roma-01',
      bidId: 'bid-redgold-01',
      initialDiscountPercent: 45,
      currentDiscountPercent: 45,
      unitPricePerKg: 46.75,
      grossAmountEtb: 864875,
      farmerIncrementalGain: 0,
      factorySavingsEtb: 707625,
      platformFeePercent: 2.5,
      platformFeeEtb: 21622,
      carrierEstimatedFeeEtb: 46250,
      netFarmerPayoutEtb: 843253,
      status: 'PENDING_FARMER_ACTION',
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      history: [
        {
          actor: 'Dr. Henok Haile',
          role: 'PROCESSOR',
          action: 'Initial Discount Bid Submitted',
          discountPercent: 45,
          amountEtb: 864875,
          timestamp: '4 hours ago',
          notes: '45% discount proposed for ketchup and paste processing.',
        },
      ],
    },
  },
  {
    id: 'lot-ziway-san-marzano-02',
    lotNumber: 'SALV-901428',
    farmerId: 2,
    farmerName: 'Almaz Desta',
    farmerOrg: 'Lakeside Ziway Producers Co-op',
    region: 'Oromia (Rift Valley)',
    locationDetails: 'Ziway Central Greenhouse Depot',
    commodity: 'San Marzano Processing Paste Tomatoes',
    variety: 'San Marzano Lampadina',
    category: 'VEGETABLE',
    lotWeightTons: 24.0,
    lotWeightKg: 24000,
    benchmarkPricePerKg: 90.0,
    totalBenchmarkValue: 2160000,
    farmerDiscountPercent: 30,
    discountedPricePerKg: 63.0,
    totalDiscountedValue: 1512000,
    conditionSummary: '25% hail marks and slight transit bruising. Superior Brix 6.2° Sugar, optimal for concentrated double-paste canning.',
    harvestDate: new Date(Date.now() - 6 * 3600 * 1000).toISOString().split('T')[0],
    damageCauses: ['HAIL_MARKS', 'TRANSIT_BRUISING'],
    defectPercentage: 25,
    brixRating: 6.2,
    acidityPh: 4.18,
    initialShelfLifeHours: 54,
    softRotOnsetHoursRemaining: 48,
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80',
    industrialSuitability: {
      recommendedProcesses: ['Concentrated 30-32°Bx Double Paste', 'Whole Peeled Canning', 'Export Pizza Sauce'],
      matchScorePercent: 98,
      scientificAssessment:
        'Superior pectin density, low moisture seed cavity, and 6.2°Bx make this ideal for high-solids industrial concentration.',
    },
    status: 'OPEN_FOR_BIDS',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    bids: [],
  },
  {
    id: 'lot-upper-awash-citrus-03',
    lotNumber: 'SALV-744102',
    farmerId: 3,
    farmerName: 'Worku Mengistu',
    farmerOrg: 'Upper Awash Agro-Industry Farms',
    region: 'Oromia / Afar Basin',
    locationDetails: 'Awash Valley Citrus Packhouse',
    commodity: 'Valencia Industrial Juice Oranges',
    variety: 'Valencia Late',
    category: 'FRUIT',
    lotWeightTons: 12.0,
    lotWeightKg: 12000,
    benchmarkPricePerKg: 65.0,
    totalBenchmarkValue: 780000,
    farmerDiscountPercent: 32,
    discountedPricePerKg: 44.2,
    totalDiscountedValue: 530400,
    conditionSummary: '30% superficial sunscald and irregular sizing. Deep juice sacs, zero internal rot, 11.2°Bx.',
    harvestDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    damageCauses: ['SUNSCALD', 'IRREGULAR_SIZING'],
    defectPercentage: 30,
    brixRating: 11.2,
    acidityPh: 3.4,
    initialShelfLifeHours: 96,
    softRotOnsetHoursRemaining: 72,
    imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
    industrialSuitability: {
      recommendedProcesses: ['Bulk Frozen Orange Juice Concentrate (FCOJ)', 'Pectin Recovery', 'Citrus Peel Oil'],
      matchScorePercent: 94,
      scientificAssessment:
        'Deep juice sacs and exceptional Brix-to-acid ratio (11.2°Bx) bypass fresh consumer grading for immediate industrial centrifugal extraction.',
    },
    status: 'LOCKED_IN_ESCROW',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    bids: [
      {
        id: 'bid-citrus-01',
        lotId: 'lot-upper-awash-citrus-03',
        processorId: 'proc-great-rift',
        processorName: 'Tadesse Bekele',
        processorOrg: 'Great Rift Juice Processors Ltd.',
        proposedDiscountPercent: 32,
        offeredPricePerKg: 44.2,
        totalOfferAmount: 530400,
        factorySavings: 249600,
        proposedDeliveryDate: 'Dispatched in Reefer',
        plantLocation: 'Mojo Dry Port Processing Terminal',
        intendedProduct: 'FCOJ Concentrated Juice Barrels',
        notes: 'Terms agreed at 32% discount. Cold-chain reefer en route.',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        status: 'ACCEPTED',
      },
    ],
    dispatchJob: {
      id: 'dispatch-reefer-77',
      lotId: 'lot-upper-awash-citrus-03',
      carrierId: 'carrier-swift',
      carrierName: 'Captain Yared Solomon',
      carrierOrg: 'SwiftReefer Cold-Chain Logistics',
      carrierPhone: '+251 91 345 6789',
      vehicleType: 'TEMPERATURE_CONTROLLED_REEFER',
      targetTempRange: '2°C to 4°C',
      currentTempCelsius: 3.1,
      currentHumidityPercent: 88,
      originLocation: 'Awash Valley Packhouse',
      destinationPlant: 'Mojo Dry Port Processing Terminal',
      totalDistanceKm: 115,
      transitMinutesRemaining: 45,
      transitStatus: 'IN_TRANSIT',
      bolNumber: 'eBOL-883921',
      driverName: 'Kenenisa Bekele',
      plateNumber: 'ET-3-88192-AA',
      waypoints: [
        { name: 'Awash Valley Depot (Origin)', lat: 8.98, lng: 40.15, passed: true, time: '06:30 AM' },
        { name: 'Metehara Highway Checkpoint', lat: 8.89, lng: 39.91, passed: true, time: '07:15 AM' },
        { name: 'Adama Expressway Junction', lat: 8.54, lng: 39.27, passed: true, time: '08:00 AM' },
        { name: 'Mojo Processing Bay #2 (Destination)', lat: 8.59, lng: 39.12, passed: false },
      ],
      telematicsStream: [
        { time: '07:00', temperatureCelsius: 3.4, humidityPercent: 89, batteryPercent: 98 },
        { time: '07:30', temperatureCelsius: 3.2, humidityPercent: 88, batteryPercent: 97 },
        { time: '08:00', temperatureCelsius: 3.1, humidityPercent: 88, batteryPercent: 96 },
      ],
    },
    escrowVault: {
      id: 'vault-citrus-77',
      lotId: 'lot-upper-awash-citrus-03',
      totalDepositedEtb: 560400,
      farmerAllocationEtb: 517140,
      carrierAllocationEtb: 30000,
      platformCommissionEtb: 13260,
      escrowStatus: 'FUNDS_LOCKED',
      depositTransactionRef: 'TX-CHAPA-AWASH-99214',
    },
  },
];

// Helper to normalize any incoming lot (from DB or localStorage) to canonical DistressedLot
export const normalizeLot = (raw: any): DistressedLot => {
  if (!raw || typeof raw !== 'object') {
    return INITIAL_SEED_LOTS[0];
  }

  const weightKg = Number(
    raw.lotWeightKg ?? raw.total_weight_kg ?? (Number(raw.lotWeightTons ?? raw.total_weight_tons ?? 1) * 1000)
  );
  const weightTons = Number(raw.lotWeightTons ?? raw.total_weight_tons ?? (weightKg / 1000));
  const benchmarkPrice = Number(raw.benchmarkPricePerKg ?? raw.benchmark_price_per_kg ?? 75);
  const totalBenchmark = Number(raw.totalBenchmarkValue ?? raw.total_benchmark_value ?? (weightKg * benchmarkPrice));
  const defectPct = Number(raw.defectPercentage ?? raw.defect_severity_pct ?? 25);
  const brix = Number(raw.brixRating ?? raw.brix_level ?? 5.5);
  const farmerDiscount = Number(
    raw.farmerDiscountPercent ?? raw.farmer_discount_percent ?? (defectPct > 30 ? 35 : 25)
  );
  const discountedPrice = Number(
    raw.discountedPricePerKg ??
      raw.discounted_price_per_kg ??
      Number((benchmarkPrice * (1 - farmerDiscount / 100)).toFixed(2))
  );
  const totalDiscountedVal = Number(
    raw.totalDiscountedValue ?? raw.total_discounted_value ?? Math.round(weightKg * discountedPrice)
  );

  let damageCauses: string[] = [];
  if (Array.isArray(raw.damageCauses)) {
    damageCauses = raw.damageCauses;
  } else if (Array.isArray(raw.damage_causes)) {
    damageCauses = raw.damage_causes;
  } else if (typeof raw.damage_causes === 'string') {
    try {
      const parsed = JSON.parse(raw.damage_causes);
      if (Array.isArray(parsed)) damageCauses = parsed;
    } catch {
      damageCauses = raw.damage_causes.split(',').map((s: string) => s.trim());
    }
  }
  if (damageCauses.length === 0) {
    damageCauses = ['COSMETIC_BLEMISHES', 'SURFACE_DEFECTS'];
  }

  const indSuit = raw.industrialSuitability || {};
  let recProcesses: string[] = [];
  if (Array.isArray(indSuit.recommendedProcesses)) {
    recProcesses = indSuit.recommendedProcesses;
  } else if (Array.isArray(raw.recommended_processes)) {
    recProcesses = raw.recommended_processes;
  } else if (typeof raw.recommended_processes === 'string') {
    try {
      recProcesses = JSON.parse(raw.recommended_processes);
    } catch {
      recProcesses = [raw.recommended_processes];
    }
  }
  if (!Array.isArray(recProcesses) || recProcesses.length === 0) {
    recProcesses = ['Industrial Puree & Sauce Mash', 'High-Solids Evaporation', 'Bio-Extracts & Juicing'];
  }

  const suitability = {
    recommendedProcesses: recProcesses,
    matchScorePercent: Number(indSuit.matchScorePercent ?? raw.match_score_pct ?? 92),
    scientificAssessment:
      indSuit.scientificAssessment ??
      raw.scientific_assessment ??
      'Suitable for industrial food processing, puree extraction, and canning concentration.',
  };

  const bids = Array.isArray(raw.bids)
    ? raw.bids.map((b: any) => ({
        id: String(b.id || `bid-${Math.random()}`),
        lotId: String(b.lotId || raw.id),
        processorId: String(b.processorId || 'proc-default'),
        processorName: String(b.processorName || 'Industrial Processor'),
        processorOrg: String(b.processorOrg || 'Food Processing Enterprise'),
        proposedDiscountPercent: Number(b.proposedDiscountPercent ?? 30),
        offeredPricePerKg: Number(b.offeredPricePerKg ?? discountedPrice),
        totalOfferAmount: Number(b.totalOfferAmount ?? totalDiscountedVal),
        factorySavings: Number(b.factorySavings ?? 0),
        proposedDeliveryDate: String(b.proposedDeliveryDate || 'Immediate Dispatch'),
        plantLocation: String(b.plantLocation || 'Industrial Park'),
        intendedProduct: String(b.intendedProduct || 'Puree Mash'),
        notes: String(b.notes || ''),
        createdAt: String(b.createdAt || new Date().toISOString()),
        status: b.status || 'SUBMITTED',
      }))
    : [];

  return {
    id: String(raw.id || `lot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`),
    lotNumber: String(raw.lotNumber ?? raw.lot_number ?? `SALV-${Math.floor(100000 + Math.random() * 900000)}`),
    farmerId: Number(raw.farmerId ?? raw.farmer_id ?? 1),
    farmerName: String(raw.farmerName ?? raw.farmer_name ?? 'Local Co-op Member'),
    farmerOrg: String(raw.farmerOrg ?? raw.farmer_org ?? 'Wonji Horizon Cooperative Farms'),
    region: String(raw.region ?? 'Oromia'),
    locationDetails: String(raw.locationDetails ?? raw.location_details ?? 'Central Collection Hub'),
    commodity: String(raw.commodity ?? raw.commodity_name ?? 'Fresh Produce'),
    variety: String(raw.variety ?? 'Standard Commercial Grade'),
    category: (raw.category as any) || 'VEGETABLE',
    lotWeightTons: weightTons,
    lotWeightKg: weightKg,
    benchmarkPricePerKg: benchmarkPrice,
    totalBenchmarkValue: totalBenchmark,
    farmerDiscountPercent: farmerDiscount,
    discountedPricePerKg: discountedPrice,
    totalDiscountedValue: totalDiscountedVal,
    conditionSummary:
      raw.conditionSummary ||
      raw.condition_summary ||
      `${defectPct}% surface blemish; internal pulp & sugar concentration 100% intact for processing.`,
    harvestDate: String(raw.harvestDate ?? raw.harvest_date ?? new Date().toISOString().split('T')[0]),
    damageCauses: damageCauses as any,
    defectPercentage: defectPct,
    brixRating: brix,
    acidityPh: Number(raw.acidityPh ?? raw.acidity_ph ?? 4.2),
    initialShelfLifeHours: Number(raw.initialShelfLifeHours ?? raw.shelf_life_hours ?? 48),
    softRotOnsetHoursRemaining: Number(raw.softRotOnsetHoursRemaining ?? raw.soft_rot_hours_remaining ?? 36),
    imageUrl: String(
      raw.imageUrl ?? raw.image_url ?? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
    ),
    industrialSuitability: suitability,
    status: (raw.status as any) || 'OPEN_FOR_BIDS',
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    bids,
    activeNegotiation: raw.activeNegotiation || undefined,
    dispatchJob: raw.dispatchJob || undefined,
    escrowVault: raw.escrowVault || undefined,
  };
};

export const SalvageExchange: React.FC = () => {
  const navigate = useNavigate();
  // Global Persona & View State
  const [currentRole, setCurrentRole] = useState<ExchangeRole>('FARMER');
  const [activeTab, setActiveTab] = useState<'inventory' | 'sourcing' | 'logistics' | 'escrow'>('inventory');

  // Master Lots State - Always sanitized through normalizeLot
  const [lots, setLots] = useState<DistressedLot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agrilink_salvage_lots');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeLot);
          }
        } catch {}
      }
    }
    return INITIAL_SEED_LOTS.map(normalizeLot);
  });

  // Modal & Drawer State
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [negotiatingLot, setNegotiatingLot] = useState<DistressedLot | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Synchronize with backend API if available, or fallback to localStorage
  useEffect(() => {
    const fetchApiLots = async () => {
      try {
        const res = await fetch('/api/salvage/lots');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLots(data.map(normalizeLot));
            return;
          }
        }
      } catch (err) {
        console.warn('Backend salvage lots fetch error, localized cache active', err);
      }
    };
    fetchApiLots();
  }, []);

  const persistLots = (newLots: DistressedLot[]) => {
    setLots(newLots);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('agrilink_salvage_lots', JSON.stringify(newLots));
      } catch {}
    }
  };

  // ── Handler 1: Farmer Logs New Distressed Lot ───────────────────────────────
  const handleCreateLot = (
    lotData: Omit<DistressedLot, 'id' | 'createdAt' | 'bids' | 'status'>
  ) => {
    const newLot: DistressedLot = {
      ...lotData,
      id: `lot-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'OPEN_FOR_BIDS',
      bids: [],
    };

    const updated = [newLot, ...lots];
    persistLots(updated);

    // Sync with backend API
    fetch('/api/salvage/lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLot),
    }).catch(() => {});
  };

  // ── Handler 1b: 1-Click Buy Now with Fair Bulk Volume Discount ─────────────
  const handleInstantBuyAtFarmerDiscount = (
    lot: DistressedLot,
    purchaseVolumeKg?: number,
    customDiscount?: number
  ) => {
    const totalLotTons = lot.lotWeightTons || Number((lot.lotWeightKg / 1000).toFixed(1));
    const actualWeightKg = purchaseVolumeKg || lot.lotWeightKg;
    const actualTons = Number((actualWeightKg / 1000).toFixed(1));
    const baseDiscount = lot.farmerDiscountPercent || 30;

    const { effectiveDiscount: volAdjustedDiscount, volumeBonusPercent } = calculateVolumeAdjustedDiscount(
      baseDiscount,
      actualTons,
      totalLotTons
    );

    const agreedDiscount = customDiscount ?? volAdjustedDiscount;
    const calc = calculateFinancialBreakdown(
      actualWeightKg,
      lot.benchmarkPricePerKg,
      agreedDiscount,
      agreedDiscount
    );

    const instantBid = {
      id: `bid-instant-${Date.now()}`,
      lotId: lot.id,
      processorId: 'proc-redgold',
      processorName: 'Dr. Henok Haile',
      processorOrg: 'RedGold Foods & Puree Ltd.',
      proposedDiscountPercent: agreedDiscount,
      offeredPricePerKg: calc.pricePerKg,
      totalOfferAmount: calc.grossTotalEtb,
      factorySavings: calc.factorySavingsEtb,
      proposedDeliveryDate: 'Immediate Reefer Dispatch',
      plantLocation: 'Dukem Industrial Park, Line #2',
      intendedProduct: lot.industrialSuitability?.recommendedProcesses?.[0] || 'Commercial Ketchup & Puree Mash',
      notes: `Instant volume purchase (${actualTons} MT) executed at ${agreedDiscount}% salvage discount (${
        volumeBonusPercent > 0 ? `+${volumeBonusPercent}% Fair Bulk Volume Bonus applied` : 'Standard Ask'
      }). Reefer dispatched immediately.`,
      createdAt: new Date().toISOString(),
      status: 'ACCEPTED' as const,
    };

    const escrowVault = {
      id: `vault-${Date.now()}`,
      lotId: lot.id,
      totalDepositedEtb: calc.grossTotalEtb + calc.carrierEstimatedFeeEtb,
      farmerAllocationEtb: calc.netFarmerPayoutEtb,
      carrierAllocationEtb: calc.carrierEstimatedFeeEtb,
      platformCommissionEtb: calc.platformFeeEtb,
      escrowStatus: 'FUNDS_LOCKED' as const,
      depositTransactionRef: `TX-INSTANT-${Date.now().toString().slice(-6)}`,
    };

    const dispatchJob = {
      id: `dispatch-${Date.now()}`,
      lotId: lot.id,
      carrierId: 'carrier-swift',
      carrierName: 'Captain Yared Solomon',
      carrierOrg: 'SwiftReefer Cold-Chain Logistics',
      carrierPhone: '+251 91 345 6789',
      vehicleType: 'TEMPERATURE_CONTROLLED_REEFER' as const,
      targetTempRange: '0°C to 4°C',
      currentTempCelsius: 2.3,
      currentHumidityPercent: 88,
      originLocation: lot.locationDetails,
      destinationPlant: 'RedGold Food Processing Plant, Dukem',
      totalDistanceKm: 78,
      transitMinutesRemaining: 80,
      transitStatus: 'DISPATCHED' as const,
      bolNumber: `eBOL-${Date.now().toString().slice(-6)}`,
      driverName: 'Solomon Kebede',
      plateNumber: 'ET-3-44102-AA',
      waypoints: [
        { name: `${lot.locationDetails} (Origin Packhouse)`, lat: 8.52, lng: 39.29, passed: true, time: 'Just now' },
        { name: 'Adama Expressway Toll Gate', lat: 8.56, lng: 39.25, passed: false },
        { name: 'Modjo Interchange Weigh Station', lat: 8.61, lng: 39.12, passed: false },
        { name: 'Dukem Receiving Dock #4 (Destination)', lat: 8.80, lng: 38.89, passed: false },
      ],
      telematicsStream: [
        { time: 'Now', temperatureCelsius: 2.3, humidityPercent: 88, batteryPercent: 99 },
      ],
    };

    const updated = lots.map((l) => {
      if (l.id !== lot.id) return l;
      return {
        ...l,
        lotWeightKg: actualWeightKg,
        lotWeightTons: actualTons,
        status: 'LOCKED_IN_ESCROW' as const,
        escrowVault,
        dispatchJob,
        bids: [instantBid, ...(l.bids || [])],
        activeNegotiation: {
          id: `neg-instant-${Date.now()}`,
          lotId: l.id,
          bidId: instantBid.id,
          initialDiscountPercent: agreedDiscount,
          currentDiscountPercent: agreedDiscount,
          unitPricePerKg: calc.pricePerKg,
          grossAmountEtb: calc.grossTotalEtb,
          farmerIncrementalGain: 0,
          factorySavingsEtb: calc.factorySavingsEtb,
          platformFeePercent: 2.5,
          platformFeeEtb: calc.platformFeeEtb,
          carrierEstimatedFeeEtb: calc.carrierEstimatedFeeEtb,
          netFarmerPayoutEtb: calc.netFarmerPayoutEtb,
          status: 'ACCEPTED' as const,
          updatedAt: new Date().toISOString(),
          history: [
            {
              actor: 'Dr. Henok Haile (RedGold Foods)',
              role: 'PROCESSOR' as const,
              action: `1-Click Instant Buy of ${actualTons} MT at ${agreedDiscount}% Discount`,
              discountPercent: agreedDiscount,
              amountEtb: calc.grossTotalEtb,
              timestamp: 'Just now',
              notes: `Direct purchase completed with volume adjustment. Escrow locked and refrigerated reefer dispatched to farm packhouse.`,
            },
          ],
        },
      };
    });

    persistLots(updated);

    // Sync with backend API
    fetch(`/api/salvage/lots/${lot.id}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ACCEPT', agreedDiscount, purchaseVolumeKg: actualWeightKg }),
    }).catch(() => {});

    // Flash notification and automatically open the live cold-chain tracking tab
    setActionNotice(
      `🎉 Successfully bought ${actualTons} MT of Lot #${lot.lotNumber} at ${agreedDiscount}% discount! Reefer dispatched & ${calc.grossTotalEtb.toLocaleString()} ETB locked in Escrow.`
    );
    setTimeout(() => {
      setActiveTab('logistics');
    }, 1500);
  };

  // ── Handler 2: Industrial Processor Submits Discount Bid ───────────────────
  const handleSubmitBid = (
    lotId: string,
    proposedDiscountPercent: number,
    intendedProduct: string,
    notes: string,
    purchaseVolumeKg?: number
  ) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId) return lot;

      const actualWeightKg = purchaseVolumeKg || lot.lotWeightKg;
      const actualTons = Number((actualWeightKg / 1000).toFixed(1));

      const calc = calculateFinancialBreakdown(
        actualWeightKg,
        lot.benchmarkPricePerKg,
        proposedDiscountPercent,
        proposedDiscountPercent
      );

      const newBid = {
        id: `bid-${Date.now()}`,
        lotId: lot.id,
        processorId: 'proc-redgold',
        processorName: 'Dr. Henok Haile',
        processorOrg: 'RedGold Foods & Puree Ltd.',
        proposedDiscountPercent,
        offeredPricePerKg: calc.pricePerKg,
        totalOfferAmount: calc.grossTotalEtb,
        factorySavings: calc.factorySavingsEtb,
        proposedDeliveryDate: 'Reefer Dispatch within 24 Hours',
        plantLocation: 'Dukem Industrial Park',
        intendedProduct,
        notes: notes ? `${notes} (Target Volume: ${actualTons} MT)` : `Target Volume: ${actualTons} MT`,
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED' as const,
      };

      const newNegotiation = {
        id: `neg-${Date.now()}`,
        lotId: lot.id,
        bidId: newBid.id,
        initialDiscountPercent: proposedDiscountPercent,
        currentDiscountPercent: proposedDiscountPercent,
        unitPricePerKg: calc.pricePerKg,
        grossAmountEtb: calc.grossTotalEtb,
        farmerIncrementalGain: 0,
        factorySavingsEtb: calc.factorySavingsEtb,
        platformFeePercent: 2.5,
        platformFeeEtb: calc.platformFeeEtb,
        carrierEstimatedFeeEtb: calc.carrierEstimatedFeeEtb,
        netFarmerPayoutEtb: calc.netFarmerPayoutEtb,
        status: 'PENDING_FARMER_ACTION' as const,
        updatedAt: new Date().toISOString(),
        history: [
          {
            actor: 'Dr. Henok Haile',
            role: 'PROCESSOR' as const,
            action: `Offered ${proposedDiscountPercent}% discount for ${intendedProduct} (${actualTons} MT)`,
            discountPercent: proposedDiscountPercent,
            amountEtb: calc.grossTotalEtb,
            timestamp: 'Just now',
            notes,
          },
        ],
      };

      return {
        ...lot,
        lotWeightKg: actualWeightKg,
        lotWeightTons: actualTons,
        status: 'BID_SUBMITTED' as const,
        bids: [newBid, ...lot.bids],
        activeNegotiation: newNegotiation,
      };
    });

    persistLots(updated);

    // Sync with backend API
    fetch(`/api/salvage/lots/${lotId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedDiscountPercent, intendedProduct, notes, purchaseVolumeKg }),
    }).catch(() => {});
  };

  // ── Handler 3: Farmer Submits Counter-Offer ────────────────────────────────
  const handleCounterOffer = (
    lotId: string,
    bidId: string,
    counterDiscount: number,
    notes?: string,
    purchaseVolumeKg?: number
  ) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId || !lot.activeNegotiation) return lot;

      const actualWeightKg = purchaseVolumeKg || lot.lotWeightKg;
      const actualTons = Number((actualWeightKg / 1000).toFixed(1));

      const calc = calculateFinancialBreakdown(
        actualWeightKg,
        lot.benchmarkPricePerKg,
        counterDiscount,
        lot.activeNegotiation.initialDiscountPercent
      );

      const historyEntry = {
        actor: 'Ato Bekele Tadesse',
        role: 'FARMER' as const,
        action: `Countered with discount of ${counterDiscount}% for ${actualTons} MT`,
        discountPercent: counterDiscount,
        amountEtb: calc.grossTotalEtb,
        timestamp: 'Just now',
        notes,
      };

      const updatedNeg = {
        ...lot.activeNegotiation,
        counterDiscountPercent: counterDiscount,
        currentDiscountPercent: counterDiscount,
        unitPricePerKg: calc.pricePerKg,
        grossAmountEtb: calc.grossTotalEtb,
        farmerIncrementalGain: calc.farmerIncrementalGain,
        factorySavingsEtb: calc.factorySavingsEtb,
        platformFeeEtb: calc.platformFeeEtb,
        netFarmerPayoutEtb: calc.netFarmerPayoutEtb,
        status: 'PENDING_PROCESSOR_REVIEW' as const,
        updatedAt: new Date().toISOString(),
        history: [historyEntry, ...lot.activeNegotiation.history],
      };

      return {
        ...lot,
        lotWeightKg: actualWeightKg,
        lotWeightTons: actualTons,
        status: 'COUNTER_OFFER_PENDING' as const,
        activeNegotiation: updatedNeg,
      };
    });

    persistLots(updated);

    // Sync with backend API
    fetch(`/api/salvage/lots/${lotId}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'COUNTER', counterDiscount, notes, purchaseVolumeKg }),
    }).catch(() => {});
  };

  // ── Handler 4: Accept Terms (Locks Escrow & Auto-Dispatches Reefer) ──────────
  const handleAcceptTerms = (
    lotId: string,
    bidId: string,
    agreedDiscount: number,
    purchaseVolumeKg?: number
  ) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId) return lot;

      const actualWeightKg = purchaseVolumeKg || lot.lotWeightKg;
      const actualTons = Number((actualWeightKg / 1000).toFixed(1));

      const calc = calculateFinancialBreakdown(
        actualWeightKg,
        lot.benchmarkPricePerKg,
        agreedDiscount,
        agreedDiscount
      );

      // 1. Escrow Vault Record
      const escrowVault = {
        id: `vault-${Date.now()}`,
        lotId: lot.id,
        totalDepositedEtb: calc.grossTotalEtb + calc.carrierEstimatedFeeEtb,
        farmerAllocationEtb: calc.netFarmerPayoutEtb,
        carrierAllocationEtb: calc.carrierEstimatedFeeEtb,
        platformCommissionEtb: calc.platformFeeEtb,
        escrowStatus: 'FUNDS_LOCKED' as const,
        depositTransactionRef: `TX-ESCROW-${Date.now().toString().slice(-6)}`,
      };

      // 2. Cold-Chain Dispatch Job
      const dispatchJob = {
        id: `dispatch-${Date.now()}`,
        lotId: lot.id,
        carrierId: 'carrier-swift',
        carrierName: 'Captain Yared Solomon',
        carrierOrg: 'SwiftReefer Cold-Chain Logistics',
        carrierPhone: '+251 91 345 6789',
        vehicleType: 'TEMPERATURE_CONTROLLED_REEFER' as const,
        targetTempRange: '0°C to 4°C',
        currentTempCelsius: 2.2,
        currentHumidityPercent: 88,
        originLocation: lot.locationDetails,
        destinationPlant: 'RedGold Food Processing Plant, Dukem',
        totalDistanceKm: 78,
        transitMinutesRemaining: 85,
        transitStatus: 'DISPATCHED' as const,
        bolNumber: `eBOL-${Date.now().toString().slice(-6)}`,
        driverName: 'Solomon Kebede',
        plateNumber: 'ET-3-44102-AA',
        waypoints: [
          { name: `${lot.locationDetails} (Origin Packhouse)`, lat: 8.52, lng: 39.29, passed: false },
          { name: 'Adama Expressway Toll Gate', lat: 8.56, lng: 39.25, passed: false },
          { name: 'Modjo Interchange Weigh Station', lat: 8.61, lng: 39.12, passed: false },
          { name: 'Dukem Receiving Dock #4 (Destination)', lat: 8.80, lng: 38.89, passed: false },
        ],
        telematicsStream: [
          { time: 'Now', temperatureCelsius: 2.2, humidityPercent: 88, batteryPercent: 99 },
        ],
      };

      return {
        ...lot,
        lotWeightKg: actualWeightKg,
        lotWeightTons: actualTons,
        status: 'LOCKED_IN_ESCROW' as const,
        escrowVault,
        dispatchJob,
        bids: lot.bids.map((b) =>
          b.id === bidId ? { ...b, status: 'ACCEPTED' as const } : b
        ),
      };
    });

    persistLots(updated);

    // Sync with backend API
    fetch(`/api/salvage/lots/${lotId}/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ACCEPT', agreedDiscount, purchaseVolumeKg }),
    }).catch(() => {});
  };

  // ── Handler 5: Reject Offer ────────────────────────────────────────────────
  const handleRejectOffer = (lotId: string, bidId: string) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId) return lot;
      return {
        ...lot,
        status: 'OPEN_FOR_BIDS' as const,
        bids: lot.bids.map((b) =>
          b.id === bidId ? { ...b, status: 'REJECTED' as const } : b
        ),
        activeNegotiation: undefined,
      };
    });
    persistLots(updated);
  };

  // ── Handler 6: Carrier Advances Transit Telematics ──────────────────────────
  const handleAdvanceTransit = (
    lotId: string,
    nextStatus: 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_AT_GATE'
  ) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId || !lot.dispatchJob) return lot;

      const updatedWaypoints = lot.dispatchJob.waypoints.map((wp, idx) => {
        if (nextStatus === 'LOADING') return { ...wp, passed: idx === 0 };
        if (nextStatus === 'IN_TRANSIT') return { ...wp, passed: idx <= 2 };
        if (nextStatus === 'ARRIVED_AT_GATE') return { ...wp, passed: true };
        return wp;
      });

      const updatedJob = {
        ...lot.dispatchJob,
        transitStatus: nextStatus,
        transitMinutesRemaining: nextStatus === 'ARRIVED_AT_GATE' ? 0 : nextStatus === 'IN_TRANSIT' ? 30 : 65,
        waypoints: updatedWaypoints,
      };

      return {
        ...lot,
        status: nextStatus === 'ARRIVED_AT_GATE' ? ('ARRIVED_AT_GATE' as const) : ('IN_TRANSIT' as const),
        dispatchJob: updatedJob,
      };
    });

    persistLots(updated);
  };

  // ── Handler 7: Factory Gate QA & One-Click Escrow Release ───────────────────
  const handleConfirmGateQaAndRelease = (
    lotId: string,
    qaData: {
      inspectorName: string;
      verifiedBrix: number;
      verifiedDefectRate: number;
      comments: string;
    }
  ) => {
    const updated = lots.map((lot) => {
      if (lot.id !== lotId || !lot.escrowVault) return lot;

      const updatedVault = {
        ...lot.escrowVault,
        escrowStatus: 'DISBURSED' as const,
        disbursedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        gateQa: {
          inspectorName: qaData.inspectorName,
          inspectorRole: 'Lead Chemist / QA Gate Inspector',
          verifiedBrix: qaData.verifiedBrix,
          verifiedDefectRate: qaData.verifiedDefectRate,
          pulpIntegrityPassed: true,
          foreignMatterPassed: true,
          overallPassed: true,
          inspectionNotes: qaData.comments,
          inspectedAt: new Date().toLocaleString(),
        },
      };

      return {
        ...lot,
        status: 'SETTLED' as const,
        escrowVault: updatedVault,
      };
    });

    persistLots(updated);

    // Sync with backend API
    fetch(`/api/salvage/lots/${lotId}/gate-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qaData),
    }).catch(() => {});
  };

  const handleResetData = () => {
    persistLots(INITIAL_SEED_LOTS);
  };

  return (
    <SalvageErrorBoundary>
      <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans">
        {/* Multi-Role Header Navigation */}
        <Navigation
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenListingModal={() => setListingModalOpen(true)}
          lots={lots}
          onResetData={handleResetData}
        />

        {/* Action Notice Banner for Instant Purchases & Dispatches */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white px-4 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
                <span>{actionNotice}</span>
              </div>
              <button
                onClick={() => setActionNotice(null)}
                className="text-white hover:text-emerald-200 text-xs font-bold underline cursor-pointer ml-3 shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab 1: Distressed Harvest Desk (Farmer Perspective) */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-950 flex items-center gap-2">
                    <Tractor className="h-6 w-6 text-emerald-600" />
                    Wonji Cooperative Distressed Harvest Desk
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Manage hail-marked, split-skin, or sunscalded crops. Offer salvage discounts directly to food processors and trigger automated cold-chain dispatch.
                  </p>
                </div>

                <button
                  onClick={() => setListingModalOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-950/20 cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Report Distressed Harvest</span>
                </button>
              </div>

              {/* Dynamic Degradation Math Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 text-white border border-emerald-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">Dynamic Degradation Pricing Function Active</span>
                      <span className="font-mono text-2xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">P(t) = P_min + (P_base − P_min) · e^(−λ·t·θ)</span>
                    </div>
                    <p className="text-2xs sm:text-xs text-zinc-400 mt-0.5">
                      Real-time valuation adjusted per ambient thermal exposure (θ = T/20°C) across 4 automated tiers (Fresh Direct, Markdown, Industrial Salvage, Bio-circular).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/innovation')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
                >
                  <span>Inspect Math & Tiers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Lot Ref</th>
                        <th className="py-3 px-4">Commodity & Brix</th>
                        <th className="py-3 px-4">Weight</th>
                        <th className="py-3 px-4">Defect Profile</th>
                        <th className="py-3 px-4">Offered Salvage Discount</th>
                        <th className="py-3 px-4">Remaining Shelf-Life</th>
                        <th className="py-3 px-4">Benchmark vs Salvage Price</th>
                        <th className="py-3 px-4">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {lots.map((lot) => (
                        <tr key={lot.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-black text-zinc-950">#{lot.lotNumber}</span>
                            <p className="text-[10px] text-zinc-400">{lot.variety || 'Commercial Grade'}</p>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-bold text-zinc-900">{lot.commodity}</p>
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {lot.brixRating}°Bx Sugar
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-black text-zinc-900">{lot.lotWeightTons} MT</p>
                            <p className="text-[10px] text-zinc-500">{(lot.lotWeightKg || 0).toLocaleString()} kg</p>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-rose-600 font-bold">{lot.defectPercentage}% Defect</span>
                            <p className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                              {(lot.damageCauses || []).join(', ')}
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                -{lot.farmerDiscountPercent || 30}% OFF
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700">
                                Salvage Ask
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 max-w-[150px]">
                              {lot.conditionSummary || 'Industrial processor rescue'}
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                (lot.softRotOnsetHoursRemaining ?? 36) <= 24
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              {lot.softRotOnsetHoursRemaining ?? 36}h remaining
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-black text-emerald-700 text-xs">
                                {(lot.discountedPricePerKg || (lot.benchmarkPricePerKg * 0.7)).toFixed(1)} ETB/kg
                              </span>
                              <span className="text-[10px] text-zinc-400 line-through">
                                {lot.benchmarkPricePerKg} ETB
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              Total: {(lot.totalDiscountedValue || (lot.totalBenchmarkValue * 0.7)).toLocaleString()} ETB
                            </p>
                          </td>

                          <td className="py-4 px-4">
                            {lot.status === 'LOCKED_IN_ESCROW' || lot.status === 'DISPATCHED' || lot.status === 'IN_TRANSIT' ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1 w-fit">
                                <CheckCircle2 className="h-3 w-3" />
                                Sold & Dispatched
                              </span>
                            ) : (lot.bids && lot.bids.length > 0) ? (
                              <button
                                onClick={() => setNegotiatingLot(lot)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Sliders className="h-3 w-3" />
                                <span>Review Bid ({lot.bids[0].proposedDiscountPercent}%)</span>
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500 text-[10px] font-bold">
                                Waiting for Buyers
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Industrial Processing Feed (Processor Perspective) */}
          {activeTab === 'sourcing' && (
            <IndustrialBuyerFeed
              lots={lots}
              activeRole={currentRole}
              onSubmitBid={handleSubmitBid}
              onOpenNegotiation={(lot) => setNegotiatingLot(lot)}
              onInstantBuyAtFarmerDiscount={handleInstantBuyAtFarmerDiscount}
              onAcceptCounter={(lotId, bidId) => {
                const lot = lots.find((l) => l.id === lotId);
                if (lot && lot.activeNegotiation?.counterDiscountPercent) {
                  handleAcceptTerms(lotId, bidId, lot.activeNegotiation.counterDiscountPercent);
                }
              }}
            />
          )}

          {/* Tab 3: Cold-Chain Fleet & Telematics (Carrier Perspective) */}
          {activeTab === 'logistics' && (
            <LogisticsHub
              lots={lots}
              activeRole={currentRole}
              onAdvanceTransitStatus={handleAdvanceTransit}
            />
          )}

          {/* Tab 4: Tri-Party Escrow Vault (Arbiter Perspective) */}
          {activeTab === 'escrow' && (
            <EscrowVault
              lots={lots}
              activeRole={currentRole}
              onConfirmGateQaAndRelease={handleConfirmGateQaAndRelease}
            />
          )}
        </main>

        {/* Distressed Harvest Intake Modal */}
        <DistressedListingModal
          isOpen={listingModalOpen}
          onClose={() => setListingModalOpen(false)}
          onSubmitLot={handleCreateLot}
        />

        {/* 3-Way Negotiation Review Drawer */}
        <NegotiationDrawer
          isOpen={!!negotiatingLot}
          onClose={() => setNegotiatingLot(null)}
          lot={negotiatingLot}
          activeRole={currentRole}
          onAcceptBid={(lotId, bidId, discount, volumeKg) => handleAcceptTerms(lotId, bidId, discount, volumeKg)}
          onRejectBid={(lotId, bidId) => handleRejectOffer(lotId, bidId)}
          onCounterOffer={(lotId, bidId, discount, notes, volumeKg) =>
            handleCounterOffer(lotId, bidId, discount, notes, volumeKg)
          }
        />
      </div>
    </SalvageErrorBoundary>
  );
};
