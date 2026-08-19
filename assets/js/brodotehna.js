document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Mobile nav: Bootstrap's own Collapse component (data-bs-toggle on
   * the navbar-toggler) handles open/close - this just closes the
   * menu after a link is picked, which Bootstrap doesn't do on its own
   * for a manually-triggered collapse.
   */
  const navCollapseEl = document.querySelector('#bthNavMain');
  if (navCollapseEl && window.bootstrap) {
    const navCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false });
    navCollapseEl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navCollapseEl.classList.contains('show')) {
          navCollapse.hide();
        }
      });
    });
  }

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const toggleScrollTop = () => {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    };
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
    scrollTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Solutions page: sticky sidebar that tracks which solution card is
   * currently in view (scrollspy), on the Solutions page only.
   * IntersectionObserver with a thin horizontal band near mid-viewport
   * as the root margin - a card only counts as "current" once it
   * crosses that band, so nothing changes on tiny scroll jitter.
   */
  const solutionCards = document.querySelectorAll('.bth-solutions-card');
  if (solutionCards.length) {
    const tabs = document.querySelectorAll('.bth-solutions-tabs [data-target]');
    const nameEl = document.querySelector('.bth-solutions-sidebar__name');
    const titleEl = document.querySelector('.bth-solutions-sidebar__title');

    const setActive = (card) => {
      tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === card.id));
      if (nameEl) nameEl.textContent = card.dataset.short || '';
      if (titleEl) titleEl.textContent = card.dataset.title || '';
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    solutionCards.forEach(card => observer.observe(card));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = document.getElementById(tab.dataset.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Animation on scroll
   */
  function aosInit() {
    AOS.init({
      duration: 800,
      easing: 'slide',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

});
