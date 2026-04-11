/**
 * @file /cart — dedicated cart page
 * @summary Full-page view of the cart (the CartDrawer is the compact
 *          version). Shows an item list, quantity controls, and a
 *          subtotal summary with a checkout button.
 */
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCartStore, selectCartSubtotal } from '@/lib/cart/store'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { useHasMounted } from '@/lib/useHasMounted'
import { formatILS } from '@/lib/format'

export default function CartPage() {
  const t = useTranslations('cart')
  const tNav = useTranslations('nav')

  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const mounted = useHasMounted()

  if (!mounted) {
    return (
      <Container className="py-16">
        <h1 className="text-4xl font-extrabold text-[var(--color-primary-dark)]">
          {tNav('cart')}
        </h1>
        <p className="mt-4 text-[var(--color-muted)]">...</p>
      </Container>
    )
  }

  return (
    <Container className="py-12 md:py-16">
      <h1
        className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)] mb-8 animate-fade-up"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {tNav('cart')}
      </h1>

      {items.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-4 text-center animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="relative w-60 h-60 mb-4 rounded-[var(--radius-card)] overflow-hidden opacity-90">
            <Image
              src="/brand/ai/cart-empty.jpg"
              alt=""
              fill
              sizes="240px"
              className="object-cover ken-burns"
            />
          </div>
          <p className="text-lg text-[var(--color-muted)] italic" style={{ fontFamily: 'var(--font-display)' }}>
            {t('empty')}
          </p>
          <Button href="/shop" variant="primary" size="lg">
            {t('browseShop')}
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items list */}
          <ul className="lg:col-span-2 divide-y divide-[var(--color-border-brand)] border border-[var(--color-border-brand)] rounded-2xl bg-[var(--color-surface)]">
            {items.map((item, i) => (
              <li
                key={item.productId}
                className="flex gap-4 p-5 animate-fade-up transition-colors hover:bg-[var(--color-surface-warm)]/50"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg bg-[var(--color-background)] overflow-hidden">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--color-primary-dark)]">
                    {item.title}
                  </p>
                  <p className="text-sm text-[var(--color-muted)] mt-0.5">
                    {formatILS(item.price)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full border border-[var(--color-border-brand)] hover:bg-[var(--color-background)]"
                      aria-label={t('decreaseQty', { item: item.title })}
                    >
                      <span aria-hidden>−</span>
                    </button>
                    <span className="min-w-[24px] text-center font-semibold" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full border border-[var(--color-border-brand)] hover:bg-[var(--color-background)]"
                      aria-label={t('increaseQty', { item: item.title })}
                    >
                      <span aria-hidden>+</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="ms-auto text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-deep)]"
                      aria-label={t('removeFromCart', { item: item.title })}
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
                <div className="text-lg font-bold text-[var(--color-primary-dark)] whitespace-nowrap">
                  {formatILS(item.price * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          {/* Summary — sticky on desktop so it stays visible as
              the customer scrolls through a long cart. */}
          <aside className="lg:col-span-1 h-fit lg:sticky lg:top-24 p-5 rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] space-y-4 animate-fade-up" style={{ animationDelay: '240ms' }}>
            <h2
              className="text-xl font-bold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('summary')}
            </h2>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-primary)]/15">
              <span className="text-[var(--color-muted)] italic" style={{ fontFamily: 'var(--font-display)' }}>
                {t('subtotal')}
              </span>
              <span
                className="text-2xl font-bold text-[var(--color-primary-dark)] tabular-nums"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatILS(subtotal)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)] italic">
              {t('shippingCalculated')}
            </p>
            <Button href="/checkout" variant="primary" size="lg" className="w-full btn-lift">
              {t('checkout')}
            </Button>
          </aside>
        </div>
      )}
    </Container>
  )
}
