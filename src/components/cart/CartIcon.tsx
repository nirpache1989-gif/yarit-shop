/**
 * @file CartIcon — header cart button with live count
 * @summary Client component because it reads from the Zustand store.
 *          The count badge appears when there's at least one item in
 *          the cart. Clicking opens the CartDrawer.
 *
 *          Hydration note: Zustand + persist hydrates on the client
 *          after the first render, so during SSR the count is always
 *          0. We handle this with a `mounted` flag to avoid hydration
 *          mismatches.
 */
'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore, selectCartCount } from '@/lib/cart/store'
import { useCartDrawerStore } from '@/components/cart/drawerStore'

export function CartIcon() {
  const t = useTranslations('nav')
  const count = useCartStore(selectCartCount)
  const open = useCartDrawerStore((s) => s.open)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayCount = mounted ? count : 0

  return (
    <button
      type="button"
      onClick={open}
      className="relative inline-flex items-center justify-center rounded-full p-2 text-[var(--color-primary-dark)] hover:bg-[var(--color-surface)] transition-colors"
      aria-label={t('cart')}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {displayCount > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center px-1">
          {displayCount}
        </span>
      )}
    </button>
  )
}
