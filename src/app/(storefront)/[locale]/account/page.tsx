/**
 * @file /account — customer dashboard
 * @summary Server component. Auth-gates: if not logged in, redirect
 *          to /login. If logged in as the `customer` role (or even
 *          as admin — admins see only their own orders, which is
 *          usually zero), fetch their orders via Payload's local API
 *          with `{ user, overrideAccess: false }` so the access rule
 *          on Orders scopes results to this user only.
 *
 *          CRITICAL — DO NOT call `payload.find({ collection: 'orders' })`
 *          without `{ user, overrideAccess: false }`. The local API
 *          treats no-user as super-user and returns every order in
 *          the system, leaking customer data. See verification step
 *          (j) in the F.1 plan for the cross-customer test.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { redirect as nextRedirect } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { OrderList, type OrderListRow } from '@/components/account/OrderList'
import { ProfileCard } from '@/components/account/ProfileCard'
import { LogoutButton } from '@/components/account/LogoutButton'
import { Reveal } from '@/components/motion/Reveal'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPayloadClient } from '@/lib/payload'
import { redirect } from '@/lib/i18n/navigation'
import { routing, type Locale } from '@/lib/i18n/routing'
import type {
  FulfillmentStatus,
  PaymentStatus,
  StatusLocale,
} from '@/lib/orders/statusLabels'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  params: Promise<{ locale: string }>
}

type RawOrder = {
  id: number | string
  orderNumber: string
  createdAt: string
  total: number
  paymentStatus: PaymentStatus | string
  fulfillmentStatus: FulfillmentStatus | string
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const typedLocale = locale as Locale

  const { user } = await getCurrentUser()
  if (!user) {
    redirect({ href: '/login', locale: typedLocale })
  }
  // Admins don't belong on the customer dashboard. They have their own
  // control panel at /admin. Without this redirect, Payload's access
  // rule on Orders (which short-circuits to `true` for admins) would
  // happily return every customer's orders on this page — the exact
  // opposite of what a "My account" surface is supposed to do.
  //
  // `/admin` is a Payload route, not next-intl locale-aware, so we use
  // plain next/navigation redirect instead of the locale-aware one.
  if (user!.role === 'admin') {
    nextRedirect('/admin')
  }

  const t = await getTranslations({ locale, namespace: 'account' })
  const payload = await getPayloadClient()

  // CRITICAL: pass `user` + `overrideAccess: false` so the Orders
  // collection's `access.read` rule scopes results to this customer.
  let orders: OrderListRow[] = []
  try {
    const res = await payload.find({
      collection: 'orders',
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      locale: typedLocale,
      user: user!,
      overrideAccess: false,
    })
    orders = (res.docs as unknown as RawOrder[]).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      total: o.total,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
    }))
  } catch {
    orders = []
  }

  return (
    <Container className="py-12 md:py-16 max-w-4xl space-y-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {t('pageTitle')}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1
              className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {user!.name
                ? t('greeting', { name: user!.name })
                : t('greetingFallback')}
            </h1>
          </Reveal>
        </div>
        <Reveal delay={280}>
          <LogoutButton />
        </Reveal>
      </header>

      <section className="space-y-4">
        <Reveal delay={200}>
          <h2
            className="text-xl font-bold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('myOrders')}
          </h2>
        </Reveal>
        <OrderList orders={orders} locale={typedLocale as StatusLocale} />
      </section>

      <Reveal delay={400}>
        <ProfileCard
          name={user!.name}
          email={user!.email}
          phone={user!.phone}
          locale={typedLocale as StatusLocale}
        />
      </Reveal>
    </Container>
  )
}
