import { useTranslation } from 'react-i18next'
export function useFmt() {
  const { t, i18n } = useTranslation()
  const fa = i18n.language === 'fa'
  const loc = fa ? 'fa-IR' : 'en-US'
  return {
    /** Localised number; "N/A" for missing values. */
    n: (v: number | null | undefined, d = 1) =>
      v == null ? t('unsup') : new Intl.NumberFormat(loc, { maximumFractionDigits: d }).format(v),
    time: (ms: number) => new Date(ms).toLocaleTimeString(fa ? 'fa-IR' : 'en-GB'),
  }
}
