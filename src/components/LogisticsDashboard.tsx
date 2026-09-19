import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  MapPin,
  CircleDollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';

export const LogisticsDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/logistics/deliveries');
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data || []);
        }
      } catch (err) {
        console.error('Failed to load logistics deliveries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-zinc-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {t.logistics.operationsBadge}
              </span>
              <span className="text-xs text-amber-200">
                {currentUser?.fullName || t.logistics.carrierFleetPartner}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.logistics.bannerTitle}
            </h1>
            <p className="text-sm text-amber-100/80 max-w-xl leading-relaxed">
              {t.logistics.bannerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <LanguageSelector variant="pill" className="bg-amber-950/70 border border-amber-400/30 text-amber-100" />
            <NavLink
              to="/logistics/loadboard"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-400/30 transition-all hover:scale-102 cursor-pointer"
            >
              <Truck className="h-4 w-4" />
              <span>{t.logistics.availableLoadsBtn}</span>
            </NavLink>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.logistics.activeTripsCard}</span>
            <Truck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">2 <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{t.logistics.inTransit}</span></p>
          <p className="text-xs text-zinc-500 font-medium">{t.logistics.activeCorridors}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.logistics.fleetEarningsCard}</span>
            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">48,200 <span className="text-sm font-bold text-zinc-400">{t.common.currency}</span></p>
          <p className="text-xs text-emerald-600 font-medium">{t.logistics.settledWallet}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.logistics.completedDeliveriesCard}</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">26 <span className="text-sm font-bold text-zinc-400">{t.logistics.tripsUnit}</span></p>
          <p className="text-xs text-zinc-500 font-medium">{t.logistics.digitalReceiptSigned}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>{t.logistics.carrierRatingCard}</span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-zinc-900">4.9 <span className="text-xs font-bold text-zinc-400">{t.logistics.carrierRatingScore}</span></p>
          <p className="text-xs text-zinc-500 font-medium">{t.logistics.preferredCarrier}</p>
        </div>
      </div>

      {/* Available Load Board Preview */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">{t.logistics.loadBoardTitle}</h2>
            <p className="text-xs text-zinc-500">{t.logistics.loadBoardSubtitle}</p>
          </div>
          <NavLink
            to="/logistics/loadboard"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>{t.logistics.openLoadBoard}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </NavLink>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
                5.0T
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm">{t.logistics.wonjiRoute}</p>
                <p className="text-xs text-zinc-500">{t.logistics.wonjiDetails}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-base text-zinc-950">12,500 {t.common.currency}</span>
              <NavLink
                to="/logistics/loadboard"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-xs"
              >
                {t.logistics.acceptTrip}
              </NavLink>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
                3.5T
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm">{t.logistics.yirgacheffeRoute}</p>
                <p className="text-xs text-zinc-500">{t.logistics.yirgacheffeDetails}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-base text-zinc-950">28,000 {t.common.currency}</span>
              <NavLink
                to="/logistics/loadboard"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-xs"
              >
                {t.logistics.acceptTrip}
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
