import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Scan,
  TrendingUp,
  Calculator,
  MessageSquare,
  MapPin,
  Truck,
  Building2,
  ThermometerSnowflake,
  ShieldCheck,
  Volume2,
  VolumeX,
  Camera,
  Upload,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Sprout,
  DollarSign,
  PieChart,
  CloudRain,
  Sun,
  Droplets,
  Share2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { User, Product, ProductCategory } from '../types/index.ts';

interface AgriIntelligenceRadarProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onAddToCart?: (item: any, qty: number) => void;
}

interface CommodityItem {
  crop: string;
  category: string;
  terminalMarket: string;
  currentPriceEtb: number;
  unit: string;
  quintalPriceEtb: number;
  dayChangePercent: number;
  demandRating: string;
  trendDirection: string;
  harvestArrivalVolumeTons: number;
  forecast30Days: Array<{ day: string; price: number; demandIndex: number }>;
  marketAdvisory: string;
}

export const AgriIntelligenceRadar: React.FC<AgriIntelligenceRadarProps> = ({
  currentUser,
  onNavigate,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'doctor' | 'oracle' | 'yield' | 'advisor'>('radar');
  const [selectedLang, setSelectedLang] = useState<'en' | 'am' | 'om' | 'ti'>('en');

  // --- 1. RADAR MAP STATE ---
  const [activeMapFilter, setActiveMapFilter] = useState<'all' | 'hubs' | 'fleets' | 'farms'>('all');
  const [selectedPin, setSelectedPin] = useState<any | null>(null);

  // Map entities data
  const mapHubs = [
    {
      id: 'hub-1',
      name: 'Adama Central Cross-Dock Hub',
      type: 'HUB',
      region: 'Oromia (East Shewa)',
      lat: 44,
      lng: 56,
      capacityTons: 1200,
      occupiedTons: 840,
      temp: '3.8°C',
      incomingTrucks: 8,
      status: 'OPERATIONAL',
      manager: 'Getachew Bekele',
      phone: '+251 91 144 2200',
      keyCrops: ['Roma Tomatoes', 'Red Onions', 'Cabbage', 'Peppers'],
    },
    {
      id: 'hub-2',
      name: 'Modjo Agro-Industrial Logistics Terminal',
      type: 'HUB',
      region: 'Oromia (Modjo Corridor)',
      lat: 42,
      lng: 52,
      capacityTons: 2500,
      occupiedTons: 1780,
      temp: '4.2°C',
      incomingTrucks: 14,
      status: 'OPERATIONAL',
      manager: 'Tigist Alemu',
      phone: '+251 91 188 9911',
      keyCrops: ['Teff Magna', 'Wheat', 'Oilseeds', 'Avocados'],
    },
    {
      id: 'hub-3',
      name: 'Hawassa Sidama Cold-Chain Center',
      type: 'HUB',
      region: 'Sidama Region',
      lat: 62,
      lng: 50,
      capacityTons: 950,
      occupiedTons: 620,
      temp: '2.5°C',
      incomingTrucks: 6,
      status: 'OPERATIONAL',
      manager: 'Abebech Wolde',
      phone: '+251 91 233 4455',
      keyCrops: ['Export Hass Avocados', 'Washed Arabica Coffee', 'Potatoes'],
    },
    {
      id: 'hub-4',
      name: 'Bahir Dar Lake Tana Hub',
      type: 'HUB',
      region: 'Amhara Region',
      lat: 22,
      lng: 40,
      capacityTons: 800,
      occupiedTons: 490,
      temp: '4.0°C',
      incomingTrucks: 5,
      status: 'OPERATIONAL',
      manager: 'Yohannes Kassa',
      phone: '+251 91 322 1100',
      keyCrops: ['Tana Rice', 'Garlic', 'Highland Potatoes', 'Sesame'],
    },
    {
      id: 'hub-5',
      name: 'Bole Cargo Air-Freight Gateway',
      type: 'HUB',
      region: 'Addis Ababa',
      lat: 38,
      lng: 48,
      capacityTons: 1500,
      occupiedTons: 1120,
      temp: '2.0°C',
      incomingTrucks: 19,
      status: 'OPERATIONAL',
      manager: 'Dr. Dawit Haile',
      phone: '+251 91 100 8877',
      keyCrops: ['Export Cut Flowers', 'Fresh Herbs', 'Specialty Avocados', 'Chilled Meat'],
    },
  ];

  const mapFleets = [
    {
      id: 'fleet-1',
      name: 'Reefer Truck ETH-3-88210',
      type: 'FLEET',
      driver: 'Kassahun Desta',
      route: 'Wonji Sugar Farm → Addis Ababa Supermarkets',
      lat: 41,
      lng: 54,
      cargo: '3.5 Tons Roma Tomatoes',
      temp: '4.1°C',
      speed: '58 km/h',
      eta: '45 mins',
      status: 'IN_TRANSIT',
    },
    {
      id: 'fleet-2',
      name: 'Heavy Hauler ETH-3-41902',
      type: 'FLEET',
      driver: 'Mulugeta Tadesse',
      route: 'Mojo Dry Port → Djibouti Port Export Line',
      lat: 40,
      lng: 64,
      cargo: '24 Tons Export Sesame & Teff',
      temp: 'Ambient (Sealed Dry)',
      speed: '65 km/h',
      eta: '3.5 hrs',
      status: 'IN_TRANSIT',
    },
    {
      id: 'fleet-3',
      name: 'Cold-Van ETH-3-19404',
      type: 'FLEET',
      driver: 'Solomon Girma',
      route: 'Yirgalem Agro-Park → Bole International Airport',
      lat: 52,
      lng: 49,
      cargo: '2.0 Tons Hass Avocados (Brix 12%)',
      temp: '3.4°C',
      speed: '72 km/h',
      eta: '1.2 hrs',
      status: 'IN_TRANSIT',
    },
  ];

  const mapFarms = [
    {
      id: 'farm-1',
      name: 'Wonji Horizon Commercial Estate',
      type: 'FARM',
      farmer: 'Bekele Tadesse',
      region: 'Oromia',
      lat: 46,
      lng: 57,
      size: '14.5 Hectares',
      activeCrops: 'Roma Tomatoes & Sweet Bell Peppers',
      projectedHarvest: '180 Quintals in 6 Days',
      soilHealth: '98% Optimal (Clay Loam)',
      irrigation: 'Solar Drip Grid',
    },
    {
      id: 'farm-2',
      name: 'Adaa High Plains Teff Coop',
      type: 'FARM',
      farmer: 'Bishoftu Growers Union (340 Farmers)',
      region: 'Debre Zeit',
      lat: 39,
      lng: 50,
      size: '120 Hectares',
      activeCrops: 'Magna Teff Grade 1 (Quncho)',
      projectedHarvest: '1,450 Quintals in 18 Days',
      soilHealth: '95% Vertisol',
      irrigation: 'Rainfed + Supplemental Sprinkler',
    },
    {
      id: 'farm-3',
      name: 'Rift Valley Organic Avocado Orchards',
      type: 'FARM',
      farmer: 'Meki-Batu Fruit Producers Association',
      region: 'Ziway / Batu',
      lat: 50,
      lng: 52,
      size: '42 Hectares',
      activeCrops: 'Hass & Fuerte Avocados',
      projectedHarvest: '65 Tons Export Certified',
      soilHealth: '96% Volcanic Sandy Loam',
      irrigation: 'Drip Network',
    },
  ];

  // --- 2. AI CROP DOCTOR STATE ---
  const [selectedCropSample, setSelectedCropSample] = useState<string>('tomato');
  const [customCropName, setCustomCropName] = useState<string>('Roma Tomatoes');
  const [symptomsInput, setSymptomsInput] = useState<string>('Dark brown water-soaked lesions on lower leaves with white fungal mold under humidity');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>('https://images.unsplash.com/photo-1592417817098-8f3d6ef23ee1?auto=format&fit=crop&w=600&q=80');
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const samplePresets = [
    {
      id: 'tomato',
      name: 'Roma Tomatoes',
      symptom: 'Dark brown spots on leaves with white fungal mildew on leaf undersides after heavy rain.',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23ee1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'coffee',
      name: 'Arabica Coffee',
      symptom: 'Orange powdery dust on the underside of coffee leaves causing premature defoliation.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'teff',
      name: 'Teff Magna',
      symptom: 'Reddish-brown rust pustules on stems and leaf sheaths reducing grain panicle size.',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'avocado',
      name: 'Hass Avocado',
      symptom: 'Black sunken spots on avocado skin and tip burn on young branch flushes.',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setSelectedCropSample(preset.id);
    setCustomCropName(preset.name);
    setSymptomsInput(preset.symptom);
    setImagePreviewUrl(preset.imageUrl);
    setCustomImageBase64(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setCustomImageBase64(base64);
      setImagePreviewUrl(base64);
      setSelectedCropSample('custom');
    };
    reader.readAsDataURL(file);
  };

  const runCropDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: customCropName,
          symptoms: symptomsInput,
          region: currentUser?.region || 'Oromia',
          imageBase64: customImageBase64,
          lang: selectedLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosisResult(data.diagnosis);
      }
    } catch (err) {
      console.error('Diagnosis error:', err);
    } finally {
      setDiagnosing(false);
    }
  };

  const toggleSpeechAudio = () => {
    if (!diagnosisResult) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const textToSpeak = diagnosisResult.audioSummaryText || diagnosisResult.localizedAdvice || diagnosisResult.diagnosisName;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Run initial diagnosis on tab enter
  useEffect(() => {
    if (activeTab === 'doctor' && !diagnosisResult) {
      runCropDiagnosis();
    }
  }, [activeTab]);

  // --- 3. MARKET ORACLE STATE ---
  const [oracleData, setOracleData] = useState<CommodityItem[]>([]);
  const [selectedOracleCrop, setSelectedOracleCrop] = useState<CommodityItem | null>(null);
  const [loadingOracle, setLoadingOracle] = useState(false);

  const fetchOracleData = async () => {
    setLoadingOracle(true);
    try {
      const res = await fetch('/api/ai/market-intelligence');
      if (res.ok) {
        const data = await res.json();
        setOracleData(data.commodities || []);
        if (data.commodities && data.commodities.length > 0) {
          setSelectedOracleCrop(data.commodities[0]);
        }
      }
    } catch (err) {
      console.error('Oracle fetch error:', err);
    } finally {
      setLoadingOracle(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'oracle' && oracleData.length === 0) {
      fetchOracleData();
    }
  }, [activeTab]);

  // --- 4. SMART YIELD FORECASTER STATE ---
  const [yieldCrop, setYieldCrop] = useState('Roma Tomatoes');
  const [yieldHectares, setYieldHectares] = useState('2.5');
  const [yieldIrrigation, setYieldIrrigation] = useState('Drip Irrigation');
  const [yieldSeed, setYieldSeed] = useState('CERTIFIED_HYBRID');
  const [yieldFertilizer, setYieldFertilizer] = useState('NPS_PLUS_UREA');
  const [calculatingYield, setCalculatingYield] = useState(false);
  const [yieldResult, setYieldResult] = useState<any | null>(null);

  const runYieldCalculation = async () => {
    setCalculatingYield(true);
    try {
      const res = await fetch('/api/ai/yield-estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: yieldCrop,
          hectares: Number(yieldHectares),
          irrigationType: yieldIrrigation,
          seedQuality: yieldSeed,
          fertilizerType: yieldFertilizer,
          region: currentUser?.region || 'Oromia',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setYieldResult(data);
      }
    } catch (err) {
      console.error('Yield calc error:', err);
    } finally {
      setCalculatingYield(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'yield' && !yieldResult) {
      runYieldCalculation();
    }
  }, [activeTab]);

  // --- 5. AI AGRONOMIST CHAT STATE ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your AgriLink AI Agronomist, certified by the Ethiopian Ministry of Agriculture. How can I optimize your crop yield, soil health, or pest defense today? (እኔ የአግሪሊንክ የግብርና አማካሪ ነኝ። ምን ልርዳዎት?)`,
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!messageText) setChatInput('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/ai/agri-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          crop: yieldCrop,
          region: currentUser?.region || 'Oromia',
          lang: selectedLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const quickPrompts = [
    'What is the best fertilizer formula for Roma Tomatoes in Wonji?',
    'How do I qualify my Hass Avocados for Grade 1 Export status?',
    'How many quintals of Teff per hectare can I harvest with row-planting?',
    'የቲማቲም ቅጠል መድረቅ በሽታን እንዴት መከላከል እችላለሁ?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 text-white p-6 sm:p-8 shadow-xl mb-6 sm:mb-8 border border-emerald-800/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Sparkles className="h-4 w-4" /> Next-Gen Agri-Intelligence & Geospatial Radar
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              AgriLink AI Command Center
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl">
              Multimodal Gemini Crop Pathologist, Live Ethiopian Cold-Chain Telemetry Radar, Real-Time ECX Price Oracle, and Predictive Farm Yield Engine.
            </p>
          </div>

          {/* Language & Live Telemetry Pill */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-700/50 flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase">Language:</span>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-zinc-900 text-white">English (EN)</option>
                <option value="am" className="bg-zinc-900 text-white">አማርኛ (Amharic)</option>
                <option value="om" className="bg-zinc-900 text-white">Afaan Oromoo</option>
                <option value="ti" className="bg-zinc-900 text-white">ትግርኛ (Tigrinya)</option>
              </select>
            </div>

            {/* Live Telemetry Indicator */}
            <div className="bg-emerald-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-500/40 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-extrabold text-emerald-300 block leading-tight">Live Grid Status</span>
                <span className="text-xs font-black text-white">5 Hubs • 18 Reefer Fleets Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 border-b border-zinc-200 no-scrollbar">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'radar'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Geospatial Radar & Hubs</span>
        </button>

        <button
          onClick={() => setActiveTab('doctor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'doctor'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Scan className="h-4 w-4" />
          <span>AI Crop Doctor & Scanner</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-400/30 text-emerald-950 border border-emerald-300/60">
            Gemini
          </span>
        </button>

        <button
          onClick={() => setActiveTab('oracle')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'oracle'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>ECX Price Oracle & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('yield')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'yield'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Smart Yield & ROI Forecaster</span>
        </button>

        <button
          onClick={() => setActiveTab('advisor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'advisor'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>24/7 AI Agronomist Chat</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. GEOSPATIAL RADAR & SUPPLY CHAIN MAP TAB */}
      {/* ======================================================== */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* Map Controls Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-zinc-500">Filter Layers:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveMapFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    activeMapFilter === 'all' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  All ({mapHubs.length + mapFleets.length + mapFarms.length})
                </button>
                <button
                  onClick={() => setActiveMapFilter('hubs')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    activeMapFilter === 'hubs' ? 'bg-purple-700 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  Cold Hubs ({mapHubs.length})
                </button>
                <button
                  onClick={() => setActiveMapFilter('fleets')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    activeMapFilter === 'fleets' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Active Fleets ({mapFleets.length})
                </button>
                <button
                  onClick={() => setActiveMapFilter('farms')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    activeMapFilter === 'farms' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Farm Parcels ({mapFarms.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600"></span>
                <span>Cold Hubs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span>Reefer Fleets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                <span>Farms</span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Map Canvas Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* The Interactive Visual Map Radar */}
            <div className="lg:col-span-8 bg-zinc-950 rounded-3xl p-4 sm:p-6 border border-zinc-800 relative shadow-xl overflow-hidden min-h-[460px] flex flex-col justify-between">
              {/* Radar Grid Pattern Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>

              {/* Geographic Overlay Guide */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 text-[11px] font-bold text-zinc-300">
                🇪🇹 Ethiopia Agro-Ecological Corridor Radar
              </div>

              {/* Climate Telemetry Overlay */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-700 text-[11px] font-bold text-zinc-300">
                <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
                <span>Rift Valley: 22°C • 68% Moisture</span>
              </div>

              {/* The Interactive Map Surface */}
              <div className="relative w-full h-[380px] sm:h-[420px] my-auto">
                {/* SVG Outline / Transport Corridors */}
                <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Addis to Djibouti Corridor Route */}
                  <line x1="48" y1="38" x2="64" y2="40" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="2,2" />
                  {/* Addis to Adama / Wonji */}
                  <line x1="48" y1="38" x2="56" y2="44" stroke="#10b981" strokeWidth="0.8" />
                  {/* Adama to Hawassa */}
                  <line x1="56" y1="44" x2="50" y2="62" stroke="#a855f7" strokeWidth="0.8" />
                  {/* Addis to Bahir Dar */}
                  <line x1="48" y1="38" x2="40" y2="22" stroke="#eab308" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
                </svg>

                {/* Hub Pins */}
                {(activeMapFilter === 'all' || activeMapFilter === 'hubs') &&
                  mapHubs.map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => setSelectedPin(hub)}
                      style={{ top: `${hub.lat}%`, left: `${hub.lng}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform hover:scale-125 focus:outline-none ${
                        selectedPin?.id === hub.id ? 'scale-125 ring-2 ring-white rounded-full' : ''
                      }`}
                      title={hub.name}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="absolute h-8 w-8 rounded-full bg-purple-500/30 animate-ping"></span>
                        <div className="h-7 w-7 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg text-white">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/90 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none">
                        {hub.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}

                {/* Fleet Pins */}
                {(activeMapFilter === 'all' || activeMapFilter === 'fleets') &&
                  mapFleets.map((fleet) => (
                    <button
                      key={fleet.id}
                      onClick={() => setSelectedPin(fleet)}
                      style={{ top: `${fleet.lat}%`, left: `${fleet.lng}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform hover:scale-125 focus:outline-none ${
                        selectedPin?.id === fleet.id ? 'scale-125 ring-2 ring-white rounded-full' : ''
                      }`}
                      title={fleet.name}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg text-white">
                          <Truck className="h-3 w-3" />
                        </div>
                      </div>
                      <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-blue-950/90 text-blue-200 text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap pointer-events-none">
                        {fleet.speed}
                      </span>
                    </button>
                  ))}

                {/* Farm Pins */}
                {(activeMapFilter === 'all' || activeMapFilter === 'farms') &&
                  mapFarms.map((farm) => (
                    <button
                      key={farm.id}
                      onClick={() => setSelectedPin(farm)}
                      style={{ top: `${farm.lat}%`, left: `${farm.lng}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform hover:scale-125 focus:outline-none ${
                        selectedPin?.id === farm.id ? 'scale-125 ring-2 ring-white rounded-full' : ''
                      }`}
                      title={farm.name}
                    >
                      <div className="relative flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg text-white">
                          <Sprout className="h-3 w-3" />
                        </div>
                      </div>
                      <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-emerald-950/90 text-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap pointer-events-none">
                        {farm.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Bottom Quick Legend */}
              <div className="z-10 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
                <span>Click any point on the map for detailed telemetry and cold storage metrics.</span>
                <span className="text-emerald-400 font-bold">GPS Sync: Active</span>
              </div>
            </div>

            {/* Sidebar Details Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
              {selectedPin ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        selectedPin.type === 'HUB'
                          ? 'bg-purple-100 text-purple-900'
                          : selectedPin.type === 'FLEET'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {selectedPin.type} DETAILS
                    </span>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer font-bold"
                    >
                      Close
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-zinc-900 mb-1">{selectedPin.name}</h3>
                  <p className="text-xs text-zinc-500 mb-4 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    {selectedPin.region || selectedPin.route}
                  </p>

                  {/* Dynamic Metrics per type */}
                  {selectedPin.type === 'HUB' && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Temperature</span>
                          <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                            <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-600" />
                            {selectedPin.temp}
                          </span>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Occupancy</span>
                          <span className="text-sm font-black text-purple-900">
                            {selectedPin.occupiedTons} / {selectedPin.capacityTons} T
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                        <span className="text-[10px] font-bold text-purple-900 block uppercase mb-1">Key Commodities Staged</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedPin.keyCrops?.map((crop: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-white text-purple-900 rounded-md text-[10px] font-bold border border-purple-200">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-600">
                        <span className="block font-bold text-zinc-800">Manager: {selectedPin.manager}</span>
                        <span className="text-zinc-500 font-mono text-[11px]">{selectedPin.phone}</span>
                      </div>
                    </div>
                  )}

                  {selectedPin.type === 'FLEET' && (
                    <div className="space-y-3 text-xs">
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-900 block uppercase">Active Cargo</span>
                        <span className="text-xs font-bold text-zinc-900">{selectedPin.cargo}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Cargo Temp</span>
                          <span className="text-sm font-black text-cyan-700">{selectedPin.temp}</span>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">ETA Destination</span>
                          <span className="text-sm font-black text-emerald-700">{selectedPin.eta}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-600">
                        <span className="block font-bold text-zinc-800">Assigned Driver: {selectedPin.driver}</span>
                        <span className="text-zinc-500 text-[11px]">Speed: {selectedPin.speed} • GPS Verified</span>
                      </div>
                    </div>
                  )}

                  {selectedPin.type === 'FARM' && (
                    <div className="space-y-3 text-xs">
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-900 block uppercase">Active Cultivation</span>
                        <span className="text-xs font-bold text-zinc-900">{selectedPin.activeCrops}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Size</span>
                          <span className="text-sm font-black text-zinc-900">{selectedPin.size}</span>
                        </div>
                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">Soil Health</span>
                          <span className="text-sm font-black text-emerald-700">{selectedPin.soilHealth}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-zinc-600">
                        <span className="block font-bold text-zinc-800">Harvest Forecast:</span>
                        <span className="text-emerald-700 font-bold text-[11px]">{selectedPin.projectedHarvest}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex gap-2">
                    <button
                      onClick={() => onNavigate('logistics')}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Logistics Grid</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center p-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-zinc-900 text-sm">Interactive GIS Grid</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Select any marker on the map to inspect live cold-room temperatures, truck GPS coordinates, and upcoming harvest tonnage.
                  </p>
                  <div className="mt-6 w-full space-y-2 text-left text-xs">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center justify-between">
                      <span>Adama Hub Occupancy</span>
                      <span>70%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 font-bold flex items-center justify-between">
                      <span>Reefer Fleet Active</span>
                      <span>18 Vehicles</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold flex items-center justify-between">
                      <span>Harvest Ready Tons</span>
                      <span>3,420 Quintals</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. AI CROP DOCTOR & MULTIMODAL SCANNER TAB */}
      {/* ======================================================== */}
      {activeTab === 'doctor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Scanner & Input Control Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-emerald-600" />
                    <span>Multimodal Plant Diagnostic</span>
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Vision + Pathology
                  </span>
                </div>

                {/* Preset Crop Samples Carousel */}
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-2">
                    Select Diagnostic Sample or Upload Your Own:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {samplePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          selectedCropSample === preset.id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                            : 'border-zinc-200 bg-zinc-50/50 hover:bg-white'
                        }`}
                      >
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-900 block truncate">{preset.name}</span>
                          <span className="text-[10px] text-zinc-500 truncate block">Preset Diagnostic</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload Box */}
                <div>
                  <label className="text-xs font-bold text-zinc-600 block mb-1">
                    Or Upload Farm Photo / Leaf Close-up:
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-zinc-50/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {imagePreviewUrl ? (
                      <div className="relative">
                        <img
                          src={imagePreviewUrl}
                          alt="Crop Preview"
                          className="h-36 w-full object-cover rounded-xl mx-auto shadow-xs"
                        />
                        <span className="inline-block mt-2 text-[11px] font-bold text-emerald-700">
                          ✓ Image Loaded for Gemini Vision Analysis
                        </span>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                        <span className="text-xs font-bold text-zinc-700 block">Click or Drag & Drop Photo</span>
                        <span className="text-[10px] text-zinc-400">Supports JPG, PNG, WEBP</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Crop & Symptoms Text Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Crop Variety</label>
                    <input
                      type="text"
                      value={customCropName}
                      onChange={(e) => setCustomCropName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Observed Foliage & Stem Symptoms</label>
                    <textarea
                      rows={3}
                      value={symptomsInput}
                      onChange={(e) => setSymptomsInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={runCropDiagnosis}
                  disabled={diagnosing}
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {diagnosing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Diagnosing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      <span>Run AI Crop Doctor Diagnosis</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Diagnosis & Prescriptions View */}
            <div className="lg:col-span-7">
              {diagnosisResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            diagnosisResult.severityLevel === 'HIGH'
                              ? 'bg-rose-100 text-rose-900'
                              : diagnosisResult.severityLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {diagnosisResult.severityLevel} SEVERITY
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {diagnosisResult.confidenceScore}% AI Confidence
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
                        {diagnosisResult.diagnosisName}
                      </h2>
                    </div>

                    {/* Audio Speech Speaker */}
                    <button
                      onClick={toggleSpeechAudio}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        isPlayingAudio
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                      title="Listen to localized spoken audio advice"
                    >
                      {isPlayingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Advice'}</span>
                    </button>
                  </div>

                  {/* Localized Advice Alert */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold block mb-1">📢 Regional Agronomy Advisory:</span>
                    <p className="leading-relaxed">{diagnosisResult.localizedAdvice}</p>
                  </div>

                  {/* Root Causes & Pathogen */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Pathogen Classification</span>
                      <span className="font-extrabold text-zinc-900 text-sm">{diagnosisResult.pathogenType}</span>
                      <p className="text-zinc-600 mt-2 text-[11px]">{diagnosisResult.rootCauses}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Treatment Application Interval</span>
                      <span className="font-extrabold text-purple-950 text-sm">{diagnosisResult.treatmentScheduleDays}</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {diagnosisResult.affectedPlantParts?.map((part: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[10px] font-bold">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prescribed Remedies (Organic vs Chemical) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500">Prescribed Treatment Protocols</h4>

                    {/* Organic Bio-Remedy */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 mb-1">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        <span>Organic & Bio-Remedy Protocol</span>
                      </div>
                      <p className="text-emerald-950 leading-relaxed">{diagnosisResult.organicRemedy}</p>
                    </div>

                    {/* Ministry Approved Chemical Treatment */}
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
                      <div className="flex items-center gap-1.5 font-extrabold text-blue-900 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-blue-700" />
                        <span>MoA Certified Chemical / Fungicide Protocol</span>
                      </div>
                      <p className="text-blue-950 leading-relaxed">{diagnosisResult.chemicalTreatment}</p>
                    </div>
                  </div>

                  {/* Action Link into Input Marketplace */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onNavigate('inputs')}
                      className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <Sprout className="h-4 w-4" />
                      <span>Buy Prescribed Bio-Inputs & Fungicide</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('advisor')}
                      className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ask AI Agronomist</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                  <Scan className="h-12 w-12 text-zinc-300 mb-3 animate-pulse" />
                  <h3 className="text-base font-bold text-zinc-800">Ready to Analyze Crop Health</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Select a sample or upload a photo to generate an instant diagnosis with localized remedies in Amharic, Oromo, or English.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ECX PRICE ORACLE & 30-DAY TRENDS TAB */}
      {/* ======================================================== */}
      {activeTab === 'oracle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Commodity Selector List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-black uppercase text-zinc-500">Live Spot Prices</span>
                  <button
                    onClick={fetchOracleData}
                    disabled={loadingOracle}
                    className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingOracle ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {oracleData.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedOracleCrop(item)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedOracleCrop?.crop === item.crop
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-extrabold text-zinc-900">{item.crop}</span>
                        <span className="text-xs font-black text-emerald-800">
                          {item.currentPriceEtb} ETB/{item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-zinc-500">
                        <span>{item.terminalMarket}</span>
                        <span
                          className={`font-bold ${
                            item.dayChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {item.dayChangePercent >= 0 ? '+' : ''}
                          {item.dayChangePercent}% today
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Detailed Forecasting Chart & Analysis */}
            <div className="lg:col-span-7">
              {selectedOracleCrop ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {selectedOracleCrop.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-900 mt-1">
                        {selectedOracleCrop.crop}
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Primary Terminal Market: <strong className="text-zinc-700">{selectedOracleCrop.terminalMarket}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Spot Price / Quintal</span>
                      <span className="text-2xl font-black text-emerald-700">
                        {selectedOracleCrop.quintalPriceEtb.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* 30-Day Forecast Bar Graph Simulation */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
                        30-Day Predictive Price Trajectory
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Demand Index: {selectedOracleCrop.demandRating}
                      </span>
                    </div>

                    <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-zinc-800 text-white">
                      <div className="grid grid-cols-7 gap-2 items-end h-40 pt-6">
                        {selectedOracleCrop.forecast30Days.map((pt, idx) => {
                          const heightPercent = Math.min(100, Math.max(30, (pt.price / 150) * 100));
                          return (
                            <div key={idx} className="flex flex-col items-center h-full justify-end group">
                              <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                {pt.price} ETB
                              </span>
                              <div
                                style={{ height: `${heightPercent}%` }}
                                className="w-full max-w-[28px] bg-gradient-to-t from-emerald-700 to-teal-400 rounded-t-lg transition-all group-hover:brightness-125"
                              ></div>
                              <span className="text-[9px] font-semibold text-zinc-400 mt-2 truncate">{pt.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Market Advisory */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                    <span className="font-extrabold text-amber-900 block mb-1">💡 Commercial Selling Strategy:</span>
                    <p className="leading-relaxed">{selectedOracleCrop.marketAdvisory}</p>
                  </div>

                  {/* Action Link to Sell Produce */}
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => onNavigate('farmer-portal')}
                      className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>List Harvest at Current Spot Price</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SMART YIELD & ROI FORECASTER TAB */}
      {/* ======================================================== */}
      {activeTab === 'yield' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Parameters Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-black text-base text-zinc-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-700" />
                <span>Farm Yield & ROI Simulator</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Target Crop</label>
                  <select
                    value={yieldCrop}
                    onChange={(e) => setYieldCrop(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Roma Tomatoes">Roma Tomatoes</option>
                    <option value="Red Onions">Red Onions (Bombaye)</option>
                    <option value="Teff Magna">Teff Magna Grade 1</option>
                    <option value="Hass Avocados">Hass Avocados</option>
                    <option value="Highland Potatoes">Highland Potatoes</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Farm Acreage (Hectares)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={yieldHectares}
                    onChange={(e) => setYieldHectares(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Irrigation System</label>
                  <select
                    value={yieldIrrigation}
                    onChange={(e) => setYieldIrrigation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Drip Irrigation">Precision Solar Drip (+25% Yield)</option>
                    <option value="Furrow / Basin">Furrow / River Basin (+5% Yield)</option>
                    <option value="Rainfed">Rainfed (Standard Seasonal)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Seed Variety Certification</label>
                  <select
                    value={yieldSeed}
                    onChange={(e) => setYieldSeed(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="CERTIFIED_HYBRID">Certified Hybrid F1 Seed (MoA Approved)</option>
                    <option value="OPEN_POLLINATED">Standard Farm-Saved / Open Pollinated</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Fertilizer Regimen</label>
                  <select
                    value={yieldFertilizer}
                    onChange={(e) => setYieldFertilizer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="NPS_PLUS_UREA">NPS-Boron + Split Urea Top-Dressing</option>
                    <option value="ORGANIC_COMPOST">Certified Bio-Organic Compost</option>
                  </select>
                </div>
              </div>

              <button
                onClick={runYieldCalculation}
                disabled={calculatingYield}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {calculatingYield ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                <span>Calculate Projected Yield & Profit</span>
              </button>
            </div>

            {/* Right Financial & Harvest Projection Output */}
            <div className="lg:col-span-7">
              {yieldResult ? (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Harvest Projection
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-950 mt-1">
                        {yieldResult.projectedYieldQuintals.toLocaleString()} Quintals ({yieldResult.projectedYieldKg.toLocaleString()} KG)
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Estimated Harvest Ready: <strong className="text-zinc-800">{yieldResult.estimatedHarvestDate}</strong> ({yieldResult.daysToMaturity} Days)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Projected Net Profit</span>
                      <span className="text-2xl font-black text-emerald-700">
                        ETB {yieldResult.projectedNetProfitEtb.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Gross Revenue</span>
                      <span className="text-base font-black text-zinc-900">
                        ETB {yieldResult.projectedGrossRevenueEtb.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Total Input Costs</span>
                      <span className="text-base font-black text-rose-800">
                        ETB {yieldResult.totalInputCostsEtb.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 block uppercase">Estimated ROI</span>
                      <span className="text-base font-black text-emerald-700">
                        +{yieldResult.projectedRoiPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Optimal Buyer Channels Breakdown */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-3">
                      Recommended Off-Take Allocation by Channel
                    </h4>
                    <div className="space-y-2">
                      {yieldResult.recommendedBuyerChannels?.map((ch: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-zinc-900 block">{ch.channel} ({ch.sharePercent}%)</span>
                            <span className="text-[11px] text-zinc-500">{ch.benefit}</span>
                          </div>
                          <span className="font-black text-emerald-700 whitespace-nowrap ml-2">
                            {ch.targetPriceEtb} ETB/Qt
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('farmer-portal')}
                      className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Sprout className="h-4 w-4" />
                      <span>Pre-List Projected Lot into Farmer Portal</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. 24/7 AI AGRONOMIST ADVISOR CHAT TAB */}
      {/* ======================================================== */}
      {activeTab === 'advisor' && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-zinc-900">AgriLink AI Agronomist Advisor</h3>
                <span className="text-[10px] text-emerald-700 font-bold">Grounded in Ethiopian MoA Standards</span>
              </div>
            </div>

            <span className="text-[11px] text-zinc-400 font-semibold hidden sm:inline">
              Ask any agronomy, disease, or fertilization question
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(qp)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-900 text-zinc-700 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors border border-zinc-200/60"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Messages Box */}
          <div className="bg-zinc-50 rounded-2xl p-4 min-h-[340px] max-h-[460px] overflow-y-auto space-y-3 border border-zinc-100">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`text-[9px] block mt-1.5 text-right ${
                      msg.role === 'user' ? 'text-emerald-200' : 'text-zinc-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex justify-start">
                <div className="p-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-500 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  <span>AgriLink AI Agronomist is analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about fertilizer dosages, disease symptoms, or best planting seasons..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
