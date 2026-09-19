import React, { useState } from 'react';
import { PhoneCall, Headphones, Activity, Sparkles, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';

interface LiveCallCenterWidgetProps {
  onOpen: () => void;
}

export const LiveCallCenterWidget: React.FC<LiveCallCenterWidgetProps> = ({ onOpen }) => {
  const { currentLanguage } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center select-none">
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-3 pl-3.5 pr-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 border border-emerald-500/50 text-white shadow-2xl shadow-emerald-950/80 backdrop-blur-md hover:scale-105 hover:border-emerald-400 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Connect with AgriLink Live Call Center"
      >
        {/* Pulsing Beacon Glow */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-500 opacity-20 group-hover:opacity-40 blur-sm transition-opacity duration-300 pointer-events-none" />

        {/* Live Call Icon with Rotating Ring */}
        <div className="relative h-9 w-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
          <PhoneCall className="h-4 w-4 animate-bounce" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 ring-1 ring-zinc-950"></span>
          </span>
        </div>

        {/* Text Details */}
        <div className="text-left leading-tight pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              {currentLanguage === 'am' ? 'የቀጥታ ጥሪ መስመር' : 'Live Call Center'}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/30 text-emerald-300 uppercase tracking-widest border border-emerald-400/30">
              Online
            </span>
          </div>
          <p className="text-[10px] text-emerald-200/80 font-medium">
            {currentLanguage === 'am' ? 'አሁን በቀጥታ ያናግሩን' : 'Talk with us live now'}
          </p>
        </div>
      </button>
    </div>
  );
};
