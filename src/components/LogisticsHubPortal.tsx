import React, { useState, useEffect } from 'react';
import {
  Truck,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  Phone,
  Layers,
  ThermometerSnowflake,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { Hub, Driver, Delivery } from '../types/index.ts';

interface LogisticsHubPortalProps {
  currentUser: any;
}

export const LogisticsHubPortal: React.FC<LogisticsHubPortalProps> = ({
  currentUser,
}) => {
  const [hubsList, setHubsList] = useState<Hub[]>([]);
  const [deliveriesList, setDeliveriesList] = useState<Delivery[]>([]);
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHub, setSelectedHub] = useState<number | null>(null);

  const fetchLogisticsData = async () => {
    setLoading(true);
    try {
      const [hubsRes, delRes, drvRes] = await Promise.all([
        fetch('/api/hubs'),
        fetch('/api/logistics/deliveries'),
        fetch('/api/drivers'),
      ]);

      if (hubsRes.ok) setHubsList(await hubsRes.json());
      if (delRes.ok) setDeliveriesList(await delRes.json());
      if (drvRes.ok) setDriversList(await drvRes.json());
    } catch (err) {
      console.error('Failed to load logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const handleUpdateDeliveryStatus = async (delId: number, status: string) => {
    try {
      const res = await fetch(`/api/logistics/deliveries/${delId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          currentLat: 9.0125 + (Math.random() - 0.5) * 0.05,
          currentLng: 38.7636 + (Math.random() - 0.5) * 0.05,
          proofNotes: status === 'DELIVERED' ? 'Signed off by receiving warehouse manager.' : undefined,
        }),
      });

      if (res.ok) {
        fetchLogisticsData();
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Truck className="h-4 w-4" /> Integrated Cold-Chain Logistics & Hubs
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Farm-to-Gate Transport & Regional Staging Grid
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl">
              Real-time monitoring of refrigerated vehicle fleets, regional cross-docking hubs, and temperature-controlled urban distribution.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xs border border-white/20">
            <ThermometerSnowflake className="h-6 w-6 text-cyan-300" />
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-200 block">Cold-Chain Telemetry</span>
              <span className="text-xs font-bold text-white">4.2°C Active Average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Cold-Hubs Grid */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-700" /> Certified Agricultural Aggregation Hubs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hubsList.map((hub) => (
            <div
              key={hub.id}
              onClick={() => setSelectedHub(selectedHub === hub.id ? null : hub.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                selectedHub === hub.id
                  ? 'border-purple-600 bg-purple-50/50 shadow-md ring-1 ring-purple-600'
                  : 'border-zinc-200 bg-white hover:border-purple-400 shadow-2xs'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 uppercase">
                  {hub.region}
                </span>
                <span className="text-xs font-bold text-emerald-700">{hub.status}</span>
              </div>

              <h4 className="font-bold text-base text-zinc-900">{hub.name}</h4>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {hub.locationAddress}
              </p>

              <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 block font-bold">Storage Capacity</span>
                  <span className="font-bold text-zinc-800">{hub.storageCapacityTons} Tons</span>
                </div>
                <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 block font-bold">Current Volume</span>
                  <span className="font-bold text-purple-900">{hub.currentStorageTons} Tons</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                <span className="font-semibold">Manager: {hub.contactPerson}</span>
                <span className="text-purple-700 font-bold">{hub.contactPhone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Deliveries Fleet Management */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Active Shipments & Vehicle Fleet</h3>
            <p className="text-xs text-zinc-500">Live order transit status, assigned drivers, and proof-of-delivery timestamps</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading fleet telemetry...</div>
        ) : (
          <div className="space-y-4">
            {deliveriesList.map((del) => (
              <div
                key={del.id}
                className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 font-mono">#{del.orderNumber}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-800">
                          {del.deliveryModel}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Assigned Driver: <strong className="text-zinc-800">{del.driverName}</strong> ({del.vehiclePlate || 'ET-3-88219'})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold self-start sm:self-auto ${
                      del.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : del.status === 'IN_TRANSIT'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {del.status}
                  </span>
                </div>

                {/* Origin to Destination Route */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-zinc-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">Pickup Location</span>
                      <span className="font-semibold text-zinc-800">{del.pickupLocation}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-bold">Dropoff Destination</span>
                      <span className="font-semibold text-zinc-800">{del.dropoffLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons for Driver / Admin */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-zinc-500 font-medium">{del.estimatedArrival}</span>

                  <div className="flex items-center gap-2">
                    {del.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateDeliveryStatus(del.id, 'IN_TRANSIT')}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold cursor-pointer"
                      >
                        Start Transit (Driver Action)
                      </button>
                    )}

                    {del.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleUpdateDeliveryStatus(del.id, 'DELIVERED')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Delivery
                      </button>
                    )}

                    {del.status === 'DELIVERED' && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Proof-of-Delivery Validated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
