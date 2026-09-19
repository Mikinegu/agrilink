import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { Order } from '../types/index.ts';

export const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        }
      } catch (err) {
        console.error('Failed to load buyer orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {t.buyer.hubBadge}
              </span>
              <span className="text-xs text-blue-200">
                {currentUser?.organizationName || t.buyer.enterpriseBuyerFallback}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.buyer.procurementTitle}
            </h1>
            <p className="text-sm text-blue-100/80 max-w-xl">
              {t.buyer.procurementSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <NavLink
              to="/buyer/marketplace"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-102 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t.buyer.exploreMarketplaceBtn}</span>
            </NavLink>
            <NavLink
              to="/buyer/requests"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm border border-white/20 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-blue-300" />
              <span>{t.buyer.postBuyRequestBtn}</span>
            </NavLink>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.buyer.activeOrdersTitle}</span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">{orders.length || 3}</p>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" /> {t.buyer.inTransitDesc}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.buyer.escrowCapitalTitle}</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">185,000 <span className="text-sm font-bold text-zinc-400">{t.common.currency}</span></p>
          <p className="text-xs text-emerald-600 font-medium">{t.buyer.safeUntilInspectionDesc}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.buyer.verifiedNetworkTitle}</span>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">42 <span className="text-sm font-bold text-zinc-400">{t.buyer.farmsUnit}</span></p>
          <p className="text-xs text-zinc-500 font-medium">{t.buyer.regionsDesc}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.buyer.deliveryTimeTitle}</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">36 <span className="text-sm font-bold text-zinc-400">{t.buyer.hoursUnit}</span></p>
          <p className="text-xs text-emerald-600 font-medium">{t.buyer.crossDockDesc}</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavLink
          to="/buyer/marketplace"
          className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-emerald-500 shadow-xs group transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-zinc-900 text-base mb-1">{t.buyer.directSourcingTitle}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {t.buyer.directSourcingDesc}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
            <span>{t.buyer.openMarketplaceLink}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </NavLink>

        <NavLink
          to="/buyer/orders"
          className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-blue-500 shadow-xs group transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-zinc-900 text-base mb-1">{t.buyer.trackShipmentsTitle}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {t.buyer.trackShipmentsDesc}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
            <span>{t.buyer.viewActiveOrdersLink}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </NavLink>

        <NavLink
          to="/buyer/escrow"
          className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-purple-500 shadow-xs group transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-zinc-900 text-base mb-1">{t.buyer.escrowCustodyTitle}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {t.buyer.escrowCustodyDesc}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700">
            <span>{t.buyer.manageEscrowLink}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </NavLink>
      </div>
    </div>
  );
};

