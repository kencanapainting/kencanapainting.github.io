/* ===================================================================
   Kencana Painting — Shared Script
   Handles: favicon crop, mobile nav, scroll-reveal, footer year, project rendering
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initFavicon();
  setYear();
  initNav();
  initReveal();
  initProjectPreview();   // runs only if #projectPreviewGrid exists (index.html)
  initProjectsPage();     // runs only if #projectGrid exists (projects.html)
});

/* Crops the wide Kencana_Painting_Logo.jpeg directly to the gold square badge for the browser tab */
function initFavicon(){
  const img = new Image();
  img.src = 'Kencana_Painting_Logo.jpeg';
  img.onload = () => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rounded square clipping path matching the gold badge
    const r = 13;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();

    // Crop exact center square of Kencana_Painting_Logo.jpeg where the gold badge sits
    const badgeSize = img.height * 0.515;
    const sx = (img.width - badgeSize) / 2;
    const sy = (img.height - badgeSize) / 2;
    ctx.drawImage(img, sx, sy, badgeSize, badgeSize, 0, 0, size, size);

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
  };
}

function setYear(){
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function initNav(){
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navToggle || !navLinks) return;
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }));
}

function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

/* Build a single project card's HTML */
function projectCardHTML(p){
  const photo = p.image
    ? `<img src="${p.image}" alt="${p.title} — ${p.category} in ${p.location}">`
    : `<span>Add project photo here</span>`;
  return `
    <div class="project-card" data-category="${p.category}">
      <div class="project-photo">${photo}</div>
      <div class="project-info">
        <span class="tag mono">${p.category} · ${p.year}</span>
        <h3>${p.title}</h3>
        <p>${p.location} — ${p.description}</p>
      </div>
    </div>`;
}

/* index.html: show a short preview of the most recent projects */
function initProjectPreview(){
  const grid = document.getElementById('projectPreviewGrid');
  if (!grid || typeof PROJECTS === 'undefined') return;
  const preview = PROJECTS.slice(0, 3);
  grid.innerHTML = preview.map(projectCardHTML).join('');
}

/* projects.html: full grid with category filtering */
function initProjectsPage(){
  const grid = document.getElementById('projectGrid');
  const filterBar = document.getElementById('filterBar');
  const countEl = document.getElementById('projectCount');
  if (!grid || typeof PROJECTS === 'undefined') return;

  grid.innerHTML = PROJECTS.map(projectCardHTML).join('');

  const categories = ['All', ...new Set(PROJECTS.map(p => p.category))];
  if (filterBar){
    filterBar.innerHTML = categories.map((c, i) =>
      `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${c}">${c}</button>`
    ).join('');

    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      let visible = 0;
      grid.querySelectorAll('.project-card').forEach(card => {
        const match = filter === 'All' || card.dataset.category === filter;
        card.hidden = !match;
        if (match) visible++;
      });
      if (countEl) countEl.textContent = `Showing ${visible} of ${PROJECTS.length} projects`;
    });
  }
  if (countEl) countEl.textContent = `Showing ${PROJECTS.length} of ${PROJECTS.length} projects`;
}