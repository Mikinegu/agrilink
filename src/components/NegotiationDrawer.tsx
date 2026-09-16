import React, { useState, useMemo } from 'react';
import {
  DistressedLot,
  Bid,
  NegotiationState,
  ExchangeRole,
  calculateFinancialBreakdown,
  FinancialBreakdown,
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
} from 'lucide-react';

interface NegotiationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lot: DistressedLot | null;
  activeRole: ExchangeRole;
  onAcceptBid: (lotId: string, bidId: string, agreedDiscount: number) => void;
  onRejectBid: (lotId: string, bidId: string) => void;
  onCounterOffer: (
    lotId: string,
    bidId: string,
    counterDiscount: number,
    notes?: string
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

  // Active or top bid
  const activeBid: Bid | undefined =
    lot.bids.find((b) => b.status === 'SUBMITTED' || b.status === 'COUNTERED') || lot.bids[0];

  const initialDiscount = activeBid?.proposedDiscountPercent || 45;

  // Farmer's interactive counter-discount slider (default e.g. 28%)
  const [counterDiscount, setCounterDiscount] = useState<number>(() => {
    if (lot.activeNegotiation?.counterDiscountPercent) {
      return lot.activeNegotiation.counterDiscountPercent;
    }
    // Default to a reasonable counter (e.g., halfway or 28%)
    return Math.max(15, initialDiscount - 17);
  });

  const [counterNotes, setCounterNotes] = useState(
    'Brix sugar test confirms 5.8°Bx with 100% thick pulp integrity. Proposing 28% salvage discount.'
  );

  // Live real-time financial calculation
  const calculations: FinancialBreakdown = useMemo(() => {
    return calculateFinancialBreakdown(
      lot.lotWeightKg,
      lot.benchmarkPricePerKg,
      counterDiscount,
      initialDiscount,
      2.5 // carrier fee estimate
    );
  }, [lot.lotWeightKg, lot.benchmarkPricePerKg, counterDiscount, initialDiscount]);

  // Initial proposed offer financial breakdown
  const initialCalculations: FinancialBreakdown = useMemo(() => {
    return calculateFinancialBreakdown(
      lot.lotWeightKg,
      lot.benchmarkPricePerKg,
      initialDiscount,
      initialDiscount,
      2.5
    );
  }, [lot.lotWeightKg, lot.benchmarkPricePerKg, initialDiscount]);

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
                <p className="text-[10px] text-zinc-500">Proposed Price</p>
                <p className="text-xs font-black text-zinc-900">
                  {initialCalculations.pricePerKg.toFixed(2)} ETB/kg
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500">Gross Offer</p>
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
                  Farmer Counter Discount Target:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-lg border border-amber-400/30">
                    {counterDiscount}% Discount
                  </span>
                  <span className="text-xs text-zinc-400">
                    ({initialDiscount - counterDiscount > 0 ? `-${initialDiscount - counterDiscount}% from offer` : 'matching offer'})
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
                <span className="font-semibold text-amber-400">
                  {calculations.carrierEstimatedFeeEtb.toLocaleString()} ETB
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
                  onCounterOffer(lot.id, activeBid.id, counterDiscount, counterNotes);
                  onClose();
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="h-4 w-4 text-zinc-950" />
              <span>Option 3: Counter at {counterDiscount}%</span>
            </button>

            {/* Option 1: Accept Terms & Lock Escrow */}
            <button
              onClick={() => {
                if (activeBid) {
                  onAcceptBid(lot.id, activeBid.id, initialDiscount);
                  onClose();
                }
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-lg shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Option 1: Accept {initialDiscount}% & Dispatch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
