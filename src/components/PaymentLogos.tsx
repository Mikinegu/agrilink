import React from 'react';

export type PaymentRailId =
  | 'TELEBIRR'
  | 'TELEBIRR_MANUAL'
  | 'CBE_MOBILE_BANKING'
  | 'CBE_DIRECT'
  | 'CBE_BIRR'
  | 'AWASH_BANK'
  | 'AWASH_BIRR'
  | 'BANK_OF_ABYSSINIA'
  | 'DASHEN_BANK'
  | 'COOP_BANK'
  | 'COOPAY'
  | 'CHAPA'
  | 'CHAPA_GATEWAY'
  | 'VISA'
  | 'MASTERCARD'
  | 'CARD';

interface LogoProps {
  id: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const TelebirrLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Telebirr Gradient Background */}
        <rect width="100" height="100" rx="20" fill="url(#telebirr-grad)" />
        
        {/* Ethio Telecom Sunshine Burst Rings */}
        <circle cx="50" cy="42" r="26" stroke="#FFC72C" strokeWidth="4" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="50" cy="42" r="20" fill="#FFC72C" />
        <circle cx="50" cy="42" r="14" fill="#0059A8" />
        
        {/* Telebirr 't' and 'b' Dynamic Curves */}
        <path
          d="M38 34C38 27.3726 43.3726 22 50 22C56.6274 22 62 27.3726 62 34V46C62 52.6274 56.6274 58 50 58C43.3726 58 38 52.6274 38 46V34Z"
          fill="#FFFFFF"
        />
        <circle cx="50" cy="40" r="6" fill="#0059A8" />
        <rect x="47" y="32" width="6" height="22" rx="3" fill="#0059A8" />

        {/* Currency Waves / Glow */}
        <path
          d="M26 68C34 64 42 66 50 66C58 66 66 64 74 68C72 73 63 76 50 76C37 76 28 73 26 68Z"
          fill="#FFC72C"
        />
        <text
          x="50"
          y="87"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="11"
          letterSpacing="0.5"
        >
          telebirr
        </text>

        <defs>
          <linearGradient id="telebirr-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0077D4" />
            <stop offset="0.6" stopColor="#0059A8" />
            <stop offset="1" stopColor="#003D75" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#0059A8]">telebirr</span>
          <span className="text-[10px] text-zinc-500 font-medium">Ethio Telecom</span>
        </div>
      )}
    </div>
  );
};

export const CbeLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-xl bg-white border border-zinc-200/90 p-1 shadow-2xs overflow-hidden flex items-center justify-center transition-transform hover:scale-105`}>
          <img
            src="/banks/cbe.png"
            alt="Commercial Bank of Ethiopia"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="url(#cbe-grad)" />
          <circle cx="50" cy="50" r="42" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.3" />
          <circle cx="50" cy="32" r="10" fill="#D4AF37" />
          <path
            d="M50 44V76M32 50H68M30 50L24 64C24 67.3137 27.6863 70 32 70C36.3137 70 40 67.3137 40 64L34 50M66 50L60 64C60 67.3137 63.6863 70 68 70C72.3137 70 76 67.3137 76 64L70 50"
            stroke="#D4AF37"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="76" r="3" fill="#D4AF37" />
          <text
            x="50"
            y="89"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="10"
            letterSpacing="1"
          >
            CBE
          </text>
          <defs>
            <linearGradient id="cbe-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9E1B58" />
              <stop offset="0.6" stopColor="#7B1846" />
              <stop offset="1" stopColor="#540B2D" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#7B1846]">CBE</span>
          <span className="text-[10px] text-zinc-500 font-medium">Commercial Bank of Ethiopia</span>
        </div>
      )}
    </div>
  );
};

export const CbeBirrLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="url(#cbebirr-grad)" />
        {/* CBE Birr Green & Gold Circles */}
        <circle cx="50" cy="42" r="26" fill="#FDB813" />
        <circle cx="50" cy="42" r="20" fill="#005A2B" />
        
        {/* Mobile Phone / Wallet symbol */}
        <rect x="41" y="28" width="18" height="28" rx="4" fill="#FFFFFF" />
        <rect x="44" y="32" width="12" height="18" rx="1" fill="#005A2B" />
        <circle cx="50" cy="53" r="1.5" fill="#7B1846" />

        <text
          x="50"
          y="86"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="9.5"
          letterSpacing="0.8"
        >
          CBE BIRR
        </text>

        <defs>
          <linearGradient id="cbebirr-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#007E3D" />
            <stop offset="0.6" stopColor="#005A2B" />
            <stop offset="1" stopColor="#00381B" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#005A2B]">CBE Birr</span>
          <span className="text-[10px] text-zinc-500 font-medium">Mobile Wallet</span>
        </div>
      )}
    </div>
  );
};

export const AwashBankLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-xl bg-white border border-zinc-200/90 p-1 shadow-2xs overflow-hidden flex items-center justify-center transition-transform hover:scale-105`}>
          <img
            src="/banks/awash.png"
            alt="Awash Bank"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="url(#awash-grad)" />
          <circle cx="50" cy="45" r="30" fill="#FFFFFF" fillOpacity="0.12" />
          <path
            d="M50 18L76 34V52C76 67 65 77 50 82C35 77 24 67 24 52V34L50 18Z"
            fill="#FFFFFF"
          />
          <path
            d="M50 25L69 37V49C69 61 60 70 50 74V25Z"
            fill="#00205B"
          />
          <path
            d="M50 25L31 37V49C31 61 40 70 50 74V25Z"
            fill="#C8102E"
          />
          <circle cx="50" cy="48" r="7" fill="#FDB813" />
          <text
            x="50"
            y="92"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="9.5"
            letterSpacing="1"
          >
            AWASH
          </text>
          <defs>
            <linearGradient id="awash-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E01B3C" />
              <stop offset="0.6" stopColor="#C8102E" />
              <stop offset="1" stopColor="#8A071C" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#C8102E]">Awash Bank</span>
          <span className="text-[10px] text-zinc-500 font-medium">Awash Direct & Escrow</span>
        </div>
      )}
    </div>
  );
};

export const BoaLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-xl bg-white border border-zinc-200/90 p-1 shadow-2xs overflow-hidden flex items-center justify-center transition-transform hover:scale-105`}>
          <img
            src="/banks/abyssinia.png"
            alt="Bank of Abyssinia"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="url(#boa-grad)" />
          <circle cx="50" cy="44" r="28" fill="#FFFFFF" fillOpacity="0.1" />
          <circle cx="50" cy="44" r="22" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="50" cy="44" r="17" fill="#002B49" />
          <path
            d="M42 42C42 36 46 32 50 32C54 32 58 36 58 42C58 46 55 50 50 52C45 50 42 46 42 42Z"
            fill="#FFFFFF"
          />
          <circle cx="50" cy="41" r="4" fill="#F5A623" />
          <polygon points="50,26 53,32 47,32" fill="#FFFFFF" />
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="#002B49"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="9.5"
            letterSpacing="1"
          >
            ABYSSINIA
          </text>
          <defs>
            <linearGradient id="boa-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F7C042" />
              <stop offset="0.6" stopColor="#DAA520" />
              <stop offset="1" stopColor="#B38612" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#B8860B]">Bank of Abyssinia</span>
          <span className="text-[10px] text-zinc-500 font-medium">BOA Apollo Direct</span>
        </div>
      )}
    </div>
  );
};

export const DashenBankLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-xl bg-white border border-zinc-200/90 p-1 shadow-2xs overflow-hidden flex items-center justify-center transition-transform hover:scale-105`}>
          <img
            src="/banks/dashen.png"
            alt="Dashen Bank"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="url(#dashen-grad)" />
          <circle cx="50" cy="34" r="12" fill="#F8B600" />
          <polygon points="50,30 26,68 74,68" fill="#FFFFFF" fillOpacity="0.9" />
          <polygon points="50,30 40,68 74,68" fill="#F8B600" />
          <polygon points="34,50 18,68 50,68" fill="#003870" fillOpacity="0.4" />
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="9.5"
            letterSpacing="1"
          >
            DASHEN
          </text>
          <defs>
            <linearGradient id="dashen-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#006AC2" />
              <stop offset="0.6" stopColor="#00539B" />
              <stop offset="1" stopColor="#003566" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#00539B]">Dashen Bank</span>
          <span className="text-[10px] text-zinc-500 font-medium">Amole & Mobile Direct</span>
        </div>
      )}
    </div>
  );
};

export const CoopBankLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {!imgError ? (
        <div className={`${sizeMap[size]} shrink-0 rounded-xl bg-white border border-zinc-200/90 p-1 shadow-2xs overflow-hidden flex items-center justify-center transition-transform hover:scale-105`}>
          <img
            src="/banks/coop.png"
            alt="Cooperative Bank of Oromia"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="20" fill="url(#coop-grad)" />
          <circle cx="50" cy="45" r="26" fill="#FFFFFF" />
          <circle cx="43" cy="40" r="10" fill="#008751" />
          <circle cx="57" cy="40" r="10" fill="#FF7900" />
          <circle cx="50" cy="52" r="10" fill="#FFD100" />
          <circle cx="50" cy="44" r="5" fill="#FFFFFF" />
          <text
            x="50"
            y="88"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="9.5"
            letterSpacing="0.8"
          >
            COOPAY
          </text>
          <defs>
            <linearGradient id="coop-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00A362" />
              <stop offset="0.6" stopColor="#008751" />
              <stop offset="1" stopColor="#005A36" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#008751]">Coop Bank</span>
          <span className="text-[10px] text-zinc-500 font-medium">Coopay-Ebirr Escrow</span>
        </div>
      )}
    </div>
  );
};

export const ChapaLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="url(#chapa-grad)" />
        
        {/* Chapa signature modern 'C' chevron emblem */}
        <circle cx="50" cy="44" r="25" stroke="#FFFFFF" strokeWidth="9" strokeDasharray="120 40" strokeLinecap="round" transform="rotate(-30 50 44)" />
        <circle cx="50" cy="44" r="11" fill="#00D2A0" />
        <circle cx="64" cy="34" r="5" fill="#FFFFFF" />

        <text
          x="50"
          y="88"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="10"
          letterSpacing="0.8"
        >
          CHAPA
        </text>

        <defs>
          <linearGradient id="chapa-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8752F3" />
            <stop offset="0.6" stopColor="#6C3FC5" />
            <stop offset="1" stopColor="#4A2594" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-[#6C3FC5]">Chapa</span>
          <span className="text-[10px] text-zinc-500 font-medium">Cards & Multi-Wallet Switch</span>
        </div>
      )}
    </div>
  );
};

export const CardPaymentLogo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; showText?: boolean }> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs overflow-hidden`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="url(#card-grad)" />
        
        {/* Visa / Mastercard intersecting circles */}
        <circle cx="42" cy="46" r="16" fill="#EB001B" />
        <circle cx="58" cy="46" r="16" fill="#F79E1B" fillOpacity="0.85" />
        <path d="M50 36C53 39 55 42 55 46C55 50 53 53 50 56C47 53 45 50 45 46C45 42 47 39 50 36Z" fill="#FF5F00" />

        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="9.5"
          letterSpacing="0.8"
        >
          VISA / MC
        </text>

        <defs>
          <linearGradient id="card-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2D3748" />
            <stop offset="1" stopColor="#1A202C" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight text-zinc-900">Visa / Mastercard</span>
          <span className="text-[10px] text-zinc-500 font-medium">International & Local Cards</span>
        </div>
      )}
    </div>
  );
};

export const PaymentLogo: React.FC<LogoProps> = ({ id, className = '', size = 'md', showText = false }) => {
  const normId = (id || '').toUpperCase();

  if (normId.includes('TELEBIRR')) {
    return <TelebirrLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('CBE_BIRR')) {
    return <CbeBirrLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('CBE') || normId.includes('COMMERCIAL_BANK')) {
    return <CbeLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('AWASH')) {
    return <AwashBankLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('ABYSSINIA') || normId.includes('BOA')) {
    return <BoaLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('DASHEN')) {
    return <DashenBankLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('COOP') || normId.includes('EBIRR')) {
    return <CoopBankLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('CHAPA')) {
    return <ChapaLogo className={className} size={size} showText={showText} />;
  }
  if (normId.includes('VISA') || normId.includes('CARD') || normId.includes('MASTERCARD')) {
    return <CardPaymentLogo className={className} size={size} showText={showText} />;
  }

  // Default fallback
  return <TelebirrLogo className={className} size={size} showText={showText} />;
};

/**
 * Accepted Ethiopian Payment Rails Badge Row
 */
export const AcceptedPaymentRailsRow: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = '',
}) => {
  const rails = [
    { id: 'TELEBIRR', label: 'Telebirr' },
    { id: 'CBE_MOBILE_BANKING', label: 'CBE Direct' },
    { id: 'CBE_BIRR', label: 'CBE Birr' },
    { id: 'AWASH_BANK', label: 'Awash Bank' },
    { id: 'BANK_OF_ABYSSINIA', label: 'Abyssinia' },
    { id: 'DASHEN_BANK', label: 'Dashen' },
    { id: 'CHAPA', label: 'Chapa' },
    { id: 'CARD', label: 'Visa/MC' },
  ];

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {rails.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-1.5 bg-white border border-zinc-200/90 shadow-2xs hover:shadow-xs px-2 py-1 rounded-xl transition-all"
          title={r.label}
        >
          <PaymentLogo id={r.id} size="sm" />
          {!compact && <span className="text-[11px] font-bold text-zinc-700">{r.label}</span>}
        </div>
      ))}
    </div>
  );
};

/**
 * High-Fidelity Official Ethiopian Bank Card Badge
 */
export const BankCardBadge: React.FC<{
  bankId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}> = ({ bankId, size = 'md', showSubtitle = true, className = '' }) => {
  const norm = (bankId || '').toUpperCase();
  let bankName = 'Commercial Bank of Ethiopia';
  let amharic = 'የኢትዮጵያ ንግድ ባንክ';
  let brandColor = 'text-[#7B1846]';

  if (norm.includes('COOP')) {
    bankName = 'Cooperative Bank of Oromia';
    amharic = 'Bankii Hojii Gamtaa Oromiyaa';
    brandColor = 'text-[#008751]';
  } else if (norm.includes('AWASH')) {
    bankName = 'Awash Bank';
    amharic = 'አዋሽ ባንክ';
    brandColor = 'text-[#C8102E]';
  } else if (norm.includes('DASHEN')) {
    bankName = 'Dashen Bank';
    amharic = 'ዳሽን ባንክ';
    brandColor = 'text-[#00539B]';
  } else if (norm.includes('ABYSSINIA') || norm.includes('BOA')) {
    bankName = 'Bank of Abyssinia';
    amharic = 'የአቢሲኒያ ባንክ';
    brandColor = 'text-[#B8860B]';
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <PaymentLogo id={bankId} size={size} />
      <div>
        <h4 className={`font-black text-xs sm:text-sm leading-tight ${brandColor}`}>{bankName}</h4>
        {showSubtitle && <p className="text-[10px] text-zinc-500 font-semibold">{amharic}</p>}
      </div>
    </div>
  );
};

