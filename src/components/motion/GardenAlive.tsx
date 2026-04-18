/**
 * @file GardenAlive — Living Garden global motion layer
 * @summary A single client-mounted component that provides four
 *          ambient motion effects across the storefront:
 *
 *          1. Cursor spotlight (.g-cursor-spot) — a fixed 360×360
 *             radial gradient div that follows the pointer with
 *             multiply blend for a warm ink-wash feel.
 *          2. Leaf trail (.g-leaves / .g-leaf) — on every
 *             pointermove (80ms throttle) we spawn one of the
 *             Unicode ornament glyphs `❦ ❀ ✿ ❧ ✾ ❣` at the cursor.
 *             Each glyph animates for 2.4s (CSS keyframes
 *             `g-leaf-fall`) and is removed from the DOM after 2.5s.
 *          3. Scroll vine (.g-scroll-vine) — a fixed SVG sinusoidal
 *             path on the right edge (left edge in RTL) whose
 *             stroke-dashoffset interpolates with scroll progress
 *             so the vine appears to "grow" as the user scrolls.
 *             18 leaf markers fade in along it as progress passes
 *             each marker's threshold.
 *          4. Card parallax — on pointermove over any element with
 *             class `.g-card` we write CSS custom properties
 *             `--mx / --my / --tx / --ty` onto the card so the
 *             existing CSS hover rule picks up the glow center and
 *             the perspective tilt (±6°).
 *
 *          Motion strategy per ADR-021: vanilla React + CSS custom
 *          properties for all four effects. GSAP is intentionally
 *          NOT used here — cursor-driven work is high-frequency
 *          and doesn't need a timeline abstraction, and we want
 *          the bundle for this layer to be React-only.
 *
 *          All motion gates behind `useGsapReducedMotion()`. When
 *          reduced motion is preferred the component returns
 *          `null` and attaches no listeners. The CSS
 *          `@media (prefers-reduced-motion: reduce)` block in
 *          globals.css is a belt-and-braces fallback in case the
 *          component is ever rendered without its JS running.
 *
 *          Mount once, ideally in the storefront root layout.
 *          Multiple mounts would each build their own vine + spawn
 *          redundant leaves.
 *
 *          See: docs/DESIGN-LIVING-GARDEN.md §9 "Signature alive
 *          layer", prototype at `New/handoff/design/LivingGarden/alive.js`.
 */
'use client'

import { useEffect, useRef } from 'react'
import { useGsapReducedMotion } from '@/lib/motion/useGsapReducedMotion'

const GLYPHS = ['❦', '❀', '✿', '❧', '✾', '❣'] as const
const LEAF_SPAWN_THROTTLE_MS = 80
const LEAF_LIFESPAN_MS = 2500
const VINE_PATH_LENGTH = 2400
const VINE_LEAF_COUNT = 18
const VINE_LEAF_SPACING = 130
const VINE_LEAF_OFFSET = 80

export function GardenAlive() {
  const reduced = useGsapReducedMotion()
  const leavesRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)
  const vinePathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (reduced) return

    const path = vinePathRef.current
    if (path) {
      // Sinusoidal vine — 48 quadratic Bezier segments oscillating
      // ±18px around the 24px centerline. Once per mount; cheap.
      let d = 'M24,0'
      for (let i = 0; i < 48; i++) {
        const y = i * 50
        const x = 24 + Math.sin(i * 0.5) * 18
        d += ` Q${x},${y - 25} 24,${y}`
      }
      path.setAttribute('d', d)
      path.setAttribute('stroke-dasharray', String(VINE_PATH_LENGTH))
      path.setAttribute('stroke-dashoffset', String(VINE_PATH_LENGTH))
    }

    let lastDrop = 0
    const timeouts = new Set<number>()

    const onMove = (e: PointerEvent) => {
      if (spotRef.current) {
        spotRef.current.style.left = `${e.clientX}px`
        spotRef.current.style.top = `${e.clientY}px`
      }

      const now = performance.now()
      if (now - lastDrop > LEAF_SPAWN_THROTTLE_MS && leavesRef.current) {
        lastDrop = now
        const hue = Math.random() > 0.5 ? 'leaf' : 'ember'
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!
        const el = document.createElement('span')
        el.className = `g-leaf g-leaf-${hue}`
        el.textContent = glyph
        const size = 14 + Math.random() * 18
        const drift = (Math.random() - 0.5) * 140
        const rot = (Math.random() - 0.5) * 80
        el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;font-size:${size}px;--drift:${drift}px;--rot:${rot}deg;`
        leavesRef.current.appendChild(el)
        const id = window.setTimeout(() => {
          el.remove()
          timeouts.delete(id)
        }, LEAF_LIFESPAN_MS)
        timeouts.add(id)
      }

      // Card parallax — writes CSS custom props onto the hovered
      // .g-card so the existing CSS hover rule picks them up.
      const target = e.target as Element | null
      const card = target?.closest?.('.g-card')
      if (card instanceof HTMLElement) {
        const r = card.getBoundingClientRect()
        const px = e.clientX - r.left
        const py = e.clientY - r.top
        card.style.setProperty('--mx', `${px}px`)
        card.style.setProperty('--my', `${py}px`)
        const tiltX = (py / r.height - 0.5) * -6
        const tiltY = (px / r.width - 0.5) * 6
        card.style.setProperty('--tx', `${tiltX}deg`)
        card.style.setProperty('--ty', `${tiltY}deg`)
      }
    }

    const onScroll = () => {
      if (!path) return
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight)
      const prog = Math.min(1, (window.scrollY / max) * 1.5)
      path.setAttribute('stroke-dashoffset', String((1 - prog) * VINE_PATH_LENGTH))
      document
        .querySelectorAll<SVGGElement>('#g-vine-leaves > g')
        .forEach((l) => {
          const t = Number(l.dataset.threshold ?? '0')
          l.setAttribute('opacity', prog * VINE_PATH_LENGTH > t + 40 ? '0.95' : '0')
        })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      timeouts.forEach((id) => window.clearTimeout(id))
      timeouts.clear()
    }
  }, [reduced])

  if (reduced) return null

  return (
    <>
      <div ref={spotRef} className="g-cursor-spot" aria-hidden="true" />
      <div ref={leavesRef} className="g-leaves" aria-hidden="true" />
      <div className="g-scroll-vine" aria-hidden="true">
        <svg viewBox="0 0 48 2400" preserveAspectRatio="none">
          <path
            ref={vinePathRef}
            stroke="currentColor"
            fill="none"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <g id="g-vine-leaves">
            {Array.from({ length: VINE_LEAF_COUNT }, (_, i) => {
              const y = VINE_LEAF_OFFSET + i * VINE_LEAF_SPACING
              const side = i % 2 === 0 ? 1 : -1
              return (
                <g
                  key={i}
                  transform={`translate(24, ${y}) rotate(${side * 40})`}
                  opacity={0}
                  data-threshold={y}
                  style={{ transition: 'opacity 0.6s' }}
                >
                  <path
                    d={`M0,0 Q${side * 14},-10 ${side * 22},-2 Q${side * 14},8 0,0 Z`}
                    fill="currentColor"
                    opacity={0.85}
                  />
                  <circle r={2.4} fill="currentColor" />
                </g>
              )
            })}
          </g>
        </svg>
      </div>
    </>
  )
}
