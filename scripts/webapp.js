// Dark mode — runs synchronously before first paint to prevent FOUC
(function () {
  try { if (localStorage.getItem('pm-dark') === '1') document.documentElement.classList.add('dark'); } catch(e) {}

  document.addEventListener('DOMContentLoaded', function () {
    function syncDmBtns() {
      var isDark = document.documentElement.classList.contains('dark');
      document.querySelectorAll('.dm-btn').forEach(function (btn) {
        if (btn.classList.contains('mnav-dm')) {
          btn.textContent = isDark ? '☀ Light Mode' : '◐ Dark Mode';
        } else {
          btn.textContent = isDark ? '☀' : '◐';
        }
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      });
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('.dm-btn')) {
        var isDark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem('pm-dark', isDark ? '1' : '0'); } catch(e) {}
        syncDmBtns();
      }
    });
    syncDmBtns();
  });
}());

(function () {
  var standalone = window.navigator.standalone
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches;

  if (standalone) {
    document.documentElement.classList.add('is-webapp');
  }

  // On iOS PWA, <a href> taps open a new Safari window with address bar.
  // Intercept and navigate in-place to stay inside the web app shell.
  if (window.navigator.standalone) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href
        || href.charAt(0) === '#'
        || a.target === '_blank'
        || href.startsWith('mailto:')
        || href.startsWith('tel:')
        || href.startsWith('javascript:')) return;
      e.preventDefault();
      window.location.href = a.href;
    });
  }
}());
