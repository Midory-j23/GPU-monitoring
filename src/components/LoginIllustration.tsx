import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'

/**
 * Login artwork: a laptop whose screen shows a monitoring (pulse) chart, drawn as SVG in the project's colours.
 * GSAP is used for (1) drawing the pulse line once and (2) a smooth pointer tilt (gsap.quickTo = one reusable tween
 * per property, rect cached on enter, transforms only). Nothing runs when the user prefers reduced motion.
 */
export function LoginIllustration() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.lg-pulse', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.5 })
      gsap.from('.lg-pulse-dot', { scale: 0, svgOrigin: '213 152', duration: 0.4, delay: 1.8, ease: 'back.out(3)' })
      gsap.set(el, { transformPerspective: 1000 })
      const opts = { duration: 0.5, ease: 'power3.out' }
      const rx = gsap.quickTo(el, 'rotationX', opts), ry = gsap.quickTo(el, 'rotationY', opts), sc = gsap.quickTo(el, 'scale', opts)
      let rect: DOMRect | null = null
      const enter = () => { rect = el.getBoundingClientRect(); sc(1.06) }
      const move = (e: PointerEvent) => {
        rect = rect ?? el.getBoundingClientRect()
        rx(10 - ((e.clientY - rect.top) / (rect.height || 1)) * 20)
        ry(((e.clientX - rect.left) / (rect.width || 1)) * 20 - 10)
      }
      const leave = () => { rect = null; rx(0); ry(0); sc(1) }
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointermove', move, { passive: true })
      el.addEventListener('pointerleave', leave)
      return () => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
    }, el)
    return () => mm.revert()
  }, [])

  const P = 'hsl(var(--primary))', OK = 'hsl(var(--ok))'
  return (
    <div ref={ref} className="lg-tilt" aria-hidden="true">
      <svg viewBox="0 0 316 289" width="100%" style={{ display: 'block' }}>
        <circle cx="160" cy="145" r="130" fill="hsl(var(--primary) / .10)" />
        <rect x="78" y="97" width="155" height="111" rx="10" fill="hsl(var(--muted))" />
        <rect x="88" y="106" width="135" height="92" rx="3" fill="hsl(var(--background))" />
        {/* monitoring chart: faint grid, live dot, pulse line */}
        <path d="M98 126h115M98 152h115M98 178h115" stroke="hsl(var(--muted-foreground))" strokeOpacity=".18" strokeWidth="1" fill="none" />
        <circle cx="99" cy="115" r="3" fill={OK} />
        <path className="lg-pulse" d="M98 152h24l12-30 16 58 13-46 9 18h41" pathLength={1} fill="none" stroke={P} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: '1 1' }} />
        <circle className="lg-pulse-dot" cx="213" cy="152" r="4" fill={OK} />
        <rect x="60" y="208" width="191" height="12" rx="5" fill="hsl(var(--muted))" />
        <rect x="138" y="208" width="34" height="6" rx="3" fill="hsl(var(--border))" />
        <circle cx="20" cy="67" r="8" fill="none" stroke={P} strokeWidth="3" />
        <circle cx="282" cy="270" r="4" fill="none" stroke={P} strokeWidth="2.5" />
        <path d="M298 77l14 8-14 8z" fill="none" stroke={OK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M4 264l7-13 7 13z" fill="none" stroke={OK} strokeWidth="2" strokeLinejoin="round" />
        <rect x="240" y="5" width="10" height="10" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      </svg>
    </div>
  )
}
