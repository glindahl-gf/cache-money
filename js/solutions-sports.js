/* Extracted from solutions-sports.html */

/* ============================================================
   1. Nav hide/show on scroll (matches solutions.html)
   2. Timeline — click a stop to update detail panel + fill
   3. Audience tabs — click to switch panel
   ============================================================ */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */

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
