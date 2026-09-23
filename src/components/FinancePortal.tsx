import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Plus,
  Sparkles,
  Award,
  Layers,
  ArrowUpRight,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { FinanceApplication, User } from '../types/index.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';
import { FaydaFinBankModal } from './FaydaFinBankModal.tsx';

interface FinancePortalProps {
  currentUser: User | null;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({
  currentUser,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isUnderwriter =
    currentUser?.role === 'PLATFORM_ADMIN' ||
    currentUser?.role === 'FINANCIAL_INSTITUTION';
  const isFarmer = !isUnderwriter;

  const [loans, setLoans] = useState<FinanceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionModalLoan, setDecisionModalLoan] = useState<FinanceApplication | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [customApprovedAmount, setCustomApprovedAmount] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showFaydaModal, setShowFaydaModal] = useState(false);

  // Application Form State
  const [loanType, setLoanType] = useState('INPUT_FINANCING');
  const [amountRequestedEtb, setAmountRequestedEtb] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetCrop, setTargetCrop] = useState('');
  const [expectedYieldTons, setExpectedYieldTons] = useState('');
  const [expectedRevenueEtb, setExpectedRevenueEtb] = useState('');
  const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState('12');

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('agrilink_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(currentUser?.id ? { 'x-user-id': String(currentUser.id) } : {}),
    };
  };

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/applications', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [currentUser?.id, currentUser?.role]);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/applications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          loanType,
          amountRequestedEtb: Number(amountRequestedEtb),
          purpose,
          targetCrop,
          expectedYieldTons: Number(expectedYieldTons),
          expectedRevenueEtb: Number(expectedRevenueEtb),
          repaymentPeriodMonths: Number(repaymentPeriodMonths),
        }),
      });

      if (res.ok) {
        setShowApplyModal(false);
        setAmountRequestedEtb('');
        setPurpose('');
        setTargetCrop('');
        setExpectedYieldTons('');
        setExpectedRevenueEtb('');
        fetchLoans();
      }
    } catch (err) {
      console.error('Error submitting loan:', err);
    }
  };

  const openDecisionModal = (loan: FinanceApplication, type: 'APPROVED' | 'REJECTED') => {
    setDecisionModalLoan(loan);
    setDecisionType(type);
    setCustomApprovedAmount(String(loan.amountRequestedEtb));
    setCustomNotes(
      type === 'APPROVED'
        ? `Approved by ${currentUser?.organizationName || 'Awash Bank & Platform Admin'} based on verified agricultural telemetry and escrow flow.`
        : 'Insufficient verified harvest sales volume for the requested capital amount.'
    );
  };

  const handleConfirmDecision = async () => {
    if (!decisionModalLoan) return;
    setIsSubmittingDecision(true);
    try {
      const res = await fetch(`/api/finance/applications/${decisionModalLoan.id}/decision`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: decisionType,
          approvedAmountEtb: decisionType === 'APPROVED' ? Number(customApprovedAmount) || decisionModalLoan.amountRequestedEtb : 0,
          interestRatePercent: 8.5,
          reviewNotes: customNotes,
        }),
      });

      if (res.ok) {
        setDecisionModalLoan(null);
        fetchLoans();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update loan decision.');
      }
    } catch (err) {
      console.error('Error submitting loan decision:', err);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Financial calculations
  const totalApprovedOrDisbursed = loans
    .filter((l) => l.status === 'APPROVED' || l.status === 'DISBURSED')
    .reduce((acc, curr) => acc + (curr.approvedAmountEtb || curr.amountRequestedEtb), 0);

  const pendingCount = loans.filter((l) => l.status === 'SUBMITTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Landmark className="h-4 w-4" />
              {isUnderwriter
                ? 'Awash Agribusiness & Development Bank • Credit Appraisal Portal'
                : 'Awash Bank Agricultural Credit Partnership'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {t.financeWorkspace.portalTitle}
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/80 mt-1 max-w-2xl">
              {t.financeWorkspace.portalSubtitle}
            </p>
          </div>

          {/* Action button: Only Farmers apply for credit */}
          {isFarmer && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-2 shrink-0 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" /> {t.financeWorkspace.applyForCreditBtn}
            </button>
          )}

          {isUnderwriter && (
            <div className="px-4 py-2.5 rounded-xl bg-teal-900/60 border border-teal-500/40 text-xs text-teal-200 flex items-center gap-2 shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Underwriter Authority Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Fayda National ID (FIN) Collaborative Bank Credit Banner */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 text-white border border-emerald-600/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
        
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
              <span>🇪🇹</span> Ethiopian National ID (Fayda / FIN) Bank Lending
            </span>
            <span className="text-2xs font-bold text-amber-300">
              Commercial Bank of Ethiopia • Coop Bank • Awash • Dashen
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white">
            {isFarmer
              ? 'Instant Bank Lending via Fayda National ID (FIN)'
              : 'NBE-Compliant Fayda National ID Underwriting Active'}
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            {isFarmer
              ? 'Enter or link your unique 12-digit Fayda FIN to unlock up to 450,000 ETB in instant, collateral-free credit lines from partner banks. Zero physical paperwork required.'
              : 'Smallholder loan applicants are cross-referenced against the Ethiopian National ID Program (NIDP) biometric database and Ministry of Agriculture land holding records.'}
          </p>

          {currentUser?.nationalIdNumber && isFarmer && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-mono">
                FIN Linked: {currentUser.nationalIdNumber}
              </span>
              <span className="text-2xs text-emerald-300 font-semibold">
                ✓ Pre-Approved for 450,000 ETB Bank Credit
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowFaydaModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 group"
          >
            <Landmark className="h-4 w-4 text-zinc-950" />
            <span>{isFarmer ? (currentUser?.nationalIdNumber ? 'Get Instant Bank Loan' : 'Link FIN & Get Bank Loan') : 'Open FIN e-KYC Simulator'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* AVPS Alternative Credit Scoring Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white border border-amber-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white">Algorithmically Verified Production Score (AVPS) Active</span>
              <span className="font-mono text-2xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">AVPS = w₁F + w₂Q + w₃V + w₄T</span>
            </div>
            <p className="text-2xs sm:text-xs text-zinc-400 mt-0.5">
              Replaces unholdable land titles with unalterable escrow transaction metrics (Fulfillment, Quality, Volume, Tenure) for pre-harvest credit lines.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/innovation')}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
        >
          <span>Inspect AVPS Credit Passport</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">
            {isUnderwriter ? t.financeWorkspace.approvedDisbursedCard : t.financeWorkspace.approvedDisbursedCard}
          </span>
          <span className="text-2xl font-black text-teal-950 mt-1 block">
            {totalApprovedOrDisbursed > 0
              ? `${totalApprovedOrDisbursed.toLocaleString()} ${t.common.currency}`
              : isUnderwriter
              ? `350,000 ${t.common.currency}`
              : `0 ${t.common.currency}`}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Repayment on AgriLink Escrow
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">
            {isUnderwriter ? t.financeWorkspace.pendingAppraisalsCard : t.financeWorkspace.totalApplicationsCard}
          </span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">
            {isUnderwriter ? `${pendingCount} Files Pending` : `${loans.length} File${loans.length !== 1 ? 's' : ''}`}
          </span>
          <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1 mt-2">
            <Clock className="h-3.5 w-3.5" /> Fast 24-hr algorithmic underwriting
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 font-semibold block">{t.financeWorkspace.creditScoreAvgCard}</span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">8.5% p.a.</span>
          <span className="text-[11px] text-zinc-500 font-medium mt-2 block">
            {t.financeWorkspace.tier1Eligibility}
          </span>
        </div>
      </div>

      {/* Main Applications Workspace */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              {t.financeWorkspace.applicationsTableTitle}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.financeWorkspace.applicationsTableSubtitle}
            </p>
          </div>
          <span
            className={`self-start px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isUnderwriter
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isUnderwriter ? 'Admin / Underwriter Appraisal Desk' : 'Borrower / Farmer View'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
            {t.common.loading}
          </div>
        ) : loans.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 space-y-3 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 p-8">
            <Landmark className="h-10 w-10 text-zinc-300 mx-auto" />
            <p className="text-sm font-bold text-zinc-700">
              {isUnderwriter ? 'No pending credit applications in queue' : 'No credit applications found'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {isUnderwriter
                ? 'All farmer credit applications have been processed or none have been submitted yet.'
                : 'You have not submitted any working capital requests. Click "Apply for Farm Credit" to request financing backed by Awash Bank.'}
            </p>
            {isFarmer && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                + {t.financeWorkspace.applyForCreditBtn}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-colors space-y-4"
              >
                {/* Top Row: Applicant, Type & Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-zinc-900">{loan.farmerName || 'Bekele Tadesse'}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-900">
                        {loan.loanType.replace(/_/g, ' ')}
                      </span>
                      {((loan as any).nationalIdNumber || (loan as any).finNumber) && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <span>🇪🇹</span> FIN: {(loan as any).nationalIdNumber || (loan as any).finNumber} (Fayda Verified)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Farm: <strong className="text-zinc-800">{loan.farmName || 'Wonji Horizon Farm'}</strong>
                      {loan.farmerPhone && ` • Phone: ${loan.farmerPhone}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-zinc-900">
                      {loan.amountRequestedEtb.toLocaleString()} {t.common.currency}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        loan.status === 'APPROVED' || loan.status === 'DISBURSED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : loan.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Purpose */}
                <p className="text-xs text-zinc-600 bg-white p-3 rounded-xl border border-zinc-200">
                  <strong className="text-zinc-900">{t.financeWorkspace.purposeLabel}:</strong> {loan.purpose}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-zinc-200">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">{t.financeWorkspace.thTargetCrop}</span>
                    <span className="font-bold text-zinc-900">{loan.targetCrop}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">{t.financeWorkspace.expectedYieldLabel}</span>
                    <span className="font-bold text-zinc-900">{loan.expectedYieldTons} Tons</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">{t.financeWorkspace.expectedRevenueLabel}</span>
                    <span className="font-bold text-emerald-800">
                      {loan.expectedRevenueEtb ? `${loan.expectedRevenueEtb.toLocaleString()} ${t.common.currency}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">{t.financeWorkspace.thRepaymentPeriod}</span>
                    <span className="font-bold text-zinc-900">{loan.repaymentPeriodMonths} {t.financeWorkspace.monthsUnit}</span>
                  </div>
                </div>

                {/* Bank Decision Memo (if available) */}
                {loan.reviewNotes && (
                  <div className="text-xs bg-teal-50/80 p-3 rounded-xl border border-teal-200 text-teal-950">
                    <strong className="text-teal-900">Bank Decision Memo:</strong> {loan.reviewNotes}
                  </div>
                )}

                {/* ── ROLE-ISOLATED STATUS & ACTIONS ──────────────────────────────── */}

                {/* 1. If Farmer: Show informative read-only status banner */}
                {isFarmer && (
                  <div className="pt-1">
                    {loan.status === 'SUBMITTED' && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{t.financeWorkspace.pendingAppraisalsCard}</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Your application is currently under review by Awash Bank credit officers and Platform Admin.
                          </p>
                        </div>
                      </div>
                    )}

                    {(loan.status === 'APPROVED' || loan.status === 'DISBURSED') && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            {t.financeWorkspace.approvedDisbursedCard} ({loan.approvedAmountEtb?.toLocaleString() || loan.amountRequestedEtb.toLocaleString()} {t.common.currency})
                          </p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Awash Bank has authorized disbursement. Repayments are synchronized with your upcoming harvest sales via AgriLink Escrow.
                          </p>
                        </div>
                      </div>
                    )}

                    {loan.status === 'REJECTED' && (
                      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900">
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{t.financeWorkspace.decisionReject}</p>
                          <p className="text-[11px] text-rose-800 mt-0.5">
                            {loan.reviewNotes || 'The application did not satisfy the minimum required sales history criteria.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. If Underwriter / Admin: Show Appraisal Controls for Submitted Loans */}
                {isUnderwriter && loan.status === 'SUBMITTED' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-200">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                      <span>Admin / Awash Bank Decision Authority Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDecisionModal(loan, 'REJECTED')}
                        className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-rose-100 hover:text-rose-800 text-zinc-800 text-xs font-bold cursor-pointer transition-colors"
                      >
                        {t.financeWorkspace.decisionReject}
                      </button>
                      <button
                        onClick={() => openDecisionModal(loan, 'APPROVED')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t.financeWorkspace.decisionApprove}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. If Underwriter / Admin and already decided */}
                {isUnderwriter && loan.status !== 'SUBMITTED' && (
                  <div className="text-right text-[11px] text-zinc-400 font-medium pt-1">
                    Decision recorded by Underwriting Desk
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Underwriter / Admin Decision Confirmation */}
      {decisionModalLoan && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  decisionType === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {decisionType === 'APPROVED' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <h3 className="text-base font-black text-zinc-900">
                {decisionType === 'APPROVED' ? t.financeWorkspace.decisionApprove : t.financeWorkspace.decisionReject}
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Farmer: <strong>{decisionModalLoan.farmerName}</strong> • Requested: <strong>{decisionModalLoan.amountRequestedEtb.toLocaleString()} {t.common.currency}</strong>
            </p>

            <div className="space-y-3">
              {decisionType === 'APPROVED' && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    {t.financeWorkspace.approvedAmountLabel}
                  </label>
                  <input
                    type="number"
                    value={customApprovedAmount}
                    onChange={(e) => setCustomApprovedAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-teal-600 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  {t.financeWorkspace.underwriterNotesLabel}
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalLoan(null)}
                  disabled={isSubmittingDecision}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecision}
                  disabled={isSubmittingDecision}
                  className={`w-1/2 py-2.5 rounded-xl text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {isSubmittingDecision ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    t.financeWorkspace.confirmDecisionBtn
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Farmer Apply for Loan */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-zinc-900 mb-1">{t.financeWorkspace.applyModalTitle}</h3>
            <p className="text-xs text-zinc-500 mb-4">{t.financeWorkspace.portalSubtitle}</p>

            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.thLoanType}</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                >
                  <option value="INPUT_FINANCING">Input & Seed Financing</option>
                  <option value="EQUIPMENT_FINANCING">Solar Drip & Equipment Financing</option>
                  <option value="WORKING_CAPITAL">Harvest Working Capital</option>
                  <option value="COLD_STORAGE_CREDIT">Cold Storage & Post-Harvest Loan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.amountRequestedLabel}</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={amountRequestedEtb}
                    onChange={(e) => setAmountRequestedEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.repaymentPeriodLabel}</label>
                  <select
                    value={repaymentPeriodMonths}
                    onChange={(e) => setRepaymentPeriodMonths(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                  >
                    <option value="6">6 {t.financeWorkspace.monthsUnit}</option>
                    <option value="12">12 {t.financeWorkspace.monthsUnit}</option>
                    <option value="24">24 {t.financeWorkspace.monthsUnit}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.purposeLabel}</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Purchase of certified wheat seeds and solar water pump"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.thTargetCrop}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Teff / Wheat"
                    value={targetCrop}
                    onChange={(e) => setTargetCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">{t.financeWorkspace.expectedRevenueLabel}</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450000"
                    value={expectedRevenueEtb}
                    onChange={(e) => setExpectedRevenueEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 font-bold text-xs text-white cursor-pointer shadow-md"
                >
                  {t.financeWorkspace.submitApplicationBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fayda National ID (FIN) Bank Credit & Loan Modal */}
      <FaydaFinBankModal
        isOpen={showFaydaModal}
        onClose={() => setShowFaydaModal(false)}
        onLoanDisbursed={() => fetchLoans()}
        initialFin={currentUser?.nationalIdNumber}
      />
    </div>
  );
};
