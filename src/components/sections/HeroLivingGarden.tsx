/**
 * @file Living Garden — Home hero (server shell)
 * @summary Fetches `home.hero` i18n strings and passes them to the
 *          client motion component. No Payload data — pure copy.
 */
import { getTranslations } from 'next-intl/server'
import { HeroLivingGardenMotion } from './HeroLivingGardenMotion'

export async function HeroLivingGarden() {
  const t = await getTranslations('home.hero')

  return (
    <HeroLivingGardenMotion
      kicker={t('kicker')}
      title1={t('title1')}
      title2={t('title2')}
      title3={t('title3')}
      lead={t('lead')}
      cta1={t('cta1')}
      cta2={t('cta2')}
      handwrittenNote={t('handwrittenNote')}
      statYears={t('statYears')}
      statProducts={t('statProducts')}
      statHands={t('statHands')}
      plateTag={t('plateTag')}
      badgeNatural={t('badgeNatural')}
      badgeSmallBatch={t('badgeSmallBatch')}
      visualNote={t('visualNote')}
    />
  )
}
