import React, { useState } from 'react';
import {
  X,
  Sprout,
  Building2,
  TrendingUp,
  Boxes,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Factory,
  Briefcase,
  Store,
  Globe,
  Zap,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';
import { signUpWithSupabase } from '../lib/supabase.ts';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisteredSuccess: (user: any) => void;
  onRequireVerification: (data: { email: string; fullName: string }) => void;
  onOpenLogin?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisteredSuccess,
  onRequireVerification,
  onOpenLogin,
}) => {
  const [role, setRole] = useState<UserRole>('FARMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Oromia');
  const [zone, setZone] = useState('');
  const [woreda, setWoreda] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmSize, setFarmSize] = useState('2.5');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [farmerClassification, setFarmerClassification] = useState('COMMERCIAL_GROWER');

  // Target Buyer Channel Selection for Farmers
  const [targetProcessors, setTargetProcessors] = useState(true);
  const [targetInvestors, setTargetInvestors] = useState(true);
  const [targetBuyers, setTargetBuyers] = useState(true);
  const [targetAll, setTargetAll] = useState(true);

  // Business Buyer extra fields
  const [organizationName, setOrganizationName] = useState('');
  const [buyerType, setBuyerType] = useState('PROCESSOR');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please provide a valid email address for your Supabase account.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    const cleanCrops = primaryCrops
      ? primaryCrops.split(',').map((c) => c.trim()).filter(Boolean)
      : ['White Teff (Magna)', 'Red Onions', 'Roma Tomatoes'];

    const effectiveOrg =
      role === 'FARMER'
        ? farmName.trim() || `${fullName.trim()} Agro Farm`
        : organizationName.trim() || `${fullName.trim()} Trading`;

    try {
      // 1. Sign up with Supabase Auth
      const result = await signUpWithSupabase({
        email: email.trim(),
        password: password,
        fullName: fullName.trim(),
        phone: phone.trim() || '0961123330',
        role,
        organizationName: effectiveOrg,
        region,
        zone: zone || 'East Shewa',
        woreda: woreda || 'Adama',
        farmSize: Number(farmSize) || 2.5,
        primaryCrops: cleanCrops,
        farmerClassification,
        buyerType,
      });

      if (result.success) {
        onRequireVerification({
          email: email.trim(),
          fullName: fullName.trim(),
        });
        onClose();
        return;
      }

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.warn('Supabase registration notice:', err);
      // Fallback via server registration API
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            role,
            region,
            zone: zone || 'East Shewa',
            woreda: woreda || 'Adama',
            organizationName: effectiveOrg,
            farmSize: Number(farmSize) || 2.5,
            primaryCrops: cleanCrops,
            farmerClassification,
            buyerType,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          onRequireVerification({
            email: email.trim(),
            fullName: fullName.trim(),
          });
          onClose();
          return;
        }
        setErrorMsg(data.error || err.message || 'Registration failed. Please try again.');
      } catch (fallbackErr: any) {
        setErrorMsg(err.message || 'Could not complete registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-zinc-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-md">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Join AgriLink Ethiopia
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5" /> Supabase Auth
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Secure enterprise signup for Farmers, Processors & Traders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form autoComplete="off" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
              <span className="shrink-0 text-rose-600 font-bold">!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1.5 uppercase tracking-wider">
              1. Select Your Stakeholder Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'FARMER',
                  label: 'Producer / Farmer',
                  sub: 'Sell harvest to verified buyers',
                  icon: Sprout,
                  color: 'border-emerald-600 bg-emerald-50 text-emerald-950',
                },
                {
                  id: 'BUSINESS_BUYER',
                  label: 'Corporate / Buyer',
                  sub: 'Processors, Hotels, Stores',
                  icon: Building2,
                  color: 'border-blue-600 bg-blue-50 text-blue-950',
                },
                {
                  id: 'INPUT_SUPPLIER',
                  label: 'Input Supplier',
                  sub: 'Certified seeds, fertilizer',
                  icon: Boxes,
                  color: 'border-amber-600 bg-amber-50 text-amber-950',
                },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id as UserRole)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${r.color} font-black shadow-xs ring-2 ring-emerald-600`
                        : 'border-zinc-200 bg-zinc-50 hover:bg-white text-zinc-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-emerald-700' : 'text-zinc-500'}`} />
                    <div>
                      <span className="text-xs font-bold block">{r.label}</span>
                      <span className="text-[10px] text-zinc-500 block leading-tight">{r.sub}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Personal Details & Supabase Auth Credentials */}
          <div className="space-y-3 pt-1 border-t border-zinc-100">
            <span className="text-xs font-bold text-zinc-700 block uppercase tracking-wider">
              2. Supabase Auth Credentials & Contact
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Full Name / Lead Producer <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text" autoComplete="off"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Email Address (Supabase Login) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email" autoComplete="off"
                    required
                    placeholder="e.g. abebe@agrilink.et"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <Mail className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-9 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                  <Lock className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Phone Number (SMS & USSD *6112#) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel" autoComplete="off"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0911000000"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 font-mono"
                  />
                  <Phone className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Region & Production Zone
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Oromia">Oromia (East Shewa / Wonji / Ziway / Adaa)</option>
                <option value="Amhara">Amhara (Bahir Dar / Gojjam / Debre Birhan)</option>
                <option value="Sidama">Sidama (Hawassa / Yirgalem / Dale)</option>
                <option value="Addis Ababa">Addis Ababa Logistics & Trade Hub</option>
                <option value="SNNPR">SNNPR / Gedeo Zone (Yirgacheffe)</option>
                <option value="Tigray">Tigray (Mekelle / Raya)</option>
                <option value="Somali">Somali (Jigjiga / Godey)</option>
                <option value="Dire Dawa">Dire Dawa Special Administrative Region</option>
              </select>
            </div>
          </div>

          {/* FARMER CLASSIFICATION & TARGET BUYER CHOICE */}
          {role === 'FARMER' && (
            <div className="space-y-4 pt-2 border-t border-zinc-100 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/70">
              <div>
                <span className="text-xs font-black text-emerald-950 block uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  3. Farmer Classification: Choose Who You Sell To
                </span>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Select your intended buyer channels so AgriLink routes your harvest directly to the right commercial contracts.
                </p>
              </div>

              {/* 3 Main Target Buyer Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Food Processors */}
                <div
                  onClick={() => setTargetProcessors(!targetProcessors)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    targetProcessors
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 shadow-2xs'
                      : 'bg-zinc-100/70 border-zinc-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Factory className="h-5 w-5 text-emerald-700" />
                    <input
                      type="checkbox"
                      checked={targetProcessors}
                      onChange={() => {}}
                      className="accent-emerald-700 h-4 w-4"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900">Food Processors & Mills</h4>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      Tomato paste factories, oil mills, flour mills with bulk forward contracts.
                    </p>
                  </div>
                </div>

                {/* 2. Agri-Investors & Exporters */}
                <div
                  onClick={() => setTargetInvestors(!targetInvestors)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    targetInvestors
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 shadow-2xs'
                      : 'bg-zinc-100/70 border-zinc-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-5 w-5 text-blue-700" />
                    <input
                      type="checkbox"
                      checked={targetInvestors}
                      onChange={() => {}}
                      className="accent-emerald-700 h-4 w-4"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900">Agri-Investors & Exporters</h4>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      Export grade avocados, fresh teff grain, pulses & outgrower schemes.
                    </p>
                  </div>
                </div>

                {/* 3. Wholesale & Retail Buyers */}
                <div
                  onClick={() => setTargetBuyers(!targetBuyers)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    targetBuyers
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 shadow-2xs'
                      : 'bg-zinc-100/70 border-zinc-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Store className="h-5 w-5 text-purple-700" />
                    <input
                      type="checkbox"
                      checked={targetBuyers}
                      onChange={() => {}}
                      className="accent-emerald-700 h-4 w-4"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-zinc-900">Supermarket & Retail Buyers</h4>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                      Fresh fruit & vegetable chains, hotels, restaurants & city stores.
                    </p>
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Farm Entity Name
                  </label>
                  <input
                    type="text" autoComplete="off"
                    placeholder="e.g. Wonji Horizon Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Farm Acreage (Hectares)
                  </label>
                  <input
                    type="number" autoComplete="off"
                    step="0.5"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Primary Harvest Crops
                </label>
                <input
                  type="text" autoComplete="off"
                  placeholder="e.g. Roma Tomatoes, Red Onions, Teff Magna, Avocados"
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Business Buyer specifics */}
          {role === 'BUSINESS_BUYER' && (
            <div className="space-y-3 pt-2 border-t border-zinc-100 bg-blue-50/50 p-4 rounded-2xl border border-blue-200/70">
              <span className="text-xs font-black text-blue-950 block uppercase tracking-wider">
                3. Business Offtaker Category
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Company / Entity Name
                  </label>
                  <input
                    type="text" autoComplete="off"
                    required
                    placeholder="e.g. Meki Batu Agro-Processing"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Offtaker Category
                  </label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="PROCESSOR">Food Processor / Mill</option>
                    <option value="INVESTOR">Agri-Investor / Exporter</option>
                    <option value="SUPERMARKET">Supermarket Chain</option>
                    <option value="HOTEL">Hotel & Hospitality Group</option>
                    <option value="WHOLESALER">Regional Wholesaler</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            {onOpenLogin ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Already registered? Sign in
              </button>
            ) : (
              <div className="text-[11px] text-zinc-500">
                Dial <strong className="text-emerald-700 font-mono">*6112#</strong> for offline trade.
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md shadow-emerald-800/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Supabase Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Supabase Account</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
