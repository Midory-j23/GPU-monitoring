# GPU Monitor — React + TypeScript frontend

Stack: React 18, TypeScript, Vite, **Ant Design 5** (components, theme, RTL), Tailwind CSS (spacing/grid utilities only,
preflight off), Recharts, Lucide icons, React Router, TanStack Query, i18next / react-i18next.
Runs on **built-in mock data** until a backend exists.

See **GUIDE.md** for a file-by-file map of pages and sections.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm test           # vitest: every route in EN and FA, sorting, drawer, ack, language toggle
```
Vazirmatn is bundled locally via `@fontsource/vazirmatn` (no external font service).

## Structure
```
src/api/types.ts      data model (Server, Gpu, Vgpu, Customer, Alert, Point)
src/api/mock.ts       MOCK DATA — the only file that fabricates values
src/api/client.ts     every endpoint the UI calls; mock or real fetch
src/hooks/queries.ts  TanStack Query hooks (polling interval, optimistic alert ack)
src/i18n/locales/     en.json, fa.json  (all UI text)
src/lib/              settings (theme/lang/server/refresh), formatting, status helpers, customer stats
src/components/       Layout, DataTable, TimeChart, Gauge, MetricCard, AllocPanel, Guard, ui/* (Ant Design wrappers)
src/pages/            Overview, Customers, Gpus, Vgpus, Servers, Alerts
```

## Add something to monitor (example: fan RPM)
1. `src/api/types.ts` — add `fanRpm: number | null` to `Gpu`.
2. `src/api/mock.ts` — give each mock GPU a `fanRpm` (the real backend returns it later).
3. `src/pages/Gpus.tsx` — add one entry to `gpuColumns` (table) and one to `gpuDetails` (drawer):
   `{ key: 'rpm', header: 'rpm', cell: g => g.fanRpm == null ? c.f.n(null) : c.f.n(g.fanRpm, 0) + ' RPM', sort: g => g.fanRpm }`
4. `src/i18n/locales/en.json` + `fa.json` — add the `rpm` label.
Unsupported values must render `f.n(null)` ("N/A"), never an invented number. vGPU and customer tables
work the same way (`cols` in `Vgpus.tsx` / `Customers.tsx`).

## Connect the real backend
Set `VITE_USE_MOCK=false` (copy `.env.example` to `.env`). `src/api/client.ts` then calls:
`GET /api/servers, /api/gpus, /api/vgpus, /api/customers, /api/alerts, /api/metrics/overview,
/api/gpus/{id}/metrics, /api/customers/{id}/usage` and `POST /api/alerts/acknowledge {ids}`.
Response shapes = the interfaces in `src/api/types.ts`. In dev, `/api` is proxied to `localhost:8000`
(`vite.config.ts`); in production put the built `dist/` behind Nginx with `/api` proxied to FastAPI.

## Refresh interval & background
Settings → *Auto-refresh interval*: any whole number of seconds from 1 to 3600 (0 = off), applied immediately and saved in the
browser (`refreshSec`). The top-bar selector shows the same value. Every TanStack Query hook polls at this interval
(`src/hooks/queries.ts`). The animated background is `components/Backdrop.tsx` + the `.blob` rules in `index.css`
(it stops for users who prefer reduced motion, or when switched off in Settings → Visual effects).
Performance note: `.glass` is translucent only; real `backdrop-filter` blur (`.glass-blur`) is limited to the sticky header, the
side drawer and the login card, because blurring behind every box while the background moves makes pages stutter.

## Login
`/login` has a designed CSS background (no image file; `components/LoginBackground.tsx`, styles in `pages/login.css`) and the Padisar logo (`public/padisar-logo.png`). Every other route is wrapped in `RequireAuth`. Mock mode accepts `admin / admin123`,
`operator / operator123`, `viewer / viewer123` (shown as click-to-fill chips on the login page, only in mock mode).
Real mode: `POST /api/auth/login {username,password}` must set an HTTP-only session cookie and return `{username, role}`;
`POST /api/auth/logout` ends it; any `401` from the API signs the user out. Viewers don't see the acknowledge buttons, but
**roles must be enforced by the backend** — the UI only hides controls. Login rate limiting is also a backend job.

## Known limitations
- Login is a UI + mock only until the backend exists (no real security yet). No pagination (mock data is small). No alert-rule editor.
- Overview charts show fleet-wide series even when a single server is selected.
- Customer ↔ GPU/vGPU ownership will need a backend table; GPU-hours here are mock values.
- Tests run in jsdom: chart rendering and visual layout were not checked in a real browser.
