import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import farmTractorSunrise from '../assets/images/farm_tractor_sunrise_1787815703199.jpg';
import farmTractorIrrigation from '../assets/images/farm_tractor_irrigation_1787815687313.jpg';
import digitalProduceApp from '../assets/images/digital_produce_app_1787815717840.jpg';
import ethiopiaGreenhouseFarm from '../assets/images/ethiopia_greenhouse_farm_1787814574646.jpg';
import {
  Sprout,
  ShieldCheck,
  Globe,
  Truck,
  Building2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Linkedin,
  MapPin,
  Package,
  Phone,
  Mail,
  Zap,
  Smartphone,
  Tractor,
} from 'lucide-react';
import { BamlakSisayLogo, BesufkadAnbesLogo } from './FounderLogos.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  const founders = [
    {
      name: t.about.bamlakName,
      role: t.about.bamlakRole,
      logo: <BamlakSisayLogo size={68} />,
      bgGradient: 'from-emerald-700 to-emerald-900',
      bio: t.about.bamlakBio,
      credentials: t.about.bamlakCredentials,
      linkedin: 'https://linkedin.com',
    },
    {
      name: t.about.besufkadName,
      role: t.about.besufkadRole,
      logo: <BesufkadAnbesLogo size={68} />,
      bgGradient: 'from-blue-700 to-blue-900',
      bio: t.about.besufkadBio,
      credentials: t.about.besufkadCredentials,
      linkedin: 'https://linkedin.com',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero / Big Picture */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-zinc-900 to-emerald-900 text-white py-16 sm:py-24 border-b border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                {t.about.heroBadge}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
                {t.about.heroTitle}
              </h1>
              <p className="text-base sm:text-xl text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                {t.about.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                >
                  {t.about.exploreProduce} <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onNavigate('inputs')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Package className="h-4 w-4" /> {t.about.inputsMarketplace}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="relative p-6 rounded-3xl bg-emerald-900/60 border border-emerald-700/50 shadow-2xl backdrop-blur-md text-center max-w-xs">
                <img
                  src={agrilinkLogo}
                  alt={t.about.missionTitle}
                  className="h-40 w-40 rounded-full mx-auto object-cover border-4 border-emerald-400 shadow-2xl mb-4"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-base font-black text-white">{t.about.missionTitle}</h3>
                <p className="text-xs text-emerald-200/80 mt-1">
                  {t.about.missionDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Beliefs & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              {t.about.foundationalBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-snug">
              {t.about.foundationalTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              {t.about.foundationalDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100">
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">{t.about.priceDiscoveryTitle}</h3>
              <p className="text-xs text-zinc-600">
                {t.about.priceDiscoveryDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">{t.about.coldChainTitle}</h3>
              <p className="text-xs text-zinc-600">
                {t.about.coldChainDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900">{t.about.escrowSecurityTitle}</h3>
              <p className="text-xs text-zinc-600">
                {t.about.escrowSecurityDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Central to a Farmer's Existence: Trade & Transact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
            {t.about.ecosystemBadge}
          </span>
          <h2 className="text-3xl font-black text-zinc-900">
            {t.about.ecosystemTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {t.about.ecosystemSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Trade (Buy By Digital) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6 hover:border-emerald-500 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                  <Smartphone className="h-4 w-4 text-emerald-700" /> {t.about.tradeBadge}
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {t.about.tradeTag}
                </span>
              </div>

              {/* Digital Produce App Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 border border-emerald-100 shadow-2xs">
                <img
                  src={digitalProduceApp}
                  alt={t.about.tradeImageCaption}
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                  {t.about.tradeImageCaption}
                </div>
              </div>

              <h3 className="text-xl font-bold text-zinc-900">
                {t.about.tradeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {t.about.tradeDesc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t.about.tradePoint1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t.about.tradePoint2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t.about.tradePoint3}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {t.about.tradeBtn} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card 2: Transact (Farmlands & Inputs) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-6 hover:border-blue-500 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold">
                  <Tractor className="h-4 w-4 text-blue-700" /> {t.about.transactBadge}
                </div>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {t.about.transactTag}
                </span>
              </div>

              {/* Farmland Mechanization Image */}
              <div className="relative rounded-2xl overflow-hidden aspect-16/9 border border-blue-100 shadow-2xs">
                <img
                  src={farmTractorSunrise}
                  alt={t.about.transactImageCaption}
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                  {t.about.transactImageCaption}
                </div>
              </div>

              <h3 className="text-xl font-bold text-zinc-900">
                {t.about.transactTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {t.about.transactDesc}
              </p>
              <ul className="space-y-2 pt-2 text-xs text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{t.about.transactPoint1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{t.about.transactPoint2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{t.about.transactPoint3}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('inputs')}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {t.about.transactBtn} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Meet the Founding Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
            {t.about.teamBadge}
          </span>
          <h2 className="text-3xl font-black text-zinc-900">
            {t.about.teamTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {t.about.teamSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {founder.logo}
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-blue-50 text-zinc-600 hover:text-blue-700 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-black text-zinc-900">{founder.name}</h3>
                  <span className="text-xs font-bold text-emerald-700 block">{founder.role}</span>
                  <span className="text-[11px] font-semibold text-zinc-500 block mt-0.5">{founder.credentials}</span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  {founder.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 font-medium">
                {t.about.foundingPartnerTag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call To Action: Discover the Future of Agriculture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-emerald-950 to-zinc-950 text-white p-8 sm:p-14 border border-emerald-800/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {t.about.ctaTitle}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/80">
              {t.about.ctaSubtitle}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('marketplace')}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-700/40 transition-all cursor-pointer hover:scale-105"
              >
                {t.about.ctaBtn}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

