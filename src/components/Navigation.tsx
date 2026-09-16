import React from 'react';
import {
  ExchangeRole,
  PERSONA_PROFILES,
  PersonaProfile,
  DistressedLot,
} from '../types/marketplace.ts';
import {
  Tractor,
  Building2,
  Truck,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

interface NavigationProps {
  currentRole: ExchangeRole;
  onSelectRole: (role: ExchangeRole) => void;
  activeTab: 'inventory' | 'sourcing' | 'logistics' | 'escrow';
  onSelectTab: (tab: 'inventory' | 'sourcing' | 'logistics' | 'escrow') => void;
  onOpenListingModal: () => void;
  lots: DistressedLot[];
  onResetData?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  onOpenListingModal,
  lots,
  onResetData,
}) => {
  const activeProfile = PERSONA_PROFILES[currentRole];

  // Role perspective statistics
  const openLotsCount = lots.filter(
    (l) => l.status === 'OPEN_FOR_BIDS' || l.status === 'BID_SUBMITTED' || l.status === 'COUNTER_OFFER_PENDING'
  ).length;

  const urgentExpiryCount = lots.filter(
    (l) => l.softRotOnsetHoursRemaining <= 24 && l.status !== 'SETTLED' && l.status !== 'DECLINED'
  ).length;

  const activeDispatchesCount = lots.filter(
    (l) => l.status === 'DISPATCHED' || l.status === 'IN_TRANSIT' || l.status === 'ARRIVED_AT_GATE'
  ).length;

  const escrowLockedTotal = lots.reduce((acc, l) => {
    if (l.escrowVault && l.escrowVault.escrowStatus !== 'DISBURSED') {
      return acc + l.escrowVault.totalDepositedEtb;
    }
    return acc;
  }, 0);

  return (
    <header className="bg-zinc-950 text-white border-b border-zinc-800/80 sticky top-0 z-30 shadow-2xl">
      {/* ── 1. Global Persona Switcher Bar ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Mission Tag */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white">
                  AGRILINK <span className="text-amber-400 font-extrabold">SALVAGE EXCHANGE</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  B-Grade & Distressed Desk
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-none mt-0.5">
                Connecting smallholder harvest salvage directly to food processing plants with escrow-guaranteed discounts
              </p>
            </div>
          </div>

          {/* Perspective Selector (The 4 Simulated Personas) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner overflow-x-auto">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Role:
            </span>

            {/* Farmer Persona */}
            <button
              onClick={() => {
                onSelectRole('FARMER');
                onSelectTab('inventory');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentRole === 'FARMER'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Tractor className="h-3.5 w-3.5" />
              <span>Farmer (Wonji)</span>
            </button>

            {/* Processor Persona */}
            <button
              onClick={() => {
                onSelectRole('PROCESSOR');
                onSelectTab('sourcing');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentRole === 'PROCESSOR'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Processor (RedGold)</span>
            </button>

            {/* Carrier Persona */}
            <button
              onClick={() => {
                onSelectRole('CARRIER');
                onSelectTab('logistics');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentRole === 'CARRIER'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Reefer Fleet (Swift)</span>
            </button>

            {/* Arbiter Persona */}
            <button
              onClick={() => {
                onSelectRole('ARBITER');
                onSelectTab('escrow');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                currentRole === 'ARBITER'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Escrow Arbiter</span>
            </button>
          </div>
        </div>

        {/* ── 2. Active Persona Bio & Operational Telemetry Strip ───────────── */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/40 rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <img
              src={activeProfile.avatarUrl}
              alt={activeProfile.name}
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-bold text-white leading-none">
                  {activeProfile.name}
                </h2>
                <span className="text-[11px] text-zinc-400 font-medium">
                  • {activeProfile.organization}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${activeProfile.badgeColor}`}>
                  {activeProfile.badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                {activeProfile.description}
              </p>
            </div>
          </div>

          {/* Quick Context Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {currentRole === 'FARMER' && (
              <button
                onClick={onOpenListingModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer shadow-lg shadow-emerald-950"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Log Distressed Harvest</span>
              </button>
            )}

            {onResetData && (
              <button
                onClick={onResetData}
                title="Reset simulation lots and negotiations to baseline"
                className="p-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. Operational Navigation Tabs ─────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <button
            onClick={() => onSelectTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Tractor className="h-3.5 w-3.5 text-emerald-600" />
            <span>Distressed Harvest Desk</span>
            {openLotsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-700">
                {openLotsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('sourcing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'sourcing'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
            <span>Industrial Processing Feed</span>
            {urgentExpiryCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" /> {urgentExpiryCount} Urgent
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('logistics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'logistics'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Truck className="h-3.5 w-3.5 text-amber-500" />
            <span>Cold-Chain Fleet & Telematics</span>
            {activeDispatchesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400">
                {activeDispatchesCount} Live
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('escrow')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'escrow'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
            <span>Tri-Party Escrow Vault</span>
            {escrowLockedTotal > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300">
                {(escrowLockedTotal / 1000).toFixed(0)}k ETB
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
