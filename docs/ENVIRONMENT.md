# Environment setup

## Prerequisites

- **Node.js 20.9+** (Next 16 requirement)
- **npm 10+** (ships with Node)
- **Python 3.10+** (optional, only needed to run `scripts/process-logo.py`)

## First time

```bash
cd yarit-shop
npm install
cp .env.example .env.local
```

Open `.env.local` and verify:
- `PAYLOAD_SECRET` — any 32+ byte hex string works locally. Generate a fresh one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `DATABASE_URI` — leave as `file:./shoresh-dev.db` for local dev (SQLite).
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` for local dev.

Then:
```bash
npm run dev
```

Open http://localhost:3000 (storefront) and http://localhost:3000/admin (Payload admin).
First visit to `/admin` prompts you to create the initial admin user — pick an email + strong password.

## Environment variables

| Variable | Phase | Purpose |
|---|---|---|
| `PAYLOAD_SECRET` | A | JWT signing secret for Payload auth. Must be 32+ bytes. Rotate in production if leaked. Hard-fails at boot in production-like environments if unset. |
| `DATABASE_URI` | A | Payload database connection. SQLite file URL locally, Postgres URL in prod. |
| `NEXT_PUBLIC_SITE_URL` | A | Public base URL of the site. Used for absolute URLs in emails, OG tags, etc. |
| `PAYMENT_PROVIDER` | D | `mock` (default) or `meshulam`. Selects the active provider in `src/lib/payments/index.ts`. |
| `MESHULAM_API_KEY` | D | Meshulam gateway credential (sandbox vs prod). |
| `MESHULAM_USER_ID` | D | Meshulam account identifier. |
| `MESHULAM_PAGE_CODE` | D | Per-page identifier, from the Meshulam dashboard. |
| `MESHULAM_WEBHOOK_SECRET` | D | Signing secret for webhook verification. Enforced even in dev. |
| `MESHULAM_BASE_URL` | D | `https://sandbox.meshulam.co.il/api/light/server/1.0` for sandbox, `https://meshulam.co.il/api/light/server/1.0` for live. |
| `EMAIL_PROVIDER` | D | `mock` (default, console-logs) or `resend`. Selects the active provider in `src/lib/email/index.ts`. |
| `RESEND_API_KEY` | D | Resend API key for sending emails. |
| `EMAIL_FROM` | D | Verified sender address in Resend. Use `onboarding@resend.dev` for smoke tests before domain verification. |
| `EMAIL_FROM_NAME` | D | Display name for outgoing mail (e.g. `קופאה`). |
| `ADMIN_NOTIFICATION_EMAIL` | D | Yarit's inbox for new-order notifications. Optional — falls back to `SiteSettings.contact.email`. |
| `BLOB_READ_WRITE_TOKEN` | F | Vercel Blob storage token. **Auto-injected** when a Blob store is linked in the Vercel dashboard — do not paste manually. When set, `src/payload.config.ts` activates the `vercelBlobStorage` plugin. |

Never check `.env.local` into git. `.env.example` is the committed template.

## Database

### Local (SQLite)
Default. `DATABASE_URI=file:./copaia-dev.db`. Zero config. The database file lives at the project root. To reset, stop the dev server and delete `copaia-dev.db` — it'll be recreated on the next boot. (Pre-2026-04-11 the filename was `shoresh-dev.db` — both are in `.gitignore`.)

### Production (Neon Postgres)

Neon is already the production target. The adapter swap lives inside `src/payload.config.ts` — it picks the adapter based on the `DATABASE_URI` shape, so you don't touch the config file when switching environments:

- `file:./...` → SQLite (dev)
- `postgres://...` or `postgresql://...` → Postgres (Neon)

**Setup steps:**

1. Sign up at https://neon.tech (free tier: 1 project, 0.5 GB, auto-suspend).
2. Create a new project. Pick the **EU Central (Frankfurt)** region for Israel — lowest latency on the free tier.
3. Click "Show password" in the Neon UI and **Copy snippet** the full connection string. It looks like:
   ```
   postgresql://neondb_owner:REALPASSWORD@ep-xxx.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Paste it into Vercel env vars as `DATABASE_URI` (production scope). **Never commit it.**
5. Payload auto-detects the Postgres URI on boot and runs the Drizzle schema-push migrations. No manual migration step needed on first deploy.

**Seeding the production DB:**

To run the seed script against Neon:
1. Temporarily put the Neon `DATABASE_URI` in your local `.env.local` (replacing the SQLite line)
2. Run `npm run dev` locally — Payload connects to Neon
3. In another terminal: `curl -X POST http://localhost:3000/api/dev/seed`
4. Revert `.env.local` back to SQLite: `DATABASE_URI=file:./shoresh-dev.db`

This avoids exposing the seed endpoint in production (it's already gated on `NODE_ENV !== 'production'` but the point is moot if we run it locally against the real DB).

## Media storage — Vercel Blob (production)

Local dev stores uploaded media in `./media/` at the project root (gitignored). Production on Vercel can't use the local filesystem because it's ephemeral between serverless invocations. Instead, we use **Vercel Blob** via the `@payloadcms/storage-vercel-blob` plugin.

**Setup (one time):**

1. In the Vercel dashboard, go to your project → **Storage** tab → **Create** → **Blob** → name it `shoresh-media`
2. Connect it to the project. Vercel auto-injects `BLOB_READ_WRITE_TOKEN` as an environment variable — you don't need to copy-paste it manually
3. Redeploy. On boot, `payload.config.ts` detects the token and activates the `vercelBlobStorage` plugin — all Media collection uploads go to Blob automatically, the `url` field on each Media doc resolves to a Vercel Blob URL, and `next/image` serves them via its CDN

**Free tier:** 1 GB storage + 1 TB bandwidth/month. Easily enough for the first year at Copaia's expected volume.

## Deploying to Vercel (real flow)

1. **Push to GitHub** — use `gh repo create` + `git push`.
2. **Import the repo in Vercel** — either via the dashboard (`vercel.com/new`) or the CLI (`npx vercel`).
3. **Add environment variables** (production scope):
   - `PAYLOAD_SECRET` — fresh 32-byte hex, NOT the dev value
   - `DATABASE_URI` — your Neon production connection string
   - `NEXT_PUBLIC_SITE_URL` — `https://yourdomain.co.il` (or the `.vercel.app` URL for preview)
4. **Create a Vercel Blob store** as described above (auto-injects `BLOB_READ_WRITE_TOKEN`).
5. **First deploy** builds the project. The Payload admin is at `/admin` on the deployed URL.
6. **Create the production admin user**: hit `POST /api/dev/create-admin` with the production DB URL temporarily in your local env (see seeding section above), OR click through Payload's first-user-create wizard in the browser.
7. **Seed the production DB** (one time, see seeding section above).
8. **Point your custom domain** at Vercel via the dashboard's Domains tab.

## Switching payment provider (mock → Meshulam)

When Yarit has a Meshulam account:
1. Fill in `src/lib/payments/meshulam.ts` (it currently throws with a `HOW TO FINISH` guide)
2. Add Meshulam env vars to Vercel:
   ```
   PAYMENT_PROVIDER=meshulam
   MESHULAM_API_KEY=
   MESHULAM_USER_ID=
   MESHULAM_PAGE_CODE=
   MESHULAM_WEBHOOK_SECRET=
   ```
3. Configure Meshulam's webhook URL to `https://yourdomain.co.il/api/webhooks/payment`
4. Redeploy. The `getPaymentProvider()` factory picks the new provider by the env var.
5. Test with Meshulam's sandbox environment first, then flip to production.

## Logo processing (optional)

If you want a transparent PNG version of the Copaia logo:

```bash
cd yarit-shop
pip install rembg pillow
python scripts/process-logo.py
```

This produces `public/brand/logo.png` (transparent) in addition to the existing `logo-parchment.jpg`. See the script's docstring for options.

## Troubleshooting

- **`Module not found: @payload-config`** — Check `tsconfig.json` has the path alias, and check that `src/payload.config.ts` exists.
- **Hebrew text renders as boxes** — The Heebo font didn't load. Check the `next/font/google` import in `src/app/(storefront)/[locale]/layout.tsx` and that `subsets` includes `'hebrew'`.
- **`/admin` 500s** — Usually a missing env var or a DB connection issue. Check the terminal for the actual error.
- **Hot reload breaks after touching `payload.config.ts`** — Restart `npm run dev`. Payload's config is picked up at boot.
- **Tailwind classes aren't applied** — `src/app/globals.css` might not be imported by your layout. Check the `import` line in `src/app/(storefront)/[locale]/layout.tsx`.
