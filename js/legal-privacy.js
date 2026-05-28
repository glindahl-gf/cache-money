/* Extracted from legal/privacy.html */

/* Nav: hide on scroll-down, reveal on scroll-up; densify past hero. */

/* Adaptive nav theme on light section. */

/* Active TOC item: highlight whichever h2 is currently in view. */
(() => {
  const tocLinks = Array.from(document.querySelectorAll('.policy-toc a[href^="#"]'));
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
  }, { rootMargin: '-14% 0px -70% 0px', threshold: 0 });
  targets.forEach(t => io.observe(t));
  // Set initial active to first h2 if nothing in view yet
  setActive(targets[0].id);
})();
