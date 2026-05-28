/* Extracted from 404.html */

(() => {
  const stage      = document.getElementById('stage');
  const ballZero   = document.getElementById('ballZero');
  const ballImg    = document.getElementById('ballImg');
  const counterEl  = document.getElementById('pitchCount');

  const BALLS = [
    './images/404/baseball-1.svg',
    './images/404/basketball-1.svg',
    './images/404/tennis-ball.svg',
    './images/404/american-football.svg',
    './images/404/rugby.svg',
    './images/404/golf.svg',
    './images/404/punch.svg',
  ];

  // Preload so swaps don't flash blank
  BALLS.forEach(src => { const i = new Image(); i.src = src; });

  let centerIndex = 0;
  let pitches = 0;

  // ====== Center-ball shuffling ======
  function nextCenterBall() {
    centerIndex = (centerIndex + 1) % BALLS.length;
    swapCenterBall(BALLS[centerIndex]);
  }

  function swapCenterBall(src) {
    ballImg.classList.add('swap-out');
    setTimeout(() => {
      ballImg.src = src;
      ballImg.classList.remove('swap-out');
      ballImg.classList.add('swap-in');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ballImg.classList.remove('swap-in');
      }));
    }, 550);
  }

  // Auto-cycle the center ball every 4.5s for a calmer rhythm
  const CYCLE_MS = 4500;
  let autoCycleTimer = setInterval(nextCenterBall, CYCLE_MS);
  let resumeTimeout = null;
  function pauseAutoCycle(forMs = 6000) {
    clearInterval(autoCycleTimer);
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      autoCycleTimer = setInterval(nextCenterBall, CYCLE_MS);
    }, forMs);
  }

  function randomBall() {
    return BALLS[Math.floor(Math.random() * BALLS.length)];
  }

  // ====== Counter ======
  function bumpCounter() {
    pitches++;
    counterEl.textContent = pitches;
    if (pitches === 5)  showPop('Nice arm.', window.innerWidth/2, window.innerHeight*0.3);
    if (pitches === 12) showPop('That’s a strike.', window.innerWidth/2, window.innerHeight*0.3);
    if (pitches === 25) showPop('Home run.', window.innerWidth/2, window.innerHeight*0.3);
    if (pitches === 50) showPop('OK calm down.', window.innerWidth/2, window.innerHeight*0.3);
  }

  // ====== Click anywhere to launch a ball ======
  stage.addEventListener('click', (e) => {
    if (e.target.closest('.btn') || e.target.closest('.nav') || e.target.closest('.ball-zero')) return;
    launchBall(e.clientX, e.clientY);
  });

  function launchBall(targetX, targetY) {
    bumpCounter();

    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -60 : window.innerWidth + 60;
    const startY = window.innerHeight - 60 + (Math.random()*20);
    const src = randomBall();

    const ball = document.createElement('div');
    ball.className = 'ball-live';
    const img = document.createElement('img');
    img.src = src; img.alt = ''; img.draggable = false;
    ball.appendChild(img);
    ball.style.left = startX + 'px';
    ball.style.top  = startY + 'px';
    stage.appendChild(ball);

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);
    const duration = Math.min(900, 350 + distance * 0.4);
    const startTime = performance.now();
    const peakBoost = Math.max(80, distance * 0.25);
    let lastTrailTime = 0;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 1.6);

      const x = startX + dx * ease;
      const y = startY + dy * ease - Math.sin(ease * Math.PI) * peakBoost;
      const rot = ease * 720 * (fromLeft ? 1 : -1);

      ball.style.transform = `translate(${x - startX}px, ${y - startY}px) rotate(${rot}deg)`;

      if (now - lastTrailTime > 28) {
        spawnTrail(x + 22, y + 22);
        lastTrailTime = now;
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        burst(targetX, targetY);
        ball.style.transition = 'opacity .35s ease, transform .35s ease';
        ball.style.opacity = '0';
        setTimeout(() => ball.remove(), 400);
      }
    }
    requestAnimationFrame(frame);
  }

  function spawnTrail(x, y) {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    d.style.left = (x - 2) + 'px';
    d.style.top  = (y - 2) + 'px';
    stage.appendChild(d);
    requestAnimationFrame(() => {
      d.style.opacity = '0';
      d.style.transform = `translate(${(Math.random()-.5)*12}px, ${(Math.random()-.5)*12}px) scale(.4)`;
    });
    setTimeout(() => d.remove(), 900);
  }

  function burst(x, y) {
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('div');
      d.className = 'trail-dot';
      d.style.left = (x - 2) + 'px';
      d.style.top  = (y - 2) + 'px';
      if (i % 2 === 0) d.style.background = 'currentColor';
      stage.appendChild(d);
      const angle = (i / 6) * Math.PI * 2;
      const dist = 22 + Math.random()*16;
      requestAnimationFrame(() => {
        d.style.opacity = '0';
        d.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(.3)`;
      });
      setTimeout(() => d.remove(), 700);
    }
  }

  function showPop(text, x, y) {
    const p = document.createElement('div');
    p.className = 'pop';
    p.style.left = x + 'px';
    p.style.top  = y + 'px';
    p.textContent = text;
    stage.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }

  // ====== Click the central ball: shuffle + spin + launch ======
  let spinTimeout;
  ballZero.addEventListener('click', (e) => {
    e.stopPropagation();
    bumpCounter();

    nextCenterBall();
    pauseAutoCycle(4500);

    ballZero.classList.add('spinning');
    clearTimeout(spinTimeout);
    spinTimeout = setTimeout(() => ballZero.classList.remove('spinning'), 1200);

    const rect = ballZero.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const tx = Math.random() * window.innerWidth;
    const ty = Math.random() * window.innerHeight * 0.5 + 60;
    launchBallFrom(cx, cy, tx, ty);
  });

  function launchBallFrom(startX, startY, targetX, targetY) {
    const ball = document.createElement('div');
    ball.className = 'ball-live';
    const img = document.createElement('img');
    img.src = randomBall(); img.alt = ''; img.draggable = false;
    ball.appendChild(img);
    ball.style.left = startX + 'px';
    ball.style.top  = startY + 'px';
    stage.appendChild(ball);

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);
    const duration = Math.min(900, 350 + distance * 0.4);
    const startTime = performance.now();
    const peakBoost = Math.max(60, distance * 0.2);
    let lastTrailTime = 0;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 1.6);
      const x = startX + dx * ease;
      const y = startY + dy * ease - Math.sin(ease * Math.PI) * peakBoost;
      const rot = ease * 540;
      ball.style.transform = `translate(${x - startX}px, ${y - startY}px) rotate(${rot}deg)`;
      if (now - lastTrailTime > 28) {
        spawnTrail(x + 22, y + 22);
        lastTrailTime = now;
      }
      if (t < 1) requestAnimationFrame(frame);
      else {
        burst(targetX, targetY);
        ball.style.transition = 'opacity .35s ease';
        ball.style.opacity = '0';
        setTimeout(() => ball.remove(), 400);
      }
    }
    requestAnimationFrame(frame);
  }

  // ====== Drag-throw the central ball ======
  let dragging = false;
  let dragStart = null;
  let dragOrigin = null;

  ballZero.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    const rect = ballZero.getBoundingClientRect();
    dragOrigin = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
    dragStart  = { x: e.clientX, y: e.clientY };
    ballZero.setPointerCapture(e.pointerId);
    ballImg.style.transition = 'transform .05s linear';
  });
  ballZero.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const drag = Math.min(40, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    ballImg.style.transform = `translate(${Math.cos(angle)*drag*0.4}px, ${Math.sin(angle)*drag*0.4}px) rotate(${drag*4}deg)`;
  });
  ballZero.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    ballImg.style.transition = 'transform .55s var(--ease-out)';
    ballImg.style.transform = '';

    if (Math.hypot(dx, dy) > 14) {
      const throwLen = Math.min(900, Math.hypot(dx, dy) * 6);
      const angle = Math.atan2(dy, dx);
      const tx = dragOrigin.x + Math.cos(angle) * throwLen;
      const ty = dragOrigin.y + Math.sin(angle) * throwLen;
      bumpCounter();
      nextCenterBall();
      pauseAutoCycle(4500);
      launchBallFrom(dragOrigin.x, dragOrigin.y, tx, ty);
    }
  });

  // ====== Idle "auto-pitch" once after 8s if no interaction ======
  setTimeout(() => {
    if (pitches === 0) {
      launchBall(window.innerWidth/2, window.innerHeight/2);
    }
  }, 8000);
})();
