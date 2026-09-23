import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
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
  Tractor,
  CheckCircle2,
  Phone,
  Linkedin,
} from 'lucide-react';
import { ProductCategory, Product, User } from '../types/index.ts';
import { HeroVideoPlayer } from './HeroVideoPlayer.tsx';
import { IntroHero } from './IntroHero.tsx';
import { InstitutionalSeals } from './InstitutionalSeals.tsx';
import { BamlakSisayLogo, BesufkadAnbesLogo } from './FounderLogos.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';

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
  const { t } = useTranslation();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Showcase (Farmland Corridors) */}
      <HeroVideoPlayer
        onExploreMarket={() => onNavigate('marketplace')}
        onOpenRegister={() => onNavigate('register')}
      />

      {/* Verified Agricultural Network Section */}
      <IntroHero onOpenBrand={onOpenBrand} />

      {/* Institutional Regulatory & Settlement Compliance Banner */}
      <InstitutionalSeals variant="banner" />

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
            <h3 className="font-bold text-sm text-zinc-900">{t.home.quickProduceTitle}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t.home.quickProduceDesc}</p>
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
            <h3 className="font-bold text-sm text-zinc-900">{t.home.quickProcurementTitle}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t.home.quickProcurementDesc}</p>
          </button>

          <button
            onClick={() => onNavigate('agent')}
            className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
                <Tractor className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900">{t.home.quickInputsTitle}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t.home.quickInputsDesc}</p>
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
            <h3 className="font-bold text-sm text-zinc-900">{t.home.quickFinanceTitle}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t.home.quickFinanceDesc}</p>
          </button>
        </div>

        {/* Featured Flagship: B2B Agricultural Salvage Exchange & Distressed Harvest Engine */}
        <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-950 to-emerald-950 p-6 sm:p-8 text-white border border-amber-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-amber-400 font-black">⚡</span> {t.home.salvageBadge}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t.home.salvageTitle}
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
              {t.home.salvageSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('salvage')}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs sm:text-sm cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>{t.home.salvageButton}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 Connected Value Chain Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
            {t.home.pillarsBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-2">
            {t.home.pillarsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {t.home.pillarsSubtitle}
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
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">{t.home.pillarFarmersTitle}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.pillarFarmersDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
              {t.home.pillarFarmersLink} <ArrowRight className="h-3.5 w-3.5" />
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
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">{t.home.pillarBuyersTitle}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.pillarBuyersDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-4 flex items-center gap-1">
              {t.home.pillarBuyersLink} <ArrowRight className="h-3.5 w-3.5" />
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
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">{t.home.pillarLogisticsTitle}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.pillarLogisticsDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
              {t.home.pillarLogisticsLink} <ArrowRight className="h-3.5 w-3.5" />
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
              <h3 className="font-bold text-base text-zinc-900 mb-1.5">{t.home.pillarFinanceTitle}</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.pillarFinanceDesc}
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 mt-4 flex items-center gap-1">
              {t.home.pillarFinanceLink} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Featured Fresh Harvests Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-900">{t.home.featuredFreshHarvests}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{t.home.featuredHarvestsSubtitle}</p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {t.home.viewAllListings.replace('{count}', String(featuredProducts.length))}
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
                      <span className="text-base font-black text-zinc-900">{p.pricePerUnitEtb.toLocaleString()} {t.common.currency}</span>
                      <span className="text-xs text-zinc-400"> /{p.unit}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                      {t.home.inspectAndOrder}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leadership & Founding Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.home.leadershipBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {t.home.leadershipTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
            {t.home.leadershipSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Bamlak Sisay */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-7 shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <BamlakSisayLogo size={68} />
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs">
                    {t.home.bamlakRole}
                  </span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-zinc-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                  Bamlak Sisay
                </h3>
                <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                  {t.home.bamlakCredentials}
                </span>
                <span className="text-[11px] font-medium text-zinc-500 block mt-0.5">
                  {t.home.bamlakFocus}
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.bamlakBio}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {t.home.foundingPartner}
              </span>
              <span className="font-bold text-emerald-700">{t.home.locationAddis}</span>
            </div>
          </div>

          {/* Besufkad Anbes */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-7 shadow-xs hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <BesufkadAnbesLogo size={68} />
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/70 shadow-2xs">
                    {t.home.besufkadRole}
                  </span>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-zinc-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                  Besufkad Anbes
                </h3>
                <span className="text-xs font-bold text-blue-700 block mt-0.5">
                  {t.home.besufkadCredentials}
                </span>
                <span className="text-[11px] font-medium text-zinc-500 block mt-0.5">
                  {t.home.besufkadFocus}
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                {t.home.besufkadBio}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                {t.home.foundingPartner}
              </span>
              <span className="font-bold text-blue-700">{t.home.locationAddis}</span>
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
              {t.home.ctaBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.home.ctaTitle}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              {t.home.ctaSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-700/40 transition-all cursor-pointer hover:scale-105 flex items-center gap-2"
              >
                <span>{t.home.ctaGetStarted}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onOpenCallCenter && (
                <button
                  onClick={onOpenCallCenter}
                  className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  <span>{t.home.ctaSupport}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
