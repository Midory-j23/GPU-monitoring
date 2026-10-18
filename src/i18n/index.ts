import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fa from './locales/fa.json'

export type Lang = 'en' | 'fa'

function saved(): Lang {
  try { return localStorage.getItem('lang') === 'fa' ? 'fa' : 'en' } catch { return 'en' }
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fa: { translation: fa } },
  lng: saved(),
  fallbackLng: 'en',
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
})
export default i18n
