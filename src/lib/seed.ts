/**
 * @file Shoresh seed logic — one-time demo data loader
 * @summary Populates an empty Payload DB with: 5 categories, 8 real
 *          Forever Living products (with their real photos from
 *          `../assets/`), 2 placeholder independent products, and
 *          default SiteSettings values.
 *
 * HOW TO RUN
 *   With the dev server running:
 *       curl -X POST http://localhost:3000/api/dev/seed
 *   (the endpoint is gated on NODE_ENV !== 'production')
 *
 * IDEMPOTENCY
 *   The seed is NOT idempotent. It always tries to insert. If you run
 *   it twice on the same DB, you'll get unique-constraint errors.
 *   To reset: stop dev, delete `shoresh-dev.db*`, delete `public/media`,
 *   restart dev, hit the endpoint again.
 *
 * WHY A LIB + ROUTE INSTEAD OF A CLI SCRIPT
 *   Running a standalone TS script that imports Payload and its config
 *   tripped over multiple ESM/CJS interop edge cases (tsx, swc-node,
 *   payload run). Running inside Next.js sidesteps all of that because
 *   Next's own bundler already handles the import graph correctly.
 */
import path from 'path'
import type { Payload } from 'payload'

// Resolve the assets directory relative to the project root at runtime.
// process.cwd() is the yarit-shop/ root when Next.js runs.
const assetsDir = path.resolve(process.cwd(), '..', 'assets')

// ─── Helper: build a minimal Lexical richText node from plain text ──
// Payload's lexicalEditor() expects this exact shape for programmatic
// content creation.
function lex(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr' as const,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              format: 0,
              style: '',
              mode: 'normal',
              text,
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

// ─── Category seed data ─────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'nutrition', title: { he: 'תוספי תזונה', en: 'Nutrition' } },
  { slug: 'skincare', title: { he: 'טיפוח עור', en: 'Skincare' } },
  { slug: 'aloe', title: { he: 'מוצרי אלוורה', en: 'Aloe' } },
  { slug: 'beauty', title: { he: 'יופי', en: 'Beauty' } },
  { slug: 'gifts', title: { he: 'מתנות', en: 'Gifts' } },
]

// ─── Seed products sourced from Forever Living ──────────────────────
// NOTE: These are products Yarit sources from Forever, but the
// customer-facing titles NEVER mention "Forever" per Yarit's explicit
// brand instructions (2026-04-10). The `foreverProductCode` field is
// admin-only — Yarit uses it internally when placing orders with her
// supplier. The `type: 'forever'` discriminator is also internal and
// drives the fulfillment workflow (orders with these items go into
// the "needs sourcing from Forever" queue). None of it leaks to
// customers.
type SeedProduct = {
  files: string[]
  slug: string
  title: { he: string; en: string }
  shortDescription: { he: string; en: string }
  description: { he: string; en: string }
  categorySlug: string
  price: number
  foreverProductCode: string
}

const FOREVER_PRODUCTS: SeedProduct[] = [
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.49 PM.jpeg'],
    slug: 'aloe-lip-balm',
    title: {
      he: "שפתון לחות אלוורה וג'וג'ובה",
      en: 'Aloe & Jojoba Lip Balm',
    },
    shortDescription: {
      he: "שפתון לחות טבעי עם אלוורה, ג'וג'ובה ושעוות דבורים",
      en: 'Natural moisturizing lip balm with aloe, jojoba and beeswax',
    },
    description: {
      he: "שפתון לחות עשיר המשלב ג'ל אלוורה ורה טהור עם שמן ג'וג'ובה ושעוות דבורים, להזנה והגנה על שפתיים יבשות וסדוקות. מתאים לשימוש יומיומי בכל מזג אוויר ונשאר בתיק בנוחות.",
      en: 'A rich moisturizing lip balm combining pure aloe vera gel with jojoba oil and beeswax to nourish and protect dry, chapped lips. Suitable for everyday use in any weather and easy to carry.',
    },
    categorySlug: 'skincare',
    price: 42,
    foreverProductCode: '022',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.49 PM (1).jpeg'],
    slug: 'aloe-propolis-creme',
    title: { he: 'קרם אלוורה פרופוליס', en: 'Aloe Propolis Creme' },
    shortDescription: {
      he: 'קרם הזנה עשיר עם אלוורה ופרופוליס דבורים',
      en: 'Rich nourishing cream with aloe vera and bee propolis',
    },
    description: {
      he: 'קרם גוף ופנים עשיר המשלב אלוורה ורה, פרופוליס דבורים, קמומיל וויטמינים A ו-E. מסייע בשמירה על לחות העור ומותאם גם לעור יבש, רגיש או מגורה. מושלם לשימוש יומיומי כתוספת לשגרת הטיפוח.',
      en: 'A rich body and face cream combining aloe vera, bee propolis, chamomile and vitamins A and E. Helps maintain skin moisture and is suitable for dry, sensitive or irritated skin. A perfect daily addition to your skincare routine.',
    },
    categorySlug: 'skincare',
    price: 115,
    foreverProductCode: '051',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.49 PM (2).jpeg'],
    slug: 'aloe-toothgel',
    title: { he: 'משחת שיניים אלוורה ופרופוליס', en: 'Aloe & Propolis Toothgel' },
    shortDescription: {
      he: 'משחת שיניים ללא פלואוריד עם אלוורה ופרופוליס',
      en: 'Fluoride-free toothgel with aloe vera and bee propolis',
    },
    description: {
      he: 'משחת שיניים ייחודית ללא פלואוריד, המבוססת על אלוורה ורה ופרופוליס דבורים, בטעם מנטה טבעי. מתאימה לכל בני המשפחה כולל ילדים, ושומרת על ניקיון, רעננות וחיוך בריא.',
      en: 'A unique fluoride-free toothgel based on aloe vera and bee propolis, with a natural mint flavor. Suitable for the whole family including children, keeping teeth clean, fresh and smiles healthy.',
    },
    categorySlug: 'aloe',
    price: 45,
    foreverProductCode: '028',
  },
  {
    files: [
      'WhatsApp Image 2026-04-09 at 8.09.49 PM (3).jpeg',
      'WhatsApp Image 2026-04-09 at 8.09.50 PM.jpeg',
    ],
    slug: 'aloe-soothing-spray',
    title: { he: 'תרסיס אלוורה מרגיע', en: 'Aloe Soothing Spray' },
    shortDescription: {
      he: 'ספריי מרגיע ומלחלח לעור עם אלוורה וצמחי מרפא',
      en: 'Soothing moisturizing spray with aloe and botanical extracts',
    },
    description: {
      he: 'תרסיס רב-שימושי המבוסס על אלוורה ורה טהורה בשילוב 11 תמציות צמחים ופרופוליס. מרגיע ומלחלח את העור לאחר שהייה בשמש, גילוח, או גירוי. מתאים גם לשיער ולקרקפת.',
      en: 'A versatile spray based on pure aloe vera combined with 11 botanical extracts and bee propolis. Soothes and hydrates skin after sun exposure, shaving or irritation, and can also be used on hair and scalp.',
    },
    categorySlug: 'aloe',
    price: 120,
    foreverProductCode: '040',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM.jpeg'],
    slug: 'aloe-vera-gel',
    title: { he: "ג'ל אלוורה ורה", en: 'Aloe Vera Gel' },
    shortDescription: {
      he: "ג'ל אלוורה ורה שקוף להרגעה והזנה של העור",
      en: 'Clear aloe vera gel for soothing and nourishing the skin',
    },
    description: {
      he: "ג'ל שקוף עשיר באלוורה ורה טהורה, נספג במהירות ומעניק לעור תחושת רעננות והקלה מיידית. אידיאלי לאחר שיזוף, למריחה על אזורים יבשים או מגורים ולשימוש יומיומי לכל המשפחה.",
      en: 'A clear gel rich in pure aloe vera that absorbs quickly and provides instant freshness and relief. Ideal after sun exposure, for dry or irritated areas, and for daily family use.',
    },
    categorySlug: 'aloe',
    price: 95,
    foreverProductCode: '061',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (1).jpeg'],
    slug: 'bee-propolis',
    title: { he: 'פרופוליס דבורים', en: 'Bee Propolis' },
    shortDescription: {
      he: 'תוסף תזונה טבעי על בסיס פרופוליס דבורים 100% טבעי',
      en: '100% natural bee propolis dietary supplement',
    },
    description: {
      he: 'תוסף תזונה בטבליות לעיסה על בסיס פרופוליס דבורים טבעי. פרופוליס ידוע כמקור עשיר לפלבנואידים ומינרלים חיוניים, ותומך במערכת החיסון ובבריאות הכללית. מכיל 60 טבליות.',
      en: 'A chewable dietary supplement based on 100% natural bee propolis. Propolis is known as a rich source of flavonoids and essential minerals and supports immune function and overall wellness. 60 tablets per bottle.',
    },
    categorySlug: 'nutrition',
    price: 165,
    foreverProductCode: '027',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (2).jpeg'],
    slug: 'daily-multivitamin',
    title: { he: 'מולטי ויטמין יומי', en: 'Daily Multivitamin' },
    shortDescription: {
      he: 'מולטי ויטמין יומי עם 55 רכיבים תזונתיים',
      en: 'Daily multivitamin with 55 nutrients',
    },
    description: {
      he: 'תוסף מולטי ויטמין יומי מתקדם המכיל 55 ויטמינים, מינרלים ופיטונוטריאנטים התומכים בתפקוד תקין של הגוף, במערכת החיסון וברמות האנרגיה. 60 טבליות.',
      en: 'An advanced daily multivitamin supplement containing 55 vitamins, minerals and phytonutrients that support normal body function, immune health and energy levels. 60 tablets.',
    },
    categorySlug: 'nutrition',
    price: 140,
    foreverProductCode: '439',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (3).jpeg'],
    slug: 'aloe-body-duo-gift-set',
    title: {
      he: 'מארז מתנה אלוורה לגוף — הזוג המושלם',
      en: "Aloe Body Duo Gift Set",
    },
    shortDescription: {
      he: 'מארז מתנה: ג\u2019ל רחצה וקרם גוף על בסיס אלוורה ורה',
      en: 'Gift set: aloe vera body wash and body lotion duo',
    },
    description: {
      he: 'מארז מתנה יוקרתי הכולל ג\u2019ל רחצה וקרם גוף, שניהם על בסיס אלוורה ורה. הג\u2019ל מנקה בעדינות תוך שמירה על לחות, והקרם נספג במהירות ומעניק הזנה ולחות לאורך היום. מתנה מושלמת לכל אירוע.',
      en: 'A luxurious gift set including a body wash and body lotion, both based on aloe vera. The wash gently cleanses while retaining moisture, and the lightweight lotion absorbs quickly to nourish and hydrate throughout the day. A perfect gift for any occasion.',
    },
    categorySlug: 'gifts',
    price: 195,
    foreverProductCode: 'TBD',
  },
]

// ─── Two independent (stocked) products for demo variety ────────────
const INDEPENDENT_PRODUCTS = [
  {
    slug: 'organic-lavender-oil',
    title: { he: 'שמן לבנדר אורגני', en: 'Organic Lavender Oil' },
    shortDescription: {
      he: 'שמן אתרי לבנדר 100% טבעי, מיוצר בישראל',
      en: '100% natural lavender essential oil, made in Israel',
    },
    description: {
      he: 'שמן אתרי לבנדר בתהליך זיקוק קר, מתאים לאמבט הרפיה, עיסוי, או לשימוש עם מפיץ ריח. המוצר אורגני ומיוצר על ידי משק חקלאי בצפון הארץ.',
      en: 'Cold-pressed lavender essential oil, perfect for relaxing baths, massage, or with a diffuser. Organic and produced by a farm in northern Israel.',
    },
    categorySlug: 'skincare',
    price: 65,
    sku: 'YRT-LAV-001',
    stock: 12,
    weightGrams: 80,
  },
  {
    slug: 'raw-honey-galilee',
    title: { he: 'דבש גלעין מהגליל', en: 'Raw Galilee Honey' },
    shortDescription: {
      he: 'דבש גולמי בלתי מסונן ממכוורת מקומית',
      en: 'Unfiltered raw honey from a local apiary',
    },
    description: {
      he: 'דבש טבעי גולמי, בלתי מסונן וללא חימום, המופק במכוורת משפחתית בגליל המערבי. גוון ענברי בהיר וטעם עשיר המשתנה עם העונה.',
      en: 'Natural raw honey, unfiltered and unheated, sourced from a family apiary in the western Galilee. Amber color and rich flavor that varies by season.',
    },
    categorySlug: 'nutrition',
    price: 58,
    sku: 'YRT-HON-001',
    stock: 20,
    weightGrams: 500,
  },
]

// ─── Runner ─────────────────────────────────────────────────────────
// Takes an already-initialized Payload instance (the API route is
// responsible for obtaining it). Returns a plain object summary of
// what was created, so the route can JSON-respond with it.
//
// When `wipe: true`, the runner first deletes all existing products,
// categories, tags, orders, and (non-admin) customers + media before
// seeding. Admin users are preserved. This lets the dev endpoint be
// called repeatedly against the same DB (e.g. Neon) to reset the
// catalog in place without re-provisioning.
export async function runSeed(payload: Payload, opts: { wipe?: boolean } = {}) {
  const log: string[] = []
  const say = (msg: string) => {
    console.log(msg)
    log.push(msg)
  }

  say('Shoresh seed — starting')
  say(`  assets: ${assetsDir}`)
  if (opts.wipe) say('  WIPE MODE: deleting existing data first')

  if (opts.wipe) {
    for (const collection of ['orders', 'products', 'categories', 'tags', 'media'] as const) {
      try {
        const res = await payload.find({ collection, limit: 1000, depth: 0 })
        for (const doc of res.docs) {
          try {
            await payload.delete({ collection, id: (doc as { id: number | string }).id })
          } catch (err) {
            say(`  · skipped ${collection}#${(doc as { id: unknown }).id}: ${err instanceof Error ? err.message : 'unknown'}`)
          }
        }
        say(`  · wiped ${collection} (${res.docs.length} docs)`)
      } catch (err) {
        say(`  · could not wipe ${collection}: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }
    // Wipe non-admin users only
    try {
      const users = await payload.find({
        collection: 'users',
        where: { role: { not_equals: 'admin' } },
        limit: 1000,
        depth: 0,
      })
      for (const u of users.docs) {
        try {
          await payload.delete({ collection: 'users', id: (u as { id: number | string }).id })
        } catch {
          /* non-fatal */
        }
      }
      say(`  · wiped users (${users.docs.length} non-admin customers)`)
    } catch (err) {
      say(`  · could not wipe users: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  // 1. Categories
  say('\n[1/4] creating categories...')
  const categoryIds: Record<string, number | string> = {}
  for (const cat of CATEGORIES) {
    const result = await payload.create({
      collection: 'categories',
      data: {
        title: cat.title.he,
        slug: cat.slug,
      },
      locale: 'he',
    })
    // write English title via locale update
    await payload.update({
      collection: 'categories',
      id: result.id,
      data: { title: cat.title.en },
      locale: 'en',
    })
    categoryIds[cat.slug] = result.id
    say(`  + ${cat.slug}  (id=${result.id})`)
  }

  // 2. Media + Forever products
  say('\n[2/4] uploading media + creating Forever products...')
  const mediaCache: Record<string, number | string> = {}

  async function uploadMediaOnce(filename: string, altHe: string, altEn: string) {
    if (mediaCache[filename]) return mediaCache[filename]
    const filePath = path.join(assetsDir, filename)
    const result = await payload.create({
      collection: 'media',
      data: { alt: altHe },
      filePath,
      locale: 'he',
    })
    await payload.update({
      collection: 'media',
      id: result.id,
      data: { alt: altEn },
      locale: 'en',
    })
    mediaCache[filename] = result.id
    return result.id
  }

  for (const p of FOREVER_PRODUCTS) {
    const mediaIds: (number | string)[] = []
    for (const f of p.files) {
      const id = await uploadMediaOnce(f, p.title.he, p.title.en)
      mediaIds.push(id)
    }
    const created = await payload.create({
      collection: 'products',
      data: {
        type: 'forever',
        title: p.title.he,
        slug: p.slug,
        shortDescription: p.shortDescription.he,
        description: lex(p.description.he),
        price: p.price,
        images: mediaIds.map((id) => ({ image: id })),
        category: categoryIds[p.categorySlug],
        status: 'published',
        isFeatured: [
          'aloe-lip-balm',
          'daily-multivitamin',
          'aloe-body-duo-gift-set',
        ].includes(p.slug),
        isNew: true,
        foreverProductCode: p.foreverProductCode,
      },
      locale: 'he',
    })
    await payload.update({
      collection: 'products',
      id: created.id,
      data: {
        title: p.title.en,
        shortDescription: p.shortDescription.en,
        description: lex(p.description.en),
      },
      locale: 'en',
    })
    say(`  + ${p.slug}  (id=${created.id}, ₪${p.price})`)
  }

  // 3. Independent products
  say('\n[3/4] creating independent products...')
  for (const p of INDEPENDENT_PRODUCTS) {
    const created = await payload.create({
      collection: 'products',
      data: {
        type: 'independent',
        title: p.title.he,
        slug: p.slug,
        shortDescription: p.shortDescription.he,
        description: lex(p.description.he),
        price: p.price,
        images: [], // no seed image for independent products
        category: categoryIds[p.categorySlug],
        status: 'published',
        isFeatured: false,
        isNew: true,
        sku: p.sku,
        stock: p.stock,
        weightGrams: p.weightGrams,
      },
      locale: 'he',
    })
    await payload.update({
      collection: 'products',
      id: created.id,
      data: {
        title: p.title.en,
        shortDescription: p.shortDescription.en,
        description: lex(p.description.en),
      },
      locale: 'en',
    })
    say(`  + ${p.slug}  (id=${created.id}, ₪${p.price}, stock=${p.stock})`)
  }

  // 4. SiteSettings global
  say('\n[4/4] populating SiteSettings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      contact: {
        email: 'hello@shoresh.example',
        phone: '+972-50-000-0000',
        whatsapp: '972500000000',
        address: 'ישראל',
        businessTaxId: '',
      },
      shipping: {
        freeShippingThreshold: 300,
        rates: [
          {
            region: 'IL',
            name: 'משלוח רגיל (3–5 ימי עסקים)',
            price: 29,
          },
          {
            region: 'IL',
            name: 'משלוח מהיר (עד יום עסקים הבא)',
            price: 49,
          },
          {
            region: 'EU',
            name: 'משלוח לאירופה (7–14 ימי עסקים)',
            price: 89,
          },
          {
            region: 'NA',
            name: 'משלוח לצפון אמריקה (10–18 ימי עסקים)',
            price: 119,
          },
          {
            region: 'ROW',
            name: 'משלוח לשאר העולם (14–21 ימי עסקים)',
            price: 149,
          },
        ],
      },
      forever: {
        distributorName: 'Yarit',
        distributorId: '',
      },
    },
    locale: 'he',
  })
  say('  + site-settings populated')
  say('\nDone. Visit /admin to review.')

  return { log }
}
