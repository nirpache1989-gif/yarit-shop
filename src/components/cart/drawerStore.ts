/**
 * @file Cart drawer open/close state
 * @summary Tiny Zustand store just for toggling the cart drawer visibility.
 *          Kept separate from the cart items store so drawer state
 *          isn't persisted to localStorage.
 */
'use client'

import { create } from 'zustand'

type DrawerState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCartDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))
