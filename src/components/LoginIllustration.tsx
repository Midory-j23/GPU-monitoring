import { gsap } from 'gsap'
import { useLayoutEffect, useRef } from 'react'

/** One full sweep of the monitor trace, in seconds. */
const SWEEP = 3
/** Comet layers: trail = length as a fraction of the path (pathLength={1}); longest + softest first. */
const COMET = [
  { trail: 0.45, opacity: 0.16, width: 3 },
  { trail: 0.28, opacity: 0.38, width: 3 },
  { trail: 0.14, opacity: 1, width: 3.5 },
]
/** Dash gap — must be > 1 so exactly one comet segment is visible per layer. */
const GAP = 1.3

const PULSE_D = 'M98 152h24l12-30 16 58 13-46 9 18h41'

/**
 * Login artwork: a laptop whose screen shows a monitoring (pulse) chart, drawn as SVG in the project's colours.
 * GSAP drives (1) a one-off intro draw of the ECG line, then (2) an endless monitor sweep: a fading comet
 * retraces the line while the live ball rides its tip. One progress value drives BOTH the comet dashes and the
 * ball's cx/cy (via getPointAtLength), so they can never desync — and the pulse system uses zero transforms,
 * so the ball always sits exactly on the line and the halo stays centred. A pointer tilt (gsap.quickTo) is kept
 * on top. Nothing runs when the user prefers reduced motion (they get the finished static artwork).
 */
export function LoginIllustration() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trace = el.querySelector<SVGPathElement>('.lg-pulse')
      const dot = el.querySelector<SVGCircleElement>('.lg-pulse-dot')
      const halo = el.querySelector<SVGCircleElement>('.lg-pulse-halo')
      const sweepsG = el.querySelector<SVGGElement>('.lg-pulse-sweeps')
      const headG = el.querySelector<SVGGElement>('.lg-pulse-head')
      const sweeps = Array.from(el.querySelectorAll<SVGPathElement>('.lg-pulse-sweep'))
      if (!trace || !dot || !halo || !sweepsG || !headG) return

      // Each comet layer's trail length, read from data-trail.
      const trailOf = new Map(sweeps.map(s => [s, Number(s.dataset.trail ?? 0)]))
      // TRUE geometric length — the pathLength={1} attribute only affects dashing, never geometry.
      const len = trace.getTotalLength()

      // Single source of truth: one progress value p (0..1) drives the comet dash heads AND the ball.
      // Positions are written as cx/cy + stroke-dashoffset — no transforms anywhere, so the ball is
      // glued to the line and the halo is always centred on it.
      const state = { p: 0 }
      const place = () => {
        const pt = trace.getPointAtLength(state.p * len)
        for (const s of sweeps) s.style.strokeDashoffset = String(trailOf.get(s)! - state.p)
        dot.setAttribute('cx', String(pt.x))
        dot.setAttribute('cy', String(pt.y))
        halo.setAttribute('cx', String(pt.x))
        halo.setAttribute('cy', String(pt.y))
      }

      // Heartbeat glow: animates the radius attribute (not scale), so it stays perfectly centred on the ball.
      const throb = gsap.to(halo, { attr: { r: 13 }, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true })

      const tl = gsap.timeline({ delay: 0.5 })
      // Intro: draw the ECG line once, then dim it into a "history" trace...
      tl.fromTo(trace, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
        .to(trace, { opacity: 0.35, duration: 0.5 }, '+=0.15')
        // ...then reveal the live layers and start the endless sweep.
        .set([sweepsG, headG], { opacity: 1 })
        .fromTo(dot, { attr: { r: 0 } }, { attr: { r: 4 }, duration: 0.35, ease: 'back.out(3)' }, '<')
        .add(() => throb.play(), '<')
        .to(state, { p: 1, duration: SWEEP, ease: 'none', repeat: -1, onUpdate: place }, '<')

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
        {/* monitoring chart: faint grid, live status dot, ECG trace */}
        <path d="M98 126h115M98 152h115M98 178h115" stroke="hsl(var(--muted-foreground))" strokeOpacity=".18" strokeWidth="1" fill="none" />
        <circle cx="99" cy="115" r="3" fill={OK} />
        {/* history trace: drawn once on load, then dimmed while the live sweep retraces it */}
        <path className="lg-pulse" d={PULSE_D} pathLength={1} fill="none" stroke={P} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: '1 1' }} />
        {/* comet layers: soft tail -> bright head, all sharing one progress value */}
        <g className="lg-pulse-sweeps" opacity={0}>
          {COMET.map(({ trail, opacity, width }, i) => (
            <path key={i} className="lg-pulse-sweep" data-trail={trail} d={PULSE_D} pathLength={1} fill="none" stroke={P} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${trail} ${GAP}`} strokeDashoffset={trail} opacity={opacity} />
          ))}
        </g>
        {/* live ball + heartbeat halo, positioned on the path geometry (no transforms) */}
        <g className="lg-pulse-head" opacity={0}>
          <circle className="lg-pulse-halo" cx="98" cy="152" r="9" fill={OK} opacity=".35" />
          <circle className="lg-pulse-dot" cx="98" cy="152" r="4" fill={OK} />
        </g>
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
