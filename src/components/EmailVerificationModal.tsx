import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Edit3,
  ShieldCheck,
  Lock,
  X,
  ExternalLink,
  Inbox,
  Search,
} from 'lucide-react';
import { verifySupabaseOtp, resendSupabaseVerificationOtp } from '../lib/supabase.ts';
import { User } from '../types/index.ts';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  fullName?: string;
  onClose: () => void;
  onVerificationSuccess: (user: User) => void;
  onOpenLogin?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email: initialEmail,
  fullName = 'Valued Stakeholder',
  onClose,
  onVerificationSuccess,
  onOpenLogin,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (!isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setSuccessMsg('');
      setIsVerified(false);
      setCountdown(45);
      return;
    }

    // Auto focus first input on open
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);

    // Countdown interval for resend
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const fullCode = digits.join('');

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // Handle paste into any digit input
      const pasteDigits = cleaned.slice(0, 6).split('');
      const newDigits = [...digits];
      pasteDigits.forEach((d, i) => {
        if (index + i < 6) {
          newDigits[index + i] = d;
        }
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + pasteDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setErrorMsg('');

    // Jump to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      pasted.split('').forEach((char, idx) => {
        if (idx < 6) newDigits[idx] = char;
      });
      setDigits(newDigits);
      const targetIdx = Math.min(pasted.length, 5);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code received in your Gmail inbox.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await verifySupabaseOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
      });

      if (res.success && res.user) {
        setIsVerified(true);
        setSuccessMsg('Email verified successfully! Activating your account...');
        setTimeout(() => {
          onVerificationSuccess(res.user);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Invalid verification code. Please check your Gmail inbox and enter the correct code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await resendSupabaseVerificationOtp(email.trim().toLowerCase());
      if (res.success) {
        setCountdown(45);
        setSuccessMsg(res.message || 'A fresh 6-digit code has been sent to your Gmail inbox.');
      } else {
        setErrorMsg(res.error || 'Failed to resend code. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const isGmail = email.toLowerCase().includes('@gmail.com');

  return (
    <div
      id="email-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        id="email-verification-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-6 py-5 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Verify Your Email Address</h3>
                <p className="text-xs text-emerald-100">Step 2: Enter Code from Gmail</p>
              </div>
            </div>
            <button
              id="close-email-verification-modal-btn"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isVerified ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Email Address Verified!</h4>
              <p className="text-sm text-gray-600 max-w-xs">
                Welcome, <span className="font-semibold text-emerald-800">{fullName}</span>. Your account is fully active.
              </p>
              <div className="inline-flex items-center space-x-2 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Signing you in to your dashboard...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Target Email Banner */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-emerald-950 text-sm">Check your Gmail inbox</p>
                    <p className="text-emerald-800/90 mt-0.5">
                      We sent a 6-digit verification code to:
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-bold text-emerald-950 font-mono underline text-xs break-all">
                        {email}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                        className="text-emerald-700 hover:text-emerald-900 text-xs inline-flex items-center gap-1 font-bold ml-2 shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingEmail ? 'Done' : 'Change'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {isEditingEmail && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter correct email"
                      className="text-xs px-3 py-2 border border-emerald-300 rounded-xl bg-white font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="text-xs px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shrink-0 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Direct Gmail Navigation Buttons */}
                {isGmail && (
                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100/60 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      <span>Open Gmail</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <a
                      href="https://mail.google.com/mail/u/0/#search/from%3Asupabase+OR+agrilink+in%3Aanywhere"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-white hover:bg-emerald-100/60 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <Search className="w-3 h-3 text-emerald-600" />
                      <span>Search Spam / All Mail</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  </div>
                )}
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Enter 6-Digit Code From Gmail
                  </label>
                  <span className="text-xs text-zinc-500 font-medium">6 digits</span>
                </div>

                <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      id={`otp-digit-input-${idx}`}
                      placeholder="•"
                      className={`w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl border-2 transition-all ${
                        digit
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900'
                          : 'border-zinc-200 bg-zinc-50/60 text-zinc-800 placeholder-zinc-300'
                      } focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-100 focus:outline-none`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 mt-2 text-center">
                  Tip: Check your Gmail <strong>Spam</strong> or <strong>Promotions</strong> folder if not in primary inbox.
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Success Info Message */}
              {successMsg && !isVerified && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{successMsg}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                id="submit-email-verification-btn"
                disabled={loading || fullCode.length !== 6}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Activate Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend & Actions */}
              <div className="pt-2 border-t border-zinc-100 flex flex-col items-center space-y-3 text-center">
                <div className="text-xs text-zinc-500">
                  Didn't receive the email?{' '}
                  {countdown > 0 ? (
                    <span className="font-semibold text-zinc-700">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      id="resend-verification-code-btn"
                      onClick={handleResend}
                      disabled={resending}
                      className="font-bold text-emerald-700 hover:text-emerald-900 underline inline-flex items-center space-x-1 cursor-pointer"
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Sending to Gmail...</span>
                        </>
                      ) : (
                        <span>Resend Verification Code</span>
                      )}
                    </button>
                  )}
                </div>

                {onOpenLogin && (
                  <button
                    type="button"
                    id="back-to-login-from-verify-btn"
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-700 font-medium cursor-pointer"
                  >
                    Already verified? Return to Sign In
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Email Verification</span>
          </div>
          <span>AgriLink Auth</span>
        </div>
      </div>
    </div>
  );
};
