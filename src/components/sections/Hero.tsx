/**
 * @file Homepage hero section
 * @summary Server component that fetches translations and hands them
 *          off to `<HeroMotion>` (client) which owns all the visual
 *          rendering + GSAP orchestration. See HeroMotion.tsx for the
 *          detailed layer structure, master timeline, and scroll
 *          parallax behavior.
 *
 *          Why the split: the entrance animation and scroll parallax
 *          are one coordinated timeline, and GSAP's useGSAP hook
 *          needs a client component with DOM refs. Keeping
 *          translation lookup in the server parent and passing the
 *          already-resolved strings down honors the CLAUDE.md rule
 *          against passing function props from server to client
 *          components.
 *
 *          Background layers, logo, headline, subheadline, CTAs —
 *          all the JSX lives in HeroMotion. This file is a pure
 *          data-passing boundary now (~20 lines of logic).
 */
import { getTranslations } from 'next-intl/server'
import { brand } from '@/brand.config'
import { HeroMotion } from './HeroMotion'

export async function Hero() {
  const t = await getTranslations('home')

  return (
    <HeroMotion
      headline={t('heroHeadline')}
      subheadline={t('heroSubheadline')}
      cta={t('heroCta')}
      secondaryCta={t('heroSecondaryCta')}
      logoAlt={brand.name.en}
    />
  )
}
