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
   * Brand accent: every letter B/b in the page's visible text (every
   * page, site-wide) gets wrapped and colored #54d4ff - the same
   * color already used for the hand-picked "B" accents on the
   * homepage (Brodotehna/Built/Battery/Build). A TreeWalker over text
   * nodes is the only way to do this for every occurrence rather than
   * just the few spots someone manually wrapped a letter in a span -
   * it only ever touches actual rendered text nodes, so element
   * attributes (alt, placeholder, href, input values) are untouched
   * by construction, not by an explicit exclusion.
   */
  function colorAccentLetters() {
    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'TITLE', 'SVG']);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/[bB]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const targets = [];
    let node;
    while ((node = walker.nextNode())) targets.push(node);

    targets.forEach((textNode) => {
      const parts = textNode.nodeValue.split(/([bB])/);
      // Everything goes inside ONE wrapper span (not a DocumentFragment
      // of loose sibling nodes) - a flex/grid parent with `gap` (e.g.
      // .bth-icon-list li) applies that gap between every direct child
      // it sees, including each fragment of a split text node. Swapping
      // one text node for 3+ sibling nodes turned 1 gap (icon-to-text)
      // into several (also between "Utility Su"/the B span/"stations"),
      // visibly prying the letter away from the rest of the word. A
      // single wrapper keeps the parent's child count - and its gaps -
      // exactly as they were. It gets .bth-accent-run so brodotehna.css
      // can force it (and every .bth-accent-b letter span) back to a
      // neutral inline box - a bare, class-less <span> can still be
      // caught by a page rule that targets plain `span` inside some
      // component (e.g. .bth-reference-card__meta span, styled as a
      // padded/backgrounded inline-flex tag-pill for its OWN spans).
      // That doesn't just re-introduce the flex-gap bug one level
      // deeper (on the wrapper) - the padding+background land on the
      // single-letter .bth-accent-b span too, since it's a `span`
      // descendant of the same component just the same, visually
      // padding the "B" like its own little pill. Both classes are
      // reset with !important in CSS rather than JS inline styles, so
      // the fix stays declarative and covers properties beyond
      // display (padding/background/border/gap/etc.) in one place.
      const wrapper = document.createElement('span');
      wrapper.className = 'bth-accent-run';
      parts.forEach((part) => {
        if (part === 'b' || part === 'B') {
          const span = document.createElement('span');
          span.className = 'bth-accent-b';
          span.textContent = part;
          wrapper.appendChild(span);
        } else if (part) {
          wrapper.appendChild(document.createTextNode(part));
        }
      });
      textNode.parentNode.replaceChild(wrapper, textNode);
    });
  }
  colorAccentLetters();

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
   * Company page: timeline connecting line - the track between the
   * three Who We Are/What We Do/Our Approach rows fills in as you
   * scroll (like a vertical progress rail). Each row's dot lights up
   * once the fill has grown past its own position and then STAYS lit
   * (it's a "reached" marker, not a "currently in view" one) - driven
   * directly off the fill's own pixel height rather than a separate
   * IntersectionObserver, so the two can never disagree with each
   * other.
   */
  const timelineList = document.querySelector('.bth-company-timeline__list');
  if (timelineList) {
    const fillEl = timelineList.querySelector('.bth-company-timeline__fill');
    const dots = timelineList.querySelectorAll('.bth-company-timeline__dot');

    const updateFill = () => {
      if (!fillEl) return;
      const listRect = timelineList.getBoundingClientRect();
      const progress = Math.min(Math.max((window.innerHeight / 2 - listRect.top) / listRect.height, 0), 1);
      const fillPx = progress * listRect.height;
      fillEl.style.height = `${progress * 100}%`;

      dots.forEach(dot => {
        const dotOffset = dot.getBoundingClientRect().top - listRect.top;
        dot.classList.toggle('active', dotOffset <= fillPx);
      });
    };

    updateFill();
    window.addEventListener('scroll', updateFill, { passive: true });
    window.addEventListener('resize', updateFill);
  }

  /**
   * Company page timeline stats (2013 / 60 / 42+) and Homepage's own
   * stats strip (same 3 numbers, standalone instead of overlaid on
   * photos) count up from zero the first time they scroll into view,
   * instead of just appearing as static text.
   */
  const timelineCounters = document.querySelectorAll('.bth-company-timeline__stat strong[data-count-to], .bth-home-stats strong[data-count-to]');
  if (timelineCounters.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.countTo, 10);
      const suffix = el.dataset.countSuffix || '';
      const duration = 1200;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    timelineCounters.forEach(el => {
      el.textContent = `0${el.dataset.countSuffix || ''}`;
      counterObserver.observe(el);
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
   * Open Application page: "What to expect" card row - same scrollBy-
   * on-click idea as the Services page's tab strip, just scoped to a
   * plain card row instead of a tab list (no active-tab state to
   * track here).
   */
  const expectRow = document.querySelector('.bth-careers-expect__row');
  if (expectRow) {
    const firstCard = expectRow.querySelector('.bth-careers-expect__card');
    document.querySelectorAll('.bth-careers-expect__nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = (firstCard?.offsetWidth ?? 300) + 20;
        const direction = btn.classList.contains('bth-careers-expect__nav-btn--prev') ? -1 : 1;
        expectRow.scrollBy({ left: step * direction, behavior: 'smooth' });
      });
    });
  }

  /**
   * Homepage: Selected References carousel - unlike every other
   * carousel on the site (free horizontal scroll), this one has a
   * real "1/5" page counter in the design, so prev/next step through
   * discrete pages (2 cards each) via [hidden] instead of scrollBy.
   * Wraps around at both ends rather than disabling the buttons.
   */
  const referencesPages = document.querySelectorAll('.bth-home-references__page');
  if (referencesPages.length) {
    const counterCurrent = document.querySelector('.bth-home-references__counter-current');
    let currentPage = 0;

    const showPage = (index) => {
      referencesPages[currentPage].hidden = true;
      currentPage = (index + referencesPages.length) % referencesPages.length;
      referencesPages[currentPage].hidden = false;
      if (counterCurrent) counterCurrent.textContent = currentPage + 1;
    };

    document.querySelectorAll('.bth-home-references__nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const direction = btn.classList.contains('bth-home-references__nav-btn--prev') ? -1 : 1;
        showPage(currentPage + direction);
      });
    });
  }

  /**
   * Open Application page: file upload field shows the chosen file's
   * name in place of its placeholder text once one is picked.
   */
  const uploadInput = document.getElementById('cf-documents');
  if (uploadInput) {
    const uploadLabel = uploadInput.closest('.bth-contact-form__upload');
    const uploadText = uploadLabel?.querySelector('span');
    const defaultText = uploadText?.textContent ?? '';

    uploadInput.addEventListener('change', () => {
      if (uploadText) {
        uploadText.textContent = uploadInput.files?.[0]?.name || defaultText;
      }
    });
  }

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
        setStatus('Confirm security check.');
        return;
      }

      // position/documentName only exist on the Open Application form -
      // optional chaining keeps this the same handler for contact.html's
      // plain inquiry form, where they're just absent from the payload.
      const documentFile = document.getElementById('cf-documents')?.files?.[0];

      const payload = {
        name: document.getElementById('cf-name')?.value ?? '',
        phone: document.getElementById('cf-phone')?.value ?? '',
        message: document.getElementById('cf-message')?.value ?? '',
        email: document.getElementById('cf-email')?.value ?? '',
        website: document.getElementById('cf-website')?.value ?? '',
        consent: document.getElementById('cf-consent')?.checked ?? false,
        turnstileToken: token
      };

      const position = document.getElementById('cf-position')?.value;
      if (position) payload.position = position;

      // The actual file's bytes aren't sent here - JSON.stringify can't
      // carry a File, and switching this endpoint to multipart/form-data
      // is a backend contract change outside this form's scope. The
      // filename travels as a signal so a reviewer at least knows a CV
      // was attached; wiring the real upload needs backend support.
      if (documentFile) payload.documentName = documentFile.name;

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
