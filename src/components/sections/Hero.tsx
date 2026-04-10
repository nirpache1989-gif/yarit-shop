/**
 * @file Homepage hero section
 * @summary Centered hero with the Shoresh logo, a word-by-word
 *          headline reveal, subheadline, and dual CTAs.
 *
 *          Background layers (Wave HeroBG2 — user request):
 *            1. Base watercolor botanical frame (`hero-bg-2.png`) —
 *               a cream field with lavender, olive, chamomile, and
 *               herb sprigs framing the top + bottom edges. Wrapped
 *               in a slow Ken Burns (tl) for 22s cinematic drift.
 *               Renders at full opacity so the botanical detail is
 *               actually visible (the old 0.4 opacity pass was
 *               "swallowing" the previous wash).
 *            2. DARK MODE ONLY — second layer showing
 *               `night/night-leaves-1.jpg` at 22% opacity with
 *               counter-direction Ken Burns (tr) so the two layers
 *               don't move in sync.
 *            3. Cream radial vignette behind the logo — a soft
 *               cream→transparent circle that brightens the center
 *               of the frame so the pale Shoresh logo pops instead
 *               of disappearing into the botanical print.
 *            4. Logo: enlarged to h-64/h-96 (from h-56/h-72) and
 *               wrapped in `.leaf-breathe` for the 5.5s breathing
 *               loop. Sits on the cream vignette, which sits on the
 *               botanical frame, which sits on the page bg.
 *            5. Headline / subheading / CTAs: motion unchanged from
 *               the design sprint — SplitWords staggered reveal,
 *               fade-up cascade.
 *
 *          All motion respects prefers-reduced-motion via the global
 *          guard at the bottom of globals.css.
 */
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { brand } from '@/brand.config'
import { KenBurns } from '@/components/motion/KenBurns'
import { SplitWords } from '@/components/motion/SplitWords'

export async function Hero() {
  const t = await getTranslations('home')

  return (
    <section className="hero-section relative overflow-hidden py-16 md:py-24 min-h-[560px] md:min-h-[720px]">
      {/* Layer 1 — watercolor botanical frame. Full opacity — the
          image itself is already soft/washed so we don't need to
          dim it. Drifts on a 22s Ken Burns loop. */}
      <div className="absolute inset-0 -z-0" aria-hidden>
        <KenBurns variant="tl">
          <Image
            src="/brand/ai/hero-bg-2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </KenBurns>
        {/* Top + bottom gradient fade so the frame blends into the
            page background seamlessly instead of ending on a hard
            edge. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/20 via-transparent to-[var(--color-background)]/60" />
      </div>

      {/* Layer 2 — DARK MODE ONLY. Gold-leaf stone in counter drift
          (tr) so the two KB layers don't move in sync. Hidden in
          light mode via Tailwind's `hidden dark:block` utility. */}
      <div
        className="absolute inset-0 -z-0 hidden dark:block opacity-25"
        aria-hidden
      >
        <KenBurns variant="tr">
          <Image
            src="/brand/ai/night/night-leaves-1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </KenBurns>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/60 via-[var(--color-background)]/20 to-[var(--color-background)]" />
      </div>

      {/* Layer 3 — cream radial vignette behind the logo + headline
          + subheading + CTAs so none of them get swallowed by the
          busy watercolor botanical frame. Positioned to cover the
          entire central content area, not just the logo. */}
      <div
        className="absolute inset-x-0 inset-y-[8%] -z-0 mx-auto max-w-3xl pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_80%,transparent)_40%,color-mix(in_oklab,var(--color-background)_40%,transparent)_65%,transparent_85%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-background)_0%,color-mix(in_oklab,var(--color-background)_70%,transparent)_45%,color-mix(in_oklab,var(--color-background)_30%,transparent)_70%,transparent_90%)]" />
      </div>

      <Container className="relative flex flex-col items-center text-center gap-8 md:gap-10">
        <div className="logo-halo relative animate-fade-up">
          <span className="leaf-breathe inline-block">
            <Image
              src="/brand/logo.png"
              alt={brand.name.en}
              width={500}
              height={750}
              priority
              className="h-64 md:h-96 w-auto object-contain relative z-10 drop-shadow-[0_6px_18px_rgba(24,51,41,0.18)]"
            />
          </span>
        </div>
        <div className="space-y-4">
          {/* Hero headline — solid primary-dark color (NOT
              iridescent-heading). The iridescent gradient relies on
              `background-clip: text` on the h1 which doesn't reach
              the word glyphs when SplitWords wraps each word in an
              inline-block span (inline-block creates its own
              painting context and the parent's clipped background
              no longer paints through). Switched to a solid display
              serif here so the headline is actually visible over
              the botanical-frame hero.

              Color is set via inline style rather than Tailwind's
              arbitrary-value text color utility because the latter
              was losing to the body color cascade at the h1 level
              and leaving the headline in the body foreground color.
              Inline style beats any utility, guaranteed. The CSS
              variable `--color-primary-dark` resolves per-theme
              automatically because it has different values in the
              :root block and the [data-theme="dark"] block of
              globals.css. */}
          <SplitWords
            as="h1"
            className="hero-headline text-5xl md:text-7xl leading-[1.05] max-w-3xl font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-primary-dark)',
            }}
            baseDelay={320}
            stagger={200}
          >
            {t('heroHeadline')}
          </SplitWords>
          <p
            className="text-base md:text-lg text-[var(--color-muted)] max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: '560ms' }}
          >
            {t('heroSubheadline')}
          </p>
        </div>
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-up"
          style={{ animationDelay: '740ms' }}
        >
          <Button href="/shop" variant="primary" size="lg">
            {t('heroCta')}
          </Button>
          <Button href="/about" variant="secondary" size="lg">
            {t('heroSecondaryCta')}
          </Button>
        </div>
      </Container>
    </section>
  )
}
