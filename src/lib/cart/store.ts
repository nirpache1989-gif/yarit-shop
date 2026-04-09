/**
 * @file Cart store (Zustand)
 * @summary Client-side cart state persisted to localStorage. Holds a
 *          list of cart items and derives subtotal on demand.
 *
 *          KEY INVARIANT: this store accepts BOTH Forever and
 *          independent products. Under the current business model
 *          (see docs/DECISIONS.md ADR-002), Yarit is the merchant of
 *          record for every sale — Forever items go through the same
 *          cart and checkout as independent items. The difference is
 *          only visible in the admin Fulfillment Dashboard (Phase E).
 *
 *          The store is intentionally minimal — no server sync, no
 *          optimistic updates. If the user clears localStorage, the
 *          cart is lost. For a single-person shop this is fine.
 *
 *          See: docs/ARCHITECTURE.md §Cart.
 */
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: number | string
  type: 'forever' | 'independent'
  slug: string
  title: string
  price: number
  image?: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  updateQuantity: (productId: CartItem['productId'], qty: number) => void
  removeItem: (productId: CartItem['productId']) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: qty }] }
        }),

      updateQuantity: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i,
            ),
          }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'shoresh-cart',
      version: 1,
    },
  ),
)

// ─── Selectors ─────────────────────────────────────────────────────
export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
