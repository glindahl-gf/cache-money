/* Extracted from get-greenfly.html */

/* --- block 1 of 2 --- */
document.documentElement.classList.add('js');

/* --- block 2 of 2 --- */
/* Textarea character counter — mirrors "0 of 500 max characters" on
     the reference page. Toggles a near-limit color in the last 50 chars. */
  (() => {
    const ta = document.getElementById('f-msg');
    const out = document.getElementById('msgCount');
    const wrap = document.getElementById('msgCounter');
    if (!ta || !out || !wrap) return;
    const max = parseInt(ta.getAttribute('maxlength'), 10) || 500;
    const update = () => {
      const n = ta.value.length;
      out.textContent = String(n);
      wrap.classList.toggle('is-near', n > max - 50);
    };
    ta.addEventListener('input', update);
    update();
  })();

  /* Form submission — intercepts client-side and shows the thank-you
     state. The captcha checkbox lives outside the <form> element so the
     submit handler validates it explicitly alongside required fields.
     Wire to the team's CRM / HubSpot / lead intake endpoint when
     integrating. */
  (() => {
    const form = document.getElementById('leadForm');
    if (!form) return;
    const submitBtn = document.querySelector('button[form="leadForm"]');
    const captcha = document.getElementById('f-human');
    const handler = (e) => {
      e.preventDefault();
      let firstBad = null;
      const required = form.querySelectorAll('[required]');
      required.forEach((el) => {
        const bad = !el.value.trim() ||
                    (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
        if (bad && !firstBad) firstBad = el;
      });
      if (!firstBad && captcha && !captcha.checked) firstBad = captcha;
      if (firstBad) { firstBad.focus(); return; }
      form.classList.add('is-submitted');
    };
    form.addEventListener('submit', handler);
    if (submitBtn) submitBtn.addEventListener('click', handler);
  })();

  /* Footer hex grid — generated pointy-top hexagons, hover reveals fly.
     Same pattern as index.html. Rebuilds on resize so the grid stays
     aligned to the footer's width. */
  (() => {
    const qs  = (s, el = document) => el.querySelector(s);
    const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
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
