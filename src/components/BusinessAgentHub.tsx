import React, { useState, useMemo } from 'react';
import {
  Sprout,
  ShieldCheck,
  Zap,
  Boxes,
  Plus,
  Search,
  Filter,
  Check,
  Truck,
  Droplets,
  Calculator,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  Award,
  AlertTriangle,
  Sun,
  UserCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  X,
  Sparkles,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export interface SeedProduct {
  id: string;
  name: string;
  scientificName: string;
  cultivar: string;
  cropType: 'TEFF' | 'MAIZE' | 'WHEAT' | 'TOMATO' | 'ONION' | 'POTATO' | 'PULSE' | 'OTHER';
  brand: string;
  germinationRatePercent: number;
  purityPercent: number;
  moisturePercent: number;
  maturityDays: string;
  yieldPotentialQtPerHa: string;
  agroEcologicalZone: string;
  pricePerUnitEtb: number;
  unit: string;
  stockQuantity: number;
  moaCertNumber: string;
  imageUrl: string;
  description: string;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
}

export interface FarmSupply {
  id: string;
  name: string;
  category: 'FERTILIZER' | 'IRRIGATION' | 'MECHANIZATION' | 'PROTECTION';
  brand: string;
  composition: string;
  coverageArea: string;
  priceEtb: number;
  unit: string;
  stock: number;
  imageUrl: string;
  description: string;
  isMoaApproved: boolean;
}

export interface FarmerInputRequest {
  id: string;
  coopName: string;
  farmerLeader: string;
  region: string;
  phone: string;
  cropTarget: string;
  landAreaHectares: number;
  requestedItems: { itemName: string; quantity: number; unit: string; unitPriceEtb: number }[];
  estimatedTotalEtb: number;
  urgency: 'URGENT' | 'STANDARD' | 'PRE_SEASON';
  status: 'PENDING_AGENT_REVIEW' | 'APPROVED_DISPATCHED' | 'CREDIT_LOCKED' | 'DELIVERED';
  requestedAt: string;
}

// ── Initial Seed Cultivars Data ──────────────────────────────────────────────
const INITIAL_SEEDS: SeedProduct[] = [
  {
    id: 'seed-kuncho-01',
    name: 'DZ-Cr-387 Kuncho Certified Super-White Teff',
    scientificName: 'Eragrostis tef (Zucc.)',
    cultivar: 'Kuncho (DZ-Cr-387)',
    cropType: 'TEFF',
    brand: 'Ethiopian Seed Enterprise (ESE)',
    germinationRatePercent: 98.6,
    purityPercent: 99.4,
    moisturePercent: 10.2,
    maturityDays: '110–120 Days',
    yieldPotentialQtPerHa: '28–34 Qt/Ha',
    agroEcologicalZone: 'Mid-Altitude & Highland (1,800–2,600m)',
    pricePerUnitEtb: 4800,
    unit: '25kg Sealed Bag',
    stockQuantity: 420,
    moaCertNumber: 'ET-MOA-SEED-2026-9041',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'High-yield, export-standard white grain with superior lodging resistance and exceptional injera baking elasticity.',
    bulkDiscountThreshold: 40,
    bulkDiscountPercent: 12,
  },
  {
    id: 'seed-maize-02',
    name: 'BH-661 Hybrid Quality Protein Maize (QPM)',
    scientificName: 'Zea mays L.',
    cultivar: 'Bako Hybrid 661',
    cropType: 'MAIZE',
    brand: 'Bako National Maize Research',
    germinationRatePercent: 99.1,
    purityPercent: 99.7,
    moisturePercent: 9.8,
    maturityDays: '145–160 Days',
    yieldPotentialQtPerHa: '75–95 Qt/Ha',
    agroEcologicalZone: 'Sub-Humid & Mid-Altitude (1,600–2,200m)',
    pricePerUnitEtb: 5400,
    unit: '25kg Sealed Bag',
    stockQuantity: 280,
    moaCertNumber: 'ET-MOA-SEED-2026-8812',
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    description: 'High tryptophan and lysine amino acid profile, double-cobbing tendency with exceptional cob rot tolerance.',
    bulkDiscountThreshold: 30,
    bulkDiscountPercent: 10,
  },
  {
    id: 'seed-tomato-03',
    name: 'San Marzano & Roma VF Processing Tomato Seedlings',
    scientificName: 'Solanum lycopersicum',
    cultivar: 'San Marzano Lampadina',
    cropType: 'TOMATO',
    brand: 'Rift Valley Seeds Ltd.',
    germinationRatePercent: 97.9,
    purityPercent: 99.2,
    moisturePercent: 7.5,
    maturityDays: '85–95 Days',
    yieldPotentialQtPerHa: '45–60 MT/Ha',
    agroEcologicalZone: 'Irrigated Rift Valley & Awash Basin',
    pricePerUnitEtb: 2900,
    unit: '500g Hermetic Tin (15k Seeds)',
    stockQuantity: 190,
    moaCertNumber: 'ET-MOA-SEED-2026-7431',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'High Brix (6.0°Bx+) processing tomato with thick pericarp walls; ideal for paste concentration, ketchup, and whole canning.',
    bulkDiscountThreshold: 20,
    bulkDiscountPercent: 15,
  },
  {
    id: 'seed-onion-04',
    name: 'Bombay Red Certified Storage Onion Seeds',
    scientificName: 'Allium cepa L.',
    cultivar: 'Bombay Red Selection',
    cropType: 'ONION',
    brand: 'Melkassa ARC / AgriLink Seeds',
    germinationRatePercent: 98.2,
    purityPercent: 99.0,
    moisturePercent: 8.0,
    maturityDays: '110–130 Days',
    yieldPotentialQtPerHa: '35–45 MT/Ha',
    agroEcologicalZone: 'Lowland to Mid-Altitude (All zones)',
    pricePerUnitEtb: 3400,
    unit: '1kg Vacuum Pack',
    stockQuantity: 310,
    moaCertNumber: 'ET-MOA-SEED-2026-6620',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    description: 'Deep pungent red scales, dense dry matter, and up to 6 months storability without premature sprouting.',
    bulkDiscountThreshold: 25,
    bulkDiscountPercent: 10,
  },
  {
    id: 'seed-wheat-05',
    name: "Dande'a (ET-13-A2) Bread Wheat Certified Seed",
    scientificName: 'Triticum aestivum L.',
    cultivar: "Dande'a (Kalyansona line)",
    cropType: 'WHEAT',
    brand: 'Kulumsa Agricultural Research Center',
    germinationRatePercent: 98.4,
    purityPercent: 99.5,
    moisturePercent: 10.5,
    maturityDays: '125–135 Days',
    yieldPotentialQtPerHa: '55–65 Qt/Ha',
    agroEcologicalZone: 'Highland Arsi/Bale Wheat Belt (2,100–2,800m)',
    pricePerUnitEtb: 4200,
    unit: '50kg Jute Bag',
    stockQuantity: 500,
    moaCertNumber: 'ET-MOA-SEED-2026-5519',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Stem rust (Ug99) and yellow stripe rust immune; premium gluten strength for commercial industrial flour milling.',
    bulkDiscountThreshold: 50,
    bulkDiscountPercent: 8,
  },
  {
    id: 'seed-potato-06',
    name: 'G1 Certified Seed Potato Tubers (Gudene Variety)',
    scientificName: 'Solanum tuberosum',
    cultivar: 'Gudene (CIP-386423.13)',
    cropType: 'POTATO',
    brand: 'Holeta National Root Crops Center',
    germinationRatePercent: 99.5,
    purityPercent: 99.8,
    moisturePercent: 78.0,
    maturityDays: '100–115 Days',
    yieldPotentialQtPerHa: '32–38 MT/Ha',
    agroEcologicalZone: 'Highland Dega (2,200–3,000m)',
    pricePerUnitEtb: 3800,
    unit: '50kg Ventilated Crate',
    stockQuantity: 180,
    moaCertNumber: 'ET-MOA-SEED-2026-3391',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    description: 'Disease-indexed Generation-1 pre-basic tubers; immune to Phytophthora late blight with high specific gravity for crisps.',
    bulkDiscountThreshold: 40,
    bulkDiscountPercent: 12,
  },
];

// ── Initial Farm Supplies & Technology Data ─────────────────────────────────
const INITIAL_SUPPLIES: FarmSupply[] = [
  {
    id: 'supp-npsb-01',
    name: 'NPSB Balanced Granular Soil Fertility Formula',
    category: 'FERTILIZER',
    brand: 'EthioAgro Mineral Tech',
    composition: '19% N - 38% P₂O₅ - 7% S - 0.1% B + 1% Zn',
    coverageArea: '100kg per hectare baseline',
    priceEtb: 3950,
    unit: '50kg Moisture-Proof Bag',
    stock: 650,
    imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
    description: 'Custom formulated to address boron and sulfur deficiencies in acidic and neutral Ethiopian highland soils.',
    isMoaApproved: true,
  },
  {
    id: 'supp-urea-02',
    name: 'Agricultural Granular Urea (46% Nitrogen)',
    category: 'FERTILIZER',
    brand: 'Ethio-Fertilizer Imports',
    composition: '46% Total Nitrogen (Water-Soluble)',
    coverageArea: '100-150kg per hectare split-application',
    priceEtb: 4100,
    unit: '50kg Poly Bag',
    stock: 800,
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
    description: 'High-purity white prills for rapid vegetative push and tillering in teff, wheat, and commercial maize.',
    isMoaApproved: true,
  },
  {
    id: 'supp-drip-03',
    name: 'Solar-Powered Precision Drip Irrigation Kit (0.5 Hectare)',
    category: 'IRRIGATION',
    brand: 'SunAgri Solutions Ethiopia',
    composition: 'Pressure compensating drip lines, filters, solar pump & fittings',
    coverageArea: '0.5 Hectare (5,000 m²)',
    priceEtb: 89000,
    unit: 'Complete Turnkey Kit',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
    description: 'Low-pressure gravity & DC solar pump kit saving up to 70% irrigation water while boosting crop yields by 40%.',
    isMoaApproved: true,
  },
  {
    id: 'supp-sprayer-04',
    name: 'Lithium Battery Motorized Knapsack Sprayer (16L)',
    category: 'MECHANIZATION',
    brand: 'AgriMechanize Pro',
    composition: '12V 8Ah Lithium-Ion, dual-head brass nozzles, telescopic wand',
    coverageArea: 'Up to 3 Hectares per charge',
    priceEtb: 6800,
    unit: '16-Liter Unit',
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80',
    description: 'Constant 0.45 MPa pressure delivering ultra-fine micron mist for uniform bio-pesticide and foliar fertilizer application.',
    isMoaApproved: true,
  },
];

// ── Initial Farmer Input Requests ───────────────────────────────────────────
const INITIAL_REQUESTS: FarmerInputRequest[] = [
  {
    id: 'req-wonji-01',
    coopName: 'Wonji Horizon Producers Cooperative Union',
    farmerLeader: 'Ato Bekele Tadesse',
    region: 'Oromia (East Shewa)',
    phone: '+251 91 123 4567',
    cropTarget: 'Kuncho White Teff & Seedlings',
    landAreaHectares: 18.5,
    requestedItems: [
      { itemName: 'DZ-Cr-387 Kuncho Teff Seed', quantity: 40, unit: '25kg Bags', unitPriceEtb: 4800 },
      { itemName: 'NPSB Balanced Granular Fertilizer', quantity: 60, unit: '50kg Bags', unitPriceEtb: 3950 },
    ],
    estimatedTotalEtb: 429000,
    urgency: 'URGENT',
    status: 'PENDING_AGENT_REVIEW',
    requestedAt: '3 hours ago',
  },
  {
    id: 'req-ziway-02',
    coopName: 'Lakeside Ziway Greenhouse Producers Co-op',
    farmerLeader: 'Woizero Almaz Desta',
    region: 'Oromia (Rift Valley)',
    phone: '+251 92 234 5678',
    cropTarget: 'San Marzano Tomato & Solar Drip',
    landAreaHectares: 8.0,
    requestedItems: [
      { itemName: 'San Marzano & Roma VF Processing Seeds', quantity: 15, unit: '500g Tins', unitPriceEtb: 2900 },
      { itemName: 'Solar-Powered Drip Irrigation Kit', quantity: 2, unit: 'Kits', unitPriceEtb: 89000 },
    ],
    estimatedTotalEtb: 221500,
    urgency: 'STANDARD',
    status: 'APPROVED_DISPATCHED',
    requestedAt: '1 day ago',
  },
  {
    id: 'req-bale-03',
    coopName: 'Bale Robe High-Plateau Wheat Cooperative',
    farmerLeader: 'Ato Girma Wolde',
    region: 'Oromia (Bale Zone)',
    phone: '+251 93 345 6789',
    cropTarget: "Dande'a Bread Wheat",
    landAreaHectares: 25.0,
    requestedItems: [
      { itemName: "Dande'a (ET-13-A2) Bread Wheat Seed", quantity: 100, unit: '50kg Bags', unitPriceEtb: 4200 },
      { itemName: 'Agricultural Granular Urea (46% N)', quantity: 80, unit: '50kg Bags', unitPriceEtb: 4100 },
    ],
    estimatedTotalEtb: 748000,
    urgency: 'PRE_SEASON',
    status: 'PENDING_AGENT_REVIEW',
    requestedAt: 'Yesterday',
  },
];

interface BusinessAgentHubProps {
  initialTab?: 'seeds' | 'supplies' | 'orders' | 'calculator';
  onAddToCart?: (item: any, quantity: number) => void;
}

export const BusinessAgentHub: React.FC<BusinessAgentHubProps> = ({
  initialTab = 'seeds',
  onAddToCart,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'seeds' | 'supplies' | 'orders' | 'calculator'>(initialTab);

  // Inventories & State
  const [seeds, setSeeds] = useState<SeedProduct[]>(INITIAL_SEEDS);
  const [supplies, setSupplies] = useState<FarmSupply[]>(INITIAL_SUPPLIES);
  const [requests, setRequests] = useState<FarmerInputRequest[]>(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Seed Form Modal
  const [isAddSeedModalOpen, setIsAddSeedModalOpen] = useState(false);
  const [newSeedName, setNewSeedName] = useState('');
  const [newSeedCrop, setNewSeedCrop] = useState<'TEFF' | 'MAIZE' | 'WHEAT' | 'TOMATO' | 'ONION' | 'POTATO' | 'PULSE' | 'OTHER'>('TEFF');
  const [newSeedPrice, setNewSeedPrice] = useState(4500);
  const [newSeedStock, setNewSeedStock] = useState(100);
  const [newSeedGerm, setNewSeedGerm] = useState(98.5);

  // Farm Input Calculator State
  const [calcCrop, setCalcCrop] = useState<'TEFF' | 'MAIZE' | 'WHEAT' | 'TOMATO' | 'POTATO'>('TEFF');
  const [calcHectares, setCalcHectares] = useState<number>(2.0);
  const [calcIrrigation, setCalcIrrigation] = useState<'RAINFED' | 'DRIP'>('RAINFED');

  const flashNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filtered Seeds
  const filteredSeeds = useMemo(() => {
    return seeds.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.cultivar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCrop = selectedCropFilter === 'ALL' || s.cropType === selectedCropFilter;
      return matchesSearch && matchesCrop;
    });
  }, [seeds, searchQuery, selectedCropFilter]);

  // Farm Input Dosage Math
  const calculatedDosage = useMemo(() => {
    let seedKgPerHa = 30;
    let npsbKgPerHa = 100;
    let ureaKgPerHa = 100;
    let expectedYieldQtPerHa = 30;
    let harvestPricePerQtEtb = 8500;
    let seedCostPerKg = 192; // 4800 / 25

    if (calcCrop === 'TEFF') {
      seedKgPerHa = 25;
      npsbKgPerHa = 100;
      ureaKgPerHa = 80;
      expectedYieldQtPerHa = 28;
      harvestPricePerQtEtb = 8800;
      seedCostPerKg = 192;
    } else if (calcCrop === 'MAIZE') {
      seedKgPerHa = 25;
      npsbKgPerHa = 150;
      ureaKgPerHa = 150;
      expectedYieldQtPerHa = 80;
      harvestPricePerQtEtb = 3200;
      seedCostPerKg = 216;
    } else if (calcCrop === 'WHEAT') {
      seedKgPerHa = 125;
      npsbKgPerHa = 120;
      ureaKgPerHa = 100;
      expectedYieldQtPerHa = 58;
      harvestPricePerQtEtb = 5200;
      seedCostPerKg = 84;
    } else if (calcCrop === 'TOMATO') {
      seedKgPerHa = 1.0;
      npsbKgPerHa = 200;
      ureaKgPerHa = 150;
      expectedYieldQtPerHa = 500; // in quintals (50 MT)
      harvestPricePerQtEtb = 2800;
      seedCostPerKg = 5800;
    } else if (calcCrop === 'POTATO') {
      seedKgPerHa = 2000;
      npsbKgPerHa = 200;
      ureaKgPerHa = 120;
      expectedYieldQtPerHa = 340;
      harvestPricePerQtEtb = 3600;
      seedCostPerKg = 76;
    }

    const totalSeedKg = Math.round(seedKgPerHa * calcHectares);
    const totalNpsbKg = Math.round(npsbKgPerHa * calcHectares);
    const totalUreaKg = Math.round(ureaKgPerHa * calcHectares);
    const totalYieldQt = Math.round(expectedYieldQtPerHa * calcHectares);

    const seedCost = totalSeedKg * seedCostPerKg;
    const npsbCost = (totalNpsbKg / 50) * 3950;
    const ureaCost = (totalUreaKg / 50) * 4100;
    const dripCost = calcIrrigation === 'DRIP' ? (calcHectares / 0.5) * 89000 : 0;
    const totalInputCostEtb = Math.round(seedCost + npsbCost + ureaCost + dripCost);
    const grossHarvestValueEtb = Math.round(totalYieldQt * harvestPricePerQtEtb);
    const projectedNetGainEtb = grossHarvestValueEtb - totalInputCostEtb;
    const roiMultiplier = (grossHarvestValueEtb / Math.max(1, totalInputCostEtb)).toFixed(1);

    return {
      totalSeedKg,
      totalNpsbKg,
      totalUreaKg,
      totalYieldQt,
      totalInputCostEtb,
      grossHarvestValueEtb,
      projectedNetGainEtb,
      roiMultiplier,
    };
  }, [calcCrop, calcHectares, calcIrrigation]);

  // Handle Order Approval
  const handleApproveRequest = (reqId: string, dispatchNow = true) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        return {
          ...r,
          status: dispatchNow ? 'APPROVED_DISPATCHED' : 'CREDIT_LOCKED',
        };
      })
    );
    flashNotice(`Order #${reqId} approved! Truckload dispatch scheduled & escrow notification sent to cooperative.`);
  };

  // Handle Creating New Seed Variety
  const handleAddNewSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeedName) return;

    const created: SeedProduct = {
      id: `seed-custom-${Date.now()}`,
      name: newSeedName,
      scientificName: `${newSeedCrop.toLowerCase()} sp.`,
      cultivar: 'Commercial Certified Strain',
      cropType: newSeedCrop,
      brand: 'EthioAgro Certified Seeds',
      germinationRatePercent: newSeedGerm,
      purityPercent: 99.1,
      moisturePercent: 9.5,
      maturityDays: '115 Days',
      yieldPotentialQtPerHa: '35 Qt/Ha',
      agroEcologicalZone: 'Mid-Altitude & Highland',
      pricePerUnitEtb: Number(newSeedPrice),
      unit: '25kg Sealed Bag',
      stockQuantity: Number(newSeedStock),
      moaCertNumber: `ET-MOA-SEED-${Date.now().toString().slice(-4)}`,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      description: 'Tested and registered seed cultivar for smallholder distribution.',
      bulkDiscountThreshold: 30,
      bulkDiscountPercent: 10,
    };

    setSeeds([created, ...seeds]);
    setIsAddSeedModalOpen(false);
    flashNotice(`🌱 Successfully registered "${created.name}" into National Farm Supply Inventory!`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-16">
      {/* ── Top Notification Banner ── */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── 1. Hero / Header Desk ─────────────────────────────────────────── */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                  Business Agent Portal
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Certified Seed &amp; Input Supply Network
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> MoA Registered
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                AgriLink <span className="text-emerald-400">Business Agent Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Supplying Ethiopian smallholder farmers and commercial cooperatives with certified high-germination seeds, blended NPSB fertilizers, and climate-smart solar irrigation with direct escrow-guaranteed credit.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddSeedModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Seed Cultivar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('calculator')}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Calculator className="h-4 w-4 text-amber-400" />
                <span>Farm Input Calculator</span>
              </button>
            </div>
          </div>

          {/* Key Metric Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Certified Seed Stocks
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-400 font-mono">1,890</span>
                <span className="text-xs text-zinc-400">Bags Ready</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Kuncho, Maize, Wheat, Tomato</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Farmer Co-op Requests
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400 font-mono">{requests.length}</span>
                <span className="text-xs text-zinc-400">Co-op Orders</span>
              </div>
              <span className="text-[10px] text-amber-400/80 mt-1 block">1,398,500 ETB in demand</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Lab Germination Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-teal-400 font-mono">98.7%</span>
                <span className="text-xs text-zinc-400">Avg Quality</span>
              </div>
              <span className="text-[10px] text-teal-400/80 mt-1 block">National Seed Lab Tested</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Escrow Credit Backed
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-blue-400 font-mono">4.85M</span>
                <span className="text-xs text-zinc-400">ETB Vault</span>
              </div>
              <span className="text-[10px] text-blue-400/80 mt-1 block">CBE / Telebirr Escrow Link</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Primary Navigation Tabs ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'seeds'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sprout className="h-4 w-4" />
            <span>Certified Seeds &amp; Cultivars ({seeds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supplies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'supplies'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Fertilizers, Solar &amp; Equipment ({supplies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Farmer Co-op Requests ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calculator className="h-4 w-4 text-amber-400" />
            <span>Seed &amp; Input Dosage Calculator</span>
          </button>
        </div>
      </div>

      {/* ── 3. Tab Contents ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ── TAB 1: CERTIFIED SEEDS ── */}
        {activeTab === 'seeds' && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search certified seeds by variety, crop, or research center..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {['ALL', 'TEFF', 'MAIZE', 'WHEAT', 'TOMATO', 'ONION', 'POTATO'].map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCropFilter(crop)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCropFilter === crop
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {crop === 'ALL' ? 'All Seed Crops' : crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Seeds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSeeds.map((seed) => {
                return (
                  <div
                    key={seed.id}
                    className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
                  >
                    <div>
                      {/* Seed Header Image */}
                      <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                        <img
                          src={seed.imageUrl}
                          alt={seed.name}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/40" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-zinc-950 text-emerald-400 border border-emerald-500/30">
                            {seed.cropType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-950">
                            {seed.unit}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-600 text-white shadow-md flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {seed.germinationRatePercent}% Germination
                          </span>
                        </div>

                        {/* Title at bottom of banner */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <h3 className="text-base font-black leading-tight drop-shadow-md">
                            {seed.name}
                          </h3>
                          <p className="text-[11px] text-zinc-300 italic">{seed.scientificName}</p>
                        </div>
                      </div>

                      {/* Seed Specifications Content */}
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Cultivar / Variety</span>
                            <span className="font-bold text-zinc-200">{seed.cultivar}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Maturity Period</span>
                            <span className="font-bold text-amber-400">{seed.maturityDays}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Potential Yield</span>
                            <span className="font-bold text-emerald-400">{seed.yieldPotentialQtPerHa}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 block">Purity &amp; Moisture</span>
                            <span className="font-bold text-zinc-200">{seed.purityPercent}% / {seed.moisturePercent}%</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {seed.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-zinc-950 text-[11px] border border-zinc-800 flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Adapted Zone:</span>
                          <span className="font-bold text-zinc-300">{seed.agroEcologicalZone}</span>
                        </div>

                        {/* MoA Certificate Badge */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                          <span className="flex items-center gap-1 font-mono text-zinc-400">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            {seed.moaCertNumber}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            In Stock: {seed.stockQuantity} Bags
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer & Supply Action */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block font-semibold">Wholesale Price</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            {seed.pricePerUnitEtb.toLocaleString()} ETB
                          </span>
                          <span className="text-[10px] text-zinc-500">/{seed.unit.split(' ')[0]}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(
                              {
                                id: seed.id,
                                name: seed.name,
                                priceEtb: seed.pricePerUnitEtb,
                                unit: seed.unit,
                                itemType: 'INPUT',
                              },
                              1
                            );
                          }
                          flashNotice(`Added 1 bag of "${seed.name}" to farm supply order.`);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Supply to Farmer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: FERTILIZERS, SOLAR & EQUIPMENT ── */}
        {activeTab === 'supplies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supplies.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-28 w-28 rounded-2xl object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400/10 text-amber-400 border border-amber-400/30">
                        {item.category}
                      </span>
                      <span className="text-xs text-zinc-400 font-bold">{item.brand}</span>
                    </div>
                    <h3 className="text-base font-black text-white leading-snug">{item.name}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.description}</p>
                    <p className="text-[11px] font-mono text-emerald-400 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      Formula: {item.composition}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Supply Rate</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {item.priceEtb.toLocaleString()} ETB
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">/{item.unit}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) {
                        onAddToCart(
                          {
                            id: item.id,
                            name: item.name,
                            priceEtb: item.priceEtb,
                            unit: item.unit,
                            itemType: 'INPUT',
                          },
                          1
                        );
                      }
                      flashNotice(`Added "${item.name}" to farm supply parcel.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Dispatch to Farm</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: FARMER CO-OP INPUT ORDERS & DISPATCH QUEUE ── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Incoming Cooperative Seed &amp; Input Requests</h3>
                <p className="text-xs text-zinc-400">Pre-season consolidated demand submitted by verified agricultural unions</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                {requests.filter((r) => r.status === 'PENDING_AGENT_REVIEW').length} Pending Review
              </span>
            </div>

            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    req.status === 'APPROVED_DISPATCHED'
                      ? 'bg-zinc-900/60 border-emerald-500/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-400">{req.id}</span>
                        <span className="text-zinc-500">&bull;</span>
                        <h4 className="text-base font-black text-white">{req.coopName}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            req.urgency === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Leader: <strong className="text-zinc-200">{req.farmerLeader}</strong> &bull; Region: {req.region} &bull; Target Hectarage: {req.landAreaHectares} Ha
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Total Order Value</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {req.estimatedTotalEtb.toLocaleString()} ETB
                        </span>
                      </div>

                      {req.status === 'PENDING_AGENT_REVIEW' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req.id, true)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Approve &amp; Dispatch Fleet</span>
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Dispatched via Reefer Fleet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Itemized Breakdown Table */}
                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-1.5">Requested Supply Kit:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {req.requestedItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs flex items-center justify-between">
                          <span className="font-semibold text-zinc-300">{item.itemName}</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {item.quantity} {item.unit} &bull; {(item.quantity * item.unitPriceEtb).toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: INTERACTIVE SEED & FERTILIZER DOSAGE CALCULATOR ── */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters Controls */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <Calculator className="h-5 w-5" />
                <span>Farm Parcel Input Parameters</span>
              </div>

              {/* Crop Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Select Crop Variety:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'TEFF', label: 'Kuncho Teff' },
                    { id: 'MAIZE', label: 'BH-661 Maize' },
                    { id: 'WHEAT', label: "Dande'a Wheat" },
                    { id: 'TOMATO', label: 'Processing Tomato' },
                    { id: 'POTATO', label: 'Gudene Potato' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCalcCrop(c.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        calcCrop === c.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Hectarage Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-zinc-300">Land Area:</span>
                  <span className="font-mono text-emerald-400 font-black">{calcHectares} Hectares</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="20"
                  step="0.25"
                  value={calcHectares}
                  onChange={(e) => setCalcHectares(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>0.25 Ha (Garden Plot)</span>
                  <span>5.0 Ha</span>
                  <span>20.0 Ha (Commercial Farm)</span>
                </div>
              </div>

              {/* Irrigation Mode */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Cultivation Method:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcIrrigation('RAINFED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      calcIrrigation === 'RAINFED'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Rainfed Meher Season
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcIrrigation('DRIP')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                      calcIrrigation === 'DRIP'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Solar Drip Irrigated (+40% Yield)
                  </button>
                </div>
              </div>
            </div>

            {/* Dosage Output & Projected Economics */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white">Recommended Certified Input Requirements</h3>
                    <p className="text-xs text-zinc-400">Calibrated for Ethiopian MoA recommended agronomic practices</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                    {calculatedDosage.roiMultiplier}x Projected ROI
                  </span>
                </div>

                {/* 4 Dosage Pill Output Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Certified Seed</span>
                    <p className="text-xl font-black text-emerald-400 font-mono">
                      {calculatedDosage.totalSeedKg.toLocaleString()} kg
                    </p>
                    <span className="text-[10px] text-zinc-400 block">
                      {Math.ceil(calculatedDosage.totalSeedKg / 25)} Sealed Bags
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Basal NPSB</span>
                    <p className="text-xl font-black text-amber-400 font-mono">
                      {calculatedDosage.totalNpsbKg.toLocaleString()} kg
                    </p>
                    <span className="text-[10px] text-zinc-400 block">
                      {Math.ceil(calculatedDosage.totalNpsbKg / 50)} Bags (50kg)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Top Urea (46% N)</span>
                    <p className="text-xl font-black text-blue-400 font-mono">
                      {calculatedDosage.totalUreaKg.toLocaleString()} kg
                    </p>
                    <span className="text-[10px] text-zinc-400 block">
                      {Math.ceil(calculatedDosage.totalUreaKg / 50)} Bags (50kg)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Expected Harvest</span>
                    <p className="text-xl font-black text-teal-400 font-mono">
                      {calculatedDosage.totalYieldQt.toLocaleString()} Qt
                    </p>
                    <span className="text-[10px] text-zinc-400 block">Projected Total Yield</span>
                  </div>
                </div>

                {/* Economics Breakdown */}
                <div className="mt-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Input Investment:</span>
                    <span className="font-bold text-white font-mono">
                      {calculatedDosage.totalInputCostEtb.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Projected Harvest Gross Market Value:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {calculatedDosage.grossHarvestValueEtb.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-black">
                    <span className="text-zinc-200">Projected Farmer Net Payout:</span>
                    <span className="text-emerald-400 font-mono">
                      +{calculatedDosage.projectedNetGainEtb.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Bundle Button */}
              <button
                type="button"
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(
                      {
                        id: `bundle-${calcCrop}-${Date.now()}`,
                        name: `${calcHectares} Ha Complete ${calcCrop} Production Kit`,
                        priceEtb: calculatedDosage.totalInputCostEtb,
                        unit: 'Complete Parcel Kit',
                        itemType: 'INPUT',
                      },
                      1
                    );
                  }
                  flashNotice(`Ordered complete ${calcHectares} Ha ${calcCrop} input parcel! Ready for farm dispatch.`);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-xl shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Package className="h-4 w-4" />
                <span>
                  Supply Full {calcHectares} Ha Certified Package ({calculatedDosage.totalInputCostEtb.toLocaleString()} ETB)
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── 4. Add New Seed / Input Modal ─────────────────────────────────── */}
      {isAddSeedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Register Certified Seed Lot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSeedModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSeed} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Seed Variety Name:</label>
                <input
                  type="text"
                  placeholder="e.g. DZ-01-196 Magna Teff"
                  value={newSeedName}
                  onChange={(e) => setNewSeedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Crop Classification:</label>
                  <select
                    value={newSeedCrop}
                    onChange={(e) => setNewSeedCrop(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                  >
                    <option value="TEFF">Teff</option>
                    <option value="MAIZE">Maize</option>
                    <option value="WHEAT">Wheat</option>
                    <option value="TOMATO">Tomato</option>
                    <option value="ONION">Onion</option>
                    <option value="POTATO">Potato</option>
                    <option value="PULSE">Pulse / Legume</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Price per Bag (ETB):</label>
                  <input
                    type="number"
                    value={newSeedPrice}
                    onChange={(e) => setNewSeedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Stock Quantity (Bags):</label>
                  <input
                    type="number"
                    value={newSeedStock}
                    onChange={(e) => setNewSeedStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Certified Germination %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSeedGerm}
                    onChange={(e) => setNewSeedGerm(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSeedModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md cursor-pointer"
                >
                  Register Seed Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
