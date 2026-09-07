import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Lock,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const FarmerEscrowWallet: React.FC = () => {
  const { currentUser } = useAuth();
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escrow/ledger');
      if (res.ok) {
        const data = await res.json();
        setLedger(data.ledger || []);
      }
    } catch (err) {
      console.error('Failed to fetch escrow ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const defaultLedgerEntries = [
    {
      id: 'ESC-2026-0901',
      orderId: 'ORD-7821',
      crop: 'White Teff (Magna)',
      buyerName: 'Addis Food Processors SC',
      amountEtb: 42500,
      status: 'LOCKED',
      heldSince: '2026-09-04',
      provider: 'Telebirr Custody',
      txRef: 'TX-TB-9823412',
    },
    {
      id: 'ESC-2026-0884',
      orderId: 'ORD-7790',
      crop: 'Washed Yirgacheffe Grade 1',
      buyerName: 'Abyssinia Specialty Roasters',
      amountEtb: 84000,
      status: 'RELEASED',
      heldSince: '2026-08-28',
      releasedAt: '2026-08-31',
      provider: 'CBE Direct Settlement',
      txRef: 'CBE-FT-849201',
    },
    {
      id: 'ESC-2026-0862',
      orderId: 'ORD-7642',
      crop: 'Kabuli Chickpeas (25 Quintals)',
      buyerName: 'Bishoftu Grain Millers Co-op',
      amountEtb: 36000,
      status: 'RELEASED',
      heldSince: '2026-08-20',
      releasedAt: '2026-08-23',
      provider: 'Telebirr Custody',
      txRef: 'TX-TB-6512390',
    },
  ];

  const displayEntries = ledger.length > 0 ? ledger : defaultLedgerEntries;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Escrow Wallet & Payouts</h1>
          <p className="text-sm text-zinc-500">
            Guaranteed payment protection via National Bank compliant Telebirr & CBE escrow custody.
          </p>
        </div>

        <button
          onClick={fetchLedger}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Locked in Custody</span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Lock className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black">42,500 <span className="text-sm font-bold text-blue-200">ETB</span></p>
            <p className="text-xs text-blue-100/80 mt-1">1 shipment in active freight transit</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs text-blue-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Funds secured by Chapa & Telebirr</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Settled & Payouts</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-900">120,000 <span className="text-sm font-bold text-zinc-400">ETB</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Directly disbursed to your CBE account</p>
          </div>
          <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-400">
            Account: CBE •••• 8492 (Bekele Tadesse)
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Protection Rate</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-900">100%</p>
            <p className="text-xs text-zinc-500 mt-1">Zero buyer default on verified harvests</p>
          </div>
          <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-400">
            Auto-release after 24h of confirmed receipt
          </div>
        </div>
      </div>

      {/* Escrow Ledger Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">Escrow Custody Transactions</h2>
          <p className="text-xs text-zinc-500">Every birr locked prior to harvest dispatch until verified delivery</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3.5 px-4">Transaction / Order</th>
                <th className="py-3.5 px-4">Buyer & Produce</th>
                <th className="py-3.5 px-4">Settlement Channel</th>
                <th className="py-3.5 px-4">Amount (ETB)</th>
                <th className="py-3.5 px-4 text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayEntries.map((row: any, idx: number) => {
                const isLocked = row.status?.toLowerCase() === 'locked';
                return (
                  <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-zinc-900 text-sm">{row.id || row.escrow_id || `ESC-2026-${idx + 1}`}</p>
                      <p className="text-xs text-zinc-400 font-mono">{row.orderId || row.order_id || 'ORD-VERIFIED'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-zinc-900 text-sm">{row.crop || 'Agricultural Harvest'}</p>
                      <p className="text-xs text-zinc-500">{row.buyerName || 'Verified Institutional Buyer'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                        <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{row.provider || 'Telebirr Mobile Money'}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">{row.txRef || row.chapa_tx_ref}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-zinc-950 text-sm">
                        {Number(row.amountEtb || row.amount_etb || 0).toLocaleString()} ETB
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isLocked
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isLocked ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span>{isLocked ? 'Locked in Escrow' : 'Released to Bank'}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
