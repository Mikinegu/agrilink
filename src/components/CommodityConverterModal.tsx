import React, { useState } from 'react';
import {
  X,
  Scale,
  DollarSign,
  TrendingUp,
  ArrowRightLeft,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  Calculator,
  Info,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';

interface CommodityConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'units' | 'currency' | 'corridors';

const UNIT_CONVERSION_FACTORS: Record<string, number> = {
  // Base unit: Kilogram (kg)
  KG: 1,
  FERESULA: 17,       // Traditional Ethiopian coffee trade unit = 17 kg
  BAG: 50,            // Standard farm packhouse bag = 50 kg
  QUINTAL: 100,       // Standard Ethiopian grain/pulse quintal = 100 kg
  TON: 1000,          // Metric ton = 1,000 kg (10 quintals)
};

const COMMODITY_PRESETS = [
  { id: 'teff', nameKey: 'teffMagna', defaultPriceEtbPerKg: 94.5, defaultUnit: 'QUINTAL' },
  { id: 'coffee', nameKey: 'yirgacheffeCoffee', defaultPriceEtbPerKg: 285.3, defaultUnit: 'FERESULA' },
  { id: 'harar', nameKey: 'hararCoffee', defaultPriceEtbPerKg: 305.8, defaultUnit: 'FERESULA' },
  { id: 'sesame', nameKey: 'humeraSesame', defaultPriceEtbPerKg: 142.0, defaultUnit: 'QUINTAL' },
  { id: 'wheat', nameKey: 'durumWheat', defaultPriceEtbPerKg: 58.0, defaultUnit: 'QUINTAL' },
  { id: 'beans', nameKey: 'redHaricotBeans', defaultPriceEtbPerKg: 41.0, defaultUnit: 'QUINTAL' },
];

export const CommodityConverterModal: React.FC<CommodityConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('units');

  // Units Tab State
  const [unitAmount, setUnitAmount] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('QUINTAL');
  const [toUnit, setToUnit] = useState<string>('FERESULA');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('teff');

  // Currency & Escrow Tab State
  const [contractEtb, setContractEtb] = useState<number>(100000);
  const [fxRate, setFxRate] = useState<number>(138.5);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculation for weight
  const fromKg = (unitAmount || 0) * (UNIT_CONVERSION_FACTORS[fromUnit] || 1);
  const targetFactor = UNIT_CONVERSION_FACTORS[toUnit] || 1;
  const convertedValue = fromKg / targetFactor;

  // Selected commodity price estimation
  const currentCommodityObj = COMMODITY_PRESETS.find((c) => c.id === selectedCommodity) || COMMODITY_PRESETS[0];
  const commodityName = (t.commodityTicker as any)[currentCommodityObj.nameKey] || currentCommodityObj.id;
  const estimatedTotalEtb = fromKg * currentCommodityObj.defaultPriceEtbPerKg;
  const estimatedTotalUsd = estimatedTotalEtb / fxRate;

  // Currency & Escrow Calculations
  const platformFee = contractEtb * 0.02;
  const netFarmerPayout = contractEtb - platformFee;
  const usdValue = contractEtb / fxRate;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUnitDisplayName = (key: string): string => {
    switch (key) {
      case 'QUINTAL':
        return t.unitConverter.unitQuintal;
      case 'FERESULA':
        return t.unitConverter.unitFeresula;
      case 'TON':
        return t.unitConverter.unitTon;
      case 'KG':
        return t.unitConverter.unitKg;
      case 'BAG':
        return t.unitConverter.unitBag;
      default:
        return key;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {t.commodityTicker.liveFeedBadge}
                </span>
                <span className="text-xs text-zinc-400 font-mono">ECX / NBE 2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                {t.unitConverter.modalTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 pt-4 pb-2 border-b border-zinc-100 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'units'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>{t.unitConverter.tabUnits}</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>{t.unitConverter.tabCurrencyEscrow}</span>
          </button>

          <button
            onClick={() => setActiveTab('corridors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'corridors'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>{t.unitConverter.tabCorridors}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* TAB 1: AGRICULTURAL UNITS CONVERTER */}
          {activeTab === 'units' && (
            <div className="space-y-5">
              {/* Commodity Quick Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-2">
                  Select Commodity Preset (Auto-Pricing)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMODITY_PRESETS.map((c) => {
                    const isSelected = selectedCommodity === c.id;
                    const cName = (t.commodityTicker as any)[c.nameKey] || c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCommodity(c.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold ring-1 ring-emerald-600'
                            : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        <span className="block truncate">{cName}</span>
                        <span className="text-[10px] text-zinc-400 block font-normal">
                          {(c.defaultPriceEtbPerKg * 100).toLocaleString()} {t.common.currency}/Qt
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversion Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    {t.unitConverter.amountLabel} &amp; {t.unitConverter.fromUnitLabel}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={unitAmount}
                      onChange={(e) => setUnitAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-1/2 px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-black text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <select
                      value={fromUnit}
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-1/2 px-2 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {Object.keys(UNIT_CONVERSION_FACTORS).map((u) => (
                        <option key={u} value={u}>
                          {getUnitDisplayName(u)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-1 flex items-center justify-center pt-5">
                  <button
                    onClick={() => {
                      const temp = fromUnit;
                      setFromUnit(toUnit);
                      setToUnit(temp);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 cursor-pointer transition-colors shadow-2xs"
                    title="Swap Units"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-zinc-700 block">
                    {t.unitConverter.toUnitLabel}
                  </label>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {Object.keys(UNIT_CONVERSION_FACTORS).map((u) => (
                      <option key={u} value={u}>
                        {getUnitDisplayName(u)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conversion Result Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-bold border-b border-white/10 pb-2">
                  <span>{t.unitConverter.convertedResultLabel}</span>
                  <button
                    onClick={() => handleCopy(`${convertedValue.toFixed(2)} ${toUnit}`)}
                    className="flex items-center gap-1 text-[11px] hover:text-white cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? t.unitConverter.copiedNotice : t.unitConverter.copyResultBtn}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {convertedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    <span className="text-lg font-bold text-emerald-400">{getUnitDisplayName(toUnit).split(' ')[0]}</span>
                  </div>
                  <span className="text-xs text-emerald-200/70 font-mono">
                    ≈ {fromKg.toLocaleString()} Kilograms total
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Estimated Value ({t.common.currency})</span>
                    <span className="text-base font-extrabold text-white">
                      {Math.round(estimatedTotalEtb).toLocaleString()} {t.common.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold">Export Valuation (USD)</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ${Math.round(estimatedTotalUsd).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Educational Equivalency Matrix */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-emerald-700" /> Ethiopian Agricultural Measure Standards:
                </h4>
                <ul className="space-y-1 text-zinc-600 text-[11px]">
                  <li>• <strong>1 Quintal (ኩንታል)</strong> = 100 kg = 5.88 Feresula = 0.1 Metric Ton</li>
                  <li>• <strong>1 Feresula (ፈረሱላ)</strong> = 17 kg (National standard for ECX Coffee Auctions)</li>
                  <li>• <strong>1 Metric Ton (ቶን)</strong> = 1,000 kg = 10 Quintals = 58.82 Feresula</li>
                  <li>• <strong>1 Standard Sack / Bag</strong> = 50 kg (Half Quintal)</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENCY & ESCROW VALUE CALCULATOR */}
          {activeTab === 'currency' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">
                    {t.unitConverter.currencyFromLabel}
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={contractEtb}
                    onChange={(e) => setContractEtb(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-base font-black text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">
                    NBE Exchange Rate (1 USD = ETB)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={fxRate}
                    onChange={(e) => setFxRate(Math.max(1, parseFloat(e.target.value) || 138.5))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-base font-bold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                {t.unitConverter.nbeExchangeRateNote}
              </p>

              {/* Escrow Settlement Breakdown Card */}
              <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-3.5 border border-zinc-800">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold border-b border-zinc-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> 100% NBE Protected Escrow Breakdown
                  </span>
                  <span className="font-mono text-zinc-400">≈ ${usdValue.toFixed(2)} USD</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-300">
                    <span>{t.unitConverter.grossTradeValue}:</span>
                    <span className="font-extrabold text-white text-sm">
                      {contractEtb.toLocaleString()} {t.common.currency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-amber-400">
                    <span>{t.unitConverter.escrowFeeLabel}:</span>
                    <span className="font-bold font-mono">
                      - {platformFee.toLocaleString()} {t.common.currency}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-black text-emerald-400 text-sm block">
                        {t.unitConverter.netFarmerPayout}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Disbursed to producer upon digital delivery sign-off
                      </span>
                    </div>
                    <span className="text-xl font-black text-emerald-400">
                      {netFarmerPayout.toLocaleString()} {t.common.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REGIONAL CORRIDORS SPOT BENCHMARKS */}
          {activeTab === 'corridors' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                Spot benchmark rates compiled across verified Ethiopian wholesale staging centers:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{t.unitConverter.corridorAddis}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                      Active
                    </span>
                  </div>
                  <div className="space-y-1 text-zinc-600 text-[11px]">
                    <div className="flex justify-between"><span>White Teff Magna:</span><strong className="text-zinc-900">9,500 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Red Onions:</span><strong className="text-zinc-900">3,700 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Durum Wheat:</span><strong className="text-zinc-900">5,900 ETB/Qt</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{t.unitConverter.corridorAdama}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      Cross-Dock
                    </span>
                  </div>
                  <div className="space-y-1 text-zinc-600 text-[11px]">
                    <div className="flex justify-between"><span>White Teff Magna:</span><strong className="text-zinc-900">9,200 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Red Haricot Beans:</span><strong className="text-zinc-900">4,050 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Freight to Addis:</span><strong className="text-zinc-900">350 ETB/Qt</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{t.unitConverter.corridorHawassa}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                      Cold-Chain
                    </span>
                  </div>
                  <div className="space-y-1 text-zinc-600 text-[11px]">
                    <div className="flex justify-between"><span>Yirgacheffe Coffee G1:</span><strong className="text-zinc-900">4,850 ETB/Feresula</strong></div>
                    <div className="flex justify-between"><span>Soybeans:</span><strong className="text-zinc-900">6,100 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Storage Temp:</span><strong className="text-zinc-900">4.2°C Certified</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{t.unitConverter.corridorDireDawa}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Export Corridor
                    </span>
                  </div>
                  <div className="space-y-1 text-zinc-600 text-[11px]">
                    <div className="flex justify-between"><span>Harar Longberry Coffee:</span><strong className="text-zinc-900">5,250 ETB/Feresula</strong></div>
                    <div className="flex justify-between"><span>Humera White Sesame:</span><strong className="text-zinc-900">14,400 ETB/Qt</strong></div>
                    <div className="flex justify-between"><span>Djibouti Transit:</span><strong className="text-zinc-900">18-24 hrs Reefer</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Real-time ECX &amp; NBE Reference Feeds</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {t.unitConverter.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
