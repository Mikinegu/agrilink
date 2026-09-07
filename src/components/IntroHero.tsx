import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import { ShieldCheck } from 'lucide-react';

interface IntroHeroProps {
  onOpenBrand?: () => void;
}

export const IntroHero: React.FC<IntroHeroProps> = ({ onOpenBrand }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] bg-gradient-to-b from-zinc-950 via-zinc-900 to-emerald-950 text-white p-6 sm:p-8 lg:p-10 border border-emerald-500/20 shadow-xl shadow-zinc-900/10">
        {/* Dynamic ambient lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -mt-20"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Top Brand Header */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              onClick={onOpenBrand}
              className={`shrink-0 ${onOpenBrand ? 'cursor-pointer hover:opacity-90 transition-opacity' : 'cursor-default'}`}
              title={onOpenBrand ? 'View AgriLink Brand & Credentials' : undefined}
            >
              <img
                src={agrilinkLogo}
                alt="AgriLink Emblem"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-xl shadow-emerald-950/60 bg-white"
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                VERIFIED AGRICULTURAL NETWORK
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mt-1">
                AGRILINK ETHIOPIA
              </h2>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1">
                Direct Farmer-to-Buyer Commerce • Cold-Chain Logistics • Agri-Finance
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-4xl">
            Connecting smallholder farmers, commercial buyers, cold-chain transport, and digital escrow payments across Ethiopia for transparent, high-yield agricultural trade.
          </p>

          {/* 4 Feature Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
            <div className="bg-zinc-900/80 border border-zinc-800/90 p-4 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
              <p className="text-lg sm:text-xl font-black text-emerald-400">Direct Trade</p>
              <p className="text-xs text-zinc-400 mt-1">Fair Farm-Gate Prices</p>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/90 p-4 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
              <p className="text-lg sm:text-xl font-black text-emerald-400">100% Escrow</p>
              <p className="text-xs text-zinc-400 mt-1">Telebirr & CBE Birr</p>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/90 p-4 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
              <p className="text-lg sm:text-xl font-black text-emerald-400">Cold Chain</p>
              <p className="text-xs text-zinc-400 mt-1">Fresh Regional Corridors</p>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800/90 p-4 rounded-2xl backdrop-blur-xs hover:border-emerald-500/40 transition-colors">
              <p className="text-lg sm:text-xl font-black text-emerald-400">Input Loans</p>
              <p className="text-xs text-zinc-400 mt-1">Awash Bank Backed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
