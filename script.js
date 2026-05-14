// Theme toggle
const themeToggleBtn = document.getElementById('themeToggleBtn');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

function setTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    iconSun.style.display = 'block';
    iconMoon.style.display = 'none';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'block';
    localStorage.setItem('theme', 'light');
  }
}

// Initialize theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || !savedTheme) {
  setTheme(true);
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

// Page switching
function showPage(id, linkEl) {
  document.body.setAttribute('data-page', id);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.topbar-nav a').forEach(a => a.classList.remove('active'));
  if (linkEl) {
    linkEl.classList.add('active');
  } else {
    // find matching nav link
    document.querySelectorAll('.topbar-nav a').forEach(a => {
      if (a.textContent.toLowerCase().includes(id === 'home' ? 'home' : id)) a.classList.add('active');
    });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize page
showPage('home', null);
loadDynamicContent();

async function loadDynamicContent() {
  await Promise.all([
    loadSection('publications', 'publications.json'),
    loadSection('projects', 'projects.json')
  ]);
}

async function loadSection(id, jsonFile) {
  const container = document.getElementById(`${id}-container`);
  if (!container) return;

  try {
    const response = await fetch(jsonFile);
    const data = await response.json();
    
    container.innerHTML = data.map(section => `
      <p class="section-label">${section.category}</p>
      ${section.items
        .sort((a, b) => (a.index || 999) - (b.index || 999))
        .map(item => {
          const images = Array.isArray(item.image) ? item.image : (item.image ? [item.image] : []);
          const hasImages = images.length > 0;
          return `
        <div class="item-card ${!hasImages ? 'no-image' : ''}">
          ${hasImages ? `<div class="item-img-wrap ${images.length > 1 ? 'carousel' : ''}">
            ${images.map((src, i) => `<img src="${src}" alt="${item.title}" class="${i === 0 ? 'active' : ''}" onerror="this.style.display='none'">`).join('')}
          </div>` : ''}
          <div class="item-content">
            <p class="item-title">${item.title}</p>
            ${item.authors ? `<p class="pub-authors">${item.authors.replace('Prabhjot Singh', '<strong>Prabhjot Singh</strong>')}</p>` : ''}
            ${item.venue ? `<p class="pub-venue"><strong>${item.venue}</strong></p>` : ''}
            <div class="pub-tags">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            <div class="action-pills">
              ${renderLinks(item.links)}
            </div>
            <p class="item-desc">${item.description}</p>
          </div>
        </div>
      `;
        }).join('')}
    `).join('');
  } catch (error) {
    console.error(`Error loading ${id}:`, error);
  }
}

function renderLinks(links) {
  if (!links) return '';
  const icons = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    arxiv: '<img src="Images/arxiv_logo.png" alt="arXiv logo" style="height: 1em; vertical-align: middle;">',
    openreview: '📄',
    huggingface: '🤗',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  };

  const labels = {
    github: 'GitHub',
    arxiv: 'arXiv',
    openreview: 'OpenReview',
    huggingface: 'HuggingFace',
    website: 'Website'
  };

  return Object.entries(links)
    .filter(([key, url]) => url && url !== '#')
    .map(([key, url]) => `
      <a href="${url}" class="action-pill" target="_blank" rel="noopener">
        ${icons[key] || ''} ${labels[key] || key}
      </a>
    `).join('');
}

// Mobile drawer
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobOverlay   = document.getElementById('mobOverlay');
const mobDrawer    = document.getElementById('mobDrawer');
const mobileSocialDrawer = document.getElementById('mobileSocialDrawer');
const mobileContactBtn = document.getElementById('mobileContactTriggerBtn');

function closeDrawer() { 
  mobDrawer.classList.remove('open'); 
  if(mobileSocialDrawer) mobileSocialDrawer.classList.remove('open');
  mobOverlay.classList.remove('open'); 
}

hamburgerBtn.addEventListener('click', () => { 
  mobDrawer.classList.add('open'); 
  mobOverlay.classList.add('open'); 
});

if (mobileContactBtn) {
  mobileContactBtn.addEventListener('click', () => {
    mobileSocialDrawer.classList.add('open');
    mobOverlay.classList.add('open');
  });
}

mobOverlay.addEventListener('click', closeDrawer);

// Image Carousel Logic
setInterval(() => {
  document.querySelectorAll('.item-img-wrap.carousel').forEach(carousel => {
    const images = Array.from(carousel.querySelectorAll('img'));
    if (images.length > 1) {
      const activeIndex = images.findIndex(img => img.classList.contains('active'));
      const nextIndex = (activeIndex + 1) % images.length;
      if (activeIndex >= 0) images[activeIndex].classList.remove('active');
      images[nextIndex].classList.add('active');
    }
  });
}, 3000);