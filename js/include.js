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
  let lastY = window.scrollY || 0;
  let ticking = false;

  function update() {
    const y = window.scrollY || 0;
    nav.classList.toggle('is-scrolled', y > 8);

    if (y > lastY && y > 120) nav.classList.add('nav-hidden');
    else nav.classList.remove('nav-hidden');
    lastY = y;

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
})();
