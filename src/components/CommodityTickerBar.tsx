import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Globe2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { CommodityConverterModal } from './CommodityConverterModal.tsx';

interface TickerItem {
  id: string;
  nameKey: string;
  priceEtb: number;
  unitKey: string; // 'perQuintal' | 'perFeresula'
  changePercent: number;
  location: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { id: 'teff', nameKey: 'teffMagna', priceEtb: 9450, unitKey: 'perQuintal', changePercent: 2.4, location: 'Wonji/Bishoftu' },
  { id: 'coffee', nameKey: 'yirgacheffeCoffee', priceEtb: 4850, unitKey: 'perFeresula', changePercent: 1.8, location: 'Gedeo' },
  { id: 'harar', nameKey: 'hararCoffee', priceEtb: 5200, unitKey: 'perFeresula', changePercent: 0.9, location: 'Harar' },
  { id: 'sesame', nameKey: 'humeraSesame', priceEtb: 14200, unitKey: 'perQuintal', changePercent: 3.1, location: 'Humera' },
  { id: 'wheat', nameKey: 'durumWheat', priceEtb: 5800, unitKey: 'perQuintal', changePercent: 1.2, location: 'Bale' },
  { id: 'beans', nameKey: 'redHaricotBeans', priceEtb: 4100, unitKey: 'perQuintal', changePercent: -0.6, location: 'Rift Valley' },
  { id: 'onion', nameKey: 'redOnion', priceEtb: 3600, unitKey: 'perQuintal', changePercent: -1.5, location: 'Meki' },
];

interface CommodityTickerBarProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export const CommodityTickerBar: React.FC<CommodityTickerBarProps> = ({
  variant = 'dark',
  className = '',
}) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const isDark = variant === 'dark';

  return (
    <>
      <div
        className={`w-full text-xs border-y select-none transition-colors duration-200 overflow-hidden ${
          isDark
            ? 'bg-zinc-950 text-zinc-300 border-zinc-800'
            : 'bg-emerald-950 text-emerald-100 border-emerald-900'
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-9">
          {/* Left: Terminal Pulse Badge */}
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-[10px] sm:text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <Globe2 className="h-3 w-3 text-emerald-400" />
              <span>{t.commodityTicker.liveFeedBadge}</span>
            </span>
            <span className="hidden lg:inline-block text-[10px] text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
              {t.commodityTicker.ecxMarketOpen}
            </span>
          </div>

          {/* Center: Live Commodity Carousel / Feed */}
          <div
            className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-6 px-4 cursor-pointer"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onClick={() => setModalOpen(true)}
            title="Click to open Agricultural Unit & Currency Calculator"
          >
            <div className="flex items-center gap-5 sm:gap-7 shrink-0 text-[11px]">
              {TICKER_ITEMS.map((item) => {
                const name = (t.commodityTicker as any)[item.nameKey] || item.id;
                const unit = (t.commodityTicker as any)[item.unitKey] || 'Qt';
                const isPositive = item.changePercent >= 0;

                return (
                  <div key={item.id} className="flex items-center gap-2 group whitespace-nowrap hover:opacity-100 transition-opacity">
                    <span className="font-semibold text-zinc-300 group-hover:text-white">
                      {name}
                    </span>
                    <span className="font-black text-white">
                      {item.priceEtb.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">/{unit}</span>
                    </span>
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="h-2.5 w-2.5 mr-0.5 inline" />
                      )}
                      {isPositive ? `+${item.changePercent}%` : `${item.changePercent}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Unit Converter Launcher */}
          <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-white/10">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
            >
              <Calculator className="h-3 w-3" />
              <span className="hidden sm:inline">{t.commodityTicker.openConverterBtn}</span>
              <span className="sm:hidden">Calculator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CommodityConverterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
