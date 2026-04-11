/**
 * @file Copaia seed logic — one-time demo data loader
 * @summary Populates an empty Payload DB with: 5 categories, 7 real
 *          products (with their real photos from `../assets/`), and
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
 *   To reset: stop dev, delete `copaia-dev.db*`, delete `public/media`,
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

// ─── Seed products ──────────────────────────────────────────────────
// Yarit sources these from her supplier on demand. Seeded as
// `type: 'sourced'` by default so the stock field is skipped in the
// admin form — she can switch any individual product to `stocked`
// later if she starts holding inventory at home. See
// docs/DECISIONS.md ADR-019.
type SeedProduct = {
  files: string[]
  slug: string
  title: { he: string; en: string }
  shortDescription: { he: string; en: string }
  description: { he: string; en: string }
  categorySlug: string
  price: number
  supplierCode: string
}

// ─── 8-product catalog (2026-04-11 Copaia rename + catalog replacement) ──
// Each product's `files` array lists the new Copaia-era image set from
// `C:/AI/YaritShop/assets/`. First file is always the MAIN photo (shown on
// product cards + as the main image in the detail-page gallery). 6/8 products
// have 2 images; 2/8 (aloe-drink, aloe-toothgel) have 3.
//
// Supplier codes (`supplierCode`) for the 4 new products land as 'TBD' —
// Yarit will fill them in from the admin panel once she maps Forever Living's
// real SKUs to each slug. Same pattern as the earlier `aloe-body-duo-gift-set`
// which was 'TBD' before retirement.
//
// Descriptions for the 4 new products are drafts based on Forever Living's
// public product line and can be adjusted by Yarit in the admin after seed.
const SOURCED_PRODUCTS: SeedProduct[] = [
  {
    files: ['AloeDrinkMAIN.jpg', 'AloeDrink1.jpg', 'AloeDrink2.jpg'],
    slug: 'aloe-drink',
    title: {
      he: 'משקה אלוורה ורה בטעם אפרסק',
      en: 'Aloe Peaches Drink',
    },
    shortDescription: {
      he: 'משקה אלוורה ורה עדין בטעם אפרסק — 84.3% ג׳ל אלוורה טהור, ללא חומרים משמרים',
      en: 'A gentle peach-flavored aloe vera drink — 84.3% pure aloe gel, preservative-free',
    },
    description: {
      he: 'משקה אלוורה ורה בטעם אפרסק עדין — 84.3% ג׳ל אלוורה טהור שמופק ישירות מהעלה, ללא חומרים משמרים וללא צבעי מאכל מלאכותיים. הטעם המתקתק של האפרסק הופך את המשקה לקל ונעים לשתייה יומיומית, במיוחד למי שאיננו מתחבר לטעם הטבעי של אלוורה טהור. מתאים לתמיכה בעיכול תקין, בתחושת חיוניות ובמערכת החיסון — כחלק משגרה יומית מאוזנת.\n\nהשימוש: כ-60 מ״ל פעמיים ביום, רצוי לפני הארוחות. ניתן לערבב עם מיץ טבעי או לשתות ישירות. לשמור בקירור אחרי הפתיחה ולצרוך תוך 90 ימים.',
      en: "A peach-flavored aloe vera drink — 84.3% pure aloe gel extracted directly from the leaf, preservative-free and without artificial colors. The gentle sweetness of peach makes it easy and pleasant to drink daily, especially for anyone who doesn't love the taste of plain aloe. Suitable for supporting healthy digestion, vitality, and the immune system as part of a balanced daily routine.\n\nHow to use: about 60ml twice a day, preferably before meals. Can be mixed with natural juice or sipped straight. Refrigerate after opening and consume within 90 days.",
    },
    categorySlug: 'nutrition',
    price: 155,
    supplierCode: 'TBD',
  },
  {
    files: ['AloeHeatMain.jpg', 'ALoeHeat1.jpg'],
    slug: 'aloe-heat-lotion',
    title: {
      he: 'קרם אלוורה מחמם — Aloe Heat',
      en: 'Aloe Heat Lotion',
    },
    shortDescription: {
      he: 'קרם עיסוי מחמם עם אלוורה, מנטול ואיקליפטוס — להרגעת שרירים וכאבי גב',
      en: 'Warming massage lotion with aloe, menthol & eucalyptus — for tired muscles & back relief',
    },
    description: {
      he: 'קרם עיסוי מחמם המשלב ג׳ל אלוורה ורה עם תמציות מנטול, איקליפטוס, רוזמרין ושמני צמחים נוספים. נספג במהירות ומייצר תחושה נעימה של חום שמלווה את השריר ומסייעת להקלה על מתח, נוקשות וכאבי גב קלים. מושלם אחרי אימון, אחרי יום ארוך על הרגליים, או כחלק משגרת עיסוי.\n\nהשימוש: למרוח בעדינות על האזור הרצוי, לעסות במעגלים עד לספיגה. להימנע ממגע בעיניים ובאזורים רגישים. לא מיועד לפצעים פתוחים.',
      en: 'A warming massage cream combining aloe vera gel with menthol, eucalyptus, rosemary, and additional botanical oils. Absorbs quickly and creates a pleasant warming sensation that works with the muscle to help relieve tension, stiffness, and mild back discomfort. Perfect after a workout, after a long day on your feet, or as part of a massage routine.\n\nHow to use: apply gently to the target area and massage in circular motions until absorbed. Avoid contact with eyes and sensitive areas. Not intended for open wounds.',
    },
    categorySlug: 'skincare',
    price: 115,
    supplierCode: 'TBD',
  },
  {
    files: ['ForeverAloeDeoMAIN.jpg', 'ForeverAloeDeo1.jpg'],
    slug: 'aloe-deodorant',
    title: {
      he: 'דאודורנט אלוורה טבעי',
      en: 'Natural Aloe Deodorant',
    },
    shortDescription: {
      he: 'דאודורנט רול-און טבעי עם ג׳ל אלוורה — ללא אלומיניום וללא בישום חזק',
      en: 'Natural roll-on deodorant with aloe vera gel — aluminum-free, unfragranced',
    },
    description: {
      he: 'דאודורנט רול-און עדין המבוסס על ג׳ל אלוורה ורה טהור, ללא מלחי אלומיניום וללא ניחוח חזק. פורמולה קלילה שמתאימה לעור רגיש ולשימוש יומיומי, מעניק הגנה יעילה מבלי לסתום את בלוטות הזיעה. מתאים גם לשימוש אחרי גילוח בשל תכונות ההרגעה של האלוורה.\n\nהשימוש: למרוח על עור נקי ויבש בבוקר או אחרי מקלחת. להמתין שייספג לפני לבישת הבגדים.',
      en: "A gentle roll-on deodorant built on pure aloe vera gel, free of aluminum salts and strong fragrance. A lightweight formula suitable for sensitive skin and everyday use, delivering effective protection without clogging sweat glands. Also works well after shaving thanks to aloe's soothing properties.\n\nHow to use: apply to clean, dry skin in the morning or after a shower. Let it absorb before dressing.",
    },
    categorySlug: 'skincare',
    price: 55,
    supplierCode: 'TBD',
  },
  {
    files: ['foreveraloefirstMAIN.jpg', 'ForeverAloefirst1.jpg'],
    slug: 'aloe-first-spray',
    title: { he: 'תרסיס אלוורה מרגיע', en: 'Aloe First Spray' },
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
    supplierCode: '040',
  },
  {
    files: ['ForeverToothGelMAIN.jpg', 'ForeverToothgel1.jpg', 'ForeverToothgel2.jpg'],
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
    supplierCode: '028',
  },
  {
    files: ['ForeverBeePollenMAIN.jpg', 'ForeverBeePollen1.jpg'],
    slug: 'bee-pollen',
    title: {
      he: 'אבקת דבורים — Bee Pollen',
      en: 'Bee Pollen Tablets',
    },
    shortDescription: {
      he: 'אבקת דבורים טבעית בטבליות — עשירה בחלבון, ויטמיני B וחומצות אמינו',
      en: 'Natural bee pollen tablets — rich in protein, B vitamins & amino acids',
    },
    description: {
      he: 'טבליות לעיסה המבוססות על אבקת דבורים טבעית — תוסף תזונה עשיר בחלבון צמחי, ויטמיני B, חומצות אמינו חיוניות ומינרלים. אבקת הדבורים נאספת ישירות מהדבורים בעת איסוף הצוף, והיא נחשבת לאחד ממקורות התזונה המרוכזים והשלמים שהטבע מציע. משמשת באופן מסורתי לתמיכה באנרגיה, בסיבולת ובתמיכה עונתית כללית.\n\nהשימוש: לצרוך לפי ההוראות על האריזה. להיוועץ ברופא אם יש רגישות לדבש או למוצרי כוורת.',
      en: 'Chewable tablets built on natural bee pollen — a dietary supplement rich in plant protein, B vitamins, essential amino acids, and minerals. Bee pollen is collected directly from bees as they gather nectar and is considered one of the most concentrated, complete natural foods. Traditionally used to support energy, stamina, and general seasonal wellness.\n\nHow to use: follow the dosage on the package. Consult a doctor if you have any sensitivity to honey or bee products.',
    },
    categorySlug: 'nutrition',
    price: 155,
    supplierCode: 'TBD',
  },
  {
    files: ['ForeverBeepropolisMAIN.jpg', 'ForeverBeePropolis1.jpg'],
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
    supplierCode: '027',
  },
  {
    files: ['ForeverDailyMAIN.jpg', 'ForeverDaily1.jpg'],
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
    supplierCode: '439',
  },
]

// ─── Independent products ───────────────────────────────────────────
// Currently empty — per Yarit's feedback on 2026-04-10, the initial
// catalog is strictly the 7 sourced products Yarit has photos for.
// Stocked items (kept in her house) will be added later as she
// expands the catalog.
const STOCKED_PRODUCTS: Array<{
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

  say('Copaia seed — starting')
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

  // 2. Media + sourced products
  say('\n[2/4] uploading media + creating sourced products...')
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

  for (const p of SOURCED_PRODUCTS) {
    const mediaIds: (number | string)[] = []
    for (const f of p.files) {
      const id = await uploadMediaOnce(f, p.title.he, p.title.en)
      mediaIds.push(id)
    }
    const created = await payload.create({
      collection: 'products',
      data: {
        type: 'sourced',
        title: p.title.he,
        slug: p.slug,
        shortDescription: p.shortDescription.he,
        description: lex(p.description.he),
        price: p.price,
        images: mediaIds.map((id) => ({ image: id })),
        category: categoryIds[p.categorySlug],
        status: 'published',
        // 2026-04-11 Copaia catalog: pick the 3 most visually striking
        // products for the homepage featured carousel. `aloe-drink` is
        // the peach bottle on marble (biggest visual pop), `aloe-toothgel`
        // has 3 gallery images that show off the T1.7 Flip animation,
        // `daily-multivitamin` is the one with a real supplier code
        // that Yarit knows well.
        isFeatured: [
          'aloe-drink',
          'aloe-toothgel',
          'daily-multivitamin',
        ].includes(p.slug),
        isNew: true,
        sku: p.supplierCode,
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

  // 3. Stocked products
  say('\n[3/4] creating stocked products...')
  for (const p of STOCKED_PRODUCTS) {
    const created = await payload.create({
      collection: 'products',
      data: {
        type: 'stocked',
        title: p.title.he,
        slug: p.slug,
        shortDescription: p.shortDescription.he,
        description: lex(p.description.he),
        price: p.price,
        images: [], // no seed image for stocked products
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
        email: 'hello@copaia.example',
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
    },
    locale: 'he',
  })
  say('  + site-settings populated')
  say('\nDone. Visit /admin to review.')

  return { log }
}
