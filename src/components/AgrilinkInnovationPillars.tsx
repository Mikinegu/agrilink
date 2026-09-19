import React, { useState, useMemo } from 'react';
import {
  CROP_CONFIGS,
  SALVAGE_TIERS,
  calculateDegradationPrice,
  POSTGRES_INVENTORY_SCHEMA_DDL,
  TELEPHONY_SAMPLE_CALLS,
  calculateAVPS,
  runPostGISSpatialClustering,
  PITCH_DECK_KPIS,
  SalvageTierCode,
} from '../utils/strategicPillarsEngine.ts';
import { AgriLinkLogo } from './AgriLinkLogo.tsx';
import {
  Sparkles,
  Cpu,
  Flame,
  PhoneCall,
  CreditCard,
  Truck,
  TrendingUp,
  Database,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  FileCode2,
  Play,
  Volume2,
  Lock,
  Layers,
  Award,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface AgrilinkInnovationPillarsProps {
  initialTab?: 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'pitch';
  onNavigateToSalvage?: () => void;
  onNavigateToMarketplace?: () => void;
  onNavigateToLogistics?: () => void;
  onNavigateToFinance?: () => void;
}

export const AgrilinkInnovationPillars: React.FC<AgrilinkInnovationPillarsProps> = ({
  initialTab = 'pillar1',
  onNavigateToSalvage,
  onNavigateToMarketplace,
  onNavigateToLogistics,
  onNavigateToFinance,
}) => {
  const [activeTab, setActiveTab] = useState<'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'pitch'>(initialTab);

  // ── Pillar 1 State: Degradation Pricing Engine ───────────────────────────
  const [selectedCropKey, setSelectedCropKey] = useState<string>('tomato');
  const [elapsedHours, setElapsedHours] = useState<number>(28);
  const [ambientTempC, setAmbientTempC] = useState<number>(26);
  const [showSqlSchema, setShowSqlSchema] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [simulatedAlertTriggered, setSimulatedAlertTriggered] = useState<string | null>(null);

  const selectedCrop = CROP_CONFIGS[selectedCropKey] || CROP_CONFIGS.tomato;
  const degradationResult = useMemo(() => {
    return calculateDegradationPrice(
      selectedCrop.basePriceETB,
      selectedCrop.floorPriceETB,
      selectedCrop.decayConstant,
      elapsedHours,
      ambientTempC
    );
  }, [selectedCrop, elapsedHours, ambientTempC]);

  // ── Pillar 2 State: Telephony & Local-Language Audio ──────────────────────
  const [selectedCallId, setSelectedCallId] = useState<string>('ivr-call-01');
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(4); // default completed
  const [publishedListingSuccess, setPublishedListingSuccess] = useState<boolean>(false);

  const currentCall = TELEPHONY_SAMPLE_CALLS.find((c) => c.id === selectedCallId) || TELEPHONY_SAMPLE_CALLS[0];

  const handleRunAudioPipeline = () => {
    setIsProcessingAudio(true);
    setPublishedListingSuccess(false);
    setPipelineStep(1);

    setTimeout(() => setPipelineStep(2), 600);
    setTimeout(() => setPipelineStep(3), 1200);
    setTimeout(() => {
      setPipelineStep(4);
      setIsProcessingAudio(false);
    }, 1800);
  };

  const handlePublishToMarketplace = () => {
    setPublishedListingSuccess(true);
    setTimeout(() => setPublishedListingSuccess(false), 5000);
  };

  // ── Pillar 3 State: Alternative Credit & Trust Scoring (AVPS) ────────────
  const [deliveredOrders, setDeliveredOrders] = useState<number>(38);
  const [acceptedContracts, setAcceptedContracts] = useState<number>(40);
  const [qualityMatchRatio, setQualityMatchRatio] = useState<number>(0.96);
  const [annualVolumeQuintals, setAnnualVolumeQuintals] = useState<number>(320);
  const [harvestCyclesCompleted, setHarvestCyclesCompleted] = useState<number>(9);
  const [showApiEndpoint, setShowApiEndpoint] = useState<boolean>(false);

  const avpsResult = useMemo(() => {
    return calculateAVPS(
      deliveredOrders,
      acceptedContracts,
      qualityMatchRatio,
      annualVolumeQuintals,
      harvestCyclesCompleted
    );
  }, [deliveredOrders, acceptedContracts, qualityMatchRatio, annualVolumeQuintals, harvestCyclesCompleted]);

  // ── Pillar 4 State: PostGIS Spatial Aggregation & Pooling ────────────────
  const [targetVolumeOrder, setTargetVolumeOrder] = useState<number>(40.0);
  const [searchRadiusMeters, setSearchRadiusMeters] = useState<number>(10000);
  const [otpCodeInput, setOtpCodeInput] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  const spatialResult = useMemo(() => {
    return runPostGISSpatialClustering(targetVolumeOrder, searchRadiusMeters);
  }, [targetVolumeOrder, searchRadiusMeters]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRES_INVENTORY_SCHEMA_DDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Sovereign Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <AgriLinkLogo size="md" theme="dark" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Strategic Innovation Engine
                </span>
                <span className="text-zinc-500 text-xs hidden sm:inline">•</span>
                <span className="text-zinc-400 text-xs font-mono hidden sm:inline">v2.4 Production Suite</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                4 Core Strategic Pillars & Pitch Deck Engine
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Mathematical degradation models, low-resource telephony, alternative credit (AVPS), and spatial freight pooling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-black shadow-lg shadow-emerald-900/30'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Pitch Deck KPIs</span>
            </button>
          </div>
        </div>

        {/* 5 Tab Navigation Bar */}
        <div className="flex items-center gap-1 sm:gap-2 mt-6 overflow-x-auto pb-2 border-b border-zinc-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('pillar1')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pillar1'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Pillar 1: Shelf-Life & Salvage Math</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar2')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pillar2'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Pillar 2: Audio & Telephony Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar3')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pillar3'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Pillar 3: AVPS Credit & Trust Scoring</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar4')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pillar4'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Pillar 4: Spatial Pooling Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pitch'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Executive Pitch Deck</span>
          </button>
        </div>
      </div>

      {/* Main Body per Tab */}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1: PILLAR 1 - DYNAMIC SHELF-LIFE & DEGRADATION PRICING ENGINE
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pillar1' && (
          <div className="space-y-6">
            {/* Mathematical Model Header Box */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 backdrop-blur-md shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Flame className="h-4 w-4" />
                    <span>Mathematical Model for Degradation Pricing</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Dynamic Perishability & Ambient Thermal Decay Function
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
                    Instead of arbitrary discounting, the price degradation function computes real-time pricing based on ambient thermal exposure, days from harvest, and commodity perishability sensitivity.
                  </p>
                </div>

                {/* Mathematical Equation Display */}
                <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/40 font-mono text-center shrink-0">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">Decay Equation</div>
                  <div className="text-lg sm:text-xl font-black text-emerald-300">
                    P(t) = P<sub>min</sub> + (P<sub>base</sub> − P<sub>min</sub>) · e<sup>−λ · t · θ</sup>
                  </div>
                  <div className="text-2xs text-zinc-400 mt-1">
                    where θ = T<sub>ambient</sub> / 20°C &nbsp;|&nbsp; λ<sub>tomato</sub> ≈ 0.035
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Controls & Commodity Config (5 Columns) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>Real-Time Environmental Parameters</span>
                  </h3>
                  <button
                    onClick={() => {
                      setElapsedHours(28);
                      setAmbientTempC(26);
                    }}
                    className="text-2xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> Reset
                  </button>
                </div>

                {/* Crop Commodity Picker */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    Select Target Agricultural Commodity (λ constant)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(CROP_CONFIGS).map((cfg) => (
                      <button
                        key={cfg.cropType}
                        onClick={() => setSelectedCropKey(cfg.cropType)}
                        className={`p-2.5 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                          selectedCropKey === cfg.cropType
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                            : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
                        }`}
                      >
                        <div className="truncate font-semibold">{cfg.label}</div>
                        <div className="text-2xs text-zinc-400 font-mono mt-0.5">
                          λ = {cfg.decayConstant}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 1: Elapsed Hours t */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Time Elapsed Since Harvest (t)</span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {elapsedHours} Hours ({Math.floor(elapsedHours / 24)}d {elapsedHours % 24}h)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="96"
                    step="1"
                    value={elapsedHours}
                    onChange={(e) => setElapsedHours(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-zinc-500 mt-1 font-mono">
                    <span>0h (Harvest)</span>
                    <span>36h (Tier 1)</span>
                    <span>60h (Tier 2)</span>
                    <span>84h (Tier 3)</span>
                    <span>96h (Tier 4)</span>
                  </div>
                </div>

                {/* Slider 2: Ambient Temperature T */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Ambient Thermal Exposure (T<sub>ambient</sub>)</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      {ambientTempC}°C (θ = {degradationResult.theta}x penalty)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="42"
                    step="1"
                    value={ambientTempC}
                    onChange={(e) => setAmbientTempC(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-zinc-500 mt-1 font-mono">
                    <span>15°C (Cool Highland)</span>
                    <span>20°C (Standard Ref θ=1.0)</span>
                    <span>32°C (Rift Valley)</span>
                    <span>42°C (Extreme)</span>
                  </div>
                </div>

                {/* Price Benchmarks */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Benchmark Grade-A Price (P<sub>base</sub>):</span>
                    <span className="font-mono font-bold text-white">{selectedCrop.basePriceETB.toLocaleString()} ETB / qtl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Floor Salvage Price (P<sub>min</sub>):</span>
                    <span className="font-mono font-bold text-zinc-300">{selectedCrop.floorPriceETB.toLocaleString()} ETB / qtl</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Decay Exponent (−λ · t · θ):</span>
                    <span className="font-mono font-bold text-emerald-400">−{degradationResult.decayExponent}</span>
                  </div>
                </div>
              </div>

              {/* Real-Time Calculation & State Tier Card (7 Columns) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Current Live Calculated Price Banner */}
                <div className={`p-6 rounded-2xl border ${degradationResult.tier.borderColor} bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-2xl relative overflow-hidden`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${degradationResult.tier.badgeColor}`}>
                          {degradationResult.tier.title}
                        </span>
                        <span className="text-zinc-500 text-xs font-mono">{degradationResult.tier.hoursRange}</span>
                      </div>
                      <div className="text-xs text-zinc-400">{degradationResult.tier.targetBuyerSegment}</div>
                      
                      <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                          {degradationResult.calculatedPrice.toLocaleString()} <span className="text-base text-zinc-400 font-sans font-normal">ETB / quintal</span>
                        </span>
                        {degradationResult.markdownPercent > 0 && (
                          <span className="px-2 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            −{degradationResult.markdownPercent}% Markdown
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Equivalent to <span className="font-mono text-zinc-200">{(degradationResult.calculatedPrice / 100).toFixed(2)} ETB/kg</span> (Floor: {(selectedCrop.floorPriceETB / 100).toFixed(2)} ETB/kg)
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/50 border border-zinc-800 text-center shrink-0">
                      <div className="text-2xs text-zinc-400 uppercase tracking-wider">Farmer Value Protected</div>
                      <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                        {degradationResult.farmerLossPreventedETB.toLocaleString()} ETB
                      </div>
                      <div className="text-2xs text-zinc-500 mt-0.5">Zero Dump Guarantee</div>
                    </div>
                  </div>

                  {/* Automated Action Trigger Notification */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="text-xs text-zinc-300 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>{degradationResult.tier.actionSummary}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSimulatedAlertTriggered(`Automated push notification sent for Lot SALV-${selectedCropKey.toUpperCase()}-912!`);
                        setTimeout(() => setSimulatedAlertTriggered(null), 4000);
                      }}
                      className="text-2xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer"
                    >
                      Trigger Broadcast
                    </button>
                  </div>

                  {simulatedAlertTriggered && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{simulatedAlertTriggered}</span>
                    </div>
                  )}
                </div>

                {/* 4 State Transition Tiers Roadmap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(SALVAGE_TIERS).map((tInfo) => {
                    const isCurrent = degradationResult.tier.code === tInfo.code;
                    return (
                      <div
                        key={tInfo.code}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? `${tInfo.borderColor} bg-zinc-900 shadow-md ring-1 ring-emerald-500/30`
                            : 'border-zinc-800 bg-zinc-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${tInfo.textColor}`}>
                            {tInfo.title}
                          </span>
                          <span className="text-2xs font-mono text-zinc-500">{tInfo.hoursRange}</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 font-medium">{tInfo.discountDescription}</p>
                        <p className="text-2xs text-zinc-400 mt-1 truncate">{tInfo.targetBuyerSegment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PostgreSQL Schema & DDL Toggle Section */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Production PostgreSQL Database Schema (`inventory_listings`)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedSql ? 'Copied SQL!' : 'Copy DDL'}</span>
                  </button>
                  <button
                    onClick={() => setShowSqlSchema(!showSqlSchema)}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    {showSqlSchema ? 'Hide Schema' : 'View SQL DDL'}
                  </button>
                </div>
              </div>

              {showSqlSchema && (
                <div className="p-4 rounded-xl bg-black border border-zinc-800 overflow-x-auto text-xs font-mono text-emerald-300/90 leading-relaxed max-h-80">
                  <pre>{POSTGRES_INVENTORY_SCHEMA_DDL}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2: PILLAR 2 - LOW-RESOURCE TELEPHONY & AUDIO PIPELINE
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pillar2' && (
          <div className="space-y-6">
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-blue-500/30 backdrop-blur-md shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <PhoneCall className="h-4 w-4" />
                    <span>Pillar 2: Inclusive Telephony & Speech-to-Text Pipeline</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    2G Feature-Phone Voice Ingestion & Local-Language Audio Pipeline
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
                    To prove digital inclusion for illiterate Ethiopian smallholders, the architecture completely decouples text from input. Farmers dial a 2G basic phone IVR, speak in Amharic or Afaan Oromoo, and our pipeline extracts structured lots.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunAudioPipeline}
                    disabled={isProcessingAudio}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    <span>{isProcessingAudio ? 'Processing Stream...' : 'Simulate Audio Call Stream'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Architecture Flow Diagram */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                End-to-End Telephony & NLP Architecture Flow
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {/* Step 1 */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  pipelineStep >= 1 ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}>
                  <div className="text-2xs font-bold uppercase text-blue-400 mb-1">Step 1</div>
                  <PhoneCall className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold text-xs">2G Basic Phone</div>
                  <div className="text-2xs text-zinc-400 mt-1">Farmer Voice Call (IVR)</div>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  pipelineStep >= 2 ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}>
                  <div className="text-2xs font-bold uppercase text-blue-400 mb-1">Step 2</div>
                  <Cpu className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold text-xs">FreeSWITCH / Asterisk</div>
                  <div className="text-2xs text-zinc-400 mt-1">.wav 8kHz Audio Codec</div>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  pipelineStep >= 3 ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}>
                  <div className="text-2xs font-bold uppercase text-blue-400 mb-1">Step 3</div>
                  <Volume2 className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold text-xs">Whisper Fine-Tuned</div>
                  <div className="text-2xs text-zinc-400 mt-1">Amharic & Afaan Oromoo</div>
                </div>

                {/* Step 4 */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  pipelineStep >= 4 ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}>
                  <div className="text-2xs font-bold uppercase text-blue-400 mb-1">Step 4</div>
                  <FileCode2 className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <div className="font-bold text-xs">Entity Extraction</div>
                  <div className="text-2xs text-zinc-400 mt-1">RegEx + Fine-Tuned NLP</div>
                </div>

                {/* Step 5 */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  pipelineStep >= 4 ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}>
                  <div className="text-2xs font-bold uppercase text-emerald-400 mb-1">Step 5</div>
                  <Database className="h-6 w-6 mx-auto mb-2 text-emerald-400" />
                  <div className="font-bold text-xs">PostgreSQL & Web UI</div>
                  <div className="text-2xs text-zinc-400 mt-1">Active Marketplace Lot</div>
                </div>
              </div>
            </div>

            {/* Interactive Call Selector & Extracted JSON Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sample Calls List (5 Columns) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="font-bold text-white text-base">Select Test Inbound 2G Phone Call</h3>

                <div className="space-y-3">
                  {TELEPHONY_SAMPLE_CALLS.map((call) => (
                    <button
                      key={call.id}
                      onClick={() => {
                        setSelectedCallId(call.id);
                        setPublishedListingSuccess(false);
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedCallId === call.id
                          ? 'border-blue-500 bg-blue-500/10 shadow-md'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{call.callerName}</span>
                        <span className="text-2xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-blue-400">
                          {call.languageLabel}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">{call.callerPhone}</div>
                      <div className="mt-2 text-xs text-zinc-300 italic">"{call.transcription}"</div>
                      <div className="mt-2 flex items-center gap-2 text-2xs text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Confidence: {Math.round(call.confidenceScore * 100)}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* JSON Output & Live Extraction Playground (7 Columns) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="h-5 w-5 text-blue-400" />
                    <h3 className="font-bold text-white text-base">
                      JSON Entity Output & Ingestion Result
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Validated JSON Payload
                  </span>
                </div>

                {/* Formatted Code Box */}
                <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-blue-300 overflow-x-auto">
                  <pre>
{JSON.stringify(
  {
    caller_phone: currentCall.callerPhone,
    detected_language: currentCall.language,
    confidence_score: currentCall.confidenceScore,
    extracted_entities: currentCall.extractedEntities,
  },
  null,
  2
)}
                  </pre>
                </div>

                {/* Ingestion & Marketplace Publisher Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-zinc-400">
                    Extracted: <strong className="text-white">{currentCall.extractedEntities.quantityValue} Quintals</strong> of <strong className="text-white">{currentCall.extractedEntities.cropLabel}</strong> in <strong className="text-white">{currentCall.extractedEntities.locationKebele}</strong>
                  </div>

                  <button
                    onClick={handlePublishToMarketplace}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                  >
                    <Database className="h-4 w-4" />
                    <span>Publish Extracted Lot to Marketplace</span>
                  </button>
                </div>

                {publishedListingSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Success!</strong> Lot published to live marketplace as <strong>Active Tier-1 Listing</strong> with dynamic pricing enabled!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 3: PILLAR 3 - ALTERNATIVE CREDIT & TRUST SCORING (AVPS)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pillar3' && (
          <div className="space-y-6">
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/30 backdrop-blur-md shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Pillar 3: Agri-Fintech & Digital Collateral Engine</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Algorithmically Verified Production Score (AVPS)
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
                    Traditional Ethiopian commercial banks demand land titles that smallholders cannot pledge. Agrilink computes an unalterable, transaction-backed production credit score to unlock pre-harvest working capital and micro-insurance.
                  </p>
                </div>

                {/* Formula Display */}
                <div className="p-4 rounded-xl bg-black/60 border border-amber-500/40 font-mono text-center shrink-0">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">AVPS Formula</div>
                  <div className="text-lg sm:text-xl font-black text-amber-300">
                    AVPS = w₁F + w₂Q + w₃V + w₄T
                  </div>
                  <div className="text-2xs text-zinc-400 mt-1">
                    w₁=35% (Fulfill) | w₂=25% (Quality) | w₃=20% (Vol) | w₄=20% (Tenure)
                  </div>
                </div>
              </div>
            </div>

            {/* AVPS Sliders & Credit Passport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Sliders (5 Columns) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-amber-400" />
                  <span>Farmer Escrow Performance Metrics</span>
                </h3>

                {/* Slider F: Fulfillment Rate */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Fulfillment Rate (F, 35% weight)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {deliveredOrders} / {acceptedContracts} orders ({Math.round((deliveredOrders / acceptedContracts) * 100)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={deliveredOrders}
                    onChange={(e) => setDeliveredOrders(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="text-2xs text-zinc-500 mt-1">Penalizes phantom listings and side-selling</div>
                </div>

                {/* Slider Q: Quality Match */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Depot Quality Match (Q, 25% weight)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {Math.round(qualityMatchRatio * 100)}% Grade Alignment
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.02"
                    value={qualityMatchRatio}
                    onChange={(e) => setQualityMatchRatio(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="text-2xs text-zinc-500 mt-1">1.0 = Grade-A match; 0.5 = Downgraded at receiving depot</div>
                </div>

                {/* Slider V: Volume Scalability */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">12-Mo Volume Scalability (V, 20% weight)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {annualVolumeQuintals} Quintals
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={annualVolumeQuintals}
                    onChange={(e) => setAnnualVolumeQuintals(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="text-2xs text-zinc-500 mt-1">Logarithmic scale of total quintals delivered through escrow</div>
                </div>

                {/* Slider T: Tenure */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Tenure Regularity (T, 20% weight)</span>
                    <span className="font-mono font-bold text-amber-400">
                      {harvestCyclesCompleted} Consecutive Harvest Cycles
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={harvestCyclesCompleted}
                    onChange={(e) => setHarvestCyclesCompleted(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="text-2xs text-zinc-500 mt-1">Consistency of seasonal crop deliveries logged on platform</div>
                </div>

                {/* Breakdown Summary */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Fulfillment Contribution:</span>
                    <span className="text-amber-400">+{avpsResult.breakdown.fulfillmentRateScore} pts</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Quality Match Contribution:</span>
                    <span className="text-amber-400">+{avpsResult.breakdown.qualityMatchScore} pts</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Volume Scalability Contribution:</span>
                    <span className="text-amber-400">+{avpsResult.breakdown.volumeScore} pts</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tenure Contribution:</span>
                    <span className="text-amber-400">+{avpsResult.breakdown.tenureScore} pts</span>
                  </div>
                </div>
              </div>

              {/* Digital Credit Passport (7 Columns) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Score Card */}
                <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 shadow-2xl relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {avpsResult.tierGrade}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400">Algorithmically Verified Production Score</div>

                      <div className="mt-4 flex items-baseline gap-3">
                        <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                          {avpsResult.avpsScore} <span className="text-lg text-zinc-500 font-sans font-normal">/ 1000</span>
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          ({avpsResult.scorePercentage}% Index)
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/60 border border-amber-500/30 text-center shrink-0">
                      <div className="text-2xs text-zinc-400 uppercase tracking-wider">Pre-Harvest Working Capital Limit</div>
                      <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                        {avpsResult.recommendedCreditLimitETB.toLocaleString()} ETB
                      </div>
                      <div className="text-2xs text-zinc-400 mt-0.5">
                        @ {avpsResult.interestRateAnnual}% Annual Interest ({avpsResult.loanTermMonths} Mo Term)
                      </div>
                    </div>
                  </div>

                  {/* Partner Bank Approvals Grid */}
                  <div className="mt-6 pt-5 border-t border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Partner Microfinance & Commercial Bank Integrations
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {avpsResult.partnerBankEligibilities.map((bank, i) => (
                        <div key={i} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white truncate">{bank.bankName}</span>
                            <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {bank.status}
                            </span>
                          </div>
                          <div className="text-2xs text-zinc-400 truncate">{bank.facilityType}</div>
                          <div className="mt-1.5 font-mono font-bold text-emerald-300">
                            Up to {bank.maxDisbursementETB.toLocaleString()} ETB
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* API Endpoint Modal Toggle */}
                  <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <div className="text-xs text-zinc-400 font-mono">
                      GET /api/v1/farmers/usr-bekele-wonji/credit-passport
                    </div>
                    <button
                      onClick={() => setShowApiEndpoint(!showApiEndpoint)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showApiEndpoint ? 'Hide API Payload' : 'Inspect API Endpoint'}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {showApiEndpoint && (
                    <div className="mt-4 p-4 rounded-xl bg-black border border-amber-500/30 font-mono text-xs text-amber-300/90 overflow-x-auto">
                      <pre>
{JSON.stringify(
  {
    endpoint: "GET /api/v1/farmers/usr-bekele-wonji/credit-passport",
    status: 200,
    timestamp: "2026-09-17T15:00:00Z",
    farmer_id: "usr-bekele-wonji",
    avps_score: avpsResult.avpsScore,
    tier_grade: avpsResult.tierGrade,
    max_working_capital_etb: avpsResult.recommendedCreditLimitETB,
    metrics: {
      fulfillment_rate_percent: Math.round((deliveredOrders / acceptedContracts) * 100),
      quality_inspection_ratio: qualityMatchRatio,
      annual_volume_quintals: annualVolumeQuintals,
      harvest_cycles: harvestCyclesCompleted
    },
    cryptographic_signature: "hmac-sha256-a9f84b2c8901e84d720b41aa893d"
  },
  null,
  2
)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 4: PILLAR 4 - SPATIAL LOGISTICS & ROUTE POOLING (POSTGIS)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pillar4' && (
          <div className="space-y-6">
            {/* Header Box */}
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-purple-500/30 backdrop-blur-md shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Truck className="h-4 w-4" />
                    <span>Pillar 4: Spatial Route Aggregation & Load Pooling Engine</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    PostGIS Spatial Clustering & Dynamic 40-Quintal Load Packing
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
                    The Density Problem: Transport fees eat up to 45% of agricultural margins due to empty returns and under-capacity runs. Agrilink bundles 3–5 nearby smallholders into a consolidated multi-stop transit run with escrow sign-off OTP.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-purple-500/40 text-center shrink-0">
                  <div className="text-2xs text-zinc-400 uppercase tracking-wider">Truck Capacity Utilization</div>
                  <div className="text-2xl font-black font-mono text-purple-300 mt-1">
                    {spatialResult.manifest.truckCapacityUtilizationPercent}%
                  </div>
                  <div className="text-2xs text-zinc-400 mt-0.5">
                    vs 45% Industry Baseline (+{spatialResult.manifest.farmerFreightSavingsETB.toLocaleString()} ETB Saved)
                  </div>
                </div>
              </div>
            </div>

            {/* PostGIS Query & Clustering Runner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Query & Controls (5 Columns) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>Spatial Query Parameters (East Shewa / Meki Hub)</span>
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Commercial Buyer Order Volume</span>
                    <span className="font-mono font-bold text-purple-400">
                      {targetVolumeOrder} Quintals (4.0 Metric Tons)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    step="5"
                    value={targetVolumeOrder}
                    onChange={(e) => setTargetVolumeOrder(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-300 font-medium">Max Cluster Radius (ST_DWithin)</span>
                    <span className="font-mono font-bold text-purple-400">
                      {(searchRadiusMeters / 1000).toFixed(0)} km Radius
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="30000"
                    step="1000"
                    value={searchRadiusMeters}
                    onChange={(e) => setSearchRadiusMeters(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-zinc-800 rounded-lg h-2 cursor-pointer"
                  />
                </div>

                {/* Spatial SQL Query Box */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    PostGIS Spatial Distance Query
                  </div>
                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-2xs text-purple-300 overflow-x-auto leading-relaxed">
                    <pre>{spatialResult.sqlQuery}</pre>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-zinc-300">
                  <div className="font-bold text-purple-300 mb-1">Spatial Centerpoint:</div>
                  <div>Meki Central Hub coordinates: <strong className="font-mono">8.15° N, 38.82° E</strong></div>
                  <div>Found <strong>{spatialResult.matchedFarms.length} active farms</strong> within {(searchRadiusMeters / 1000).toFixed(0)}km.</div>
                </div>
              </div>

              {/* Dynamic Dispatch Manifest & Stops (7 Columns) */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Optimized Multi-Waypoint Transit Manifest
                    </h3>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      Dispatch ID: {spatialResult.manifest.dispatchId} • {spatialResult.manifest.truckType}
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Escrow Vault Locked
                  </span>
                </div>

                {/* Waypoint Stops Sequence */}
                <div className="space-y-3">
                  {spatialResult.manifest.stops.map((stop) => (
                    <div
                      key={stop.stopNumber}
                      className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center text-xs shrink-0">
                          {stop.stopNumber}
                        </span>
                        <div>
                          <div className="font-bold text-white">{stop.farmerName}</div>
                          <div className="text-2xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="h-3 w-3 text-zinc-500" />
                            <span>{stop.kebeleLocation}</span>
                            <span>•</span>
                            <span>{(stop.distanceMeters / 1000).toFixed(1)}km from hub</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-purple-300">
                          +{stop.volumeToLoadQuintals} qtl
                        </div>
                        <div className="text-2xs font-mono text-emerald-400 mt-0.5">
                          {stop.farmerPayoutETB.toLocaleString()} ETB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Destination & Escrow OTP Release Bar */}
                <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-zinc-400">Destination Wholesale Depot:</div>
                      <div className="font-bold text-white mt-0.5">{spatialResult.manifest.destinationDepot.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-400">Freight Escrow:</div>
                      <div className="font-mono font-bold text-emerald-400">
                        {spatialResult.manifest.escrowFreightVaultETB.toLocaleString()} ETB
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-zinc-400">
                      Buyer Gate Sign-off OTP: <strong className="text-purple-300 font-mono">{spatialResult.manifest.destinationDepot.otpReleaseCode}</strong>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpCodeInput}
                        onChange={(e) => setOtpCodeInput(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono w-32 focus:border-purple-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          if (otpCodeInput.trim() === '782-901' || otpCodeInput.trim() === '782901') {
                            setOtpVerified(true);
                          } else {
                            alert('Please enter correct OTP: 782-901');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        Verify & Release Escrow
                      </button>
                    </div>
                  </div>

                  {otpVerified && (
                    <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>OTP Verified!</strong> Freight payout of <strong>{spatialResult.manifest.escrowFreightVaultETB.toLocaleString()} ETB</strong> disbursed instantly to driver wallet!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 5: PITCH DECK & EXECUTIVE KPI DASHBOARD
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pitch' && (
          <div className="space-y-8">
            {/* Header Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-amber-950/60 border border-emerald-500/40 shadow-2xl">
              <div className="max-w-3xl">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Investor & Judge Innovation Showcase
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
                  Key Performance Indicators for Pitch Deck
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 mt-2 leading-relaxed">
                  Agrilink fundamentally transforms Ethiopian agricultural value chains by replacing speculative broker cartels and post-harvest spoilage with autonomous algorithmic pricing, spatial pooling, and escrow guarantees.
                </p>
              </div>
            </div>

            {/* 4 Core Comparative Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PITCH_DECK_KPIS.map((kpi, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">{kpi.metric}</h3>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {kpi.improvementDelta}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Business as Usual */}
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                      <div className="text-2xs font-bold uppercase text-rose-400">Business As Usual</div>
                      <div className="text-sm font-black text-zinc-200 mt-1">{kpi.businessAsUsual}</div>
                    </div>

                    {/* Agrilink Target */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-2xs font-bold uppercase text-emerald-400">Agrilink Target</div>
                      <div className="text-sm font-black text-white mt-1">{kpi.agrilinkTarget}</div>
                    </div>
                  </div>

                  {/* Platform Live Status Bar */}
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Live Platform Benchmark:</span>
                    <span className="font-mono font-bold text-emerald-400">{kpi.currentPlatformLive}</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    {kpi.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Strategic Summary Table for Quick Screen Grab / Slides */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Executive Metric Matrix (Judge & Pitch Reference)</span>
              </h3>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Metric</th>
                    <th className="py-3 px-4 text-rose-400">Business As Usual</th>
                    <th className="py-3 px-4 text-emerald-400">Agrilink Target</th>
                    <th className="py-3 px-4 text-white">Technological Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Post-Harvest Loss</td>
                    <td className="py-3.5 px-4 text-zinc-300">30% – 40% Spoilage</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Under 8% Target</td>
                    <td className="py-3.5 px-4 text-zinc-400">4-Tier Thermal Degradation Pricing & Salvage Redirection</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Middleman Margin</td>
                    <td className="py-3.5 px-4 text-zinc-300">40% – 60% Broker Cut</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Under 10% Flat Fee</td>
                    <td className="py-3.5 px-4 text-zinc-400">Direct Escrow Marketplace with B2B Wholesale Contracts</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Settlement Delay</td>
                    <td className="py-3.5 px-4 text-zinc-300">7 to 30 Days Informal Credit</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Instantaneous Mobile Payout</td>
                    <td className="py-3.5 px-4 text-zinc-400">Telebirr / CBE Escrow Multi-Rail Release Upon Gate OTP</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-white">Transport Utilization</td>
                    <td className="py-3.5 px-4 text-zinc-300">40% – 55% Empty Returns</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-bold">Over 85% Utilization</td>
                    <td className="py-3.5 px-4 text-zinc-400">PostGIS ST_DWithin 10km Spatial Route Pooling Manifests</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
