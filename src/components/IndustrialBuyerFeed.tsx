import React, { useState, useMemo } from 'react';
import {
  DistressedLot,
  DAMAGE_CAUSE_CONFIG,
  calculateFinancialBreakdown,
  ExchangeRole,
  calculateVolumeAdjustedDiscount,
  VOLUME_DISCOUNT_SCHEDULE,
  VolumeDiscountTier,
  getVolumeDiscountTier,
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
  Boxes,
  Truck,
  TrendingDown,
} from 'lucide-react';

interface IndustrialBuyerFeedProps {
  lots: DistressedLot[];
  activeRole: ExchangeRole;
  onSubmitBid: (
    lotId: string,
    proposedDiscountPercent: number,
    intendedProduct: string,
    notes: string,
    purchaseVolumeKg?: number
  ) => void;
  onOpenNegotiation: (lot: DistressedLot) => void;
  onAcceptCounter?: (lotId: string, bidId: string) => void;
  onInstantBuyAtFarmerDiscount?: (
    lot: DistressedLot,
    purchaseVolumeKg?: number,
    effectiveDiscount?: number
  ) => void;
}

export const IndustrialBuyerFeed: React.FC<IndustrialBuyerFeedProps> = ({
  lots = [],
  activeRole,
  onSubmitBid,
  onOpenNegotiation,
  onAcceptCounter,
  onInstantBuyAtFarmerDiscount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState('ALL');
  const [minBrixFilter, setMinBrixFilter] = useState(0);

  // Buyer's selected purchase volume per lot (in Metric Tons)
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, number>>({});

  const getLotPurchaseVolume = (lot: DistressedLot) => {
    const totalTons = lot.lotWeightTons || (lot.lotWeightKg ? Number((lot.lotWeightKg / 1000).toFixed(1)) : 10);
    return selectedVolumes[lot.id] ?? totalTons;
  };

  const setLotPurchaseVolume = (lotId: string, tons: number) => {
    setSelectedVolumes((prev) => ({ ...prev, [lotId]: tons }));
  };

  // Active Bid Submission Popover State
  const [biddingLotId, setBiddingLotId] = useState<string | null>(null);
  const [proposedDiscount, setProposedDiscount] = useState<number>(45);
  const [intendedProduct, setIntendedProduct] = useState('Commercial Tomato Paste (Cold-Break 28-30 °Bx)');
  const [bidNotes, setBidNotes] = useState('Procuring for hot-break ketchup and concentrated paste line. Immediate reefer transport arranged.');

  // Safe Filtering lots without risk of undefined errors
  const filteredLots = useMemo(() => {
    return (lots || []).filter((lot) => {
      const commodity = (lot.commodity || '').toLowerCase();
      const farmerOrg = (lot.farmerOrg || '').toLowerCase();
      const variety = (lot.variety || '').toLowerCase();
      const search = searchQuery.toLowerCase();

      const matchesSearch =
        commodity.includes(search) ||
        farmerOrg.includes(search) ||
        variety.includes(search);

      const matchesBrix = (lot.brixRating || 0) >= minBrixFilter;

      const processes = lot.industrialSuitability?.recommendedProcesses || [];
      const matchesProcess =
        selectedProcessFilter === 'ALL' ||
        processes.some((p) => (p || '').toLowerCase().includes(selectedProcessFilter.toLowerCase()));

      return matchesSearch && matchesBrix && matchesProcess;
    });
  }, [lots, searchQuery, minBrixFilter, selectedProcessFilter]);

  const activeBiddingLot = lots.find((l) => l.id === biddingLotId);
  const activeBiddingTons = activeBiddingLot ? getLotPurchaseVolume(activeBiddingLot) : 10;
  const activeBiddingKg = Math.round(activeBiddingTons * 1000);

  const biddingCalculation = useMemo(() => {
    if (!activeBiddingLot) return null;
    return calculateFinancialBreakdown(
      activeBiddingKg,
      activeBiddingLot.benchmarkPricePerKg,
      proposedDiscount,
      45
    );
  }, [activeBiddingLot, proposedDiscount, activeBiddingKg]);

  const handleSendBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingLotId) return;
    onSubmitBid(biddingLotId, proposedDiscount, intendedProduct, bidNotes, activeBiddingKg);
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
            lot.status === 'ARRIVED_AT_GATE' ||
            lot.status === 'SETTLED';
          const baseFarmerDiscount = lot.farmerDiscountPercent || 35;
          const benchmarkPrice = Number(lot.benchmarkPricePerKg || 80);
          const totalLotWeightKg = Number(lot.lotWeightKg || 10000);
          const totalLotTons = lot.lotWeightTons || Number((totalLotWeightKg / 1000).toFixed(1));

          // Buyer's selected purchase volume for this lot
          const selectedTons = getLotPurchaseVolume(lot);
          const purchaseWeightKg = Math.round(selectedTons * 1000);

          // Calculate Fair Volume Discount (More volume bought = More discount)
          const volumeInfo = calculateVolumeAdjustedDiscount(
            baseFarmerDiscount,
            selectedTons,
            totalLotTons
          );
          const effectiveDiscount = volumeInfo.effectiveDiscount;
          const volumeBonusPercent = volumeInfo.volumeBonusPercent;
          const activeTier = volumeInfo.activeTier;

          const discountedPrice = Number((benchmarkPrice * (1 - effectiveDiscount / 100)).toFixed(2));
          const totalOrderPayable = Math.round(purchaseWeightKg * discountedPrice);
          const totalBenchmarkVal = Math.round(purchaseWeightKg * benchmarkPrice);
          const factorySavings = totalBenchmarkVal - totalOrderPayable;
          const shelfLifeHours = Number(lot.softRotOnsetHoursRemaining || 36);
          const damageCauses = Array.isArray(lot.damageCauses) ? lot.damageCauses : ['SUNSCALD'];
          const suitability = lot.industrialSuitability || {
            matchScorePercent: 95,
            recommendedProcesses: ['Commercial Tomato Paste & Puree', 'Ketchup & Cooking Sauces'],
          };

          return (
            <div
              key={lot.id}
              className={`rounded-3xl border overflow-hidden transition-all bg-white shadow-sm hover:shadow-xl flex flex-col justify-between ${
                isPendingCounter
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : isAgreed
                  ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                  : 'border-zinc-200/90 hover:border-emerald-500'
              }`}
            >
              <div>
                {/* Lot Header Image & Badges */}
                <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={lot.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                    alt={lot.commodity}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Left Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-zinc-950 text-amber-400 border border-amber-400/40 shadow-sm">
                      LOT #{lot.lotNumber || lot.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-zinc-900 shadow-sm">
                      {totalLotTons} MT Total Lot
                    </span>
                  </div>

                  {/* Top Right: Farmer Discount Highlight Badge */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-lg flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Farmer Asking: -{baseFarmerDiscount}% OFF
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                        shelfLifeHours <= 24
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-zinc-950/80 text-amber-400 border border-amber-400/30'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {shelfLifeHours}h Shelf-Life
                    </span>
                  </div>

                  {/* Bottom Image Headline */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black leading-tight drop-shadow-md">
                      {lot.commodity || 'Distressed Crop'}
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium drop-shadow-sm">
                      {lot.variety} &bull; {lot.farmerOrg} ({lot.region})
                    </p>
                  </div>
                </div>

                {/* Industrial Suitability Banner */}
                <div className="p-3.5 bg-emerald-950/90 text-white border-b border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight">
                        {suitability.matchScorePercent || 95}% Industrial Processing Match
                      </p>
                      <p className="text-[10px] text-emerald-300/80 truncate">
                        {(suitability.recommendedProcesses || []).join(' &bull; ')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-zinc-950 text-xs font-black shrink-0">
                    {lot.brixRating || 5.8}&deg;Bx Sugar
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3.5">
                  {/* Farmer Condition Note (Why it's distressed but suitable) */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        Harvest Distress Condition:
                      </span>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        {lot.defectPercentage || 30}% Surface Defect
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950 leading-relaxed">
                      {lot.conditionSummary || 'Surface cosmetic defects only; pulp sugars and acidity are 100% prime for industrial processing.'}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {damageCauses.map((cause) => {
                        const meta = DAMAGE_CAUSE_CONFIG[cause];
                        return (
                          <span
                            key={cause}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-amber-900 border border-amber-300"
                          >
                            {meta?.label || cause}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fair Bulk Volume Procurement Selector */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-zinc-300">
                        <Boxes className="h-4 w-4 text-emerald-400" />
                        Select Procurement Volume:
                      </span>
                      <span className="font-mono text-emerald-400 font-black">
                        {selectedTons} MT ({purchaseWeightKg.toLocaleString()} kg)
                      </span>
                    </div>

                    {/* Quick Preset Buttons (25%, 50%, 75%, 100% Full Clearance) */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: '25%', tons: Math.max(1, Number((totalLotTons * 0.25).toFixed(1))) },
                        { label: '50%', tons: Math.max(2, Number((totalLotTons * 0.5).toFixed(1))) },
                        { label: '75%', tons: Math.max(3, Number((totalLotTons * 0.75).toFixed(1))) },
                        { label: '100% Full', tons: totalLotTons },
                      ].map((preset) => {
                        const isSelected = Math.abs(selectedTons - preset.tons) < 0.15;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setLotPurchaseVolume(lot.id, preset.tons)}
                            className={`py-1.5 px-1 rounded-xl text-[11px] font-black cursor-pointer transition-all border text-center ${
                              isSelected
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            {preset.label} ({preset.tons} MT)
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Fair Bulk Tier & Bonus Indicator */}
                    <div className="flex items-center justify-between pt-1.5 text-[11px] border-t border-zinc-800/80">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{activeTier.volumeLabel || activeTier.name}</span>
                      </div>
                      {volumeBonusPercent > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          +{volumeBonusPercent}% Bulk Rescue Discount
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">Base Farmer Discount</span>
                      )}
                    </div>
                  </div>

                  {/* Benchmark vs Effective Discounted Price Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-50 to-emerald-50/50 border-2 border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Effective Price ({selectedTons} MT):
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Saves {factorySavings.toLocaleString()} ETB ({effectiveDiscount}% OFF)
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-zinc-400 line-through mr-1.5 font-medium">
                          {benchmarkPrice} ETB/kg
                        </span>
                        <span className="text-xl font-black text-emerald-800 font-mono">
                          {discountedPrice} ETB
                        </span>
                        <span className="text-[11px] text-zinc-600 font-medium"> / kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block">Total ({selectedTons} MT):</span>
                        <span className="text-sm font-black text-zinc-950 font-mono">
                          {totalOrderPayable.toLocaleString()} ETB
                        </span>
                      </div>
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
                            type="button"
                            onClick={() => onAcceptCounter(lot.id, lot.activeNegotiation!.bidId)}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            Accept Farmer Counter &amp; Escrow Lock
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

              {/* Card Footer Actions: 1-Click Buy Now at Fair Volume Discount + Custom Bid */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50 space-y-2">
                {!isAgreed ? (
                  <div className="space-y-2">
                    {/* Primary Button: 1-Click Buy Now with Fair Bulk Volume Discount */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onInstantBuyAtFarmerDiscount) {
                          onInstantBuyAtFarmerDiscount(lot, purchaseWeightKg, effectiveDiscount);
                        } else {
                          onSubmitBid(
                            lot.id,
                            effectiveDiscount,
                            suitability.recommendedProcesses?.[0] || 'Industrial Processing',
                            `Volume purchase of ${selectedTons} MT at fair ${effectiveDiscount}% discount.`,
                            purchaseWeightKg
                          );
                        }
                      }}
                      className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-md shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>
                        Buy {selectedTons} MT at {effectiveDiscount}% OFF ({discountedPrice} ETB/kg)
                      </span>
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenNegotiation(lot)}
                        className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="h-3 w-3 text-zinc-500" />
                        <span>Negotiation Math</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBiddingLotId(lot.id);
                          setProposedDiscount(Math.min(60, baseFarmerDiscount + 10));
                          setIntendedProduct(suitability.recommendedProcesses?.[0] || 'Tomato Paste');
                        }}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer flex items-center gap-1"
                      >
                        <span>Propose Counter-Discount &rarr;</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Locked in Escrow &bull; Cold-Chain Dispatched
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenNegotiation(lot)}
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                    >
                      View Details &rarr;
                    </button>
                  </div>
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
