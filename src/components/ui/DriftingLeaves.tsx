/**
 * @file DriftingLeaves — decorative animated background layer
 * @summary 5 SVG sage leaves that slowly drift + rotate in place.
 *          Mounted directly under <body> in the storefront layout,
 *          BEFORE the main content, so it sits at the very bottom
 *          of the z-stack.
 *
 *          Accessibility + performance:
 *            - pointer-events: none — clicks pass through
 *            - aria-hidden — invisible to screen readers
 *            - Only transform + opacity are animated (GPU-composited)
 *            - 5 leaves max — observed sweet spot, 8+ frame drops
 *            - will-change: transform — hints compositor layer
 *            - @media (prefers-reduced-motion: reduce) disables it
 *
 *          In dark mode leaves switch from marine-forest to luminous
 *          jade (via --color-accent) and gain a subtle drop-shadow
 *          glow — see the [data-theme="dark"] .drifting-leaves block
 *          in src/app/globals.css.
 *
 *          NOT mounted in the admin (<AdminThemeInit> is the only
 *          theme infrastructure there — the admin is content-dense
 *          and drifting leaves behind forms would be distracting).
 *
 *          See: plan §Track Y.
 */
export function DriftingLeaves() {
  return (
    <div className="drifting-leaves" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`leaf leaf--${i}`}
          viewBox="0 0 40 60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 2 C 6 12, 2 30, 10 50 C 14 58, 26 58, 30 50 C 38 30, 34 12, 20 2 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M20 4 L 20 54"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.35"
            fill="none"
          />
        </svg>
      ))}
    </div>
  )
}
