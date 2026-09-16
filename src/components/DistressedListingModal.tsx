import React, { useState, useMemo } from 'react';
import {
  DamageCause,
  DAMAGE_CAUSE_CONFIG,
  DistressedLot,
  calculateSuitability,
} from '../types/marketplace.ts';
import {
  X,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  Percent,
  Scale,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface DistressedListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLot: (lot: Omit<DistressedLot, 'id' | 'createdAt' | 'bids' | 'status'>) => void;
  farmerName?: string;
  farmerOrg?: string;
  region?: string;
}

export const DistressedListingModal: React.FC<DistressedListingModalProps> = ({
  isOpen,
  onClose,
  onSubmitLot,
  farmerName = 'Ato Bekele Tadesse',
  farmerOrg = 'Wonji Horizon Cooperative Farms',
  region = 'Oromia (East Shewa)',
}) => {
  // Form State
  const [commodity, setCommodity] = useState('Roma Processing Tomatoes');
  const [variety, setVariety] = useState('Heinz 1015 Hybrid');
  const [category, setCategory] = useState<'VEGETABLE' | 'FRUIT' | 'TUBER' | 'GRAIN'>('VEGETABLE');
  const [weightTons, setWeightTons] = useState(18.5);
  const [benchmarkPricePerKg, setBenchmarkPricePerKg] = useState(85.0);
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCauses, setSelectedCauses] = useState<DamageCause[]>(['SUNSCALD', 'SKIN_SPLITTING']);
  const [defectPercentage, setDefectPercentage] = useState(38);
  const [brixRating, setBrixRating] = useState(5.8);
  const [acidityPh, setAcidityPh] = useState(4.25);
  const [locationDetails, setLocationDetails] = useState('Wonji Gefersa Packhouse Hub #3');

  // Calculate Degradation Countdown Hours
  // Higher defect % and sunscald/splitting accelerate soft rot
  const calculatedShelfLifeHours = useMemo(() => {
    let baseHours = 72; // baseline for fresh tomatoes
    if (category === 'FRUIT') baseHours = 96;
    if (category === 'TUBER') baseHours = 240;

    const penaltyFromDefect = (defectPercentage / 100) * 36;
    let multiplier = 1.0;
    if (selectedCauses.includes('SKIN_SPLITTING')) multiplier *= 0.7; // open wound
    if (selectedCauses.includes('SUNSCALD')) multiplier *= 0.85;
    if (selectedCauses.includes('TRANSIT_BRUISING')) multiplier *= 0.8;

    const remaining = Math.max(12, Math.round((baseHours - penaltyFromDefect) * multiplier));
    return remaining;
  }, [category, defectPercentage, selectedCauses]);

  // Live Industrial Suitability preview
  const suitability = useMemo(() => {
    return calculateSuitability(commodity, brixRating, defectPercentage, selectedCauses);
  }, [commodity, brixRating, defectPercentage, selectedCauses]);

  if (!isOpen) return null;

  const toggleCause = (cause: DamageCause) => {
    setSelectedCauses((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : [...prev, cause]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightKg = Math.round(weightTons * 1000);
    const totalBenchmarkValue = weightKg * benchmarkPricePerKg;

    onSubmitLot({
      lotNumber: `SALV-${Date.now().toString().slice(-6)}`,
      farmerId: 1,
      farmerName,
      farmerOrg,
      region,
      locationDetails,
      commodity,
      variety,
      category,
      lotWeightTons: weightTons,
      lotWeightKg: weightKg,
      benchmarkPricePerKg,
      totalBenchmarkValue,
      harvestDate,
      damageCauses: selectedCauses.length ? selectedCauses : ['SUNSCALD'],
      defectPercentage,
      brixRating,
      acidityPh,
      initialShelfLifeHours: calculatedShelfLifeHours + 12,
      softRotOnsetHoursRemaining: calculatedShelfLifeHours,
      industrialSuitability: suitability,
      imageUrl:
        category === 'VEGETABLE'
          ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
          : category === 'FRUIT'
          ? 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 p-6 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Distressed & Salvage Harvest Intake Form
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  B-Grade Desk
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Log hail-damaged, split-skin, or sunscalded crops for fast-track discount bidding by industrial processors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Commodity Specifications */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              1. Commodity & Volume Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Commodity Name
                </label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Roma Processing Tomatoes"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Crop Variety
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Heinz 1015 Hybrid"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="VEGETABLE">Vegetable (Tomato, Pepper, Onion)</option>
                  <option value="FRUIT">Fruit (Citrus, Mango, Avocado)</option>
                  <option value="TUBER">Tuber (Potato, Cassava)</option>
                  <option value="GRAIN">Grain / Pulse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Lot Weight (Metric Tons)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-zinc-400">
                    MT ({(weightTons * 1000).toLocaleString()} kg)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Benchmark Grade-A Price (ETB / kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="5"
                    value={benchmarkPricePerKg}
                    onChange={(e) => setBenchmarkPricePerKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-zinc-400">
                    ETB/kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Harvest Date
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Defect Profiler & Quality Metrics */}
          <div className="pt-4 border-t border-zinc-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-amber-500" />
              2. Defect Profiler & Chemical Solids (°Bx)
            </h3>

            {/* Damage Causes Tag Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Observed Physical Defect Causes (Multi-Select)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(DAMAGE_CAUSE_CONFIG).map((meta) => {
                  const isChecked = selectedCauses.includes(meta.code);
                  return (
                    <button
                      key={meta.code}
                      type="button"
                      onClick={() => toggleCause(meta.code)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-xs'
                          : 'bg-zinc-50/70 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{meta.label}</span>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                        {meta.industrialImpact}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders: Defect % and Brix refractometer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80">
              {/* Defect Percentage Slider */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800">
                    Defect Severity Level: <span className="text-rose-600 text-sm font-black">{defectPercentage}%</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {defectPercentage <= 25 ? 'Minor Cosmetic Blemish' : defectPercentage <= 50 ? 'Moderate Split / Scald' : 'Heavy Salvage Grade'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={defectPercentage}
                  onChange={(e) => setDefectPercentage(parseInt(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                  <span>5% (Sub-Grade A)</span>
                  <span>40% (Optimal Puree / Mash)</span>
                  <span>85% (Critical Rescue)</span>
                </div>
              </div>

              {/* Brix Sugar Refractometer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Brix Rating (°Bx):
                  </label>
                  <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {brixRating}°Bx
                  </span>
                </div>
                <input
                  type="range"
                  min="3.5"
                  max="12.0"
                  step="0.1"
                  value={brixRating}
                  onChange={(e) => setBrixRating(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-200 rounded-lg"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Refractometer reading (High solids = high paste yield)
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Degradation Countdown & Industrial Suitability Real-Time Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shelf-Life Countdown Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950 via-zinc-950 to-zinc-900 text-white border border-rose-900/50 shadow-md">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="h-4 w-4 animate-pulse" />
                Degradation Countdown
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-rose-400">
                  {calculatedShelfLifeHours}h
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  remaining before irreversible soft-rot onset
                </span>
              </div>
              <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (calculatedShelfLifeHours / 72) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">
                Accelerated discount auctions ensure lot is committed and dispatched in refrigerated freight before pulp souring.
              </p>
            </div>

            {/* Industrial Suitability Live Match */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-zinc-950 to-teal-950 text-white border border-emerald-900/50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Industrial Suitability Match
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {suitability.matchScorePercent}% Match
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-zinc-300 font-bold">Recommended Processing Applications:</p>
                <div className="flex flex-wrap gap-1">
                  {suitability.recommendedProcesses.map((proc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-zinc-200"
                    >
                      {proc}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  {suitability.scientificAssessment}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-900/30 cursor-pointer flex items-center gap-2"
            >
              <span>Publish to Salvage Exchange</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
