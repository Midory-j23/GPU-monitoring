import { useRef, type PointerEvent } from 'react'

/** Login artwork (laptop + user icon), drawn as SVG in the project's colours; tilts toward the pointer like the original design. */
export function LoginIllustration() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const move = (e: PointerEvent) => {
    const el = ref.current
    if (!el || reduce) return
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / (r.width || 1), py = (e.clientY - r.top) / (r.height || 1)
    el.style.transform = `perspective(1000px) rotateX(${(10 - py * 20).toFixed(2)}deg) rotateY(${(px * 20 - 10).toFixed(2)}deg) scale3d(1.08,1.08,1.08)`
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  const P = 'hsl(var(--primary))', OK = 'hsl(var(--ok))'
  return (
    <div ref={ref} className="lg-tilt" onPointerMove={move} onPointerLeave={leave} aria-hidden="true">
      <svg viewBox="0 0 316 289" width="100%" style={{ display: 'block' }}>
        <circle cx="160" cy="145" r="130" fill="hsl(var(--primary) / .10)" />
        <rect x="78" y="97" width="155" height="111" rx="10" fill="hsl(var(--muted))" />
        <rect x="88" y="106" width="135" height="92" rx="3" fill="hsl(var(--background))" />
        <circle cx="155" cy="137" r="13" fill="none" stroke={P} strokeWidth="2.5" />
        <path d="M131 174c0-9.500 10.700-17 24-17s24 7.500 24 17z" fill="none" stroke={P} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="60" y="208" width="191" height="12" rx="5" fill="hsl(var(--muted))" />
        <rect x="138" y="208" width="34" height="6" rx="3" fill="hsl(var(--border))" />
        <circle cx="20" cy="67" r="8" fill="none" stroke={P} strokeWidth="3" />
        <circle cx="282" cy="270" r="4" fill="none" stroke={P} strokeWidth="2.500" />
        <path d="M298 77l14 8-14 8z" fill="none" stroke={OK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 264l7-13 7 13z" fill="none" stroke={OK} strokeWidth="2" strokeLinejoin="round" />
        <rect x="240" y="5" width="10" height="10" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      </svg>
    </div>
  )
}
