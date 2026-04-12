# Next session — QA walkthrough + design polish + GSAP motion picks

> **Purpose:** The admin P0 is FIXED and deployed to prod (2026-04-12 late night). Yarit can use her admin panel. The storefront is fully working. This session's job is (1) a mini bug fix from the admin panel, (2) full QA walkthrough on prod, (3) 4 design polish picks, and (4) 2 GSAP motion additions.
>
> **Read first:** `CLAUDE.md`, then `docs/STATE.md` (read the top "Latest" entry for the admin fix details), then come back here.
>
> **Feature branch `feat/brand-rename`** (5 commits: Copaia rename, new catalog, admin UX, motion polish) is still parked on the remote, never merged to main. That branch holds the Copaia rebrand + 8-product catalog + Track B admin UX + Track D GSAP motion from 2026-04-11. It is NOT deployed to prod. Decision: merge to main and deploy AFTER QA confirms the current main is stable. Ask user before merging.

---

## 🐛 P1 — Fix product list row click (5 min)

**Bug:** In the admin `/admin/collections/products` list, clicking on a product row does NOT navigate to the edit page. Direct URL `/admin/collections/products/<id>` works fine.

**Root cause:** The custom `ProductThumbnailCell` server component (registered as `admin.components.Cell` on the `images` field in `Products.ts`) renders a plain `<img>` tag that replaces Payload's default cell renderer. Payload's default cell renders inside a `<Link>` that provides row-click navigation. Our custom cell bypasses that Link.

**Fix:** Wrap the `ProductThumbnailCell` return value in Payload's `Link` component. The cell already has access to `props.rowData` — construct the edit URL from the row's ID:

```tsx
// In ProductThumbnailCell.tsx, wrap the return:
import Link from 'next/link'

// ... inside the function, replace the bare <img> return with:
const editUrl = `/admin/collections/products/${props.rowData?.id ?? ''}`
return (
  <Link href={editUrl}>
    <img src={url} alt={alt} className="yarit-thumb-cell" width={48} height={48} loading="lazy" />
  </Link>
)
```

Note: `next/link` is OK here because this is admin code, not storefront (CLAUDE.md rule #2 only applies to storefront). Test by clicking a thumbnail in the product list.

**Alternatively**, if Payload 3.82 provides a `cellLink` prop or a wrapper — check `@payloadcms/next/dist/views` for how the default table cells render. The fix might be simpler: pass a `link: true` prop or similar.

---

## Track 1 — Full prod QA walkthrough (~30% of time)

Walk every route on `https://yarit-shop.vercel.app` in a **real browser** (Claude-in-Chrome MCP, not curl):

**Storefront routes:**
- `/` and `/en` — hero entrance motion, TrustBar, MeetYarit, CategoryGrid, FeaturedProducts, Testimonials, BranchDividers, Footer
- `/en/shop` and `/shop` — 8 product cards (currently old Shoresh-era names in prod Neon), filter chips, Ken Burns on cards
- `/en/product/<slug>` — try at least 2 products, check gallery, JSON-LD, add-to-cart
- `/en/cart` — empty state, add flow, quantity adjust, press bounce
- `/en/checkout` — form, mock payment
- `/en/about`, `/en/contact` — long-form content, ContactBG1 backdrop
- `/en/account` — requires login
- Mobile (375x812): no horizontal scroll, hamburger drawer, 2-col shop grid
- Dark mode: every route, check contrast

**Admin routes:**
- `/admin` — dashboard, stats, tile grid, sidebar nav
- `/admin/collections/products` — list, thumbnail column, row click (after P1 fix)
- `/admin/collections/products/<id>` — edit form, all fields, save
- `/admin/collections/categories` — list + edit
- `/admin/collections/orders` — list
- `/admin/globals/site-settings` — all fields
- `/admin/fulfillment` — custom view renders

**Checklist:**
- 0 console errors
- 0 500s
- 0 404 images
- `tsc + lint + build` green
- Hebrew + English both work on storefront and admin

---

## Track 2 — 4 design refinements (~20%)

Re-confirmed from the previous session prompt:

1. **Favicon refresh** (#9): generate `src/app/icon.png` (512x512) + `src/app/apple-icon.png` (180x180) from `public/brand/copaia.png`. Sharp is already a dep.
2. **OG / social share card** (#10): `src/app/opengraph-image.tsx` using `next/og` ImageResponse (1200x630). Copaia logo + tagline on parchment.
3. **Footer conditional rendering** (#4): guard contact rows against empty/placeholder values using `isPlaceholder()` from `src/lib/siteSettings.ts`.
4. **Admin chrome warmth** (#7): replace hardcoded hex in `admin-brand.css` with `var(--color-*)` tokens.

---

## Track 3 — 2 GSAP motion picks (~15%)

1. **Checkout success confetti** (#3): `fireConfetti('celebration')` on checkout success page mount.
2. **Cart drawer item stagger** (#1): 40ms stagger + 12px y-offset for items entering cart drawer.

**Non-negotiables:**
- `immediateRender: false + once: true + start: 'top bottom-=40'` on every `gsap.from + scrollTrigger`
- Single GSAP entry point: `import { gsap } from '@/lib/motion/gsap'`
- Additive only — never remove existing keyframes
- Every GSAP component must use `useGsapScope`
- Reduced motion must always be handled

---

## ⚠️ importMap gotcha (CRITICAL for this session and all future sessions)

**If you change `payload.config.ts` in a way that adds/removes plugins or collection fields with custom admin components:**

You MUST regenerate the importMap. Payload's CLI (`npx payload generate:importmap`) has a module resolution bug on Node 24, so for now:

1. Check what components the new/changed plugin registers
2. Manually add/remove the corresponding import + map entry in `src/app/(payload)/admin/importMap.js`
3. If the plugin only loads conditionally (like `vercelBlobStorage` which gates on `BLOB_READ_WRITE_TOKEN`), add the entry REGARDLESS — it's harmless when unused but crashes the admin when missing

The root cause of the previous session's P0 was exactly this: `VercelBlobClientUploadHandler` was missing from the importMap because the Vercel Blob plugin only loads when the env var is set, and local dev doesn't set it.

---

## Non-negotiables (same every session)

1. **Never `git push origin main` without explicit user word** ("push")
2. **Never `npx vercel --prod --yes` without explicit user word** ("deploy")
3. **Motion is additive only** — never remove existing keyframes
4. **`setRequestLocale` + `await params` / `await searchParams`** in every server page/layout
5. **Never import `next/link` in storefront** — use `Link` from `@/lib/i18n/navigation`
6. **Single GSAP entry point** — `@/lib/motion/gsap`
7. **Brand data stays in `src/brand.config.ts`**
8. **Server -> client props are serializable only** — no function props
9. **Hebrew + English strings through `src/messages/{he,en}.json`**
10. **Never re-add `generateStaticParams` returning only `{locale}`** — CI fails per ADR-018
11. **Every `gsap.from + scrollTrigger` gets `immediateRender: false + once: true + start: 'top bottom-=40'`**
12. **Prod DB changes require explicit user approval**
13. **If you touch payload.config.ts plugins/collections, regenerate importMap manually** — see the importMap gotcha above

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors 0 warnings
npm run build           # must exit 0, 40 routes, zero SSG
```

**Dev server:** `npm run dev` -> `http://localhost:3000`

**Prod admin creds (SET DURING 2026-04-12 SESSION — CHANGE IMMEDIATELY):**
- URL: `https://yarit-shop.vercel.app/admin/login`
- Email: `admin@shoresh.example`
- Password: `CopaiaTemp2026!`

---

## Definition of done

- [ ] P1 product list row click fixed, verified on prod
- [ ] Full QA walkthrough complete, issues fixed or documented
- [ ] Track 2 — 4 design refinements shipped
- [ ] Track 3 — 2 GSAP motion additions shipped
- [ ] All quality gates green
- [ ] `docs/STATE.md` updated with session changelog
- [ ] `docs/NEXT-SESSION.md` refreshed
