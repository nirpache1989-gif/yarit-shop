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
 *            did nothing on Yarit's browser (no default mail client
 *            configured → browser ignores the click). Swapped again
 *            for a self-contained popover with a WhatsApp link +
 *            copy-to-clipboard email + the original mailto. Every
 *            click path produces visible feedback so the button
 *            never feels "dead".
 *
 *          Localization: the button label, the popover heading, the
 *          WhatsApp prefill, and the mailto subject/body all branch
 *          on `props.i18n.language` so an English-mode admin gets
 *          English copy and a Hebrew-mode admin gets Hebrew.
 *
 *          To change the support contact, edit the `HELP_EMAIL` and
 *          `HELP_WHATSAPP` constants below. We keep them as compile-
 *          time constants rather than reading from SiteSettings — the
 *          HelpButton renders on every admin page and an extra DB
 *          query just for a contact-info lookup is needless overhead.
 */
'use client'

import { useEffect, useRef, useState } from 'react'

// Payload injects an `i18n` prop on every component it mounts via
// `admin.components.actions`. The shape is Payload-internal; we just
// need the current language code.
type HelpButtonProps = {
  i18n?: { language?: string }
}

const HELP_EMAIL = 'nirpache1989@gmail.com'
// WhatsApp number in E.164 format (no '+' or spaces). Empty string
// disables the WhatsApp option — leave the email path as the sole
// escape hatch in that case.
const HELP_WHATSAPP = '972501234567' // TODO(nir): replace with real WhatsApp

const COPY = {
  he: {
    label: '?צריכה עזרה',
    title: 'צריכה עזרה?',
    intro: 'אפשר לפנות לניר באחת משתי הדרכים:',
    whatsappTitle: 'וואטסאפ (הכי מהיר)',
    whatsappAction: 'פתחי שיחה',
    whatsappPrefill:
      'שלום ניר, יש לי שאלה לגבי פאנל הניהול של שורש:',
    emailTitle: 'אימייל',
    emailAction: 'העתקי כתובת',
    emailCopied: 'הועתק ✓',
    mailtoAction: 'פתיחה בתוכנת מייל',
    mailtoSubject: 'עזרה עם פאנל הניהול של החנות',
    mailtoBody:
      'שלום ניר, יש לי שאלה לגבי פאנל הניהול:\n\n' +
      '(נא לכתוב את השאלה כאן)\n\n' +
      '---\nנשלח מתוך פאנל הניהול של שורש',
    closeLabel: 'סגור',
  },
  en: {
    label: 'Need help?',
    title: 'Need help?',
    intro: 'Reach Nir one of two ways:',
    whatsappTitle: 'WhatsApp (fastest)',
    whatsappAction: 'Open chat',
    whatsappPrefill:
      "Hi Nir, I have a question about the Shoresh admin panel:",
    emailTitle: 'Email',
    emailAction: 'Copy address',
    emailCopied: 'Copied ✓',
    mailtoAction: 'Open in mail app',
    mailtoSubject: 'Help with the Shoresh admin panel',
    mailtoBody:
      'Hi Nir, I have a question about the admin panel:\n\n' +
      '(please write your question here)\n\n' +
      '---\nSent from the Shoresh admin panel',
    closeLabel: 'Close',
  },
} as const

export function HelpButton(props: HelpButtonProps) {
  const lang = props.i18n?.language === 'en' ? 'en' : 'he'
  const copy = COPY[lang]
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const whatsappHref = HELP_WHATSAPP
    ? `https://wa.me/${HELP_WHATSAPP}?text=${encodeURIComponent(copy.whatsappPrefill)}`
    : null
  const mailtoHref = `mailto:${HELP_EMAIL}?subject=${encodeURIComponent(
    copy.mailtoSubject,
  )}&body=${encodeURIComponent(copy.mailtoBody)}`

  // Close on outside click / ESC.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const copyEmail = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(HELP_EMAIL)
      } else {
        // Fallback for non-secure contexts: temporary hidden textarea.
        const ta = document.createElement('textarea')
        ta.value = HELP_EMAIL
        ta.setAttribute('readonly', '')
        ta.style.position = 'absolute'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // If clipboard write fails, at least prompt so the user sees
      // the email string and can manually copy it.
      window.prompt(copy.emailTitle, HELP_EMAIL)
    }
  }

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
            minWidth: 280,
            maxWidth: 320,
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
              marginBottom: 8,
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
              onClick={() => setOpen(false)}
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
            }}
          >
            {copy.intro}
          </p>

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '10px 12px',
                marginBottom: 8,
                borderRadius: 10,
                background: 'var(--color-primary, #2D4F3E)',
                color: 'white',
                fontWeight: 600,
                fontSize: 13,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {copy.whatsappTitle} — {copy.whatsappAction}
            </a>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--color-surface, #FFFFFF)',
              border: '1px solid var(--color-border-brand, #E4D7B0)',
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                flex: 1,
                color: 'var(--color-primary-dark, #183329)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                direction: 'ltr',
              }}
            >
              {HELP_EMAIL}
            </span>
            <button
              type="button"
              onClick={copyEmail}
              style={{
                background: copied
                  ? 'var(--color-primary, #2D4F3E)'
                  : 'var(--color-surface-warm, #FDF8E8)',
                color: copied
                  ? 'white'
                  : 'var(--color-primary-dark, #183329)',
                border: '1px solid var(--color-border-brand, #E4D7B0)',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? copy.emailCopied : copy.emailAction}
            </button>
          </div>

          <a
            href={mailtoHref}
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--color-muted, #6F6450)',
              textDecoration: 'underline',
              padding: '6px 0 0',
            }}
          >
            {copy.mailtoAction}
          </a>
        </div>
      )}
    </div>
  )
}
