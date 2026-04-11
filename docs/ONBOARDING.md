# Onboarding — from a fresh clone to a running storefront in 5 minutes

This is the runnable version. Copy-paste each block, and by the
end you should have: Copaia running on `localhost:3000`, an admin
login that works, 9 seeded products, and a clean local SQLite
database that never touches production.

## Prerequisites

- **Node.js 20 or newer.** Check with `node --version`. If not
  installed: [https://nodejs.org](https://nodejs.org) (LTS).
- **Git.** `git --version`.
- A terminal. Bash / zsh / PowerShell all work.

## Step 1 — Clone + install

```bash
git clone <your-fork-or-origin>.git yarit-shop
cd yarit-shop/yarit-shop
npm install
```

The install pulls Next 16, Payload 3, Tailwind v4, next-intl 4,
and a handful of small helpers. First run takes ~1 minute.

## Step 2 — Copy the env template

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in exactly one value:

```
PAYLOAD_SECRET=<paste-32-random-bytes-here>
```

Generate a random secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Leave everything else commented out for now. The defaults give you:

- **Local SQLite database** at `./shoresh-dev.db` (because
  `DATABASE_URI` is commented out — Payload auto-falls-back).
- **Mock payment provider** (no real charges).
- **Mock email provider** (emails log to the terminal instead of
  sending). Great for testing the forgot-password flow without a
  Resend account.

## Step 3 — Run the dev server

```bash
npm run dev
```

The storefront is at **http://localhost:3000**. The admin panel is
at **http://localhost:3000/admin**.

First `/admin` visit will complain there's no admin user. That's
expected — fix it in step 4.

## Step 4 — Create the first admin

Open a second terminal (keep `npm run dev` running in the first):

```bash
curl -X POST http://localhost:3000/api/dev/create-admin \
  -H "content-type: application/json" \
  -d '{"email":"admin@shoresh.example","password":"admin1234","name":"Yarit"}'
```

You should see `{"ok":true,"id":1,"email":"admin@shoresh.example"}`.

Now visit `http://localhost:3000/admin` and log in with those
credentials.

## Step 5 — Seed the product catalog (optional)

If you want products to exist on `/shop`, run:

```bash
curl -X POST http://localhost:3000/api/dev/seed
```

This creates 7 example products, 5 categories (nutrition, skincare,
aloe, beauty, gifts), and some placeholder media. The seed is
idempotent — running it a second time won't duplicate anything. To
wipe and re-seed from scratch: `curl -X POST "http://localhost:3000/api/dev/seed?wipe=1"`.

## Step 6 — Your first click-through

With the dev server still running, visit these URLs in order:

1. **http://localhost:3000/** — home page. Should render in Hebrew
   (RTL) by default.
2. **http://localhost:3000/shop** — product grid. Should show 9
   products.
3. **http://localhost:3000/product/daily-multivitamin** — a product
   detail page (or any other slug from `src/lib/seed.ts`: `aloe-lip-balm`,
   `aloe-toothgel`, `aloe-soothing-spray`, `aloe-vera-gel`, `bee-propolis`,
   `aloe-body-duo-gift-set`). Click "Add to cart".
4. **http://localhost:3000/cart** — cart page. Click "Checkout".
5. **http://localhost:3000/checkout** — fill in test details
   (email: `you@example.test`, any name, any phone, any address).
   Click "Place order". You'll be redirected to
   **`/checkout/success?token=…`** — the checkout success page with
   a signed token in the URL.
6. **http://localhost:3000/forgot-password** — enter
   `you@example.test`, submit. Check the dev-server terminal for a
   console-logged email with a reset link that looks like
   `http://localhost:3000/reset-password/<token>`. Copy the link,
   paste it into the browser, set a new password (at least 8
   characters), submit. You'll land on **`/account`** showing the
   order you just placed.
7. **http://localhost:3000/admin/fulfillment** — the admin
   fulfillment dashboard. You should see the order you just placed
   in the "ready to pack" bucket (or "awaiting Forever purchase" if
   the product was a Forever item).

## Step 7 — Verify quality gates

Back in the first terminal (stop `npm run dev` with Ctrl+C):

```bash
npx tsc --noEmit    # TypeScript typecheck — should exit 0
npm run lint        # ESLint — should exit 0
npm run build       # Next production build — should exit 0
npm test            # Shorthand for the above — should exit 0
```

If any of these fail, something in the tree is broken. Don't push.
Fix it first or ask.

## Step 8 — Reset the database if needed

If your dev database gets into a weird state (e.g., you want to
start over with a clean slate):

```bash
npm run reset-db
```

This wipes the SQLite file and the uploaded media folder, then
prints the admin-bootstrap command. Re-run steps 4 and 5 after a
reset.

## Where to go next

- **`docs/NEXT-SESSION.md`** — what the next work session should
  tackle.
- **`docs/STATE.md`** — full history of what's been built.
- **`docs/TASKS.md`** — open todos and blockers.
- **`CLAUDE.md`** — critical rules that will bite you if you
  ignore them (i18n, next-intl Link, Next 16 async APIs).

Welcome aboard. 🌿
