// Shared site chrome + page builders
window.LGShared = (function(){
  const { COPY, CATALOG } = window;
  const qs = new URLSearchParams(location.search);
  let lang = localStorage.getItem('lg_lang') || qs.get('lang') || 'en';

  function setLang(v) {
    lang = v; localStorage.setItem('lg_lang', v);
    document.documentElement.lang = v === 'he' ? 'he' : 'en';
    document.documentElement.dir = v === 'he' ? 'rtl' : 'ltr';
  }
  function t(k) { return (COPY[lang] && COPY[lang][k]) || COPY.en[k] || k; }
  function isHe() { return lang === 'he'; }

  function productName(p) { return isHe() ? p.he : p.en; }
  function productDesc(p) { return isHe() ? p.shortHe : p.shortEn; }
  function catName(c) { return isHe() ? c.he : c.en; }

  function plate(extra = '', { tag = '', specimen = '', kind = 'leaf' } = {}) {
    const cls = kind === 'ember' ? 'g-plate g-plate-ember'
              : kind === 'cream' ? 'g-plate g-plate-cream'
              : kind === '' ? 'g-plate'
              : 'g-plate g-plate-leaf';
    return `<div class="${cls} ${extra}">
      ${tag ? `<span class="g-plate-tag ${kind === 'cream' ? 'dark' : ''}">${tag}</span>` : ''}
      ${specimen ? `<span class="g-plate-specimen">№ ${specimen}</span>` : ''}
    </div>`;
  }

  function nav(current) {
    const link = (page, key) => `<a href="${page}.html${location.search}" class="${current === page ? 'is-active' : ''}" data-nav="${page}">${t(key)}</a>`;
    return `
      <nav class="g-nav">
        <a class="g-nav-brand" href="index.html${location.search}">
          Yarit<sup>°</sup><span style="font-family: var(--g-body); font-size: 12px; color: var(--g-mute); margin-${isHe() ? 'right' : 'left'}: 10px; font-style: italic;">— small apothecary</span>
        </a>
        <div class="g-nav-links">
          ${link('index', 'navHome')}
          ${link('shop', 'navShop')}
          ${link('journal', 'navJournal')}
          ${link('about', 'navAbout')}
          ${link('contact', 'navContact')}
        </div>
        <div class="g-nav-right">
          <button class="g-lang-pill" id="lg-lang-toggle">${isHe() ? 'EN' : 'עב'}</button>
          <a class="g-nav-icon" href="account.html${location.search}" title="${t('navAbout')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
          </a>
          <a class="g-nav-icon" href="cart.html${location.search}" title="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16l-2 12H6L4 6zM8 6V4a4 4 0 0 1 8 0v2"/></svg>
            <span class="g-nav-badge">3</span>
          </a>
        </div>
      </nav>`;
  }

  function banner() {
    const line = t('bannerLine');
    const seg = `<span>${line}</span>`;
    return `<div class="g-banner"><div class="g-banner-track">${seg.repeat(6)}</div></div>`;
  }

  function footer() {
    return `
      ${banner()}
      <footer class="g-footer">
        <div class="g-wrap">
          <div class="g-footer-grid">
            <div>
              <div class="g-footer-brand">Yarit<sup>°</sup></div>
              <p class="g-footer-tagline">${t('footerTag')}</p>
              <div class="g-footer-newsletter">
                <input placeholder="${isHe() ? 'האימייל שלך' : 'your@email.com'}"/>
                <button>${t('footerSubscribe')}</button>
              </div>
            </div>
            <div>
              <h4>${t('footerShop')}</h4>
              <ul>
                ${CATALOG.categories.map(c => `<li><a href="shop.html${location.search}">${catName(c)}</a></li>`).join('')}
              </ul>
            </div>
            <div>
              <h4>${t('footerInfo')}</h4>
              <ul>
                <li><a href="about.html${location.search}">${t('navAbout')}</a></li>
                <li><a href="journal.html${location.search}">${t('navJournal')}</a></li>
                <li><a href="#">Ingredients</a></li>
                <li><a href="#">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h4>${t('footerSupport')}</h4>
              <ul>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="contact.html${location.search}">${t('navContact')}</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>${t('footerNews')}</h4>
              <p style="color: var(--g-mute); font-size: 14px; margin: 0 0 16px;">${t('footerNewsSub')}</p>
              <div style="display: flex; gap: 10px; font-family: var(--g-accent); font-size: 20px; color: var(--g-ember);">
                <span>Instagram</span><span>·</span><span>Pinterest</span>
              </div>
            </div>
          </div>
          <div class="g-footer-bottom">
            <span>${t('footerRights')}</span>
            <span>Made slowly</span>
          </div>
        </div>
      </footer>`;
  }

  function soundToggle() {
    return `<button class="g-sound-toggle" id="lg-sound">🔈 ${isHe() ? 'צליל סביבתי' : 'ambient sound'}</button>`;
  }

  function productCard(p) {
    return `
      <article class="g-card g-reveal" data-slug="${p.slug}">
        <a href="product.html?slug=${p.slug}${location.search ? '&' + location.search.slice(1) : ''}" class="g-card-img">
          ${plate('', { tag: p.badge ? (p.badge.toUpperCase()) : '', specimen: p.specimen, kind: p.plate || '' })}
          <span class="g-card-bloom">❀</span>
        </a>
        <div class="g-card-body">
          <div class="g-card-cat">${catName(CATALOG.categories.find(c => c.slug === p.cat) || { en: 'Garden', he: 'גן' })}</div>
          <h4 class="g-card-name">${productName(p)}</h4>
          <p class="g-card-desc">${productDesc(p)}</p>
          <div class="g-card-row">
            <span class="g-price">₪${p.price}</span>
            <button class="g-add-btn">+ ${t('pdpAdd').split(' ')[0]}</button>
          </div>
        </div>
      </article>`;
  }

  function wireChrome() {
    setLang(lang);
    const toggleBtn = document.getElementById('lg-lang-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => {
      setLang(isHe() ? 'en' : 'he');
      location.reload();
    });
    const soundBtn = document.getElementById('lg-sound');
    if (soundBtn) soundBtn.addEventListener('click', () => {
      soundBtn.classList.toggle('is-on');
      soundBtn.innerHTML = soundBtn.classList.contains('is-on')
        ? '🔊 ' + (isHe() ? 'הסביבה דולקת' : 'ambience on')
        : '🔈 ' + (isHe() ? 'צליל סביבתי' : 'ambient sound');
    });
    const alive = document.getElementById('lg-alive-toggle');
    if (alive) alive.addEventListener('click', () => {
      window.GardenAlive.toggle();
      alive.textContent = window.GardenAlive.isEnabled() ? '✦ alive' : '○ still';
    });

    // Add-to-cart feedback
    document.body.addEventListener('click', (e) => {
      const b = e.target.closest('.g-add-btn');
      if (b) {
        e.preventDefault();
        b.classList.add('added');
        b.textContent = '✓';
        setTimeout(() => { b.classList.remove('added'); b.textContent = '+ ' + t('pdpAdd').split(' ')[0]; }, 1400);
      }
    });
  }

  return { nav, footer, banner, soundToggle, plate, productCard, t, isHe, setLang, productName, productDesc, catName, wireChrome };
})();
