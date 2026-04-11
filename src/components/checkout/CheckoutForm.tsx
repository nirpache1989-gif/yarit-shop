/**
 * @file CheckoutForm — client component
 * @summary The interactive form rendered on /checkout. Client-side
 *          because it needs:
 *            - the current cart from the Zustand store (localStorage)
 *            - controlled form state
 *            - POST to /api/checkout
 *            - client-side redirect to the returned success URL
 *
 *          Server-side validation STILL happens (prices, stock,
 *          address) in src/lib/checkout.ts — this form is not
 *          trusted for anything except UX.
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  useCartStore,
  selectCartSubtotal,
  type CartItem,
} from '@/lib/cart/store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useHasMounted } from '@/lib/useHasMounted'
import { formatILS } from '@/lib/format'

type ShippingRate = {
  region: string
  name: string
  price: number
}

const COUNTRIES: Array<{ value: string; labelHe: string; labelEn: string }> = [
  { value: 'IL', labelHe: 'ישראל', labelEn: 'Israel' },
  { value: 'US', labelHe: 'ארצות הברית', labelEn: 'United States' },
  { value: 'GB', labelHe: 'בריטניה', labelEn: 'United Kingdom' },
  { value: 'EU', labelHe: 'האיחוד האירופי', labelEn: 'European Union' },
  { value: 'CA', labelHe: 'קנדה', labelEn: 'Canada' },
  { value: 'AU', labelHe: 'אוסטרליה', labelEn: 'Australia' },
  { value: 'OTHER', labelHe: 'אחר', labelEn: 'Other' },
]

type Props = {
  initialRates: ShippingRate[]
  /** Whether to render the "test checkout, no real payment" disclaimer
   *  at the bottom of the summary. The server parent sets this based
   *  on `isMockPaymentProvider()`. In production with a real gateway
   *  this is `false` and the notice is hidden. */
  showMockNotice: boolean
}

export function CheckoutForm({ initialRates, showMockNotice }: Props) {
  const t = useTranslations('checkout')
  const router = useRouter()
  const locale = useLocale() as 'he' | 'en'

  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore(selectCartSubtotal)
  const clearCart = useCartStore((s) => s.clear)

  const mounted = useHasMounted()

  // Form state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('IL')
  const [rates, setRates] = useState<ShippingRate[]>(initialRates)
  const [rateIndex, setRateIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When country changes, re-fetch the rates for the new region
  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/shipping-rates?country=${encodeURIComponent(country)}&subtotal=${subtotal}`,
        )
        const data = (await res.json()) as { rates: ShippingRate[] }
        if (!cancelled) {
          setRates(data.rates ?? [])
          setRateIndex(0)
        }
      } catch {
        // keep previous rates on failure
      }
    })()
    return () => {
      cancelled = true
    }
  }, [country, subtotal, mounted])

  const shippingCost = rates[rateIndex]?.price ?? 0
  const total = subtotal + shippingCost

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      setError(t('emptyCart'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      // NOTE: we deliberately do NOT send `siteUrl` anymore. The
      // server reads `NEXT_PUBLIC_SITE_URL` from its own env and
      // ignores anything the client tries to pass for the payment
      // redirect. See src/lib/checkout.ts :: getServerSiteUrl.
      const payload = {
        locale,
        items: items.map((i: CartItem) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        customer: { email, name, phone },
        shippingAddress: {
          recipientName: name,
          phone,
          street,
          city,
          postalCode,
          country,
        },
        shippingMethodIndex: rateIndex,
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok: boolean
        error?: string
        redirectUrl?: string
      }
      if (!data.ok || !data.redirectUrl) {
        setError(data.error ?? t('genericError'))
        setSubmitting(false)
        return
      }
      clearCart()
      router.push(data.redirectUrl)
    } catch {
      setError(t('genericError'))
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return <div className="py-16 text-center text-[var(--color-muted)]">...</div>
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-[var(--color-muted)]">{t('emptyCart')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Form */}
      <div className="lg:col-span-2 space-y-8">
        <Section title={t('contactInfo')} delay={80}>
          <Field label={t('email')} required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('fullName')} required>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </Field>
            <Field label={t('phone')} required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </Field>
          </div>
        </Section>

        <Section title={t('shippingAddress')} delay={200}>
          <Field label={t('street')} required>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className={inputClass}
              autoComplete="street-address"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={t('city')} required>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
                autoComplete="address-level2"
              />
            </Field>
            <Field label={t('postalCode')}>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={inputClass}
                autoComplete="postal-code"
              />
            </Field>
          </div>
          <Field label={t('country')} required>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {locale === 'he' ? c.labelHe : c.labelEn}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title={t('shippingMethod')} delay={320}>
          {rates.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              {t('noShippingForRegion')}
            </p>
          ) : (
            <div className="space-y-2">
              {rates.map((rate, i) => (
                <label
                  key={i}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-xl border p-4 cursor-pointer transition-colors',
                    rateIndex === i
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] hover:border-[var(--color-primary)]/50',
                  )}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={i}
                    checked={rateIndex === i}
                    onChange={() => setRateIndex(i)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-[var(--color-primary-dark)]">
                    {rate.name}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-primary-dark)]">
                    {rate.price === 0 ? t('free') : formatILS(rate.price)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Section>

        {error && (
          /* Theme-aware error card. The previous `bg-red-50 text-red-900`
             was invisible in dark mode (Design Round 4 design-review
             agent D1 caught this). Using `--color-accent-deep` ties the
             warning into the brand palette — warm ochre/lantern in light,
             glowing ochre in dark — and stays AA-legible in both modes. */
          <div className="rounded-xl border border-[var(--color-accent-deep)]/40 bg-[var(--color-accent-deep)]/10 p-4 text-sm font-medium text-[var(--color-accent-deep)]">
            {error}
          </div>
        )}
      </div>

      {/* Summary — sticky on desktop so it stays visible as the
          customer scrolls through the longer form on mobile, and
          acts as a persistent receipt on desktop. */}
      <aside
        className="lg:col-span-1 h-fit lg:sticky lg:top-24 rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-6 space-y-4 animate-fade-up"
        style={{ animationDelay: '440ms' }}
      >
        <h2
          className="text-xl font-bold text-[var(--color-primary-dark)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('orderSummary')}
        </h2>
        <ul className="divide-y divide-[var(--color-border-brand)]">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 py-3">
              <span className="flex-1 text-sm text-[var(--color-primary-dark)]">
                {item.title}
                <span className="text-[var(--color-muted)]"> × {item.quantity}</span>
              </span>
              <span className="text-sm font-bold text-[var(--color-primary-dark)]">
                {formatILS(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 pt-2 border-t border-[var(--color-border-brand)]">
          <Row label={t('subtotal')} value={formatILS(subtotal)} />
          <Row
            label={t('shipping')}
            value={shippingCost === 0 ? t('free') : formatILS(shippingCost)}
          />
          <Row label={t('total')} value={formatILS(total)} bold />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full btn-lift"
          disabled={submitting || rates.length === 0}
        >
          {submitting ? t('processing') : t('placeOrder')}
        </Button>
        {showMockNotice && (
          <p className="text-xs text-center text-[var(--color-muted)]">
            {t('mockNotice')}
          </p>
        )}
      </aside>
    </form>
  )
}

// ─── Small presentational helpers ──────────────────────────────────
// Input styling — gold hairline focus ring tuned to the brand
// palette. Transition is handled per-property so layout changes
// (border-width) don't jitter.
const inputClass =
  'w-full rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] transition-colors duration-200 focus:outline-none focus:border-[var(--color-accent-deep)] focus:ring-2 focus:ring-[var(--color-accent-deep)]/20'

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-6 space-y-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2
        className="text-xl font-bold text-[var(--color-primary-dark)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-[var(--color-primary-dark)]">
        {label}
        {required && <span className="text-[var(--color-accent-deep)]"> *</span>}
      </span>
      {children}
    </label>
  )
}

function Row({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        bold
          ? 'pt-2 border-t border-[var(--color-border-brand)] text-lg font-extrabold text-[var(--color-primary-dark)]'
          : 'text-sm text-[var(--color-muted)]',
      )}
    >
      <span>{label}</span>
      <span className={bold ? '' : 'text-[var(--color-primary-dark)]'}>
        {value}
      </span>
    </div>
  )
}
