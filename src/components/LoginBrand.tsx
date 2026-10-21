import { gsap } from 'gsap'
import { Activity } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Brand lockup on the login box (icon + name + accent bar), animated once with GSAP.
 * Performance rules: only transform/opacity are animated, one short timeline, inline styles are cleared when it
 * finishes (releases GPU layers), and nothing runs when the user prefers reduced motion.
 * The name is split by WORDS (never letters) so Persian/Arabic letters stay joined.
 */
export function LoginBrand() {
  const { t, i18n } = useTranslation()
  const root = useRef<HTMLDivElement>(null)
  const words = t('brand').split(' ').filter(Boolean)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => { gsap.set(el.querySelectorAll('*'), { clearProps: 'transform,opacity' }) },
      })
      tl.from('.lg-brand-icon', { scale: 0.3, rotation: -75, opacity: 0, duration: 0.7, ease: 'back.out(1.7)' })
        .from('.lg-brand-word', { yPercent: 115, duration: 0.65, stagger: 0.09 }, 0.15)
        .from('.lg-brand-bar', { scaleX: 0, duration: 0.6 }, 0.45)
    }, el)
    return () => mm.revert()
  }, [i18n.language]) // plays again when the language is switched

  return (
    <div ref={root} className="lg-brand">
      <span className="lg-brand-icon"><Activity size={22} /></span>
      <span className="lg-brand-text">
        <span className="lg-brand-name">
          {words.map((w, i) => <span key={w + i} className="lg-brand-mask"><span className="lg-brand-word">{w}</span></span>)}
        </span>
        <span className="lg-brand-bar" />
      </span>
    </div>
  )
}
