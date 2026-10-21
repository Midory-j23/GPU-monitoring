# Code guide — which part of the project lives in which file

Everything is under `src/`. Search for the **bold names** below (Ctrl+Shift+F in VS Code) to jump to a section.

## 1. How a page appears on screen
```
index.html → src/main.tsx → Providers.tsx → App.tsx (routes) → Layout.tsx (sidebar + top bar) → a page in src/pages/
```
| Step | File | What it does |
|---|---|---|
| Entry | `main.tsx` | Mounts React, adds the router, loads `index.css` |
| Providers | `Providers.tsx` | TanStack Query client + Settings + Auth (+ loads i18n) |
| Routes | `App.tsx` | URL → page. `/login` is public; everything else is wrapped in `RequireAuth` + `Layout` |
| Shell | `components/Layout.tsx` | Sidebar (**NAV** list), top bar, animated background |
| Page | `pages/*.tsx` | The actual screen content |

## 2. Pages (URL → file → sections)

### Login — `/login` → `pages/Login.tsx` (+ `pages/login.css`, `components/LoginBrand.tsx`, `components/LoginIllustration.tsx`)
Based on the "Login V1" design you supplied (two-column card: artwork + pill-shaped fields), recoloured with the project's colours.
| Part | Where |
|---|---|
| Background photo (`public/padisar-bg.png`) | `style` of the root div in `Login.tsx` |
| Card, fields, button, bubbles, error box (all colours = project CSS variables) | `login.css` (classes start with `lg-`) |
| Brand lockup above the title (icon + brand name + accent bar), animated once with GSAP | `components/LoginBrand.tsx`; text = `brand` in the locale files; styles `.lg-brand*` at the end of `login.css` |
| Artwork (laptop with a monitoring pulse line; pulse draws in once, laptop tilts toward the pointer — both GSAP) | `components/LoginIllustration.tsx` (SVG, uses `--primary`, `--ok`, `--muted`); the chart is the `.lg-pulse` path |
| Validation bubbles ("Username is required") | `data-validate` attributes + `bad` state in `Login.tsx`; texts `usernameRequired` / `passwordRequired` in the locale files |
| Wrong-password message | `loginError` |
| Demo accounts (mock mode only) | chips at the bottom, from `DEMO_USERS` in `api/mock.ts` |
To change the look, edit the variables in `index.css` (`:root` / `.dark`) or the rules in `login.css`.

### Overview — `/` → `pages/Overview.tsx`
| Section on screen | Where in the file |
|---|---|
| GPU strip (coloured cells per server) | `<CardTitle>{t('rack')}</CardTitle>` block; colours from `lib/status.ts` (**loadColor**) |
| 9 summary cards + sparklines | the **cards** array → rendered by `components/MetricCard.tsx` |
| 4 time charts (utilization, memory, temperature, power) | the **charts** array → `components/TimeChart.tsx` |
| Fleet health donut | `t('fleetH')` block (Recharts `PieChart`) |
| Load per server bars | `t('srvLoad')` block, small **Bar** helper at top of file |
| vGPU allocation per GPU | `components/AllocPanel.tsx` |
| Most utilized GPUs | `t('top')` block |
| Recent alerts | `AlertList` (exported from `pages/Alerts.tsx`) |

### Customers list — `/customers` → `pages/Customers.tsx`
Summary cards (top) · table (**cols** array — one entry per column) · "Underused" tag (inside the `name` column). Clicking a row goes to the
customer's own page (`nav('/customers/' + id)` in the `onRow` of the DataTable). The math (allocated memory, weighted utilization, worst status)
is in `lib/customers.ts` (**customerStats**).

### Customer detail — `/customers/:id` → `pages/CustomerDetail.tsx`
| Section on screen | Where in the file |
|---|---|
| Back button | **back** constant at the top |
| Name, status, "Underused" tag, customer-since | first block inside the returned fragment |
| 6 summary cards (dedicated GPUs, vGPUs, allocated, in use, utilization, GPU-hours) | `MetricCard` grid under the name |
| 30-day utilization chart | `t('usage30')` card (`useCustomerUsage` → `/api/customers/{id}/usage`) |
| Memory allocated vs in use + servers used | `t('custMem')` card (Ant Design `Progress`) |
| Resource table (dedicated GPUs + vGPUs; click a row → that GPU) | **cols** array and **rows** inside the file |
| Alerts on this customer's servers | `AlertList` at the bottom |

### GPU list — `/gpus` → `pages/Gpus.tsx`
Table columns: **gpuColumns** (top of file) · search / status filter / sorting / pagination come from `components/DataTable.tsx` ·
clicking a row goes to the GPU's own page (`nav('/gpus/' + id)`). The detail rows (**gpuDetails**) and process list (**procs**) live here too and are reused by the detail page.

### GPU detail — `/gpus/:id` → `pages/GpuDetail.tsx`
| Section on screen | Where in the file |
|---|---|
| Back button, name, status, host · GPU # · PCI | top of the returned fragment |
| 6 equal summary cards (utilization, memory, temperature, power, fan, clocks) | `MetricCard` grid (trend lines come from `useGpuMetrics`) |
| Device information (UUID, driver, clocks, ECC…) | `t('gpuInfo')` card, rows from **gpuDetails** in `pages/Gpus.tsx` |
| Customers on this GPU (dedicated owner + vGPU owners, click → customer page) | `t('gpuCustomers')` card |
| 4 ring gauges | `<Gauge>` row |
| 4 history charts | **charts** array (`TimeChart`) |
| GPU processes | `t('procs')` card (**procs** in `pages/Gpus.tsx`) |
| vGPUs on this GPU + allocation bar | **cols** array, `AllocPanel` |
| Alerts for this GPU and its server | `AlertList` at the bottom |

### vGPUs — `/vgpus` → `pages/Vgpus.tsx`
Table (**cols** array: VM, customer, GPU, host, profile, allocated vs guest memory, utilization, power state, health) · allocation bars (`AllocPanel`).

### Servers — `/servers` → `pages/Servers.tsx`
One card per server: the **rows** array (IP, OS, driver, GPU count, collector status, last update).

### Alerts — `/alerts` → `pages/Alerts.tsx`
**AlertList** (one alert row + Acknowledge button; viewers don't see the button) · page toolbar (Acknowledge all, open/all filter) in **Alerts**.
Acknowledging uses `useAcknowledge` in `hooks/queries.ts` (updates the screen instantly).

### Settings — `/settings` → `pages/Settings.tsx`
Auto-refresh interval (`InputNumber` + quick buttons, 1–3600 s, 0 = off) · Visual effects card (`Switch` for the animated background).
The values live in `lib/settings.tsx` (**refreshSec**, **animBg**).

## 3. Shared building blocks (`src/components/`)
| File | Purpose |
|---|---|
| `Layout.tsx` | Rounded (30px) sticky sidebar on desktop; on mobile the **menu button** in the top bar opens the same menu in a Drawer. Top bar: server selector, "last updated", refresh-interval selector, refresh, theme, language, user + sign-out |
| `Backdrop.tsx` | The three moving colour blobs (styles = `.blob` in `index.css`) |
| `DataTable.tsx` | Ant Design Table: search, status filter, sorting (N/A always last), pagination (10/page), empty state. Columns come from a `Col[]` list |
| `TimeChart.tsx` | Recharts line chart (always left-to-right, even in Persian) |
| `MetricCard.tsx` | Summary card with status colour bar and sparkline |
| `Gauge.tsx` | Ring gauge (SVG) |
| `AllocPanel.tsx` | Allocated vGPU memory bars; the tick = physical memory in use |
| `StatusBadge.tsx` | Coloured dot + Normal/Warning/Critical/Unavailable |
| `Guard.tsx` | Loading skeleton / error + Retry / content |
| `Page.tsx` | Page title + subtitle (`<id>` and `<id>Sub` translation keys) |
| `RequireAuth.tsx` | Redirects to `/login` when signed out |
| `ui/` | Thin wrappers over Ant Design: `button` (variant/size names), `card` (glass Card + title), `sheet` (Drawer that opens from the inline-end edge), `table` (plain table for small tables inside drawers) |

## 4. Data layer
| File | Purpose |
|---|---|
| `api/types.ts` | Shapes of Server, Gpu, Vgpu, Customer, Alert, Point |
| `api/mock.ts` | **All fake data** (servers, GPUs, vGPUs, customers, alerts, charts, demo users). Only file to replace/remove for real data |
| `api/client.ts` | Every request the UI makes (`api.gpus`, `api.login`…). `VITE_USE_MOCK=false` switches to real `/api/...` calls |
| `hooks/queries.ts` | TanStack Query hooks (**useGpus**, **useAlerts**…) — polling interval comes from Settings |

## 5. App-wide state and helpers (`src/lib/`)
| File | Purpose |
|---|---|
| `settings.tsx` | Language, theme, selected server, refresh seconds, animated background — saved in the browser |
| `auth.tsx` | Signed-in user, `login`, `logout`, `canAck` (viewers can't acknowledge) |
| `format.ts` | **useFmt**: localized numbers (Persian digits), times, "N/A" for missing values |
| `status.ts` | Status colours, `loadColor`, status ranking |
| `customers.ts` | Per-customer usage calculation |
| `utils.ts` | `cn()` class helper, `sum()` |

## 6. Language and look
| What | File |
|---|---|
| English text | `i18n/locales/en.json` |
| Persian text | `i18n/locales/fa.json` (same keys) |
| i18n setup, saved language | `i18n/index.ts`; RTL direction is set in `lib/settings.tsx` |
| Ant Design theme (dark/light, RTL, locale, font, rounded corners) | `Providers.tsx` → **AntTheme** (ConfigProvider) |
| Colours for custom parts, dark/light variables | `index.css` (`:root` and `.dark` variables) + `tailwind.config.ts` |
| Glass boxes | `.glass` (translucent) and `.glass-blur` (real blur, only header/drawers/login) in `index.css` |
| Moving background | `.blob`, `drift-*` keyframes in `index.css` + `components/Backdrop.tsx` |
| Persian font (Vazirmatn) | imported at top of `index.css`; applied by `html[lang='fa']` rule |

## 7. Tests
`src/App.test.tsx`: every page in English and Persian, language toggle, sorting + drawer, alert acknowledge, login/redirect/roles, refresh interval (1 s polling, 0 = off), animated-background switch. Run `npm test`.

## 8. "I want to change…" quick finder
| Goal | Edit |
|---|---|
| Add/remove a column in a table | `gpuColumns` (Gpus), `cols` (Vgpus, Customers) |
| Add a section to the customer page | `pages/CustomerDetail.tsx` (add a `Card` in the returned fragment) |
| Add a field to the GPU detail page | `gpuDetails` in `pages/Gpus.tsx` (shown in the "Device information" card) |
| Add a summary card | **cards** array in `pages/Overview.tsx` — give it `spark` (trend) or `sub` (caption) so it keeps the same size as the others |
| Add a chart | **charts** array in `pages/Overview.tsx` (data key must exist in `Point`, `api/types.ts`) |
| Add a sidebar page | new file in `pages/`, route in `App.tsx`, entry in **NAV** in `Layout.tsx`, `<id>` + `<id>Sub` keys in both locale files |
| Change a text/translation | the two `locales/*.json` files |
| Change status thresholds (warn/crit) | **gpuStatus** in `api/mock.ts` now; later the backend/alert rules |
| Change colours or glass look | `index.css` (custom parts) and **AntTheme** `token`/`components` in `Providers.tsx` (Ant Design parts) |
| Change sidebar width/shape | the `<aside>` in `components/Layout.tsx` (`w-60`, `borderRadius: 30`); mobile drawer width in the `<Drawer>` below it |
| Change blob speed/colours | `.blob-a/b/c` in `index.css` |
| Replace login background | `public/padisar-bg.png` |
| Change mock customers/GPUs | `api/mock.ts` |
| Connect real backend | `.env` → `VITE_USE_MOCK=false`; endpoints are listed in `README.md` |
| Add a role rule in the UI | `lib/auth.tsx` (`canAck`) — the real check must also be on the backend |

## 9. Other versions in your downloads
`gpu-dashboard.html` (single-file mock UI) and `gpu-monitor/` (plain JavaScript version) are the earlier prototypes and are **not** part of this React project.

## 10. Ant Design notes
- Ant Design supplies Button, Card, Table, Select, Input, Form, Drawer, Menu, Badge, Tag, Alert, Switch, InputNumber, Skeleton. Tailwind classes remain only for layout (grid/flex/spacing) and the glass/blur helpers.
- Tailwind's preflight is **off** (`tailwind.config.ts`) because it overrides Ant Design button styles; a small reset lives at the top of `index.css`.
- Direction, language and dark mode reach Ant Design through `ConfigProvider` in `Providers.tsx`.
- Charts (Recharts) and icons (Lucide) are unchanged.

## 11. Spacing, light mode and speed — rules to keep
- **Spacing:** Ant Design resets `margin` on its components, so `mb-*`/`mt-*` on a `Card`, `Button`, `Alert` or `Table` has no effect. Space things with `gap` inside a flex/grid parent (`Page.tsx` already does this: `flex flex-col gap-4`).
- **Light mode:** card opacity is the `--glass-a` variable in `index.css` (`:root` = light, `.dark` = dark). Raise it for more solid cards; text greys are `--muted-foreground`.
- **Speed:** no `backdrop-filter` on scrolling surfaces (`.glass-bar` is near-opaque instead). The background animation pauses while scrolling (`components/Backdrop.tsx`). Judge speed with `npm run build && npm run preview`, not `npm run dev` (dev mode is much slower).
- **Menu button:** hidden on desktop by a wrapper `<span className="md:hidden">` in `Layout.tsx`; a display rule on the Ant Design button itself would override the hiding.
- **Hover / dropdown / tooltip colours:** set in `Providers.tsx` (`colorBgElevated`, `colorBgSpotlight`, `colorBgTextHover`, and the Table/Menu/Select hover tokens). Ant Design's defaults are near-black.

## GSAP animation rules (keep the login page smooth)
- GSAP (`gsap` package, own chunk in `vite.config.ts`) is used only on the login page: `LoginBrand.tsx` and `LoginIllustration.tsx`.
- Animate **transform and opacity only** (`x/y/scale/rotation/yPercent/scaleX`, SVG `strokeDashoffset`) — never width/height/top/left/blur/box-shadow.
- Run animations **once** (no endless loops); the brand clears its inline styles when finished so no GPU layers stay promoted.
- Everything is wrapped in `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, so users who prefer reduced motion get a static page.
- Brand text is split by **words**, never letters, so Persian letters stay joined.
- Pointer tilt uses `gsap.quickTo` (one reusable tween per property) and caches the element rectangle on pointer-enter.
