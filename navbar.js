// Park My Spot - Accessible Responsive Navbar Script
(function() {
  function getNavbarElements() {
    var btn = document.getElementById('navToggle') || document.querySelector('.nav-toggle');
    var menu = document.getElementById('navMenu') || document.querySelector('.head2 ul');
    return { btn: btn, menu: menu };
  }

  window.toggleNavMenu = function() {
    var els = getNavbarElements();
    if (!els.menu || !els.btn) return;
    var isOpen = els.menu.classList.toggle('active');
    els.menu.classList.toggle('nav-open', isOpen);
    els.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    els.btn.classList.toggle('active', isOpen);
  };

  function initNavbar() {
    var els = getNavbarElements();
    var btn = els.btn;
    var menu = els.menu;

    if (btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.toggleNavMenu();
      });
    }

    // Close when clicking any navigation link
    if (menu) {
      var links = menu.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', function() {
          if (menu.classList.contains('active') || menu.classList.contains('nav-open')) {
            menu.classList.remove('active');
            menu.classList.remove('nav-open');
            if (btn) {
              btn.setAttribute('aria-expanded', 'false');
              btn.classList.remove('active');
            }
          }
        });
      }
    }

    // Close when clicking outside the menu and toggle button
    document.addEventListener('click', function(e) {
      var currentEls = getNavbarElements();
      var m = currentEls.menu;
      var b = currentEls.btn;
      if (m && (m.classList.contains('active') || m.classList.contains('nav-open'))) {
        if (!m.contains(e.target) && (!b || !b.contains(e.target))) {
          m.classList.remove('active');
          m.classList.remove('nav-open');
          if (b) {
            b.setAttribute('aria-expanded', 'false');
            b.classList.remove('active');
          }
        }
      }
    });

    // Close when pressing the Escape key
    document.addEventListener('keydown', function(e) {
      var currentEls = getNavbarElements();
      var m = currentEls.menu;
      var b = currentEls.btn;
      if (e.key === 'Escape' && m && (m.classList.contains('active') || m.classList.contains('nav-open'))) {
        m.classList.remove('active');
        m.classList.remove('nav-open');
        if (b) {
          b.setAttribute('aria-expanded', 'false');
          b.classList.remove('active');
          b.focus();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
