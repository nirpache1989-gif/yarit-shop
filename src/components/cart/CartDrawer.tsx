/**
 * @file CartDrawer — slide-in cart panel
 * @summary Appears from the inline-end edge when the user clicks the
 *          cart icon in the header. Shows each item, quantity controls,
 *          running subtotal, and a link to /cart and to /checkout.
 *
 *          All items are editable in-place (remove, +/-). Because the
 *          cart may be empty on first load (Zustand hasn't hydrated
 *          yet), we use a mounted flag to avoid hydration mismatches.
 */
'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCartStore, selectCartSubtotal } from '@/lib/cart/store'
import { useCartDrawerStore } from '@/components/cart/drawerStore'
import { Button } from '@/components/ui/Button'
import { formatILS } from '@/lib/format'

export function CartDrawer() {
  const t = useTranslations('cart')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const isOpen = useCartDrawerStore((s) => s.isOpen)
  const close = useCartDrawerStore((s) => s.close)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // ESC + body-scroll lock + focus trap + focus restore. One combined
  // effect so the teardown order is predictable (restore focus AFTER
  // the panel is hidden, not before).
  useEffect(() => {
    if (!isOpen) return

    // Remember who opened us so we can return focus there on close.
    previousFocusRef.current = document.activeElement as HTMLElement | null
    // Land focus on the close button (first thing in the tab order).
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus?.()
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={tNav('cart')}>
      {/* backdrop */}
      <button
        type="button"
        aria-label={tCommon('close')}
        onClick={close}
        className="absolute inset-0 bg-black/30"
      />
      {/* panel */}
      <aside
        ref={panelRef}
        className="absolute top-0 end-0 bottom-0 w-full sm:max-w-md bg-[var(--color-background)] border-s border-[var(--color-border-brand)] shadow-2xl flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-[var(--color-border-brand)]">
          <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
            {tNav('cart')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label={tCommon('close')}
            className="rounded-full p-2 hover:bg-[var(--color-surface-warm)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-[var(--color-muted)]">{t('empty')}</p>
            <Button href="/shop" variant="secondary" size="md">
              {t('browseShop')}
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-brand)]">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 p-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg bg-[var(--color-surface)] overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-primary-dark)] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatILS(item.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full border border-[var(--color-border-brand)] text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-warm)]"
                        aria-label={t('decreaseQty', { item: item.title })}
                      >
                        <span aria-hidden>−</span>
                      </button>
                      <span className="text-sm font-semibold min-w-[20px] text-center" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full border border-[var(--color-border-brand)] text-[var(--color-primary-dark)] hover:bg-[var(--color-surface-warm)]"
                        aria-label={t('increaseQty', { item: item.title })}
                      >
                        <span aria-hidden>+</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="ms-auto text-xs text-[var(--color-muted)] hover:text-[var(--color-accent-deep)]"
                        aria-label={t('removeFromCart', { item: item.title })}
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[var(--color-primary-dark)] whitespace-nowrap">
                    {formatILS(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            <footer className="p-4 border-t border-[var(--color-border-brand)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-muted)]">
                  {t('subtotal')}
                </span>
                <span className="text-xl font-bold text-[var(--color-primary-dark)]">
                  {formatILS(subtotal)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button href="/cart" variant="secondary" size="md">
                  {t('viewCart')}
                </Button>
                <Button href="/checkout" variant="primary" size="lg">
                  {t('checkout')}
                </Button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

