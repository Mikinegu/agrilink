import React, { useState, useMemo, useEffect } from 'react';
import {
  DistressedLot,
  Bid,
  NegotiationState,
  ExchangeRole,
  calculateFinancialBreakdown,
  FinancialBreakdown,
  calculateVolumeAdjustedDiscount,
  VOLUME_DISCOUNT_SCHEDULE,
  VolumeDiscountTier,
  getVolumeDiscountTier,
} from '../types/marketplace.ts';
import {
  X,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Building2,
  Tractor,
  Layers,
  Sparkles,
  Boxes,
  Package,
} from 'lucide-react';

interface NegotiationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lot: DistressedLot | null;
  activeRole: ExchangeRole;
  onAcceptBid: (lotId: string, bidId: string, agreedDiscount: number, purchaseVolumeKg?: number) => void;
  onRejectBid: (lotId: string, bidId: string) => void;
  onCounterOffer: (
    lotId: string,
    bidId: string,
    counterDiscount: number,
    notes?: string,
    purchaseVolumeKg?: number
  ) => void;
  onAcceptCounter?: (lotId: string, bidId: string) => void;
}

export const NegotiationDrawer: React.FC<NegotiationDrawerProps> = ({
  isOpen,
  onClose,
  lot,
  activeRole,
  onAcceptBid,
  onRejectBid,
  onCounterOffer,
  onAcceptCounter,
}) => {
  if (!isOpen || !lot) return null;

  // Total lot tonnage available
  const totalLotTons = lot.lotWeightTons || (lot.lotWeightKg ? Number((lot.lotWeightKg / 1000).toFixed(1)) : 18.5);

  // Active or top bid
  const lotBids = lot.bids || [];
  const activeBid: Bid | undefined =
    lotBids.find((b) => b.status === 'SUBMITTED' || b.status === 'COUNTERED') || lotBids[0];

  const initialDiscount = activeBid?.proposedDiscountPercent || lot.farmerDiscountPercent || 40;

  // Selected purchase quantity in Metric Tons
  const [purchaseVolumeTons, setPurchaseVolumeTons] = useState<number>(totalLotTons);

  useEffect(() => {
    if (lot) {
      setPurchaseVolumeTons(lot.lotWeightTons || (lot.lotWeightKg ? Number((lot.lotWeightKg / 1000).toFixed(1)) : 18.5));
    }
  }, [lot?.id, lot?.lotWeightTons, lot?.lotWeightKg]);

  const purchaseVolumeKg = Math.round(purchaseVolumeTons * 1000);

  // Farmer's interactive counter-discount base slider (default e.g. 28%)
  const [counterDiscount, setCounterDiscount] = useState<number>(() => {
    if (lot.activeNegotiation?.counterDiscountPercent) {
      return lot.activeNegotiation.counterDiscountPercent;
    }
    return Math.max(15, initialDiscount - 17);
  });

  const [counterNotes, setCounterNotes] = useState(
    'Brix sugar test confirms high pulp density. Fair volume discount schedule active for full haul clearance.'
  );

  // Volume-adjusted fair discount for counter-offer
  const volumeDiscountInfo = useMemo(() => {
    return calculateVolumeAdjustedDiscount(counterDiscount, purchaseVolumeTons, totalLotTons);
  }, [counterDiscount, purchaseVolumeTons, totalLotTons]);

  const effectiveCounterDiscount = volumeDiscountInfo.effectiveDiscount;
  const volumeBonusDiscount = volumeDiscountInfo.bonusDiscount;
  const currentVolumeTier = volumeDiscountInfo.tier;

  // Volume-adjusted calculation for initial processor offer
  const initialVolumeInfo = useMemo(() => {
    return calculateVolumeAdjustedDiscount(initialDiscount, purchaseVolumeTons, totalLotTons);
  }, [initialDiscount, purchaseVolumeTons, totalLotTons]);

  // Direct Farmer Purchase: When buyer collects at farm-gate, carrier fee is 0 ETB
  const [isDirectFarmerPickup, setIsDirectFarmerPickup] = useState(false);

  // Live real-time financial calculation for the chosen volume & effective discount
  const calculations: FinancialBreakdown = useMemo(() => {
    return calculateFinancialBreakdown(
      purchaseVolumeKg,
      lot.benchmarkPricePerKg,
      effectiveCounterDiscount,
      initialVolumeInfo.effectiveDiscount,
      isDirectFarmerPickup ? 0 : 2.5 // 0 ETB if direct farm-gate pickup
    );
  }, [purchaseVolumeKg, lot.benchmarkPricePerKg, effectiveCounterDiscount, initialVolumeInfo.effectiveDiscount, isDirectFarmerPickup]);

  // Initial proposed offer financial breakdown for the chosen volume
  const initialCalculations: FinancialBreakdown = useMemo(() => {
    return calculateFinancialBreakdown(
      purchaseVolumeKg,
      lot.benchmarkPricePerKg,
      initialVolumeInfo.effectiveDiscount,
      initialVolumeInfo.effectiveDiscount,
      isDirectFarmerPickup ? 0 : 2.5
    );
  }, [purchaseVolumeKg, lot.benchmarkPricePerKg, initialVolumeInfo.effectiveDiscount, isDirectFarmerPickup]);

  const hasCountered = lot.activeNegotiation?.status === 'PENDING_PROCESSOR_REVIEW';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 animate-slide-left border-l border-zinc-200">
        {/* Drawer Header */}
        <div className="p-6 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-400 text-zinc-950">
                LOT #{lot.lotNumber}
              </span>
              <span className="text-xs text-zinc-400">
                {lot.lotWeightTons} MT ({lot.lotWeightKg.toLocaleString()} kg)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h2 className="text-xl font-black text-white">{lot.commodity}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Producer: <span className="text-emerald-400 font-bold">{lot.farmerName}</span> • {lot.farmerOrg}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Industrial Buyer Bid Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-zinc-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 leading-none">
                    {activeBid?.processorOrg || 'RedGold Foods & Puree Ltd.'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Target Processing: {activeBid?.intendedProduct || 'Ketchup & Puree Line'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300 inline-block">
                  Proposed Discount: {initialDiscount}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/60 text-center">
              <div>
                <p className="text-[10px] text-zinc-500">Proposed Unit Price</p>
                <p className="text-xs font-black text-zinc-900">
                  {initialCalculations.pricePerKg.toFixed(2)} ETB/kg
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500">Gross Offer ({purchaseVolumeTons} MT)</p>
                <p className="text-xs font-black text-blue-800">
                  {(initialCalculations.grossTotalEtb).toLocaleString()} ETB
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500">Factory Savings</p>
                <p className="text-xs font-black text-emerald-700">
                  {(initialCalculations.factorySavingsEtb).toLocaleString()} ETB
                </p>
              </div>
            </div>

            {activeBid?.notes && (
              <p className="text-xs text-zinc-600 mt-3 p-2.5 rounded-xl bg-white/80 border border-blue-100 italic">
                "{activeBid.notes}"
              </p>
            )}
          </div>

          {/* Feature: Fair Bulk Volume Discount & Quantity Tier Selector */}
          <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-purple-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <span>Fair Bulk Volume Discount Policy</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200 uppercase font-mono">
                      Dynamic Incentive
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Buyers absorbing larger harvest tonnages receive an automatic progressive volume discount
                  </p>
                </div>
              </div>

              {/* Active Tier Pill */}
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black border self-start sm:self-auto ${currentVolumeTier.badgeClass}`}>
                {currentVolumeTier.volumeLabel} ({volumeBonusDiscount > 0 ? `+${volumeBonusDiscount}% Volume Bonus` : 'Base Discount'})
              </span>
            </div>

            {/* Volume Tiers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VOLUME_DISCOUNT_SCHEDULE.map((tier) => {
                const isActive = currentVolumeTier.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isActive
                        ? 'bg-purple-950/80 border-purple-500 text-white shadow-md ring-1 ring-purple-500/50'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{tier.volumeLabel.split(' ')[0]}</span>
                      <span className="text-[10px] font-black text-amber-400">
                        {tier.bonusDiscountPercent > 0 ? `+${tier.bonusDiscountPercent}% OFF` : 'Base'}
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-1 line-clamp-1">
                      {tier.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Quantity / Volume Selector */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-amber-400" />
                  <span>Procurement Quantity (Metric Tons):</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-700">
                    {purchaseVolumeTons} MT ({purchaseVolumeKg.toLocaleString()} kg)
                  </span>
                  <span className="text-xs text-zinc-400">
                    of {totalLotTons} MT total
                  </span>
                </div>
              </div>

              {/* Volume Slider */}
              <input
                type="range"
                min="1"
                max={totalLotTons}
                step="0.5"
                value={purchaseVolumeTons}
                onChange={(e) => setPurchaseVolumeTons(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              {/* Quick Volume Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] font-bold text-zinc-400">Quick Pick:</span>
                <button
                  type="button"
                  onClick={() => setPurchaseVolumeTons(Number(Math.max(1, totalLotTons * 0.25).toFixed(1)))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    Math.abs(purchaseVolumeTons - totalLotTons * 0.25) < 0.3
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  25% ({Number((totalLotTons * 0.25).toFixed(1))} MT)
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseVolumeTons(Number(Math.max(1, totalLotTons * 0.5).toFixed(1)))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    Math.abs(purchaseVolumeTons - totalLotTons * 0.5) < 0.3
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  50% Half Lot ({Number((totalLotTons * 0.5).toFixed(1))} MT)
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseVolumeTons(Number(Math.max(1, totalLotTons * 0.75).toFixed(1)))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    Math.abs(purchaseVolumeTons - totalLotTons * 0.75) < 0.3
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  75% Fleet ({Number((totalLotTons * 0.75).toFixed(1))} MT)
                </button>
                <button
                  type="button"
                  onClick={() => setPurchaseVolumeTons(totalLotTons)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors flex items-center gap-1 ${
                    purchaseVolumeTons >= totalLotTons * 0.95
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>100% Full Lot Clearance (+10% Bonus)</span>
                </button>
              </div>

              {/* Dynamic Incentive Explanation Banner */}
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                  <p className="text-[11px] text-purple-200">
                    Procuring <strong>{purchaseVolumeTons} MT</strong> qualifies for <strong>{currentVolumeTier.volumeLabel}</strong> ({volumeBonusDiscount > 0 ? `+${volumeBonusDiscount}% extra bulk salvage discount` : 'base standard rate'}).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-zinc-400">Total Effective Discount:</span>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    {effectiveCounterDiscount}% OFF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Feature: 3-Way Counter-Offer Negotiation Engine */}
          <div className="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                Interactive Counter-Offer Engine
              </h3>
              <span className="text-[11px] font-bold text-zinc-400">
                Benchmark: {lot.benchmarkPricePerKg} ETB/kg
              </span>
            </div>

            {/* Slider to Lower or Raise Discount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">
                  Farmer Counter Discount Target (Base):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                    Base: {counterDiscount}%
                  </span>
                  {volumeBonusDiscount > 0 && (
                    <span className="text-xs font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                      +{volumeBonusDiscount}% Bulk Bonus
                    </span>
                  )}
                  <span className="text-sm font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
                    = {effectiveCounterDiscount}% Total
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max={initialDiscount}
                step="1"
                value={counterDiscount}
                onChange={(e) => setCounterDiscount(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>10% (Minimal Concession)</span>
                <span>28% (Fair Sugar Parity)</span>
                <span>{initialDiscount}% (Accept Buyer Offer)</span>
              </div>
            </div>

            {/* Real-time Math Output Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
              <div className="p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/80">
                <p className="text-[10px] text-zinc-400">Adjusted Unit Price</p>
                <p className="text-sm font-black text-white mt-0.5">
                  {calculations.pricePerKg.toFixed(2)} <span className="text-[10px] text-zinc-400 font-normal">ETB/kg</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80">
                <p className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Farmer Added Gain
                </p>
                <p className="text-sm font-black text-emerald-400 mt-0.5">
                  +{calculations.farmerIncrementalGain.toLocaleString()} <span className="text-[10px] font-normal">ETB</span>
                </p>
                <p className="text-[9px] text-emerald-300/70">Retained vs 45% bid</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/80">
                <p className="text-[10px] text-blue-300 font-bold">Factory Savings</p>
                <p className="text-sm font-black text-blue-400 mt-0.5">
                  {calculations.factorySavingsEtb.toLocaleString()} <span className="text-[10px] font-normal">ETB</span>
                </p>
                <p className="text-[9px] text-blue-300/70">vs Grade-A harvest</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/80">
                <p className="text-[10px] text-purple-300 font-bold">Platform Fee (2.5%)</p>
                <p className="text-sm font-black text-purple-400 mt-0.5">
                  {calculations.platformFeeEtb.toLocaleString()} <span className="text-[10px] font-normal">ETB</span>
                </p>
                <p className="text-[9px] text-purple-300/70">Tri-party escrow</p>
              </div>
            </div>

            {/* Direct Farmer Pickup (0 ETB Logistics) Toggle */}
            <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-amber-400" /> Logistics & Carrier Allocation
                </span>
                {isDirectFarmerPickup && (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                    ✓ 0 ETB Logistics (Zero Freight)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectFarmerPickup(true)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isDirectFarmerPickup
                      ? 'border-emerald-500 bg-emerald-950/60 text-white ring-1 ring-emerald-500'
                      : 'border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block text-emerald-400">Direct Farm-Gate Pickup</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Buyer uses own truck. 0 ETB logistics fee.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDirectFarmerPickup(false)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    !isDirectFarmerPickup
                      ? 'border-amber-500 bg-amber-950/60 text-white ring-1 ring-amber-500'
                      : 'border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block text-amber-400">AgriLink Cold-Chain Reefer</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">2.50 ETB/kg carrier allocation</span>
                </button>
              </div>
            </div>

            {/* Tri-Party Escrow Settlement Projection */}
            <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-300">
                <span>Total Escrow Deposit Required (from Buyer):</span>
                <span className="font-bold text-white">
                  {(calculations.grossTotalEtb + calculations.carrierEstimatedFeeEtb).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>• Farmer Net Payout (Post 2.5% Fee):</span>
                <span className="font-semibold text-emerald-400">
                  {calculations.netFarmerPayoutEtb.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 text-[11px]">
                <span>• Carrier Reefer Delivery Allocation:</span>
                <span className={`font-semibold ${isDirectFarmerPickup ? 'text-emerald-400 font-bold' : 'text-amber-400'}`}>
                  {isDirectFarmerPickup ? '0 ETB (Direct Farm-Gate Pickup - Free)' : `${calculations.carrierEstimatedFeeEtb.toLocaleString()} ETB`}
                </span>
              </div>
            </div>

            {/* Counter Offer Notes Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Technical Justification to Processor:
              </label>
              <textarea
                rows={2}
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="State your Brix refractometer reading or firm pulp testing results..."
              />
            </div>
          </div>

          {/* Degradation Countdown Advisory */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-950">
              <p className="font-bold">
                Time Sensitivity: {lot.softRotOnsetHoursRemaining} hours remaining
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Reefer transit takes ~90 mins between Wonji and Dukem Industrial Park. Prompt agreement guarantees zero spoilage penalty.
              </p>
            </div>
          </div>

          {/* Prior Negotiation History Log */}
          {lot.activeNegotiation?.history && lot.activeNegotiation.history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Negotiation Audit Trail
              </h4>
              <div className="space-y-1.5">
                {lot.activeNegotiation.history.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-zinc-900">{step.actor}</span>{' '}
                      <span className="text-zinc-500">({step.role}): {step.action}</span>
                      {step.notes && <p className="text-[10px] text-zinc-500 italic mt-0.5">"{step.notes}"</p>}
                    </div>
                    <span className="text-xs font-black text-zinc-800">
                      {step.discountPercent}% Discount
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Option 2: Decline / Reject */}
          <button
            onClick={() => {
              if (activeBid) onRejectBid(lot.id, activeBid.id);
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <XCircle className="h-4 w-4 text-rose-600" />
            <span>Option 2: Reject Offer</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Option 3: Submit Counter Offer */}
            <button
              onClick={() => {
                if (activeBid) {
                  onCounterOffer(
                    lot.id,
                    activeBid.id,
                    effectiveCounterDiscount,
                    counterNotes,
                    purchaseVolumeKg
                  );
                  onClose();
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="h-4 w-4 text-zinc-950" />
              <span>Option 3: Counter at {effectiveCounterDiscount}% ({purchaseVolumeTons} MT)</span>
            </button>

            {/* Option 1: Accept Terms & Lock Escrow */}
            <button
              onClick={() => {
                if (activeBid) {
                  onAcceptBid(
                    lot.id,
                    activeBid.id,
                    initialVolumeInfo.effectiveDiscount,
                    purchaseVolumeKg
                  );
                  onClose();
                }
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Option 1: Accept {initialVolumeInfo.effectiveDiscount}% ({purchaseVolumeTons} MT) &amp; Dispatch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
