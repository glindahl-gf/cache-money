/* Extracted from solutions-live-events.html */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */

/* Two-engine highlighter */
(() => {
  const stage = qs('#engineStage');
  if (!stage) return;
  const cells = qsa('#engineStage .engine, #engineStage .pipeline');
  const select = (idx) => {
    cells.forEach((c, i) => c.classList.toggle('active', i === idx));
  };
  cells.forEach((c, i) => {
    c.addEventListener('click', () => select(i));
    c.addEventListener('mouseenter', () => select(i));
  });
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
  if (fill) fill.style.width = '0%';
})();
