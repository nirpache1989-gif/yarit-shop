/**
 * @file MeetYarit — small personal story strip
 * @summary Server shell that fetches the translations and delegates
 *          the full layout + scroll-driven converge animation to
 *          `MeetYaritMotion` (client). See MeetYaritMotion.tsx for
 *          the detailed design notes.
 *
 *          Why the split: Tier-1 GSAP upgrade T1.1 adds a
 *          ScrollTrigger-based slide-in from opposite edges for the
 *          image and text columns. That requires DOM refs and the
 *          `useGsapScope` hook, which only work in client components.
 *          Keeping the translation lookup here on the server side
 *          honors the CLAUDE.md rule against passing function props
 *          across the server/client boundary.
 *
 *          See: docs/DECISIONS.md — design review punchlist F1.
 */
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { MeetYaritMotion } from './MeetYaritMotion'

type Props = {
  locale: Locale
}

export async function MeetYarit({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'meetYarit' })

  return (
    <MeetYaritMotion
      eyebrow={t('eyebrow')}
      heading={t('heading')}
      body={t('body')}
      readMore={t('readMore')}
      imageAlt={t('imageAlt')}
    />
  )
}
