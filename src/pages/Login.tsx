import { Eye, EyeOff, Languages, Lock, LogIn, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LoginIllustration } from '@/components/LoginIllustration'
import { Button } from '@/components/ui/button'
import { DEMO_USERS } from '@/api/mock'
import { useAuth } from '@/lib/auth'
import { useSettings } from '@/lib/settings'
import './login.css'

const MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export default function Login() {
  const { t } = useTranslation(), { user, login } = useAuth(), s = useSettings(), nav = useNavigate(), loc = useLocation()
  const from = (loc.state as { from?: string } | null)?.from ?? '/'
  const [u, setU] = useState(''), [p, setP] = useState(''), [show, setShow] = useState(false)
  const [bad, setBad] = useState({ u: false, p: false }), [err, setErr] = useState(false), [busy, setBusy] = useState(false)
  if (user) return <Navigate to={from} replace />
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { u: !u.trim(), p: !p }
    setBad(next)
    if (next.u || next.p) return
    setBusy(true); setErr(false)
    try { await login(u.trim(), p); nav(from, { replace: true }) } catch { setErr(true); setBusy(false) }
  }
  return (
    // "dark" forces the dark palette. The background is pure CSS (aurora glows + dot
    // grid + grain), so it stays sharp at any resolution — no photo assets needed.
    <div className="dark relative flex min-h-screen items-center justify-center bg-[#050b1a] p-4 text-foreground">
      {/* Decorative background — one static element, zero per-frame GPU work. */}
      <div className="lg-bg" aria-hidden="true" />
      <Button className="absolute end-4 top-4" onClick={() => s.setLang(s.lang === 'en' ? 'fa' : 'en')}><Languages size={16} />{t('lang')}</Button>
      <div className="lg-card relative">
        <div className="lg-pic"><LoginIllustration /></div>
        <form className="lg-form" onSubmit={submit} noValidate aria-labelledby="login-title">
          <h1 id="login-title" className="lg-title">{t('loginTitle')}</h1>
          <div className="lg-field" data-invalid={bad.u || undefined} data-validate={t('usernameRequired')}>
            <input className="lg-input" name="username" aria-label={t('username')} placeholder={t('username')} autoComplete="username" autoFocus value={u}
              onChange={(e) => setU(e.target.value)} onFocus={() => setBad((b) => ({ ...b, u: false }))} />
            <span className="lg-focus" /><span className="lg-icon"><User size={18} /></span>
          </div>
          <div className="lg-field" data-invalid={bad.p || undefined} data-validate={t('passwordRequired')}>
            <input className="lg-input" name="password" type={show ? 'text' : 'password'} aria-label={t('password')} placeholder={t('password')} autoComplete="current-password" value={p}
              onChange={(e) => setP(e.target.value)} onFocus={() => setBad((b) => ({ ...b, p: false }))} />
            <span className="lg-focus" /><span className="lg-icon"><Lock size={18} /></span>
            <button type="button" className="lg-eye" onClick={() => setShow(!show)} aria-label={t(show ? 'hidePw' : 'showPw')}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {err && <div role="alert" className="lg-error">{t('loginError')}</div>}
          <button type="submit" className="lg-btn" disabled={busy}><LogIn size={18} />{busy ? t('signingIn') : t('signIn')}</button>
          <div className="lg-foot">
            <div>{t('forgotHint')}</div>
            {MOCK && (
              <div style={{ marginTop: 14 }}>
                <div>{t('demoHint')}</div>
                {Object.entries(DEMO_USERS).map(([name, [pw]]) => (
                  <button key={name} type="button" className="lg-chip" onClick={() => { setU(name); setP(pw); setBad({ u: false, p: false }) }}>{name} · {t('role_' + name)}</button>
                ))}
              </div>)}
          </div>
        </form>
      </div>
    </div>
  )
}
