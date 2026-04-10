/**
 * @file ProfileCard — read-only customer details panel
 * @summary Server component. Shows the customer's name, email, and
 *          phone in a small card on the /account dashboard. No edit
 *          UI in F.1 — editable profile is a Phase G stretch.
 */
import { getTranslations } from 'next-intl/server'
import type { StatusLocale } from '@/lib/orders/statusLabels'

type Props = {
  name?: string
  email: string
  phone?: string
  locale: StatusLocale
}

export async function ProfileCard({ name, email, phone, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'account' })
  return (
    <section className="rounded-2xl border border-[var(--color-border-brand)] bg-[var(--color-surface-warm)] p-6 space-y-4">
      <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
        {t('profileHeading')}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('profileNameLabel')}
          </dt>
          <dd className="text-[var(--color-primary-dark)]">
            {name || t('profileNoPhone')}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('profileEmailLabel')}
          </dt>
          <dd className="text-[var(--color-primary-dark)] break-all">
            {email}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            {t('profilePhoneLabel')}
          </dt>
          <dd className="text-[var(--color-primary-dark)]">
            {phone || t('profileNoPhone')}
          </dd>
        </div>
      </dl>
    </section>
  )
}
