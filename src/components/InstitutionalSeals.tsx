import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Landmark, FileCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';

interface InstitutionalSealsProps {
  variant?: 'light' | 'dark' | 'banner';
  className?: string;
}

export const InstitutionalSeals: React.FC<InstitutionalSealsProps> = ({
  variant = 'light',
  className = '',
}) => {
  const { currentLanguage } = useTranslation();

  const seals = [
    {
      code: 'NBE',
      acronym: 'NBE',
      title: currentLanguage === 'am' ? 'የኢትዮጵያ ብሔራዊ ባንክ' : currentLanguage === 'om' ? 'Baankii Biyyooleessa Itoophiyaa' : 'National Bank of Ethiopia',
      subtitle: currentLanguage === 'am' ? 'የተረጋገጠ የእምነት ሂሳብ (Escrow)' : currentLanguage === 'om' ? 'Kaffaltii Qisaasa Malee (Escrow)' : 'Regulated Escrow Trust Rail',
      badge: 'Directive FX-824',
      accent: 'emerald',
      icon: Lock,
    },
    {
      code: 'ECX',
      acronym: 'ECX',
      title: currentLanguage === 'am' ? 'የኢትዮጵያ ምርት ገበያ' : currentLanguage === 'om' ? 'Gabaa Oomisha Itoophiyaa' : 'Ethiopian Commodity Exchange',
      subtitle: currentLanguage === 'am' ? 'የቀጥታ የጅምላ ዋጋ መረጃ' : currentLanguage === 'om' ? 'Gabaasa Gatii Qulqullinaa' : 'Real-Time Price Standard',
      badge: 'Live Feed API',
      accent: 'amber',
      icon: Landmark,
    },
    {
      code: 'MOA',
      acronym: 'MoA',
      title: currentLanguage === 'am' ? 'የግብርና ሚኒስቴር' : currentLanguage === 'om' ? 'Ministeera Qonnaa' : 'Ministry of Agriculture',
      subtitle: currentLanguage === 'am' ? 'የተረጋገጡ አርሶ አደሮች' : currentLanguage === 'om' ? 'Qonnaan Bultoota Mirkanaa’an' : 'Certified Smallholder Registry',
      badge: 'MoA-ETH-2026',
      accent: 'blue',
      icon: FileCheck,
    },
    {
      code: 'TELEBIRR',
      acronym: 'telebirr',
      title: 'Ethio Telecom Telebirr',
      subtitle: currentLanguage === 'am' ? 'ቀጥታ የክፍያ እና USSD አገልግሎት' : currentLanguage === 'om' ? 'Kaffaltii Saffisaa USSD' : 'Direct *127# USSD Push Rail',
      badge: 'Tier-1 Gateway',
      accent: 'sky',
      icon: CheckCircle2,
    },
    {
      code: 'CBE',
      acronym: 'CBE Birr',
      title: currentLanguage === 'am' ? 'የኢትዮጵያ ንግድ ባንክ' : currentLanguage === 'om' ? 'Baankii Daldala Itoophiyaa' : 'Commercial Bank of Ethiopia',
      subtitle: currentLanguage === 'am' ? 'የአገር አቀፍ የባንክ ማስተላለፊያ' : currentLanguage === 'om' ? 'Tajaajila Baankii Biyyooleessaa' : 'Interbank Clearing & *847#',
      badge: 'Settlement Node',
      accent: 'purple',
      icon: ShieldCheck,
    },
  ];

  if (variant === 'banner') {
    return (
      <div className={`w-full py-4 border-y border-zinc-200/80 bg-white/70 backdrop-blur-md ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {currentLanguage === 'am'
                  ? 'በመንግሥትና በፋይናንስ ተቋማት የተረጋገጠ የመገበያያ ሥርዓት'
                  : currentLanguage === 'om'
                  ? 'Sirna Daldala Mootummaa fi Baankiin Mirkanaa’e'
                  : 'Sovereign Institutional Regulatory & Settlement Compliance'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {seals.map((seal) => (
                <div key={seal.code} className="flex items-center gap-2 text-xs group cursor-default">
                  <span className="font-extrabold text-zinc-800 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {seal.acronym}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/60 font-medium">
                    {seal.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDark = variant === 'dark';

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {seals.map((seal) => {
          const Icon = seal.icon;
          return (
            <div
              key={seal.code}
              className={`p-3.5 rounded-2xl border transition-all duration-200 group ${
                isDark
                  ? 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 shadow-md'
                  : 'bg-white border-zinc-200/80 hover:border-emerald-500/50 hover:shadow-md shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isDark
                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {seal.badge}
                </span>
              </div>

              <h4
                className={`text-xs font-black truncate tracking-tight ${
                  isDark ? 'text-zinc-100 group-hover:text-emerald-400' : 'text-zinc-900 group-hover:text-emerald-700'
                }`}
              >
                {seal.title}
              </h4>
              <p className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {seal.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
