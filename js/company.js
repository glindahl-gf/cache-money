/* Extracted from company.html */

/* --- block 1 of 2 --- */
document.documentElement.classList.add('js');

/* --- block 2 of 2 --- */
/* Nav: hide on scroll-down, show on scroll-up. */
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

  /* Adaptive nav theme: flip to dark glyphs when a `.section-light` is
     crossing the top band of the viewport. */
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

  /* Reveal-on-scroll. */
  (() => {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(e => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach(e => io.observe(e));
  })();

  /* Stats — count-up animation on scroll-in; resets on scroll-out so it
     replays if the user scrolls back. Mirrors the homepage-v2 pattern. */
  (() => {
    const counters = document.querySelectorAll('.count');
    if (!counters.length) return;
    const animate = (el) => {
      if (el._rafId) cancelAnimationFrame(el._rafId);
      const to = parseFloat(el.dataset.to);
      const dur = 1200;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(to * eased).toString();
        if (t < 1) el._rafId = requestAnimationFrame(step);
        else { el.textContent = to.toString(); el._rafId = null; }
      };
      el._rafId = requestAnimationFrame(step);
    };
    const reset = (el) => {
      if (el._rafId) { cancelAnimationFrame(el._rafId); el._rafId = null; }
      el.textContent = '0';
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting ? animate(e.target) : reset(e.target));
    }, { threshold: 0.4 });
    counters.forEach(c => io.observe(c));
  })();

  /* Stats headline — word-stagger reveal. Toggles `.is-in` on enter view;
     CSS handles the staggered fade-up via per-word `--i` custom properties. */
  (() => {
    const h = document.getElementById('statsHeadline');
    if (!h) return;
    if (!('IntersectionObserver' in window)) { h.classList.add('is-in'); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) h.classList.add('is-in');
        else h.classList.remove('is-in');
      });
    }, { threshold: 0.3 });
    io.observe(h);
  })();

  // Hero entrance — "The Filing"
  // Add the class on the next frame so first paint shows the staged state
  // (defined under html.js + prefers-reduced-motion: no-preference) and the
  // keyframes fire cleanly from there.
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  // Life at Greenfly — scroll-pinned horizontal strip
  // Translates the inner strip horizontally based on the user's scroll
  // progress through the outer .life-track. rAF-throttled, GPU-accelerated.
  // Skipped on mobile / reduced-motion; CSS falls back to native swipe.
  (function setupLifeStrip() {
    const track = document.querySelector('.life-track');
    if (!track) return;
    const strip = track.querySelector('.life-strip');
    if (!strip) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(max-width: 720px)').matches) return;

    let ticking = false;
    function update() {
      ticking = false;
      const r = track.getBoundingClientRect();
      const scrollable = track.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -r.top / scrollable));
      const distance = strip.scrollWidth - window.innerWidth;
      if (distance <= 0) {
        strip.style.setProperty('--strip-x', '0px');
        return;
      }
      strip.style.setProperty('--strip-x', `-${(progress * distance).toFixed(2)}px`);
    }
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // Life at Greenfly — click-to-open lightbox carousel
  // Cards open a fullscreen viewer. Prev/next cycle photos; Esc closes.
  // Photo list is read from .life-card <img> sources at setup time, so any
  // card whose image fails to load (the onerror=this.remove() path) is
  // automatically excluded.
  (function setupLifeLightbox() {
    const cards = document.querySelectorAll('.life-card');
    const box = document.getElementById('lifeLightbox');
    if (!cards.length || !box) return;
    const stageImg = box.querySelector('.life-lightbox-stage img');
    const counter  = box.querySelector('.life-lightbox-counter');
    const closeBtn = box.querySelector('.life-lightbox-close');
    const prevBtn  = box.querySelector('.life-lightbox-prev');
    const nextBtn  = box.querySelector('.life-lightbox-next');

    const slides = [];
    cards.forEach((card) => {
      const img = card.querySelector('img');
      if (!img) return;
      const idx = slides.length;
      slides.push({ src: img.src, alt: img.alt || '' });
      card.addEventListener('click', () => open(idx));
    });
    if (!slides.length) return;

    let i = 0;
    function show(idx) {
      i = (idx + slides.length) % slides.length;
      stageImg.src = slides[i].src;
      stageImg.alt = slides[i].alt;
      counter.textContent = `${i + 1} / ${slides.length}`;
    }
    function open(idx) {
      show(idx);
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-lightbox-open');
    }
    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-lightbox-open');
    }

    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    prevBtn.addEventListener('click',  (e) => { e.stopPropagation(); show(i - 1); });
    nextBtn.addEventListener('click',  (e) => { e.stopPropagation(); show(i + 1); });
    stageImg.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape')         close();
      else if (e.key === 'ArrowLeft')  show(i - 1);
      else if (e.key === 'ArrowRight') show(i + 1);
    });
  })();

  // Leadership bio modal — opens when a leader's card is clicked.
  // Bios live next to the markup as hidden <p class="person-bio">. The
  // LinkedIn URL is on each .person via data-linkedin (omitted when the
  // leader has no public profile, e.g. Sammi Marwan).
  (function setupPersonModal() {
    const cards = document.querySelectorAll('.person');
    const modal = document.getElementById('personModal');
    if (!cards.length || !modal) return;
    const photo = modal.querySelector('.person-modal-photo img');
    const name  = modal.querySelector('.person-modal-name');
    const role  = modal.querySelector('.person-modal-role');
    const bio   = modal.querySelector('.person-modal-bio');
    const link  = modal.querySelector('.person-modal-linkedin');
    const card  = modal.querySelector('.person-modal-card');
    const closeBtn = modal.querySelector('.person-modal-close');

    function open(person) {
      const img = person.querySelector('.person-photo');
      photo.src = img ? img.src : '';
      photo.alt = img ? img.alt : '';
      name.textContent = person.querySelector('.person-name')?.textContent || '';
      role.textContent = person.querySelector('.person-role')?.textContent || '';
      bio.textContent  = person.querySelector('.person-bio')?.textContent  || '';
      const url = person.dataset.linkedin;
      if (url) {
        link.href = url;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-person-modal-open');
      closeBtn.focus();
    }
    function close() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-person-modal-open');
    }

    cards.forEach((person) => {
      person.addEventListener('click', () => open(person));
      person.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(person);
        }
      });
    });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    card.addEventListener('click', (e) => e.stopPropagation());
    modal.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  })();

  // Hero pointer parallax — cursor anywhere in the hero drives the card.
  // Writes --mx/--my (-1..1) on the .specimen-tilt wrapper, normalized to
  // the hero's bounding rect, so the card responds across the full section.
  (function setupHeroParallax() {
    const hero = document.querySelector('.hero');
    const tilt = hero && hero.querySelector('.specimen-tilt');
    if (!tilt) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const clamp = (v) => Math.max(-1, Math.min(1, v));

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      tilt.style.setProperty('--mx', clamp(mx).toFixed(3));
      tilt.style.setProperty('--my', clamp(my).toFixed(3));
    });

    hero.addEventListener('mouseleave', () => {
      tilt.style.setProperty('--mx', '0');
      tilt.style.setProperty('--my', '0');
    });
  })();

  /* =========================================================================
     FOOTER HEX GRID — generated pointy-top hexagons; hover reveals fly.
     Rebuilds on resize so the grid stays aligned to the footer's width.
     ========================================================================= */
  (() => {
    const svg = document.querySelector('#footerHexGrid');
    if (!svg) return;
    const host = svg.parentElement;
    const NS = 'http://www.w3.org/2000/svg';
    const R = 42; // hex radius (center to corner)

    function build() {
      const rect = host.getBoundingClientRect();
      const w = Math.ceil(rect.width);
      const h = Math.ceil(rect.height);
      if (!w || !h) return;

      const hexW = Math.sqrt(3) * R;  // pointy-top width
      const vStep = 1.5 * R;           // vertical spacing between row centers

      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      // Clear any existing <g.hex-cell> but preserve <defs>
      svg.querySelectorAll('.hex-cell').forEach((n) => n.remove());

      const pts = [
        `0,${-R}`,
        `${hexW/2},${-R/2}`,
        `${hexW/2},${R/2}`,
        `0,${R}`,
        `${-hexW/2},${R/2}`,
        `${-hexW/2},${-R/2}`
      ].join(' ');
      const flySize = R * 1.0;
      const flyOffset = -flySize / 2;

      const frag = document.createDocumentFragment();
      const cols = Math.ceil(w / hexW) + 2;
      const rows = Math.ceil(h / vStep) + 2;

      for (let row = -1; row < rows; row++) {
        const xOffset = row % 2 ? hexW / 2 : 0;
        for (let col = -1; col < cols; col++) {
          const cx = col * hexW + xOffset;
          const cy = row * vStep;

          const g = document.createElementNS(NS, 'g');
          g.setAttribute('class', 'hex-cell');
          g.setAttribute('transform', `translate(${cx}, ${cy})`);

          const poly = document.createElementNS(NS, 'polygon');
          poly.setAttribute('class', 'hex-cell-shape');
          poly.setAttribute('points', pts);
          g.appendChild(poly);

          const use = document.createElementNS(NS, 'use');
          use.setAttribute('class', 'hex-fly');
          use.setAttribute('href', '#fly-silhouette');
          use.setAttribute('x', flyOffset);
          use.setAttribute('y', flyOffset);
          use.setAttribute('width', flySize);
          use.setAttribute('height', flySize);
          g.appendChild(use);

          frag.appendChild(g);
        }
      }
      svg.appendChild(frag);
    }

    build();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 140);
    });
  })();
