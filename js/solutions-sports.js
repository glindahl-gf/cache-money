/* Extracted from solutions-sports.html */

/* ============================================================
   1. Nav hide/show on scroll (matches solutions.html)
   2. Timeline — click a stop to update detail panel + fill
   3. Audience tabs — click to switch panel
   ============================================================ */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */
(() => {
  const nav = qs('#siteNav'); if (!nav) return;
  const HIDE_AFTER = 80, DELTA = 6;
  let lastY = window.scrollY || 0, ticking = false;
  const update = () => {
    const y = window.scrollY || 0, dy = y - lastY;
    nav.classList.toggle('is-scrolled', y > 24);
    if (Math.abs(dy) > DELTA) {
      if (dy > 0 && y > HIDE_AFTER) nav.classList.add('nav-hidden');
      else if (dy < 0)              nav.classList.remove('nav-hidden');
      lastY = y;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('nav-hidden'));
})();

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */
(() => {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  const lights = document.querySelectorAll('.section-light');
  if (!lights.length) return;
  const NAV_H = 60;
  const margin = () => `0px 0px -${Math.max(0, window.innerHeight - NAV_H)}px 0px`;
  const active = new Set();
  let io;
  const wire = () => {
    if (io) io.disconnect();
    active.clear();
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) active.add(e.target);
        else active.delete(e.target);
      });
      nav.classList.toggle('nav-on-light', active.size > 0);
    }, { rootMargin: margin(), threshold: 0 });
    lights.forEach(el => io.observe(el));
  };
  wire();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(wire, 200); });
})();

/* Timeline */
(() => {
  const stops   = qsa('#tlStops .ts-btn');
  const panels  = qsa('#tlDetail .panel');
  const fill    = qs('#tlFill');
  if (!stops.length) return;

  const select = (idx) => {
    stops.forEach((b, i) => b.classList.toggle('active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
    if (fill) {
      const pct = stops.length === 1 ? 100 : (idx / (stops.length - 1)) * 100;
      fill.style.width = pct + '%';
    }
  };

  stops.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('mouseenter', () => select(i));
    b.addEventListener('focus', () => select(i));
  });

  /* init fill at stop 0 */
  if (fill) fill.style.width = '0%';
})();

/* Audience tabs */
(() => {
  const tabs   = qsa('#audTabs .aud-tab');
  const panels = qsa('#audPanels .aud-panel');
  if (!tabs.length) return;
  const select = (idx) => {
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('mouseenter', () => select(i));
    t.addEventListener('focus', () => select(i));
  });
})();
