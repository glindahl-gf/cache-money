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

  /* Hero typewriter — rotates the subject word in "The ___ that get it."
     Same word list + cadence as the homepage closing stack. Above the
     fold, so it just starts on load (no IntersectionObserver). */
  (() => {
    const wordEl = document.getElementById('typeWord');
    if (!wordEl) return;
    const WORDS = ['leagues', 'teams', 'studios', 'brands'];
    const TYPE_MS = 85;
    const DELETE_MS = 45;
    const HOLD_FULL_MS = 1400;
    const HOLD_EMPTY_MS = 260;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { wordEl.textContent = WORDS[0]; return; }

    let wordIdx = 0, charIdx = 0, phase = 'typing', timer = null;
    const tick = () => {
      const word = WORDS[wordIdx];
      if (phase === 'typing') {
        charIdx++;
        wordEl.textContent = word.slice(0, charIdx);
        if (charIdx >= word.length) { phase = 'holding-full'; timer = setTimeout(tick, HOLD_FULL_MS); return; }
        timer = setTimeout(tick, TYPE_MS);
      } else if (phase === 'holding-full') {
        phase = 'deleting';
        timer = setTimeout(tick, DELETE_MS);
      } else if (phase === 'deleting') {
        charIdx--;
        wordEl.textContent = word.slice(0, Math.max(0, charIdx));
        if (charIdx <= 0) { wordIdx = (wordIdx + 1) % WORDS.length; phase = 'typing'; timer = setTimeout(tick, HOLD_EMPTY_MS); return; }
        timer = setTimeout(tick, DELETE_MS);
      }
    };
    wordEl.textContent = '';
    timer = setTimeout(tick, 320);
  })();

