/**
 * @file Cart store (Zustand)
 * @summary Client-side cart state persisted to localStorage. Holds a
 *          list of cart items and derives subtotal on demand.
 *
 *          Every product type flows through the same cart + checkout.
 *          The `type` field (`stocked` vs `sourced`) is carried along
 *          for the order snapshot but doesn't change cart behavior.
 *          See docs/DECISIONS.md ADR-002 + ADR-019.
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
  type: 'sourced' | 'stocked'
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
      version: 2,
      // v1 → v2 migration (2026-04-11): `type` enum values renamed
      // from 'forever' | 'independent' to 'sourced' | 'stocked'.
      // Without this migration, a returning customer with an old
      // cart in localStorage would have stale enum values that don't
      // match the new TypeScript union. Server-side checkout
      // re-validates against the live Products collection so stale
      // values can't cause data corruption, but the type narrowing
      // in the drawer would still misbehave.
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2 && persistedState && typeof persistedState === 'object') {
          const state = persistedState as { items?: Array<{ type?: string } & Record<string, unknown>> }
          if (Array.isArray(state.items)) {
            state.items = state.items.map((item) => ({
              ...item,
              type:
                item.type === 'forever'
                  ? 'sourced'
                  : item.type === 'independent'
                  ? 'stocked'
                  : item.type,
            }))
          }
          return state as CartState
        }
        return persistedState as CartState
      },
    },
  ),
)

// ─── Selectors ─────────────────────────────────────────────────────
export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
