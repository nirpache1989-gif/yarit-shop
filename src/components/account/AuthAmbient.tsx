/**
 * @file AuthAmbient — shared ambient background for auth pages
 * @summary Wave L wrapper used by /login, /forgot-password, and
 *          /reset-password. Adds a full-bleed night-garland layer
 *          that is visible in dark mode only (`hidden dark:block`),
 *          gently drifting under a slow Ken Burns loop. Light mode
 *          stays on the parchment + ambient-breathe gradient the
 *          storefront layout already provides.
 *
 *          The dark layer is positioned fixed so it covers the whole
 *          viewport behind the auth card, creating the "entering
 *          through a doorway" feeling the design brief calls for.
 *          Opacity is deliberately low (~22%) so the card stays the
 *          clear visual anchor.
 */
import Image from 'next/image'
import { KenBurns } from '@/components/motion/KenBurns'

export function AuthAmbient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden dark:block"
    >
      <KenBurns variant="tl">
        <Image
          src="/brand/ai/night/night-garland-3.jpg"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover opacity-[0.22]"
        />
      </KenBurns>
      {/* Soft vignette so the card has more contrast against the
          night image in the center of the viewport. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(12,18,14,0.55)_85%)]"
      />
    </div>
  )
}
