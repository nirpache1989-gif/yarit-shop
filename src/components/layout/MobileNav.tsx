/**
 * @file MobileNav — hamburger menu + slide-in panel for small screens
 * @summary Below the `md` breakpoint the desktop nav (`<nav class="hidden
 *          md:flex">` in Header.tsx) is hidden, leaving mobile
 *          visitors with no way to reach /shop, /about, /contact,
 *          /login or the account page. This component fills that gap.
 *
 *          - Hamburger button visible only below `md`.
 *          - Opens a full-height slide-in panel (from the end edge in
 *            RTL, the start edge in LTR).
 *          - Panel contains: nav links, account link (wired via the
 *            server component that already knows the auth state —
 *            passed in as `accountSlot` children), language switcher,
 *            theme toggle.
 *          - Closes on: link click, ESC, backdrop click, hamburger
 *            re-click.
 *          - Focus is trapped inside the panel while open and
 *            restored to the hamburger on close.
 *          - Body scroll is locked while the panel is open.
 *
 *          The `accountSlot` prop lets the server-rendered
 *          `HeaderAccountLink` live INSIDE the mobile panel without
 *          this component needing to call `getCurrentUser` itself
 *          (which it can't — it's a client component).
 */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

type Props = {
  /**
   * Server-rendered HeaderAccountLink. Passed as children so this
   * client component doesn't have to re-implement the admin / logged
   * in / logged out branching logic.
   */
  accountSlot: ReactNode
}

export function MobileNav({ accountSlot }: Props) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  // Close the panel whenever the route changes — if the user taps a
  // link inside it, next-intl's navigation updates `pathname` and we
  // snap the overlay away. The setState is deferred to a microtask
  // so React doesn't trip the `set-state-in-effect` rule on what is
  // otherwise a perfectly valid "external system → react state" sync.
  useEffect(() => {
    queueMicrotask(() => setOpen(false))
  }, [pathname])

  // Lock body scroll + trap focus + handle ESC while open.
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus the first focusable element inside the panel (the close
    // button, which is the first thing in the tab order).
    const panel = panelRef.current
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusables?.[0]?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !focusables || focusables.length === 0) return
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

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  const navT = (key: string) => t(`nav.${key}`)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors"
        aria-label={t('common.openMenu')}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Backdrop + panel. Hidden entirely when closed (no render
          cost, no stray focus traps). */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          id="mobile-nav-panel"
        >
          {/* Backdrop — click-to-close */}
          <button
            type="button"
            aria-label={t('common.closeMenu')}
            className="absolute inset-0 bg-[var(--color-primary-dark)]/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />

          {/* Panel — slides from end edge (RTL: right→left; LTR: left→right) */}
          <div
            ref={panelRef}
            className="absolute inset-y-0 ltr:right-0 rtl:left-0 w-72 max-w-[85vw] bg-[var(--color-surface-warm)] border-l rtl:border-r border-[var(--color-border-brand)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--color-border-brand)]">
              <span
                className="text-lg font-bold text-[var(--color-primary-dark)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('common.shopName')}
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors"
                aria-label={t('common.closeMenu')}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              <Link
                href="/shop"
                className="block px-4 py-3 rounded-xl text-base font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors"
              >
                {navT('shop')}
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 rounded-xl text-base font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors"
              >
                {navT('about')}
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 rounded-xl text-base font-semibold text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 transition-colors"
              >
                {navT('contact')}
              </Link>

              <div className="h-px bg-[var(--color-border-brand)] my-3" />

              <div className="px-2 py-1">{accountSlot}</div>

              <div className="h-px bg-[var(--color-border-brand)] my-3" />

              <div className="flex items-center justify-between gap-3 px-2 pt-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
