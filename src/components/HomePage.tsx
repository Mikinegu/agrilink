import React from 'react';
import farmTractorIrrigation from '../assets/images/farm_tractor_irrigation_1787815687313.jpg';
import farmTractorSunrise from '../assets/images/farm_tractor_sunrise_1787815703199.jpg';
import digitalProduceApp from '../assets/images/digital_produce_app_1787815717840.jpg';
import ethiopiaGreenhouseFarm from '../assets/images/ethiopia_greenhouse_farm_1787814574646.jpg';
import ethiopianFarmlandSunrise from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Truck,
  Building2,
  Landmark,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  MapPin,
  Clock,
  Boxes,
  Zap,
  Store,
  DollarSign,
  ChevronRight,
  Smartphone,
  Tractor,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { ProductCategory, Product, User } from '../types/index.ts';
import { HeroVideoPlayer } from './HeroVideoPlayer.tsx';
import { IntroHero } from './IntroHero.tsx';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  categories: ProductCategory[];
  featuredProducts: Product[];
  onSelectProduct: (product: Product) => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onOpenBrand: () => void;
  onLogoutToGuest?: () => void;
  onOpenCallCenter?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  categories,
  featuredProducts,
  onSelectProduct,
  currentUser,
  onOpenLogin,
  onOpenSignUp,
  onOpenBrand,
  onLogoutToGuest,
  onOpenCallCenter,
}) => {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Showcase (Farmland Corridors) */}
      <HeroVideoPlayer
        onExploreMarket={() => onNavigate('marketplace')}
        onOpenRegister={() => onNavigate('register')}
      />

      {/* Verified Agricultural Network Section */}
      <IntroHero onOpenBrand={onOpenBrand} />

      {/* Quick Interactive Ecosystem Channels Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('marketplace')}
            className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Fresh Produce Market</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Direct farm harvests in ETB</p>
          </button>

          <button
            onClick={() => onNavigate('procurement')}
            className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
                <Building2 className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">B2B Procurement</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Bulk RFQs & weekly supply</p>
          </button>

          <button
            onClick={() => onNavigate('inputs')}
            className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
                <Tractor className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Seeds & Equipment</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Certified farm inputs & leasing</p>
          </button>

          <button
            onClick={() => onNavigate('finance')}
            className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-teal-500 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                <Landmark className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-teal-600 transition-colors" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">Agri-Credit & Escrow</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Awash Bank backed financing</p>
          </button>
        </div>

        {/* Featured Flagship: AI Agri-Intelligence Command Center & Live Radar Banner */}
        <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 p-6 sm:p-8 text-white border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Sparkles className="h-4 w-4" /> Next-Gen AI Feature
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              AI Agri-Intelligence Command Center & Cold-Chain Radar
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
              Multimodal plant disease diagnostics powered by Gemini Vision, live Ethiopian cold-chain telemetry radar, real-time ECX price oracle, and smart farm yield simulators.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('intelligence')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Launch AI Command Center</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 Connected Value Chain Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
            Integrated Value Chain
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-2">
            Engineered for Modern Agriculture
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Empowering Ethiopia's horticultural, grain, and commercial farm sectors with digital infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Farmers */}
          <div
            onClick={() => onNavigate('farmer-portal')}
            className="p-6 rounded-2xl bg-white border border-zinc-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sprout className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">Direct Farm Payouts</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                List harvests directly for hotels, supermarkets, and processors. Receive instant mobile payouts via Telebirr or CBE Birr.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
              Open Farmer Portal <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Pillar 2: Commercial Buyers */}
          <div
            onClick={() => onNavigate('procurement')}
            className="p-6 rounded-2xl bg-white border border-zinc-200/90 hover:border-blue-500 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">Commercial Procurement</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Submit RFQ bulk orders, lock guaranteed delivery schedules, and source certified produce with full batch traceability.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-4 flex items-center gap-1">
              View B2B Quotes <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Pillar 3: Logistics & Hubs */}
          <div
            onClick={() => onNavigate('logistics')}
            className="p-6 rounded-2xl bg-white border border-zinc-200/90 hover:border-purple-500 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">Cold-Chain Logistics</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Aggregation hubs with pre-cooling, lot inspection, and refrigerated GPS-tracked transit from farm-gate to city terminals.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
              Explore Logistics Grid <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Pillar 4: Agri-Finance */}
          <div
            onClick={() => onNavigate('finance')}
            className="p-6 rounded-2xl bg-white border border-zinc-200/90 hover:border-teal-500 shadow-2xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">Agri-Credit & Escrow</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Working capital and input financing based on verified harvest history, backed by Awash Bank and smart escrow security.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 mt-4 flex items-center gap-1">
              Open Banking Desk <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Direct Digital Commerce & Modern Farmlands Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full inline-block">
                Digital Trade Infrastructure
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900">
                Transforming Agriculture Across Africa
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
                Safe, transparent, and direct market channels connecting growers with enterprise buyers.
              </p>
            </div>

            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start md:self-auto"
            >
              Browse all categories <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature 1: Digital Produce App */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200/80 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80">
                    <Smartphone className="h-4 w-4 text-emerald-700" /> B2B Produce Marketplace
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Escrow Guaranteed
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-16/10 border border-emerald-300/60 shadow-sm group">
                  <img
                    src={digitalProduceApp}
                    alt="Buy fresh farm produce digitally via AgriLink"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Live Produce Listings
                      </span>
                      <p className="text-sm font-black text-white">
                        Grade A & B Vegetables, Fruits & Grains
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Real-time price discovery, quality grade verification, batch traceability, and direct payments with guaranteed buyer-seller escrow.
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">
                  Telebirr • CBE Birr • Chapa
                </span>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100/80 hover:bg-emerald-200/90 transition-colors cursor-pointer"
                >
                  <span>Browse Produce</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Feature 2: Farmlands & Inputs */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 border border-blue-200/80 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80">
                    <Tractor className="h-4 w-4 text-blue-700" /> Inputs & Mechanization
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-full">
                    Certified Seeds
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-16/10 border border-blue-300/60 shadow-sm group">
                  <img
                    src={farmTractorSunrise}
                    alt="Farmland cultivation and tractor mechanization"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Modern Farmland Mechanization
                      </span>
                      <p className="text-sm font-black text-white">
                        Tractors, Drip Irrigation & Certified Fertilizers
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Procure certified high-yield seeds, fertilizers, and tractor tilling directly from verified manufacturers with input credit options.
                </p>
              </div>

              <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">
                  Direct Manufacturer Partnerships
                </span>
                <button
                  onClick={() => onNavigate('inputs')}
                  className="text-xs font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-100/80 hover:bg-blue-200/90 transition-colors cursor-pointer"
                >
                  <span>Browse Inputs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fresh Harvests Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-900">Featured Fresh Harvests</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Ready for instant dispatch from verified regional farm estates</p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View all ({featuredProducts.length}+ listings) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((p) => {
            const img = p.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                  <img src={img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900/90 text-white backdrop-blur-xs">
                    {p.grade.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{p.categoryName}</span>
                    <h3 className="font-bold text-zinc-900 text-sm mt-0.5">{p.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{p.farmLocation}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-zinc-900">{p.pricePerUnitEtb.toLocaleString()} ETB</span>
                      <span className="text-xs text-zinc-400"> /{p.unit}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                      Inspect & Order
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verified Farmlands & Agricultural Mechanization Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-xl space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-3 py-0.5 rounded-full inline-block">
                Ethiopian Farmland Corridors
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                From Verified Fields to Urban Markets
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Connecting mechanized farms in Arsi, Sidama, and Wonji with Addis Ababa's commercial kitchens and supermarket shelves.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('register')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-md shadow-emerald-600/30"
              >
                <span>Register Your Farm / Business</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 4-Column Visual Grid featuring the new lush Ethiopian Farmland Sunrise Image Card (NOT as a background) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
            {/* Field 0: Lush Highland Farmlands & Sunrise Terraces */}
            <div 
              onClick={() => onNavigate('register')}
              className="rounded-2xl bg-zinc-900/90 border border-emerald-500/40 overflow-hidden group hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-zinc-800">
                <img
                  src={ethiopianFarmlandSunrise}
                  alt="Lush green Ethiopian farmland and fertile terraces"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-zinc-950">
                  Fertile High Plains
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sprout className="h-4 w-4 text-emerald-400" /> Highland Croplands
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Organic teff, barley, and pulse cultivation in Gojjam, Arsi, and central Ethiopian highlands.
                </p>
              </div>
            </div>

            {/* Field 1: Mechanized Farmland */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden group hover:border-emerald-500/60 transition-all flex flex-col justify-between">
              <div className="relative aspect-16/10 overflow-hidden bg-zinc-800">
                <img
                  src={farmTractorIrrigation}
                  alt="Mechanized Ethiopian farmland with irrigation tractor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40">
                  Mechanized Fields
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Tractor className="h-4 w-4 text-emerald-400" /> Arsi & Wonji Corridors
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Precision irrigation, tractor mechanization, and high-yield grain cultivation across 24,000+ hectares.
                </p>
              </div>
            </div>

            {/* Field 2: Greenhouse Horticulture */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden group hover:border-emerald-500/60 transition-all flex flex-col justify-between">
              <div className="relative aspect-16/10 overflow-hidden bg-zinc-800">
                <img
                  src={ethiopiaGreenhouseFarm}
                  alt="Modern protected greenhouse horticulture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/90 text-blue-200 border border-blue-500/40">
                  Protected Hubs
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sprout className="h-4 w-4 text-blue-400" /> Greenhouse Horticulture
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export-grade bell peppers, cherry tomatoes, and microgreens grown in climate-controlled polytunnels in Bishoftu.
                </p>
              </div>
            </div>

            {/* Field 3: Digital Buying & Mobile App */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden group hover:border-emerald-500/60 transition-all flex flex-col justify-between">
              <div className="relative aspect-16/10 overflow-hidden bg-zinc-800">
                <img
                  src={digitalProduceApp}
                  alt="Buy fresh vegetables digitally on mobile phone"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40">
                  Batch Escrow
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-emerald-400" /> Digital Settlement
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inspect harvest lots, verify grade certificates, and place orders directly with guaranteed escrow release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Founding Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full inline-block">
            Leadership & Vision
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-2">
            Meet the Founding Team
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Experienced domain experts in Agritech, Digital Marketplaces, and Scaled Financial Settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Bamlak Sisay */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center text-base font-black shadow-sm">
                  BS
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  Co-Founder & Product Lead
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900">Bamlak Sisay</h3>
                <span className="text-xs font-medium text-emerald-700">Agro-Tech Entrepreneur & Ecosystem Architect</span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Drives the product roadmap, merchant escrow frameworks, and partnerships with agricultural unions and commercial buyers across East Africa.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <span>AgriLink Founding Partner</span>
            </div>
          </div>

          {/* Besufkad Anbes */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white flex items-center justify-center text-base font-black shadow-sm">
                  BA
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">
                  Co-Founder & Systems Architect
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900">Besufkad Anbes</h3>
                <span className="text-xs font-medium text-blue-700">Fintech & Distributed Systems Engineer</span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Leads platform engineering, digital payment integrations, IoT cold-chain tracking, and high-throughput B2B settlement infrastructure.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
              <span>AgriLink Founding Partner</span>
            </div>
          </div>
        </div>
      </section>

      {/* Discover the Future of Agriculture CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-950 text-white p-8 sm:p-12 border border-emerald-800/30 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
              AgriLink Digital Grid
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Trade or Source Fresh Harvests?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              Join growers, logistics operators, and commercial buyers across Ethiopia with transparent pricing and bank-grade escrow.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-700/40 transition-all cursor-pointer hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started in Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onOpenCallCenter && (
                <button
                  onClick={onOpenCallCenter}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>Call Center & Support</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
