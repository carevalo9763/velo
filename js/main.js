// ===== CANVAS FRAME SCRUB (apex-growth pattern) =====
const canvas = document.getElementById('scrollCanvas');
const scrollSection = document.getElementById('scrollSection');
const scrollLoader = document.getElementById('scrollLoader');
const loaderText = document.getElementById('loaderText');
const loaderBar = document.getElementById('loaderBar');
const scrollCue = document.getElementById('scrollCue');
const scrollOverlay = document.getElementById('scrollOverlay');

const FRAME_COUNT = 121;
const frames = [];
let loadedCount = 0;
let currentFrame = 0;
let targetFrame = 0;
let rafRunning = false;

if (canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const setCanvasSize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  };
  setCanvasSize();
  window.addEventListener('resize', () => {
    setCanvasSize();
    if (frames[currentFrame]) drawFrame(currentFrame);
  });

  const drawFrame = (index) => {
    const img = frames[index];
    if (!img || !img.complete) return;
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    const isMobile = window.innerWidth <= 600;
    const scale = isMobile
      ? Math.min(cw / img.width, ch / img.height)
      : Math.max(cw / img.width, ch / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  };

  const pad = (n) => String(n).padStart(4, '0');

  // Preload all frames
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    img.src = `frames/frame${pad(i)}.jpg`;
    img.onload = () => {
      loadedCount++;
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      if (loaderBar) loaderBar.style.width = pct + '%';
      if (loaderText) loaderText.textContent = `Loading… ${pct}%`;

      if (loadedCount === FRAME_COUNT) {
        // All frames ready
        if (scrollLoader) scrollLoader.classList.add('hidden');
        canvas.classList.add('ready');
        if (scrollCue) scrollCue.style.opacity = '0.4';
        drawFrame(0);
        startRAF();
      }
    };
    frames[i - 1] = img;
  }

  // RAF LERP loop
  const startRAF = () => {
    if (rafRunning) return;
    rafRunning = true;
    const tick = () => {
      currentFrame += (targetFrame - currentFrame) * 0.25;
      const frameIndex = Math.round(currentFrame);
      drawFrame(Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Scroll handler
  window.addEventListener('scroll', () => {
    if (!scrollSection) return;
    const sectionTop = scrollSection.offsetTop;
    const scrollable = scrollSection.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, (window.scrollY - sectionTop) / scrollable));

    targetFrame = progress * (FRAME_COUNT - 1);

    // Hide scroll cue
    if (scrollCue) scrollCue.style.opacity = progress > 0.02 ? '0' : '0.4';

    // Show overlay at 70%
    if (scrollOverlay) {
      if (progress > 0.7) scrollOverlay.classList.add('visible');
      else scrollOverlay.classList.remove('visible');
    }
  });
}

// ===== REVEAL ON SCROLL =====
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
reveals.forEach(el => revealObserver.observe(el));

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});
