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

  let currentLang = localStorage.getItem('portfolio-lang') || 'fr';

  function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (I18N[lang][key]) el.placeholder = I18N[lang][key];
    });

    document.title = I18N[lang].meta_title;
    if (metaDesc) metaDesc.content = I18N[lang].meta_desc;

    langBtns.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

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
