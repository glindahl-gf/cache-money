/* Extracted from legal.html */

/* Nav: hide on scroll-down, reveal on scroll-up; densify past hero. */
(() => {
  const nav = document.getElementById('siteNav');
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

/* Adaptive nav theme: when a .section-light is at the top of the viewport,
   flip the nav glyphs to dark. */
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

/* Active TOC item: track which doc article is currently in view. */
(() => {
  const tocLinks = Array.from(document.querySelectorAll('.legal-toc a[href^="#"]'));
  if (!tocLinks.length) return;
  const targets = tocLinks
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!targets.length) return;
  const linkFor = (id) => tocLinks.find(a => a.getAttribute('href') === '#' + id);
  let activeId = null;
  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    tocLinks.forEach(a => a.classList.remove('is-active'));
    const link = linkFor(id);
    if (link) link.classList.add('is-active');
  };
  const io = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
    if (visible.length) setActive(visible[0].target.id);
  }, { rootMargin: '-12% 0px -75% 0px', threshold: 0 });
  targets.forEach(t => io.observe(t));
  setActive(targets[0].id);
})();
