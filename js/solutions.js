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

/* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
   currently crossing the top band of the viewport. */

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
