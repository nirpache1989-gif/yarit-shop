/**
 * @file 404 not-found page (Wave 4)
 * @summary Rendered inside the storefront layout whenever Next
 *          throws `notFound()` under `/[locale]/*`. The layout
 *          wraps this page so the header, footer, drifting leaves
 *          and ambient-breathe background are all present — the
 *          visitor lands somewhere that still feels like the shop,
 *          not a bare error page.
 *
 *          Motion:
 *            - The empty-404 illustration lives inside a Ken Burns
 *              loop (tr variant) so the image feels alive.
 *            - Heading + apology + CTA reveal in sequence.
 *
 *          Copy is deliberately short and tender. Hebrew first; we
 *          can't tell from notFound() which locale the request came
 *          from, so we render both Hebrew and English so either
 *          visitor leaves with a clear next step.
 *
 *          next-intl's `useTranslations` can't be used here because
 *          `not-found.tsx` in the App Router is rendered by Next's
 *          error boundary which doesn't pass through the locale
 *          params (it strips them). Writing the strings inline is
 *          the documented Next.js pattern for this case.
 */
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/motion/Reveal'
import { KenBurns } from '@/components/motion/KenBurns'
import { Link } from '@/lib/i18n/navigation'

export default function LocaleNotFound() {
  return (
    <Container className="py-16 md:py-24 max-w-2xl text-center space-y-10">
      <Reveal>
        <div
          aria-hidden
          className="relative mx-auto aspect-square w-56 md:w-72 overflow-hidden rounded-full border border-[var(--color-border-brand)]/60 shadow-[0_24px_60px_-30px_rgba(24,51,41,0.4)]"
        >
          <KenBurns variant="tr">
            <Image
              src="/brand/ai/empty-404.jpg"
              alt=""
              fill
              sizes="(min-width: 768px) 288px, 224px"
              className="object-cover"
              priority={false}
            />
          </KenBurns>
        </div>
      </Reveal>

      <div className="space-y-4">
        <Reveal delay={180}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-accent-deep)]">
            404
          </p>
        </Reveal>
        <Reveal delay={300}>
          <h1
            className="iridescent-heading text-4xl md:text-5xl font-extrabold text-[var(--color-primary-dark)] leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            הדף הזה הלך לטיול
          </h1>
        </Reveal>
        <Reveal delay={420}>
          <p className="text-base md:text-lg italic text-[var(--color-muted)] leading-relaxed">
            לא מצאנו את העמוד שחיפשת. אולי הקישור שבור, או שהעמוד כבר לא
            כאן. בואי נחזור הביתה יחד.
          </p>
        </Reveal>
        <Reveal delay={540}>
          <p className="text-sm text-[var(--color-muted)]/80 leading-relaxed">
            We couldn&apos;t find the page you were looking for. The link may
            be broken, or the page may have moved.
          </p>
        </Reveal>
      </div>

      <Reveal delay={680}>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-lift inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            חזרה לדף הבית
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-7 py-3 text-sm font-semibold text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] transition-colors"
          >
            לחנות
          </Link>
        </div>
      </Reveal>
    </Container>
  )
}
