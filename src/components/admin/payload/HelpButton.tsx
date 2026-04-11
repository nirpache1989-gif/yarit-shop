/**
 * @file HelpButton — permanent "help" pill in the admin top-right
 * @summary Client component injected via `admin.components.actions`.
 *          Renders alongside Payload's built-in actions + our
 *          AdminLangSwitcher and ViewOnSite pills. Styled by
 *          `.yarit-help-button` in admin-brand.css so the look is
 *          tweakable from CSS.
 *
 *          History:
 *          - Round 5 Fix 2.3: swapped an external GitHub markdown
 *            link for a `mailto:` so Yarit didn't have to navigate
 *            a docs site.
 *          - 2026-04-11 late QA: the plain `mailto:` anchor silently
 *            did nothing on Yarit's browser. Swapped for a
 *            WhatsApp/email/mailto popover so every click path
 *            produced visible feedback.
 *          - 2026-04-11 T2.9 closeout: Yarit asked for the popover
 *            to be a SELF-CONTAINED MINI GUIDE instead of a contact
 *            card. She'd rather have a quick reminder of where each
 *            common admin task lives than a link to Nir — she
 *            already has Nir's WhatsApp on her phone. The popover
 *            now renders 7 frequently-needed tasks with their real
 *            Hebrew sidebar paths, each one a 1-line how-to.
 *
 *          Localization: the button label, the popover heading, and
 *          every task's title/path/description branch on
 *          `props.i18n.language` so an English-mode admin gets
 *          English copy and a Hebrew-mode admin gets Hebrew. The
 *          Hebrew strings are keyed to the actual Hebrew labels in
 *          `src/collections/Products.ts` + `src/globals/SiteSettings.ts`
 *          so clicks don't send Yarit hunting for nonexistent
 *          sidebar entries (see `docs/YARIT-ADMIN-GUIDE.md` for the
 *          full version of the same guide).
 */
'use client'

import { useEffect, useRef, useState } from 'react'

// Payload injects an `i18n` prop on every component it mounts via
// `admin.components.actions`. The shape is Payload-internal; we just
// need the current language code.
type HelpButtonProps = {
  i18n?: { language?: string }
}

type Task = {
  title: string
  path: string
  hint: string
}

type Copy = {
  label: string
  title: string
  intro: string
  closeLabel: string
  footer: string
  tasks: Task[]
}

const COPY: Record<'he' | 'en', Copy> = {
  he: {
    label: '?צריכה עזרה',
    title: 'איך משתמשים בפאנל',
    intro: 'מדריך מקוצר למשימות הנפוצות. לחיצה על כותרת מרחיבה את ההסבר.',
    closeLabel: 'סגור',
    footer: 'טיפ: כל שדה בפאנל כולל הסבר קצר מתחתיו.',
    tasks: [
      {
        title: '🆕 הוספת מוצר חדש',
        path: '📦 קטלוג ← מוצרים ← "+ יצירה חדשה"',
        hint: 'ממלאים שם, תיאור קצר, מחיר, תמונה וקטגוריה. לשמור ללחוץ "פרסום" בפינה השמאלית העליונה.',
      },
      {
        title: '✏️ עריכת מוצר קיים',
        path: '📦 קטלוג ← מוצרים ← לחיצה על שם המוצר',
        hint: 'אפשר לשנות מחיר, מלאי, תמונות או תיאור. בסיום — "שמירה". השינוי יעלה לאתר תוך כמה שניות.',
      },
      {
        title: '📦 סימון הזמנה כנשלחה',
        path: '💰 מכירות ← הזמנות ← בחירת הזמנה',
        hint: 'לשנות את "סטטוס" ל"נשלח", להדביק מספר מעקב (אם יש), ולשמור. הלקוח יקבל מייל אוטומטית.',
      },
      {
        title: '🗂️ הוספת קטגוריה',
        path: '📦 קטלוג ← קטגוריות ← "+ יצירה חדשה"',
        hint: 'שם הקטגוריה (עברית/אנגלית), סדר (מספר) ותמונה. הקטגוריה מופיעה מיד בדף הבית ובחנות.',
      },
      {
        title: '🌿 עדכון פרטי אתר (טלפון, מייל, כתובת)',
        path: '🌿 הגדרות ← הגדרות אתר',
        hint: 'כל השדות בדף אחד. השינוי מתעדכן ב-footer, בדף "צור קשר" ובמידע ללקוחות אוטומטית.',
      },
      {
        title: '🖼️ החלפת תמונה בבאנר הראשי',
        path: '🌿 הגדרות ← הגדרות אתר ← "תמונות באנר"',
        hint: 'גרירה של תמונה חדשה להעלאה. לגרור אותה לראש הרשימה כדי שתופיע ראשונה.',
      },
      {
        title: '🔐 שינוי סיסמה',
        path: '👥 לקוחות ← משתמשים ← המשתמש שלך',
        hint: 'לחיצה על "שינוי סיסמה", הזנת הסיסמה החדשה פעמיים ושמירה.',
      },
    ],
  },
  en: {
    label: 'Need help?',
    title: 'How to use the admin',
    intro: 'Quick guide for common tasks. Click a title to expand.',
    closeLabel: 'Close',
    footer: 'Tip: every field in the admin has a short hint below it.',
    tasks: [
      {
        title: '🆕 Add a new product',
        path: '📦 Catalog → Products → "+ Create new"',
        hint: 'Fill in name, short description, price, image, and category. Click "Publish" in the top-left to save live.',
      },
      {
        title: '✏️ Edit an existing product',
        path: '📦 Catalog → Products → click the product title',
        hint: 'Change price, stock, images, or description. Click "Save" — the change goes live within seconds.',
      },
      {
        title: '📦 Mark an order as shipped',
        path: '💰 Sales → Orders → pick the order',
        hint: 'Change "Status" to "Shipped", paste a tracking number if you have one, save. The customer gets an email automatically.',
      },
      {
        title: '🗂️ Add a new category',
        path: '📦 Catalog → Categories → "+ Create new"',
        hint: 'Category name (Hebrew + English), display order, and image. Shows up on the homepage + shop instantly.',
      },
      {
        title: '🌿 Update shop details (phone, email, address)',
        path: '🌿 Settings → Site Settings',
        hint: 'All fields on one page. Changes update the footer, the contact page, and customer info automatically.',
      },
      {
        title: '🖼️ Change the hero banner image',
        path: '🌿 Settings → Site Settings → "Hero Images"',
        hint: 'Drag a new image to upload. Drag it to the top of the list to make it appear first.',
      },
      {
        title: '🔐 Change your password',
        path: '👥 Customers → Users → your own account',
        hint: 'Click "Change password", enter the new one twice, and save.',
      },
    ],
  },
}

export function HelpButton(props: HelpButtonProps) {
  const lang = props.i18n?.language === 'en' ? 'en' : 'he'
  const copy = COPY[lang]
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click / ESC. Collapse any expanded row when the
  // popover closes so reopening starts fresh.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setExpanded(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setExpanded(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        type="button"
        className="yarit-help-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {copy.label}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={copy.title}
          className="yarit-help-popover"
          // Inline styles because the popover is rendered inside the
          // Payload admin chrome, which has its own cascade — the
          // safest way to land a predictable layout is inline.
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            zIndex: 10000,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '70vh',
            overflowY: 'auto',
            borderRadius: 14,
            background: 'var(--color-surface-warm, #FDF8E8)',
            border: '1px solid var(--color-border-brand, #E4D7B0)',
            boxShadow: '0 18px 50px -20px rgba(24, 51, 41, 0.35)',
            padding: 16,
            direction: lang === 'he' ? 'rtl' : 'ltr',
            fontFamily: 'Heebo, Arial, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <strong
              style={{
                fontSize: 15,
                color: 'var(--color-primary-dark, #183329)',
              }}
            >
              {copy.title}
            </strong>
            <button
              type="button"
              aria-label={copy.closeLabel}
              onClick={() => {
                setOpen(false)
                setExpanded(null)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                color: 'var(--color-muted, #6F6450)',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              fontSize: 12,
              color: 'var(--color-muted, #6F6450)',
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {copy.intro}
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {copy.tasks.map((task, i) => {
              const isOpen = expanded === i
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      textAlign: lang === 'he' ? 'right' : 'left',
                      background: isOpen
                        ? 'var(--color-surface, #FFFFFF)'
                        : 'transparent',
                      border: '1px solid var(--color-border-brand, #E4D7B0)',
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-primary-dark, #183329)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span>{task.title}</span>
                    <span
                      aria-hidden
                      style={{
                        fontSize: 10,
                        color: 'var(--color-muted, #6F6450)',
                        transition: 'transform 0.2s ease',
                        transform: isOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                    >
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '8px 12px 4px',
                        fontSize: 12,
                        color: 'var(--color-muted, #6F6450)',
                        lineHeight: 1.55,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-primary-dark, #183329)',
                          marginBottom: 4,
                        }}
                      >
                        {task.path}
                      </div>
                      <div>{task.hint}</div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <p
            style={{
              fontSize: 11,
              color: 'var(--color-muted, #6F6450)',
              marginTop: 12,
              marginBottom: 0,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            {copy.footer}
          </p>
        </div>
      )}
    </div>
  )
}
