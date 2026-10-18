import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme as antTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import faIR from 'antd/locale/fa_IR'
import { useState, type ReactNode } from 'react'
import '@/i18n'
import { AuthProvider } from '@/lib/auth'
import { SettingsProvider, useSettings } from '@/lib/settings'

/** Ant Design theme follows the app settings: dark/light, English/Persian (RTL), Vazirmatn font. */
function AntTheme({ children }: { children: ReactNode }) {
  const { theme, lang } = useSettings(), rtl = lang === 'fa', dark = theme === 'dark'
  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'} locale={rtl ? faIR : enUS}
      theme={{
        algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: dark ? '#4cb8e0' : '#1f7fa6', borderRadius: 12,
          // popups (dropdowns, drawers) and tooltips: theme-matched instead of Ant Design's near-black defaults
          colorBgElevated: dark ? '#1d2d3a' : '#ffffff', colorBgSpotlight: dark ? '#34556b' : '#2f5870',
          // hover / pressed states: soft blue tint instead of grey-black
          colorBgTextHover: dark ? 'rgba(76,184,224,.16)' : 'rgba(31,127,166,.10)', colorBgTextActive: dark ? 'rgba(76,184,224,.26)' : 'rgba(31,127,166,.18)',
          colorFillAlter: dark ? 'rgba(76,184,224,.07)' : 'rgba(31,127,166,.05)', fontFamily: rtl ? "'Vazirmatn', Tahoma, sans-serif" : "'Segoe UI', system-ui, sans-serif" },
        // transparent surfaces so the glass look and the moving background show through
        components: {
          Card: { colorBgContainer: 'transparent' },
          Table: { colorBgContainer: 'transparent', headerBg: 'transparent', rowHoverBg: dark ? 'rgba(76,184,224,.12)' : 'rgba(31,127,166,.08)' },
          Menu: { itemBg: 'transparent', itemBorderRadius: 20, activeBarBorderWidth: 0, itemHoverBg: dark ? 'rgba(76,184,224,.14)' : 'rgba(31,127,166,.10)', itemSelectedBg: dark ? 'rgba(76,184,224,.24)' : 'rgba(31,127,166,.16)' },
          Select: { optionActiveBg: dark ? 'rgba(76,184,224,.16)' : 'rgba(31,127,166,.10)', optionSelectedBg: dark ? 'rgba(76,184,224,.26)' : 'rgba(31,127,166,.18)' },
        },
      }}>
      {children}
    </ConfigProvider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 4000, retry: 1, refetchOnWindowFocus: false } } }))
  return <QueryClientProvider client={qc}><SettingsProvider><AuthProvider><AntTheme>{children}</AntTheme></AuthProvider></SettingsProvider></QueryClientProvider>
}
