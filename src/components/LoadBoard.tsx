import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
  Weight,
  CircleDollarSign,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { Delivery } from '../types/index.ts';

export const LoadBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, currentLanguage } = useTranslation();

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT'>('ALL');
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/deliveries');
      if (res.ok) {
        const data = await res.json();
        setDeliveries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load deliveries load board:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleAcceptJob = async (deliveryId: number) => {
    setAcceptingId(deliveryId);
    setToastMsg(null);
    try {
      const res = await fetch(`/api/logistics/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ASSIGNED',
          driverId: currentUser?.id || 1,
          proofNotes: `Accepted by Driver ${currentUser?.fullName || 'Fleet Partner'}`,
        }),
      });

      if (res.ok) {
        setToastMsg({
          type: 'success',
          text: currentLanguage === 'am'
            ? 'ጭነቱን በተሳካ ሁኔታ ተረክበዋል! ወደ ንቁ ጉዞዎች ተዘዋውሯል።'
            : currentLanguage === 'om'
            ? 'Fe\'isa kana milkaa\'inaan fudhattaniittu!'
            : 'Load accepted successfully! Dispatched to your Active Trip manager.',
        });
        fetchDeliveries();
      } else {
        const err = await res.json();
        setToastMsg({ type: 'error', text: err.error || 'Failed to accept haul.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Network connection issue. Please retry.' });
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredLoads = deliveries.filter((d) => {
    const matchesSearch =
      d.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.pickupAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dropoffAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-zinc-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-amber-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {currentLanguage === 'am' ? 'የሎጅስቲክስ ጭነት ቦርድ' : currentLanguage === 'om' ? 'Boordii Fe\'isaa' : 'National Freight Load Board'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentLanguage === 'am' ? 'የሚገኙ የግብርና ምርት ጭነቶች' : currentLanguage === 'om' ? 'Fe\'isaalee Midhaanii Qophaa\'an' : 'Available Produce Freight Hauls'}
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
              {currentLanguage === 'am'
                ? 'በመላው ኢትዮጵያ ከገበሬዎች እና ህብረት ስራ ማህበራት ወደ ማዕከላዊ ገበያዎች የሚጓጓዙ የተረጋገጡ ጭነቶችን ያግኙ።'
                : 'Browse verified agricultural freight corridors with instant escrow settlement upon verified delivery.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchDeliveries();
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              title="Refresh Load Board"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {toastMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'የሚገኙ ጭነቶች' : 'Available Loads'}</span>
          <p className="text-2xl font-black text-amber-600">
            {deliveries.filter((d) => d.status === 'PENDING' || !d.status).length}
          </p>
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Ready for pickup
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'በጉዞ ላይ ያሉ' : 'Active In-Transit'}</span>
          <p className="text-2xl font-black text-blue-600">
            {deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'ASSIGNED').length}
          </p>
          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Fleet moving
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'የተጠናቀቁ ጉዞዎች' : 'Delivered Hauls'}</span>
          <p className="text-2xl font-black text-emerald-600">
            {deliveries.filter((d) => d.status === 'DELIVERED').length}
          </p>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Escrow settled
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'የክፍያ ዋስትና' : 'Escrow Security'}</span>
          <p className="text-2xl font-black text-zinc-900">100%</p>
          <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Chapa / CBE Birr Lock
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={currentLanguage === 'am' ? 'በመነሻ፣ መዳረሻ ወይም መለያ ይፈልጉ...' : 'Search corridors, tracking #...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st === 'ALL'
                ? 'All Freight'
                : st === 'PENDING'
                ? 'Open Loads'
                : st === 'ASSIGNED'
                ? 'Assigned'
                : 'In Transit'}
            </button>
          ))}
        </div>
      </div>

      {/* Load Board Cards */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 space-y-3 bg-white rounded-2xl border border-zinc-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
          <p className="text-sm font-medium">Loading freight corridors...</p>
        </div>
      ) : filteredLoads.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 space-y-3 bg-white rounded-2xl border border-zinc-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold">No loads available matching your filters</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Check back shortly or reset your corridor filters. Produce loads are posted 24/7 during active regional harvest cycles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredLoads.map((load) => {
            const isOpen = load.status === 'PENDING' || !load.status;
            return (
              <div
                key={load.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top: Tracking and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                      #{load.id}
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-900">{load.trackingNumber || `DEL-${load.id}`}</span>
                      <p className="text-[11px] text-zinc-400">Order #{load.orderId}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isOpen
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : load.status === 'IN_TRANSIT'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {isOpen ? 'AVAILABLE' : load.status}
                  </span>
                </div>

                {/* Middle: Route Info */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pickup Origin</span>
                      <p className="text-xs font-bold text-zinc-900 leading-tight">
                        {load.pickupAddress || 'Bishoftu Regional Aggregation Hub'}
                      </p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-zinc-200 ml-1 pl-3.5 py-0.5" />

                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination</span>
                      <p className="text-xs font-bold text-zinc-900 leading-tight">
                        {load.dropoffAddress || 'Addis Ababa Central Produce Terminal'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Est. Cargo</span>
                    <span className="font-bold text-zinc-900 flex items-center gap-1 mt-0.5">
                      <Weight className="w-3.5 h-3.5 text-zinc-500" />
                      5.0 Metric Tons
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-semibold text-emerald-700 block">Guaranteed Payout</span>
                    <span className="font-black text-emerald-800 text-sm mt-0.5 block">
                      3,800 ETB
                    </span>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Immediate Dispatch
                  </span>

                  {isOpen ? (
                    <button
                      onClick={() => handleAcceptJob(load.id)}
                      disabled={acceptingId === load.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{acceptingId === load.id ? 'Accepting...' : 'Accept Haul'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-zinc-500">
                      Driver Dispatched
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
