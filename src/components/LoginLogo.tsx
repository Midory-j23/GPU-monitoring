import { useRef, type PointerEvent } from 'react'

/** Padisar logo (public/padisar-logo.png) on a soft circle; tilts toward the pointer like the original login design. */
export function LoginLogo() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const move = (e: PointerEvent) => {
    const el = ref.current
    if (!el || reduce) return
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / (r.width || 1), py = (e.clientY - r.top) / (r.height || 1)
    el.style.transform = `perspective(1000px) rotateX(${(10 - py * 20).toFixed(2)}deg) rotateY(${(px * 20 - 10).toFixed(2)}deg) scale3d(1.06,1.06,1.06)`
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  return (
    <div ref={ref} className="lg-tilt lg-pic-bg" onPointerMove={move} onPointerLeave={leave}>
      <img className="lg-logo" src="/padisar-logo.png" alt="Padisar Informatics" />
    </div>
  )
}
