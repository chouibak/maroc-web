(function () {
  'use strict';

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const contactForm = document.getElementById('contactForm');
  const yearEl = document.getElementById('year');
  const backTop = document.getElementById('backTop');
  const metaDesc = document.getElementById('metaDesc');
  const langBtns = document.querySelectorAll('.lang-btn');

  const SUPPORTED_LANGS = ['fr', 'en', 'ar'];
  const LANG_STORAGE_KEY = 'maroc-web-lang';
  const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
  let currentLang = SUPPORTED_LANGS.includes(storedLang) ? storedLang : 'fr';
  let activePortfolioFilter = 'all';

  const CAT_KEYS = {
    car_rental: 'work_cat_car_rental',
    restaurant: 'work_cat_restaurant',
    salon: 'work_cat_salon',
    clinic: 'work_cat_clinic',
    dentist: 'work_cat_dentist',
    hotel: 'work_cat_hotel',
    realestate: 'work_cat_realestate',
    other: 'work_cat_other',
  };

  function t(key) {
    return I18N[currentLang][key] || I18N.fr[key] || I18N.en[key] || '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initPortfolioFilters() {
    const container = document.getElementById('portfolioFilters');
    if (!container || container.dataset.bound === 'true') return;

    container.addEventListener('click', (event) => {
      const btn = event.target.closest('.portfolio-filter');
      if (!btn || !container.contains(btn)) return;
      activePortfolioFilter = btn.dataset.filter;
      renderPortfolioFilters();
      renderPortfolio();
    });

    container.dataset.bound = 'true';
  }

  function renderPortfolioFilters() {
    const container = document.getElementById('portfolioFilters');
    if (!container || typeof PORTFOLIO_FILTERS === 'undefined') return;

    container.innerHTML = PORTFOLIO_FILTERS.map((filter) => {
      const label = escapeHtml(t(`work_filter_${filter}`));
      const active = filter === activePortfolioFilter ? ' active' : '';
      const selected = filter === activePortfolioFilter ? 'true' : 'false';
      return `<button type="button" class="portfolio-filter${active}" data-filter="${filter}" role="tab" aria-selected="${selected}">${label}</button>`;
    }).join('');

    if (I18N[currentLang].work_filters_aria) {
      container.setAttribute('aria-label', I18N[currentLang].work_filters_aria);
    }
  }

  function updatePortfolioCardsI18n() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid || typeof PORTFOLIO === 'undefined') return false;

    const cards = grid.querySelectorAll('.project[data-id]');
    if (!cards.length) return false;

    cards.forEach((article) => {
      const project = PORTFOLIO.find((p) => p.id === article.dataset.id);
      if (!project) return;

      const prefix = project.i18n;
      const title = t(`work_${prefix}_title`);
      const desc = t(`work_${prefix}_desc`);
      const cat = t(CAT_KEYS[project.category] || 'work_cat_other');
      const visitLabel = t('work_visit');

      const catEl = article.querySelector('.project-cat');
      const titleEl = article.querySelector('.project-body h3');
      const descEl = article.querySelector('.project-body p');
      const linkEl = article.querySelector('.project-link');
      const iframe = article.querySelector('iframe');
      const overlay = article.querySelector('.project-preview-overlay');

      if (catEl) catEl.textContent = cat;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      if (linkEl) linkEl.textContent = visitLabel;
      if (iframe) iframe.title = title;
      if (overlay) overlay.setAttribute('aria-label', `${visitLabel} ${title}`);
    });

    return true;
  }

  function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid || typeof PORTFOLIO === 'undefined') return;

    const items = PORTFOLIO.filter(
      (p) => activePortfolioFilter === 'all' || p.category === activePortfolioFilter
    );

    grid.innerHTML = items.map((project) => {
      const prefix = project.i18n;
      const title = t(`work_${prefix}_title`);
      const desc = t(`work_${prefix}_desc`);
      const cat = t(CAT_KEYS[project.category] || 'work_cat_other');
      const safeTitle = escapeHtml(title);
      const safeDesc = escapeHtml(desc);
      const safeCat = escapeHtml(cat);
      const safeUrl = escapeHtml(project.url || '');
      const visitLabel = escapeHtml(t('work_visit'));
      const hasUrl = Boolean(project.url);
      const soonBadge = hasUrl ? '' : `<span class="project-soon">${escapeHtml(t('work_soon'))}</span>`;
      const visitLink = hasUrl
        ? `<a href="${safeUrl}" class="project-link" target="_blank" rel="noopener">${visitLabel}</a>`
        : '';

      const mediaInner = hasUrl
        ? `<div class="project-preview">
            <iframe src="${safeUrl}" title="${safeTitle}" loading="eager" tabindex="-1"></iframe>
            <a href="${safeUrl}" class="project-preview-overlay" target="_blank" rel="noopener" aria-label="${visitLabel} ${safeTitle}"></a>
          </div>`
        : `<img src="${escapeHtml(project.image || 'assets/project-1.png')}" alt="${safeTitle}" loading="lazy" />`;

      return `
        <article class="project reveal visible" data-id="${project.id}" data-category="${project.category}">
          <div class="project-img">
            ${mediaInner}
            ${soonBadge}
          </div>
          <div class="project-body">
            <span class="project-cat">${safeCat}</span>
            <h3>${safeTitle}</h3>
            <p>${safeDesc}</p>
            ${visitLink}
          </div>
        </article>
      `;
    }).join('');

    if (!items.length) {
      grid.innerHTML = `<p class="portfolio-empty">${escapeHtml(t('work_empty'))}</p>`;
    }
  }

  function restartMarqueeAnimations() {
    document.querySelectorAll('.marquee-track').forEach((track) => {
      const animation = getComputedStyle(track).animation;
      track.style.animation = 'none';
      void track.offsetHeight;
      track.style.animation = animation;
    });
  }

  function revealVisibleSections() {
    document.querySelectorAll('.businesses-section .reveal, #work .reveal').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
      }
    });
  }

  function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (I18N[lang][key]) el.placeholder = I18N[lang][key];
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.dataset.i18nAriaLabel;
      if (I18N[lang][key]) el.setAttribute('aria-label', I18N[lang][key]);
    });

    document.title = I18N[lang].meta_title;
    if (metaDesc) metaDesc.content = I18N[lang].meta_desc;

    langBtns.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });

    renderPortfolioFilters();
    if (!updatePortfolioCardsI18n()) {
      renderPortfolio();
    }

    restartMarqueeAnimations();
    revealVisibleSections();
  }

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  initPortfolioFilters();
  setLanguage(currentLang);

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const business = document.getElementById('business').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !message) {
        contactForm.reportValidity();
        return;
      }

      const t = I18N[currentLang];
      const text = [
        `${t.form_wa_hi} ${name}.`,
        business ? `${t.form_wa_business}: ${business}` : '',
        '',
        message,
      ]
        .filter(Boolean)
        .join('\n');

      const waLink = document.getElementById('whatsappLink');
      const base = waLink ? waLink.href.split('?')[0] : 'https://wa.me/212684172231';
      window.open(`${base}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
  }

  if (backTop) {
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
