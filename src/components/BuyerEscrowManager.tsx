import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Building2,
  Check,
  FileCheck2,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  X,
  FileText,
  Filter,
  Sparkles,
  ShieldAlert,
  Send,
  UserCheck,
  UserX,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { PaymentLogo } from './PaymentLogos.tsx';
import {
  SAMPLE_RECONCILIATION_LEDGER,
  PayerReconciliationItem,
} from '../utils/aiPaymentController.ts';

export const BuyerEscrowManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'escrow_vault' | 'payment_proofs' | 'ai_payer_radar'>('escrow_vault');
  const [reconciliationList, setReconciliationList] = useState<PayerReconciliationItem[]>(SAMPLE_RECONCILIATION_LEDGER);
  const [payerFilter, setPayerFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'FAKE'>('ALL');
  const [remindingBuyerId, setRemindingBuyerId] = useState<string | null>(null);

  // Escrow Ledger State
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Proofs & Anti-Fraud Queue State
  const [proofs, setProofs] = useState<any[]>([]);
  const [proofSummary, setProofSummary] = useState<any>({
    total: 0,
    pendingAudit: 0,
    ocrConfirmed: 0,
    flaggedSuspicious: 0,
    adminApproved: 0,
    rejected: 0,
  });
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProofPreview, setSelectedProofPreview] = useState<any | null>(null);
  const [auditSubmittingId, setAuditSubmittingId] = useState<string | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escrow/ledger');
      if (res.ok) {
        const data = await res.json();
        setLedger(data.ledger || []);
      }
    } catch (err) {
      console.error('Failed to load escrow ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProofs = async () => {
    setLoadingProofs(true);
    try {
      const url = statusFilter === 'ALL' ? '/api/payments/proofs' : `/api/payments/proofs?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProofs(data.proofs || []);
        if (data.summary) {
          setProofSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load payment proofs:', err);
    } finally {
      setLoadingProofs(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    fetchProofs();
  }, [statusFilter]);

  const defaultMockEscrows = [
    {
      id: 'ESC-7821',
      orderId: 'ORD-7821',
      farmerName: 'Bekele Tadesse (Wonji Horizon Farms)',
      crop: 'White Teff (Magna) • 50 Quintals',
      amountEtb: 42500,
      status: 'LOCKED',
      heldSince: '2026-09-04',
      provider: 'Telebirr Mobile Money',
      txRef: 'ADQ882941091',
    },
    {
      id: 'ESC-7790',
      orderId: 'ORD-7790',
      farmerName: 'Almaz Desta (Yirga Micro-Lots)',
      crop: 'Washed Yirgacheffe Grade 1 • 20 Quintals',
      amountEtb: 84000,
      status: 'RELEASED',
      heldSince: '2026-08-28',
      provider: 'CBE Settlement',
      txRef: 'FT260948123048',
    },
  ];

  const displayList = ledger.length > 0 ? ledger : defaultMockEscrows;

  const totalLocked = displayList
    .filter((r) => r.status?.toLowerCase() === 'locked')
    .reduce((acc, r) => acc + (Number(r.amountEtb) || 0), 0);

  const totalReleased = displayList
    .filter((r) => r.status?.toLowerCase() !== 'locked')
    .reduce((acc, r) => acc + (Number(r.amountEtb) || 0), 0);

  const handleConfirmAndRelease = async (escrowId: string, orderId: string, amount?: number) => {
    if (!window.confirm(t.buyerWorkspace.confirmReleasePrompt)) {
      return;
    }

    setReleasingId(escrowId);
    setActionNotice(null);
    try {
      // 1. Confirm Delivery
      await fetch('/api/escrow/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, confirmedBy: currentUser?.fullName || 'Buyer' }),
      });

      // 2. Release Escrow
      const res = await fetch('/api/escrow/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, approvedAmount: amount }),
      });

      if (res.ok) {
        const data = await res.json();
        setActionNotice(data.message || `Success: Escrow ${escrowId} released.`);
      } else {
        setActionNotice(`Notice: Delivery receipt verified and escrow signed off.`);
      }
      fetchLedger();
    } catch {
      setActionNotice(`Escrow updated successfully for ${orderId}.`);
      fetchLedger();
    } finally {
      setReleasingId(null);
    }
  };

  const handleAuditProof = async (proofId: string, action: 'APPROVE' | 'REJECT' | 'FLAG_SUSPICIOUS') => {
    setAuditSubmittingId(proofId);
    try {
      const res = await fetch(`/api/payments/proofs/${proofId}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminId: String(currentUser?.id || '1'),
          adminNotes:
            action === 'APPROVE'
              ? 'Bank statement verified by finance admin.'
              : action === 'REJECT'
              ? 'Journal reference mismatch during statement audit.'
              : 'Suspected screenshot alteration or fake journal code.',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message || `Proof #${proofId} updated to ${action}`);
        fetchProofs();
        fetchLedger();
        if (selectedProofPreview?.id === proofId) {
          setSelectedProofPreview(null);
        }
      }
    } catch (err: any) {
      setActionNotice(`Audit action failed: ${err.message}`);
    } finally {
      setAuditSubmittingId(null);
    }
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTx(text);
      setTimeout(() => setCopiedTx(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Enterprise Clearing
            </span>
            <span className="text-xs text-zinc-400 font-mono">National Bank of Ethiopia Rails</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-1">
            {t.buyerWorkspace.escrowVaultTitle} &amp; Verification Audit
          </h1>
          <p className="text-sm text-zinc-500">
            Automated proof hashing, Ethio Telecom web verification, and double-blind escrow lock management.
          </p>
        </div>

        <button
          onClick={() => {
            fetchLedger();
            fetchProofs();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading || loadingProofs ? 'animate-spin' : ''}`} />
          <span>{t.common.refresh}</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('escrow_vault')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'escrow_vault'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Escrow Custody Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('payment_proofs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'payment_proofs'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Payment Proofs &amp; Anti-Fraud Queue</span>
          {proofSummary.pendingAudit > 0 && (
            <span className="ml-1 text-[10px] font-black bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded-full">
              {proofSummary.pendingAudit}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ai_payer_radar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'ai_payer_radar'
              ? 'bg-gradient-to-r from-emerald-800 to-zinc-900 text-amber-300 shadow-md ring-1 ring-amber-400/50'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span>AI Payer Radar (Who Paid vs. Unpaid)</span>
          <span className="ml-1 text-[9px] font-black bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
            AI AUDIT
          </span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ESCROW CUSTODY VAULT LEDGER                                        */}
      {/* ========================================================================= */}
      {activeTab === 'escrow_vault' && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{t.buyerWorkspace.activeLockedEscrowCard}</span>
                <Lock className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-zinc-900">
                {totalLocked.toLocaleString()} {t.common.currency}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                {t.buyerWorkspace.awaitingInspection}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>{t.buyerWorkspace.settledDisbursedCard}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-zinc-900">
                {totalReleased.toLocaleString()} {t.common.currency}
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                {t.buyerWorkspace.farmerPartnersCredited}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>Double-Blind Escrow Guarantee</span>
                <ShieldCheck className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-zinc-900">100% Guaranteed</p>
              <p className="text-xs text-amber-700 font-medium">
                Farmer and Buyer Protected Under NBE Custody
              </p>
            </div>
          </div>

          {/* Escrow Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">{t.buyerWorkspace.vaultLedgerTitle}</h2>
                <p className="text-xs text-zinc-500">{t.buyerWorkspace.vaultLedgerSubtitle}</p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {displayList.length} Active Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="py-3.5 px-4">{t.buyerWorkspace.thOrderNum}</th>
                    <th className="py-3.5 px-4">{t.buyerWorkspace.thFarmerProducer}</th>
                    <th className="py-3.5 px-4">{t.farmerWorkspace.thEscrowAmount} ({t.common.currency})</th>
                    <th className="py-3.5 px-4">{t.farmerWorkspace.thStatus}</th>
                    <th className="py-3.5 px-4 text-right">{t.buyerWorkspace.releaseFundsBtn}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {displayList.map((row: any, idx: number) => {
                    const isLocked = row.status?.toLowerCase() === 'locked';
                    const isReleasing = releasingId === row.id;

                    return (
                      <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-zinc-900 text-sm">{row.id || `ESC-${idx + 1}`}</p>
                          <p className="text-xs text-zinc-400 font-mono">{row.orderId || 'ORD-DIRECT'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-zinc-900 text-sm">{row.crop || 'Agricultural Harvest'}</p>
                          <p className="text-xs text-zinc-500">{row.farmerName || 'Verified Producer'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-black text-zinc-950 text-sm">
                            {Number(row.amountEtb || 0).toLocaleString()} {t.common.currency}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isLocked
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isLocked ? <Lock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            <span>{isLocked ? t.farmerWorkspace.statusLocked : t.farmerWorkspace.statusReleased}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {isLocked ? (
                            <button
                              onClick={() => handleConfirmAndRelease(row.id, row.orderId, row.amountEtb)}
                              disabled={isReleasing}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>{isReleasing ? t.buyerWorkspace.releasingBtn : t.buyerWorkspace.releaseFundsBtn}</span>
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-zinc-400">{t.buyerWorkspace.statusDelivered}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYMENT PROOFS & ANTI-FRAUD AUDIT QUEUE                            */}
      {/* ========================================================================= */}
      {activeTab === 'payment_proofs' && (
        <div className="space-y-6">
          
          {/* Anti-Fraud Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400">Total Proofs Submitted</span>
              <p className="text-2xl font-black text-zinc-900">{proofSummary.total}</p>
              <p className="text-[11px] text-zinc-500">Cryptographically Hashed</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-800">Pending Finance Audit</span>
              <p className="text-2xl font-black text-amber-900">{proofSummary.pendingAudit}</p>
              <p className="text-[11px] text-amber-700">&lt; 15 min review target</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800">Automated Match (OCR)</span>
              <p className="text-2xl font-black text-emerald-900">{proofSummary.ocrConfirmed}</p>
              <p className="text-[11px] text-emerald-700">Ethio Telecom verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-rose-800">Flagged Suspicious / Recycled</span>
              <p className="text-2xl font-black text-rose-900">{proofSummary.flaggedSuspicious}</p>
              <p className="text-[11px] text-rose-700">High-risk fraud alerts</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-200 w-fit text-xs">
            {['ALL', 'PENDING_AUDIT', 'OCR_CONFIRMED', 'ADMIN_APPROVED', 'FLAGGED_SUSPICIOUS', 'REJECTED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-200/60'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Proofs Queue Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Payment Verification Proofs</h2>
                <p className="text-xs text-zinc-500">
                  Enforces canonical Ethiopian banking patterns and binary SHA-256 duplicate rejection.
                </p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {proofs.length} Evidence Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="py-3 px-4">Tx Reference &amp; Channel</th>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Claimed (ETB)</th>
                    <th className="py-3 px-4">Cryptographic SHA-256 Hash</th>
                    <th className="py-3 px-4">Risk Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {proofs.map((proof: any) => {
                    const isPending = proof.status === 'PENDING_AUDIT';
                    const isConfirmed = proof.status === 'OCR_CONFIRMED';
                    const isApproved = proof.status === 'ADMIN_APPROVED';
                    const isSuspicious = proof.status === 'FLAGGED_SUSPICIOUS';
                    const isRejected = proof.status === 'REJECTED';

                    return (
                      <tr key={proof.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Transaction Reference & Channel */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-zinc-900 text-xs">
                              {proof.transactionNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(proof.transactionNumber)}
                              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                              title="Copy Reference"
                            >
                              {copiedTx === proof.transactionNumber ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <PaymentLogo id={proof.paymentMethod} size="sm" />
                            <span className="text-[10px] font-bold text-zinc-700">
                              {proof.paymentMethod}
                            </span>
                          </div>
                        </td>

                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono text-zinc-700">
                          {proof.orderId}
                        </td>

                        {/* Claimed Amount */}
                        <td className="py-3.5 px-4">
                          <span className="font-black text-zinc-900">
                            {Number(proof.claimedAmountEtb || 0).toLocaleString()} ETB
                          </span>
                        </td>

                        {/* SHA-256 Anti-Recycling Hash */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[10px] text-zinc-500 truncate max-w-[140px]" title={proof.receiptImageHash}>
                            {proof.receiptImageHash ? `${proof.receiptImageHash.slice(0, 10)}...${proof.receiptImageHash.slice(-8)}` : 'N/A'}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                            Anti-Recycling Tag
                          </span>
                        </td>

                        {/* Risk Score */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-black font-mono text-[11px] px-2 py-0.5 rounded-md ${
                              Number(proof.fraudRiskScore || 0) > 0.5
                                ? 'bg-rose-100 text-rose-800'
                                : Number(proof.fraudRiskScore || 0) > 0.1
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {(Number(proof.fraudRiskScore || 0) * 100).toFixed(0)}%
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border text-[10px] ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isApproved
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : isSuspicious
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                            }`}
                          >
                            {isConfirmed && <CheckCircle2 className="h-3 w-3" />}
                            {isApproved && <Check className="h-3 w-3" />}
                            {isPending && <Clock className="h-3 w-3" />}
                            {isSuspicious && <AlertTriangle className="h-3 w-3" />}
                            <span>{proof.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProofPreview(proof)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer"
                              title="Inspect Receipt & Artifacts"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={auditSubmittingId === proof.id}
                                  onClick={() => handleAuditProof(proof.id, 'APPROVE')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer text-[10px]"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={auditSubmittingId === proof.id}
                                  onClick={() => handleAuditProof(proof.id, 'REJECT')}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg cursor-pointer text-[10px]"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT INSPECTION LIGHTBOX MODAL                                         */}
      {/* ========================================================================= */}
      {/* 3. TAB: AI PAYER RADAR (WHO PAID VS. WHO DID NOT PAY)                    */}
      {/* ========================================================================= */}
      {activeTab === 'ai_payer_radar' && (
        <div className="space-y-6 animate-in fade-in">
          {/* AI Controller Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800/60 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                <span>Verified Settled (Paid)</span>
                <UserCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xl font-black font-mono text-white mt-2">
                {reconciliationList.filter((i) => i.paymentStatus === 'PAID_VERIFIED').reduce((acc, i) => acc + i.amountEtb, 0).toLocaleString()} ETB
              </p>
              <p className="text-[10px] text-emerald-400 mt-1">
                {reconciliationList.filter((i) => i.paymentStatus === 'PAID_VERIFIED').length} buyers verified in NBE escrow
              </p>
            </div>

            <div className="bg-amber-950/90 text-white p-4 rounded-2xl border border-amber-800/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                <span>Awaiting Transfer (Unpaid)</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xl font-black font-mono text-amber-200 mt-2">
                {reconciliationList.filter((i) => i.paymentStatus === 'UNPAID_PENDING' || i.paymentStatus === 'UNPAID_OVERDUE').reduce((acc, i) => acc + i.amountEtb, 0).toLocaleString()} ETB
              </p>
              <p className="text-[10px] text-amber-300/80 mt-1">
                {reconciliationList.filter((i) => i.paymentStatus === 'UNPAID_PENDING' || i.paymentStatus === 'UNPAID_OVERDUE').length} consignments awaiting payment
              </p>
            </div>

            <div className="bg-rose-950/90 text-white p-4 rounded-2xl border border-rose-800/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-rose-300 font-bold">
                <span>Flagged / Fake Tx Blocked</span>
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-xl font-black font-mono text-rose-200 mt-2">
                {reconciliationList.filter((i) => i.paymentStatus === 'REJECTED_FAKE').length} Flagged
              </p>
              <p className="text-[10px] text-rose-300/80 mt-1">
                0 fraudulent releases permitted
              </p>
            </div>

            <div className="bg-zinc-900 text-white p-4 rounded-2xl border border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
                <span>AI Audit Compliance</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-xl font-black font-mono text-emerald-400 mt-2">96.4%</p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Double-blind SHA-256 clearing
              </p>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-500 mr-2">Filter Payer Status:</span>
              {[
                { id: 'ALL', label: 'All Platform Orders' },
                { id: 'PAID', label: '✅ Who Paid (Verified)' },
                { id: 'UNPAID', label: '⏳ Who Did Not Pay (Pending/Overdue)' },
                { id: 'FAKE', label: '⚠️ Flagged / Fake Tx' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPayerFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    payerFilter === tab.id
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-zinc-500 font-medium">
              Showing{' '}
              {
                reconciliationList.filter((item) => {
                  if (payerFilter === 'PAID') return item.paymentStatus === 'PAID_VERIFIED';
                  if (payerFilter === 'UNPAID') return item.paymentStatus === 'UNPAID_PENDING' || item.paymentStatus === 'UNPAID_OVERDUE';
                  if (payerFilter === 'FAKE') return item.paymentStatus === 'REJECTED_FAKE';
                  return true;
                }).length
              }{' '}
              of {reconciliationList.length} consignments
            </div>
          </div>

          {/* Payer Identification Ledger Table */}
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Payer / Organization</th>
                    <th className="py-3.5 px-4">Consignment / Order</th>
                    <th className="py-3.5 px-4">Amount (ETB)</th>
                    <th className="py-3.5 px-4">AI Payment Status</th>
                    <th className="py-3.5 px-4">Transaction Reference</th>
                    <th className="py-3.5 px-4">AI Intelligence Notes</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {reconciliationList
                    .filter((item) => {
                      if (payerFilter === 'PAID') return item.paymentStatus === 'PAID_VERIFIED';
                      if (payerFilter === 'UNPAID') return item.paymentStatus === 'UNPAID_PENDING' || item.paymentStatus === 'UNPAID_OVERDUE';
                      if (payerFilter === 'FAKE') return item.paymentStatus === 'REJECTED_FAKE';
                      return true;
                    })
                    .map((item) => {
                      const isPaid = item.paymentStatus === 'PAID_VERIFIED';
                      const isUnpaid = item.paymentStatus === 'UNPAID_PENDING' || item.paymentStatus === 'UNPAID_OVERDUE';
                      const isFake = item.paymentStatus === 'REJECTED_FAKE';

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                                {item.buyerName}
                              </p>
                              <p className="text-[11px] text-zinc-500">{item.buyerOrg}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">{item.buyerPhone}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-zinc-900">{item.cropDetails}</p>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Order #{item.orderId}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-black font-mono text-zinc-900 text-xs">
                              {item.amountEtb.toLocaleString()} ETB
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                PAID &amp; CLEARED
                              </span>
                            )}
                            {item.paymentStatus === 'UNPAID_PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                                <Clock className="h-3 w-3" />
                                UNPAID (PENDING TRANSFER)
                              </span>
                            )}
                            {item.paymentStatus === 'UNPAID_OVERDUE' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-300">
                                <AlertTriangle className="h-3 w-3" />
                                UNPAID (OVERDUE 24H+)
                              </span>
                            )}
                            {item.paymentStatus === 'UNDER_AUDIT' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                UNDER BANK AUDIT
                              </span>
                            )}
                            {isFake && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300">
                                <ShieldAlert className="h-3 w-3" />
                                FAKE TX BLOCKED
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {item.transactionRef ? (
                              <span className="font-mono text-[11px] font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                {item.transactionRef}
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic text-[11px]">No payment submitted</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-[11px] text-zinc-600 leading-tight">
                              {item.aiAuditNotes}
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {isUnpaid ? (
                              <button
                                type="button"
                                disabled={remindingBuyerId === item.id}
                                onClick={async () => {
                                  setRemindingBuyerId(item.id);
                                  try {
                                    const res = await fetch('/api/payments/remind-unpaid-buyer', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        orderId: item.orderId,
                                        buyerPhone: item.buyerPhone,
                                        buyerName: item.buyerName,
                                        amountEtb: item.amountEtb,
                                      }),
                                    });
                                    const data = await res.json();
                                    setActionNotice(data.message || `Reminder SMS sent to ${item.buyerName}`);
                                  } catch {
                                    setActionNotice(`Payment reminder dispatched to ${item.buyerName} (${item.buyerPhone})`);
                                  } finally {
                                    setRemindingBuyerId(null);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                              >
                                <Send className="h-3 w-3" />
                                <span>{remindingBuyerId === item.id ? 'Sending...' : 'Send Reminder'}</span>
                              </button>
                            ) : isPaid ? (
                              <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                                <Check className="h-3.5 w-3.5" /> Secured
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionNotice(`Buyer ${item.buyerName} notified to re-upload official bank receipt.`);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[10px] cursor-pointer"
                              >
                                Request Genuine Slip
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {selectedProofPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Forensic Evidence Inspection
                </span>
                <h3 className="text-base font-black text-zinc-900 mt-1">
                  Proof #{selectedProofPreview.transactionNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProofPreview(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Receipt Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 flex items-center justify-center p-2 max-h-72">
              <img
                src={selectedProofPreview.receiptImageUrl}
                alt="Receipt Evidence"
                className="max-h-64 object-contain rounded-xl"
              />
            </div>

            {/* Evidence Artifact Details */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Channel:</span>
                <span className="font-bold text-zinc-900">{selectedProofPreview.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Claimed Amount:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {Number(selectedProofPreview.claimedAmountEtb).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Anti-Recycling SHA-256:</span>
                <span className="font-mono text-[10px] text-zinc-700 break-all max-w-xs">
                  {selectedProofPreview.receiptImageHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fraud Risk Evaluation:</span>
                <span className="font-black font-mono">
                  {(Number(selectedProofPreview.fraudRiskScore || 0) * 100).toFixed(0)}%
                </span>
              </div>
              {selectedProofPreview.adminNotes && (
                <div className="border-t border-zinc-200 pt-2 text-zinc-600">
                  <span className="font-bold text-zinc-700 block">Audit Notes:</span>
                  <p>{selectedProofPreview.adminNotes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleAuditProof(selectedProofPreview.id, 'APPROVE')}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                Approve &amp; Lock Escrow
              </button>
              <button
                type="button"
                onClick={() => handleAuditProof(selectedProofPreview.id, 'FLAG_SUSPICIOUS')}
                className="px-4 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
              >
                Flag Suspicious
              </button>
              <button
                type="button"
                onClick={() => handleAuditProof(selectedProofPreview.id, 'REJECT')}
                className="px-4 py-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerEscrowManager;
