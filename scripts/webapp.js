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
