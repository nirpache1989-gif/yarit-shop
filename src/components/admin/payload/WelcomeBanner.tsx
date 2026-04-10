/**
 * @file WelcomeBanner — friendly callout above the dashboard
 * @summary Server component injected via `admin.components.beforeDashboard`.
 *          Non-dismissible for v1 — if Yarit asks, lift to a client
 *          component with a localStorage toggle.
 *
 *          Styled by `.yarit-welcome` rules in admin-brand.css.
 */
export function WelcomeBanner() {
  return (
    <div className="yarit-welcome" dir="rtl">
      <div style={{ flex: 1 }}>
        <p className="yarit-welcome__title">ברוכה הבאה לפאנל הניהול 🌿</p>
        <p className="yarit-welcome__body">
          זה הבית שלך לעדכון המוצרים, הזמנות ותוכן האתר. בכל שאלה — לחצי על{' '}
          <a
            href="https://github.com/nirpache1989-gif/yarit-shop/blob/main/yarit-shop/docs/YARIT-ADMIN-GUIDE.md"
            target="_blank"
            rel="noreferrer"
          >
            המדריך
          </a>{' '}
          או פני אלינו.
        </p>
      </div>
    </div>
  )
}
