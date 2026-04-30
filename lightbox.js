// Lightbox — popup de fotos por comitente
const clientData = [
  { name: 'Grupo Techint', folder: 'Grupo Techint', count: 3 },
  { name: 'Pampa Energía',  folder: 'Pampa Energia',  count: 2 },
  { name: 'Siderar',        folder: 'Siderar',        count: 3 },
  { name: 'YPF',            folder: 'YPF',            count: 4 },
  { name: 'Molinos Río',    folder: 'Molinos Rio',    count: 2 },
  { name: 'Arcor Planta',   folder: 'Arcor Planta',   count: 3 },
  { name: 'Loma Negra',     folder: 'Loma Negra',     count: 2 },
  { name: 'Aluar',          folder: 'Aluar',          count: 3 },
];

function getSlides(client) {
  const arr = [];
  for (let i = 1; i <= client.count; i++) {
    arr.push('comitentes/' + client.folder + '/fotos/' + i + '.jpg');
  }
  return arr;
}

let lbClient = 0, lbSlide = 0, lbSlides = [], lbAnimating = false;
const lb = document.getElementById('lightbox');

function openLightbox(clientIdx) {
  lbClient = clientIdx;
  lbSlide = 0;
  lbSlides = getSlides(clientData[clientIdx]);
  lb.style.display = 'flex';
  lb.style.opacity = '0';
  lb.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => { lb.style.opacity = '1'; }));
  document.body.style.overflow = 'hidden';
  renderLightbox(null);
}

function closeLightbox() {
  lb.style.opacity = '0';
  setTimeout(() => { lb.style.display = 'none'; document.body.style.overflow = ''; }, 300);
}

function prevSlide() {
  if (lbAnimating) return;
  const n = (lbSlide - 1 + lbSlides.length) % lbSlides.length;
  animateSlide('right', n);
}

function nextSlide() {
  if (lbAnimating) return;
  const n = (lbSlide + 1) % lbSlides.length;
  animateSlide('left', n);
}

function goSlide(idx) {
  if (lbAnimating || idx === lbSlide) return;
  animateSlide(idx > lbSlide ? 'left' : 'right', idx);
}

function animateSlide(direction, nextIdx) {
  lbAnimating = true;
  const wrap = document.getElementById('lb-img-wrap');
  const outX = direction === 'left' ? '-110%' : '110%';
  const inX  = direction === 'left' ? '110%'  : '-110%';
  wrap.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s';
  wrap.style.transform = 'translateX(' + outX + ')';
  wrap.style.opacity = '0';
  setTimeout(() => {
    lbSlide = nextIdx;
    renderLightbox(inX);
    wrap.getBoundingClientRect();
    wrap.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s';
    wrap.style.transform = 'translateX(0)';
    wrap.style.opacity = '1';
    setTimeout(() => { lbAnimating = false; }, 340);
  }, 300);
}

function renderLightbox(fromX) {
  const client = clientData[lbClient];
  const total = lbSlides.length;

  document.getElementById('lb-name').textContent = client.name;
  document.getElementById('lb-counter').textContent = (lbSlide + 1) + ' / ' + total;

  const wrap = document.getElementById('lb-img-wrap');
  if (fromX !== null && fromX !== undefined) {
    wrap.style.transition = 'none';
    wrap.style.transform = 'translateX(' + fromX + ')';
    wrap.style.opacity = '0';
  } else {
    wrap.style.transition = 'none';
    wrap.style.transform = 'translateX(0)';
    wrap.style.opacity = '1';
  }

  // Dots
  const dotsEl = document.getElementById('lb-dots');
  dotsEl.innerHTML = lbSlides.map((_, i) => {
    const active = i === lbSlide;
    return '<span onclick="goSlide(' + i + ')" style="'
      + 'width:' + (active ? '22px' : '8px') + ';'
      + 'height:8px;border-radius:4px;'
      + 'background:' + (active ? '#f28d0f' : 'rgba(255,255,255,0.28)') + ';'
      + 'cursor:pointer;transition:all 0.35s;display:inline-block;"></span>';
  }).join('');

  // Logo header
  const logoEl = document.getElementById('lb-logo');
  if (logoEl) {
    const logoSrc = 'comitentes/' + client.folder + '/logo/logo.png';
    logoEl.src = logoSrc;
    logoEl.onerror = () => { logoEl.style.display = 'none'; };
    logoEl.onload = () => { logoEl.style.display = 'block'; };
  }

  // Image or placeholder
  const img = document.getElementById('lb-img');
  const ph  = document.getElementById('lb-placeholder');
  const src = lbSlides[lbSlide];
  const testImg = new Image();
  testImg.onload  = () => { img.src = src; img.style.display = 'block'; ph.style.display = 'none'; };
  testImg.onerror = () => { img.style.display = 'none'; ph.style.display = 'flex'; };
  testImg.src = src;
}

// Keyboard
document.addEventListener('keydown', e => {
  if (lb.style.display === 'none' || lb.style.display === '') return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevSlide();
  if (e.key === 'ArrowRight')  nextSlide();
});

// Click outside to close
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

// Touch swipe
let tsX = 0;
lb.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tsX;
  if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); }
});
