import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sprout,
  TrendingUp,
  Wallet,
  Tractor,
  Package,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Product } from '../types/index.ts';

export const FarmerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, aiRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/ai/market-intelligence'),
        ]);

        if (prodRes.ok) {
          const prods: Product[] = await prodRes.json();
          // Filter to this farmer's products if farmer ID exists
          const myProds = prods.filter((p) => !currentUser?.id || p.farmerId === currentUser.id || p.farmerId === 1);
          setProducts(myProds);
        }

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.trends && Array.isArray(aiData.trends)) {
            setMarketPrices(aiData.trends);
          }
        }
      } catch (err) {
        console.error('Failed to load farmer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const defaultCommodities = [
    { commodity: 'White Teff (Magna)', currentPriceEtb: 11500, unit: 'Quintal (100kg)', changePercent: 4.8, marketHub: 'Bishoftu / Ada\'a' },
    { commodity: 'Washed Yirgacheffe Coffee', currentPriceEtb: 42000, unit: 'Quintal (100kg)', changePercent: 6.2, marketHub: 'ECX Addis Ababa' },
    { commodity: 'Kabuli Chickpeas', currentPriceEtb: 7200, unit: 'Quintal (100kg)', changePercent: -1.2, marketHub: 'Gondar Central' },
    { commodity: 'Hass Avocado (Grade 1)', currentPriceEtb: 85, unit: 'KG', changePercent: 3.5, marketHub: 'Hawassa Hub' },
    { commodity: 'Red Kidney Beans', currentPriceEtb: 6400, unit: 'Quintal (100kg)', changePercent: 2.1, marketHub: 'Adama Terminal' },
  ];

  const displayPrices = marketPrices.length > 0 ? marketPrices : defaultCommodities;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Producer Operations Portal
              </span>
              <span className="text-xs text-emerald-200">
                {currentUser?.region || 'Oromia'}, Ethiopia
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentUser?.fullName || 'Farmer Partner'}
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-xl">
              Manage your harvest listings, track escrow trade settlements via Telebirr & CBE, and receive real-time AI agronomy guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <NavLink
              to="/farmer/listings"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>List New Harvest</span>
            </NavLink>
            <NavLink
              to="/farmer/ai-advisor"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>AI Crop Doctor</span>
            </NavLink>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Active Produce Batches</span>
            <Sprout className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">{products.length}</p>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Ready for buyer procurement
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Locked Escrow Balance</span>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">42,500 <span className="text-sm font-bold text-zinc-500">ETB</span></p>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Protected in Telebirr Custody
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Total Produce Sold</span>
            <Tractor className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">18.4 <span className="text-sm font-bold text-zinc-500">Tons</span></p>
          <p className="text-xs text-zinc-500 font-medium">98.4% On-time delivery rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Credit Score Rating</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">Tier 1 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Eligible</span></p>
          <p className="text-xs text-zinc-500 font-medium">CBE & Awash Bank approved</p>
        </div>
      </div>

      {/* Market Prices Ticker Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-900">Live Ethiopian Market Intelligence</h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-400">Updated Real-Time via ECX & Regional Hubs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {displayPrices.slice(0, 5).map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-zinc-800 truncate">{item.commodity || item.crop}</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-base font-black text-zinc-950">{item.currentPriceEtb?.toLocaleString() || item.priceEtb} ETB</span>
                <span className={`text-[11px] font-bold ${Number(item.changePercent || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {Number(item.changePercent || 0) >= 0 ? '+' : ''}{item.changePercent || 0}%
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 truncate">{item.marketHub || item.region || 'Addis Ababa'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Listings Preview */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">My Live Harvest Batches</h2>
            <p className="text-xs text-zinc-500">Currently visible to commercial buyers and verified processors</p>
          </div>
          <NavLink
            to="/farmer/listings"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({products.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </NavLink>
        </div>

        <div className="divide-y divide-zinc-100">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-900 text-sm">{p.name}</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.grade || 'Grade 1'}
                    </span>
                    {p.isOrganic && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        Organic
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {p.farmLocation || p.region} • Available: {p.availableQuantity} {p.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right">
                  <span className="text-base font-black text-zinc-950">{p.pricePerUnitEtb} ETB</span>
                  <span className="text-xs text-zinc-500"> / {p.unit}</span>
                </div>
                <NavLink
                  to="/farmer/listings"
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  Manage
                </NavLink>
              </div>
            </div>
          ))}

          {products.length === 0 && !loading && (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-sm font-semibold">No harvest batches listed yet.</p>
              <NavLink
                to="/farmer/listings"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Create your first listing
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
