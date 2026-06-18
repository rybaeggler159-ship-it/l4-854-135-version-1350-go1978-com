(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    start();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      if (!input) return;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
      var empty = scope.querySelector('[data-empty]');
      function apply() {
        var q = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var ok = !q || text.indexOf(q) !== -1;
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (empty) empty.classList.toggle('is-visible', visible === 0);
      }
      input.addEventListener('input', apply);
      apply();
    });
  }

  function initPlayer() {
    var box = document.querySelector('[data-player]');
    var video = document.querySelector('#movie-player');
    if (!box || !video) return;
    var overlay = box.querySelector('[data-play]');
    var stream = video.getAttribute('data-stream') || '';
    var loaded = false;
    function playWhenReady() {
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
    }
    function load() {
      if (!stream) return;
      if (overlay) overlay.classList.add('is-hidden');
      if (loaded) {
        playWhenReady();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playWhenReady, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playWhenReady);
        return;
      }
      video.src = stream;
      video.addEventListener('loadedmetadata', playWhenReady, { once: true });
      video.load();
    }
    if (overlay) overlay.addEventListener('click', load);
    box.addEventListener('click', function (event) {
      if (!loaded && event.target !== video) load();
    });
  }

  ready(function () {
    initNav();
    initHero();
    initFilters();
    initPlayer();
  });
})();
