import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json'; 
import translationAR from './locales/ar/translation.json';
console.log('AR File Content on Import:');
console.log(translationAR);

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources, 
    supportedLngs: ['en', 'ar'], 
    lng: 'en', 
    fallbackLng: 'en', 
    ns: ['translation'],
    defaultNS: 'translation', 
    
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    
    react: {
      useSuspense: false, 
    },
    
    interpolation: {
      escapeValue: false, 
    }
  });

console.log('✅ i18n initialization complete!');

export default i18n;