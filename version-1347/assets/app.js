(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initGlobalSearch() {
    $all('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('input', form);
        var keyword = input ? input.value.trim() : '';
        if (keyword) {
          window.location.href = './catalog.html?q=' + encodeURIComponent(keyword);
        } else {
          window.location.href = './catalog.html';
        }
      });
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var grid = $('[data-filter-grid]');
    var panel = $('[data-filter-panel]');
    if (!grid || !panel) {
      return;
    }
    var cards = $all('[data-movie-card]', grid);
    var input = $('[data-filter-input]', panel);
    var year = $('[data-filter-year]', panel);
    var genre = $('[data-filter-genre]', panel);
    var counter = $('[data-visible-count]');
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function match(card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var yearValue = card.getAttribute('data-year') || '';
      var genreValue = card.getAttribute('data-genre') || '';
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedGenre = genre ? genre.value : '';
      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedYear && selectedYear !== yearValue) {
        return false;
      }
      if (selectedGenre && genreValue.indexOf(selectedGenre) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.classList.toggle('is-hidden-by-filter', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (counter) {
        counter.textContent = visible + ' 部作品';
      }
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movieVideo');
    var cover = document.getElementById('playerCover');
    if (!video || !cover || !source) {
      return;
    }
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      cover.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      cover.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
    load();
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initGlobalSearch();
    initHero();
    initFilters();
  });
})();
