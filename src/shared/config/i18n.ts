import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../../../public/locales/en/common.json';
import plCommon from '../../../public/locales/pl/common.json';
import ruCommon from '../../../public/locales/ru/common.json';

const storageKey = 'lp.language';
const allLanguages = ['en', 'pl', 'ru'] as const;

export type AppLanguage = (typeof allLanguages)[number];

const fallbackLanguage = allLanguages.includes(
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE as AppLanguage,
)
  ? (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as AppLanguage)
  : 'en';

const parseLanguages = (value: string | undefined): AppLanguage[] => {
  if (!value) {
    return [...allLanguages];
  }

  const parsed = value
    .split(',')
    .map((language) => language.trim())
    .filter((language): language is AppLanguage => allLanguages.includes(language as AppLanguage));

  if (!parsed.length) {
    return [...allLanguages];
  }

  return Array.from(new Set(parsed));
};

export const appLanguages = parseLanguages(process.env.NEXT_PUBLIC_LOCALES);

const isAppLanguage = (value: unknown): value is AppLanguage => {
  return typeof value === 'string' && appLanguages.includes(value as AppLanguage);
};

const getBrowserLanguage = (): AppLanguage | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const normalizedLanguage = navigator.language.toLowerCase();

  if (normalizedLanguage.startsWith('pl')) {
    return 'pl';
  }

  if (normalizedLanguage.startsWith('ru')) {
    return 'ru';
  }

  if (normalizedLanguage.startsWith('en')) {
    return 'en';
  }

  return null;
};

const getStoredLanguage = (): AppLanguage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const language = window.localStorage.getItem(storageKey);

  return isAppLanguage(language) ? language : null;
};

export const getPreferredLanguage = (accountLanguage?: string): AppLanguage => {
  if (isAppLanguage(accountLanguage)) {
    return accountLanguage;
  }

  const storedLanguage = getStoredLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  return getBrowserLanguage() ?? fallbackLanguage;
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    initImmediate: false,
    resources: {
      en: { common: enCommon },
      pl: { common: plCommon },
      ru: { common: ruCommon },
    },
    lng: fallbackLanguage,
    fallbackLng: fallbackLanguage,
    supportedLngs: appLanguages,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

if (typeof window !== 'undefined') {
  i18n.on('languageChanged', (language) => {
    if (isAppLanguage(language)) {
      window.localStorage.setItem(storageKey, language);
    }
  });
}

export const setAppLanguage = async (language: string): Promise<AppLanguage> => {
  const nextLanguage = getPreferredLanguage(language);

  if (i18n.language !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage);
  }

  return nextLanguage;
};

export default i18n;
