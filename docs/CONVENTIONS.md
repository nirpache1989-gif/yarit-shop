# Code conventions

## File headers

Every critical file in `src/collections/`, `src/lib/`, `src/app/api/`, `src/app/(payload)/`, and any non-trivial component gets a JSDoc header:

```ts
/**
 * @file What this file is
 * @summary One paragraph on purpose and non-obvious gotchas. Link to
 *          the relevant doc with "See: docs/FOO.md §section".
 */
```

The summary is for the human or AI reader who opens this file with zero context. Put anything they'd otherwise have to guess (non-obvious invariants, why we did X instead of Y, where the related state lives) here.

## Naming

- **Components:** PascalCase, one per file. File name matches the default export (`Header.tsx` exports `Header`).
- **Collections:** PascalCase, one per file in `src/collections/`. File name matches the exported const (`Products.ts` exports `Products`).
- **Utility modules:** kebab-case files, camelCase exports. (`src/lib/cart/store.ts` exports `useCartStore`.)
- **Constants:** `UPPER_SNAKE_CASE` for module-level constants, `camelCase` for object members.
- **Types/interfaces:** PascalCase, same file as their primary consumer or in a `types.ts` sibling.

## Path aliases

- `@/*` → `./src/*` — use everywhere except inside `src/payload.config.ts`.
- `@payload-config` → `./src/payload.config.ts` — use inside `(payload)/` route files only.

Do not import relative paths more than one directory up. If you need `../../foo`, use `@/foo`.

## Strings (critical)

**No hardcoded UI strings anywhere.** Every piece of user-visible text goes through `src/messages/{he,en}.json`.

```ts
// WRONG
<button>Add to cart</button>

// RIGHT
const t = useTranslations('product')
<button>{t('addToCart')}</button>
```

When adding a new string:
1. Add the key to `messages/he.json` (source of truth — Hebrew first)
2. Add the same key to `messages/en.json`
3. Import `useTranslations('namespace')` in the component
4. Reference with `t('key')`

Namespaces currently defined: `common`, `nav`, `home`, `footer`, and anything else you add.

## Locale-aware navigation

Always import `Link` from `@/lib/i18n/navigation`, **never** from `next/link`:

```ts
// WRONG
import Link from 'next/link'

// RIGHT
import { Link } from '@/lib/i18n/navigation'
```

The `next/link` bypass would strip the locale prefix and break language switching.

## Async server components (Next 16)

`params` and `searchParams` are **always** Promises. Always `await` them:

```ts
// WRONG (throws at runtime in Next 16)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
}

// RIGHT
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

Same for `cookies()`, `headers()`, `draftMode()`.

## Server vs client components

Default to **server components**. Add `'use client'` only when you need:
- React state/effects (`useState`, `useEffect`, ...)
- Browser APIs (`localStorage`, `window`, ...)
- Event handlers (`onClick`, `onChange`, ...)
- Zustand store subscriptions

`useTranslations` from next-intl works in both, provided `setRequestLocale(locale)` was called for the current request.

## Brand tokens and styling

- Use CSS variables for colors: `bg-[var(--color-primary)]`, `text-[var(--color-muted)]`, etc.
- Don't hardcode hex values in components.
- If you need a new color token, add it to both `src/brand.config.ts` and `src/app/globals.css` (the `@theme` block).

## Commits

- Commit messages: lowercase, imperative mood, scope prefix optional (`feat: add product card`, `fix(cart): rejects forever items`).
- Squash-merge PRs to keep main history clean.
- **Do not commit:** `.env.local`, `shoresh-dev.db`, anything in `node_modules` or `.next`. `.gitignore` handles these.

## When in doubt

Read `CLAUDE.md` and the docs in `docs/`. If you still can't decide, leave a comment in the code explaining the choice so the next reader doesn't have to guess.
