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

    /**
     * The slide/fade transition is driven by .bth-nav-open, not
     * Bootstrap's own .show - Bootstrap only adds .show once its
     * internal .collapsing phase finishes, so an animation gated on
     * .show doesn't start until that (separately-timed) phase is over.
     * show.bs.collapse/hide.bs.collapse fire synchronously the instant
     * open/close begins, so toggling the class here starts the visual
     * transition immediately instead of waiting on Bootstrap's timing.
     */
    navCollapseEl.addEventListener('show.bs.collapse', () => {
      navCollapseEl.classList.add('bth-nav-open');
    });
    navCollapseEl.addEventListener('hide.bs.collapse', () => {
      navCollapseEl.classList.remove('bth-nav-open');
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
      // Slides the active tab into view within the horizontally-
      // scrollable tab strip on mobile - scoped to that strip's own
      // scrollLeft, not scrollIntoView, which scrolls the whole PAGE
      // (both axes) to bring an element into view. With the prev/next
      // buttons now sitting near the bottom of the panel on mobile
      // (below the image), scrollIntoView on a tab back up near the
      // top of the page yanked the viewport back up to it every time
      // - exactly what a reader clicking "next" while scrolled down
      // doesn't want.
      const activeTab = document.querySelector(`.bth-services-tabs button[data-panel="${panelId}"]`);
      const tabsRow = activeTab && activeTab.closest('.bth-services-tabs-row');
      if (tabsRow) {
        const rowRect = tabsRow.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const delta = (tabRect.left + tabRect.width / 2) - (rowRect.left + rowRect.width / 2);
        tabsRow.scrollBy({ left: delta, behavior: 'smooth' });
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


 /**
   * Contact form
   */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const status = document.getElementById('contact-form-status');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) {
        return;
      }

      const tokenInput = contactForm.querySelector(
        'input[name="cf-turnstile-response"]'
      );

      const token = tokenInput?.value ?? '';

      if (!token) {
        setStatus('Potvrdite sigurnosnu provjeru.');
        return;
      }

      const payload = {
        name: document.getElementById('cf-name')?.value ?? '',
        phone: document.getElementById('cf-phone')?.value ?? '',
        message: document.getElementById('cf-message')?.value ?? '',
        email: document.getElementById('cf-email')?.value ?? '',
        website: document.getElementById('cf-website')?.value ?? '',
        consent: document.getElementById('cf-consent')?.checked ?? false,
        turnstileToken: token
      };

      submitButton.disabled = true;
      setStatus('Sending...');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message || 'Sending message failed.'
          );
        }

        contactForm.reset();

        if (window.turnstile) {
          window.turnstile.reset();
        }

        setStatus(result?.message || 'Message sent successfully.');
      }
      catch (error) {
        console.error('Contact form error:', error);

        setStatus(
          error?.message || 'Sending message failed.'
        );

        if (window.turnstile) {
          window.turnstile.reset();
        }
      }
      finally {
        submitButton.disabled = false;
      }
    });

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }
  }
});
