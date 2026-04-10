/**
 * @file /legal/[slug] — terms / privacy / shipping / returns pages
 * @summary Reads per-locale markdown from `content/legal/<slug>/<locale>.md`
 *          via `src/lib/legal.ts`. If the file is missing OR the
 *          slug isn't one of the four recognized legal pages, the
 *          route 404s.
 *
 *          When Yarit's legal copy arrives, drop the markdown files
 *          under `content/legal/<slug>/` and they go live on the
 *          next request. No rebuild required in dev (the route is
 *          dynamic by default because it reads from the filesystem);
 *          in prod a redeploy picks up any newly-added files.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/motion/Reveal'
import { routing, type Locale } from '@/lib/i18n/routing'
import {
  LEGAL_SLUGS,
  loadLegalMarkdown,
  renderLegalMarkdown,
  splitLegalMarkdown,
  type LegalSlug,
  type LegalLocale,
} from '@/lib/legal'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    LEGAL_SLUGS.map((slug) => ({ locale, slug })),
  )
}

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function isLegalSlug(s: string): s is LegalSlug {
  return (LEGAL_SLUGS as string[]).includes(s)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLegalSlug(slug)) return { title: 'Not found' }
  const t = await getTranslations({ locale, namespace: 'legal' })
  const title = t(`${slug}.title`)
  const canonicalPath =
    locale === 'he' ? `/legal/${slug}` : `/en/legal/${slug}`
  return {
    title,
    alternates: {
      canonical: canonicalPath,
      languages: {
        he: `/legal/${slug}`,
        en: `/en/legal/${slug}`,
      },
    },
    openGraph: {
      title,
      type: 'article',
      locale: locale === 'he' ? 'he_IL' : 'en_US',
    },
  }
}

export default async function LegalPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  if (!isLegalSlug(slug)) notFound()

  const typedLocale = locale as Locale
  const t = await getTranslations({ locale, namespace: 'legal' })
  const markdown = loadLegalMarkdown(slug, typedLocale as LegalLocale)

  // Friendly "coming soon" state when the markdown hasn't been
  // provided yet. The page is still navigable so a direct link works
  // while the final copy is in review. Wave G: gentle fade in so the
  // placeholder feels intentional, not like a missing page.
  if (!markdown) {
    return (
      <Container className="py-16 md:py-20 max-w-3xl text-center">
        <Reveal>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)] mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t(`${slug}.title`)}
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="text-base italic text-[var(--color-muted)] leading-relaxed">
            {t('comingSoon')}
          </p>
        </Reveal>
      </Container>
    )
  }

  const { heading, body } = splitLegalMarkdown(markdown)
  const html = renderLegalMarkdown(body)
  const pageHeading = heading ?? t(`${slug}.title`)

  // Wave G — "quiet print" treatment. The page title lives in the
  // display serif, centered, with a hairline rule beneath. Body
  // prose gets a sage drop-cap on the first paragraph via
  // `[&>p:first-child]:first-letter:*` utilities so we don't need
  // a plugin. Line-height is nudged up to 1.85 for long-form
  // legibility.
  return (
    <Container className="py-12 md:py-20 max-w-3xl">
      <header className="text-center mb-10 md:mb-14">
        <Reveal>
          <h1
            className="text-3xl md:text-5xl font-extrabold text-[var(--color-primary-dark)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {pageHeading}
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <div
            aria-hidden
            className="mx-auto mt-6 h-px w-24 bg-[var(--color-primary)]/40"
          />
        </Reveal>
      </header>
      <Reveal delay={220}>
        <div
          className="prose prose-sm md:prose-base max-w-none text-[var(--color-foreground)] [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-primary-dark)] [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[var(--color-primary-dark)] [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:leading-[1.85] [&_ul]:list-disc [&_ul]:ps-6 [&_ul]:mb-4 [&_li]:mb-1 [&_a]:text-[var(--color-primary)] [&_a]:underline [&>p:first-of-type]:first-letter:text-5xl [&>p:first-of-type]:first-letter:font-extrabold [&>p:first-of-type]:first-letter:text-[var(--color-primary)] [&>p:first-of-type]:first-letter:me-2 [&>p:first-of-type]:first-letter:float-start [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:mt-1 [&_h2]:font-[family-name:var(--font-display)]"
          style={{ fontFamily: 'var(--font-body)' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Reveal>
    </Container>
  )
}
