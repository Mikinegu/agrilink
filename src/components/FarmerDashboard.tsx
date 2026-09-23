import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sprout,
  TrendingUp,
  Wallet,
  Tractor,
  Package,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  ChevronRight,
  Building2,
  Landmark,
  ArrowRight,
  Sun,
  CloudSun,
  Droplets,
  Wind,
  Search,
  Filter,
  Layers,
  Zap,
  Phone,
  HelpCircle,
  Eye,
  Check,
  Wheat,
  MapPin,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { Product } from '../types/index.ts';
import { FaydaFinBankModal } from './FaydaFinBankModal.tsx';
import { AIProduceAssistantModal } from './AIProduceAssistantModal.tsx';
import { CbeLogo, AwashBankLogo, DashenBankLogo, CoopBankLogo } from './PaymentLogos.tsx';
import ethiopianFarmlandSunrise from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, currentLanguage } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  // Search & Filter State for easy assessment
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'GRAINS' | 'PULSES' | 'COFFEE' | 'FRUITS'>('ALL');

  // AI Quality Scanner State
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('White Teff (Magna)');
  const [isScanning, setIsScanning] = useState(false);
  const [showFaydaModal, setShowFaydaModal] = useState(false);
  const [showAiProduceModal, setShowAiProduceModal] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Buyer Matchmaker Feed State
  const [quotesFeed, setQuotesFeed] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, aiRes, quotesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/ai/market-intelligence'),
          fetch('/api/quotes'),
        ]);

        if (prodRes.ok) {
          const prods: Product[] = await prodRes.json();
          // Filter to this farmer's products if farmer ID exists
          const myProds = prods.filter((p) => !currentUser?.id || p.farmerId === currentUser.id || p.farmerId === 1);
          setProducts(myProds);
        }

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.trends && Array.isArray(aiData.trends)) {
            setMarketPrices(aiData.trends);
          }
        }

        if (quotesRes.ok) {
          const quotesData = await quotesRes.json();
          if (Array.isArray(quotesData)) {
            setQuotesFeed(quotesData.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load farmer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Inventory valuation & tonnage metrics
  const totalStockValueEtb = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.pricePerUnitEtb || 0) * Number(p.availableQuantity || 0)), 0);
  }, [products]);

  const totalStockTons = useMemo(() => {
    const kgTotal = products.reduce((acc, p) => {
      const qty = Number(p.availableQuantity || 0);
      const isQuintal = p.unit?.toLowerCase().includes('quintal') || p.unit?.toLowerCase().includes('ኩንታል') || p.unit?.toLowerCase().includes('kuntaala');
      return acc + (isQuintal ? qty * 100 : qty);
    }, 0);
    return (kgTotal / 1000).toFixed(1);
  }, [products]);

  // Filtered harvest products for easy assessment
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmLocation?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'GRAINS') {
        return (
          p.categoryId === 1 ||
          p.name.toLowerCase().includes('teff') ||
          p.name.toLowerCase().includes('wheat') ||
          p.name.toLowerCase().includes('barley') ||
          p.name.toLowerCase().includes('maize')
        );
      }
      if (selectedFilter === 'PULSES') {
        return (
          p.categoryId === 2 ||
          p.name.toLowerCase().includes('bean') ||
          p.name.toLowerCase().includes('chickpea') ||
          p.name.toLowerCase().includes('lentil') ||
          p.name.toLowerCase().includes('pea')
        );
      }
      if (selectedFilter === 'COFFEE') {
        return p.categoryId === 6 || p.name.toLowerCase().includes('coffee') || p.name.toLowerCase().includes('yirga');
      }
      if (selectedFilter === 'FRUITS') {
        return (
          p.categoryId === 4 ||
          p.categoryId === 5 ||
          p.name.toLowerCase().includes('avocado') ||
          p.name.toLowerCase().includes('tomato') ||
          p.name.toLowerCase().includes('onion')
        );
      }
      return true;
    });
  }, [products, searchQuery, selectedFilter]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setScanImage(b64);
      triggerScan(b64);
    };
    reader.readAsDataURL(file);
  };

  const triggerScan = async (base64Img: string) => {
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await fetch('/api/ai/scan-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64Img,
          crop_name: selectedCrop,
          region: currentUser?.region || 'Oromia, Ethiopia',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
      } else {
        const err = await res.json();
        setScanError(err.error || 'AI vision service unavailable.');
      }
    } catch (err) {
      setScanError('AI sidecar offline. Showing standard ECX Grade 1 diagnostic parameters.');
    } finally {
      setIsScanning(false);
    }
  };

  // Instant pre-loaded test presets for farmers
  const handleQuickSampleTest = (cropName: string) => {
    setSelectedCrop(cropName);
    setIsScanning(true);
    setScanError(null);

    setTimeout(() => {
      setIsScanning(false);
      if (cropName.includes('Teff')) {
        setScanResult({
          grade: 'Grade 1 Export',
          confidence_score: 96,
          defects_detected: 2,
          colour_profile: 'Uniform Ivory Magna (Brix: High)',
          recommendation: '98.4% seed purity, negligible foreign matter. Approved for direct ECX export consignment.',
        });
      } else if (cropName.includes('Coffee')) {
        setScanResult({
          grade: 'Q-Grade 1 Specialty (Washed)',
          confidence_score: 98,
          defects_detected: 1,
          colour_profile: 'Deep Jade Green (Moisture: 10.8%)',
          recommendation: 'Exceptional floral-citrus profile. Premium ECX direct-to-roaster auction reserve recommended.',
        });
      } else {
        setScanResult({
          grade: 'Grade A Export Retail',
          confidence_score: 94,
          defects_detected: 3,
          colour_profile: 'Pebbled Forest Green (Dry Matter: 24%)',
          recommendation: 'Optimum maturity index. Immediate cold-chain reefer dispatch (5.5°C) recommended.',
        });
      }
    }, 600);
  };

  const defaultCommodities = [
    {
      commodity: t.farmer.commodities.whiteTeff,
      currentPriceEtb: 11500,
      unit: currentLanguage === 'am' ? 'ኩንታል (100 ኪ.ግ)' : currentLanguage === 'om' ? 'Kuntaala (100kg)' : 'Quintal (100kg)',
      changePercent: 4.8,
      marketHub: t.farmer.hubs.bishoftu,
      demandTag: 'High Demand',
      demandColor: 'emerald',
    },
    {
      commodity: t.farmer.commodities.yirgacheffeCoffee,
      currentPriceEtb: 42000,
      unit: currentLanguage === 'am' ? 'ኩንታል (100 ኪ.ግ)' : currentLanguage === 'om' ? 'Kuntaala (100kg)' : 'Quintal (100kg)',
      changePercent: 6.2,
      marketHub: t.farmer.hubs.ecxAddis,
      demandTag: 'Export Surge',
      demandColor: 'emerald',
    },
    {
      commodity: t.farmer.commodities.kabuliChickpeas,
      currentPriceEtb: 7200,
      unit: currentLanguage === 'am' ? 'ኩንታል (100 ኪ.ግ)' : currentLanguage === 'om' ? 'Kuntaala (100kg)' : 'Quintal (100kg)',
      changePercent: -1.2,
      marketHub: t.farmer.hubs.gondar,
      demandTag: 'Stable Holding',
      demandColor: 'amber',
    },
    {
      commodity: t.farmer.commodities.hassAvocado,
      currentPriceEtb: 85,
      unit: currentLanguage === 'am' ? 'ኪ.ግ' : 'KG',
      changePercent: 3.5,
      marketHub: t.farmer.hubs.hawassa,
      demandTag: 'Peak Season',
      demandColor: 'emerald',
    },
    {
      commodity: t.farmer.commodities.redKidneyBeans,
      currentPriceEtb: 6400,
      unit: currentLanguage === 'am' ? 'ኩንታል (100 ኪ.ግ)' : currentLanguage === 'om' ? 'Kuntaala (100kg)' : 'Quintal (100kg)',
      changePercent: 2.1,
      marketHub: t.farmer.hubs.adama,
      demandTag: 'Steady Inquiries',
      demandColor: 'emerald',
    },
  ];

  const displayPrices = marketPrices.length > 0 ? marketPrices : defaultCommodities;

  return (
    <div className="relative space-y-6 pb-12">
      {/* Ambient Agricultural Texture & Glow Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-amber-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      {/* ── 1. Hero Atmospheric Header with Farmland Sunrise Background ── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-2xl border border-emerald-800/40">
        {/* Real Ethiopian Farmland Sunrise Image Background */}
        <img
          src={ethiopianFarmlandSunrise}
          alt="Ethiopian Farmland Sunrise"
          className="absolute inset-0 w-full h-full object-cover opacity-35 object-center mix-blend-overlay"
        />

        {/* Multi-layered Vignette & Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-teal-950/85" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          {/* Top Metadata Row: Location, Co-op Badge, Language */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-2xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5 backdrop-blur-md">
                <Sprout className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.farmer.portalBadge}</span>
              </span>
              <span className="text-xs font-semibold text-emerald-100/90 flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                <MapPin className="h-3 w-3 text-amber-400" />
                <span>Wonji Horizon Union • East Shewa, Oromia</span>
              </span>
              <span className="text-2xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-full">
                ECX Node: Addis-Adama Corridor
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector variant="pill" className="bg-emerald-950/80 border border-emerald-400/30 text-emerald-100" />
            </div>
          </div>

          {/* Center Greeting & Farm Description */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{t.farmer.welcomeGreeting},</span>
                <span className="text-emerald-300 underline decoration-emerald-500/40 underline-offset-4">
                  {currentUser?.fullName || 'Bekele Tadesse'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
                {t.farmer.bannerDesc} Manage crop harvesting, assess market pricing, track locked Telebirr/CBE escrow payouts, and link your National ID for instant bank lending.
              </p>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <NavLink
                to="/farmer/listings"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-zinc-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>{t.farmer.listNewHarvest}</span>
              </NavLink>

              <button
                onClick={() => setShowFaydaModal(true)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-102 cursor-pointer"
              >
                <Landmark className="h-4 w-4" />
                <span>Bank Credit (Fayda)</span>
              </button>

              <button
                onClick={() => setShowAiProduceModal(true)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs sm:text-sm backdrop-blur-md border border-amber-400/30 transition-all hover:scale-102 cursor-pointer shadow-md"
                title="AI Produce Visual & Photo Matcher"
              >
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>AI Photo Assistant</span>
              </button>

              <NavLink
                to="/salvage"
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Distressed Produce Salvage Discount Engine"
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Salvage Engine</span>
              </NavLink>
            </div>
          </div>

          {/* Integrated Live Agro-Weather & Crop Assessment Bar */}
          <div className="pt-4 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Micro-Climate</span>
                <span className="font-extrabold text-white">24°C • Sunny</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Relative Humidity</span>
                <span className="font-extrabold text-white">42% RH • Optimal</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center shrink-0">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Breeze & Velocity</span>
                <span className="font-extrabold text-white">11 km/h ENE</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Harvest Window</span>
                <span className="font-extrabold text-emerald-300">4-Day Clear Drying</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Quick Command Strip: 1-Click Operations Launcher ── */}
      <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-2xs font-extrabold text-emerald-800 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Quick Access:</span>
        </span>

        <NavLink
          to="/farmer/listings"
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-emerald-200"
        >
          <Sprout className="h-3.5 w-3.5 text-emerald-700" />
          <span>List Harvest Batch</span>
        </NavLink>

        <NavLink
          to="/farmer/farms"
          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-zinc-200"
        >
          <Tractor className="h-3.5 w-3.5 text-amber-600" />
          <span>My Farm Fields (24.5 Ha)</span>
        </NavLink>

        <NavLink
          to="/salvage"
          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-amber-200"
        >
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Salvage Engine (Discount B2B)</span>
        </NavLink>

        <button
          onClick={() => setShowFaydaModal(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-purple-200 cursor-pointer"
        >
          <Landmark className="h-3.5 w-3.5 text-purple-700" />
          <span>National ID Bank Credit</span>
        </button>

        <NavLink
          to="/farmer/escrow"
          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-blue-200"
        >
          <Wallet className="h-3.5 w-3.5 text-blue-700" />
          <span>Escrow Payouts (42.5k ETB)</span>
        </NavLink>

        <NavLink
          to="/farmer/ai-advisor"
          className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 border border-teal-200"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-700" />
          <span>AI Crop Doctor</span>
        </NavLink>

        <div className="h-4 w-px bg-zinc-200 shrink-0" />

        <div className="flex items-center gap-2 text-2xs text-zinc-500 font-semibold px-2 shrink-0">
          <Phone className="h-3 w-3 text-emerald-600" />
          <span>MoA Helpline: <strong className="text-zinc-900">8420</strong> (Toll-Free)</span>
          <span>•</span>
          <span>USSD: <strong className="text-zinc-900">*847#</strong></span>
        </div>
      </div>

      {/* ── 3. Four Farm Health & Liquidity KPI Cards ("Easy to Assess") ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Harvest Inventory */}
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3 group">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
            <span className="uppercase tracking-wider">{t.farmer.activeBatchesCard}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sprout className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-zinc-900">{products.length}</p>
              <span className="text-xs font-bold text-zinc-500">Batches</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Approx. <strong className="text-zinc-800">{totalStockTons} MT</strong> ({totalStockValueEtb.toLocaleString()} ETB)
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> ECX Quality Inspected
            </span>
            <NavLink to="/farmer/listings" className="text-zinc-400 hover:text-emerald-700 font-semibold">
              Manage &rarr;
            </NavLink>
          </div>
        </div>

        {/* Card 2: Locked Escrow Liquidity */}
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-3 group">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
            <span className="uppercase tracking-wider">{t.farmer.lockedEscrowCard}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-zinc-900">42,500</p>
              <span className="text-sm font-black text-blue-700">{t.common.currency}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Custody: <strong className="text-zinc-800">CBE & Telebirr Escrow</strong>
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-blue-700 font-bold flex items-center gap-1">
              <Clock className="h-3 w-3" /> Auto-Releases upon Pickup
            </span>
            <NavLink to="/farmer/escrow" className="text-zinc-400 hover:text-blue-700 font-semibold">
              View &rarr;
            </NavLink>
          </div>
        </div>

        {/* Card 3: Cleared Sales Volume */}
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-xs hover:shadow-md hover:border-amber-300 transition-all space-y-3 group">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
            <span className="uppercase tracking-wider">{t.farmer.totalProduceSoldCard}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Tractor className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-zinc-900">18.4</p>
              <span className="text-sm font-bold text-zinc-500">{t.farmer.tonsUnit}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Equal to <strong className="text-zinc-800">184 Quintals</strong> delivered
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 99.2% On-Time Fulfillment
            </span>
            <span className="text-zinc-400">Zero Loss</span>
          </div>
        </div>

        {/* Card 4: Pre-Approved Bank Credit Line */}
        <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-3 group">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold">
            <span className="uppercase tracking-wider">National ID Credit Line</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Landmark className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-3xl font-black text-zinc-900">450,000</p>
              <span className="text-sm font-black text-purple-700">{t.common.currency}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pre-approved credit line (0 collateral)
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs">
            <span className="text-purple-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> FIN Verified (CBE / Coop)
            </span>
            <button
              onClick={() => setShowFaydaModal(true)}
              className="text-purple-700 hover:underline font-bold cursor-pointer"
            >
              Apply &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. National ID (FIN) Bank Credit & Loan Linkage Banner ── */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 text-white p-6 sm:p-7 border border-emerald-600/40 shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />

        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <span>🇪🇹</span> Ethiopian National ID (Fayda / FIN) Bank Lending
            </span>
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
              <CbeLogo className="h-3.5 w-3.5 rounded-full" />
              <CoopBankLogo className="h-3.5 w-3.5 rounded-full" />
              <AwashBankLogo className="h-3.5 w-3.5 rounded-full" />
              <DashenBankLogo className="h-3.5 w-3.5 rounded-full" />
              <span className="text-2xs text-zinc-300 font-semibold ml-1">CBE • Coop • Awash • Dashen</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">
            Need Capital for Certified Seeds, Fertilizer or Cold-Chain Storage?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Link your unique 12-digit <strong>Fayda Identification Number (FIN)</strong> to instantly unlock up to <strong>450,000 ETB</strong> in collateral-free bank loans. Funds disburse straight to Telebirr, CBE Birr, or directly into Seed Supplier Escrow.
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-2xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-mono">
              FIN: 1284-9021-3475
            </span>
            <span className="text-2xs text-emerald-300 font-semibold">
              ✓ Pre-Approved for 450,000 ETB • 0 Collateral Required
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => setShowFaydaModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-xl flex items-center justify-center gap-2 group"
          >
            <Landmark className="h-4 w-4 text-zinc-950" />
            <span>Open National ID Credit Portal</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── 5. ECX Live Market Prices & 'When to Sell' Advisor ── */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-900/10 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900">{t.farmer.marketIntelTitle}</h2>
              <p className="text-[11px] text-zinc-400">{t.farmer.marketIntelSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ● ECX Addis Ababa Live Feed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {displayPrices.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-zinc-50/80 hover:bg-emerald-50/40 border border-zinc-200/80 hover:border-emerald-300 flex flex-col justify-between transition-all"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-bold text-zinc-900 truncate">{item.commodity || item.crop}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                  {item.demandTag || 'Active'}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-base font-black text-zinc-950">
                  {item.currentPriceEtb?.toLocaleString() || item.priceEtb} {t.common.currency}
                </span>
                <span
                  className={`text-[11px] font-extrabold ${
                    Number(item.changePercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {Number(item.changePercent || 0) >= 0 ? '+' : ''}
                  {item.changePercent || 0}%
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="truncate">{item.marketHub || item.region || 'Addis Ababa'}</span>
                <span className="text-emerald-700 font-semibold">High Demand</span>
              </div>
            </div>
          ))}
        </div>

        {/* Market Advice Callout */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-950">
          <Sparkles className="h-4 w-4 text-emerald-700 shrink-0" />
          <p className="leading-relaxed">
            <strong>Agronomic Market Signal:</strong> White Teff prices at Bishoftu Hub increased by <strong>4.8%</strong> this week. High buyer demand from commercial bakeries and export mills makes this an ideal time to list remaining storage quintals.
          </p>
        </div>
      </div>

      {/* ── 6. Live Harvest Inventory & Condition Assessment ── */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-900/10 overflow-hidden shadow-xs space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900">{t.farmer.liveHarvestTitle}</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {filteredProducts.length} Lots
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{t.farmer.liveHarvestSubtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/farmer/listings"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Batch</span>
            </NavLink>
            <NavLink
              to="/farmer/listings"
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 transition-colors"
            >
              <span>{t.farmer.viewAll} ({products.length})</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills for Easy Assessment */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop name, variety or farm location..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {(
              [
                { id: 'ALL', label: 'All Crops' },
                { id: 'GRAINS', label: '🌾 Grains & Cereals' },
                { id: 'PULSES', label: '🫘 Pulses' },
                { id: 'COFFEE', label: '☕ Coffee' },
                { id: 'FRUITS', label: '🥑 Fruits & Veg' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedFilter === f.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Harvest Cards Grid */}
        <div className="divide-y divide-zinc-100 pt-2">
          {filteredProducts.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-50/20 px-3 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-zinc-900 text-sm">{p.name}</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.grade || 'Grade 1 Export'}
                    </span>
                    {p.isOrganic && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        {t.farmer.organic}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-zinc-400">
                      ID: #{p.id}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{p.farmLocation || p.region}</span>
                    <span>•</span>
                    <span>
                      Stock: <strong className="text-zinc-900">{p.availableQuantity} {p.unit}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                      ECX Fair Market Benchmark
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <div className="text-right">
                  <span className="text-base font-black text-zinc-950">
                    {p.pricePerUnitEtb} {t.common.currency}
                  </span>
                  <span className="text-xs text-zinc-500"> / {p.unit}</span>
                  <p className="text-[10px] text-emerald-600 font-bold">Fast Buyer Offtake</p>
                </div>

                <div className="flex items-center gap-2">
                  <NavLink
                    to="/farmer/listings"
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    {t.farmer.manage}
                  </NavLink>
                  <NavLink
                    to="/salvage"
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
                    title="Need to discount distressed surplus?"
                  >
                    ⚡ Salvage
                  </NavLink>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && !loading && (
            <div className="p-8 text-center text-zinc-500 space-y-2">
              <p className="text-sm font-semibold">No harvest batches match your current search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('ALL');
                }}
                className="text-xs font-bold text-emerald-700 underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 7. AI Crop Doctor Quality Scanner & Commercial Buyer Matchmaker ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AI Quality Scanner Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-900/10 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    {currentLanguage === 'am' ? 'የአይአይ (AI) ምርት ጥራት መርማሪ' : 'AI Harvest Quality Scanner'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Computer vision grading & defect detection for ECX export compliance
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                ECX Standard
              </span>
            </div>

            {/* Quick Sample Test Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                1-Click Quick Sample Testing:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSampleTest('Magna White Teff')}
                  className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 text-zinc-700 text-xs font-bold transition-colors cursor-pointer border border-zinc-200"
                >
                  🌾 Test White Teff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleTest('Yirgacheffe Arabica Coffee')}
                  className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 text-zinc-700 text-xs font-bold transition-colors cursor-pointer border border-zinc-200"
                >
                  ☕ Test Coffee Cherry
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSampleTest('Hass Export Avocado')}
                  className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 text-zinc-700 text-xs font-bold transition-colors cursor-pointer border border-zinc-200"
                >
                  🥑 Test Hass Avocado
                </button>
              </div>
            </div>

            {/* Crop selector & Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Select Commodity
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-zinc-900 cursor-pointer"
                >
                  <option value="Magna White Teff">Magna White Teff</option>
                  <option value="Yirgacheffe Arabica Coffee">Yirgacheffe Coffee Cherries</option>
                  <option value="Kabuli Chickpeas">Kabuli Chickpeas</option>
                  <option value="Hass Export Avocado">Hass Avocado</option>
                  <option value="Red Kidney Beans">Red Kidney Beans</option>
                  <option value="Durum Wheat">Durum Wheat</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Upload Harvest Photo
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <span>{scanImage ? 'Change Photo' : 'Capture or Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Image Preview & Scanner Visual */}
            {scanImage && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-950 aspect-video max-h-48 flex items-center justify-center">
                <img src={scanImage} alt="Crop Sample" className="w-full h-full object-cover opacity-85" />
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                    <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
                    <span className="text-xs font-bold tracking-wide animate-pulse">Running HSV Defect Profiling...</span>
                  </div>
                )}
              </div>
            )}

            {/* Scan Diagnostic Result */}
            {scanResult && !isScanning && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-950">Grade: {scanResult.grade}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Confidence: {scanResult.confidence_score}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Surface Blemishes</span>
                    <span className="font-bold text-zinc-900">{scanResult.defects_detected} spots detected</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Colour Spectrum</span>
                    <span className="font-bold text-emerald-700">{scanResult.colour_profile}</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-900 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-bold">Recommendation:</span> {scanResult.recommendation}
                </p>
              </div>
            )}

            {scanError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Diagnostics Notice: </span>
                  {scanError}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> ECX Quality Compliance
            </span>
            <NavLink
              to="/farmer/ai-advisor"
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>Full Crop Doctor Radar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* 2. Buyer Matchmaker Feed */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-emerald-900/10 p-6 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    {currentLanguage === 'am' ? 'የገዢዎች ፍላጎት ማገናኛ' : 'Commercial Buyer Matchmaker'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Live RFQ procurement tenders seeking farm-gate harvests
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Instant Escrow
              </span>
            </div>

            {quotesFeed.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-100 text-center space-y-2">
                <p className="text-xs font-bold text-zinc-700">Brewery & Grain Processor RFQs Active</p>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                  Institutional buyers regularly submit bulk tenders for white teff, coffee cherries, and chickpeas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {quotesFeed.map((q) => (
                  <div key={q.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{q.productName}</h4>
                      <p className="text-[11px] text-zinc-400">
                        Need: <span className="font-semibold text-zinc-700">{q.requestedQuantity} {q.unit}</span> • {q.deliveryLocation || 'Addis Ababa'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {q.targetPriceEtb && (
                        <span className="text-xs font-bold text-emerald-600 block">
                          {Number(q.targetPriceEtb).toLocaleString()} ETB/{q.unit}
                        </span>
                      )}
                      <NavLink
                        to="/farmer/listings"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-bold hover:bg-zinc-800 transition-colors mt-1"
                      >
                        <span>Match Listing</span>
                        <ChevronRight className="w-3 h-3" />
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Verified Commercial Offtakers</span>
            <NavLink
              to="/farmer/listings"
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>Manage Harvest Batches</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 8. Offline Extension & Support Card ── */}
      <div className="p-4 rounded-2xl bg-zinc-100/90 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-zinc-900">Offline Extension Support & Emergency SMS/USSD</p>
            <p className="text-[11px] text-zinc-500">Call Ministry of Agriculture free extension line at <strong className="text-zinc-900">8420</strong> or dial <strong className="text-zinc-900">*847#</strong> for price quotes on feature phones.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xs font-bold bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700">
            Adama Logistics Hub (14 km)
          </span>
        </div>
      </div>

      {/* Fayda National ID (FIN) Bank Credit & Loan Modal */}
      <FaydaFinBankModal
        isOpen={showFaydaModal}
        onClose={() => setShowFaydaModal(false)}
        initialFin={currentUser?.nationalIdNumber}
      />

      {/* AI Produce Visual & Photo Matcher Modal */}
      <AIProduceAssistantModal
        isOpen={showAiProduceModal}
        onClose={() => setShowAiProduceModal(false)}
      />
    </div>
  );
};
