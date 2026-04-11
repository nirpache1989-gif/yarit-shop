/**
 * @file ShopGridFlip — GSAP Flip-powered product grid for /shop
 * @summary Tier-1 GSAP upgrade T1.6. Wraps the `/shop` product grid
 *          in a client component that watches the URL query string
 *          (`searchParams`) and, whenever the filter changes, smoothly
 *          animates the cards from their old layout positions to the
 *          new layout positions via GSAP's Flip plugin. Cards that
 *          stay in both states interpolate their position/size;
 *          cards that disappear fade out; new cards fade in.
 *
 *          First render (no previous state to diff against): a simple
 *          stagger fade-up on every card, same rhythm as the old
 *          `StaggeredReveal` it replaces.
 *
 *          Reduced-motion bypass: returns a plain grid with no Flip
 *          logic, no refs, no tweens at all. The cards hard-cut between
 *          filter states — identical to the pre-GSAP baseline.
 *
 *          Touch / tilt interference: the cards inside the grid are
 *          `ProductCard` → `ProductCardMotion` which attaches
 *          pointermove listeners that write `rotationX / rotationY`
 *          via GSAP. If a card is mid-tilt when a filter changes, the
 *          Flip animation will fight the tilt. Mitigation: immediately
 *          before every `Flip.from` call we reset tilt transforms on
 *          every `.product-card` in the grid via a `gsap.set`. The
 *          tilt picks up again on the next pointermove event naturally.
 */
'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import { gsap, Flip } from '@/lib/motion/gsap'
import { useGsapReducedMotion } from '@/lib/motion/useGsapReducedMotion'
import {
  ProductCard,
  type ProductCardData,
} from '@/components/product/ProductCard'
import type { Locale } from '@/lib/i18n/routing'

type Props = {
  products: ProductCardData[]
  locale: Locale
}

export function ShopGridFlip({ products, locale }: Props) {
  const reduced = useGsapReducedMotion()
  const gridRef = useRef<HTMLDivElement>(null)
  // The previous Flip state — captured from the CURRENT DOM before
  // React re-renders with the new `products` prop. `Flip.from(prev)`
  // then interpolates between the captured state and the committed
  // new layout. React 19's useLayoutEffect cleanup runs BEFORE the
  // next render's commit, so capturing in cleanup gives us the
  // "before" snapshot we need.
  const prevStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const hasRenderedOnceRef = useRef(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  // `filterKey` changes whenever any URL query param flips. That's
  // the signal for "the grid content may have changed — consider
  // playing a Flip tween".
  const filterKey = `${pathname}?${searchParams.toString()}`

  // ─── First-render entrance stagger ───────────────────────────────
  // Runs once, on mount only. Every card fades up from y: 24 with a
  // small stagger. Skipped entirely under reduced motion (the early
  // return on line below handles that branch — this useGSAP never
  // runs because the whole component returns a plain grid first).
  useGSAP(
    () => {
      if (!gridRef.current) return
      gsap.from(gridRef.current.children, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
      })
      hasRenderedOnceRef.current = true
    },
    { scope: gridRef, dependencies: [] },
  )

  // ─── Filter-change Flip ──────────────────────────────────────────
  // Two layout effects — one captures "before" state in CLEANUP (which
  // runs synchronously before the next render commit), the other plays
  // the Flip in the NEXT render's effect body. This is the canonical
  // React + GSAP Flip pattern from the @gsap/react docs.
  useLayoutEffect(() => {
    // Skip until we've finished the first-render stagger entrance.
    // On mount, the cleanup would capture a state that Flip then
    // tries to "play from" — we don't want that.
    if (!hasRenderedOnceRef.current) return
    // Copy the ref value into a local for the cleanup closure to
    // satisfy React's exhaustive-deps lint — the ref is guaranteed
    // stable within a single render cycle, so reading it once at
    // effect-body time is equivalent to reading it in the cleanup
    // but makes the dependency relationship obvious to the linter.
    const grid = gridRef.current
    return () => {
      if (!grid) return
      // Capture the CURRENT DOM state — this runs before React's
      // next render commits the new product list.
      prevStateRef.current = Flip.getState(
        grid.querySelectorAll('[data-shop-card]'),
        { props: 'opacity,borderRadius' },
      )
    }
  }, [filterKey])

  useLayoutEffect(() => {
    if (!hasRenderedOnceRef.current) return
    const prev = prevStateRef.current
    if (!prev || !gridRef.current) return

    // Reset any in-flight ProductCardMotion tilt transforms so the
    // Flip reflow doesn't fight them. The cards pick up tilt again
    // on the next pointer event naturally.
    gsap.set(gridRef.current.querySelectorAll('.product-card'), {
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      clearProps: 'transform',
    })

    Flip.from(prev, {
      duration: 0.7,
      ease: 'power2.inOut',
      absolute: true,
      // Cards that didn't exist in the previous state — fade + scale in.
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        ),
      // Cards that existed before but not now — fade + scale out.
      onLeave: (els) =>
        gsap.to(els, {
          opacity: 0,
          scale: 0.96,
          duration: 0.4,
          ease: 'power2.in',
        }),
    })
    prevStateRef.current = null
  }, [filterKey])

  // Reduced motion path: plain grid, no refs, no Flip. Hard cut
  // between filter states. Matches the pre-GSAP baseline exactly.
  if (reduced) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <div key={p.id} data-shop-card>
            <ProductCard product={p} locale={locale} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {products.map((p) => (
        <div key={p.id} data-shop-card>
          <ProductCard product={p} locale={locale} />
        </div>
      ))}
    </div>
  )
}
