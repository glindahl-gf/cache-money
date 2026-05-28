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
  
