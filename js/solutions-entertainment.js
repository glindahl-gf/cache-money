/* Extracted from solutions-entertainment.html */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* Nav hide/show */

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */

/* Stepper */
(() => {
  const btns = qsa('#stageRail .stage-btn');
  const panels = qsa('#stageDetail .stage-panel');
  if (!btns.length) return;
  const select = (idx) => {
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('mouseenter', () => select(i));
    b.addEventListener('focus', () => select(i));
  });
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
