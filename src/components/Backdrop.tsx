import { useEffect } from 'react'

/**
 * Fixed, non-interactive animated background (three drifting colour blobs; styles in index.css).
 * The animation pauses while the page is scrolling so scrolling stays smooth.
 */
export function Backdrop() {
  useEffect(() => {
    const root = document.documentElement
    let timer: number | undefined
    const onScroll = () => {
      if (!root.dataset.scrolling) root.dataset.scrolling = '1'
      window.clearTimeout(timer)
      timer = window.setTimeout(() => { delete root.dataset.scrolling }, 150)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(timer); delete root.dataset.scrolling }
  }, [])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ contain: 'strict' }}>
      <div className="blob blob-a" /><div className="blob blob-b" /><div className="blob blob-c" />
    </div>
  )
}
