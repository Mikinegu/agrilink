import React from 'react';
import officialLogoImg from '../assets/images/agrilink_official_logo.jpg';

export interface AgriLinkLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  subtext?: string;
  className?: string;
  badgeText?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: { img: 'w-7 h-7', title: 'text-sm', badge: 'text-[9px] px-1 py-0.2', sub: 'text-[9px]' },
  sm: { img: 'w-9 h-9', title: 'text-base', badge: 'text-[9px] px-1.5 py-0.5', sub: 'text-[10px]' },
  md: { img: 'w-11 h-11', title: 'text-lg', badge: 'text-[10px] px-1.5 py-0.5', sub: 'text-xs' },
  lg: { img: 'w-14 h-14', title: 'text-xl', badge: 'text-[10px] px-2 py-0.5', sub: 'text-xs' },
  xl: { img: 'w-20 h-20', title: 'text-2xl sm:text-3xl', badge: 'text-xs px-2.5 py-0.5', sub: 'text-sm' },
};

export const AgriLinkLogo: React.FC<AgriLinkLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'dark',
  subtext = 'National Agricultural Ecosystem',
  className = '',
  badgeText = 'ETHIOPIA',
  onClick,
}) => {
  const s = SIZE_MAP[size];
  const isDark = theme === 'dark';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none transition-all group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Official Emblem Mark */}
      <div className="relative shrink-0">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-500/40 via-emerald-400/40 to-amber-300/40 opacity-70 group-hover:opacity-100 blur-[2px] transition duration-300" />
        <img
          src={officialLogoImg}
          alt="AgriLink Official Brand Logo"
          className={`${s.img} relative rounded-full object-cover ring-1 ring-amber-400/50 shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform duration-300`}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight leading-none ${s.title} ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              Agri<span className="text-emerald-500">Link</span>
            </span>
            {badgeText && (
              <span
                className={`font-black uppercase tracking-wider rounded-md border ${s.badge} ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtext && (
            <span
              className={`font-medium tracking-tight mt-0.5 leading-none truncate ${s.sub} ${
                isDark ? 'text-emerald-200/80' : 'text-zinc-500'
              }`}
            >
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
