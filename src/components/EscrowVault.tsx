import React, { useState } from 'react';
import {
  DistressedLot,
  EscrowVaultRecord,
  GateQaInspection,
  ExchangeRole,
} from '../types/marketplace.ts';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  DollarSign,
  Building2,
  Tractor,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface EscrowVaultProps {
  lots: DistressedLot[];
  activeRole: ExchangeRole;
  onConfirmGateQaAndRelease: (
    lotId: string,
    qaData: {
      inspectorName: string;
      verifiedBrix: number;
      verifiedDefectRate: number;
      comments: string;
    }
  ) => void;
}

export const EscrowVault: React.FC<EscrowVaultProps> = ({
  lots,
  activeRole,
  onConfirmGateQaAndRelease,
}) => {
  // Gate QA Inspection Inspection Form State
  const [activeInspectionLotId, setActiveInspectionLotId] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState('Dr. Dawit Haile (Lead Chemist)');
  const [testedBrix, setTestedBrix] = useState(5.8);
  const [testedDefect, setTestedDefect] = useState(36);
  const [qaComments, setQaComments] = useState(
    'Refractometer confirms 5.8°Bx. Pulp viscosity passed. Clean hot-break pasteurization approved.'
  );

  // Filter lots that have escrow vault records
  const escrowLots = lots.filter((l) => l.escrowVault);

  const totalVaultLocked = escrowLots.reduce((acc, l) => {
    if (l.escrowVault?.escrowStatus === 'FUNDS_LOCKED' || l.escrowVault?.escrowStatus === 'QA_PASSED') {
      return acc + l.escrowVault.totalDepositedEtb;
    }
    return acc;
  }, 0);

  const totalVaultDisbursed = escrowLots.reduce((acc, l) => {
    if (l.escrowVault?.escrowStatus === 'DISBURSED') {
      return acc + l.escrowVault.totalDepositedEtb;
    }
    return acc;
  }, 0);

  const handleReleaseSubmit = (lotId: string) => {
    onConfirmGateQaAndRelease(lotId, {
      inspectorName,
      verifiedBrix: testedBrix,
      verifiedDefectRate: testedDefect,
      comments: qaComments,
    });
    setActiveInspectionLotId(null);
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Total Funds Locked in Vault</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-400">
            {totalVaultLocked.toLocaleString()} <span className="text-sm font-normal text-zinc-400">ETB</span>
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">
            Chapa / Telebirr Tri-Party Protected
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Total Settled & Disbursed</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Unlock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            {totalVaultDisbursed.toLocaleString()} <span className="text-sm font-normal text-zinc-400">ETB</span>
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">
            Zero-Default Salvage Transactions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-400">Gate QA Refractometer Gate</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400">100% Tested</p>
          <p className="text-[10px] text-zinc-400 mt-1">
            Digital Brix & Physical Defect Sign-off
          </p>
        </div>
      </div>

      {/* Escrow Ledger Cards */}
      <div className="space-y-4">
        {escrowLots.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-zinc-200">
            <ShieldCheck className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900">Vault Currently Clear</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Escrow locks occur automatically upon an accepted negotiation, segregating funds until physical factory gate quality confirmation.
            </p>
          </div>
        ) : (
          escrowLots.map((lot) => {
            const vault = lot.escrowVault!;
            const isDisbursed = vault.escrowStatus === 'DISBURSED';
            const isInspecting = activeInspectionLotId === lot.id;

            return (
              <div
                key={lot.id}
                className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-5"
              >
                {/* Vault Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl ${
                        isDisbursed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {isDisbursed ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-zinc-900">
                          Vault Deposit #{vault.depositTransactionRef}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            isDisbursed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {vault.escrowStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Commodity: <strong className="text-zinc-900">{lot.commodity}</strong> ({lot.lotWeightTons} MT) • Farmer: {lot.farmerName} • Processor: RedGold Foods Ltd.
                      </p>
                    </div>
                  </div>

                  {/* Top Right Action */}
                  <div className="flex items-center gap-2">
                    {!isDisbursed && (
                      <button
                        onClick={() => {
                          setActiveInspectionLotId(isInspecting ? null : lot.id);
                          setTestedBrix(lot.brixRating);
                          setTestedDefect(lot.defectPercentage);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
                      >
                        <FileCheck className="h-4 w-4" />
                        <span>Perform Gate QA & Release</span>
                      </button>
                    )}

                    {isDisbursed && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Settled: {vault.disbursedAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tri-Party Allocation Split Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                    <p className="text-[10px] text-zinc-400">Total Escrow Deposit</p>
                    <p className="text-base font-black text-zinc-900 mt-0.5">
                      {vault.totalDepositedEtb.toLocaleString()} ETB
                    </p>
                    <p className="text-[10px] text-zinc-500">100% Buyer Funded</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <Tractor className="h-3 w-3" /> Farmer Payout Allocation
                    </p>
                    <p className="text-base font-black text-emerald-800 mt-0.5">
                      {vault.farmerAllocationEtb.toLocaleString()} ETB
                    </p>
                    <p className="text-[10px] text-emerald-600">Post 2.5% Platform Fee</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                    <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Carrier Reefer Freight
                    </p>
                    <p className="text-base font-black text-amber-800 mt-0.5">
                      {vault.carrierAllocationEtb.toLocaleString()} ETB
                    </p>
                    <p className="text-[10px] text-amber-600">SwiftReefer Logistics</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
                    <p className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Platform Commission
                    </p>
                    <p className="text-base font-black text-purple-800 mt-0.5">
                      {vault.platformCommissionEtb.toLocaleString()} ETB
                    </p>
                    <p className="text-[10px] text-purple-600">2.5% Tri-Party Clearing</p>
                  </div>
                </div>

                {/* Gate QA Inspection Form (When Toggled) */}
                {isInspecting && (
                  <div className="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4" />
                        Quality Verification Gate (Dukem Receiving Bay #4)
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        Refractometer & Pulp Inspection Desk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                          Verified Brix Refractometer (°Bx)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={testedBrix}
                          onChange={(e) => setTestedBrix(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white"
                        />
                        <p className="text-[9px] text-zinc-400 mt-1">
                          Minimum 5.2°Bx required for paste extraction
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                          Verified Defect Rate (%)
                        </label>
                        <input
                          type="number"
                          value={testedDefect}
                          onChange={(e) => setTestedDefect(parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white"
                        />
                        <p className="text-[9px] text-zinc-400 mt-1">
                          Tested against harvest reporting ticket
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                          Lead Chemist / Inspector Name
                        </label>
                        <input
                          type="text"
                          value={inspectorName}
                          onChange={(e) => setInspectorName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        Inspector Verification Comments:
                      </label>
                      <input
                        type="text"
                        value={qaComments}
                        onChange={(e) => setQaComments(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveInspectionLotId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReleaseSubmit(lot.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                      >
                        <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                        <span>Confirm Gate QA & Release Escrow</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Gate QA Audit Record if previously verified */}
                {vault.gateQa && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Gate QA Verified by {vault.gateQa.inspectorName}
                      </span>
                      <span className="text-[10px] text-zinc-500">{vault.gateQa.inspectedAt}</span>
                    </div>
                    <p className="text-zinc-600 text-[11px]">
                      Verified Solids: <strong>{vault.gateQa.verifiedBrix}°Bx</strong> • Defect Rate: <strong>{vault.gateQa.verifiedDefectRate}%</strong> • Status: PASSED
                    </p>
                    <p className="text-[11px] text-zinc-500 italic">
                      "{vault.gateQa.inspectionNotes}"
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
