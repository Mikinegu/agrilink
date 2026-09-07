import React, { useState } from 'react';
import {
  UserRole,
} from '../types/index.ts';
import {
  X,
  LogIn,
  Sprout,
  Building2,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Award,
  Headphones,
  FileCheck,
  CheckCircle2,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MoreVertical,
  Zap,
  Mail,
  Users,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { signInWithSupabase } from '../lib/supabase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExistingUser: (userId: number) => void;
  onOpenSignUp: () => void;
  onOpenVerification?: (data: { email: string; fullName?: string }) => void;
  onOpenCallCenter?: () => void;
  onOpenBrand?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectExistingUser,
  onOpenSignUp,
  onOpenVerification,
  onOpenCallCenter,
  onOpenBrand,
}) => {
  const agrilinkLogo =
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

  const [activeTab, setActiveTab] = useState<'SUPABASE_EMAIL' | 'PHONE' | 'ROLES'>('SUPABASE_EMAIL');
  
  // Supabase Email & Password Auth State
  const [email, setEmail] = useState('alemu.farmer@agrilink.et');
  const [password, setPassword] = useState('agrilink2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone / PIN Auth State
  const [phoneOrEmail, setPhoneOrEmail] = useState('0911223344');
  const [pinCode, setPinCode] = useState('1234');

  const [loginError, setLoginError] = useState('');
  const [unverifiedEmailInfo, setUnverifiedEmailInfo] = useState<{ email: string; fullName?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  if (!isOpen) return null;

  // Supabase Email & Password Sign-In Handler
  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setUnverifiedEmailInfo(null);

    if (!email.trim()) {
      setLoginError('Please enter your Supabase registered email address.');
      return;
    }
    if (!password) {
      setLoginError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signInWithSupabase({
        email: email.trim(),
        password: password,
      });

      if (result.requiresEmailVerification) {
        setUnverifiedEmailInfo({ email: email.trim() });
        setLoginError('Email verification required. Please verify your email address before signing in.');
        return;
      }

      if (result.success && result.user) {
        onSelectExistingUser(result.user.id);
        onClose();
        return;
      }

      // If Supabase returned error, try fallback via backend login
      if (result.error) {
        console.warn('Supabase Auth response:', result.error);
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneOrEmail: email.trim(),
            pin: password,
          }),
        });
        const data = await res.json();
        if (res.status === 403 && data.requiresEmailVerification) {
          setUnverifiedEmailInfo({
            email: data.email || email.trim(),
            fullName: data.fullName,
          });
          setLoginError(data.error || 'Email verification required. Please verify your email before signing in.');
          return;
        }
        if (res.ok && data.user) {
          onSelectExistingUser(data.user.id);
          onClose();
          return;
        }
        setLoginError(result.error || data.error || 'Invalid Supabase login credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication service unreachable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phone / PIN Sign-In Handler
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setUnverifiedEmailInfo(null);

    if (!phoneOrEmail.trim()) {
      setLoginError('Please enter your registered phone number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrEmail: phoneOrEmail.trim(),
          pin: pinCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.status === 403 && data.requiresEmailVerification) {
        setUnverifiedEmailInfo({
          email: data.email,
          fullName: data.fullName,
        });
        setLoginError(data.error || 'Email verification required before signing in.');
        return;
      }
      if (res.ok && data.user) {
        onSelectExistingUser(data.user.id);
        onClose();
      } else {
        setLoginError(data.error || 'Invalid phone or PIN. Please check details or register.');
      }
    } catch (err: any) {
      setLoginError('Network error connecting to authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role Personas for instant switching & developer testing
  const DEMO_PERSONAS = [
    {
      id: 1,
      name: 'Alemu Bekele',
      role: 'FARMER',
      title: 'Farmer & Cooperative Lead',
      email: 'alemu.farmer@agrilink.et',
      org: 'Wonji Smallholder Union',
      region: 'Oromia',
      icon: Sprout,
      color: 'emerald',
    },
    {
      id: 2,
      name: 'Sara Mengistu',
      role: 'BUSINESS_BUYER',
      title: 'Corporate Offtaker & Processor',
      email: 'sara.buyer@agrilink.et',
      org: 'Meki Batu Agro-Processing',
      region: 'Addis Ababa',
      icon: Building2,
      color: 'blue',
    },
    {
      id: 3,
      name: 'Kassahun Tadesse',
      role: 'INPUT_SUPPLIER',
      title: 'Certified Input Supplier',
      email: 'kassahun.inputs@agrilink.et',
      org: 'Ethio-Agro Inputs Corp',
      region: 'Oromia',
      icon: Boxes,
      color: 'amber',
    },
    {
      id: 4,
      name: 'Yonas Haile',
      role: 'DRIVER',
      title: 'Fleet Logistics Driver',
      email: 'yonas.driver@agrilink.et',
      org: 'Ethio-Trans Logistics',
      region: 'Oromia',
      icon: Smartphone,
      color: 'purple',
    },
    {
      id: 5,
      name: 'Tigist Hailu',
      role: 'FINANCIAL_INSTITUTION',
      title: 'Credit Underwriter Officer',
      email: 'tigist.finance@agrilink.et',
      org: 'Cooperative Bank of Oromia',
      region: 'Oromia',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      id: 6,
      name: 'Dr. Dawit Zewdu',
      role: 'PLATFORM_ADMIN',
      title: 'Platform Governance & Escrow Admin',
      email: 'admin.dawit@agrilink.et',
      org: 'AgriLink National Directorate',
      region: 'Addis Ababa',
      icon: ShieldCheck,
      color: 'zinc',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Branding Banner */}
        <div className="bg-zinc-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <img
                src={agrilinkLogo}
                alt="AgriLink Ethiopia"
                className="h-11 w-11 rounded-full object-cover border-2 border-emerald-500 shadow-md bg-white shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white">
                    AGRI<span className="text-emerald-400">LINK</span> ETHIOPIA
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-zinc-400">
                    National Agricultural Escrow & Trade Portal
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" /> Supabase Auth
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Support & Options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-zinc-900 animate-in fade-in duration-100">
                    <div className="px-3 py-1.5 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Help & Information
                    </div>

                    {onOpenCallCenter && (
                      <button
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onClose();
                          onOpenCallCenter();
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs font-semibold text-zinc-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Headphones className="h-4 w-4 text-emerald-700" />
                        <span>Support Hotline (0961123330)</span>
                      </button>
                    )}

                    {onOpenBrand && (
                      <button
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onClose();
                          onOpenBrand();
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors cursor-pointer"
                      >
                        <Award className="h-4 w-4 text-zinc-600" />
                        <span>Certifications & Standards</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('SUPABASE_EMAIL');
              setLoginError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SUPABASE_EMAIL'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-emerald-600" />
            <span>Supabase Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PHONE');
              setLoginError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PHONE'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            <span>Phone / PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ROLES');
              setLoginError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ROLES'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-xl'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-600" />
            <span>Demo Personas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-rose-600 font-bold">!</span>
                <span className="flex-1">{loginError}</span>
              </div>
              {unverifiedEmailInfo && onOpenVerification && (
                <button
                  type="button"
                  id="open-email-verify-from-login-btn"
                  onClick={() => {
                    onClose();
                    onOpenVerification(unverifiedEmailInfo);
                  }}
                  className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Verify Email Address Now →</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 1: SUPABASE EMAIL & PASSWORD AUTH */}
          {activeTab === 'SUPABASE_EMAIL' && (
            <form onSubmit={handleSupabaseSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Supabase User Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alemu.farmer@agrilink.et"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-zinc-400 bg-white"
                  />
                  <Mail className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Default demo: <code className="font-mono font-bold text-zinc-700">agrilink2026</code>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Supabase password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-zinc-400 bg-white"
                  />
                  <Lock className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                  />
                  <span>Persist session with Supabase</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating with Supabase...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In via Supabase Auth</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: PHONE / PIN AUTH */}
          {activeTab === 'PHONE' && (
            <form onSubmit={handlePhoneSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="e.g. 0911223344 or 0961123330"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-zinc-400 bg-white"
                  />
                  <Phone className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Security PIN / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 1234)"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-zinc-300 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-zinc-400 bg-white"
                  />
                  <Lock className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In with Phone</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: DEMO PERSONAS QUICK SELECT */}
          {activeTab === 'ROLES' && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 mb-2">
                Select any verified role persona to instantly test workflows and permissions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_PERSONAS.map((persona) => {
                  const Icon = persona.icon;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => {
                        onSelectExistingUser(persona.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl border border-zinc-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all text-left flex items-center gap-3 cursor-pointer group bg-white shadow-2xs"
                    >
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {persona.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold uppercase">
                            {persona.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">{persona.org}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}


        </div>

        {/* Trust Footer */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 text-center text-[10px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Supabase Auth & Escrow Protected</span>
          </div>
          <span className="text-zinc-400">MoA & ECX Regulated</span>
        </div>
      </div>
    </div>
  );
};
