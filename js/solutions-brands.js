/* Extracted from solutions-brands.html */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */

/* Operating-model rail — click a module to expand */
(() => {
  const rail = qs('#modulesRail');
  const modules = qsa('#modulesRail .module');
  if (!rail || !modules.length) return;
  const select = (idx) => {
    modules.forEach((m, i) => m.classList.toggle('active', i === idx));
    rail.classList.remove('active-0', 'active-1', 'active-2');
    rail.classList.add(`active-${idx}`);
  };
  modules.forEach((m, i) => {
    m.addEventListener('click', () => select(i));
    m.addEventListener('mouseenter', () => select(i));
    m.querySelector('.module-head')?.addEventListener('focus', () => select(i));
  });
})();

/* Bar reveal on scroll */
(() => {
  const rows = qsa('.proof-bar-row');
  if (!rows.length || !('IntersectionObserver' in window)) {
    rows.forEach(r => r.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  rows.forEach(r => io.observe(r));
})();
