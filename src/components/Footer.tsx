import React from 'react';
import { AgriLinkLogo } from './AgriLinkLogo.tsx';
import {
  Sprout,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Truck,
  Building2,
  Lock,
  Headphones,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenCallCenter?: () => void;
  onOpenSurvey?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCallCenter, onOpenSurvey }) => {
  const { t } = useTranslation();

  // Safe fallback to prevent any runtime undefined errors during hot module replacement
  const f = t?.footer || {
    customerAssistance: 'AgriLink Customer & Farmer Assistance',
    liveBadge: '24/7 Live',
    supportDesk: 'Support Desk (0961123330)',
    supportDeskDesc: 'Need assistance with crop listings, order escrow verification, or cold-chain delivery? Call our dedicated multilingual helpline anytime.',
    callNow: 'Call 0961123330',
    callCenterUssd: 'Call Center & USSD Desk',
    rateAgriLink: '⭐ Rate AgriLink',
    brandMission: 'Empowering farmers to trade and transact digitally. AgriLink creates digital solutions and logistical networks that transform the agricultural value chain across Africa.',
    postgresSecured: 'PostgreSQL Secured',
    chapaCbeEscrow: 'Chapa & CBE Escrow',
    company: 'Company',
    home: 'Home',
    aboutBigPicture: 'About & Big Picture',
    meetTeam: 'Meet the Team',
    careers: 'Careers (Hiring)',
    newsPress: 'News & Press',
    byMarketplaceRole: 'By Marketplace & Role',
    freshProduceMarketplace: 'Fresh Produce Marketplace',
    inputsSuppliesMarketplace: 'Inputs & Supplies Marketplace',
    forFarmersSellProduce: 'For Farmers: Sell Produce',
    forBuyers: 'For Local & Global Buyers',
    inputFinancingSolutions: 'Input Financing Solutions',
    directSupportDesk: 'Direct Support Desk',
    hotline247: '24/7 Hotline',
    emailLabel: 'Email',
    operatingHours: 'Operating Hours: 24/7 Mon–Sun',
    location: 'Bole Commercial Center, Addis Ababa',
    allRightsReserved: 'All rights reserved.',
    supportDeskFooter: 'Support Desk (0961123330)',
    birrVerified: 'Ethiopian Birr (ETB) Verified',
    cloudSqlGrid: 'Cloud SQL PostgreSQL Grid',
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Support Desk (0961123330) Highlighted Bottom Banner */}
        <div className="mb-14 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 p-6 sm:p-8 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Headphones className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  {f.customerAssistance}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {f.liveBadge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {f.supportDesk}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                {f.supportDeskDesc}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:0961123330"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              <span>{f.callNow}</span>
            </a>

            {onOpenCallCenter && (
              <button
                onClick={onOpenCallCenter}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>{f.callCenterUssd}</span>
              </button>
            )}

            {onOpenSurvey && (
              <button
                onClick={onOpenSurvey}
                className="px-4 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>{f.rateAgriLink}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-zinc-900">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left group cursor-pointer"
            >
              <AgriLinkLogo size="lg" theme="dark" subtext="Ethiopia & African Agritech" />
            </button>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              {f.brandMission}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-500" /> {f.postgresSecured}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {f.chapaCbeEscrow}
              </span>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{f.company}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  {f.home}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  {f.aboutBigPicture}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  {f.meetTeam}
                </button>
              </li>
              <li>
                <span className="text-zinc-600 cursor-not-allowed">{f.careers}</span>
              </li>
              <li>
                <span className="text-zinc-600 cursor-not-allowed">{f.newsPress}</span>
              </li>
            </ul>
          </div>

          {/* By Role & Marketplaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{f.byMarketplaceRole}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  {f.freshProduceMarketplace}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('inputs')} className="hover:text-white transition-colors cursor-pointer">
                  {f.inputsSuppliesMarketplace}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('farmer-portal')} className="hover:text-white transition-colors cursor-pointer">
                  {f.forFarmersSellProduce}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('procurement')} className="hover:text-white transition-colors cursor-pointer">
                  {f.forBuyers}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('finance')} className="hover:text-white transition-colors cursor-pointer">
                  {f.inputFinancingSolutions}
                </button>
              </li>
            </ul>
          </div>

          {/* Get the App & Direct Support Desk Contact */}
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{f.directSupportDesk}</h4>
              <div className="space-y-1.5">
                <a
                  href="tel:0961123330"
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors block"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-bold text-white">0961123330</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">{f.hotline247}</span>
                </a>
                <a
                  href="mailto:bamlaksisay270@gmail.com"
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors block"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">bamlaksisay270@gmail.com</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-2">{f.emailLabel}</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{f.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>{f.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AgriLink Agro-Trade Network PLC. {f.allRightsReserved}</p>
          <div className="flex flex-wrap gap-6 items-center">
            <span className="text-emerald-400 font-bold">{f.supportDeskFooter}</span>
            <span>•</span>
            <span>{f.birrVerified}</span>
            <span>•</span>
            <span>{f.cloudSqlGrid}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
