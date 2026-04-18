// Alive cursor + scroll effects, global for Living Garden
(function(){
  const idRef = { v: 0 };
  let lastDrop = 0;
  let enabled = true;

  function ensureLayers() {
    if (document.getElementById('g-layers')) return;
    const wrap = document.createElement('div');
    wrap.id = 'g-layers';
    wrap.innerHTML = `
      <div id="g-cursor-spot" class="g-cursor-spot" aria-hidden></div>
      <div id="g-leaves" class="g-leaves" aria-hidden></div>
      <div id="g-scroll-vine" class="g-scroll-vine" aria-hidden>
        <svg viewBox="0 0 48 2400" preserveAspectRatio="none">
          <path id="g-vine-path" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"/>
          <g id="g-vine-leaves"></g>
        </svg>
      </div>`;
    document.body.appendChild(wrap);

    // build sinuous vine path
    const path = wrap.querySelector('#g-vine-path');
    let d = 'M24,0';
    for (let i = 0; i < 48; i++) {
      const y = i * 50;
      const x = 24 + Math.sin(i * 0.5) * 18;
      d += ` Q${x},${y-25} 24,${y}`;
    }
    path.setAttribute('d', d);
    const len = 2400;
    path.setAttribute('stroke-dasharray', len);
    path.setAttribute('stroke-dashoffset', len);

    // leaves at intervals
    const lg = wrap.querySelector('#g-vine-leaves');
    for (let i = 0; i < 18; i++) {
      const y = 80 + i * 130;
      const side = i % 2 === 0 ? 1 : -1;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(24, ${y}) rotate(${side * 40})`);
      g.setAttribute('opacity', '0');
      g.innerHTML = `
        <path d="M0,0 Q${side*14},-10 ${side*22},-2 Q${side*14},8 0,0 Z" fill="currentColor" opacity="0.85"/>
        <circle r="2.4" fill="currentColor"/>`;
      g.dataset.threshold = y;
      lg.appendChild(g);
    }
  }

  function spawnLeaf(x, y) {
    const leaves = document.getElementById('g-leaves');
    if (!leaves) return;
    const id = ++idRef.v;
    const glyphs = ['❦', '❀', '✿', '❧', '✾', '❣'];
    const hue = Math.random() > 0.5 ? 'leaf' : 'ember';
    const el = document.createElement('span');
    el.className = `g-leaf g-leaf-${hue}`;
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const size = 14 + Math.random() * 18;
    const drift = (Math.random() - 0.5) * 140;
    const rot = (Math.random() - 0.5) * 80;
    el.style.cssText = `left:${x}px;top:${y}px;font-size:${size}px;--drift:${drift}px;--rot:${rot}deg;`;
    leaves.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function onMove(e) {
    if (!enabled) return;
    const spot = document.getElementById('g-cursor-spot');
    if (spot) { spot.style.left = e.clientX + 'px'; spot.style.top = e.clientY + 'px'; }

    const now = performance.now();
    if (now - lastDrop > 80) {
      lastDrop = now;
      spawnLeaf(e.clientX + (Math.random() - 0.5) * 20, e.clientY + (Math.random() - 0.5) * 20);
    }

    // card parallax + glow
    const card = e.target.closest && e.target.closest('.g-card');
    if (card) {
      const r = card.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      card.style.setProperty('--mx', px + 'px');
      card.style.setProperty('--my', py + 'px');
      const tiltX = (py / r.height - 0.5) * -6;
      const tiltY = (px / r.width - 0.5) * 6;
      card.style.setProperty('--tx', tiltX + 'deg');
      card.style.setProperty('--ty', tiltY + 'deg');
    }
  }

  function onScroll() {
    const path = document.getElementById('g-vine-path');
    if (!path) return;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const prog = Math.min(1, window.scrollY / maxScroll * 1.5);
    path.setAttribute('stroke-dashoffset', (1 - prog) * 2400);

    const leaves = document.querySelectorAll('#g-vine-leaves g');
    leaves.forEach((l) => {
      const t = +l.dataset.threshold;
      const visible = prog * 2400 > t + 40;
      l.setAttribute('opacity', visible ? '0.95' : '0');
      l.style.transition = 'opacity 0.6s';
    });

    // reveal elements
    document.querySelectorAll('.g-reveal:not(.is-in)').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 80) el.classList.add('is-in');
    });
  }

  function init() {
    ensureLayers();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  window.GardenAlive = {
    init,
    enable: () => { enabled = true; const l = document.getElementById('g-layers'); if (l) l.style.display = ''; },
    disable: () => { enabled = false; const l = document.getElementById('g-layers'); if (l) l.style.display = 'none'; },
    toggle: () => enabled ? window.GardenAlive.disable() : window.GardenAlive.enable(),
    isEnabled: () => enabled,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
