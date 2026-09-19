import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext.tsx';
import { Language } from '../i18n/types.ts';

interface LanguageSelectorProps {
  variant?: 'compact' | 'pill' | 'expanded';
  className?: string;
  dropdownAlign?: 'left' | 'right';
  theme?: 'light' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
  dropdownAlign = 'right',
  theme = 'light',
}) => {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const currentOption =
    SUPPORTED_LANGUAGES.find((opt) => opt.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            isDark
              ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
              : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-950'
          }`}
          title={t.nav.selectLanguage}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <Globe className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline-block font-medium">{currentOption.nativeLabel}</span>
          <span className="sm:hidden font-bold uppercase text-[11px]">{currentOption.code}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${isDark ? 'text-zinc-300' : 'text-zinc-400'} ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
            isDark
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 border-transparent'
          }`}
          title={t.nav.selectLanguage}
        >
          <span className="text-sm">{currentOption.flag}</span>
          <span>{currentOption.nativeLabel}</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${isDark ? 'text-zinc-300' : 'text-zinc-500'} ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'expanded' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>{currentOption.nativeLabel} ({currentOption.label})</span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-zinc-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          <div className="px-3 py-1.5 border-b border-zinc-100 mb-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              {t.nav.selectLanguage}
            </p>
          </div>

          <div className="space-y-0.5 px-1">
            {SUPPORTED_LANGUAGES.map((opt) => {
              const isSelected = opt.code === currentLanguage;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 font-medium'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{opt.flag}</span>
                    <div>
                      <p className="leading-tight">{opt.nativeLabel}</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">{opt.label}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
