/* Site-wide partial include + nav setup.
 *
 * Each page has <div data-include="partials/<name>.html"></div> mount points.
 * This script fetches each partial, injects it in place of the mount node,
 * and then wires up nav behavior (active link, scroll-aware classes).
 *
 * Subfolder handling: pages that live in a subfolder (e.g. /legal/privacy.html)
 * need their partial paths and the partial's own internal links rewritten
 * from ./foo to ../foo.
 */
(async () => {
  // ─── 1. Detect whether we're in a subfolder (currently only /legal/) ───
  const inSub = location.pathname.includes('/legal/');
  const upPrefix = inSub ? '../' : './';

  function rewriteRelativePaths(html) {
    if (!inSub) return html;
    // Bump every ./foo path one level up, but leave external (#, http://) alone
    return html
      .replace(/href="\.\/([^"]+)"/g, `href="${upPrefix}$1"`)
      .replace(/src="\.\/([^"]+)"/g, `src="${upPrefix}$1"`);
  }

  // ─── 2. Inject every partial mount point ───
  const mounts = Array.from(document.querySelectorAll('[data-include]'));
  for (const mount of mounts) {
    const partialPath = mount.dataset.include;
    const fetchPath = inSub ? '../' + partialPath : partialPath;
    try {
      const resp = await fetch(fetchPath);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const raw = await resp.text();
      const html = rewriteRelativePaths(raw);
      const wrap = document.createElement('div');
      wrap.innerHTML = html.trim();
      mount.replaceWith(...wrap.childNodes);
    } catch (err) {
      console.error(`[include] failed to load ${fetchPath}:`, err);
    }
  }

  // ─── 3. Highlight the current page's nav link ───
  const file = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  let activeKey = null;
  if (file === 'platform') activeKey = 'platform';
  else if (file === 'solutions' || file.startsWith('solutions-')) activeKey = 'solutions';
  else if (file === 'company') activeKey = 'company';
  // (Stories link is anchored to #proof on the homepage; leave inactive)
  if (activeKey) {
    const link = document.querySelector(`.nav-link[data-nav="${activeKey}"]`);
    if (link) link.classList.add('active');
  }

  // ─── 4. Hamburger toggle (visible at ≤768px) ───
  const toggle = document.querySelector('#navToggle');
  const navRight = document.querySelector('#navRight');
  if (toggle && navRight) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      navRight.classList.toggle('is-open', !isOpen);
    });
    // Close menu when a link inside is tapped, so the page navigates cleanly
    navRight.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        navRight.classList.remove('is-open');
      }
    });
    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navRight.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        navRight.classList.remove('is-open');
      }
    });
  }

  // ─── 5. Nav scroll behavior — hides on down-scroll, blurs on scroll,
  // and flips colors when a .section-light slab sits under the nav.
  const nav = document.querySelector('#siteNav');
  if (!nav) return;
  const lightSections = Array.from(document.querySelectorAll('.section-light'));
  let ticking = false;

  function update() {
    const y = window.scrollY || 0;
    nav.classList.toggle('is-scrolled', y > 8);

    // Nav stays sticky at all times — editorial sites (Apple/Stripe/The Atlantic/etc.)
    // keep the nav visible rather than auto-hiding on down-scroll.

    const probeY = 72;
    let onLight = false;
    for (const sec of lightSections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= probeY && r.bottom > probeY) { onLight = true; break; }
    }
    nav.classList.toggle('nav-on-light', onLight);

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // ─── 6. Footer hex-cell grid generator. Builds the animated honeycomb
  // background inside <svg id="footerHexGrid"> after the footer partial is
  // injected. Reflows on resize. ───
  const footerSvg = document.querySelector('#footerHexGrid');
  if (footerSvg) {
    const host = footerSvg.parentElement;
    const NS = 'http://www.w3.org/2000/svg';
    const R = 42;

    function buildHexGrid() {
      const rect = host.getBoundingClientRect();
      const w = Math.ceil(rect.width);
      const h = Math.ceil(rect.height);
      if (!w || !h) return;

      const hexW = Math.sqrt(3) * R;
      const vStep = 1.5 * R;

      footerSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      footerSvg.setAttribute('width', w);
      footerSvg.setAttribute('height', h);

      // Clear any existing cells (preserve <defs>)
      footerSvg.querySelectorAll('.hex-cell').forEach((n) => n.remove());

      const pts = [
        `0,${-R}`,
        `${hexW/2},${-R/2}`,
        `${hexW/2},${R/2}`,
        `0,${R}`,
        `${-hexW/2},${R/2}`,
        `${-hexW/2},${-R/2}`
      ].join(' ');
      const flySize = R * 1.0;
      const flyOffset = -flySize / 2;

      const frag = document.createDocumentFragment();
      const cols = Math.ceil(w / hexW) + 2;
      const rows = Math.ceil(h / vStep) + 2;

      for (let row = -1; row < rows; row++) {
        const xOffset = row % 2 ? hexW / 2 : 0;
        for (let col = -1; col < cols; col++) {
          const cx = col * hexW + xOffset;
          const cy = row * vStep;

          const g = document.createElementNS(NS, 'g');
          g.setAttribute('class', 'hex-cell');
          g.setAttribute('transform', `translate(${cx}, ${cy})`);

          const poly = document.createElementNS(NS, 'polygon');
          poly.setAttribute('class', 'hex-cell-shape');
          poly.setAttribute('points', pts);
          g.appendChild(poly);

          const use = document.createElementNS(NS, 'use');
          use.setAttribute('class', 'hex-fly');
          use.setAttribute('href', '#fly-silhouette');
          use.setAttribute('x', flyOffset);
          use.setAttribute('y', flyOffset);
          use.setAttribute('width', flySize);
          use.setAttribute('height', flySize);
          g.appendChild(use);

          frag.appendChild(g);
        }
      }
      footerSvg.appendChild(frag);
    }

    buildHexGrid();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildHexGrid, 140);
    });
  }
})();
