/**
 * @file /cart — dedicated cart page
 * @summary Full-page view of the cart (the CartDrawer is the compact
 *          version). Shows an item list, quantity controls, and a
 *          subtotal summary with a checkout button.
 */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCartStore, selectCartSubtotal } from '@/lib/cart/store'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const t = useTranslations('cart')
  const tNav = useTranslations('nav')

  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
      <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)] mb-8">
        {tNav('cart')}
      </h1>

      {items.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-[var(--color-muted)]">{t('empty')}</p>
          <Button href="/shop" variant="primary" size="lg">
            {t('browseShop')}
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items list */}
          <ul className="lg:col-span-2 divide-y divide-[var(--color-border-brand)] border border-[var(--color-border-brand)] rounded-2xl bg-[var(--color-surface)]">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-5">
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
                    ₪{item.price.toLocaleString()}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-full border border-[var(--color-border-brand)] hover:bg-[var(--color-background)]"
                      aria-label="-"
                    >
                      −
                    </button>
                    <span className="min-w-[24px] text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-full border border-[var(--color-border-brand)] hover:bg-[var(--color-background)]"
                      aria-label="+"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="ms-auto text-sm text-[var(--color-muted)] hover:text-[var(--color-accent-deep)]"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
                <div className="text-lg font-bold text-[var(--color-primary-dark)] whitespace-nowrap">
                  ₪{(item.price * item.quantity).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>

          {/* Summary */}
          <aside className="lg:col-span-1 h-fit p-5 rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
              {t('summary')}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">{t('subtotal')}</span>
              <span className="text-xl font-bold text-[var(--color-primary-dark)]">
                ₪{subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              {t('shippingCalculated')}
            </p>
            <Button href="/checkout" variant="primary" size="lg" className="w-full">
              {t('checkout')}
            </Button>
          </aside>
        </div>
      )}
    </Container>
  )
}
