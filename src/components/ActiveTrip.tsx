import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  Weight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Navigation,
  FileCheck,
  QrCode,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { Delivery } from '../types/index.ts';

export const ActiveTrip: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, currentLanguage } = useTranslation();

  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [iotWeight, setIotWeight] = useState<any | null>(null);
  const [loadingWeight, setLoadingWeight] = useState(false);
  const [simulatingWeight, setSimulatingWeight] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchActiveDelivery = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/deliveries');
      if (res.ok) {
        const deliveries: Delivery[] = await res.json();
        // Look for an assigned or in-transit delivery
        const active = deliveries.find(
          (d) => d.status === 'ASSIGNED' || d.status === 'IN_TRANSIT' || d.status === 'ARRIVED_PICKUP'
        ) || deliveries[0];
        setActiveDelivery(active || null);
        if (active) {
          fetchIotWeight(active.orderId);
        }
      }
    } catch (err) {
      console.error('Failed to load active delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIotWeight = async (orderId: number | string) => {
    setLoadingWeight(true);
    try {
      const res = await fetch(`/api/iot/weight-log/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setIotWeight(data);
      } else {
        setIotWeight(null);
      }
    } catch (err) {
      console.warn('IoT weight proxy offline or no data recorded yet');
      setIotWeight(null);
    } finally {
      setLoadingWeight(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeDelivery) return;
    setUpdatingStatus(true);
    setToastMsg(null);

    try {
      const res = await fetch(`/api/logistics/deliveries/${activeDelivery.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          proofNotes: `Transit step completed: ${newStatus}`,
        }),
      });

      if (res.ok) {
        setToastMsg({
          type: 'success',
          text: `Delivery status updated to ${newStatus.replace(/_/g, ' ')}!`,
        });
        setActiveDelivery({ ...activeDelivery, status: newStatus as any });
      } else {
        const err = await res.json();
        setToastMsg({ type: 'error', text: err.error || 'Status update failed.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSimulateIotScale = async () => {
    if (!activeDelivery) return;
    setSimulatingWeight(true);
    try {
      const generatedWeight = (4200 + Math.random() * 600).toFixed(1);
      const res = await fetch('/api/iot/weight-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: 'SCALE-MOJO-CORRIDOR-08',
          cargo_weight_kg: Number(generatedWeight),
          order_id: String(activeDelivery.orderId),
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setIotWeight(json.data || json);
        setToastMsg({
          type: 'success',
          text: `IoT checkpoint scale logged: ${generatedWeight} KG (Receipt: ${json.receipt_id || 'VERIFIED'})`,
        });
      } else {
        const err = await res.json();
        setToastMsg({ type: 'error', text: err.error || 'IoT scale service unavailable.' });
      }
    } catch (err) {
      setToastMsg({ type: 'error', text: 'IoT service connection error. Start flask_ai/app.py.' });
    } finally {
      setSimulatingWeight(false);
    }
  };

  const steps: { key: Delivery['status']; label: string }[] = [
    { key: 'ASSIGNED', label: 'Assigned & Dispatched' },
    { key: 'ARRIVED_PICKUP', label: 'Arrived at Farm Pickup' },
    { key: 'IN_TRANSIT', label: 'Loaded & En Route' },
    { key: 'DELIVERED', label: 'Delivered at Destination' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === activeDelivery?.status);
  const effectiveIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-zinc-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-sm font-semibold text-zinc-600">Loading active trip telemetry...</p>
      </div>
    );
  }

  if (!activeDelivery) {
    return (
      <div className="p-16 text-center space-y-4 bg-white rounded-3xl border border-zinc-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Truck className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900">No Active Hauls in Transit</h2>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          You currently have no dispatches in progress. Visit the National Load Board to accept and haul available produce loads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-amber-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Live Freight Transit
              </span>
              <span className="text-xs text-amber-200">
                Order #{activeDelivery.orderId} • Tracking: {activeDelivery.trackingNumber || `DEL-${activeDelivery.id}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Active Transit Dispatch
            </h1>
            <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
              Verify milestones along the transit corridor. Escrow funds will automatically be unlocked upon verified destination arrival.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                fetchActiveDelivery();
              }}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              title="Refresh Trip"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
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

      {/* Progress Stepper */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Milestone Progression</h2>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {steps.map((step, idx) => {
            const isCompleted = idx <= effectiveIdx;
            const isCurrent = idx === effectiveIdx;
            return (
              <div key={step.key} className="flex sm:flex-col items-center gap-3 relative z-10 w-full">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-50'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="sm:text-center">
                  <p className={`text-xs font-bold ${isCurrent ? 'text-zinc-950' : 'text-zinc-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Upcoming'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-3">
          {effectiveIdx === 0 && (
            <button
              onClick={() => handleUpdateStatus('ARRIVED_PICKUP')}
              disabled={updatingStatus}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              1. Confirm Arrived at Pickup
            </button>
          )}

          {effectiveIdx === 1 && (
            <button
              onClick={() => handleUpdateStatus('IN_TRANSIT')}
              disabled={updatingStatus}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              2. Confirm Loaded & Departed
            </button>
          )}

          {effectiveIdx === 2 && (
            <button
              onClick={() => handleUpdateStatus('DELIVERED')}
              disabled={updatingStatus}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              3. Confirm Final Delivery at Destination
            </button>
          )}

          {effectiveIdx >= 3 && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> All Milestones Completed & Escrow Ready
            </span>
          )}
        </div>
      </div>

      {/* Grid: Route Details & Live IoT Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Details Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-zinc-900">Freight Corridor Waypoints</h2>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Origin Farm Depot</span>
                <p className="text-sm font-bold text-zinc-950 mt-0.5">{activeDelivery.pickupAddress || 'Bishoftu Cooperative Packhouse'}</p>
                <span className="text-xs text-zinc-500">Contact: +251 91 122 3344</span>
              </div>
            </div>

            <div className="border-l-2 border-dashed border-zinc-200 ml-1.5 pl-4 py-1">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                National Expressway Corridor (A1)
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0 ring-4 ring-rose-100" />
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Destination Delivery Point</span>
                <p className="text-sm font-bold text-zinc-950 mt-0.5">{activeDelivery.dropoffAddress || 'Kality Grain Terminal, Addis Ababa'}</p>
                <span className="text-xs text-zinc-500">Buyer Restocking Bay #4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live IoT Cargo Weight Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-zinc-900">Verifiable IoT Weight Log</h2>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              SHA-256 Verified
            </span>
          </div>

          {loadingWeight ? (
            <div className="p-8 text-center text-zinc-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600" />
              <p className="text-xs mt-2">Checking scale telemetry...</p>
            </div>
          ) : iotWeight ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Recorded Scale Weight</span>
                  <p className="text-2xl font-black text-blue-950 mt-0.5">
                    {Number(iotWeight.weight_kg).toLocaleString()} <span className="text-xs font-bold text-blue-700">KG</span>
                  </p>
                  <span className="text-[11px] text-blue-800">
                    ≈ {(Number(iotWeight.weight_kg) / 100).toFixed(1)} Quintals
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-1 text-xs text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-mono">
                <p className="truncate">
                  <span className="text-zinc-400">Receipt ID:</span> {iotWeight.receipt_id || 'ETH-IOT-VERIFIED-RECEIPT'}
                </p>
                <p>
                  <span className="text-zinc-400">Scale Device:</span> {iotWeight.device_id || 'SCALE-CHECKPOINT-01'}
                </p>
                <p className="truncate">
                  <span className="text-zinc-400">Logged:</span> {new Date(iotWeight.logged_at || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-2">
              <p className="text-xs font-semibold text-zinc-600">No Weight Telemetry Recorded Yet</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                Once the vehicle drives onto the calibrated highway weighbridge scale, the measurement will sync here automatically.
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Tamper-proof weighbridge
            </span>
            <button
              onClick={handleSimulateIotScale}
              disabled={simulatingWeight}
              className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {simulatingWeight ? 'Weighing...' : 'Simulate IoT Scale Check'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
