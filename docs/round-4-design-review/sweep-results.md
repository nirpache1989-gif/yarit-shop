# Round 4 — Design review sweep (Track D)

**Date:** 2026-04-10
**Agents:** Two Explore agents ran in parallel after Tracks A, B, C shipped.

## D1 — Dark/light mode parity sweep (storefront)

**Scope:** `/`, `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/about` in both light and dark modes.

**Verdict:** 1 blocker, 0 polish. The Hero light pocket (A1) and logo halo fix (A2) both land cleanly — `.logo-halo { filter: none }` confirmed, Hero reads `#f6efdc` inside the pocket and `#1e1609` on the TrustBar below. Every other storefront page uses `var(--color-*)` correctly and responds to the theme toggle. The single blocker:

### D1.1 — CheckoutForm error message invisible in dark mode (BLOCKER)

- **File:** `src/components/checkout/CheckoutForm.tsx:286`
- **Issue:** The error card was using hardcoded Tailwind colors: `border-red-300 bg-red-50 text-red-900`. In light mode it's a classic "light red card with dark red text" which works. In dark mode, `bg-red-50` (near-white) clashes against the `#1E1609` molasses background and `text-red-900` (nearly black) is invisible against it — the error message reads as an illegible blob.
- **Fix shipped (2026-04-10):** Replaced with theme-aware tokens:
  ```tsx
  <div className="rounded-xl border border-[var(--color-accent-deep)]/40 bg-[var(--color-accent-deep)]/10 p-4 text-sm font-medium text-[var(--color-accent-deep)]">
  ```
  `--color-accent-deep` is warm ochre (#8B5A2B) in light mode and lantern ochre (#E9B97A) in dark mode. Both stay AA-legible on their respective backgrounds and tie the warning into the brand palette rather than fighting it.
- **Status:** ✅ FIXED in Track D cleanup.

---

## D2 — Admin-at-65 heuristic evaluation

**Scope:** Admin dashboard + Products list + Orders list + Fulfillment view + Site settings across 3 viewports (1440 / 768 / 375).

**Verdict:** 2 flagged as "blocker" (1 false positive + 1 forward-looking concern); 8 polish items. All 12 Track C delight moves confirmed implemented and properly wired. Positive confirmations include: time-synced Hebrew greeting, warm toast system, illustrated empty states (C3 + C9), OrderRow spinner + confetti, tile stagger, drifting leaves (5 leaves × 3 keyframes), rich Hebrew field descriptions, save button swap, mobile OrderRow layout, driver.js onboarding tour (4 Hebrew steps), ViewOnSite button, full Hebrew RTL + reduced-motion guards.

### D2 findings — triage

| # | Finding | Agent severity | Real severity | Decision |
|---|---|---|---|---|
| D2.1 | `/brand/ai/empty-shop.jpg` "may not exist" | blocker | **false positive** | No action. Verified the file is present (`ls public/brand/ai/empty-shop.jpg`). D2 did static code review only, not runtime verification. |
| D2.2 | CSS `::after` save button text swap may break if Payload updates button markup | blocker | **forward-looking polish** | Log to TASKS.md. Not a current bug — the C8 CSS targets three independent selectors (`.document-controls .btn--style-primary button`, `button.btn.btn--style-primary[type="submit"]`, `.form-submit button.btn--style-primary`) so any one match is enough. If a future Payload release changes ALL three simultaneously, we'll notice immediately and can migrate to a component-slot approach. |
| D2.3 | Tile stagger 60ms may feel slow on mobile | polish | polish | Log — defer. 60ms × 8 = 480ms total, well under a user's next click. Will only surface as noticeable on the slowest devices. |
| D2.4 | Drifting leaves 0.05-0.07 opacity may be invisible on bright screens | polish | polish | Log — defer. Intentional: the leaves are a background atmosphere, not a focal element. Too much opacity turns them into a distraction. Yarit can tell us if she wants more. |
| D2.5 | Localizer RTL fix may break on Payload major version | polish | polish | Log — defer. Already documented in admin-brand.css comments. |
| D2.6 | driver.js 900ms timeout could fire before layout settles on fast machines | polish | polish | Log — defer. The 900ms timeout is generous; `yarit-dashboard__hello` is server-rendered so it exists in the DOM immediately. ResizeObserver refactor is over-engineering for one-shot tour. |
| D2.7 | C-round animations defined outside `@layer payload` | polish | polish | Log — defer. Current rules sit AT file end where Payload's layers are already established. Specificity wars haven't materialized. |
| D2.8 | Empty list `::before` may clash with future native Payload empty states | polish | polish | Log — defer. If Payload ships native component, we remove the CSS. Cheap cleanup. |
| D2.9 | Fixed-position leaves may clash with sticky filter bar | polish | polish | Log — defer. No sticky filter bars exist today; if one is added later, adjust then. |
| D2.10 | OrderRow mobile layout at 650px tablet portrait could be cramped | polish | polish | Log — defer. 650px is between mobile (375) and tablet (768) breakpoints; falls into mobile layout which is vertical stack. Vertical stack is forgiving at any width. |

**Action:** D1.1 fixed immediately (see above). All 8 D2 polish items logged into `docs/TASKS.md` under a new "Design Round 4 follow-ups" section. D2.1 dismissed as false positive. D2.2 reclassified as polish and logged.

---

## Overall verdict

Round 4 lands clean. One real blocker found (CheckoutForm dark-mode error card) and fixed the same session. Everything else is green:

- Hero light pocket works exactly as specified
- Logo halo is tack sharp in dark mode (filter: none)
- TrustBar creates the intentional contrast cliff below the Hero
- All 12 Track C admin delight moves implemented and verified at the code level
- All 20 Track B smoke rows passed
- TypeScript: 0 errors
- All storefront + admin routes return 200 post-change

The 8 D2 polish items + D2.2 reclassified are the Round 4 "future improvements" list. None are blocking production deployment.
