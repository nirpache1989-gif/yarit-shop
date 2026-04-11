/**
 * @file ProductGalleryMotion — product detail page image gallery with hover zoom + thumb Flip
 * @summary Tier-1 GSAP upgrade T1.7. Takes the resolved product
 *          images + title from the server parent and owns the main
 *          image viewport + thumbnail row + all the motion on them.
 *
 *          Two motion behaviors:
 *            1. Hover zoom on the main image. On pointerenter, the
 *               inner `<img>` scales from 1 → 1.12 over 900ms with
 *               `power2.out`. On pointerleave, back to 1 over 700ms.
 *               Skipped entirely on touch devices (no `hover: hover`)
 *               and on reduced-motion preference.
 *            2. Thumb click → Flip morph into main slot. The thumb's
 *               position/size state is captured via `Flip.getState`,
 *               React updates the active index, then on the next
 *               layout effect we `Flip.from(state, {...})` to
 *               smoothly interpolate the thumb image into the main
 *               image's position.
 *
 *          Server/client split: the product detail page is a server
 *          component that fetches the product from Payload and
 *          resolves the static image overrides. It hands a plain
 *          `{url, alt}[]` array + the title string down to this
 *          client component. No function props cross the boundary.
 *
 *          Single `data-gallery-image` attribute at a time — the
 *          active main image slot. Thumbs use `data-gallery-thumb`
 *          so Flip selectors can target them explicitly.
 *
 *          Reduced motion: both the hover zoom and the thumb Flip
 *          are skipped. The user just sees instant state changes.
 */
'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { gsap, Flip } from '@/lib/motion/gsap'
import { useGsapReducedMotion } from '@/lib/motion/useGsapReducedMotion'

type GalleryImage = { url: string; alt: string }

type Props = {
  images: GalleryImage[]
  title: string
}

// `(hover: hover)` matchMedia subscription — same shape as
// `useGsapReducedMotion`. Returns `false` on the server so SSR and
// first-paint agree, and flips to `true` after hydration on devices
// that report hover support. Lives at module scope so both the
// subscribe and snapshot functions can reuse the same query.
const HOVER_QUERY = '(hover: hover)'

function subscribeHover(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {
      /* noop */
    }
  }
  const mql = window.matchMedia(HOVER_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
function getHoverSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(HOVER_QUERY).matches
}
function getHoverServerSnapshot(): boolean {
  return false
}

export function ProductGalleryMotion({ images, title }: Props) {
  const t = useTranslations('product')
  const reduced = useGsapReducedMotion()
  // Touch / hover support — captured via useSyncExternalStore so the
  // value stays in sync with live matchMedia changes and avoids the
  // react-hooks/set-state-in-effect lint rule. SSR returns false;
  // after hydration, flips to the real browser capability.
  const hasHover = useSyncExternalStore(
    subscribeHover,
    getHoverSnapshot,
    getHoverServerSnapshot,
  )

  const [activeIdx, setActiveIdx] = useState(0)
  const mainRef = useRef<HTMLDivElement>(null)
  // Previous Flip state captured when the user clicks a thumb —
  // replayed on the next render to morph the previous main into
  // the new one.
  const pendingFlipRef = useRef<ReturnType<typeof Flip.getState> | null>(null)

  // ─── Hover zoom on the main image ────────────────────────────────
  useEffect(() => {
    if (reduced || !hasHover) return
    const el = mainRef.current
    if (!el) return
    const img = el.querySelector('[data-gallery-image] img') as
      | HTMLImageElement
      | null
    if (!img) return

    const onEnter = () => {
      gsap.to(img, {
        scale: 1.12,
        duration: 0.9,
        ease: 'power2.out',
      })
    }
    const onLeave = () => {
      gsap.to(img, {
        scale: 1,
        duration: 0.7,
        ease: 'power2.out',
      })
    }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      // Kill any in-flight zoom tweens on cleanup so the next mount
      // starts from a clean transform.
      gsap.killTweensOf(img)
    }
    // Re-bind the listeners when the active image changes — the
    // target `img` element inside `[data-gallery-image]` is replaced
    // by React when `activeIdx` flips, so the cached `img` reference
    // would be stale otherwise.
  }, [reduced, hasHover, activeIdx])

  // ─── Thumb-click Flip play (runs after React commits the new main) ──
  useLayoutEffect(() => {
    const state = pendingFlipRef.current
    if (!state) return
    pendingFlipRef.current = null
    Flip.from(state, {
      duration: 0.7,
      ease: 'power2.inOut',
      absolute: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
        ),
      onLeave: (els) =>
        gsap.to(els, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        }),
    })
  }, [activeIdx])

  const onThumbClick = (idx: number) => {
    if (idx === activeIdx) return
    if (reduced) {
      setActiveIdx(idx)
      return
    }
    // Capture the current main image state BEFORE React re-renders
    // with the new active index. The useLayoutEffect above will
    // consume this pending state on the next commit.
    pendingFlipRef.current = Flip.getState('[data-gallery-image]', {
      props: 'borderRadius,backgroundColor',
    })
    setActiveIdx(idx)
  }

  const active = images[activeIdx]
  const hasMultiple = images.length >= 2

  // If there are no images, render a minimal placeholder that still
  // keeps the layout stable (same aspect ratio as the real slot).
  if (!active) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-brand)] overflow-hidden flex items-center justify-center text-[var(--color-muted)]">
          —
        </div>
      </div>
    )
  }

  return (
    <div ref={mainRef} className="space-y-4">
      <div
        data-gallery-image
        role="img"
        aria-label={t('galleryMainLabel')}
        className="group product-card relative aspect-square rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-brand)] overflow-hidden"
      >
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt || title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="product-image object-contain p-6"
        />
      </div>
      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={i}
                type="button"
                data-gallery-thumb
                aria-label={t('galleryThumbLabel', { index: i + 1 })}
                aria-pressed={isActive}
                onClick={() => onThumbClick(i)}
                className={
                  'relative aspect-square rounded-lg bg-[var(--color-surface)] border overflow-hidden transition-all duration-300 cursor-pointer ' +
                  (isActive
                    ? 'border-[var(--color-primary)]/60 ring-2 ring-[var(--color-primary)]/20'
                    : 'border-[var(--color-border-brand)] hover:border-[var(--color-primary)]/40 hover:scale-[1.03]')
                }
              >
                <Image
                  src={img.url}
                  alt={img.alt || title}
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
