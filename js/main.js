(() => {
  'use strict';

  /* ---------- Theme toggle (light / dark) ---------- */
  const STORAGE_KEY = 'asumpt-theme';
  const root = document.documentElement;
  const prefersLight = () => window.matchMedia('(prefers-color-scheme: light)').matches;
  const getStored = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  };
  const setStored = (val) => {
    try { localStorage.setItem(STORAGE_KEY, val); } catch (e) { /* private mode */ }
  };
  const applyTheme = (theme) => {
    if (theme === 'light') root.dataset.theme = 'light';
    else root.removeAttribute('data-theme');
  };
  // initial sync (in case inline head script was missing)
  const initial = getStored() || (prefersLight() ? 'light' : 'dark');
  applyTheme(initial);

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setStored(next);
      btn.setAttribute('aria-pressed', String(next === 'light'));
    });
    btn.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
  });

  // Track system preference changes only when user hasn't explicitly chosen
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!getStored()) applyTheme(e.matches ? 'light' : 'dark');
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const body = document.body;

  const syncNavState = () => {
    const isOpen = body.classList.contains('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', String(isOpen));
    if (drawer) drawer.setAttribute('aria-hidden', String(!isOpen));
  };
  const closeNav = () => {
    body.classList.remove('nav-open');
    syncNavState();
  };
  const openNav = () => {
    body.classList.add('nav-open');
    syncNavState();
  };

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      if (body.classList.contains('nav-open')) closeNav();
      else openNav();
    });
  }
  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) closeNav();
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  }
  syncNavState();
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Age confirmation overlay ---------- */
  const ageGate = document.querySelector('[data-age-gate]');
  const ageConfirm = document.querySelector('[data-age-confirm]');
  const AGE_KEY = 'asumpt-age-confirmed';

  if (ageGate && ageConfirm) {
    const confirmed = (() => {
      try { return localStorage.getItem(AGE_KEY) === 'yes'; } catch (e) { return false; }
    })();
    const closeAgeGate = () => {
      ageGate.classList.add('is-hidden');
      body.classList.remove('age-gate-open');
      ageGate.setAttribute('aria-hidden', 'true');
    };

    if (confirmed) {
      closeAgeGate();
    } else {
      body.classList.add('age-gate-open');
      ageConfirm.focus({ preventScroll: true });
    }

    ageConfirm.addEventListener('click', () => {
      try { localStorage.setItem(AGE_KEY, 'yes'); } catch (e) { /* private mode */ }
      closeAgeGate();
    });
  }

  /* ---------- IntersectionObserver scroll-reveal ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (!reduceMotion && 'IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Back to top ---------- */
  const backTop = document.querySelector('.back-to-top');
  if (backTop) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          backTop.classList.toggle('visible', window.scrollY > 480);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Highlight current nav link ---------- */
  const path = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
  document.querySelectorAll('.site-nav a, .mobile-drawer a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href && href === path) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ---------- GA4: zdarzenia klik_telefon i klik_trasa (dodane 02.07.2026) ---------- */
(() => {
  'use strict';
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link || typeof window.gtag !== 'function') return;
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href.startsWith('tel:')) {
      window.gtag('event', 'klik_telefon', {
        strona: location.pathname,
        numer: href.replace('tel:', '')
      });
    } else if (href.includes('google.com/maps')) {
      window.gtag('event', 'klik_trasa', {
        strona: location.pathname
      });
    }
  });
})();
