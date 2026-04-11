# Admin surfaces — what exists and why

**Audience:** Future contributors + future-me. This is the canonical
map of every admin surface Yarit sees. Each entry answers three
questions: **What is it?**, **What does Yarit use it for?**, and
**Why does it exist in the admin (or why was it removed)?**

Read this before adding or removing ANY admin surface. The goal is
purposeful minimalism — every entry point must exist for a reason
Yarit understands.

_Last updated: 2026-04-10 (Round 5)._

---

## Entry points Yarit sees

### 1. `/admin` — `YaritDashboard`

**What:** The dashboard homepage, a replacement for Payload's default
`/admin` view. Shows a time-synced Hebrew greeting ("בוקר טוב ירית
☀️" etc.), 6 stat cards (open orders, urgent, published products,
drafts, low stock, customers), and an 8-tile action grid.

**Used for:** Yarit's home base — every common task is one click
away. She never has to navigate Payload's default collection list
first.

**Why:** Payload's default dashboard is a developer affordance
("welcome to Payload") and doesn't mean anything to a 65-year-old
merchant. YaritDashboard was built so the first thing she sees is
her own store in her own language.

**File:** `src/components/admin/payload/YaritDashboard.tsx`

---

### 2. `/admin/fulfillment` — `FulfillmentView` (custom view)

**What:** A dedicated "ניהול הזמנות" (order management) dashboard
that groups paid orders into 5 buckets by fulfillment status, with
one-click action buttons per row that advance each order through
the state machine (`awaiting_forever_purchase` → `forever_purchased`
→ `packed` → `shipped` → `delivered`). Empty state shows the
illustrated watercolor apothecary jar.

**Used for:** Yarit's daily workflow. When a customer pays, the
order shows up in the "לטיפול דחוף" bucket. She walks it through
the buckets until it's delivered. This is the single most-used
admin surface in the whole panel.

**Why:** Payload's default order list shows every order as a flat
row — there's no concept of "which orders need my attention first."
FulfillmentView exists to replace that raw list with a workflow
that matches how Yarit actually thinks about orders.

**File:** `src/components/admin/payload/FulfillmentView.tsx`
(registered via `admin.components.views.fulfillment` in
`src/payload.config.ts`)

---

### 3. `/admin/collections/products` — Products list + edit

**What:** Payload's default list + edit views for the Products
collection. Hebrew column headers, warm parchment row styling, sage
H1, "שמרי ✓" save button.

**Used for:** Add a new product, edit an existing product's price
or description, upload a new product image, mark a product as a
draft, etc.

**Why:** Core data. The entire shop is built on this.

**Files:** `src/collections/Products.ts`

---

### 4. `/admin/collections/categories` — Categories list + edit

**What:** Payload's default list + edit views for Categories.

**Used for:** Rearranging how products are grouped on the shop
(e.g. "Skincare", "Nutrition", "Gifts"). Each category has a
localized title, an optional image for the category tile, and an
optional self-reference to a parent category.

**Why:** The storefront's `/shop?category=...` filter reads this.
Without categories there's no browsing structure.

**Files:** `src/collections/Categories.ts`

---

### 5. `/admin/collections/orders` — Orders list + edit

**What:** Payload's default list + edit views for the Orders
collection — the "heavyweight" view that shows every field on
every order (line items, shipping address, totals, payment
provider, fulfillment notes, etc.).

**Used for:** Looking up an old order ("what did customer X buy in
March?"), editing a shipping address mistake, or reading
fulfillment notes on a specific order. Day-to-day order handling
happens in `/admin/fulfillment`, not here.

**Why:** Power-user fallback for when the fulfillment view doesn't
show everything Yarit needs.

**Files:** `src/collections/Orders.ts`

---

### 6. `/admin/collections/users` — Users list + edit

**What:** Payload's default list + edit views for the Users
collection. Users have a `role` discriminator (`admin` | `customer`)
— Yarit herself is the sole admin, everyone else is a customer
auto-created at checkout.

**Used for:** Looking up a customer's contact info, changing a
customer's preferred locale, or (rarely) creating a new admin user.

**Why:** Required by Payload — every admin panel needs a users
collection for authentication.

**Files:** `src/collections/Users.ts`

---

### 7. `/admin/globals/site-settings` — Site settings global

**What:** Payload's default edit view for the SiteSettings global
— shop identity, logo, hero images, announcement bar, contact info,
social links, shipping rules.

**Used for:** "Change my phone number", "add a new announcement
above every page", "update the WhatsApp link", "change shipping
rates".

**Why:** Every non-product piece of text/config on the storefront
reads from here.

**Files:** `src/globals/SiteSettings.ts`

---

### 8. `/admin/account` — Payload built-in account page

**What:** Payload's built-in account editor. Lets the logged-in
user change their email, password, two-factor, the admin panel
language (Hebrew/English toggle), and the admin theme.

**Used for:**
- Changing Yarit's password
- Switching the admin UI between Hebrew and English

**Why:** The admin UI language switcher lives here, not anywhere
else. Until Round 5 there was no dashboard tile pointing to this
page, which meant Yarit couldn't find the language switch. Round 5
added the 🔑 "חשבון, שפה וסיסמה" tile that deep-links here.

**File:** Payload built-in (not in this repo). Discoverability is
provided by the dashboard tile in `YaritDashboard.tsx`.

---

## Chrome elements (always visible in every admin view)

### Sidebar top — `SidebarGreeting`

**What:** Small greeting block at the top of the admin nav: "שלום,
Yarit 🌿" + "ברוכה הבאה לפאנל הניהול".

**Used for:** Reassurance that Yarit is logged in as herself.

**Why:** Identity indicator. Round 5 removed the help link that
used to live here — the help affordance now lives ONLY in
`HelpButton` to avoid three duplicate "?צריכה עזרה" links.

**File:** `src/components/admin/payload/SidebarGreeting.tsx`

---

### Sidebar bottom — `SidebarFooter`

**What:** Three quick-action links at the bottom of the nav:
"← לאתר החי" (opens `/` in a new tab), "📦 ההזמנות החדשות" (jumps
to `/admin/fulfillment`), "← יציאה" (logout).

**Used for:** Escape routes. Yarit can always get out or jump to
the order queue from anywhere.

**Why:** Most-used shortcuts pinned to the bottom of the nav so
they're visible without scrolling.

**File:** `src/components/admin/payload/SidebarFooter.tsx`

---

### Top-right action — `HelpButton`

**What:** A pill button "?צריכה עזרה" in the admin's top-right
action bar.

**Used for:** Click to send Nir an email pre-filled with a Hebrew
subject line.

**Why:** Round 5 changed this from a link to an external GitHub
markdown file to a `mailto:` link. Rationale: Yarit is 65 and
non-technical — raw markdown on GitHub is not a help experience.
An email that arrives in Nir's inbox, gets answered in ~30 minutes,
is real support.

**File:** `src/components/admin/payload/HelpButton.tsx`

---

### Top-right action — `ViewOnSite`

**What:** A pill button "🌿 צפייה באתר ↗" in the admin's top-right
action bar. Opens the storefront homepage in a new tab.

**Used for:** Previewing the live store after editing without
losing admin position.

**Why:** The round trip "edit → save → see what it looks like" is
the single most common admin workflow after actually editing.

**File:** `src/components/admin/payload/ViewOnSite.tsx`

---

## Invisible providers (no UI, wire up behavior)

These are registered in `admin.components.providers` in
`src/payload.config.ts`. They don't render visible UI on their own
but wrap the admin tree with behavior. **Critical reminder:** every
admin provider MUST accept and render `{children}` or the entire
admin below it disappears — see the comment block at the top of
`AdminThemeInit.tsx` for the full incident post-mortem.

- **`AdminThemeInit`** — Reads `shoresh-theme` from localStorage on
  mount and applies `data-theme` to `<html>`, so the admin follows
  the storefront's light/dark choice.
- **`AdminToaster`** — Mounts react-hot-toast at bottom-center with
  Warm Night brand tokens, 4s duration, RTL-aware. Success variant
  uses a brand gradient.
- **`AdminDriftingLeaves`** — Mounts the shared `<DriftingLeaves>`
  SVG decoration behind admin content at `z-index: 0`. Subtle
  atmospheric movement.
- **`OnboardingTour`** — Fires a 4-step driver.js walkthrough on
  first visit to `/admin`, persisted in `yarit-onboarding-complete`
  localStorage flag. Silent on every subsequent load.

---

## Graphics

- **`BrandLogo`** — Copaia tree + wordmark, shown on the login
  page and anywhere Payload renders `<Logo>`. Reads `brand.name.he`
  from `brand.config.ts` for alt text and display text (no more
  hardcoded Hebrew — refactored during the 2026-04-11 rename).
- **`BrandIcon`** — Compact tree mark, shown in the sidebar
  icon slot. Also reads `brand.name.he` from `brand.config.ts`.

Both live in `src/components/admin/payload/`.

---

## Hidden collections (still in the data model, gone from sidebar)

### `Tags` collection — `admin.hidden: true`

**Why hidden:** Nothing on the storefront queries `product.tags`.
The tagging field on Products is still in the schema, the Tags
collection REST endpoint still works (so seeds can run), but the
sidebar nav item and the product-edit `tags` field are both hidden
to eliminate confusion. To re-enable: flip `hidden: false` in
`src/collections/Tags.ts` + `src/collections/Products.ts` (the
`tags` field block). Takes about 30 seconds.

**File:** `src/collections/Tags.ts`

### `Media` collection — `admin.hidden: true`

**Why hidden:** A standalone "media gallery" has no user-facing
purpose — every storefront surface reads images via a relationship
(product.images, category.image, siteSettings.logo,
siteSettings.heroImages). Uploading to the Media list directly
orphans the image. Payload's inline image picker on product/
category forms still uses the Media collection under the hood, so
Yarit's workflow ("edit product → upload image") is unchanged. The
goal was to eliminate the *other* workflow ("go to gallery → upload
→ wonder why nothing shows up").

**File:** `src/collections/Media.ts`

---

## Surfaces intentionally NOT built

### A separate "customers" view

Payload's Users collection already covers this. Customers are
Users with `role: 'customer'`. A dedicated customer view would
duplicate the existing edit form.

### A "tags" sidebar link + filter UI on the storefront

Covered above. Re-enable the collection in one line when the
storefront filter UI ships.

### An in-admin help page that renders YARIT-ADMIN-GUIDE.md

Considered during Round 5. Rejected in favor of the mailto link
because (a) Yarit is 65 and will email rather than read docs, and
(b) a full in-admin docs surface is much more work than a one-line
href change.

### A dashboard tile for "Users" / "Customers"

Considered during Round 5. Rejected — Yarit rarely needs to look
up a customer directly, and when she does the top-right nav has
the Users link. A tile would take up dashboard real estate without
being used often enough to justify it.

---

## Rules for adding a new admin surface

1. **Answer the three questions** (what / used for / why) BEFORE
   writing the component.
2. **If the answer to "why" is "because Payload lets us," the
   surface is a NO.** Every entry point must exist for Yarit, not
   for the framework.
3. **Update this doc** as part of the same commit that adds the
   surface. If it's not in ADMIN-SURFACES.md, it doesn't exist.
4. **If in doubt, hide don't delete.** `admin.hidden: true` is
   cheap to revert. Schema deletes cascade through the DB.
