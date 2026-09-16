import React, { useState, useMemo } from 'react';
import {
  DistressedLot,
  DAMAGE_CAUSE_CONFIG,
  calculateFinancialBreakdown,
  ExchangeRole,
} from '../types/marketplace.ts';
import {
  Building2,
  Sparkles,
  Percent,
  Clock,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  DollarSign,
  Scale,
  MapPin,
  Send,
  Check,
  Search,
  Sliders,
  ShieldCheck,
  X,
} from 'lucide-react';

interface IndustrialBuyerFeedProps {
  lots: DistressedLot[];
  activeRole: ExchangeRole;
  onSubmitBid: (
    lotId: string,
    proposedDiscountPercent: number,
    intendedProduct: string,
    notes: string
  ) => void;
  onOpenNegotiation: (lot: DistressedLot) => void;
  onAcceptCounter?: (lotId: string, bidId: string) => void;
}

export const IndustrialBuyerFeed: React.FC<IndustrialBuyerFeedProps> = ({
  lots,
  activeRole,
  onSubmitBid,
  onOpenNegotiation,
  onAcceptCounter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState('ALL');
  const [minBrixFilter, setMinBrixFilter] = useState(0);

  // Active Bid Submission Popover State
  const [biddingLotId, setBiddingLotId] = useState<string | null>(null);
  const [proposedDiscount, setProposedDiscount] = useState<number>(45);
  const [intendedProduct, setIntendedProduct] = useState('Commercial Tomato Paste (Cold-Break 28-30 °Bx)');
  const [bidNotes, setBidNotes] = useState('Procuring for hot-break ketchup and concentrated paste line. Immediate reefer transport arranged.');

  // Filtering lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchesSearch =
        lot.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.farmerOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lot.variety.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrix = lot.brixRating >= minBrixFilter;

      const matchesProcess =
        selectedProcessFilter === 'ALL' ||
        lot.industrialSuitability.recommendedProcesses.some((p) =>
          p.toLowerCase().includes(selectedProcessFilter.toLowerCase())
        );

      return matchesSearch && matchesBrix && matchesProcess;
    });
  }, [lots, searchQuery, minBrixFilter, selectedProcessFilter]);

  const activeBiddingLot = lots.find((l) => l.id === biddingLotId);

  const biddingCalculation = useMemo(() => {
    if (!activeBiddingLot) return null;
    return calculateFinancialBreakdown(
      activeBiddingLot.lotWeightKg,
      activeBiddingLot.benchmarkPricePerKg,
      proposedDiscount,
      45
    );
  }, [activeBiddingLot, proposedDiscount]);

  const handleSendBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingLotId) return;
    onSubmitBid(biddingLotId, proposedDiscount, intendedProduct, bidNotes);
    setBiddingLotId(null);
  };

  return (
    <div className="space-y-6">
      {/* Feed Filter Strip */}
      <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search industrial salvage lots by crop, variety, or farmer cooperative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 shrink-0">Min Brix:</span>
            <select
              value={minBrixFilter}
              onChange={(e) => setMinBrixFilter(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-700 bg-white"
            >
              <option value={0}>Any Brix</option>
              <option value={4.5}>4.5°Bx +</option>
              <option value={5.5}>5.5°Bx + (High Sugar)</option>
              <option value={8.0}>8.0°Bx + (Citrus / Sweet)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 shrink-0">Application:</span>
            <select
              value={selectedProcessFilter}
              onChange={(e) => setSelectedProcessFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-700 bg-white"
            >
              <option value="ALL">All Industrial Processes</option>
              <option value="Paste">Paste / Puree</option>
              <option value="Ketchup">Ketchup Formulations</option>
              <option value="Juice">Juice Extraction</option>
              <option value="Starch">Starch & Chipping</option>
            </select>
          </div>
        </div>
      </div>

      {/* Industrial Sourcing Lots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLots.map((lot) => {
          const hasBids = lot.bids.length > 0;
          const isPendingCounter = lot.activeNegotiation?.status === 'PENDING_PROCESSOR_REVIEW';
          const isAgreed =
            lot.status === 'LOCKED_IN_ESCROW' ||
            lot.status === 'DISPATCHED' ||
            lot.status === 'IN_TRANSIT' ||
            lot.status === 'SETTLED';

          return (
            <div
              key={lot.id}
              className={`rounded-3xl border overflow-hidden transition-all bg-white shadow-sm hover:shadow-xl flex flex-col justify-between ${
                isPendingCounter
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : isAgreed
                  ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                  : 'border-zinc-200/90 hover:border-blue-400'
              }`}
            >
              <div>
                {/* Lot Header Image & Badges */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={lot.imageUrl}
                    alt={lot.commodity}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Left Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-zinc-950 text-amber-400 border border-amber-400/40 shadow-sm">
                      LOT #{lot.lotNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-900 shadow-sm">
                      {lot.lotWeightTons} MT ({lot.lotWeightKg.toLocaleString()} kg)
                    </span>
                  </div>

                  {/* Top Right Degradation Urgency Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg ${
                        lot.softRotOnsetHoursRemaining <= 24
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-zinc-900/90 text-amber-400 border border-amber-400/30'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {lot.softRotOnsetHoursRemaining}h Shelf-Life
                    </span>
                  </div>

                  {/* Bottom Image Headline */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black leading-tight drop-shadow-md">
                      {lot.commodity}
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium drop-shadow-sm">
                      {lot.variety} • {lot.farmerOrg} ({lot.region})
                    </p>
                  </div>
                </div>

                {/* Industrial Suitability Banner */}
                <div className="p-4 bg-emerald-950/90 text-white border-b border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {lot.industrialSuitability.matchScorePercent}% Industrial Suitability Match
                      </p>
                      <p className="text-[10px] text-emerald-300/80 line-clamp-1">
                        {lot.industrialSuitability.recommendedProcesses.join(' • ')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-zinc-950 text-xs font-black shrink-0">
                    {lot.brixRating}°Bx Sugar
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Observed Defects Grid */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-zinc-700">Observed Defect Profile:</span>
                      <span className="font-black text-rose-600">
                        {lot.defectPercentage}% Defect Rate
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {lot.damageCauses.map((cause) => {
                        const meta = DAMAGE_CAUSE_CONFIG[cause];
                        return (
                          <span
                            key={cause}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                            {meta?.label || cause}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Benchmark & Target Economics */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs">
                    <div>
                      <p className="text-[10px] text-zinc-400">Benchmark Grade-A Price</p>
                      <p className="text-sm font-black text-zinc-900">
                        {lot.benchmarkPricePerKg} ETB / kg
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Total Value: {(lot.totalBenchmarkValue).toLocaleString()} ETB
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Recommended Discount Range</p>
                      <p className="text-sm font-black text-emerald-700">
                        25% – 50% Off Benchmark
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        Saves ~{(lot.totalBenchmarkValue * 0.4).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>

                  {/* Active Bids Status Callout */}
                  {isPendingCounter ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-900 flex items-center gap-1">
                          <Sliders className="h-3.5 w-3.5 text-amber-600" />
                          Farmer Counter-Offer Received!
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-black bg-amber-400 text-zinc-950 text-[11px]">
                          {lot.activeNegotiation?.counterDiscountPercent}% Discount
                        </span>
                      </div>
                      <p className="text-zinc-600 text-[11px]">
                        Farmer agreed to lower discount to{' '}
                        <strong>{lot.activeNegotiation?.counterDiscountPercent}%</strong> ({lot.activeNegotiation?.unitPricePerKg} ETB/kg).
                      </p>
                      {onAcceptCounter && lot.activeNegotiation?.bidId && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => onAcceptCounter(lot.id, lot.activeNegotiation!.bidId)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Accept Farmer Counter & Escrow Lock
                          </button>
                        </div>
                      )}
                    </div>
                  ) : hasBids ? (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-blue-950">Active Offer Submitted:</span>
                        <p className="text-[11px] text-blue-800">
                          {lot.bids[0].proposedDiscountPercent}% Discount ({lot.bids[0].offeredPricePerKg} ETB/kg)
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-200 text-blue-900">
                        {lot.bids[0].status}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <button
                  onClick={() => onOpenNegotiation(lot)}
                  className="text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                  <span>View Negotiation Engine</span>
                </button>

                {!isAgreed && (
                  <button
                    onClick={() => {
                      setBiddingLotId(lot.id);
                      setIntendedProduct(lot.industrialSuitability.recommendedProcesses[0] || 'Tomato Paste');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md shadow-blue-900/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Submit Processor Bid</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {isAgreed && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Locked in Escrow
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popover Bid Submission Modal */}
      {biddingLotId && activeBiddingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  Submit Industrial Discount Bid
                </h3>
                <p className="text-xs text-zinc-500">
                  {activeBiddingLot.commodity} • {activeBiddingLot.lotWeightTons} MT
                </p>
              </div>
              <button
                onClick={() => setBiddingLotId(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendBid} className="space-y-4">
              {/* Proposed Discount Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800">
                    Proposed Discount Percentage:
                  </label>
                  <span className="text-sm font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {proposedDiscount}% Discount
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  step="1"
                  value={proposedDiscount}
                  onChange={(e) => setProposedDiscount(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                  <span>15% (Light Concession)</span>
                  <span>45% (Standard Processing Mash)</span>
                  <span>70% (Deep Salvage)</span>
                </div>
              </div>

              {/* Real-time Math Summary */}
              {biddingCalculation && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-600">
                    <span>Offered Unit Price:</span>
                    <span className="font-bold text-zinc-900">
                      {biddingCalculation.pricePerKg} ETB / kg (vs {activeBiddingLot.benchmarkPricePerKg} ETB)
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Total Gross Purchase:</span>
                    <span className="font-bold text-blue-700">
                      {biddingCalculation.grossTotalEtb.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Factory Net Savings:</span>
                    <span className="font-bold text-emerald-600">
                      {biddingCalculation.factorySavingsEtb.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              )}

              {/* Target Industrial Product Line */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Target Food Processing Line:
                </label>
                <input
                  type="text"
                  value={intendedProduct}
                  onChange={(e) => setIntendedProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Procurement Notes */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Procurement Term / Logistics Commitments:
                </label>
                <textarea
                  rows={2}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBiddingLotId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-900/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transmit Discount Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
