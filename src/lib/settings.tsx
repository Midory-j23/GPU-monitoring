import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import i18n, { type Lang } from '@/i18n'

type Theme = 'dark' | 'light'
interface Settings {
  lang: Lang; setLang: (l: Lang) => void
  theme: Theme; setTheme: (t: Theme) => void
  serverId: string; setServerId: (s: string) => void
  refreshSec: number; setRefreshSec: (n: number) => void
  animBg: boolean; setAnimBg: (b: boolean) => void
}
const Ctx = createContext<Settings | null>(null)
const read = (k: string, d: string) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(read('lang', 'en') === 'fa' ? 'fa' : 'en')
  const [theme, setTheme] = useState<Theme>(read('theme', 'dark') === 'light' ? 'light' : 'dark')
  const [serverId, setServerId] = useState('all')
  const [animBg, setAnim] = useState(read('animBg', 'on') !== 'off')
  const setAnimBg = (b: boolean) => { setAnim(b); write('animBg', b ? 'on' : 'off') }
  const [refreshSec, setRefresh] = useState(() => { const n = Number(read('refreshSec', '30')); return Number.isInteger(n) && n >= 0 && n <= 3600 ? n : 30 })
  /** Whole seconds, 0 = off, max 3600. Saved in this browser. */
  const setRefreshSec = (n: number) => { const v = Math.max(0, Math.min(3600, Math.round(n))); setRefresh(v); write('refreshSec', String(v)) }
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
    i18n.changeLanguage(lang); write('lang', lang)
  }, [lang])
  useEffect(() => { document.documentElement.dataset.anim = animBg ? 'on' : 'off' }, [animBg])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark'); write('theme', theme)
  }, [theme])
  const v = useMemo(() => ({ lang, setLang, theme, setTheme, serverId, setServerId, refreshSec, setRefreshSec, animBg, setAnimBg }), [lang, theme, serverId, refreshSec, animBg])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
export function useSettings() {
  const c = useContext(Ctx)
  if (!c) throw new Error('SettingsProvider missing')
  return c
}
