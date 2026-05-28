/* Extracted from homepage-with-copy-3.html */

/* --- block 1 of 2 --- */
/* =========================================================================
   GREENFLY HOMEPAGE — single-file prototype
   =========================================================================
   Sections w/ script behavior:
     1. Hero subject cycler (mask slide)
     2. Live counter (ticks up)
     3. Stat strip count-ups (on scroll in)
     4. Value pillars pipeline (pin-scroll morph)
     5. Content-is-a-muscle tabs
     6. Editorial rotating card
     7. Closing stack line-by-line reveal
   ========================================================================= */

// --- Utilities ---------------------------------------------------------------
const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t) => a + (b - a) * t;

/* =========================================================================
   0. NAV — hide on scroll-down, reveal on scroll-up; densify past hero
   ========================================================================= */
(() => {
  const nav = qs('#siteNav');
  if (!nav) return;
  const HIDE_AFTER = 80;     // don't hide until past this scroll distance
  const DELTA = 6;           // ignore micro scroll jitter

  let lastY = window.scrollY || 0;
  let ticking = false;

  const update = () => {
    const y = window.scrollY || 0;
    const dy = y - lastY;

    nav.classList.toggle('is-scrolled', y > 24);

    if (Math.abs(dy) > DELTA) {
      if (dy > 0 && y > HIDE_AFTER) {
        nav.classList.add('nav-hidden');
      } else if (dy < 0) {
        nav.classList.remove('nav-hidden');
      }
      lastY = y;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Reveal nav whenever focus enters it via keyboard.
  nav.addEventListener('focusin', () => nav.classList.remove('nav-hidden'));
})();

/* Adaptive nav theme: when a `.section-light` is currently crossing the
   top band of the viewport, mark the nav as `nav-on-light` so its glyphs
   flip to dark. Coexists with `.is-scrolled`. */
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

/* =========================================================================
   1. HERO SUBJECT CYCLER
   Words slide up and out, next slides up and in. 4s cadence.
   ========================================================================= */
const SUBJECTS = ["Player's", "Partner's", "Producer's", "Performer's"];
(() => {
  const el = qs('#subject');
  if (!el) return;
  let i = 0;
  setInterval(() => {
    el.classList.add('out');
    setTimeout(() => {
      i = (i + 1) % SUBJECTS.length;
      el.textContent = SUBJECTS[i];
      el.classList.remove('out');
      el.classList.add('in');
      // force reflow then release
      void el.offsetWidth;
      el.classList.remove('in');
    }, 450);
  }, 3200);
})();

/* =========================================================================
   1B. HERO BACKDROP — exploding image hero (continuous loop + scroll)
   ~30 image cards. Each card cycles on its own time loop:
     start at safe-zone perimeter, scale .1, op 0  →  fly radially outward,
     scale up to 1, fade in  →  fade out near the edge  →  wrap back to
     center invisibly and start the next cycle.
   Per-card cycle duration + phase offset are randomized so cards keep
   emerging continuously (it never feels like a synchronized burst).
   The page scrolls normally — but scroll velocity adds to the virtual
   clock, so scrolling DOWN visibly speeds the warp.
   ========================================================================= */
(() => {
  const hero  = qs('#hero');
  const stage = qs('#explodeStage');
  if (!hero || !stage) return;

  // Pool of source images — randomized & sliced so each load looks fresh.
  // null entries render as styled placeholder swatches.
  const POOL = [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502810190503-8303352d0dd1?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505666287802-931582b5470d?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556506751-69a7d6fb6dc6?w=600&q=72&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=600&q=72&auto=format&fit=crop',
    null,
    null,
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NUM_CARDS    = 30;       // denser warp
  const CYCLE_MIN    = 5.5;      // seconds — fastest card cycle
  const CYCLE_MAX    = 11.0;     // seconds — slowest card cycle
  const SCROLL_BOOST = 0.006;    // virtual seconds added per pixel of scroll
  const SCROLL_DECAY = 0.88;     // per-frame decay of leftover scroll energy
  const FADE_IN_END  = 0.08;     // 0..1 of cycle — fade-in completes
  const FADE_OUT_BEG = 0.82;     // 0..1 of cycle — fade-out starts

  // Safe-zone semi-axes — cards spawn on the perimeter of this ellipse,
  // sized to clear the CTA row (the narrowest critical element) so it
  // never gets covered. Headline still gets a bit of overlap, which the
  // text-shadow + halo handle. Scale with viewport via clamps below.
  const SAFE_X_FRAC = 0.12;      // share of viewport width
  const SAFE_Y_FRAC = 0.18;      // share of viewport height
  const SAFE_X_MIN  = 160;
  const SAFE_X_MAX  = 220;
  const SAFE_Y_MIN  = 140;
  const SAFE_Y_MAX  = 220;

  // Aspect ratios — mix of square / portrait / landscape
  const ASPECTS = [
    [1, 1], [1, 1],
    [4, 3], [3, 4],
    [16, 10], [10, 16],
    [3, 2], [2, 3],
  ];

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const photos = shuffled(POOL);

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  const cards = [];
  let viewW = window.innerWidth, viewH = window.innerHeight;
  // Travel distance — corner of viewport + slack so cards exit cleanly.
  let maxRadius = Math.hypot(viewW, viewH) * 0.65;
  // Safe-zone semi-axes around the headline / CTA stack.
  let safeRX = 0, safeRY = 0;

  function buildCards() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    maxRadius = Math.hypot(viewW, viewH) * 0.65;
    safeRX = Math.max(SAFE_X_MIN, Math.min(viewW * SAFE_X_FRAC, SAFE_X_MAX));
    safeRY = Math.max(SAFE_Y_MIN, Math.min(viewH * SAFE_Y_FRAC, SAFE_Y_MAX));

    const frag = document.createDocumentFragment();

    for (let i = 0; i < NUM_CARDS; i++) {
      // Even angle distribution + jitter — no clumping at one direction
      const sector = (i / NUM_CARDS) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * (Math.PI * 2 / NUM_CARDS) * 0.9;
      const angle  = sector + jitter;

      // Per-card cycle: shorter = "foreground" (faster, larger).
      // Random spread + random phase offset keep the warp continuous.
      const cycleSec = rand(CYCLE_MIN, CYCLE_MAX);
      const offsetSec = Math.random() * cycleSec;
      const isFront = cycleSec < (CYCLE_MIN + CYCLE_MAX) * 0.5;

      // Front cards bigger; back cards smaller — depth via scale.
      const ratio = pick(ASPECTS);
      const baseSize = rand(150, 195) + (isFront ? rand(55, 115) : 0);
      const longSide  = baseSize;
      const shortSide = baseSize * (Math.min(ratio[0], ratio[1]) / Math.max(ratio[0], ratio[1]));
      const w = ratio[0] >= ratio[1] ? longSide : shortSide;
      const h = ratio[1] >  ratio[0] ? longSide : shortSide;

      const el = document.createElement('div');
      el.className = 'expl-card ' + (isFront ? 'is-front' : 'is-back');

      const photo = photos[i % photos.length];
      if (photo) el.style.backgroundImage = `url('${photo}')`;
      else       el.classList.add('expl-card--placeholder');

      el.style.width      = `${w.toFixed(0)}px`;
      el.style.height     = `${h.toFixed(0)}px`;
      el.style.marginLeft = `${(-w / 2).toFixed(1)}px`;
      el.style.marginTop  = `${(-h / 2).toFixed(1)}px`;
      el.style.opacity   = '0';
      el.style.transform = 'translate3d(0,0,0) scale(.1)';

      cards.push({
        el,
        cosA: Math.cos(angle),
        sinA: Math.sin(angle),
        cycleSec,
        offsetSec,
      });
      frag.appendChild(el);
    }

    stage.appendChild(frag);
  }

  buildCards();

  // ---- scroll → boost ------------------------------------------------------
  // Each scroll-down delta gets converted to virtual seconds and dumped
  // into a "boost" reservoir. The reservoir decays per frame, so the
  // warp visibly accelerates while you scroll and decays back to its
  // baseline rate when you stop.
  let lastScrollY = window.scrollY || 0;
  let boost = 0;            // unconsumed virtual seconds from scroll

  function onScroll() {
    const sy = window.scrollY || 0;
    const dy = sy - lastScrollY;
    lastScrollY = sy;
    // Both directions add energy — don't reverse the warp.
    boost += Math.abs(dy) * SCROLL_BOOST;
    if (boost > 4) boost = 4;        // cap so a fast flick can't overload
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- main loop -----------------------------------------------------------
  // virtTime advances at 1× real-time + drains from `boost` each frame.
  let virtTime = 0;
  let lastFrame = performance.now();
  let rafId = null;

  function tick(now) {
    const dt = Math.min(now - lastFrame, 50) * 0.001;   // sec, capped (tab-switch)
    lastFrame = now;

    // Drain a chunk of boost into virtual time, then decay the rest.
    const consume = boost * (1 - SCROLL_DECAY);
    virtTime += dt + consume;
    boost   -= consume;
    if (boost < 0.0005) boost = 0;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];

      // Cycle progress 0..1
      const phase = ((virtTime + c.offsetSec) % c.cycleSec) / c.cycleSec;

      // Card travels from the safe-zone perimeter (phase 0) outward to
      // maxRadius (phase 1), along its own angle. The center stays
      // clear of cards so the headline + CTAs are never blocked.
      const innerX = c.cosA * safeRX;
      const innerY = c.sinA * safeRY;
      const outerX = c.cosA * maxRadius;
      const outerY = c.sinA * maxRadius;
      const x = innerX + phase * (outerX - innerX);
      const y = innerY + phase * (outerY - innerY);

      // Scale 0.1 → 1.0 — flying toward the camera
      const scale = 0.1 + phase * 0.9;

      // Opacity: ramp in over the first FADE_IN_END, hold, ramp to 0 at end.
      // Reaching 0 at phase=1 means the wrap to 0 is invisible.
      let op;
      if (phase < FADE_IN_END) {
        op = phase / FADE_IN_END;
      } else if (phase > FADE_OUT_BEG) {
        op = 1 - (phase - FADE_OUT_BEG) / (1 - FADE_OUT_BEG);
      } else {
        op = 1;
      }

      c.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      c.el.style.opacity   = op.toFixed(3);
    }

    rafId = requestAnimationFrame(tick);
  }

  if (reduceMotion) {
    // Static: place cards near their mid-cycle positions so the section
    // doesn't look empty, but with no motion. Same safe-zone logic.
    for (const c of cards) {
      const phase = (c.offsetSec % c.cycleSec) / c.cycleSec;
      const innerX = c.cosA * safeRX;
      const innerY = c.sinA * safeRY;
      const outerX = c.cosA * maxRadius * 0.7;
      const outerY = c.sinA * maxRadius * 0.7;
      const x = innerX + phase * (outerX - innerX);
      const y = innerY + phase * (outerY - innerY);
      c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(0.5 + phase * 0.5).toFixed(2)})`;
      c.el.style.opacity = '.7';
    }
  } else {
    lastFrame = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  // Pause RAF when the hero scrolls fully out of view.
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!rafId && !reduceMotion) {
        lastFrame = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }, { threshold: 0 });
  io.observe(hero);

  // Rebuild on resize — sizes/radius depend on viewport.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const c of cards) c.el.remove();
      cards.length = 0;
      buildCards();
    }, 200);
  });
})();

/* =========================================================================
   3. STAT STRIP — count up on enter view; reset on exit so it replays on return
   ========================================================================= */
(() => {
  const counters = qsa('.count');
  if (!counters.length) return;
  const animate = (el) => {
    if (el._rafId) cancelAnimationFrame(el._rafId);
    const to = parseFloat(el.dataset.to);
    const dur = 1200;
    const start = performance.now();
    const isFloat = to < 10 && !Number.isInteger(to);
    const step = (now) => {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = to * eased;
      el.textContent = isFloat ? cur.toFixed(1) : Math.round(cur).toString();
      if (t < 1) el._rafId = requestAnimationFrame(step);
      else {
        el.textContent = isFloat ? to.toFixed(1) : to.toString();
        el._rafId = null;
      }
    };
    el._rafId = requestAnimationFrame(step);
  };
  const reset = (el) => {
    if (el._rafId) { cancelAnimationFrame(el._rafId); el._rafId = null; }
    const to = parseFloat(el.dataset.to);
    const isFloat = to < 10 && !Number.isInteger(to);
    el.textContent = isFloat ? '0.0' : '0';
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) animate(e.target);
      else reset(e.target);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
})();

/* =========================================================================
   3B. STATS HEADLINE — word-stagger reveal on first scroll-in
   .word delays are wired in CSS via custom property --i; here we just
   toggle .is-in when the headline enters the viewport.
   ========================================================================= */
(() => {
  const h = qs('#statsHeadline');
  if (!h) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) h.classList.add('is-in');
      else h.classList.remove('is-in');
    });
  }, { threshold: 0.3 });
  io.observe(h);
})();

/* =========================================================================
   4. VALUE PILLARS — pin-scroll pipeline animation (from index.html)
   ========================================================================= */
(() => {
  const IMAGE_SRC = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=2000&auto=format&fit=crop&q=80';
  const K_REL = [
    { px:50, py:50, fw:0.92, ar:1.50, zoom:1.00, fx:0.19, fy:0.54, ofx:0.00, ofy:0.00 },
    { px:50, py:50, fw:0.62, ar:1.00, zoom:2.40, fx:0.19, fy:0.54, ofx:0.00, ofy:0.00 },
    { px:24, py:50, fw:0.36, ar:1.00, zoom:2.40, fx:0.19, fy:0.54, ofx:0.00, ofy:0.00 },
    { px:50, py:50, fw:0.12, ar:1.00, zoom:2.40, fx:0.19, fy:0.54, ofx:-0.42, ofy:-0.22 }
  ];

  function cubicBezier(p1x, p1y, p2x, p2y) {
    const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
    const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
    const sampleX = t => ((ax * t + bx) * t + cx) * t;
    const sampleY = t => ((ay * t + by) * t + cy) * t;
    const sampleDX = t => (3 * ax * t + 2 * bx) * t + cx;
    function solveX(x) {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const v = sampleX(t) - x;
        if (Math.abs(v) < 1e-6) return t;
        const d = sampleDX(t);
        if (Math.abs(d) < 1e-6) break;
        t -= v / d;
      }
      let lo = 0, hi = 1;
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        if (sampleX(mid) < x) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
    return x => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solveX(x)));
  }
  const ease = cubicBezier(0.22, 0.61, 0.36, 1);

  const section   = qs('#pipeline');
  const stage     = qs('#stage');
  const photo     = qs('#photo');
  const photoImg  = qs('#photoImg');
  const railEls   = qsa('.rail');
  if (!section || !stage || !photo || !photoImg) return;

  let naturalW = 0, naturalH = 0;
  photoImg.addEventListener('load', () => {
    naturalW = photoImg.naturalWidth;
    naturalH = photoImg.naturalHeight;
    render();
  });
  photoImg.src = IMAGE_SRC;

  const DWELL = 0.6;
  function getProgress() {
    const rect = section.getBoundingClientRect();
    const vh   = window.innerHeight;
    const total = rect.height - vh;
    if (total <= 0) return { p: 0, frame: 0 };
    const scrolled = clamp(-rect.top, 0, total);
    const p = scrolled / total;
    const beatsTotal = K_REL.length;
    const beat = Math.min(beatsTotal - 1, Math.floor(p * beatsTotal));
    const within = (p * beatsTotal) - beat;
    let frame = beat;
    if (beat < beatsTotal - 1 && within > DWELL) {
      frame = beat + (within - DWELL) / (1 - DWELL);
    }
    return { p, frame };
  }

  function render() {
    if (!naturalW || !naturalH) return;
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    if (sw < 1 || sh < 1) return;

    const { frame } = getProgress();
    const segIdx = clamp(Math.floor(frame), 0, K_REL.length - 2);
    const localRaw = clamp(frame - segIdx, 0, 1);
    const t = ease(localRaw);
    const a = K_REL[segIdx];
    const b = K_REL[segIdx + 1];

    const kf = {
      px: lerp(a.px, b.px, t), py: lerp(a.py, b.py, t),
      fw: lerp(a.fw, b.fw, t), ar: lerp(a.ar, b.ar, t),
      zoom: lerp(a.zoom, b.zoom, t),
      fx: lerp(a.fx, b.fx, t), fy: lerp(a.fy, b.fy, t),
      ofx: lerp(a.ofx || 0, b.ofx || 0, t),
      ofy: lerp(a.ofy || 0, b.ofy || 0, t),
    };

    const boxW = kf.fw * sw;
    const boxH = boxW / kf.ar;
    const cx = (kf.px / 100) * sw + kf.ofx * sw;
    const cy = (kf.py / 100) * sh + kf.ofy * sw;
    const boxLeft = cx - boxW / 2;
    const boxTop  = cy - boxH / 2;

    const coverScale = Math.max(boxW / naturalW, boxH / naturalH);
    const imgW = naturalW * coverScale * kf.zoom;
    const imgH = naturalH * coverScale * kf.zoom;
    let imgLeft = boxW / 2 - imgW * kf.fx;
    let imgTop  = boxH / 2 - imgH * kf.fy;
    imgLeft = clamp(imgLeft, Math.min(0, boxW - imgW), 0);
    imgTop  = clamp(imgTop,  Math.min(0, boxH - imgH), 0);

    photo.style.width  = boxW + 'px';
    photo.style.height = boxH + 'px';
    photo.style.left   = boxLeft + 'px';
    photo.style.top    = boxTop + 'px';
    photoImg.style.width  = imgW + 'px';
    photoImg.style.height = imgH + 'px';
    photoImg.style.left   = imgLeft + 'px';
    photoImg.style.top    = imgTop + 'px';

    for (let i = 0; i < K_REL.length; i++) {
      const d = Math.abs(frame - i);
      const op = clamp(1 - d, 0, 1);
      stage.style.setProperty('--op-' + i, op.toFixed(3));
    }

    const photoCxPct = ((boxLeft + boxW / 2) / sw) * 100;
    const photoCyPct = ((boxTop  + boxH / 2) / sh) * 100;
    for (const rail of railEls) {
      rail.setAttribute('x1', photoCxPct.toFixed(2));
      rail.setAttribute('y1', photoCyPct.toFixed(2));
    }

    const dom = clamp(Math.round(frame), 0, K_REL.length - 1);
    if (stage.getAttribute('data-seg') !== String(dom)) {
      stage.setAttribute('data-seg', String(dom));
    }
    const barsOn = frame >= 2.9 ? '1' : '0';
    if (stage.getAttribute('data-bars-on') !== barsOn) {
      stage.setAttribute('data-bars-on', barsOn);
    }
  }

  let ticking = false;
  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  if (photoImg.complete && photoImg.naturalWidth) {
    naturalW = photoImg.naturalWidth;
    naturalH = photoImg.naturalHeight;
    render();
  }
})();

/* =========================================================================
   4. PILLARS — viz init + flash-card scroll shuffle + entry-triggered anims
   =========================================================================
   Structure:
     - Pre-build DOM for viz that needs generated content (mosaic, constellation).
     - A scroll-driven render loop interpolates each card's translateY based on
       scroll progress within the pinned section. Later cards sit above earlier
       ones (z-index), so an incoming card slides up over the outgoing one.
     - When a card's translateY crosses a threshold (it's at least half-in), we
       trigger its per-card animation once — stopwatch arc, mosaic tags, etc.
   ========================================================================= */
(() => {
  // --- 1. SVG illustration builders (modeled on story-timeline reference) ---
  const HOSTS = ['vizSpeed', 'vizScale', 'vizReach', 'vizImpact'];

  function buildCaptureSVG() {
    let bars = '';
    for (let i = 0; i < 11; i++) {
      const w = 60 + Math.random() * 300;
      const c = i < 7 ? '#B6F500' : '#2a2a26';
      const sz = (Math.random() * 40 + 1).toFixed(1);
      bars += `<rect class="cap-bar" x="40" y="${110 + i*20}" width="0" data-w="${w}" height="10" fill="${c}"/>`
            + `<text x="${50+w+10}" y="${119+i*20}" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="9" fill="#8a8a83">${sz}MB</text>`;
    }
    return `<svg viewBox="0 0 520 390" preserveAspectRatio="xMidYMid meet">
      <defs><pattern id="cap-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#1c1c1a" stroke-width=".6"/></pattern></defs>
      <rect width="520" height="390" fill="url(#cap-grid)"/>
      <text x="40" y="40" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="10" fill="#8a8a83" letter-spacing="2">INGEST · BATCH 042</text>
      <text x="40" y="80" font-family="'Barlow Condensed', sans-serif" font-weight="700" font-size="34" fill="#f5f5f2" class="cap-counter" data-final="10248">0 <tspan font-size="16" fill="#B6F500">assets</tspan></text>
      ${bars}
      <circle class="cap-live" cx="478" cy="44" r="5" fill="#B6F500"/>
      <text x="468" y="47" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="9" fill="#B6F500" text-anchor="end">LIVE</text>
    </svg>`;
  }

  function buildTagSVG() {
    const tags = ['#7 PORTER', '#23 MALIK', '#11 RUIZ', 'CELEB', 'GOAL', 'PRESSER', 'TUNNEL', 'BENCH', 'COACH', 'POST'];
    let cells = '';
    for (let i = 0; i < 10; i++) {
      const x = 40 + (i % 5) * 92;
      const y = 80 + Math.floor(i / 5) * 140;
      cells += `<g class="tag-cell" opacity="0">
        <rect x="${x}" y="${y}" width="80" height="120" fill="#0f0f0d" stroke="#1c1c1a"/>
        <rect x="${x}" y="${y}" width="80" height="120" fill="url(#stripe-t)" opacity=".4"/>
        <rect x="${x+2}" y="${y+2}" width="76" height="116" fill="none" stroke="#B6F500" stroke-width="1.2" class="tag-border" opacity="0"/>
        <rect x="${x}" y="${y+104}" width="80" height="16" fill="rgba(0,0,0,.75)"/>
        <text x="${x+5}" y="${y+115}" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="7" fill="#B6F500">${tags[i]}</text>
      </g>`;
    }
    return `<svg viewBox="0 0 520 390" preserveAspectRatio="xMidYMid meet">
      <defs><pattern id="stripe-t" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line y2="8" stroke="#2a2a26" stroke-width="3"/></pattern></defs>
      <text x="40" y="40" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="10" fill="#8a8a83" letter-spacing="2">AI TAGGING · 10 OF 50,000 SHOWN</text>
      ${cells}
    </svg>`;
  }

  function buildReachSVG() {
    const n = 14;
    let nodes = '', lines = '';
    const cx = 260, cy = 215;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 140 + (i%3)*10;
      const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r*0.62;
      const label = ['PLR','TM','LG','BR'][i%4];
      lines += `<line class="rc-line" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy}" data-x="${x}" data-y="${y}" stroke="#B6F500" stroke-opacity="0" stroke-width="1"/>`;
      nodes += `<g class="rc-node" data-x="${x}" data-y="${y}" transform="translate(${x} ${y}) scale(0)">
        <circle r="16" fill="#0a0a09" stroke="#B6F500" stroke-width="1.2"/>
        <text y="3" text-anchor="middle" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="7" fill="#B6F500">${label}</text>
      </g>`;
    }
    return `<svg viewBox="0 0 520 390" preserveAspectRatio="xMidYMid meet">
      <text x="40" y="40" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="10" fill="#8a8a83" letter-spacing="2">DISTRIBUTION · ${n} ENDPOINTS</text>
      ${lines}
      <g transform="translate(${cx} ${cy})">
        <polygon points="0,-32 28,-16 28,16 0,32 -28,16 -28,-16" fill="#B6F500"/>
        <text y="4" text-anchor="middle" font-family="'Barlow Condensed', sans-serif" font-weight="800" font-size="13" fill="#050505">HUB</text>
      </g>
      ${nodes}
    </svg>`;
  }

  function buildImpactSVG() {
    const pts = [];
    let y = 300;
    const N_PTS = 28;
    for (let i = 0; i <= N_PTS; i++) {
      y -= Math.random() * 12 - 1;
      y = Math.max(80, Math.min(y, 320));
      pts.push([40 + i * (440 / N_PTS), y]);
    }
    const polyStr = pts.map(p => p.join(',')).join(' ');
    const badgeY = pts[pts.length-3][1] - 36;
    return `<svg viewBox="0 0 520 390" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="imp-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#B6F500" stop-opacity=".5"/><stop offset="100%" stop-color="#B6F500" stop-opacity="0"/></linearGradient></defs>
      <text x="40" y="40" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="10" fill="#8a8a83" letter-spacing="2">EARNED MEDIA VALUE · Q1 → Q4</text>
      <text x="40" y="80" font-family="'Barlow Condensed', sans-serif" font-weight="700" font-size="36" fill="#f5f5f2" class="imp-amount" data-final="42.8">$0.0M <tspan font-size="16" fill="#B6F500">▲ 312%</tspan></text>
      ${[120,180,240,300].map(l => `<line x1="40" y1="${l}" x2="480" y2="${l}" stroke="#1c1c1a" stroke-dasharray="2 4"/>`).join('')}
      <polygon class="imp-area" points="40,350 ${polyStr} 480,350" fill="url(#imp-grad)" opacity="0"/>
      <polyline class="imp-line" points="${polyStr}" fill="none" stroke="#B6F500" stroke-width="2"/>
      <g transform="translate(350 ${badgeY})">
        <rect width="120" height="28" fill="#B6F500" class="imp-badge" opacity="0"/>
        <text x="10" y="18" font-family="ui-monospace, 'JetBrains Mono', monospace" font-size="10" fill="#050505" class="imp-badge-t" opacity="0">POST · 2.1M EMV</text>
      </g>
    </svg>`;
  }

  const BUILDERS = [buildCaptureSVG, buildTagSVG, buildReachSVG, buildImpactSVG];
  function mount(idx) {
    const host = qs('#' + HOSTS[idx]);
    // Skip static <img> hosts — those use PNG illustrations and don't need the SVG builders.
    if (host && host.tagName !== 'IMG') host.innerHTML = BUILDERS[idx]();
  }
  HOSTS.forEach((_, i) => mount(i));

  // --- 2. Scroll-flip state machinery ---
  const stack = qs('#pillarsStack');
  if (!stack) return;
  const cards = qsa('.pillar-card', stack);
  const segs = qsa('.pillar-progress-seg', stack);
  const N = cards.length;

  let currentIdx = 0;
  const triggered = new Array(N).fill(false);

  // Per-card RAFs/intervals so reset can cancel anything in flight
  const rafs = new Array(N).fill(null);

  /* Debounced animation trigger: wait for the card to settle and for the user
     to actually dwell on it before firing its viz animation. This prevents
     animations from being "used up" invisibly during fast scrolling, and makes
     the animation start after the card cascade has finished. */
  const ANIM_DWELL_MS = 450;
  let pendingAnimIdx = -1;
  let animTimer = null;

  function scheduleFireAnim(idx) {
    if (pendingAnimIdx === idx) return;
    clearTimeout(animTimer);
    pendingAnimIdx = idx;
    if (triggered[idx]) return;
    animTimer = setTimeout(() => {
      if (!triggered[idx] && currentIdx === idx) fireAnim(idx);
      pendingAnimIdx = -1;
    }, ANIM_DWELL_MS);
  }

  function fireAnim(idx) {
    if (triggered[idx]) return;
    triggered[idx] = true;
    const host = qs('#' + HOSTS[idx]);
    if (!host) return;
    if (idx === 0) animateCapture(host);
    else if (idx === 1) animateTag(host);
    else if (idx === 2) animateReach(host);
    else if (idx === 3) animateImpact(host);
  }

  // --- 3. WAAPI animations per viz ---
  function animateCapture(host) {
    qsa('.cap-bar', host).forEach((b, i) => {
      const target = parseFloat(b.dataset.w);
      b.animate(
        [{ width: '0px' }, { width: target + 'px' }],
        { duration: 900 + i * 60, delay: i * 50, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      setTimeout(() => b.setAttribute('width', target), 900 + i * 60 + i * 50);
    });
    const live = qs('.cap-live', host);
    if (live) live.animate(
      [{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }],
      { duration: 1200, iterations: Infinity }
    );
    const counter = qs('.cap-counter', host);
    if (counter && counter.firstChild) {
      const final = parseInt(counter.dataset.final, 10);
      const start = performance.now(), dur = 1600;
      const tick = (t) => {
        const p = clamp((t - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        counter.firstChild.nodeValue = Math.round(final * eased).toLocaleString() + ' ';
        if (p < 1) rafs[0] = requestAnimationFrame(tick);
        else rafs[0] = null;
      };
      rafs[0] = requestAnimationFrame(tick);
    }
  }

  function animateTag(host) {
    qsa('.tag-cell', host).forEach((c, i) => {
      setTimeout(() => {
        c.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 500, fill: 'forwards', easing: 'ease-out' }
        );
        c.setAttribute('opacity', 1);
        const border = c.querySelector('.tag-border');
        if (border) setTimeout(() => {
          border.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
          border.setAttribute('opacity', 1);
        }, 300);
      }, i * 120);
    });
  }

  function animateReach(host) {
    qsa('.rc-node', host).forEach((n, i) => {
      const x = n.dataset.x, y = n.dataset.y;
      setTimeout(() => {
        n.animate(
          [{ transform: `translate(${x} ${y}) scale(0)` }, { transform: `translate(${x} ${y}) scale(1)` }],
          { duration: 500, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' }
        );
        n.setAttribute('transform', `translate(${x} ${y}) scale(1)`);
      }, i * 80);
    });
    qsa('.rc-line', host).forEach((l, i) => {
      const tx = parseFloat(l.dataset.x), ty = parseFloat(l.dataset.y);
      setTimeout(() => {
        l.animate([{ strokeOpacity: 0 }, { strokeOpacity: .35 }], { duration: 400, fill: 'forwards' });
        l.setAttribute('stroke-opacity', .35);
        const start = performance.now(), dur = 500;
        const tick = (t) => {
          const p = clamp((t - start) / dur, 0, 1);
          l.setAttribute('x2', 260 + (tx - 260) * p);
          l.setAttribute('y2', 215 + (ty - 215) * p);
          if (p < 1) rafs[2] = requestAnimationFrame(tick);
          else rafs[2] = null;
        };
        rafs[2] = requestAnimationFrame(tick);
      }, i * 80);
    });
  }

  function animateImpact(host) {
    const line = qs('.imp-line', host);
    const area = qs('.imp-area', host);
    const badge = qs('.imp-badge', host);
    const badgeT = qs('.imp-badge-t', host);
    const amount = qs('.imp-amount', host);
    if (line) {
      const len = line.getTotalLength();
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
      line.animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 1800, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      line.style.strokeDashoffset = 0;
    }
    setTimeout(() => {
      if (area) {
        area.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800, fill: 'forwards' });
        area.setAttribute('opacity', 1);
      }
    }, 400);
    setTimeout(() => {
      if (badge) {
        badge.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
        badge.setAttribute('opacity', 1);
      }
      if (badgeT) {
        badgeT.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
        badgeT.setAttribute('opacity', 1);
      }
    }, 1600);
    if (amount && amount.firstChild) {
      const final = parseFloat(amount.dataset.final);
      const start = performance.now(), dur = 1800;
      const tick = (t) => {
        const p = clamp((t - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        amount.firstChild.nodeValue = '$' + (final * eased).toFixed(1) + 'M ';
        if (p < 1) rafs[3] = requestAnimationFrame(tick);
        else rafs[3] = null;
      };
      rafs[3] = requestAnimationFrame(tick);
    }
  }

  /* Reset all pillar viz state — called when the whole pillars section leaves
     viewport, so when the user scrolls back into it, animations replay from
     scratch as each card becomes current again. Re-mounting each SVG also
     wipes any in-flight WAAPI animations attached to its elements. */
  function resetAllVizzes() {
    rafs.forEach((id, i) => { if (id) cancelAnimationFrame(id); rafs[i] = null; });
    if (animTimer) { clearTimeout(animTimer); animTimer = null; }
    pendingAnimIdx = -1;
    triggered.fill(false);
    HOSTS.forEach((_, i) => mount(i));
  }

  /* Slot model:
       Each card's data-slot = (cardIdx - currentIdx).
       - slot 0  : current (on top, fully visible)
       - slot 1+ : behind, each lifted one head-height so its spine peeks above
       - slot <0 : exited (flown above the viewport, stays on top for the exit)
     The CSS transitions handle the motion: as currentIdx changes, all four cards
     simultaneously update their slot attribute and slide to the new offset. */
  function updateCards(newIdx) {
    cards.forEach((c, i) => {
      c.setAttribute('data-slot', i - newIdx);
    });
    segs.forEach((s, i) => s.classList.toggle('active', i <= newIdx));
  }

  /* Hysteresis: once we're in a state, require the scroll to move a bit PAST
     the threshold before committing to the new state. Prevents jitter when
     the user hovers right on a threshold boundary. */
  const HYSTERESIS = 0.015; // 1.5% of total pin scroll

  function render() {
    const rect = stack.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height - vh;
    if (total <= 0) return; // Mobile falls back to flat stack via CSS
    const scrolled = clamp(-rect.top, 0, total);
    const p = scrolled / total;
    const sectionInView = rect.top < vh && rect.bottom > 0;
    const ideal = clamp(Math.floor(p * N), 0, N - 1);

    let nextIdx = currentIdx;
    if (ideal > currentIdx) {
      // Scrolling forward — only advance once we're clearly past the threshold
      const threshold = (currentIdx + 1) / N;
      if (p > threshold + HYSTERESIS) nextIdx = ideal;
    } else if (ideal < currentIdx) {
      // Scrolling back — only retreat once we're clearly below the threshold
      const threshold = currentIdx / N;
      if (p < threshold - HYSTERESIS) nextIdx = ideal;
    }

    if (nextIdx !== currentIdx) {
      updateCards(nextIdx);
      currentIdx = nextIdx;
    }
    if (sectionInView) scheduleFireAnim(currentIdx);
  }

  let ticking = false;
  function schedule() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  render();

  /* Reset pillar viz state when the whole section leaves viewport so animations
     replay each time the user scrolls back to it. Re-entry fires via render(). */
  const vizResetObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) resetAllVizzes();
    });
  }, { threshold: 0 });
  vizResetObserver.observe(stack);
})();

/* =========================================================================
   4E. LIVE OPS LOG — streaming event feed + pillar highlight sync
   ========================================================================= */
(() => {
  const stream = qs('#logStream');
  const pills  = qsa('.ops-pill');
  const rateEl = qs('#logRate');
  if (!stream) return;

  const rand  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const randF = (a, b, d) => (Math.random() * (b - a) + a).toFixed(d);

  // [verb, pillarIdx, detailFn]
  const EVENTS = [
    ['CAPTURE', 0, () => `${rand(120, 800)} assets · W${rand(38,44)} G${rand(1,9)} · <b>ingested</b>`],
    ['CAPTURE', 0, () => `${rand(60, 280)} frames · ${rand(3, 12)} sources · <b>batch ok</b>`],
    ['CAPTURE', 0, () => `Sideline cam · ${rand(200, 900)} assets · <b>synced</b>`],
    ['TAG',     1, () => `<b>${rand(2400, 12800).toLocaleString()}</b> tags · ${randF(97, 99.3, 1)}% conf`],
    ['TAG',     1, () => `Player ID · <b>${rand(18, 52)}</b> recognized · cleared`],
    ['TAG',     1, () => `Sponsor match · <b>${rand(4, 16)}</b> · rights ok`],
    ['ROUTE',   2, () => `<b>${rand(32, 82)}</b> channels · ${rand(6, 18)} partners · cleared`],
    ['ROUTE',   2, () => `Athlete push · <b>${rand(24, 96)}</b> handles`],
    ['ROUTE',   2, () => `Broadcaster · IPTC embed · <b>${rand(1, 9)} feeds</b>`],
    ['MEASURE', 3, () => `${rand(22, 128)}M reach · <b>$${rand(18, 420)}K</b> sponsor value`],
    ['MEASURE', 3, () => `EMV booked · <b>$${rand(40, 210)}K</b> · GF-${rand(2800, 3300)}`],
    ['MEASURE', 3, () => `CTR · <b>${randF(4.2, 8.9, 1)}%</b> · ${rand(20, 140)}M reach`]
  ];

  const fmtTime = (d) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const MAX_LINES = 14;

  const flash = (idx) => {
    const pill = pills[idx];
    if (!pill) return;
    pill.classList.add('hot');
    clearTimeout(pill._ht);
    pill._ht = setTimeout(() => pill.classList.remove('hot'), 1800);
  };

  let rate = 412;
  const addLine = () => {
    const [verb, idx, detailFn] = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML =
      `<span class="log-time">${fmtTime(new Date())}</span>` +
      `<span class="log-verb">${verb}</span>` +
      `<span class="log-detail">${detailFn()}</span>`;
    stream.insertBefore(line, stream.firstChild);
    flash(idx);
    while (stream.children.length > MAX_LINES) {
      stream.removeChild(stream.lastChild);
    }
    rate = clamp(rate + rand(-3, 5), 380, 520);
    if (rateEl) rateEl.textContent = `Events / min · ${rate}`;
  };

  // Seed first lines quickly so the panel isn't empty on first paint
  for (let i = 0; i < 8; i++) setTimeout(addLine, i * 140);
  setInterval(addLine, 1600);
})();

/* =========================================================================
   5. CONTENT IS A MUSCLE — tabs + headline verb sync + fader indicator
   ========================================================================= */
(() => {
  const tabs = qsa('.muscle-tab');
  const panels = qsa('.muscle-panel');
  const indicator = qs('#muscleIndicator');
  if (!tabs.length) return;

  const moveIndicator = (tab) => {
    const rect = tab.getBoundingClientRect();
    const parentRect = tab.parentElement.getBoundingClientRect();
    indicator.style.left = (rect.left - parentRect.left) + 'px';
    indicator.style.width = tab.offsetWidth + 'px';
  };

  const activate = (idx) => {
    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
    moveIndicator(tabs[idx]);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => activate(i)));
  window.addEventListener('resize', () => {
    const active = qs('.muscle-tab.active');
    if (active) moveIndicator(active);
  });
  // initial
  requestAnimationFrame(() => moveIndicator(tabs[0]));
})();

/* =========================================================================
   6. EDITORIAL CARD — auto-rotate through 3 states
   ========================================================================= */
(() => {
  const panels = qsa('.editorial-panel');
  const dots = qsa('.editorial-dot');
  if (!panels.length) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % panels.length;
    panels.forEach((p, idx) => p.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }, 5200);
})();

/* =========================================================================
   7. CLOSING STACK — reveal lines on enter, drive typewriter loop while in view
   ========================================================================= */
(() => {
  const stack = qs('#closeStack');
  if (!stack) return;
  const lines = qsa('.close-line', stack);
  const wordEl = qs('#typeWord', stack);

  const WORDS = ['leagues', 'teams', 'studios', 'brands'];
  const TYPE_MS = 85;
  const DELETE_MS = 45;
  const HOLD_FULL_MS = 1400;
  const HOLD_EMPTY_MS = 260;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealTimers = [];
  let typeTimer = null;
  let wordIdx = 0;
  let charIdx = 0;
  let phase = 'typing';

  const stopType = () => {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
  };
  const tick = () => {
    if (!wordEl) return;
    const word = WORDS[wordIdx];
    if (phase === 'typing') {
      charIdx++;
      wordEl.textContent = word.slice(0, charIdx);
      if (charIdx >= word.length) {
        phase = 'holding-full';
        typeTimer = setTimeout(tick, HOLD_FULL_MS);
        return;
      }
      typeTimer = setTimeout(tick, TYPE_MS);
    } else if (phase === 'holding-full') {
      phase = 'deleting';
      typeTimer = setTimeout(tick, DELETE_MS);
    } else if (phase === 'deleting') {
      charIdx--;
      wordEl.textContent = word.slice(0, Math.max(0, charIdx));
      if (charIdx <= 0) {
        wordIdx = (wordIdx + 1) % WORDS.length;
        phase = 'typing';
        typeTimer = setTimeout(tick, HOLD_EMPTY_MS);
        return;
      }
      typeTimer = setTimeout(tick, DELETE_MS);
    }
  };
  const startType = () => {
    if (!wordEl) return;
    if (reduceMotion) {
      wordEl.textContent = WORDS[0];
      return;
    }
    stopType();
    wordIdx = 0;
    charIdx = 0;
    phase = 'typing';
    wordEl.textContent = '';
    typeTimer = setTimeout(tick, 320);
  };

  const reveal = () => {
    revealTimers.forEach(clearTimeout);
    revealTimers.length = 0;
    lines.forEach((line, idx) => {
      revealTimers.push(setTimeout(() => line.classList.add('reveal'), idx * 220));
    });
    revealTimers.push(setTimeout(startType, 260));
  };
  const hide = () => {
    revealTimers.forEach(clearTimeout);
    revealTimers.length = 0;
    lines.forEach(line => line.classList.remove('reveal'));
    stopType();
    if (wordEl) wordEl.textContent = '';
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) reveal();
      else hide();
    });
  }, { threshold: 0.3 });
  io.observe(stack);
})();

/* =========================================================================
   8. FOOTER FLY — back-to-top with smooth scroll
   ========================================================================= */
(() => {
  const fly = qs('#footerFly');
  if (!fly) return;
  fly.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =========================================================================
   9. FOOTER HEX GRID — generated pointy-top hexagons, hover shows fly
   Rebuilds on resize so the grid stays aligned to the footer's width.
   ========================================================================= */
(() => {
  const svg = qs('#footerHexGrid');
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
    qsa('.hex-cell', svg).forEach((n) => n.remove());

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

/* --- block 2 of 2 --- */
/* Variant 3 — Editorial Triptych hero.
   Auto-cycles Players / Leagues / Brands every 4s; hovering a panel locks
   to it and pauses the cycle. Mouseleave on the hero resumes the cycle. */
(() => {
  const section = document.getElementById('hero');
  if (!section || !section.classList.contains('hero-triptych')) return;
  const panels = Array.from(section.querySelectorAll('.tri-panel'));
  const words  = Array.from(section.querySelectorAll('.tri-word'));
  const KEYS   = ['players', 'leagues', 'brands'];
  let cur = 0;
  let timer = null;
  let locked = false;

  const apply = (idx) => {
    const prevKey = KEYS[cur];
    cur = idx;
    const key = KEYS[cur];
    section.setAttribute('data-active', key);
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.key === key));
    words.forEach(w => {
      w.classList.remove('is-current', 'is-out');
      if (w.dataset.key === key)         w.classList.add('is-current');
      else if (w.dataset.key === prevKey) w.classList.add('is-out');
    });
  };
  const tick      = () => apply((cur + 1) % KEYS.length);
  const startAuto = () => { stopAuto(); if (!locked) timer = setInterval(tick, 4000); };
  const stopAuto  = () => { if (timer) { clearInterval(timer); timer = null; } };

  panels.forEach(p => {
    const focusPanel = () => {
      const i = KEYS.indexOf(p.dataset.key);
      if (i === -1 || i === cur) return;
      locked = true;
      stopAuto();
      apply(i);
    };
    p.addEventListener('mouseenter', focusPanel);
    p.addEventListener('focus', focusPanel);
  });
  section.addEventListener('mouseleave', () => {
    locked = false;
    startAuto();
  });

  startAuto();
})();
