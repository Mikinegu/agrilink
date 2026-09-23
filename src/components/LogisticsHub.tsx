import React, { useState } from 'react';
import {
  DistressedLot,
  DispatchJob,
  ExchangeRole,
} from '../types/marketplace.ts';
import {
  Truck,
  Thermometer,
  Droplets,
  MapPin,
  Clock,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Navigation as NavIcon,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
} from 'lucide-react';

interface LogisticsHubProps {
  lots: DistressedLot[];
  activeRole: ExchangeRole;
  onAdvanceTransitStatus?: (lotId: string, nextStatus: 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_AT_GATE') => void;
}

export const LogisticsHub: React.FC<LogisticsHubProps> = ({
  lots,
  activeRole,
  onAdvanceTransitStatus,
}) => {
  const [selectedBolJob, setSelectedBolJob] = useState<{
    lot: DistressedLot;
    job: DispatchJob;
  } | null>(null);

  // Filter lots that have active or completed dispatches
  const dispatchLots = lots.filter(
    (l) => l.dispatchJob || l.status === 'LOCKED_IN_ESCROW' || l.status === 'DISPATCHED' || l.status === 'IN_TRANSIT' || l.status === 'ARRIVED_AT_GATE'
  );

  return (
    <div className="space-y-6">
      {/* Fleet Telematics Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Active Dispatches</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {dispatchLots.length}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Reefer & Dry Cargo Fleet</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Target Temp Spec</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-400">0°C – 4°C</p>
          <p className="text-[10px] text-zinc-400 mt-1">Controlled Reefer Envelope</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Humidity Target</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">85% – 92%</p>
          <p className="text-[10px] text-zinc-400 mt-1">Pre-Rot Prevention</p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">e-BoL Status</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">100% Digital</p>
          <p className="text-[10px] text-zinc-400 mt-1">QR Gate Pass Verification</p>
        </div>
      </div>

      {/* Dispatches List */}
      <div className="space-y-4">
        {dispatchLots.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-zinc-200">
            <Truck className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">No Dispatched Shipments Yet</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              When an industrial processor's offer or farmer's counter-offer is accepted, a temperature-controlled reefer job is automatically created here.
            </p>
          </div>
        ) : (
          dispatchLots.map((lot) => {
            const job = lot.dispatchJob;
            if (!job) return null;

            return (
              <div
                key={lot.id}
                className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-sm hover:shadow-md transition-shadow space-y-5"
              >
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-zinc-950">
                          Shipment #{job.bolNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            job.vehicleType === 'TEMPERATURE_CONTROLLED_REEFER'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                          }`}
                        >
                          {job.vehicleType === 'TEMPERATURE_CONTROLLED_REEFER'
                            ? 'Cold-Chain Reefer (0°C to 4°C)'
                            : 'Ventilated Dry Truck'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {job.transitStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Cargo: <strong className="text-zinc-900">{lot.commodity}</strong> ({lot.lotWeightTons} MT) • Driver: {job.driverName} ({job.plateNumber})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBolJob({ lot, job })}
                      className="px-3.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                      <span>View e-BoL</span>
                    </button>

                    {/* Step Advance Control for Carriers */}
                    {onAdvanceTransitStatus && job.transitStatus !== 'ARRIVED_AT_GATE' && (
                      <button
                        onClick={() => {
                          const next =
                            job.transitStatus === 'DISPATCHED'
                              ? 'LOADING'
                              : job.transitStatus === 'LOADING'
                              ? 'IN_TRANSIT'
                              : 'ARRIVED_AT_GATE';
                          onAdvanceTransitStatus(lot.id, next);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>
                          Advance: {job.transitStatus === 'DISPATCHED' ? 'Mark Loaded' : job.transitStatus === 'LOADING' ? 'Depart In-Transit' : 'Arrive at Factory Gate'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Telematics Gauges & Corridor Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gauge 1: Container Temp */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-blue-600" />
                        Reefer Core Temp
                      </span>
                      <p className="text-2xl font-black text-blue-700 mt-1">
                        {job.currentTempCelsius}°C
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Target: {job.targetTempRange}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      OK
                    </div>
                  </div>

                  {/* Gauge 2: Container Humidity */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5 text-teal-600" />
                        Relative Humidity
                      </span>
                      <p className="text-2xl font-black text-teal-700 mt-1">
                        {job.currentHumidityPercent}%
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Target: 88% RH
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                      OK
                    </div>
                  </div>

                  {/* Gauge 3: Corridor Transit ETA */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Factory Arrival ETA
                      </span>
                      <p className="text-2xl font-black text-zinc-900 mt-1">
                        {job.transitMinutesRemaining} mins
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {job.totalDistanceKm} km Corridor
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                      LIVE
                    </div>
                  </div>
                </div>

                {/* GPS Waypoints Simulator Strip */}
                <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <NavIcon className="h-3.5 w-3.5 text-emerald-400" />
                      Live Transit Waypoints (Wonji Packhouse → Dukem Processing Plant)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      IoT Telematics Connected (GPS + Sensitech Probe)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    {(job.waypoints || []).map((wp, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                          wp.passed
                            ? 'bg-emerald-950/80 border border-emerald-700/70 text-emerald-200'
                            : 'bg-zinc-800/60 border border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${
                            wp.passed ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-bold truncate text-[11px]">{wp.name}</p>
                          <p className="text-[9px] opacity-70">
                            {wp.passed ? 'Cleared' : 'Pending Waypoint'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Digital Bill of Lading (e-BoL) Modal */}
      {selectedBolJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* BoL Top Bar */}
            <div className="flex items-center justify-between border-b pb-4 border-zinc-200">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-emerald-600" />
                <div>
                  <h3 className="text-base font-black text-zinc-950">
                    DIGITAL BILL OF LADING (e-BoL)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Doc Ref: #{selectedBolJob.job.bolNumber} • AgriLink Cold-Chain Protocol
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBolJob(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BoL Printable Sheet */}
            <div className="border border-zinc-300 rounded-2xl p-5 space-y-4 text-xs font-mono bg-zinc-50/50">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-200">
                <div>
                  <p className="font-bold text-zinc-500 uppercase text-[10px]">Shipper / Consignor</p>
                  <p className="font-black text-zinc-900 text-sm mt-0.5">{selectedBolJob.lot.farmerOrg}</p>
                  <p className="text-zinc-600">{selectedBolJob.lot.locationDetails}</p>
                  <p className="text-zinc-600">Contact: {selectedBolJob.lot.farmerName}</p>
                </div>
                <div>
                  <p className="font-bold text-zinc-500 uppercase text-[10px]">Consignee / Processing Plant</p>
                  <p className="font-black text-zinc-900 text-sm mt-0.5">{selectedBolJob.job.destinationPlant}</p>
                  <p className="text-zinc-600">Receiving Bay #4, Dukem Industrial Park</p>
                  <p className="text-zinc-600">Escrow Ref: #ESC-992384</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-zinc-200">
                <div>
                  <p className="text-zinc-500 text-[10px]">Commodity</p>
                  <p className="font-bold text-zinc-900">{selectedBolJob.lot.commodity}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px]">Certified Weight</p>
                  <p className="font-bold text-zinc-900">
                    {selectedBolJob.lot.lotWeightTons} MT ({selectedBolJob.lot.lotWeightKg} KG)
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px]">Refractometer Solids</p>
                  <p className="font-bold text-amber-700">{selectedBolJob.lot.brixRating}°Bx Sugar</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-zinc-200">
                <div>
                  <p className="text-zinc-500 text-[10px]">Carrier Fleet</p>
                  <p className="font-bold text-zinc-900">{selectedBolJob.job.carrierOrg}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px]">Driver / License Plate</p>
                  <p className="font-bold text-zinc-900">
                    {selectedBolJob.job.driverName} ({selectedBolJob.job.plateNumber})
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px]">Thermal Setting</p>
                  <p className="font-bold text-blue-700">Reefer {selectedBolJob.job.targetTempRange}</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-900">Gate QA Refractometer Pass-Through</p>
                  <p className="text-[10px] text-zinc-500">
                    Quality inspector requires minimum {selectedBolJob.lot.brixRating}°Bx and under {selectedBolJob.lot.defectPercentage}% defect rate for automated escrow release.
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  QR
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedBolJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Export e-BoL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
