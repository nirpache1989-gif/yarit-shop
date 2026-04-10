/**
 * @file StaggeredReveal — reveal a list of children one after another
 * @summary Renders a wrapper element whose direct children each get
 *          `data-reveal` + a `--reveal-delay` CSS custom property
 *          incremented by `stagger` ms per child. Pair with the
 *          `[data-reveal]` CSS in `src/app/globals.css`.
 *
 *          Important: this component clones each child via
 *          `React.cloneElement` to inject the `data-*` attributes
 *          and the inline `--reveal-delay`. Every direct child MUST
 *          be a valid React element (not a raw string / number /
 *          fragment). For lists coming from `.map()`, that's the
 *          default shape — no change needed.
 *
 *          Usage:
 *              <StaggeredReveal stagger={80}>
 *                {products.map((p) => (
 *                  <ProductCard key={p.id} product={p} />
 *                ))}
 *              </StaggeredReveal>
 *
 *          Why not just wrap each child in <Reveal>? Because
 *          `useInView` instantiates an IntersectionObserver per hook
 *          call. A list of 48 products would spin up 48 observers
 *          and waste a noticeable amount of main-thread time. This
 *          component uses ONE observer (on the wrapper) and then
 *          just staggers the CSS delay per child — same visual
 *          result, ~1/48th the work.
 */
'use client'

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useInView } from '@/lib/motion/useInView'

type Direction = 'up' | 'start'

type Props = {
  children: ReactNode
  /** Milliseconds between each child's reveal. Default: 80. */
  stagger?: number
  /** Optional base delay applied to ALL children before the
   *  per-child stagger. Default: 0. */
  baseDelay?: number
  /** Direction of each child's reveal. Default: 'up'. */
  direction?: Direction
  /** Outer wrapper tag. Default: 'div'. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

// Minimum shape React needs to pass through data-* attrs + inline
// style without TypeScript panicking about unknown element types.
type InjectableProps = {
  'data-reveal'?: Direction
  'data-revealed'?: 'true'
  style?: CSSProperties
}

export function StaggeredReveal({
  children,
  stagger = 80,
  baseDelay = 0,
  direction = 'up',
  as: Tag = 'div',
  className,
  style,
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()

  let visibleIndex = 0
  const enriched = Children.map(children, (child) => {
    if (!isValidElement(child)) return child
    const idx = visibleIndex++
    const delay = baseDelay + idx * stagger
    const typed = child as ReactElement<InjectableProps>
    const prevStyle = typed.props.style ?? {}
    return cloneElement(typed, {
      'data-reveal': direction,
      'data-revealed': inView ? 'true' : undefined,
      style: {
        ...prevStyle,
        ['--reveal-delay' as string]: `${delay}ms`,
      } as CSSProperties,
    })
  })

  return (
    <Tag ref={ref} className={className} style={style}>
      {enriched}
    </Tag>
  )
}
