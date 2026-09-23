import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Zap,
  Sprout,
  X,
  CreditCard,
  Building2,
  FileText,
  UserCheck,
  ChevronRight,
  Coins,
  Sparkles,
  Tractor,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { FaydaFinVerification, PartnerBankOffer } from '../types/index.ts';
import { PaymentLogo, BankCardBadge } from './PaymentLogos.tsx';

interface FaydaFinBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanDisbursed?: (amount: number, bankName: string, channel: string) => void;
  initialFin?: string | null;
}

export const FaydaFinBankModal: React.FC<FaydaFinBankModalProps> = ({
  isOpen,
  onClose,
  onLoanDisbursed,
  initialFin,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [finInput, setFinInput] = useState(initialFin || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState('');
  const [copiedFin, setCopiedFin] = useState(false);
  const [verificationData, setVerificationData] = useState<FaydaFinVerification | null>(null);

  // Loan Configuration State
  const [selectedBank, setSelectedBank] = useState<PartnerBankOffer | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(75000);
  const [loanPurpose, setLoanPurpose] = useState('Certified Seeds & Fertilizers (Business Agent Desk)');
  const [repaymentTerm, setRepaymentTerm] = useState('POST_HARVEST_ESCROW');
  const [disbursementChannel, setDisbursementChannel] = useState<'BUSINESS_AGENT_ESCROW' | 'TELEBIRR' | 'CBE_BIRR'>('BUSINESS_AGENT_ESCROW');
  const [isApplying, setIsApplying] = useState(false);
  const [disbursementResult, setDisbursementResult] = useState<any | null>(null);

  useEffect(() => {
    if (initialFin) {
      setFinInput(initialFin);
    }
  }, [initialFin]);

  if (!isOpen) return null;

  // Format 12-digit number with dashes: XXXX-XXXX-XXXX
  const handleFinChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 12);
    if (raw.length <= 4) {
      setFinInput(raw);
    } else if (raw.length <= 8) {
      setFinInput(`${raw.slice(0, 4)}-${raw.slice(4)}`);
    } else {
      setFinInput(`${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`);
    }
  };

  const handleCopyFin = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFin(true);
    setTimeout(() => setCopiedFin(false), 2000);
  };

  const handleVerifyFin = async (presetFin?: string) => {
    const finToUse = presetFin || finInput;
    if (!finToUse || finToUse.replace(/[^0-9]/g, '').length < 10) {
      alert('Please enter a valid 12-digit Fayda Identification Number (FIN).');
      return;
    }

    setIsVerifying(true);
    setVerifyStage('Connecting to Ethiopian National ID Program (NIDP) e-KYC...');

    try {
      await new Promise((r) => setTimeout(r, 700));
      setVerifyStage('Verifying citizen biometrics & Ministry of Agriculture Land Tenure...');
      await new Promise((r) => setTimeout(r, 700));
      setVerifyStage('Querying National Bank of Ethiopia (NBE) Interbank Credit Bureau...');

      const res = await fetch('/api/finance/fayda/verify-fin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finNumber: finToUse }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerificationData(data.verification);
        if (data.verification.eligibleBanks?.length > 0) {
          setSelectedBank(data.verification.eligibleBanks[0]);
        }
        setStep(2);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to verify National ID.');
      }
    } catch (err) {
      console.error('Error verifying FIN:', err);
      alert('Network error verifying FIN. Please try again.');
    } finally {
      setIsVerifying(false);
      setVerifyStage('');
    }
  };

  const handleApplyLoan = async () => {
    if (!verificationData || !selectedBank) return;
    setIsApplying(true);

    try {
      const res = await fetch('/api/finance/fayda/apply-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finNumber: verificationData.finNumber,
          bankId: selectedBank.bankId,
          bankName: selectedBank.bankName,
          productName: selectedBank.productName,
          amountRequestedEtb: loanAmount,
          purpose: loanPurpose,
          targetCrop: verificationData.primaryCrop,
          repaymentPeriodMonths: selectedBank.tenorMonths,
          disbursementDestination: disbursementChannel,
          interestRatePercent: selectedBank.interestRatePercent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDisbursementResult(data);
        setStep(4);
        if (onLoanDisbursed) {
          onLoanDisbursed(loanAmount, selectedBank.bankName, disbursementChannel);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Loan submission failed.');
      }
    } catch (err) {
      console.error('Loan application error:', err);
      alert('Failed to process loan disbursement.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-6">
        
        {/* Top Official Banner with Ethiopian Flag Accent */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 p-5 sm:p-6 text-white relative overflow-hidden">
          <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 text-xl font-black shrink-0 shadow-inner">
                🇪🇹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    Fayda National ID • NIDP e-KYC
                  </span>
                  <span className="text-2xs font-bold text-zinc-400">NBE Directive BFP/01/2024</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  National ID (FIN) Bank Credit & Loan Linkage
                </h2>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Link your unique 12-digit Fayda FIN to unlock instant, collateral-free agricultural lending from partner Ethiopian banks.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? 'text-amber-300' : 'text-zinc-500'}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-2xs font-black ${step >= 1 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>1</span>
              <span>Enter FIN</span>
            </div>
            <span className="text-zinc-600">─</span>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? 'text-amber-300' : 'text-zinc-500'}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-2xs font-black ${step >= 2 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>2</span>
              <span>Verified ID & Bank Credit</span>
            </div>
            <span className="text-zinc-600">─</span>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 3 ? 'text-amber-300' : 'text-zinc-500'}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-2xs font-black ${step >= 3 ? 'bg-amber-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>3</span>
              <span>Configure Loan</span>
            </div>
            <span className="text-zinc-600">─</span>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 4 ? 'text-amber-300' : 'text-zinc-500'}`}>
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-2xs font-black ${step >= 4 ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>4</span>
              <span>Disbursed</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ─────────────────────────────────────────────────────────────
              STEP 1: ENTER FAYDA IDENTIFICATION NUMBER (FIN)
          ───────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3">
                <Landmark className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <p className="font-bold">Why link your Fayda National ID?</p>
                  <p className="text-amber-900/80 mt-0.5">
                    Ethiopian partner commercial banks (CBE, Awash, Coop Bank of Oromia, Dashen) use your unique 12-digit 
                    <strong> Fayda Identification Number (FIN)</strong> to algorithmically verify your identity and farmland tenure. 
                    This replaces traditional physical land deed collateral with instant digital underwriting.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-800 mb-2 uppercase tracking-wider">
                  Enter Your 12-Digit Fayda Identification Number (FIN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={finInput}
                    onChange={(e) => handleFinChange(e.target.value)}
                    placeholder="4829-1048-9382"
                    disabled={isVerifying}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-zinc-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 text-xl font-mono font-black text-zinc-900 tracking-wider shadow-inner placeholder:text-zinc-400"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    <span className="text-2xs font-extrabold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600">
                      {finInput.replace(/[^0-9]/g, '').length} / 12 Digits
                    </span>
                  </div>
                </div>
              </div>

              {/* Demo Quick-Fill Profiles */}
              <div>
                <span className="text-2xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  ⚡ Quick Test Demo Farmer FINs (Click to load):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => {
                      setFinInput('4829-1048-9382');
                      handleVerifyFin('4829-1048-9382');
                    }}
                    className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500 bg-zinc-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950">Bekele Tadesse</p>
                    <p className="text-2xs font-mono font-bold text-emerald-700">4829-1048-9382</p>
                    <p className="text-2xs text-zinc-400">Wonji Teff • 4.5 Ha</p>
                  </button>

                  <button
                    onClick={() => {
                      setFinInput('8849-2019-3381');
                      handleVerifyFin('8849-2019-3381');
                    }}
                    className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500 bg-zinc-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950">Almaz Desta</p>
                    <p className="text-2xs font-mono font-bold text-emerald-700">8849-2019-3381</p>
                    <p className="text-2xs text-zinc-400">Sidama Coffee • 2.8 Ha</p>
                  </button>

                  <button
                    onClick={() => {
                      setFinInput('7729-1048-6623');
                      handleVerifyFin('7729-1048-6623');
                    }}
                    className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500 bg-zinc-50 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-950">Getachew Haile</p>
                    <p className="text-2xs font-mono font-bold text-emerald-700">7729-1048-6623</p>
                    <p className="text-2xs text-zinc-400">Bale Wheat • 6.0 Ha</p>
                  </button>
                </div>
              </div>

              {/* Verification Progress Box */}
              {isVerifying && (
                <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-emerald-300">e-KYC Biometric Verification In Progress</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400">{verifyStage}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleVerifyFin()}
                  disabled={isVerifying || finInput.replace(/[^0-9]/g, '').length < 10}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <span>Verify National ID & Connect Banks</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: VERIFIED NATIONAL ID & PARTNER BANK CREDIT OFFERS
          ───────────────────────────────────────────────────────────── */}
          {step === 2 && verificationData && (
            <div className="space-y-6">
              
              {/* Digital Fayda National ID Card */}
              <div className="rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white p-5 sm:p-6 border-2 border-emerald-600/60 shadow-2xl relative overflow-hidden">
                <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={verificationData.photoUrl}
                      alt={verificationData.fullName}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          VERIFIED CITIZEN
                        </span>
                        <span className="text-2xs font-bold text-zinc-400">{verificationData.amharicName}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {verificationData.fullName}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {verificationData.woreda}, {verificationData.zone}, {verificationData.region} ({verificationData.kebele})
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-4">
                    <span className="text-2xs font-bold text-zinc-400 block uppercase">Fayda FIN Number</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-base font-mono font-black text-amber-400 tracking-wider">
                        {verificationData.finNumber}
                      </span>
                      <button
                        onClick={() => handleCopyFin(verificationData.finNumber)}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        title="Copy FIN"
                      >
                        {copiedFin ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <span className="text-2xs text-emerald-400 font-semibold block mt-0.5">
                      ✓ Biometrics & Land Verified
                    </span>
                  </div>
                </div>

                {/* Agricultural Credentials from NIDP & MoA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-1">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xs text-zinc-400 block font-semibold">Land Certificate</span>
                    <span className="text-xs font-mono font-bold text-zinc-200 truncate block mt-0.5">
                      {verificationData.landUseCertificateNumber}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xs text-zinc-400 block font-semibold">Farmland Area</span>
                    <span className="text-xs font-bold text-zinc-200 block mt-0.5">
                      {verificationData.farmlandSizeHectares} Hectares
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xs text-zinc-400 block font-semibold">AVPS Credit Score</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                      {verificationData.creditScore} / 850 (Prime Tier-1)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-2xs text-zinc-400 block font-semibold">Max Credit Limit</span>
                    <span className="text-xs font-black text-amber-300 block mt-0.5">
                      {verificationData.maxCreditLimitEtb.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              {/* Partner Banks Collaborative Lending Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-black text-zinc-900">
                      Select Approved Partner Bank Loan Facility
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Collaborative credit lines pre-qualified against your verified National ID:
                    </p>
                  </div>
                  <span className="text-2xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    4 Banks Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {verificationData.eligibleBanks.map((bank) => {
                    const isSelected = selectedBank?.bankId === bank.bankId;
                    return (
                      <div
                        key={bank.bankId}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <PaymentLogo id={bank.bankId} size="lg" className="shrink-0" />
                            <div>
                              <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                                {bank.badge}
                              </span>
                              <h5 className="font-black text-sm text-zinc-900 mt-1">{bank.bankName}</h5>
                              <p className="text-xs font-bold text-emerald-800">{bank.productName}</p>
                            </div>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-zinc-300'
                          }`}>
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-100 text-xs">
                          <div>
                            <span className="text-2xs text-zinc-500 block">Interest Rate</span>
                            <span className="font-extrabold text-zinc-900">{bank.interestRatePercent}% p.a.</span>
                          </div>
                          <div>
                            <span className="text-2xs text-zinc-500 block">Max Borrowing</span>
                            <span className="font-extrabold text-zinc-900">{bank.maxLoanAmountEtb.toLocaleString()} ETB</span>
                          </div>
                          <div>
                            <span className="text-2xs text-zinc-500 block">Tenor</span>
                            <span className="font-semibold text-zinc-700">{bank.tenorMonths} Months</span>
                          </div>
                          <div>
                            <span className="text-2xs text-zinc-500 block">Disbursal</span>
                            <span className="font-semibold text-emerald-700">{bank.disbursementSpeed}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-100 cursor-pointer"
                >
                  Change FIN Number
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedBank}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <span>Continue with {selectedBank?.bankName}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: CONFIGURE LOAN & CHOOSE DISBURSEMENT DESTINATION
          ───────────────────────────────────────────────────────────── */}
          {step === 3 && verificationData && selectedBank && (
            <div className="space-y-6">
              
              {/* Selected Bank Banner */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PaymentLogo id={selectedBank.bankId} size="md" className="shrink-0" />
                  <div>
                    <h4 className="font-black text-sm text-zinc-900">{selectedBank.bankName}</h4>
                    <p className="text-xs text-zinc-500">{selectedBank.productName} • {selectedBank.interestRatePercent}% p.a. • Up to {selectedBank.maxLoanAmountEtb.toLocaleString()} ETB</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Change Bank
                </button>
              </div>

              {/* Loan Amount Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                    How much money do you need?
                  </label>
                  <span className="text-lg font-black text-emerald-800 font-mono">
                    {loanAmount.toLocaleString()} ETB
                  </span>
                </div>

                <input
                  type="range"
                  min={10000}
                  max={selectedBank.maxLoanAmountEtb}
                  step={5000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {[25000, 50000, 100000, 200000, selectedBank.maxLoanAmountEtb].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setLoanAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        loanAmount === amt
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {amt.toLocaleString()} ETB
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan Purpose */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-800 mb-2 uppercase tracking-wider">
                  Agricultural Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: 'Certified Seeds & Fertilizers (Business Agent Desk)', desc: 'Buy certified seeds & NPSB directly', icon: Sprout },
                    { title: 'Tractor & Solar Drip Irrigation', desc: 'Equipment purchase & mechanization', icon: Tractor },
                    { title: 'Harvest Labor & Cold-Chain Logistics', desc: 'Pre-harvest and transport operational funds', icon: Coins },
                    { title: 'Farm Expansion Working Capital', desc: 'General land preparation and inputs', icon: Landmark },
                  ].map((p) => {
                    const isSelected = loanPurpose === p.title;
                    return (
                      <div
                        key={p.title}
                        onClick={() => setLoanPurpose(p.title)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <p.icon className={`h-4 w-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-zinc-500'}`} />
                        <div>
                          <p className="text-xs font-bold text-zinc-900 leading-tight">{p.title}</p>
                          <p className="text-2xs text-zinc-500 mt-0.5">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disbursement Destination */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-800 mb-2 uppercase tracking-wider">
                  Disbursement Channel (Where should the money go?)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Channel 1: Direct to Business Agent Seed Escrow */}
                  <div
                    onClick={() => setDisbursementChannel('BUSINESS_AGENT_ESCROW')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      disbursementChannel === 'BUSINESS_AGENT_ESCROW'
                        ? 'border-teal-600 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xs font-black px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        RECOMMENDED 🌱
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-zinc-900">Business Agent Escrow</h5>
                    <p className="text-2xs text-zinc-600 mt-1 leading-relaxed">
                      Locks funds directly for seed & fertilizer delivery from the Business Agent. Zero cash handling.
                    </p>
                  </div>

                  {/* Channel 2: Telebirr */}
                  <div
                    onClick={() => setDisbursementChannel('TELEBIRR')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      disbursementChannel === 'TELEBIRR'
                        ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xs font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        INSTANT ⚡
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-zinc-900">Telebirr Wallet</h5>
                    <p className="text-2xs text-zinc-600 mt-1 leading-relaxed">
                      Instant mobile cash deposit to {verificationData.phoneLinked}. Spend immediately.
                    </p>
                  </div>

                  {/* Channel 3: CBE Birr */}
                  <div
                    onClick={() => setDisbursementChannel('CBE_BIRR')}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      disbursementChannel === 'CBE_BIRR'
                        ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        BANK ACCOUNT 🏦
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-zinc-900">CBE Birr / Bank</h5>
                    <p className="text-2xs text-zinc-600 mt-1 leading-relaxed">
                      Direct deposit to your verified Commercial Bank of Ethiopia branch account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Repayment Scheme */}
              <div className="p-4 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      Zero Monthly Stress
                    </span>
                    <span className="text-xs font-bold text-white">Post-Harvest Escrow Settlement</span>
                  </div>
                  <p className="text-2xs text-zinc-400 mt-1 max-w-md">
                    Repayment is settled automatically from your harvest sales when buyers pay into AgriLink Escrow. You pay nothing during growing season.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xs text-zinc-400 block font-semibold">Total Repayable (at {selectedBank.interestRatePercent}%)</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {Math.round(loanAmount * (1 + selectedBank.interestRatePercent / 100)).toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-100 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleApplyLoan}
                  disabled={isApplying}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {isApplying ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing with National ID...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Disburse {loanAmount.toLocaleString()} ETB</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 4: LOAN DISBURSED SUCCESS RECEIPT
          ───────────────────────────────────────────────────────────── */}
          {step === 4 && disbursementResult && (
            <div className="space-y-6 text-center py-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <span className="text-2xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  NBE Certified Loan Disbursed
                </span>
                <h3 className="text-2xl font-black text-zinc-900 mt-2">
                  {loanAmount.toLocaleString()} ETB Disbursed Successfully!
                </h3>
                <p className="text-xs text-zinc-600 mt-1 max-w-md mx-auto">
                  {selectedBank?.bankName} has approved and disbursed funds using your verified Fayda National ID (FIN).
                </p>
              </div>

              {/* Transaction Receipt Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500 font-semibold">Agreement Reference</span>
                  <span className="font-mono font-bold text-zinc-900">{disbursementResult.agreementRef}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500 font-semibold">National ID (FIN)</span>
                  <span className="font-mono font-bold text-zinc-900">{verificationData?.finNumber}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500 font-semibold">Lending Institution</span>
                  <div className="flex items-center gap-2">
                    <PaymentLogo id={selectedBank?.bankId || 'CBE'} size="sm" />
                    <span className="font-bold text-zinc-900">{selectedBank?.bankName}</span>
                  </div>
                </div>
                <div className="flex justify-between border-b border-zinc-200 pb-2">
                  <span className="text-zinc-500 font-semibold">Disbursed Channel</span>
                  <span className="font-bold text-emerald-800">
                    {disbursementChannel === 'BUSINESS_AGENT_ESCROW'
                      ? 'Business Agent Seed Escrow 🌾'
                      : disbursementChannel === 'TELEBIRR'
                      ? 'Telebirr Mobile Wallet ⚡'
                      : 'CBE Birr Bank Account 🏦'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-500 font-semibold">Repayment Model</span>
                  <span className="font-bold text-zinc-800">Post-Harvest Market Escrow (No monthly bills)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Return to Dashboard
                </button>
                {disbursementChannel === 'BUSINESS_AGENT_ESCROW' && (
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/agent/dashboard';
                    }}
                    className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Sprout className="h-4 w-4" />
                    <span>Browse Certified Seeds Now</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
