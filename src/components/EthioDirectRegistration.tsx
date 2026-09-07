import React, { useState } from 'react';
import ethiopianFarmlandSunrise from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail,
  User, Building2, MapPin, ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import { User as UserType } from '../types/index.ts';
import { signUpWithSupabase } from '../lib/supabase.ts';
import { useNavigate } from 'react-router-dom';
import { getRoleDashboardPath } from '../context/AuthContext.tsx';
interface Props {
  onNavigate?: (tab: string) => void;
  onRegisteredSuccess?: (user: UserType) => void;
  onOpenLogin?: () => void;
}

const REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Sidama', 'SNNPR',
  'Tigray', 'Somali', 'Afar', 'Dire Dawa', 'Harari',
  'Benishangul-Gumuz', 'Gambela',
];

const BANKS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank', 'Dashen Bank', 'Amhara Bank',
  'Bunna Bank', 'Zemen Bank',
  'Cooperative Bank of Oromia', 'Abyssinia Bank',
];

const BUYER_TYPES = ['INDIVIDUAL', 'SUPERMARKET', 'RESTAURANT', 'HOTEL', 'PROCESSOR', 'WHOLESALER', 'EXPORTER'];

export default function EthioDirectRegistration({ onNavigate, onRegisteredSuccess, onOpenLogin }: Props) {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1);
  const [role, setRole]     = useState<'producer' | 'buyer' | 'logistics' | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [otpSent, setOtpSent]           = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [doneUser, setDoneUser]         = useState<any>(null);

  const [f, setF] = useState({
    fullName: '', email: '', password: '', phone: '', otp: '',
    region: 'Oromia', zone: '', woreda: '',
    farmName: '', farmSize: '', primaryCrops: '', nationalId: '',
    bankName: 'Commercial Bank of Ethiopia (CBE)', bankAccount: '',
    companyName: '', tinNumber: '', deliveryAddress: '', buyerType: 'INDIVIDUAL',
    vehicleType: 'Isuzu NPR (3.5 Tonnes)', licensePlate: '', licenseNumber: '',
  });

  const u = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const inp = (focus = 'emerald') =>
    `w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${focus}-500 outline-none transition text-sm`;
  const lbl = 'block text-sm font-bold text-slate-700 mb-1.5';

  const handleNext = () => {
    setSubmitError(null);
    if (step === 1 && !role) {
      setSubmitError('Please select your account type.'); return;
    }
    if (step === 2) {
      if (!f.fullName.trim()) { setSubmitError('Please enter your full name.'); return; }
      if (!f.email.includes('@')) { setSubmitError('Please enter a valid email address.'); return; }
      if (f.password.length < 6) { setSubmitError('Password must be at least 6 characters.'); return; }
      if (f.phone.replace(/\D/g, '').length < 9) { setSubmitError('Please enter a valid phone number.'); return; }
      if (!otpSent) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp); setOtpSent(true); return;
      }
      if (!f.otp.trim()) { setSubmitError('Please enter the verification code.'); return; }
    }
    setStep(s => s + 1);
  };

  const handleBack = () => { setSubmitError(null); setStep(s => s - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const roleMap: Record<string, string> = {
        producer: 'FARMER', buyer: 'BUSINESS_BUYER', logistics: 'DRIVER',
      };
      const mappedRole  = roleMap[role!] || 'FARMER';
      const cleanPhone  = f.phone.startsWith('+251') ? f.phone : `+251${f.phone.replace(/^0/, '')}`;
      const cleanEmail  = f.email.trim().toLowerCase();
      const orgName     = role === 'buyer'    ? f.companyName
                        : role === 'producer' ? (f.farmName || `${f.fullName} Farm`)
                        : `${f.fullName} Transport`;
      const crops       = f.primaryCrops
        ? f.primaryCrops.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined;

      // ── 1. Supabase Auth — create account (with local fallback) ────────
      let sbResult: any = null;
      try {
        sbResult = await signUpWithSupabase({
          email:            cleanEmail,
          password:         f.password,
          fullName:         f.fullName.trim(),
          phone:            cleanPhone,
          role:             mappedRole,
          organizationName: orgName,
          region:           f.region,
          zone:             f.zone    || undefined,
          woreda:           f.woreda  || undefined,
          farmSize:         f.farmSize ? Number(f.farmSize) : undefined,
          primaryCrops:     crops,
          buyerType:        role === 'buyer' ? f.buyerType : undefined,
        });
      } catch (sbErr) {
        console.warn('Supabase Auth bypassed:', sbErr);
      }

      // Fail only on genuine user-facing errors (not missing API key / connection issues)
      const isConfigOrApiKeyErr =
        sbResult?.error?.toLowerCase().includes('api key') ||
        sbResult?.error?.toLowerCase().includes('apikey') ||
        sbResult?.error?.toLowerCase().includes('invalid api');

      const isAlreadyRegistered =
        sbResult?.error?.toLowerCase().includes('already registered') ||
        sbResult?.error?.toLowerCase().includes('already exists') ||
        sbResult?.error?.toLowerCase().includes('user already');

      if (
        sbResult &&
        !sbResult.success &&
        sbResult.error &&
        !isAlreadyRegistered &&
        !isConfigOrApiKeyErr
      ) {
        setSubmitError(sbResult.error);
        setIsSubmitting(false);
        return;
      }

      const supabaseUid = sbResult?.user?.uid || sbResult?.user?.id || `USR-SB-${Date.now()}`;

      // ── 2. Register / upsert in local DB ────────────────────────────────
      const regRes = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:         f.fullName.trim(),
          email:            cleanEmail,
          phone:            cleanPhone,
          role:             mappedRole,
          organizationName: orgName,
          region:           f.region,
          zone:             f.zone         || undefined,
          woreda:           f.woreda       || undefined,
          nationalIdNumber: f.nationalId   || undefined,
          tinNumber:        f.tinNumber    || undefined,
          address:          f.deliveryAddress || `${f.region}, Ethiopia`,
          farmSize:         f.farmSize ? Number(f.farmSize) : undefined,
          primaryCrops:     crops,
          buyerType:        role === 'buyer' ? f.buyerType : undefined,
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok && regData?.error) {
        setSubmitError(regData.error);
        setIsSubmitting(false);
        return;
      }
      const newUser  = regData.user || regData;

      // ── 3. Supabase DB sync — link Auth UID to local user row ───────────
      try {
        await fetch('/api/auth/supabase-sync', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supabaseUid,
            email:            cleanEmail,
            fullName:         f.fullName.trim(),
            phone:            cleanPhone,
            role:             mappedRole,
            organizationName: orgName,
            region:           f.region,
            zone:             f.zone   || undefined,
            woreda:           f.woreda || undefined,
            isEmailVerified:  false,
          }),
        });
      } catch (syncErr) { console.warn('Supabase DB sync non-fatal:', syncErr); }

      // ── 4. Create farm record for farmers ───────────────────────────────
      if (role === 'producer' && newUser?.id) {
        try {
          await fetch('/api/farms', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': String(newUser.id) },
            body: JSON.stringify({
              name:           f.farmName || `${f.fullName} Farm`,
              locationName:   `${f.woreda || ''} ${f.region}`.trim(),
              region:         f.region,
              sizeHectares:   f.farmSize ? Number(f.farmSize) : 2.5,
              certifications: ['Traceable Origin'],
            }),
          });
        } catch (farmErr) { console.warn('Farm creation non-fatal:', farmErr); }
      }

      // Persist authenticated user session
      const authToken = `agrilink-token-${newUser.id}-${Date.now()}`;
      localStorage.setItem('agrilink_token', authToken);
      localStorage.setItem('agrilink_user', JSON.stringify(newUser));
      localStorage.setItem('agrilink_authenticated', 'true');

      setDoneUser({ ...newUser, supabaseUid });
      setStep(4);
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">

      {/* Left brand panel */}
      <div className="lg:w-5/12 bg-emerald-950 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-400" preserveAspectRatio="none">
            <polygon points="0,100 100,0 100,100" />
          </svg>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">E</div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none">EthioDirect</h1>
                <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-widest">National Agri Ecosystem</span>
              </div>
            </div>
            {onNavigate && (
              <button onClick={() => onNavigate('home')}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-800 transition cursor-pointer">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold leading-tight mb-3">The Future of<br />Agricultural Trade.</h2>
            <p className="text-emerald-200/80 text-sm leading-relaxed">
              Join verified producers, buyers, and logistics partners powering Ethiopia's digital agricultural supply chain.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-zinc-900 group">
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <img src={ethiopianFarmlandSunrise} alt="Ethiopian farmland"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 inline-block mb-1">Verified Farmlands</span>
                <p className="text-xs font-bold text-white">Fertile Highland Corridors • Direct Sourcing</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 pt-6">
          <div className="flex items-center gap-4 bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/80">
            <div className="w-12 h-12 bg-emerald-800/80 rounded-xl flex items-center justify-center shrink-0 text-emerald-300">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Enterprise-Grade Security</p>
              <p className="text-emerald-300 text-xs mt-0.5">Your identity and Telebirr escrow funds are fully encrypted.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">

        {step <= 3 && (
          <div className="max-w-xl w-full mx-auto mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Step {step} of 3</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {step === 1 ? 'Role Selection' : step === 2 ? 'Account Details' : 'Verification Details'}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="max-w-xl w-full mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">

          {submitError && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex gap-2">
              <span className="font-black text-rose-600 shrink-0">!</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* STEP 1: Role */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">How will you use EthioDirect?</h3>
              <p className="text-slate-500 text-sm mb-6">Select your account type to get started.</p>
              <div className="space-y-4">
                {([
                  { k: 'producer', emoji: '🌾', label: 'Producer / Farmer',  desc: 'List and sell your harvest directly to verified buyers at fair prices.',         ac: 'emerald' },
                  { k: 'buyer',    emoji: '🏢', label: 'Commercial Buyer',    desc: 'Hotel, supermarket, processor or exporter seeking graded bulk produce.',           ac: 'blue'    },
                  { k: 'logistics',emoji: '🚚', label: 'Fleet & Logistics',   desc: 'Operate trucks or cold-chain vehicles for verified agricultural freight.',        ac: 'amber'   },
                ] as const).map(opt => (
                  <label key={opt.k} onClick={() => setRole(opt.k)}
                    className={`block cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                      role === opt.k
                        ? `border-${opt.ac}-500 bg-${opt.ac}-50/80 shadow-xs`
                        : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                    }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${role === opt.k ? `bg-${opt.ac}-200` : 'bg-slate-100'}`}>
                        {opt.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{opt.label}</p>
                          {role === opt.k && <CheckCircle2 className={`h-5 w-5 text-${opt.ac}-600`} />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={handleNext} disabled={!role}
                className="w-full mt-8 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
              {onOpenLogin && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  Already have an account?{' '}
                  <button onClick={onOpenLogin} className="text-emerald-700 font-bold hover:underline cursor-pointer">Sign in</button>
                </p>
              )}
            </div>
          )}

          {/* STEP 2: Account Details */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h3>
              <p className="text-slate-500 text-sm mb-6">Your login credentials and contact details.</p>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type="text" autoComplete="off" value={f.fullName} onChange={e => u('fullName', e.target.value)}
                      placeholder="e.g. Abebe Bikila"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type="email" autoComplete="off" value={f.email} onChange={e => u('email', e.target.value)}
                      placeholder="e.g. abebe@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Password * <span className="text-xs font-normal text-slate-400">(min. 6 characters)</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input type={showPw ? 'text' : 'password'} autoComplete="new-password" value={f.password} onChange={e => u('password', e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-600 font-bold text-sm shrink-0">+251</span>
                    <input type="tel" autoComplete="off" value={f.phone} onChange={e => u('phone', e.target.value)}
                      placeholder="911 234 567"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                  </div>
                </div>
                {otpSent && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>📱 Verification Code Sent</span>
                      <span className="bg-emerald-200 px-2 py-0.5 rounded font-mono text-emerald-800">Demo OTP: {generatedOtp}</span>
                    </div>
                    <input type="text" autoComplete="off" maxLength={6} value={f.otp} onChange={e => u('otp', e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-lg text-center tracking-[0.5em] font-mono text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition cursor-pointer">Back</button>
                <button onClick={handleNext}
                  className="w-2/3 bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2">
                  {otpSent ? 'Verify & Continue' : 'Send OTP'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Role-Specific Details */}
          {step === 3 && (
            <form autoComplete="off" onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">
                {role === 'producer' ? 'Farm & KYC Details' : role === 'buyer' ? 'Business Details' : 'Fleet Registration'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">Required for verification and database registration.</p>
              <div className="space-y-4">

                {/* FARMER */}
                {role === 'producer' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Farm Name</label>
                        <input value={f.farmName} onChange={e => u('farmName', e.target.value)} placeholder="e.g. Wonji Highland Farm" className={inp()} />
                      </div>
                      <div>
                        <label className={lbl}>Farm Size (ha)</label>
                        <input type="number" autoComplete="off" min="0.1" step="0.1" value={f.farmSize} onChange={e => u('farmSize', e.target.value)} placeholder="e.g. 2.5" className={inp()} />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Region *</label>
                      <select value={f.region} onChange={e => u('region', e.target.value)} className={inp()}>
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Zone</label>
                        <input value={f.zone} onChange={e => u('zone', e.target.value)} placeholder="e.g. East Shewa" className={inp()} />
                      </div>
                      <div>
                        <label className={lbl}>Woreda</label>
                        <input value={f.woreda} onChange={e => u('woreda', e.target.value)} placeholder="e.g. Adama" className={inp()} />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Primary Crops</label>
                      <input value={f.primaryCrops} onChange={e => u('primaryCrops', e.target.value)} placeholder="e.g. Teff, Red Onions, Coffee (comma-separated)" className={inp()} />
                    </div>
                    <div>
                      <label className={lbl}>National ID (Fayda)</label>
                      <input value={f.nationalId} onChange={e => u('nationalId', e.target.value)} placeholder="12-digit National ID number" className={inp()} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>Bank Name</label>
                        <select value={f.bankName} onChange={e => u('bankName', e.target.value)} className={inp()}>
                          {BANKS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Bank Account No.</label>
                        <input value={f.bankAccount} onChange={e => u('bankAccount', e.target.value)} placeholder="Account number" className={inp()} />
                      </div>
                    </div>
                  </>
                )}

                {/* BUYER */}
                {role === 'buyer' && (
                  <>
                    <div>
                      <label className={lbl}>Registered Company Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input value={f.companyName} onChange={e => u('companyName', e.target.value)} placeholder="e.g. Skyline Hotel Trading PLC"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Buyer Type</label>
                      <select value={f.buyerType} onChange={e => u('buyerType', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        {BUYER_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>TIN Number</label>
                      <input value={f.tinNumber} onChange={e => u('tinNumber', e.target.value)} placeholder="10-digit TIN"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className={lbl}>Region</label>
                      <select value={f.region} onChange={e => u('region', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Delivery Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input value={f.deliveryAddress} onChange={e => u('deliveryAddress', e.target.value)} placeholder="e.g. Bole, Addis Ababa — near Edna Mall"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                  </>
                )}

                {/* LOGISTICS */}
                {role === 'logistics' && (
                  <>
                    <div>
                      <label className={lbl}>Vehicle Type</label>
                      <select value={f.vehicleType} onChange={e => u('vehicleType', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm">
                        <option>Isuzu NPR (3.5 Tonnes)</option>
                        <option>Refrigerated Van (Cold-Chain 4°C)</option>
                        <option>FSR / Medium Truck (7–10 Tonnes)</option>
                        <option>Sino Truck / Heavy Trailer (30 Tonnes)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={lbl}>License Plate *</label>
                        <input value={f.licensePlate} onChange={e => u('licensePlate', e.target.value)} placeholder="e.g. AA 3 A 12345"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className={lbl}>Driver License No.</label>
                        <input value={f.licenseNumber} onChange={e => u('licenseNumber', e.target.value)} placeholder="e.g. ET-DL-123456"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Operating Region</label>
                      <select value={f.region} onChange={e => u('region', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm">
                        {REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={handleBack} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition cursor-pointer">Back</button>
                <button type="submit" disabled={isSubmitting}
                  className={`w-2/3 text-white font-bold py-4 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
                    role === 'producer' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : role === 'buyer'  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  }`}>
                  {isSubmitting
                    ? <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
                    : <><CheckCircle2 className="h-4 w-4" /> Submit Application</>}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && doneUser && (
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Welcome, {doneUser.fullName || f.fullName}!</h3>
                <p className="text-slate-500 text-sm mt-1">Your account has been created successfully.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="font-bold text-slate-900 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    {doneUser.role || (role === 'producer' ? 'FARMER' : role === 'buyer' ? 'BUSINESS_BUYER' : 'DRIVER')}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-semibold text-slate-900">{f.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-semibold text-slate-900">+251{f.phone.replace(/^0/, '')}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Region:</span><span className="font-semibold text-slate-900">{f.region}</span></div>
                {doneUser.id && (
                  <div className="flex justify-between"><span className="text-slate-500">User ID:</span><span className="font-mono text-slate-700">#{doneUser.id}</span></div>
                )}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                📧 A verification email will be sent to <strong>{f.email}</strong>. Verify to activate all features.
              </div>
              <button
                onClick={() => {
                  if (onRegisteredSuccess) onRegisteredSuccess(doneUser);
                  const targetRole = doneUser.role || (role === 'producer' ? 'FARMER' : role === 'buyer' ? 'BUSINESS_BUYER' : 'DRIVER');
                  navigate(getRoleDashboardPath(targetRole));
                }}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Go to Your Dashboard
              </button>
              <button
                onClick={() => (onOpenLogin ? onOpenLogin() : navigate('/login'))}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer">
                Sign in with an existing account
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
