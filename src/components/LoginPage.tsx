import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Tractor,
  Truck,
  Layers,
} from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import { AgriLinkLogo } from './AgriLinkLogo.tsx';
import ethiopianFarmlandSunrise from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';

export const LoginPage: React.FC = () => {
  const { login, switchPersona, currentUser, checkEmailVerification } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email verification helper state
  const [showVerificationHelper, setShowVerificationHelper] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // If redirected from a guarded route, go back there; else go to role dashboard
  const from = (location.state as any)?.from?.pathname;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setVerificationFeedback(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your phone number or email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({
      phoneOrEmail: identifier.trim(),
      pin: pin.trim() || '123456',
    });

    setIsSubmitting(false);

    if (result.success && result.user) {
      const destination = from || getRoleDashboardPath(result.user.role);
      navigate(destination, { replace: true });
    } else {
      if (result.requiresEmailVerification || result.error?.toLowerCase().includes('email verification')) {
        setShowVerificationHelper(true);
      }
      setErrorMessage(result.error || 'Login failed. Please check credentials.');
    }
  };

  const handleCheckVerification = async () => {
    if (!identifier.trim()) return;
    setIsVerifyingOtp(true);
    setVerificationFeedback(null);
    const check = await checkEmailVerification(identifier.trim());
    setIsVerifyingOtp(false);
    if (check.verified && check.user) {
      const destination = from || getRoleDashboardPath(check.user.role);
      navigate(destination, { replace: true });
    } else {
      setVerificationFeedback(
        check.message || 'Verification not detected yet. Please ensure you clicked the link in your email.'
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) return;
    setIsVerifyingOtp(true);
    setVerificationFeedback(null);
    try {
      const res = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.trim(),
          code: verificationCode.trim(),
        }),
      });
      const data = await res.json();
      setIsVerifyingOtp(false);
      if (res.ok && data.user) {
        const destination = from || getRoleDashboardPath(data.user.role);
        navigate(destination, { replace: true });
      } else {
        setVerificationFeedback(data.error || 'Invalid code. Please re-enter or click the link in your email.');
      }
    } catch (err: any) {
      setIsVerifyingOtp(false);
      setVerificationFeedback(err.message || 'Verification service error.');
    }
  };

  const handleResendLink = async () => {
    if (!identifier.trim()) return;
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier.trim() }),
      });
      setVerificationFeedback('A fresh verification link & code has been dispatched to your email.');
    } catch (err) {
      setVerificationFeedback('Failed to resend. Please try again in a moment.');
    }
  };

  const handleDemoSwitch = async (userId: number) => {
    setIsSubmitting(true);
    const user = await switchPersona(userId);
    setIsSubmitting(false);
    if (user) {
      const destination = from || getRoleDashboardPath(user.role);
      navigate(destination, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-50 font-sans text-zinc-900">
      {/* Left Brand Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-950 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background art */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-400" preserveAspectRatio="none">
            <polygon points="0,100 100,0 100,100" />
          </svg>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex w-fit">
              <AgriLinkLogo size="md" theme="dark" subtext={t.auth.nationalEcosystem} />
            </Link>
            <LanguageSelector variant="pill" theme="dark" className="bg-emerald-950/70 border border-emerald-400/30 text-emerald-100" />
          </div>

          <div className="pt-4">
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white mb-4 whitespace-pre-line">
              {t.auth.brandHeadline}
            </h2>
            <p className="text-emerald-200/80 text-sm leading-relaxed max-w-md">
              {t.auth.brandSubtitle}
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-zinc-900/60 relative aspect-16/9">
            <img
              src={ethiopianFarmlandSunrise}
              alt="Ethiopian Farmland"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">{t.auth.verifiedProducerDirectTrade}</span>
              <span className="text-[11px] text-zinc-300">{t.auth.ethiopianCorridors}</span>
            </div>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="relative z-10 pt-8 border-t border-emerald-800/60 flex flex-wrap items-center gap-4 text-xs text-emerald-300/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> {t.auth.nbeCompliantEscrow}
          </span>
          <span>•</span>
          <span>{t.auth.telebirrMobileMoney}</span>
          <span>•</span>
          <span>{t.auth.cbeBank}</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">{t.auth.accountAccessBadge}</span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
              {t.auth.signInWorkspace}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.auth.enterPhoneOrEmail}
            </p>
          </div>

          {/* Quick Demo Switcher Card for Instant Evaluation */}
          <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                {t.auth.quickDemoRoleSwitcher}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">{t.auth.oneClickTestLogin}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSwitch(1)}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-800 flex items-center gap-1">
                  <Tractor className="h-3 w-3 text-emerald-600" /> {t.auth.bekeleFarmer}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{t.auth.wonjiCoop}</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch(6)}
                className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-zinc-900 group-hover:text-blue-800 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-blue-600" /> {t.auth.saraBuyer}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{t.auth.skylightCatering}</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch(8)}
                className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-zinc-200 hover:border-amber-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-zinc-900 group-hover:text-amber-800 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-amber-600" /> {t.auth.dawitLogistics}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{t.auth.reeferFleet}</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch(10)}
                className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-300 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-zinc-900 group-hover:text-rose-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-rose-600" /> {t.auth.adminExecutive}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">{t.auth.platformGovernance}</p>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Verification Helper Panel */}
          {showVerificationHelper && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2 text-amber-900 text-xs">
                <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t.auth.emailVerificationInProgress}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {t.auth.emailVerificationHint}
                  </p>
                </div>
              </div>

              {verificationFeedback && (
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs font-medium text-amber-950">
                  {verificationFeedback}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={isVerifyingOtp}
                  onClick={handleCheckVerification}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isVerifyingOtp ? t.auth.checkingVerification : t.auth.verifiedViaLinkBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendLink}
                  className="py-2 px-3 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition-all cursor-pointer"
                >
                  {t.auth.resendLinkBtn}
                </button>
              </div>

              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-semibold text-amber-900 block mb-1.5">
                  {t.auth.orEnter6DigitCode}
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.auth.codePlaceholder}
                    className="w-32 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={isVerifyingOtp || verificationCode.length < 6}
                    onClick={handleVerifyCode}
                    className="py-1.5 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                  >
                    {t.auth.confirmCodeBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                {t.auth.phoneOrEmailLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.auth.phonePlaceholder}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                />
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">{t.auth.phoneFormatHint}</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700">{t.auth.pinLabel}</label>
                <span className="text-[11px] text-zinc-400 font-medium">{t.auth.demoPinHint}</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={t.auth.pinPlaceholder}
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer"
            >
              <span>{isSubmitting ? t.auth.authenticating : t.auth.signInButton}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              {t.auth.newToAgriLink}{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                {t.auth.createAccount}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
