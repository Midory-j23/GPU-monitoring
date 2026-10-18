import { Badge, Drawer, Menu, Select, Tag } from 'antd'
import { Activity, Bell, Cpu, Languages, Layers, LayoutDashboard, LogOut, Menu as MenuIcon, Moon, RefreshCw, Server, Settings as SettingsIcon, Sun, Users } from 'lucide-react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAlerts, useOverview, useServers } from '@/hooks/queries'
import { useAuth } from '@/lib/auth'
import { useFmt } from '@/lib/format'
import { useSettings } from '@/lib/settings'
import { Backdrop } from './Backdrop'
import { Button } from './ui/button'

const NAV = [
  { to: '/', id: 'overview', icon: LayoutDashboard }, { to: '/customers', id: 'customers', icon: Users },
  { to: '/gpus', id: 'gpus', icon: Cpu }, { to: '/vgpus', id: 'vgpus', icon: Layers },
  { to: '/servers', id: 'servers', icon: Server }, { to: '/alerts', id: 'alerts', icon: Bell },
  { to: '/settings', id: 'settings', icon: SettingsIcon },
]

export default function Layout() {
  const { t } = useTranslation(), f = useFmt(), s = useSettings(), qc = useQueryClient(), { pathname } = useLocation()
  const fetching = useIsFetching() > 0, { user, logout } = useAuth(), [navOpen, setNavOpen] = useState(false)
  const servers = useServers().data ?? [], updated = useOverview().dataUpdatedAt
  const open = (useAlerts().data ?? []).filter((a) => !a.acked).length
  const selected = NAV.find((n) => n.to !== '/' && pathname.startsWith(n.to))?.to ?? '/'
  const menu = (
    <Menu mode="inline" selectedKeys={[selected]} style={{ background: 'transparent', borderInlineEnd: 0 }} onClick={() => setNavOpen(false)}
      items={NAV.map(({ to, id, icon: Icon }) => ({
        key: to, icon: <Icon size={16} />,
        label: <Link to={to}>{t(id)}{id === 'alerts' && open > 0 && <Badge count={f.n(open, 0)} size="small" style={{ marginInlineStart: 8 }} />}</Link>,
      }))} />
  )
  return (
    <div className="min-h-screen md:flex">
      <Backdrop />
      {/* Desktop: rounded sidebar that stays in view while the page scrolls */}
      <aside className="glass sticky top-3 z-10 m-3 hidden h-[calc(100vh-1.5rem)] w-60 shrink-0 flex-col self-start overflow-y-auto p-3 md:flex" style={{ borderRadius: 30 }}>
        <div className="flex items-center gap-2 px-3 pb-3 pt-2 text-base font-bold"><Activity className="text-primary" size={18} />{t('brand')}</div>
        {menu}
      </aside>
      {/* Mobile: the same menu opens as a drawer from the header button */}
      <Drawer open={navOpen} onClose={() => setNavOpen(false)} placement={s.lang === 'fa' ? 'right' : 'left'} width={280} rootClassName="nav-drawer" styles={{ body: { padding: 8 } }}
        title={<span className="flex items-center gap-2 font-bold"><Activity className="text-primary" size={18} />{t('brand')}</span>}>{menu}</Drawer>
      <main className="min-w-0 flex-1 px-4 pb-8 md:ps-1">
        <header className="glass glass-bar sticky top-3 z-20 mb-4 mt-3 flex flex-wrap items-center gap-2 rounded-xl p-2">
          <span className="md:hidden"><Button size="icon" onClick={() => setNavOpen(true)} aria-label={t('menu')} title={t('menu')}><MenuIcon size={16} /></Button></span>
          <Select<string> style={{ minWidth: 150 }} value={s.serverId} onChange={s.setServerId} aria-label={t('servers')}
            options={[{ value: 'all', label: t('allSrv') }, ...servers.map((v) => ({ value: v.id, label: v.host }))]} />
          <Tag color="warning" style={{ margin: 0 }}>{t('mock')}</Tag>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{t('upd')}: {updated ? f.time(updated) : '—'}</span>
          <Select<number> style={{ minWidth: 170 }} value={s.refreshSec} onChange={s.setRefreshSec} aria-label={t('every')}
            options={[...new Set([0, 1, 5, 10, 30, 60, s.refreshSec])].sort((a, b) => a - b).map((n) => ({ value: n, label: `${t('every')}: ${n ? `${f.n(n, 0)} ${t('secShort')}` : t('off')}` }))} />
          <Button size="icon" onClick={() => qc.invalidateQueries()} aria-label={t('refresh')} title={t('refresh')}><RefreshCw size={16} className={fetching ? 'animate-spin' : ''} /></Button>
          <Button size="icon" onClick={() => s.setTheme(s.theme === 'dark' ? 'light' : 'dark')} aria-label={t('theme')} title={t('theme')}>{s.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</Button>
          <Button onClick={() => s.setLang(s.lang === 'en' ? 'fa' : 'en')}><Languages size={16} />{t('lang')}</Button>
          <span className="hidden text-xs text-muted-foreground sm:inline"><span className="ltr">{user?.username}</span> · {t('role_' + user?.role)}</span>
          <Button size="icon" onClick={() => { logout(); qc.clear() }} aria-label={t('logout')} title={t('logout')}><LogOut size={16} /></Button>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
