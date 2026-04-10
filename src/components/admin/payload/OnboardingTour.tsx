/**
 * @file OnboardingTour — 4-step driver.js tour on first admin login
 * @summary Client provider that shows a warm walkthrough for Yarit
 *          the first time she lands on `/admin`. Persists a
 *          `yarit-onboarding-complete: '1'` flag in localStorage so
 *          subsequent loads are silent.
 *
 *          driver.js handles popover positioning, focus trap, and
 *          escape handling out of the box. Popover visuals are
 *          rebranded via `.driver-popover*` rules in admin-brand.css
 *          so everything matches the Warm Night palette.
 *
 *          The tour only triggers on `/admin` (not on collection
 *          list/edit pages) to avoid confusing Yarit mid-edit.
 *
 *          IMPORTANT: Payload's NestProviders chain requires every
 *          provider to render `children`. See AdminThemeInit.tsx
 *          for the full story.
 *
 *          See: Round 4 plan Track C11.
 */
'use client'

import { useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'yarit-onboarding-complete'

type Props = {
  children?: ReactNode
}

export function OnboardingTour({ children }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) === '1') return
    // Only fire on the main dashboard, not on any other admin page.
    if (window.location.pathname !== '/admin') return

    let cancelled = false

    ;(async () => {
      try {
        const mod = await import('driver.js')
        await import('driver.js/dist/driver.css')
        if (cancelled) return

        const d = mod.driver({
          showProgress: true,
          progressText: 'שלב {{current}} מתוך {{total}}',
          nextBtnText: 'הבא ←',
          prevBtnText: '→ הקודם',
          doneBtnText: 'סיום ✓',
          smoothScroll: true,
          allowClose: true,
          steps: [
            {
              element: '.yarit-dashboard__hello',
              popover: {
                title: 'ברוכה הבאה! 🌿',
                description:
                  'זה פאנל הניהול שלך — כאן את מנהלת הכל: הזמנות, מוצרים, תמונות, והגדרות החנות. בואי נעשה סיור קצר של 30 שניות.',
              },
            },
            {
              element: '.yarit-stats',
              popover: {
                title: 'מבט מהיר',
                description:
                  'הנתונים החשובים ביותר בראש העמוד. "הזמנות פתוחות" זה מה שמחכה לטיפול היום.',
              },
            },
            {
              element: '.yarit-tile--accent',
              popover: {
                title: 'המסך הכי חשוב',
                description:
                  'כאן את רואה כל הזמנה משולמת שצריך לטפל בה, ממוינת לפי דחיפות. הכפתורים מתקדמים אוטומטית בשלבי ההזמנה.',
              },
            },
            {
              element: '.yarit-tiles',
              popover: {
                title: 'פעולות מהירות',
                description:
                  'כל שאר הפעולות הנפוצות נמצאות כאן. אפשר לחזור לסיור הזה בכל זמן מתפריט העזרה.',
              },
            },
          ],
          onDestroyed: () => {
            try {
              localStorage.setItem(STORAGE_KEY, '1')
            } catch {
              /* localStorage blocked — fine, tour just re-fires next login */
            }
          },
        })

        // Small delay so the dashboard finishes rendering before the
        // tour tries to target its elements.
        setTimeout(() => {
          if (cancelled) return
          try {
            d.drive()
          } catch {
            /* driver.js target missing — silently bail */
          }
        }, 900)
      } catch {
        /* driver.js failed to load — non-fatal */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return <>{children}</>
}
