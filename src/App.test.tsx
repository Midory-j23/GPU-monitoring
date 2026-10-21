import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { api } from './api/client'
import App from './App'
import { Providers } from './Providers'

const mount = (path: string) => render(<Providers><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></Providers>)
const loaded = () => waitFor(() => expect(document.querySelector('[data-loading]')).toBeNull(), { timeout: 3000 })
const signIn = (role = 'admin') => sessionStorage.setItem('auth', JSON.stringify({ username: role, role }))
beforeEach(() => signIn())
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear() })

describe.each(['en', 'fa'])('language %s', (lang) => {
  test.each(['/', '/customers', '/gpus', '/vgpus', '/servers', '/alerts', '/settings'])('route %s renders', async (path) => {
    localStorage.setItem('lang', lang)
    mount(path)
    await loaded()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBeTruthy()
    expect(document.documentElement.dir).toBe(lang === 'fa' ? 'rtl' : 'ltr')
    expect(document.body.textContent).not.toMatch(/\b(overviewSub|gpusSub|unsup)\b/) // no raw translation keys
  })
})

test('language toggle switches to Persian RTL', async () => {
  mount('/'); await loaded()
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Overview')
  fireEvent.click(screen.getByRole('button', { name: /فارسی/ }))
  await waitFor(() => expect(document.documentElement.dir).toBe('rtl'))
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('نمای کلی')
})

test('GPU table sorts and opens detail drawer', async () => {
  mount('/gpus'); await loaded()
  const util = [...document.querySelectorAll('th')].find((h) => h.textContent === 'GPU utilization')!
  fireEvent.click(util); fireEvent.click(util)
  const vals = [...document.querySelectorAll('.ant-table-row')].map((r) => parseFloat(r.children[4].textContent ?? ''))
  const nums = vals.filter((v) => !Number.isNaN(v))
  expect(nums.length).toBeGreaterThan(3)
  expect(nums).toEqual([...nums].sort((a, b) => b - a)) // descending (mock values jitter, so check order, not exact numbers)
  expect(Number.isNaN(vals[vals.length - 1])).toBe(true) // N/A rows sort last
  fireEvent.click(document.querySelector('.ant-table-row')!)
  expect(await screen.findByRole('heading', { level: 1, name: /NVIDIA/ }, { timeout: 8000 })).toBeTruthy() // GPU opens on its own page
  expect(screen.getByRole('button', { name: 'Back to GPUs' })).toBeTruthy()
  expect(document.querySelector('.ant-drawer-content')).toBeNull()
})

test('acknowledging an alert updates the list', async () => {
  mount('/alerts'); await loaded()
  const before = screen.getAllByRole('button', { name: 'Acknowledge' }).length
  fireEvent.click(screen.getAllByRole('button', { name: 'Acknowledge' })[0])
  await waitFor(() => expect(screen.queryAllByRole('button', { name: 'Acknowledge' }).length).toBe(before - 1))
})

describe('authentication', () => {
  test('protected route redirects to login when signed out', async () => {
    sessionStorage.clear(); mount('/gpus')
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in to GPU Monitor' })).toBeTruthy()
  })
  test('wrong password shows an error, right password signs in', async () => {
    sessionStorage.clear(); mount('/alerts'); await screen.findByLabelText('Username')
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect((await screen.findByRole('alert', {}, { timeout: 8000 })).textContent).toBe('Wrong username or password')
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Alerts' }, { timeout: 8000 })).toBeTruthy() // returns to the page that was requested
  })
  test('login page works in Persian RTL', async () => {
    sessionStorage.clear(); localStorage.setItem('lang', 'fa'); mount('/login')
    expect(await screen.findByRole('heading', { level: 1, name: 'ورود به مانیتورینگ GPU پدیسار' })).toBeTruthy()
    expect(document.documentElement.dir).toBe('rtl')
  })
  test('viewer cannot acknowledge, sign out returns to login', async () => {
    signIn('viewer'); mount('/alerts'); await loaded()
    expect(screen.queryAllByRole('button', { name: 'Acknowledge' }).length).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in to GPU Monitor' })).toBeTruthy()
  })
})

describe('refresh interval', () => {
  test('can be set to 1 second on the settings page and is saved', async () => {
    mount('/settings'); await loaded()
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    await waitFor(() => expect(localStorage.getItem('refreshSec')).toBe('1'))
    expect(screen.getByRole('status').textContent).toMatch(/under 5 seconds/)
    expect(screen.getByText('Auto-refresh: 1 s')).toBeTruthy() // top-bar selector shows the same value
  })
  test('a 1-second interval really polls every second', async () => {
    localStorage.setItem('refreshSec', '1')
    const spy = vi.spyOn(api, 'gpus')
    mount('/gpus'); await loaded()
    await waitFor(() => expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3), { timeout: 4500 })
    spy.mockRestore()
  })
  test('0 turns polling off', async () => {
    localStorage.setItem('refreshSec', '0')
    const spy = vi.spyOn(api, 'gpus')
    mount('/gpus'); await loaded()
    await new Promise((r) => setTimeout(r, 2300))
    expect(spy.mock.calls.length).toBe(1)
    spy.mockRestore()
  })
})

test('animated background can be switched off and is remembered', async () => {
  mount('/settings'); await loaded()
  expect(document.documentElement.dataset.anim).toBe('on')
  fireEvent.click(screen.getByRole('switch', { name: 'Animated background' }))
  await waitFor(() => expect(document.documentElement.dataset.anim).toBe('off'))
  expect(localStorage.getItem('animBg')).toBe('off')
})

describe('sidebar', () => {
  test('desktop sidebar is rounded (30px) and sticky', async () => {
    mount('/'); await loaded()
    const aside = document.querySelector('aside') as HTMLElement
    expect(aside.style.borderRadius).toBe('30px')
    expect(aside.className).toMatch(/\bsticky\b/)
  })
  test('menu button opens the navigation drawer, choosing a page closes it', async () => {
    mount('/'); await loaded()
    expect(document.querySelector('.nav-drawer')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await waitFor(() => expect(document.querySelector('.nav-drawer .ant-menu')).toBeTruthy())
    fireEvent.click(document.querySelector('.nav-drawer')!.querySelector('a[href="/gpus"]')!)
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('GPUs'))
  })
  test('in Persian the drawer opens from the right', async () => {
    localStorage.setItem('lang', 'fa'); mount('/'); await loaded()
    fireEvent.click(screen.getByRole('button', { name: 'منو' }))
    await waitFor(() => expect(document.querySelector('.nav-drawer.ant-drawer-right')).toBeTruthy())
  })
})

describe('customer detail page', () => {
  test('clicking a customer opens its own page (no drawer)', async () => {
    mount('/customers'); await loaded()
    fireEvent.click(document.querySelector('.ant-table-row')!)
    expect(await screen.findByRole('heading', { level: 1, name: 'Arvin Analytics' }, { timeout: 8000 })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Back to customers' })).toBeTruthy()
    expect(document.querySelector('.ant-drawer-content')).toBeNull()
  })
  test('direct link shows full details: resources, chart, alerts section', async () => {
    mount('/customers/c3'); await loaded()
    expect(await screen.findByRole('heading', { level: 1, name: 'Sepehr AI Lab' }, { timeout: 8000 })).toBeTruthy()
    expect(document.body.textContent).toContain('ml-train-02')       // its vGPU
    expect(document.body.textContent).toContain('A30')                // its dedicated GPU
    expect(document.body.textContent).toContain('Memory: allocated vs in use')
    expect(document.body.textContent).toContain("Alerts on this customer's servers")
  })
  test('unknown customer shows a message, Persian page is RTL, back button returns to the list', async () => {
    mount('/customers/zzz'); await loaded()
    expect(await screen.findByText('Customer not found', {}, { timeout: 8000 })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back to customers' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Customers' }, { timeout: 8000 })).toBeTruthy()
    cleanup(); localStorage.setItem('lang', 'fa'); mount('/customers/c3'); await loaded()
    expect(await screen.findByRole('heading', { level: 1, name: 'آزمایشگاه هوش مصنوعی سپهر' }, { timeout: 8000 })).toBeTruthy()
    expect(document.documentElement.dir).toBe('rtl')
  })
})

describe('layout fixes', () => {
  test('menu button is hidden on desktop via a wrapper, not on the Ant Design button itself', async () => {
    mount('/'); await loaded()
    const btn = screen.getByRole('button', { name: 'Menu' })
    expect(btn.className).not.toMatch(/md:hidden/)
    expect(btn.parentElement!.className).toMatch(/md:hidden/)
  })
  test('page sections are spaced with gap (flex column), not margins on Ant Design cards', async () => {
    mount('/'); await loaded()
    const root = screen.getByRole('heading', { level: 1 }).parentElement!.parentElement!
    expect(root.className).toMatch(/flex-col/); expect(root.className).toMatch(/gap-4/)
    expect([...document.querySelectorAll('.ant-card')].filter((c) => /\b(mb|mt)-\d/.test(c.className))).toHaveLength(0)
  })
  test('scrolling pauses the background animation and resumes after', async () => {
    mount('/'); await loaded()
    window.dispatchEvent(new Event('scroll'))
    expect(document.documentElement.dataset.scrolling).toBe('1')
    await waitFor(() => expect(document.documentElement.dataset.scrolling).toBeUndefined(), { timeout: 1500 })
  })
})

describe('GPU detail page', () => {
  test('direct link shows full detail: info, vGPUs with customers, processes, charts, alerts', async () => {
    mount('/gpus/g0'); await loaded()
    expect(await screen.findByRole('heading', { level: 1, name: 'NVIDIA A100 80GB' }, { timeout: 8000 })).toBeTruthy()
    for (const text of ['Device information', 'Customers on this GPU', 'vGPUs on this GPU', 'GPU processes', 'ml-train-02', 'Sepehr AI Lab', 'Alerts on this GPU and its server', 'GPU utilization over time'])
      expect(document.body.textContent).toContain(text)
  })
  test('offline GPU shows N/A and its dedicated customer; unknown id shows a message', async () => {
    mount('/gpus/g7'); await loaded()
    expect(await screen.findByRole('heading', { level: 1, name: 'NVIDIA T4' }, { timeout: 8000 })).toBeTruthy()
    expect(document.body.textContent).toContain('N/A'); expect(document.body.textContent).toContain('Dena HealthTech')
    cleanup(); mount('/gpus/zzz'); await loaded()
    expect(await screen.findByText('GPU not found', {}, { timeout: 8000 })).toBeTruthy()
  })
  test('overview fleet cell and customer resource row both lead to the GPU page; Persian works', async () => {
    mount('/'); await loaded()
    fireEvent.click(screen.getAllByTitle(/NVIDIA/)[0])
    expect(await screen.findByRole('heading', { level: 1, name: /NVIDIA/ }, { timeout: 8000 })).toBeTruthy()
    cleanup(); mount('/customers/c3'); await loaded()
    await screen.findByRole('heading', { level: 1, name: 'Sepehr AI Lab' }, { timeout: 8000 })
    fireEvent.click(document.querySelector('.ant-table-row')!)
    expect(await screen.findByRole('heading', { level: 1, name: /NVIDIA/ }, { timeout: 8000 })).toBeTruthy()
    cleanup(); localStorage.setItem('lang', 'fa'); mount('/gpus/g0'); await loaded()
    expect(await screen.findByText('اطلاعات دستگاه', {}, { timeout: 8000 })).toBeTruthy()
    expect(document.documentElement.dir).toBe('rtl')
  })
})
test('all dashboard summary cards have the same structure (each reserves a footer of equal height)', async () => {
  mount('/'); await loaded()
  const cards = [...document.querySelectorAll('[data-metric-card]')]
  expect(cards).toHaveLength(9)
  expect(cards.every((c) => c.querySelector('[data-metric-footer]'))).toBe(true)
})

describe('login form design', () => {
  test('empty submit shows the validation bubbles (translated) and does not sign in', async () => {
    sessionStorage.clear(); mount('/login'); await screen.findByLabelText('Username')
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    const bubbles = [...document.querySelectorAll('[data-invalid]')].map((e) => e.getAttribute('data-validate'))
    expect(bubbles).toEqual(['Username is required', 'Password is required'])
    fireEvent.focus(screen.getByLabelText('Username'))
    expect(document.querySelectorAll('[data-invalid]')).toHaveLength(1) // focusing a field clears its bubble
    expect(sessionStorage.getItem('auth')).toBeNull()
  })
  test('demo chip fills the form; Persian bubbles and hint are translated', async () => {
    sessionStorage.clear(); localStorage.setItem('lang', 'fa'); mount('/login')
    expect(await screen.findByText('گذرواژه را فراموش کرده‌اید؟ با مدیر سیستم تماس بگیرید.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^viewer/ }))
    expect((screen.getByLabelText('نام کاربری') as HTMLInputElement).value).toBe('viewer')
  })
})

describe('login brand + GSAP', () => {
  const realMM = window.matchMedia
  const motion = (allowed: boolean) => { window.matchMedia = ((q: string) => ({ matches: allowed && q.includes('no-preference'), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as typeof window.matchMedia }
  afterEach(() => { window.matchMedia = realMM })

  test('brand lockup is split into words (Persian letters stay joined) and re-renders on language switch', async () => {
    sessionStorage.clear(); mount('/login'); await screen.findByLabelText('Username')
    expect([...document.querySelectorAll('.lg-brand-word')].map((w) => w.textContent)).toEqual(['GPU', 'Monitor'])
    fireEvent.click(screen.getByRole('button', { name: /فارسی/ }))
    await waitFor(() => expect([...document.querySelectorAll('.lg-brand-word')].map((w) => w.textContent)).toEqual(['مانیتورینگ', 'GPU', 'پدیسار']))
  })
  test('with motion allowed GSAP animates the brand, then clears its inline styles (releases GPU layers)', async () => {
    motion(true); sessionStorage.clear(); mount('/login'); await screen.findByLabelText('Username')
    const word = document.querySelector('.lg-brand-word') as HTMLElement
    expect(word.getAttribute('style') ?? '').toMatch(/transform/)                       // animation started
    await waitFor(() => expect(word.getAttribute('style') ?? '').not.toMatch(/transform/), { timeout: 5000 }) // and cleaned up
  })
  test('with reduced motion nothing is animated', async () => {
    motion(false); sessionStorage.clear(); mount('/login'); await screen.findByLabelText('Username')
    expect(document.querySelector('.lg-brand-word')!.getAttribute('style')).toBeNull()
    expect(document.querySelector('.lg-pulse')!.getAttribute('style')).not.toMatch(/dashoffset/i)
  })
  test('laptop shows a monitoring pulse line instead of the user icon', async () => {
    sessionStorage.clear(); mount('/login'); await screen.findByLabelText('Username')
    const svg = document.querySelector('.lg-pic svg')!
    expect(svg.querySelector('.lg-pulse')).toBeTruthy()
    expect(svg.querySelector('circle[r="13"]')).toBeNull()          // old user head
    expect(svg.innerHTML).not.toContain('M131 174')                  // old user shoulders
  })
})
