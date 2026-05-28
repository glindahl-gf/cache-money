/* Extracted from platform.html — page-specific scripts */


/* ─── Arc preview wheel controller ───────────────────────────────────── */

const qs  = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

/* NAV scroll behavior is now in js/include.js (single source of truth for the nav) */

/* ARC WHEEL — directional cascade triggered by scroll direction.
   Scroll-down entry: shuffle Collect → … → Automate.
   Scroll-up entry:   shuffle Automate → … → Collect.
   On exit, snap to the verb that matches the travel direction so the
   next entry plays the full sweep cleanly. ----------------------- */
(() => {
  const wheel = qs('#arcWheel');
  const track = qs('#arcWheelTrack');
  const section = qs('#arc-preview');
  if (!wheel || !track || !section) return;
  const verbs = qsa('.arc-verb', track);
  if (!verbs.length) return;
  const N = verbs.length;
  let currentIdx = 0;

  function centerOn(idx, instant = false) {
    idx = Math.max(0, Math.min(N - 1, idx));
    const target = verbs[idx];
    const wheelHeight = wheel.clientHeight;
    const verbCenterInTrack = target.offsetTop + target.offsetHeight / 2;
    const y = wheelHeight / 2 - verbCenterInTrack;
    if (instant) {
      const prev = track.style.transition;
      track.style.transition = 'none';
      track.style.transform = 'translateY(' + y + 'px)';
      void track.offsetHeight;
      track.style.transition = prev;
    } else {
      track.style.transform = 'translateY(' + y + 'px)';
    }
    verbs.forEach(v => v.classList.remove('is-active','is-near'));
    target.classList.add('is-active');
    const before = verbs[idx - 1]; if (before) before.classList.add('is-near');
    const after  = verbs[idx + 1]; if (after)  after.classList.add('is-near');
    currentIdx = idx;
  }

  // cascading step-through from currentIdx → targetIdx, one verb at a time
  let timers = [];
  const cancelTimers = () => { timers.forEach(clearTimeout); timers = []; };
  function cascadeTo(targetIdx) {
    cancelTimers();
    if (targetIdx === currentIdx) return;
    const step = targetIdx > currentIdx ? 1 : -1;
    const indices = [];
    for (let i = currentIdx + step;
         step > 0 ? i <= targetIdx : i >= targetIdx;
         i += step) {
      indices.push(i);
    }
    // readable cadence: each verb arrives in ~220ms and dwells ~120ms
    // before the next step fires — total sweep ~2.2s
    const baseDelay = 130;
    const stepGap = 340;
    indices.forEach((idx, k) => {
      timers.push(setTimeout(() => centerOn(idx), baseDelay + k * stepGap));
    });
  }

  // initial center on verb 0
  function init() { centerOn(0, true); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  requestAnimationFrame(init);
  window.addEventListener('resize', () => centerOn(currentIdx, true));

  // track scroll direction
  let lastY = window.scrollY;
  let dir = 'down';
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY) dir = 'down';
    else if (y < lastY) dir = 'up';
    lastY = y;
  }, { passive: true });

  // direction-aware sweep on viewport entry / exit
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (dir === 'down') {
          centerOn(0, true);       // snap to first
          cascadeTo(N - 1);        // shuffle forward to Automate
        } else {
          centerOn(N - 1, true);   // snap to last
          cascadeTo(0);            // shuffle backward to Collect
        }
      } else {
        cancelTimers();
        centerOn(dir === 'down' ? N - 1 : 0, true);
      }
    });
  }, { threshold: 0.4 });
  io.observe(section);
})();

/* CLOSING TYPEWRITER ------------------------------------------------- */
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
    if (reduceMotion) { wordEl.textContent = WORDS[0]; return; }
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
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? reveal() : hide());
  }, { threshold: 0.35 });
  io.observe(stack);
})();

/* FOOTER HEX GRID ---------------------------------------------------- */
(() => {
  const svg = qs('#footerHexGrid');
  if (!svg) return;
  const host = svg.parentElement;
  const NS = 'http://www.w3.org/2000/svg';
  const R = 42;

  function build() {
    const rect = host.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    if (!w || !h) return;

    const hexW = Math.sqrt(3) * R;
    const vStep = 1.5 * R;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);

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

/* PAPER-STACK SNAP — when scrolling rests inside a paper-stack zone,
   settle to the nearest paper. Direction-aware 1/5-viewport commit:
   scroll DOWN past 1/5 of the current paper → commit forward.
   Scroll UP past 1/5 from the current paper → commit backward.
   Below the threshold in either direction, spring back to the current
   paper. Outside paper-stack zones, scrolling stays free. ----------- */
(() => {
  const stacks = qsa('.paper-stack');
  if (!stacks.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let settleTimer = null;
  let lastScrollY = window.scrollY;
  let scrollDir = 'down';
  const SETTLE_MS = 140;
  const COMMIT = 0.2;

  function activeStack() {
    const vh = window.innerHeight;
    for (const s of stacks) {
      const r = s.getBoundingClientRect();
      if (r.top < vh * 0.5 && r.bottom > vh * 0.5) return s;
    }
    return null;
  }

  function snap() {
    // disable on mobile — paper-stack itself is disabled below 960px
    if (window.innerWidth <= 960) return;
    const stack = activeStack();
    if (!stack) return;
    const papers = qsa('.seq-band', stack);
    if (!papers.length) return;
    const vh = window.innerHeight;
    const stackTopDoc = window.scrollY + stack.getBoundingClientRect().top;
    const raw = (window.scrollY - stackTopDoc) / vh;
    // only snap while inside the transition range: [first paper, last paper]
    if (raw < 0 || raw > papers.length - 1) return;
    const base = Math.floor(raw);
    const frac = raw - base;
    // direction-aware commit: 20% threshold in whichever direction the
    // user was last scrolling. So commit feels equally easy both ways.
    let idx;
    if (scrollDir === 'down') {
      idx = frac >= COMMIT ? base + 1 : base;
    } else {
      idx = frac <= (1 - COMMIT) ? base : base + 1;
    }
    idx = Math.max(0, Math.min(papers.length - 1, idx));
    const target = stackTopDoc + idx * vh;
    if (Math.abs(window.scrollY - target) > 4) {
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastScrollY) scrollDir = 'down';
    else if (y < lastScrollY) scrollDir = 'up';
    lastScrollY = y;
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(snap, SETTLE_MS);
  }, { passive: true });
})();



/* ─── Collect · hub-and-spoke ingest illustration ───────────────────────────────────── */

(function () {
  const root  = document.getElementById('ingest');
  const stage = document.getElementById('ingest-stage');
  if (!root || !stage) return;

  // ── Layout config (1400 × 1120 stage, matching .still's 5:4) ───
  const STAGE_W = 1400, STAGE_H = 1120;
  const CX = STAGE_W / 2;
  const CY = 700;              // hub center y — matches the hub-mark's top: 62.5% (= 700/1120)
  const NODE_SIZE = 110;       // photo tile is 110 × 110
  const NODE_HALF = NODE_SIZE / 2;
  const NODE_R    = 480;       // distance from hub center to each upload-method node
  const HUB_R     = 126;

  // Four upload methods arranged in a wide arc across the top of the laptop
  const NODES = [
    { key:'human',        angle: -130, name:'HUMAN UPLOADS',   img:'images/platform/collect/Upload.svg' },
    { key:'automated',    angle: -105, name:'AUTOMATED FEEDS', img:'images/platform/collect/camera.svg' },
    { key:'integrations', angle:  -75, name:'INTEGRATIONS',    img:'images/platform/collect/laptop.svg' },
    { key:'ugc',          angle:  -50, name:'UGC',             img:'images/platform/collect/phone.svg' },
  ];

  const rad = d => d * Math.PI / 180;

  NODES.forEach(n => {
    n.x = CX + Math.cos(rad(n.angle)) * NODE_R;
    n.y = CY + Math.sin(rad(n.angle)) * NODE_R;
    const dx = CX - n.x, dy = CY - n.y;
    const dist = Math.hypot(dx, dy);
    const ux = dx / dist, uy = dy / dist;
    n.sx = n.x + ux * (NODE_HALF + 8);
    n.sy = n.y + uy * (NODE_HALF + 8);
    n.ex = CX - ux * (HUB_R + 4);
    n.ey = CY - uy * (HUB_R + 4);
  });

  // ── Build DOM/SVG ─────────────────────────────────────────────
  const NS = 'http://www.w3.org/2000/svg';
  const spokesG     = document.getElementById('ingest-spokes');
  const litSpokesG  = document.getElementById('ingest-lit-spokes');
  const pulsesG     = document.getElementById('ingest-pulses');
  const nodesEl     = document.getElementById('ingest-nodes');
  const labelsEl    = document.getElementById('ingest-labels');

  NODES.forEach((n, i) => {
    const sp = document.createElementNS(NS, 'line');
    sp.setAttribute('class', 'spoke');
    sp.setAttribute('x1', n.sx); sp.setAttribute('y1', n.sy);
    sp.setAttribute('x2', n.ex); sp.setAttribute('y2', n.ey);
    spokesG.appendChild(sp);

    const lit = document.createElementNS(NS, 'line');
    lit.setAttribute('class', 'spoke lit');
    lit.id = 'ingest-lit-node-' + i;
    lit.setAttribute('x1', n.sx); lit.setAttribute('y1', n.sy);
    lit.setAttribute('x2', n.ex); lit.setAttribute('y2', n.ey);
    litSpokesG.appendChild(lit);

    const pulse = document.createElementNS(NS, 'circle');
    pulse.setAttribute('class', 'pulse');
    pulse.setAttribute('r', '4');
    pulse.id = 'ingest-pulse-node-' + i;
    pulse.setAttribute('cx', n.sx);
    pulse.setAttribute('cy', n.sy);
    pulsesG.appendChild(pulse);

    const node = document.createElement('div');
    node.className = 'node';
    node.id = 'ingest-node-' + i;
    node.style.left = n.x + 'px';
    node.style.top  = n.y + 'px';
    node.innerHTML = `
      <div class="skeleton"></div>
      <div class="media"><img src="${n.img}" alt=""/></div>
      <div class="flash"></div>
    `;
    nodesEl.appendChild(node);

    // Label sits directly above each node — all nodes live in the top arc
    const lab = document.createElement('div');
    lab.className = 'label';
    lab.id = 'ingest-label-' + i;
    lab.style.left = n.x + 'px';
    lab.style.top  = (n.y - (NODE_HALF + 14)) + 'px';
    lab.style.transform = 'translate(-50%, -100%)';
    lab.textContent = n.name;
    labelsEl.appendChild(lab);
  });

  // ── Animation timeline ────────────────────────────────────────
  let timers = [];
  const setT = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearAll = () => { timers.forEach(clearTimeout); timers = []; };

  function travelPulse(pulseEl, sx, sy, ex, ey, duration, onArrive) {
    const start = performance.now();
    function step(now) {
      const k = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - k, 2);
      pulseEl.setAttribute('cx', sx + (ex - sx) * e);
      pulseEl.setAttribute('cy', sy + (ey - sy) * e);
      pulseEl.style.opacity = k < 0.1 ? k * 10 : (k > 0.93 ? (1 - k) * 14 : 1);
      if (k < 1) requestAnimationFrame(step);
      else onArrive && onArrive();
    }
    requestAnimationFrame(step);
  }

  function bloomHub() {
    root.classList.add('bloomed');
    setT(() => root.classList.remove('bloomed'), 900);
  }

  function firePhoto(i) {
    const n = NODES[i];
    const node  = document.getElementById('ingest-node-' + i);
    const label = document.getElementById('ingest-label-' + i);
    const lit   = document.getElementById('ingest-lit-node-' + i);
    const pulse = document.getElementById('ingest-pulse-node-' + i);
    const PULSE_MS = 720;

    node.classList.add('arrived', 'firing');
    setT(() => node.classList.remove('firing'), 460);

    lit.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0.55 }],
      { duration: PULSE_MS, fill: 'forwards', easing: 'ease-out' }
    );

    travelPulse(pulse, n.sx, n.sy, n.ex, n.ey, PULSE_MS, bloomHub);
    label.classList.add('lit');
  }

  function reset() {
    clearAll();
    NODES.forEach((_, i) => {
      document.getElementById('ingest-node-' + i).classList.remove('arrived', 'firing');
      document.getElementById('ingest-label-' + i).classList.remove('lit');
      const lit = document.getElementById('ingest-lit-node-' + i);
      lit.getAnimations().forEach(a => a.cancel());
      lit.style.opacity = 0;
      const p = document.getElementById('ingest-pulse-node-' + i);
      p.style.opacity = 0;
      p.setAttribute('cx', NODES[i].sx);
      p.setAttribute('cy', NODES[i].sy);
    });
  }

  // Left-to-right array loop through the four upload methods
  const PHOTO_ORDER = [0, 1, 2, 3];
  const PHOTO_STAGGER = 320;
  const CYCLE = 4200;
  let running = false;

  function cycle() {
    if (!running) return;
    reset();

    PHOTO_ORDER.forEach((i, k) => {
      setT(() => firePhoto(i), 400 + k * PHOTO_STAGGER);
    });

    setT(cycle, CYCLE);
  }

  function start() {
    if (running) return;
    running = true;
    cycle();
  }
  function stop() {
    running = false;
    clearAll();
  }

  // ── Responsive scaling (to container, not viewport) ───────────
  function fit() {
    const pw = root.clientWidth;
    const ph = root.clientHeight;
    if (!pw || !ph) return;
    const s = Math.min(pw / STAGE_W, ph / STAGE_H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  fit();
  window.addEventListener('resize', fit);
  if ('ResizeObserver' in window) {
    new ResizeObserver(fit).observe(root);
  }

  // ── Run only when visible, to save battery / respect reduce-motion ──
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Show final arrived state without animation
    NODES.forEach((_, i) => {
      document.getElementById('ingest-node-' + i).classList.add('arrived');
      document.getElementById('ingest-label-' + i).classList.add('lit');
    });
    return;
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.15 });
    io.observe(root);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
})();



/* ─── Hero · stepped reveal of the platform image stack ───────────────────────────────────── */

(function () {
  const steps = Array.from(document.querySelectorAll('.hero-image.hero-step'));
  if (!steps.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // skip animation — show only the final state
    steps[steps.length - 1].classList.add('is-on');
    return;
  }

  const BASE_DELAY = 140;   // ms before the first image fades in
  const HOLD       = 220;   // ms each step "rests" at full opacity
  const FADE       = 380;   // ms cross-fade duration (must match CSS)

  // Wait for every image to finish loading before starting, so the
  // cross-fade never reveals a partially decoded frame.
  const waits = steps.map(el =>
    el.complete && el.naturalWidth > 0
      ? Promise.resolve()
      : new Promise(resolve => {
          el.addEventListener('load',  resolve, { once: true });
          el.addEventListener('error', resolve, { once: true });
        })
  );

  Promise.all(waits).then(() => {
    // Step 1: fade image-1 in from black.
    setTimeout(() => steps[0].classList.add('is-on'), BASE_DELAY);

    // Steps 2…N: simultaneously fade the previous OUT and the next IN.
    // Because both transitions run in lockstep with ease-in-out, the
    // composite opacity stays close to 1 throughout the swap.
    for (let i = 1; i < steps.length; i++) {
      const t = BASE_DELAY + i * (FADE + HOLD);
      setTimeout(() => {
        steps[i - 1].classList.remove('is-on');
        steps[i].classList.add('is-on');
      }, t);
    }
  });
})();

/* AUTOMATE · honeycomb rosette ------------------------------------- */
(() => {
  const root = document.getElementById('automateRosette');
  if (!root) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const r  = 140;
  const cx = 500, cy = 500;
  const h  = r * Math.sqrt(3) / 2;          // 121.2436…
  const D  = r * Math.sqrt(3);              // 242.487…

  // flat-top hex: vertices at 0°, 60°, 120°, 180°, 240°, 300° from center.
  // Returns an array of [x, y] pairs (clockwise from the right vertex in SVG y-down).
  const flatTopHex = (cx, cy, r) => {
    const h = r * Math.sqrt(3) / 2;
    return [
      [cx + r,     cy        ],   // V0  right
      [cx + r / 2, cy + h    ],   // V1  lower-right
      [cx - r / 2, cy + h    ],   // V2  lower-left
      [cx - r,     cy        ],   // V3  left
      [cx - r / 2, cy - h    ],   // V4  upper-left
      [cx + r / 2, cy - h    ],   // V5  upper-right
    ];
  };
  const pointsStr = pts => pts.map(p => p.join(',')).join(' ');

  // surrounding hex centers, clockwise from N
  // angles measured from +x axis with SVG-positive (clockwise) = downward
  const dirs   = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];
  const angles = [-90, -30, 30, 90, 150, 210];
  const centers = angles.map(deg => {
    const rad = deg * Math.PI / 180;
    return { x: cx + D * Math.cos(rad), y: cy + D * Math.sin(rad) };
  });

  const centerVerts = flatTopHex(cx, cy, r);

  /* ----- data ---------------------------------------------------------- */
  const steps = [
    { number: '1', verbs: ['Collect'] },
    { number: '2', verbs: ['Organize'] },
    { number: '3', verbs: ['Distribute'] },
    { number: '4', verbs: ['Activate'] },
    { number: '5', verbs: ['Measure'] },
    { number: '6', verbs: ['Automate'] },
  ];

  // Greenfly horizontal mark (fly + wordmark). Rendered via CSS mask so the
  // color comes from .rosette-mark's background-color (olive), not the file.
  const centerLogo = `<span class="rosette-mark" role="img" aria-label="Greenfly"></span>`;

  /* ----- build SVG ----------------------------------------------------- */
  let svg = `<svg class="rosette-svg" viewBox="0 0 1000 1000" aria-hidden="true">`;

  // center hex polygon
  svg += `<polygon class="rosette-hex rosette-hex--center" points="${pointsStr(centerVerts)}"/>`;

  // six surrounding hex polygons
  centers.forEach((c, i) => {
    const pts = pointsStr(flatTopHex(c.x, c.y, r));
    svg += `<polygon class="rosette-hex rosette-hex--step" data-i="${i}" points="${pts}"/>`;
  });

  // signal — three olive dots travelling around the center hex perimeter
  const centerPath = `M ${centerVerts[0][0]} ${centerVerts[0][1]}
                      L ${centerVerts[1][0]} ${centerVerts[1][1]}
                      L ${centerVerts[2][0]} ${centerVerts[2][1]}
                      L ${centerVerts[3][0]} ${centerVerts[3][1]}
                      L ${centerVerts[4][0]} ${centerVerts[4][1]}
                      L ${centerVerts[5][0]} ${centerVerts[5][1]} Z`;
  svg += `
    <g class="rosette-signal rosette-signal--motion">
      <circle class="rosette-signal-dot" r="7" fill="#336A29">
        <animateMotion dur="18s" begin="0s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
      <circle class="rosette-signal-dot" r="5.5" fill="#659B3F">
        <animateMotion dur="18s" begin="-6s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
      <circle class="rosette-signal-dot" r="4" fill="#C1D95C">
        <animateMotion dur="18s" begin="-12s" repeatCount="indefinite" rotate="auto"
                       path="${centerPath}"/>
      </circle>
    </g>
    <g class="rosette-signal rosette-signal--static" aria-hidden="true">
      <circle r="7"   fill="#336A29"
              cx="${centerVerts[0][0]}" cy="${centerVerts[0][1]}"/>
      <circle r="5.5" fill="#659B3F"
              cx="${centerVerts[2][0]}" cy="${centerVerts[2][1]}"/>
      <circle r="4"   fill="#C1D95C"
              cx="${centerVerts[4][0]}" cy="${centerVerts[4][1]}"/>
    </g>`;

  svg += `</svg>`;

  /* ----- build HTML overlay (static labels — no interaction) ---------- */
  let overlay = `<div class="rosette-overlay">`;
  overlay += `<div class="rosette-center-content" aria-hidden="true">${centerLogo}</div>`;
  steps.forEach((step, i) => {
    const c = centers[i];
    const left = (c.x / 10).toFixed(3);   // % of 1000
    const top  = (c.y / 10).toFixed(3);
    const verbHtml = step.verbs.map(v => `<span class="rosette-verb">${v}</span>`).join('');
    overlay += `
      <div class="rosette-step" data-i="${i}"
           style="left:${left}%;top:${top}%">
        <span class="rosette-num">${step.number}</span>
        ${verbHtml}
      </div>`;
  });
  overlay += `</div>`;

  root.innerHTML = svg + overlay;
})();

