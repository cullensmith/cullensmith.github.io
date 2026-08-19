'use strict';

/* ─── Carousel ───────────────────────────────────────────── */
class Carousel {
  constructor(el) {
    this.el         = el;
    this.viewport   = el.querySelector('.carousel-viewport');
    this.track      = el.querySelector('.carousel-track');
    this.slides     = [...el.querySelectorAll('.carousel-slide')];
    this.prevBtn    = el.querySelector('.carousel-btn-prev');
    this.nextBtn    = el.querySelector('.carousel-btn-next');
    this.dots       = [...el.closest('.section-inner').querySelectorAll('.carousel-dot')];
    this.current    = 0;
    this.total      = this.slides.length;
    this.GAP        = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-slide')) || 28;
    this.dragging   = false;
    this.dragStartX = 0;

    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.goTo(i)));

    // Keyboard nav
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.prev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    });

    // Touch/drag swipe
    this.viewport.addEventListener('touchstart', e => {
      this.dragStartX = e.touches[0].clientX;
    }, { passive: true });

    this.viewport.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - this.dragStartX;
      if (Math.abs(dx) > 48) dx < 0 ? this.next() : this.prev();
    }, { passive: true });

    // Recalculate on resize
    const ro = new ResizeObserver(() => this.update(false));
    ro.observe(this.viewport);

    this.update(false);
  }

  slideWidth() {
    return this.slides[0]?.offsetWidth ?? this.viewport.offsetWidth * 0.68;
  }

  goTo(index) {
    this.current = Math.max(0, Math.min(index, this.total - 1));
    this.update(true);
  }

  prev() { this.goTo(this.current - 1); }
  next() { this.goTo(this.current + 1); }

  update(animate) {
    const vw      = this.viewport.offsetWidth;
    const sw      = this.slideWidth();
    const peek    = (vw - sw) / 2;
    const offset  = peek - this.current * (sw + this.GAP);

    this.track.style.transition = animate
      ? `transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      : 'none';
    this.track.style.transform = `translateX(${offset}px)`;

    this.slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === this.current);
      s.setAttribute('aria-hidden', String(i !== this.current));
    });

    this.dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === this.current);
      d.setAttribute('aria-selected', String(i === this.current));
    });

    this.prevBtn.disabled = this.current === 0;
    this.nextBtn.disabled = this.current === this.total - 1;
  }
}

/* ─── Theme toggle ───────────────────────────────────────── */
function initThemeToggle() {
  const btn  = document.querySelector('.theme-toggle');
  const root = document.documentElement;

  // Apply saved preference before first paint
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const isDark =
      root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    const next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/* ─── More Info modal ────────────────────────────────────── */
function initModal() {
  const overlay  = document.getElementById('modal-overlay');
  const titleEl  = document.getElementById('modal-title');
  const detailEl = document.getElementById('modal-detail');
  const closeBtn = overlay.querySelector('.modal-close');
  let lastFocused = null;

  // Inject button into every slide-media
  document.querySelectorAll('.carousel-slide').forEach(slide => {
    const media = slide.querySelector('.slide-media');
    if (!media) return;
    if (slide.closest('#maps-models')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-info-btn';
    btn.textContent = 'More Info...';
    btn.setAttribute('aria-haspopup', 'dialog');

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const title       = slide.querySelector('.slide-title')?.textContent ?? '';
      const modalDiv    = slide.querySelector('.slide-modal');
      // .slide-modal hidden div takes priority; fall back to caption text
      const detailHTML  = modalDiv
        ? modalDiv.innerHTML
        : `<p>${slide.querySelector('.slide-desc')?.textContent ?? ''}</p>`;
      openModal(title, detailHTML, btn);
    });

    media.appendChild(btn);
  });

  function openModal(title, detailHTML, trigger) {
    lastFocused       = trigger;
    titleEl.textContent = title;
    detailEl.innerHTML  = detailHTML;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeBtn.focus());
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus();
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
}

/* ─── Section nav (up/down) ──────────────────────────────── */
function initSectionNav() {
  const sections = [...document.querySelectorAll('section[id]')];
  const upBtn    = document.getElementById('section-nav-up');
  const downBtn  = document.getElementById('section-nav-down');
  let current    = 0;

  function update(index) {
    current          = index;
    upBtn.disabled   = index === 0;
    downBtn.disabled = index === sections.length - 1;
  }

  // Find the nearest section in a direction from the current scroll position.
  // This ensures a partially-visible section is settled on before moving past it.
  function nearestSection(direction) {
    const h   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
    const y   = window.scrollY;
    const thr = 8; // px tolerance so exact-snap position still advances
    if (direction === 'down') {
      return sections.find(s => s.offsetTop - h > y + thr) ?? null;
    }
    return [...sections].reverse().find(s => s.offsetTop - h < y - thr) ?? null;
  }

  upBtn.addEventListener('click', () => {
    nearestSection('up')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  downBtn.addEventListener('click', () => {
    nearestSection('down')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = sections.indexOf(entry.target);
      if (i !== -1) update(i);
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
  update(0);
}

/* ─── Active nav via IntersectionObserver ────────────────── */
function initNav() {
  const sections  = [...document.querySelectorAll('section[id]')];
  const navLinks  = [...document.querySelectorAll('.nav-link')];

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll with offset for fixed header
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  document.querySelectorAll('[data-carousel]').forEach(el => new Carousel(el));
  initModal();
  initSectionNav();
  initNav();
});
