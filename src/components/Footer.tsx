import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
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

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenCallCenter?: () => void;
  onOpenSurvey?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCallCenter, onOpenSurvey }) => {
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
                  AgriLink Customer & Farmer Assistance
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  24/7 Live
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Support Desk (0961123330)
              </h3>
              <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                Need assistance with crop listings, order escrow verification, or cold-chain delivery? Call our dedicated multilingual helpline anytime.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:0961123330"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-black shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              <span>Call 0961123330</span>
            </a>

            {onOpenCallCenter && (
              <button
                onClick={onOpenCallCenter}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>Call Center & USSD Desk</span>
              </button>
            )}

            {onOpenSurvey && (
              <button
                onClick={onOpenSurvey}
                className="px-4 py-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>⭐ Rate AgriLink</span>
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
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <img
                src={agrilinkLogo}
                alt="AgriLink Logo"
                className="h-11 w-11 rounded-full object-cover border-2 border-emerald-500 shadow-md shadow-emerald-950 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  AGRI<span className="text-emerald-500">LINK</span>
                </span>
                <span className="block text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
                  Ethiopia & African Agritech
                </span>
              </div>
            </button>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Empowering farmers to trade and transact digitally. AgriLink creates digital solutions and logistical networks that transform the agricultural value chain across Africa.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-500" /> PostgreSQL Secured
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Chapa & CBE Escrow
              </span>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About & Big Picture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  Meet the Team
                </button>
              </li>
              <li>
                <span className="text-zinc-600 cursor-not-allowed">Careers (Hiring)</span>
              </li>
              <li>
                <span className="text-zinc-600 cursor-not-allowed">News & Press</span>
              </li>
            </ul>
          </div>

          {/* By Role & Marketplaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">By Marketplace & Role</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  Fresh Produce Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('inputs')} className="hover:text-white transition-colors cursor-pointer">
                  Inputs & Supplies Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('farmer-portal')} className="hover:text-white transition-colors cursor-pointer">
                  For Farmers: Sell Produce
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('procurement')} className="hover:text-white transition-colors cursor-pointer">
                  For Local & Global Buyers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('finance')} className="hover:text-white transition-colors cursor-pointer">
                  Input Financing Solutions
                </button>
              </li>
            </ul>
          </div>

          {/* Get the App & Direct Support Desk Contact */}
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Support Desk</h4>
              <div className="space-y-1.5">
                <a
                  href="tel:0961123330"
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors block"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-bold text-white">0961123330</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">24/7 Hotline</span>
                </a>
                <a
                  href="mailto:bamlaksisay270@gmail.com"
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 flex items-center justify-between text-zinc-300 hover:text-white transition-colors block"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">bamlaksisay270@gmail.com</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium shrink-0 ml-2">Email</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Operating Hours: 24/7 Mon–Sun</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Bole Commercial Center, Addis Ababa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} AgriLink Agro-Trade Network PLC. All rights reserved.</p>
          <div className="flex flex-wrap gap-6 items-center">
            <span className="text-emerald-400 font-bold">Support Desk (0961123330)</span>
            <span>•</span>
            <span>Ethiopian Birr (ETB) Verified</span>
            <span>•</span>
            <span>Cloud SQL PostgreSQL Grid</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
