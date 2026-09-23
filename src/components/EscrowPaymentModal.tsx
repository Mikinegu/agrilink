import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Copy,
  Check,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  X,
  CreditCard,
  Building2,
  Smartphone,
  Landmark,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { PaymentLogo } from './PaymentLogos.tsx';
import {
  validatePaymentTransaction,
  inspectPaymentReceiptImage,
  generateSampleBankReceipt,
  ReceiptInspectionResult,
} from '../utils/aiPaymentController.ts';

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'automated' | 'manual';
  icon: string;
  officialAccount?: string;
  accountName?: string;
  placeholder?: string;
  patternHint?: string;
}

const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'VISA_MASTERCARD',
    name: 'Visa / Mastercard',
    type: 'automated',
    icon: '💳',
    officialAccount: 'Instant Gateway Switch',
    accountName: 'AgriLink Direct Card Switch',
    placeholder: 'Card gateway redirect',
  },
  {
    id: 'CBE_MOBILE_BANKING',
    name: 'CBE Mobile Banking',
    type: 'manual',
    icon: '🏦',
    officialAccount: '1000492819281',
    accountName: 'Agrilink Escrow Vault',
    placeholder: 'e.g. FT2619482910',
    patternHint: 'Starts with FT followed by 10-24 characters',
  },
  {
    id: 'CBE_BIRR',
    name: 'CBE Birr',
    type: 'manual',
    icon: '📱',
    officialAccount: '0911002233',
    accountName: 'Agrilink Tech Escrow',
    placeholder: 'e.g. 10928492014',
    patternHint: '10-18 digit numeric ID',
  },
  {
    id: 'TELEBIRR_MANUAL',
    name: 'Telebirr Transfer',
    type: 'manual',
    icon: '🟡',
    officialAccount: '849201',
    accountName: 'Agrilink Technologies PLC',
    placeholder: 'e.g. ADQ9842109X1',
    patternHint: '10-24 alphanumeric characters',
  },
  {
    id: 'BANK_OF_ABYSSINIA',
    name: 'Bank of Abyssinia',
    type: 'manual',
    icon: '🏛️',
    officialAccount: '84928102',
    accountName: 'Agrilink Escrow Vault',
    placeholder: 'e.g. BOA99214820',
    patternHint: '8-22 characters',
  },
];

interface Props {
  orderId: string | number;
  orderTotalETB: number;
  onClose: () => void;
  onSuccess?: (rail: string, txRef: string) => void;
}

export default function EscrowPaymentModal({
  orderId,
  orderTotalETB,
  onClose,
  onSuccess,
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>('CBE_MOBILE_BANKING');
  const [txNumber, setTxNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptInspection, setReceiptInspection] = useState<ReceiptInspectionResult | null>(null);
  const [isInspectingReceipt, setIsInspectingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  const activeMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[1];

  // Re-inspect receipt if user switches payment method after uploading
  useEffect(() => {
    if (receiptPreview) {
      setIsInspectingReceipt(true);
      const timer = setTimeout(() => {
        const inspection = inspectPaymentReceiptImage(selectedMethod, receiptPreview, receiptFileName);
        setReceiptInspection(inspection);
        setIsInspectingReceipt(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [selectedMethod]);

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptFileName(file.name);
      setErrorMessage('');
      setIsInspectingReceipt(true);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setReceiptPreview(dataUrl);
        setTimeout(() => {
          const inspection = inspectPaymentReceiptImage(selectedMethod, dataUrl, file.name);
          setReceiptInspection(inspection);
          setIsInspectingReceipt(false);
        }, 400);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSampleReceipt = () => {
    const sample = generateSampleBankReceipt(selectedMethod, orderId, orderTotalETB, txNumber || undefined);
    setReceiptPreview(sample.dataUrl);
    setReceiptFileName(sample.fileName);
    setErrorMessage('');
    if (!txNumber.trim()) {
      setTxNumber(sample.txNumber);
    }
    setIsInspectingReceipt(true);
    setTimeout(() => {
      const inspection = inspectPaymentReceiptImage(selectedMethod, sample.dataUrl, sample.fileName);
      setReceiptInspection(inspection);
      setIsInspectingReceipt(false);
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (activeMethod.type === 'automated') {
      // Direct API redirect for Card payments
      window.location.href = `/api/v1/payments/card/checkout?order_id=${orderId}&amount=${orderTotalETB}`;
      return;
    }

    if (!txNumber.trim()) {
      setErrorMessage('Please enter the transaction reference or journal number.');
      setIsSubmitting(false);
      return;
    }

    // 1. AI Transaction Authenticity Gate
    const aiValidation = validatePaymentTransaction(selectedMethod, txNumber.trim());
    if (!aiValidation.isValid) {
      setErrorMessage(aiValidation.feedbackMessageEn);
      setIsSubmitting(false);
      return;
    }

    if (!receiptPreview) {
      setErrorMessage('Please upload an official receipt screenshot or slip.');
      setIsSubmitting(false);
      return;
    }

    // 2. AI Receipt Payment Name Verification Gate (Must contain at least the name of the payment!)
    const inspection = inspectPaymentReceiptImage(selectedMethod, receiptPreview, receiptFileName);
    if (!inspection.isValid) {
      setReceiptInspection(inspection);
      setErrorMessage(inspection.feedbackMessageEn);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/payments/submit-manual-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: String(orderId),
          rail: selectedMethod,
          tx_number: txNumber.trim(),
          claimed_amount: orderTotalETB,
          receipt_image: receiptPreview,
          receipt_filename: receiptFileName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setSuccessData(data);
        if (onSuccess) {
          onSuccess(selectedMethod, data.normalized_ref || txNumber);
        }
      } else {
        setErrorMessage(data.error || 'Submission declined by security gate.');
      }
    } catch {
      setErrorMessage('Network error submitting payment proof. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                100% Escrow Guard
              </span>
              <h3 className="text-lg font-black text-zinc-900 leading-tight">Secure Escrow Checkout</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              Double-Blind Escrow Active
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Order #{orderId}</span>
          </div>
          <p className="text-sm text-emerald-950 font-medium mt-1">
            Total Due: <span className="font-black text-base font-mono">{orderTotalETB.toLocaleString()} ETB</span>
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Funds remain safely locked in escrow until you inspect and verify crop quality at delivery.
          </p>
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {successData ? (
          <div className="space-y-4 py-4 text-center">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Funds Locked In Escrow
              </span>
              <h4 className="text-lg font-black text-zinc-900 mt-1">Payment Evidence Logged</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Receipt #{successData.normalized_ref} has been recorded with SHA-256 fingerprint. Transporter notified to stage dispatch.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Transaction ID:</span>
                <span className="font-mono font-bold text-zinc-900">{successData.normalized_ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Rail:</span>
                <span className="font-bold text-zinc-900">{successData.rail}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1.5">
                <span className="text-zinc-500">Escrow State:</span>
                <span className="font-bold text-emerald-700 font-mono">ESCROW_LOCKED</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Done / Return to Orders
            </button>
          </div>
        ) : (
          <>
            {/* Channel Selection Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m.id);
                    setErrorMessage('');
                  }}
                  className={`p-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    selectedMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <PaymentLogo id={m.id} size="sm" />
                  <span className="text-center text-[10px] leading-tight line-clamp-1">{m.name}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeMethod.type === 'automated' ? (
                <div className="text-center py-8 border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 space-y-2">
                  <CreditCard className="h-8 w-8 text-emerald-700 mx-auto" />
                  <p className="text-sm font-black text-zinc-800">Direct Visa / Mastercard Gateway</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    You will be redirected to the PCI-DSS certified checkout switch. Status confirms automatically via instant webhooks.
                  </p>
                </div>
              ) : (
                <>
                  {/* Account Details Box with 1-Click Copy */}
                  <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-xs text-zinc-700 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Official Channel:</span>
                      <span className="font-bold text-zinc-900">{activeMethod.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Account Name:</span>
                      <span className="font-semibold text-zinc-900">{activeMethod.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-zinc-200">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block">Account / Code</span>
                        <span className="font-mono font-black text-emerald-800 text-sm">
                          {activeMethod.officialAccount}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeMethod.officialAccount || '')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Transaction ID Input with Real-Time AI Sentinel */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-700">
                        Transaction Number / Journal Ref <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-emerald-700 animate-pulse" />
                        AI Anti-Fraud Active
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder={activeMethod.placeholder}
                        value={txNumber}
                        onChange={(e) => {
                          setTxNumber(e.target.value);
                          setErrorMessage('');
                        }}
                        className={`w-full text-sm font-mono font-bold px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          txNumber.trim()
                            ? validatePaymentTransaction(selectedMethod, txNumber.trim()).isValid
                              ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950 focus:ring-emerald-600'
                              : 'border-amber-400 bg-amber-50/30 text-amber-950 focus:ring-amber-500'
                            : 'border-zinc-300 bg-zinc-50 focus:bg-white focus:ring-emerald-600 text-zinc-900'
                        }`}
                      />
                    </div>

                    {/* Live AI Analysis Card */}
                    {txNumber.trim() ? (
                      (() => {
                        const check = validatePaymentTransaction(selectedMethod, txNumber.trim());
                        return check.isValid ? (
                          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px] text-emerald-950 flex items-center gap-1.5">
                                <span>AI Verified: Authentic Format Detected</span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-200/70 text-[9px] font-mono">
                                  {check.normalizedRef}
                                </span>
                              </p>
                              <p className="text-[11px] text-emerald-800 leading-tight">
                                Matches genuine {activeMethod.name} clearing pattern. Safe for escrow lock.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 animate-in fade-in">
                            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-bold text-[11px] text-amber-900">
                                AI Alert: Unrecognized / Incorrect Pattern
                              </p>
                              <p className="text-[11px] text-amber-800 leading-tight">
                                {check.feedbackMessageEn}
                              </p>
                              {check.sampleValidRef && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTxNumber(check.sampleValidRef || '');
                                    setErrorMessage('');
                                  }}
                                  className="mt-1 text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 cursor-pointer"
                                >
                                  ✨ Click here to paste verified sample ({check.sampleValidRef})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Format: {activeMethod.patternHint || 'Official bank journal number'}</span>
                        {activeMethod.placeholder && activeMethod.placeholder.startsWith('e.g.') && (
                          <button
                            type="button"
                            onClick={() => {
                              const sample = activeMethod.placeholder?.replace('e.g. ', '') || '';
                              setTxNumber(sample);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                          >
                            Use Sample {activeMethod.placeholder.replace('e.g. ', '')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Receipt File Upload with AI Payment Name Verification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-700">
                        Upload Official Receipt / Screenshot <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSampleReceipt}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-600" />
                        <span>Load Sample {activeMethod.name.split(' ')[0]} Receipt</span>
                      </button>
                    </div>

                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">AI Requirement:</span> The uploaded receipt image <strong className="underline">must clearly show the name of the payment</strong> (e.g. <strong>{activeMethod.name}</strong>) along with the transaction reference and amount.
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml, application/pdf"
                      required
                      onChange={handleFileChange}
                      className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    />

                    {/* AI Receipt Inspection Status Feedback Card */}
                    {isInspectingReceipt && (
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-2.5 text-xs text-zinc-700 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
                        <span>AI Sentinel scanning receipt image to verify payment name "{activeMethod.name}"...</span>
                      </div>
                    )}

                    {!isInspectingReceipt && receiptInspection && (
                      <div
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          receiptInspection.isValid
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : receiptInspection.status === 'MISMATCHED_PAYMENT_NAME'
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {receiptInspection.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : receiptInspection.status === 'MISMATCHED_PAYMENT_NAME' ? (
                            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold flex items-center gap-2">
                              <span>
                                {receiptInspection.isValid
                                  ? 'AI Verified: Payment Name Confirmed'
                                  : receiptInspection.status === 'MISMATCHED_PAYMENT_NAME'
                                  ? 'AI Alert: Payment Provider Mismatch'
                                  : 'AI Alert: Missing Payment Name'}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/70 rounded border border-current">
                                {receiptInspection.confidence}% Confidence
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-90">
                              {receiptInspection.feedbackMessageEn}
                            </p>
                            {receiptInspection.feedbackMessageAm && !receiptInspection.isValid && (
                              <p className="text-[10px] leading-relaxed text-zinc-600 border-t border-zinc-200/60 pt-1">
                                🇪🇹 {receiptInspection.feedbackMessageAm}
                              </p>
                            )}
                            {receiptPreview && (
                              <div className="mt-2 flex items-center gap-2 pt-1 border-t border-current/10">
                                <img
                                  src={receiptPreview}
                                  alt="Receipt Preview"
                                  className="h-10 w-16 object-cover rounded border border-zinc-300 bg-white"
                                />
                                <span className="text-[10px] text-zinc-500 font-mono truncate">
                                  {receiptFileName || 'receipt_capture.png'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl transition-all shadow-md text-sm disabled:bg-zinc-400 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? 'Securing Escrow Deposit...'
                    : `Confirm & Lock ${orderTotalETB.toLocaleString()} ETB`}
                </span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
