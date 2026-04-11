/**
 * @file AdminLangSwitcher — permanent Hebrew/English toggle in the admin top-right
 * @summary Client component registered via `admin.components.actions`. Renders a
 *          pill that shows the OPPOSITE language (so clicking flips to that one).
 *          Uses Payload's built-in `useTranslation()` hook from `@payloadcms/ui`,
 *          which exposes `i18n.language` (current) and `switchLanguage(next)` —
 *          the exact same preference write path Payload's own `LanguageSelector`
 *          on /admin/account uses (see `node_modules/@payloadcms/next/dist/views/
 *          Account/Settings/LanguageSelector.js`). So the two controls stay in
 *          sync automatically.
 *
 *          Why this exists: Yarit couldn't find the built-in language selector
 *          because Payload renders it in the `AfterFields` slot at the bottom of
 *          the /admin/account form. On a long Hebrew form with email / password /
 *          name fields stacked up, she never scrolled down far enough to see it.
 *          This pill surfaces the same control permanently in the top-right of
 *          every admin page, one click from anywhere.
 *
 *          Side effects of flipping:
 *            - Collection group labels ({ en, he } objects in Products.ts,
 *              Categories.ts, etc.) flip automatically because Payload reads
 *              them per-language
 *            - Our custom SidebarGreeting / SidebarFooter / HelpButton flip
 *              because they were updated to read `props.i18n.language` too
 *            - Payload's own labels ("save", "delete", etc.) flip via the
 *              `@payloadcms/translations` bundle
 *
 *          Styled by `.yarit-lang-switcher` in admin-brand.css — mirrors the
 *          `.yarit-view-on-site` pill treatment for visual consistency.
 *
 *          ⚠ PAYLOAD INTERNAL: depends on the `useTranslation` hook from
 *          `@payloadcms/ui` exporting `{ i18n, switchLanguage }`. Payload 4.x
 *          may rename or restructure this. Re-check after every Payload upgrade.
 */
'use client'

import { useTranslation } from '@payloadcms/ui'

export function AdminLangSwitcher() {
  const { i18n, switchLanguage } = useTranslation()
  const current = i18n.language
  const next = current === 'he' ? 'en' : 'he'
  // Label shows the language you'll GET when you click (standard toggle UX).
  const nextLabel = next === 'he' ? 'עברית' : 'English'
  const title =
    current === 'he'
      ? 'החלפה לאנגלית / Switch to English'
      : 'החלפה לעברית / Switch to Hebrew'

  const handleClick = async () => {
    // `switchLanguage` is typed optional in @payloadcms/ui's context because
    // the provider might be missing it in edge cases — inside an admin page
    // with a mounted TranslationProvider it's always defined, but we guard
    // anyway to keep the type check honest.
    if (!switchLanguage) return
    try {
      await switchLanguage(next)
    } catch (err) {
      // switchLanguage updates Payload's internal preference and re-renders
      // the admin tree. A network or auth failure here is extremely rare
      // (same origin, already-authenticated) but we don't want an unhandled
      // rejection in the console if it happens.
      console.error('[AdminLangSwitcher] switchLanguage failed', err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="yarit-lang-switcher"
      title={title}
      aria-label={title}
    >
      <span aria-hidden>🌐</span>
      <span>{nextLabel}</span>
    </button>
  )
}
