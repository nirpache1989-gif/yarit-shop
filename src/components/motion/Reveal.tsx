/**
 * @file Reveal — scroll-triggered fade/slide wrapper
 * @summary Drop-in wrapper that reveals its children once the
 *          element enters the viewport. Pairs with the `[data-reveal]`
 *          CSS rules in `src/app/globals.css` which own the actual
 *          keyframes.
 *
 *          Usage:
 *              <Reveal>
 *                <h1>This fades up on scroll</h1>
 *              </Reveal>
 *
 *              <Reveal direction="start" delay={200}>
 *                <p>This slides in from the start edge (RTL-aware)
 *                with a 200ms delay.</p>
 *              </Reveal>
 *
 *              <Reveal as="section" delay={400}>
 *                <div>...</div>
 *              </Reveal>
 *
 *          `prefers-reduced-motion` is handled inside useInView and
 *          reinforced by the global guard in globals.css — so this
 *          component Just Works for accessibility.
 */
'use client'

import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '@/lib/motion/useInView'

type Direction = 'up' | 'start'

type Props = {
  children: ReactNode
  /** Which way the content enters. 'up' slides vertically, 'start'
   *  slides from the RTL-aware start edge. Default: 'up'. */
  direction?: Direction
  /** Delay in ms before the animation starts after entering view.
   *  Default: 0. */
  delay?: number
  /** Element tag to render. Default: 'div'. */
  as?: ElementType
  /** Passed straight through. */
  className?: string
  /** Passed straight through. */
  style?: CSSProperties
}

export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  as: Tag = 'div',
  className,
  style,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref}
      data-reveal={direction}
      data-revealed={inView ? 'true' : undefined}
      className={className}
      style={
        delay
          ? ({
              ...(style ?? {}),
              ['--reveal-delay' as string]: `${delay}ms`,
            } as CSSProperties)
          : style
      }
    >
      {children}
    </Tag>
  )
}
