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
   * Services page: horizontal tab switcher. Clicking a tab (or the
   * prev/next circular buttons flanking the image) shows the matching
   * panel and hides the rest. Simple click-driven show/hide - no
   * scroll-tracking needed here, unlike the Solutions page's sidebar.
   */
  const servicesTabs = document.querySelectorAll('.bth-services-tabs button');
  const servicesPanels = document.querySelectorAll('.bth-services-panel');
  if (servicesTabs.length && servicesPanels.length) {
    const activate = (panelId) => {
      servicesTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.panel === panelId));
      servicesPanels.forEach(panel => {
        const isActive = panel.dataset.panelId === panelId;
        panel.hidden = !isActive;
      });
      const activeTab = document.querySelector(`.bth-services-tabs button[data-panel="${panelId}"]`);
      if (activeTab && activeTab.scrollIntoView) {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    };

    servicesTabs.forEach(tab => {
      tab.addEventListener('click', () => activate(tab.dataset.panel));
    });

    document.querySelectorAll('.bth-services-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabsArray = Array.from(servicesTabs);
        const currentIndex = tabsArray.findIndex(tab => tab.classList.contains('active'));
        const direction = btn.classList.contains('bth-services-nav-btn--prev') ? -1 : 1;
        const nextIndex = (currentIndex + direction + tabsArray.length) % tabsArray.length;
        activate(tabsArray[nextIndex].dataset.panel);
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
