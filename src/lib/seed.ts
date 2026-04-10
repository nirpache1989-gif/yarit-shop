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
      he: "שפתון לחות עשיר עם אלוורה, ג'וג'ובה ושעוות דבורים — תמיד בתיק",
      en: 'A rich moisturizing balm with aloe, jojoba & beeswax — always in the bag',
    },
    description: {
      he: "שפתון לחות בעבודת יד הכולל ג'ל אלוורה ורה, שמן ג'וג'ובה ושעוות דבורים טהורה. הג'וג'ובה חודר לעור בעדינות ודומה בהרכבו לשמנים הטבעיים של השפתיים, האלוורה מרגיעה, והשעווה אוטמת את הלחות לאורך זמן. השילוב יוצר שכבה עדינה שמגנה על שפתיים יבשות מרוח, שמש ומזגן. קל לשימוש, לא דביק, ובגודל מושלם לכיס או לארנק.\n\nהשימוש: למרוח בכל עת שהשפתיים מרגישות יבשות, לפני היציאה לשמש או לרוח, או כשכבה לפני שנת לילה.",
      en: "A handcrafted lip balm combining aloe vera gel, jojoba oil, and pure beeswax. Jojoba absorbs gently and mirrors the natural oils of your lips; aloe soothes; beeswax seals in moisture for long-lasting hydration. Together they form a delicate protective layer against wind, sun, and air conditioning. Non-sticky, easy to apply, and pocket-sized.\n\nHow to use: apply whenever lips feel dry, before going out in the sun or wind, or as an overnight treatment.",
    },
    categorySlug: 'skincare',
    price: 42,
    foreverProductCode: '022',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.49 PM (2).jpeg'],
    slug: 'aloe-toothgel',
    title: { he: 'משחת שיניים אלוורה ופרופוליס', en: 'Aloe & Propolis Toothgel' },
    shortDescription: {
      he: 'משחת שיניים עדינה ללא פלואוריד — לכל המשפחה',
      en: 'Gentle fluoride-free toothgel — for the whole family',
    },
    description: {
      he: 'משחת שיניים בטעם מנטה מרענן, מבוססת על ג׳ל אלוורה ורה ופרופוליס דבורים טבעי. ללא פלואוריד וללא שוחקים קשים, מה שעושה אותה מתאימה גם לילדים ולשיניים רגישות. הפרופוליס ידוע כתומך בהיגיינת הפה והאלוורה מסייעת להרגיע חניכיים.\n\nהשימוש: כמו כל משחת שיניים רגילה — פעמיים ביום עם מברשת שיניים רכה. כמות קטנה בגודל אפון מספיקה.',
      en: "A refreshing mint-flavored toothgel built on pure aloe vera gel and natural bee propolis. Fluoride-free and free of harsh abrasives, making it a good choice for children and sensitive teeth. Propolis is traditionally used to support oral hygiene; aloe helps soothe the gums.\n\nHow to use: brush twice daily with a soft-bristle brush. A pea-sized amount is enough.",
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
      he: 'תרסיס אלוורה רב-שימושי לעור אחרי שמש, גילוח או גירוי',
      en: 'All-purpose aloe spray for skin after sun, shaving or irritation',
    },
    description: {
      he: 'תרסיס לעור וגם לשיער, המבוסס על אלוורה ורה טהורה בשילוב תערובת של תמציות צמחים (קמומיל, אכילאה, פרופוליס ועוד). מרגיע ומלחלח את העור במהירות אחרי שהייה ממושכת בשמש, אחרי גילוח, או כשהעור מרגיש מגורה. התרסיס מאפשר יישום נקי ומהיר בכל מקום בגוף, ומתאים גם כבסיס לחות לשיער יבש או קרקפת מגורה.\n\nהשימוש: לרסס על אזור נקי ולתת לעור לספוג. חזור לפי הצורך.',
      en: "A spray for skin and hair built on pure aloe vera with a blend of botanical extracts (chamomile, yarrow, propolis, and more). Quickly soothes and hydrates skin after extended sun exposure, shaving, or when skin feels irritated. The spray makes application clean and effortless anywhere on the body, and also works as a light moisture base for dry hair or an irritated scalp.\n\nHow to use: spray onto a clean area and let absorb. Reapply as needed.",
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
      he: 'ג׳ל אלוורה ורה שקוף — המוצר האולטימטיבי לכל קופסת העזרה הראשונה',
      en: 'Clear aloe vera gel — the ultimate first-aid kit essential',
    },
    description: {
      he: 'ג׳ל אלוורה ורה שקוף, קליל ונטול שומניות, שנספג כמעט מיד ומעניק תחושה של רעננות והקלה. שימושי במיוחד אחרי שהייה בשמש, על עקיצות, אחרי גילוח, על עור יבש או גירויים קלים — בקיצור, המוצר שירית שומרת תמיד במגירת האמבטיה.\n\nהשימוש: למרוח בעדינות על עור נקי. בטוח לשימוש יומיומי ולכל בני המשפחה.',
      en: 'A clear, light, non-greasy aloe vera gel that absorbs almost instantly and leaves an immediate sense of freshness and relief. Especially useful after sun exposure, on bug bites, after shaving, on dry patches, or for mild irritation — the product Yarit keeps in her bathroom drawer at all times.\n\nHow to use: apply gently to clean skin. Safe for daily use by the whole family.',
    },
    categorySlug: 'aloe',
    price: 95,
    foreverProductCode: '061',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (1).jpeg'],
    slug: 'bee-propolis',
    title: { he: 'פרופוליס דבורים — טבליות', en: 'Bee Propolis Tablets' },
    shortDescription: {
      he: 'תוסף תזונה טבעי לתמיכה במערכת החיסון',
      en: 'Natural dietary supplement supporting the immune system',
    },
    description: {
      he: 'טבליות לעיסה המבוססות על פרופוליס דבורים טבעי — החומר שהדבורים יוצרות כדי להגן על הכוורת. פרופוליס עשיר בפלבנואידים, חומצות אמינו ומינרלים, והוא ידוע כעוזר לתמיכה טבעית במערכת החיסון ובבריאות הכללית. הטבליות מעוצבות לטעם נעים ואפשר ללעוס אותן ישירות בלי מים.\n\nהשימוש: לצרוך לפי ההוראות על האריזה. מומלץ להיוועץ ברופא אם יש רגישות לדבש או מוצרי כוורת.',
      en: "Chewable tablets built on natural bee propolis — the resinous substance bees produce to protect the hive. Propolis is rich in flavonoids, amino acids, and minerals, and is traditionally used to support the immune system and overall wellness. The tablets are designed with a pleasant taste and can be chewed directly without water.\n\nHow to use: follow the dosage on the package. Consult a doctor if you have any sensitivity to honey or bee products.",
    },
    categorySlug: 'nutrition',
    price: 165,
    foreverProductCode: '027',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (2).jpeg'],
    slug: 'daily-multivitamin',
    title: { he: 'מולטי ויטמין יומי מתקדם', en: 'Advanced Daily Multivitamin' },
    shortDescription: {
      he: 'תוסף יומי מקיף עם ויטמינים, מינרלים ופיטונוטריאנטים',
      en: 'A comprehensive daily supplement with vitamins, minerals & phytonutrients',
    },
    description: {
      he: 'תוסף יומי מקיף המשלב ויטמינים, מינרלים ותמציות צמחים (פיטונוטריאנטים) לכיסוי רחב של הצרכים התזונתיים היומיומיים. מיועד לתמיכה בפעילות הגוף התקינה, במערכת החיסון וברמות האנרגיה. שימושי במיוחד לאנשים עם תזונה לא מגוונת או בתקופות של לחץ וגיוס יתר.\n\nהשימוש: לפי ההוראות על האריזה, בדרך כלל עם ארוחה. לא תחליף לתזונה מאוזנת.',
      en: "A comprehensive daily supplement combining vitamins, minerals, and botanical extracts (phytonutrients) to cover a broad range of everyday nutritional needs. Designed to support normal body function, immune health, and energy levels. Especially useful for people with a less varied diet or during periods of stress and extra exertion.\n\nHow to use: as directed on the package, typically with a meal. Not a substitute for a balanced diet.",
    },
    categorySlug: 'nutrition',
    price: 140,
    foreverProductCode: '439',
  },
  {
    files: ['WhatsApp Image 2026-04-09 at 8.09.50 PM (3).jpeg'],
    slug: 'aloe-body-duo-gift-set',
    title: {
      he: 'מארז מתנה אלוורה לגוף',
      en: 'Aloe Body Duo Gift Set',
    },
    shortDescription: {
      he: 'ג׳ל רחצה וקרם גוף — הזוג המושלם למקלחת ואחריה',
      en: 'Body wash + body lotion — the perfect shower-and-after duo',
    },
    description: {
      he: 'מארז מתנה מלוטש הכולל שני מוצרים שעובדים יחד: ג׳ל רחצה עדין על בסיס אלוורה ורה שמנקה את העור בלי לייבש, וקרם גוף קליל שנספג מהר ומעניק שכבת לחות לכל היום. שניהם ללא צבע מלאכותי, עם ניחוח עדין וטבעי. מתנה מושלמת ליום הולדת, אירוח, או פשוט לפנק את עצמך.\n\nהשימוש: ג׳ל הרחצה במקלחת כמו ג׳ל רגיל. קרם הגוף על עור לח אחרי מקלחת, לספיגה מיטבית.',
      en: 'A polished gift set of two products designed to work together: a gentle aloe vera body wash that cleanses without drying, and a lightweight body lotion that absorbs quickly and leaves the skin softly hydrated all day. Both free of artificial colors, with a delicate natural scent. A lovely gift for birthdays, hosting, or just treating yourself.\n\nHow to use: the body wash in the shower as usual; the lotion on damp skin right after for best absorption.',
    },
    categorySlug: 'gifts',
    price: 195,
    foreverProductCode: 'TBD',
  },
]

// ─── Independent products ───────────────────────────────────────────
// Currently empty — per Yarit's feedback on 2026-04-10, the initial
// catalog is strictly the 7 Forever-sourced products she has photos
// for. Independent products will be added later as she starts
// sourcing her own selection.
const INDEPENDENT_PRODUCTS: Array<{
  slug: string
  title: { he: string; en: string }
  shortDescription: { he: string; en: string }
  description: { he: string; en: string }
  categorySlug: string
  price: number
  sku: string
  stock: number
  weightGrams: number
}> = []

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
