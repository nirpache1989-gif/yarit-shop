# Session 21 — Living Garden Phase 3: Shop page (`/shop`)

> **Branch:** `feat/living-garden` (merged into `main` at end of session 20 per user direction; keep working on `feat/living-garden` until the whole redesign ships).
> **Prod:** unchanged pending a future explicit `deploy`.
> **Read first (in this order):** `CLAUDE.md` → `docs/AI-COLLABORATION.md` → `docs/NEXT-SESSION.md` → `docs/DESIGN-LIVING-GARDEN.md` → `docs/CODEMAP.md`. Then skim the prior session: [`docs/sessions/session-20-home-page.md`](sessions/session-20-home-page.md).
>
> **Preview first.** Open `New/handoff/design/LivingGarden/shop.html` in a browser before touching any code. Pay attention to the page-title block, the 240px sidebar with category + price + concern + availability filter groups, the `.g-shop-header` row with the count + sort select, the `.g-grid-4` product grid (reuses `ProductCardLivingGarden`), and the pagination strip.

---

## Where we are

Session 20 shipped the Living Garden Home page. Every Home section is now `.g-*`-styled with `RevealOnScroll` + `GardenAlive` wired up. **Only Home is Living Garden so far** — the rest of the storefront still renders the old Night Apothecary design.

The reusable Living Garden card (`ProductCardLivingGarden` at [src/components/product/ProductCardLivingGarden.tsx](../src/components/product/ProductCardLivingGarden.tsx)) is the template for any product grid from now on. Reuse it here verbatim. Don't re-create a Living Garden card.

---

## Scope for session 21

**Build:** `/{locale}/shop` rebuilt end-to-end in Living Garden style, matching `New/handoff/design/LivingGarden/shop.html`.

**Do NOT touch** in this session:
- Any page other than `/shop` — those are sessions 22–27.
- The existing `FeaturedProducts` / `ProductCard` / legacy section files — they still power `/`, but actually Home now uses the new ones. Legacy files stay on disk only because `/product/[slug]`, `/cart`, `/checkout` still import them.
- Payload collections / admin — no schema change this session. Product filtering uses existing fields (`category`, `price`, `type`, `stock`, `status`).
- Global motion primitives (`GardenAlive`, `RevealOnScroll`, `MarqueeBanner`, `AmbientSoundPill`).

### Shop page sections (from `shop.html`)

1. **Page title block** — `.g-page-title` + breadcrumb trail. H1 mixes upright + italic + `.g-under` ("The *whole* garden" / "כל *הגן*").
2. **Shop grid** — `.g-shop-grid` 240px / 1fr. Left: sidebar filter panel (`.g-filter-group` × 4). Right: `.g-shop-header` row (product count + sort select) + `.g-grid-4` product grid + pagination.
3. **Filter groups** — category (from Payload), price (`.g-range` dual-handle), concern tags, availability. Category + availability link to `?cat=…`/`?in-stock=true` URL params; price + concern open later.
4. **Product grid** — `.g-grid-4` (desktop) / `.g-grid-3` / `.g-grid-2` (mobile). Every tile is `ProductCardLivingGarden`.

### Data

- Products: `payload.find({ collection: 'products', where: { status: { equals: 'published' }, ...filters }, sort, limit, page, locale })`. Apply `cat` / `in-stock` query params server-side. `locale` drives localized title/desc.
- Categories: `payload.find({ collection: 'categories', sort: 'order', locale })` for the filter sidebar list + the tile-count stat per category (reuse the `Promise.all(payload.count(...))` pattern from `CategoryGardenLivingGarden`).
- Copy: new `shop` i18n namespace sub-keys matching the prototype `COPY.en/he` (`shopTitle1`, `shopTitleItalic`, `shopTitle2`, `shopLead`, `shopCount`, `shopSort`, `filterCat`, `filterPrice`, `filterConcern`, `filterStock`).

### CSS

All required selectors are already in [src/app/globals.css](../src/app/globals.css) from session 20 + Phase 2 — `.g-page-title`, `.g-breadcrumb`, `.g-shop-grid`, `.g-filter-*`, `.g-shop-header`, `.g-shop-count`, `.g-range`, `.g-grid-4` are all ported. **No CSS porting slice this session** — jump straight into components.

### Slicing plan

1. **Slice 0 — i18n copy.** Extend `shop` namespace in `he.json` + `en.json`. tsc + lint green.
2. **Slice A — page title + layout shell.** `/shop` server page gets `PageTitleLivingGarden` + `.g-shop-grid` skeleton with placeholder sidebar + grid.
3. **Slice B — sidebar filters.** `ShopFiltersLivingGarden` client component reading + writing `?cat=…` / `?in-stock=true` via next-intl's `useRouter` / `useSearchParams`.
4. **Slice C — product grid + shop header.** `ShopGridLivingGarden` rendering `ProductCardLivingGarden` tiles + `.g-shop-header` count/sort.
5. **Slice D — pagination.** Page size 12; `?page=N` query param server-side.
6. **Slice E — verification + docs.** tsc + lint + build green; preview MCP sweep; STATE/TASKS/NEXT-SESSION updated; this prompt archived to `docs/sessions/session-21-shop-page.md`.

### Non-negotiables (unchanged from session 20)

1. Every string through `src/messages/{he,en}.json`.
2. `Link` / `usePathname` / `useRouter` / `useSearchParams` from `@/lib/i18n/navigation`, never `next/link`.
3. `setRequestLocale(locale)` at the top of every server page + `await params` + `await searchParams`.
4. Single GSAP entry point: `@/lib/motion/gsap`. `useGsapScope` for every animator.
5. After every `npm run build`, `git diff src/app/(payload)/admin/importMap.js` — restore if `VercelBlobClientUploadHandler` is wiped.
6. Never push or deploy without the literal user words `push` / `deploy`.
7. RTL: use `inset-inline-start` / `inset-inline-end` (Tailwind `start-*` / `end-*` / `ms-*` / `me-*`) for any absolutely-positioned overlay.

### Design file references

- Raw shop page: `New/handoff/design/LivingGarden/shop.html`
- Styles (already ported): `New/handoff/design/LivingGarden/styles.css`
- Data dictionary: `New/handoff/design/LivingGarden/data.js` (`COPY.en` / `COPY.he`)
- Full design reference: `docs/DESIGN-LIVING-GARDEN.md` §11 "Shop"
- Session 20 shipped building blocks: [`ProductCardLivingGarden`](../src/components/product/ProductCardLivingGarden.tsx), [`FeaturedProductsLivingGarden`](../src/components/sections/FeaturedProductsLivingGarden.tsx) (for the query pattern), [`CategoryGardenLivingGarden`](../src/components/sections/CategoryGardenLivingGarden.tsx) (for the per-category count pattern).

---

## Working directory + quality gates

```bash
cd "C:/AI/YaritShop/yarit-shop"
npx tsc --noEmit        # must exit 0
npm run lint            # must exit 0, 0 errors (2 pre-existing prototype warnings OK)
npm run build           # must exit 0
git diff "src/app/(payload)/admin/importMap.js"     # expect empty; restore from HEAD if wiped
```

Dev server auto-picks a free port via `.claude/launch.json` `autoPort: true`. Preview MCP uses the `yarit-shop dev` entry.

---

## Definition of done for session 21

- [ ] `/shop` renders the Living Garden page title + sidebar filters + product grid + pagination end-to-end.
- [ ] Category filter + availability filter URL-sync via `?cat=…` / `?in-stock=true`.
- [ ] `ProductCardLivingGarden` reused verbatim for every grid tile.
- [ ] Both locales (`/en/shop`, `/he/shop`) render correctly; RTL filter panel lays out on the trailing edge.
- [ ] Mobile breakpoint (<900px) collapses sidebar above grid (or behind a drawer — matches prototype behavior).
- [ ] `npx tsc --noEmit && npm run lint && npm run build` green.
- [ ] `importMap.js` diff empty.
- [ ] `docs/STATE.md` updated with session 21 changelog entry.
- [ ] Session 22 prompt written (`/product/[slug]` rebuild — notes that this is when Products get `plate` / `specimen` / `badge` fields added to the collection).
- [ ] This prompt archived to `docs/sessions/session-21-shop-page.md` + indexed in `docs/sessions/README.md`.
