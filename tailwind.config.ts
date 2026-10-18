import type { Config } from 'tailwindcss'
const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`
export default {
  darkMode: ['class'],
  corePlugins: { preflight: false }, // Ant Design brings its own reset; Tailwind is used for spacing/grid utilities only
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: c('border'), background: c('background'), foreground: c('foreground'), card: c('card'),
        muted: { DEFAULT: c('muted'), foreground: c('muted-foreground') },
        primary: { DEFAULT: c('primary'), foreground: c('primary-foreground') },
        ok: c('ok'), warn: c('warn'), crit: c('crit'), na: c('na'),
      },
    },
  },
} satisfies Config
