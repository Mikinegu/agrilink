import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, LanguageOption, TranslationDictionary } from './types.ts';
import { en } from './translations/en.ts';
import { am } from './translations/am.ts';
import { om } from './translations/om.ts';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'am',
    label: 'Amharic',
    nativeLabel: 'አማርኛ',
    flag: '🇪🇹',
  },
  {
    code: 'om',
    label: 'Oromifa',
    nativeLabel: 'Afaan Oromoo',
    flag: '🇪🇹',
  },
];

const TRANSLATION_MAP: Record<Language, TranslationDictionary> = {
  en,
  am,
  om,
};

const STORAGE_KEY = 'agrilink_language';

interface LanguageContextValue {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  languages: LanguageOption[];
  translate: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'am' || saved === 'om')) {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setCurrentLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      } catch (err) {
        console.error('Failed to persist language choice:', err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLanguage;
    }
  }, [currentLanguage]);

  // Deep-merge current dictionary with English fallback to ensure 0 undefined properties
  const activeDictionary = useMemo<TranslationDictionary>(() => {
    const raw = TRANSLATION_MAP[currentLanguage] || en;
    return {
      common: { ...en.common, ...raw.common },
      nav: { ...en.nav, ...raw.nav },
      roles: { ...en.roles, ...raw.roles },
      sidebar: { ...en.sidebar, ...raw.sidebar },
      home: { ...en.home, ...raw.home },
      marketplace: { ...en.marketplace, ...raw.marketplace },
      escrow: { ...en.escrow, ...raw.escrow },
      auth: { ...en.auth, ...raw.auth },
    };
  }, [currentLanguage]);

  const translate = (path: string, fallback?: string): string => {
    const parts = path.split('.');
    let current: any = activeDictionary;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }
    return typeof current === 'string' ? current : (fallback || path);
  };

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t: activeDictionary,
      languages: SUPPORTED_LANGUAGES,
      translate,
    }),
    [currentLanguage, activeDictionary]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
