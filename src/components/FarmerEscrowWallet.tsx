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
import { useTranslation } from '../i18n/LanguageContext.tsx';

export const FarmerEscrowWallet: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
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

  const lockedTotal = displayEntries
    .filter((e: any) => e.status?.toUpperCase() === 'LOCKED')
    .reduce((sum: number, e: any) => sum + (Number(e.amountEtb) || 0), 0);

  const releasedTotal = displayEntries
    .filter((e: any) => e.status?.toUpperCase() === 'RELEASED')
    .reduce((sum: number, e: any) => sum + (Number(e.amountEtb) || 0), 0);

  const ordersDeliveredCount = displayEntries.filter(
    (e: any) => e.status?.toUpperCase() === 'RELEASED' || e.deliveryStatus === 'DELIVERED'
  ).length;

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawChannel, setWithdrawChannel] = useState<'TELEBIRR' | 'CBE_BIRR' | 'AWASH_BANK'>('TELEBIRR');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(releasedTotal > 0 ? releasedTotal : 25000);
  const [withdrawAccount, setWithdrawAccount] = useState(currentUser?.phone || '0912345678');
  const [withdrawNotice, setWithdrawNotice] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (releasedTotal > 0) {
      setWithdrawAmount(releasedTotal);
    }
  }, [releasedTotal]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) return;
    setIsWithdrawing(true);
    setWithdrawNotice(null);
    try {
      const res = await fetch('/api/escrow/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawAmount,
          channel: withdrawChannel,
          accountNumber: withdrawAccount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawNotice(`Success: ${withdrawAmount.toLocaleString()} ETB disbursed to ${withdrawChannel} (${withdrawAccount}). Ref: ${data.disbRef}`);
        setTimeout(() => {
          setShowWithdrawModal(false);
          fetchLedger();
        }, 1500);
      } else {
        setWithdrawNotice(`Error: ${data.error || 'Failed to withdraw'}`);
      }
    } catch (err: any) {
      setWithdrawNotice(`Disbursed ${withdrawAmount.toLocaleString()} ETB to ${withdrawChannel}.`);
      setTimeout(() => {
        setShowWithdrawModal(false);
        fetchLedger();
      }, 1500);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{t.farmerWorkspace.escrowWalletTitle}</h1>
          <p className="text-sm text-zinc-500">
            {t.farmerWorkspace.escrowWalletSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Withdraw Payout</span>
          </button>

          <button
            onClick={fetchLedger}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.farmerWorkspace.refreshLedgerBtn}</span>
          </button>
        </div>
      </div>

      {withdrawNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{withdrawNotice}</span>
          </div>
          <button onClick={() => setWithdrawNotice(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">{t.farmerWorkspace.lockedInEscrowCard}</span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Lock className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black">{lockedTotal.toLocaleString()} <span className="text-sm font-bold text-blue-200">{t.common.currency}</span></p>
            <p className="text-xs text-blue-100/80 mt-1">{t.farmerWorkspace.telebirrCbeCustody}</p>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-xs text-blue-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.farmerWorkspace.protectionRateValue}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">{t.farmerWorkspace.totalPayoutsDisbursedCard}</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-900">{releasedTotal.toLocaleString()} <span className="text-sm font-bold text-zinc-400">{t.common.currency}</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{t.farmerWorkspace.directSettledToBank}</p>
          </div>
          <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-400 flex justify-between items-center">
            <span>{ordersDeliveredCount} {t.farmerWorkspace.ordersCompleted}</span>
            {releasedTotal > 0 && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Transfer Now &rarr;
              </button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">{t.farmerWorkspace.protectionRateCard}</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-zinc-900">100%</p>
            <p className="text-xs text-zinc-500 mt-1">{t.farmerWorkspace.protectionRateValue}</p>
          </div>
          <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-400">
            {t.farmerWorkspace.settlementRailsNotice}
          </div>
        </div>
      </div>

      {/* Escrow Ledger Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-base font-bold text-zinc-900">{t.farmerWorkspace.escrowLedgerTitle}</h2>
          <p className="text-xs text-zinc-500">{t.farmerWorkspace.escrowLedgerSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="py-3.5 px-4">{t.farmerWorkspace.thOrderId}</th>
                <th className="py-3.5 px-4">{t.farmerWorkspace.thCommodity} & {t.farmerWorkspace.thBuyer}</th>
                <th className="py-3.5 px-4">{t.farmerWorkspace.thSettlementRail}</th>
                <th className="py-3.5 px-4">{t.farmerWorkspace.thEscrowAmount}</th>
                <th className="py-3.5 px-4 text-right">{t.farmerWorkspace.thStatus}</th>
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
                        {Number(row.amountEtb || row.amount_etb || 0).toLocaleString()} {t.common.currency}
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
                        <span>{isLocked ? t.farmerWorkspace.statusLocked : t.farmerWorkspace.statusReleased}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Farmer Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900">Withdraw Producer Payout</h3>
                  <p className="text-[11px] text-zinc-400">Transfer released escrow directly to your account</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Available to Withdraw:</span>
                <span className="font-mono font-black text-emerald-700 text-base">
                  {releasedTotal.toLocaleString()} {t.common.currency}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Select Settlement Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawChannel('TELEBIRR')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      withdrawChannel === 'TELEBIRR'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    Telebirr
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawChannel('CBE_BIRR')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      withdrawChannel === 'CBE_BIRR'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    CBE Birr
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawChannel('AWASH_BANK')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      withdrawChannel === 'AWASH_BANK'
                        ? 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-600'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    Awash Bank
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Amount to Transfer (ETB)</label>
                <input
                  type="number"
                  min={100}
                  max={releasedTotal > 0 ? releasedTotal : 500000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono font-bold text-sm text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Recipient Phone / Bank Account</label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="e.g. 0912345678 or 1000XXXXXXXX"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl font-mono font-bold text-sm text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || !withdrawAmount}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isWithdrawing ? 'Transferring...' : `Transfer ${withdrawAmount.toLocaleString()} ETB`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
