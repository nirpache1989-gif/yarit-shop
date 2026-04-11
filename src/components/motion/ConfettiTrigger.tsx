/**
 * @file ConfettiTrigger — brand-palette confetti helper
 * @summary Thin wrapper around `canvas-confetti` (already installed,
 *          used by the admin fulfillment dashboard) with Copaia
 *          brand defaults baked in. Storefront sites should reach
 *          for THIS module, not import `canvas-confetti` directly,
 *          so the visual language stays consistent across every
 *          confetti burst.
 *
 *          Brand palette (from src/brand.config.ts):
 *            sage      #2d4f3e (primary)
 *            jade      #0e5e3e (accent)
 *            ochre     #8b5a2b (accent-deep)
 *            parchment #f6efdc (background)
 *            cream     #fdf8e8 (surface-warm)
 *
 *          The preset deliberately leaves out bright saturated tones
 *          — the brief is "minimalist-luxurious, no loud colors".
 *
 *          Three presets:
 *            'subtle'  — 25 particles, tight spread. Used by
 *                        AddToCartButton on a single add.
 *            'cta'     — 60 particles, wider spread. Used by the
 *                        product-detail add-to-cart button.
 *            'success' — 150 particles, widest spread, two origin
 *                        bursts. Used by /checkout/success on mount.
 *
 *          Dynamically imports canvas-confetti so the ~6kb payload
 *          is only fetched the first time confetti fires — not at
 *          page load.
 */
'use client'

type Preset = 'subtle' | 'cta' | 'success'

const BRAND_COLORS = ['#2d4f3e', '#0e5e3e', '#8b5a2b', '#f6efdc', '#fdf8e8']

const PRESETS: Record<
  Preset,
  {
    particleCount: number
    spread: number
    startVelocity: number
    scalar: number
    ticks: number
  }
> = {
  subtle: {
    particleCount: 25,
    spread: 45,
    startVelocity: 22,
    scalar: 0.75,
    ticks: 110,
  },
  cta: {
    particleCount: 60,
    spread: 70,
    startVelocity: 30,
    scalar: 0.85,
    ticks: 160,
  },
  success: {
    particleCount: 150,
    spread: 90,
    startVelocity: 38,
    scalar: 0.95,
    ticks: 220,
  },
}

/**
 * Fire a brand-palette confetti burst. Safe to call from any client
 * event handler; no-ops under `prefers-reduced-motion` (we respect
 * the OS setting even though canvas-confetti itself has no such
 * hook).
 */
export async function fireConfetti(
  preset: Preset = 'subtle',
  origin?: { x: number; y: number },
): Promise<void> {
  if (typeof window === 'undefined') return
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  try {
    const mod = await import('canvas-confetti')
    const confetti = mod.default
    const config = PRESETS[preset]
    const baseOrigin = origin ?? { x: 0.5, y: 0.6 }

    confetti({
      ...config,
      origin: baseOrigin,
      colors: BRAND_COLORS,
      disableForReducedMotion: true,
    })

    // 'success' preset: fire a second burst from the opposite side
    // 100ms later for a wider-feeling celebration.
    if (preset === 'success') {
      setTimeout(() => {
        confetti({
          ...config,
          origin: { x: 1 - baseOrigin.x, y: baseOrigin.y },
          colors: BRAND_COLORS,
          disableForReducedMotion: true,
        })
      }, 120)
    }
  } catch {
    // canvas-confetti failed to load — not a fatal error, just skip
    // the celebration. The actual action (cart add, order placed,
    // etc.) has already succeeded.
  }
}
