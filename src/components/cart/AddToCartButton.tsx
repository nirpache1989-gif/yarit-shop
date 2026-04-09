/**
 * @file AddToCartButton — client-side add action
 * @summary Shared button used on product cards and the product detail
 *          page. Calls the Zustand cart store to add the product.
 *          Shows a "נוסף ✓" confirmation state for ~1.4s with a pulse
 *          animation (keyframe defined in globals.css).
 *
 *          Also opens the cart drawer briefly after adding so the
 *          customer gets immediate visual feedback.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/lib/cart/store'
import { useCartDrawerStore } from '@/components/cart/drawerStore'
import { Button } from '@/components/ui/Button'
import type { ProductCardData } from '@/components/product/ProductCard'
import { cn } from '@/lib/cn'

type Props = {
  product: ProductCardData
  quantity?: number
  size?: 'md' | 'lg'
  className?: string
}

export function AddToCartButton({
  product,
  quantity = 1,
  size = 'md',
  className,
}: Props) {
  const t = useTranslations('cart')
  const addItem = useCartStore((s) => s.addItem)
  const openDrawer = useCartDrawerStore((s) => s.open)
  const [justAdded, setJustAdded] = useState(false)

  const handleClick = () => {
    const firstImage = product.images?.[0]?.image
    const imageUrl =
      firstImage && typeof firstImage === 'object' ? firstImage.url : undefined
    addItem(
      {
        productId: product.id,
        type: product.type,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: imageUrl,
      },
      quantity,
    )
    setJustAdded(true)
    // Briefly open the drawer so the customer sees the item land
    setTimeout(() => openDrawer(), 150)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <Button
      variant="primary"
      size={size}
      onClick={handleClick}
      className={cn(className, justAdded && 'animate-pulse-added')}
    >
      {justAdded ? `✓ ${t('added')}` : t('addToCart')}
    </Button>
  )
}
