/* ============================================================
   script.js – Dr. Akash Mahore Website Interactivity
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar: scroll effect + active link highlighting ---- */
  var navbar = document.getElementById('navbar');
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section highlight
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');
      navLinks.forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
          if (scrollPos >= top && scrollPos < bottom) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load

  /* ---- Smooth scroll for all anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });

      // Close hamburger menu if open
      closeMenu();
    });
  });

  /* ---- Hamburger Menu ---- */
  var hamburger = document.getElementById('hamburger');
  var navLinksEl = document.getElementById('navLinks');

  function closeMenu() {
    if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
    if (navLinksEl) { navLinksEl.classList.remove('open'); }
  }

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinksEl.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking outside nav
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) { closeMenu(); }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeMenu(); }
    });
  }

  /* ---- Scroll-reveal animations ---- */
  function setupReveal() {
    var revealEls = [];

    // About
    var aboutVisual = document.querySelector('.about-visual');
    var aboutContent = document.querySelector('.about-content');
    if (aboutVisual) { aboutVisual.classList.add('reveal-left'); revealEls.push(aboutVisual); }
    if (aboutContent) { aboutContent.classList.add('reveal-right'); revealEls.push(aboutContent); }

    // Section headers
    document.querySelectorAll('.section-header').forEach(function (el) {
      el.classList.add('reveal');
      revealEls.push(el);
    });

    // Service cards (staggered)
    var servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
      servicesGrid.classList.add('reveal-stagger');
      document.querySelectorAll('.service-card').forEach(function (el) {
        el.classList.add('reveal');
        revealEls.push(el);
      });
    }

    // Why cards (staggered)
    var whyGrid = document.querySelector('.why-grid');
    if (whyGrid) {
      whyGrid.classList.add('reveal-stagger');
      document.querySelectorAll('.why-card').forEach(function (el) {
        el.classList.add('reveal');
        revealEls.push(el);
      });
    }

    // Contact grid children
    document.querySelectorAll('.contact-card').forEach(function (el) {
      el.classList.add('reveal');
      revealEls.push(el);
    });

    var contactMap = document.querySelector('.contact-map');
    if (contactMap) { contactMap.classList.add('reveal-right'); revealEls.push(contactMap); }

    var contactInfo = document.querySelector('.contact-info');
    if (contactInfo) { contactInfo.classList.add('reveal-left'); revealEls.push(contactInfo); }

    // Hero stats
    var heroStats = document.querySelector('.hero-stats');
    if (heroStats) { heroStats.classList.add('reveal'); revealEls.push(heroStats); }

    return revealEls;
  }

  var revealEls = setupReveal();

  function checkReveal() {
    var windowBottom = window.scrollY + window.innerHeight;
    revealEls.forEach(function (el) {
      if (el.classList.contains('visible')) return;
      var elTop = el.getBoundingClientRect().top + window.scrollY;
      if (windowBottom > elTop + 60) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkReveal, { passive: true });
  checkReveal(); // Check on load

  /* ---- 3D card tilt effect on service cards ---- */
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rotateX = ((y - cy) / cy) * -8;
      var rotateY = ((x - cx) / cx) * 8;
      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-10px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---- Hero stats number counter ---- */
  function animateCounter(el, target, suffix) {
    var start = 0;
    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var val = Math.floor(progress * target);
      el.textContent = val + suffix;
      if (progress < 1) { requestAnimationFrame(step); }
      else { el.textContent = target + suffix; }
    }
    requestAnimationFrame(step);
  }

  var statsObserver;
  var statsAnimated = false;

  function observeStats() {
    var heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    if ('IntersectionObserver' in window) {
      statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            var numbers = document.querySelectorAll('.stat-number');
            var targets = [500, 1000, 5];
            var suffixes = ['+', '+', '+'];
            numbers.forEach(function (el, i) {
              animateCounter(el, targets[i], suffixes[i]);
            });
            statsObserver.disconnect();
          }
        });
      }, { threshold: 0.5 });
      statsObserver.observe(heroStats);
    }
  }

  observeStats();

  /* ---- Parallax on hero background ---- */
  window.addEventListener('scroll', function () {
    var heroCanvas = document.getElementById('heroCanvas');
    if (!heroCanvas) return;
    var scrolled = window.scrollY;
    heroCanvas.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
  }, { passive: true });

})();
