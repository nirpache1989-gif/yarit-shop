/**
 * @file KenBurns — slow zoom-and-drift wrapper for a background image
 * @summary Applies a subtle cinematic loop to its first child (usually
 *          a <next/image> or an <img>). The child gets the
 *          `.ken-burns` CSS class which is defined in globals.css —
 *          this component just picks the variant + ensures the child
 *          is absolutely positioned under its parent so the scale
 *          doesn't shove surrounding layout.
 *
 *          Usage:
 *              <div className="relative overflow-hidden">
 *                <KenBurns variant="tl">
 *                  <Image src="/brand/ai/hero-bg-wash.jpg" fill ... />
 *                </KenBurns>
 *                // foreground content
 *              </div>
 *
 *          Variants (drift origin → direction):
 *            'tl' — top-left (default, nudges down+right)
 *            'tr' — top-right
 *            'bl' — bottom-left
 *            'br' — bottom-right
 *
 *          The actual keyframes + durations are in globals.css so
 *          tuning the speed is a one-file change.
 *
 *          `prefers-reduced-motion` is handled in globals.css via
 *          the final guard block — motion stops entirely, layout is
 *          preserved.
 */
'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'tl' | 'tr' | 'bl' | 'br'

type Props = {
  children: ReactNode
  variant?: Variant
  className?: string
}

const VARIANT_CLASS: Record<Variant, string> = {
  tl: 'ken-burns',
  tr: 'ken-burns ken-burns--tr',
  bl: 'ken-burns ken-burns--bl',
  br: 'ken-burns ken-burns--br',
}

export function KenBurns({ children, variant = 'tl', className }: Props) {
  return (
    <div className={cn('absolute inset-0', VARIANT_CLASS[variant], className)}>
      {children}
    </div>
  )
}
