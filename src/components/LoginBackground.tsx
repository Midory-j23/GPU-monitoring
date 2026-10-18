/**
 * Login page background, drawn with CSS only (no image file): deep navy gradient, a soft grid,
 * faint rings and three slowly drifting colour glows in the project colours. Styles: `.lg-bg*` in pages/login.css.
 */
export function LoginBackground() {
  return (
    <div className="lg-bg" aria-hidden="true">
      <div className="lg-orb lg-orb-a" /><div className="lg-orb lg-orb-b" /><div className="lg-orb lg-orb-c" />
      <div className="lg-grid" />
      <div className="lg-ring lg-ring-1" /><div className="lg-ring lg-ring-2" />
      <div className="lg-vignette" />
    </div>
  )
}
