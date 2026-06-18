(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });

    window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  var homeSearch = document.querySelector('[data-home-search]');

  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var url = value ? 'all-movies.html?q=' + encodeURIComponent(value) : 'all-movies.html';
      window.location.href = url;
    });
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-search-input]');
    var yearFilter = filterPanel.querySelector('[data-year-filter]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value.trim() : '');
      var year = yearFilter ? yearFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.dataset.year === year;
        var matchesType = !type || card.dataset.type === type;
        card.classList.toggle('hidden', !(matchesQuery && matchesYear && matchesType));
      });
    }

    ['input', 'change'].forEach(function (eventName) {
      if (searchInput) {
        searchInput.addEventListener(eventName, applyFilters);
      }
      if (yearFilter) {
        yearFilter.addEventListener(eventName, applyFilters);
      }
      if (typeFilter) {
        typeFilter.addEventListener(eventName, applyFilters);
      }
    });

    applyFilters();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-movie-video]');
    var button = document.querySelector('[data-play-button]');
    var shell = document.querySelector('[data-player]');
    var message = document.querySelector('[data-player-message]');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function setup() {
      if (loaded) {
        return;
      }
      loaded = true;
      video.controls = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && message) {
            message.textContent = '暂时无法播放，请稍后再试';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (message) {
        message.textContent = '暂时无法播放，请稍后再试';
      }
    }

    function start() {
      setup();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
