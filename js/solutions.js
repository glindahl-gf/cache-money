/* Extracted from solutions.html — solutions index page scripts */

/* ============================================================
   SOLUTIONS HUB — interactions
   1. Nav hide/show on scroll (matches homepage-v2)
   2. Accordion: click a card head to open it, others collapse.
      Sports starts open. Clicking the open card does nothing
      (we don't allow zero-open state — keeps the layout balanced).
   ============================================================ */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */
(() => {
  const nav = qs('#siteNav');
  if (!nav) return;
  const HIDE_AFTER = 80;
  const DELTA = 6;
  let lastY = window.scrollY || 0;
  let ticking = false;
  const update = () => {
    const y = window.scrollY || 0;
    const dy = y - lastY;
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

/* Accordion — open on hover (mouseenter). Click + focus also open the
   card so touch and keyboard users still work. The currently-open
   card remains open until the user hovers another. */
(() => {
  const cards = qsa('.hub-card');
  if (!cards.length) return;

  const openCard = (card) => {
    if (card.classList.contains('is-open')) return;
    cards.forEach((c) => {
      c.classList.remove('is-open');
      const h = qs('.card-head', c);
      if (h) h.setAttribute('aria-expanded', 'false');
    });
    card.classList.add('is-open');
    const head = qs('.card-head', card);
    if (head) head.setAttribute('aria-expanded', 'true');
  };

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => openCard(card));
    const head = qs('.card-head', card);
    if (head) {
      head.addEventListener('focus', () => openCard(card));
      head.addEventListener('click', () => openCard(card));
    }
  });
})();
