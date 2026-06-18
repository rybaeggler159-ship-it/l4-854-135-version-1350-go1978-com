(function () {
  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    show(0);
    play();
  });

  var searchForms = document.querySelectorAll('.global-search-form');

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || './search.html';
      window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
    });
  });

  function applyFilter(input) {
    var root = input.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var keyword = input.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var visible = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !visible);
    });
  }

  var filters = document.querySelectorAll('.movie-filter');

  filters.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input.id === 'search-input') {
      input.value = q;
      applyFilter(input);
    }
  });

  var chipButtons = document.querySelectorAll('[data-filter-chip]');

  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var root = button.closest('main') || document;
      var input = root.querySelector('.movie-filter');

      if (input) {
        input.value = button.getAttribute('data-filter-chip') || '';
        applyFilter(input);
        input.focus();
      }
    });
  });

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var source = video ? video.querySelector('source') : null;
    var button = player.querySelector('.player-start');
    var hls = null;
    var started = false;

    function start() {
      if (!video || !source || started) {
        return;
      }

      started = true;
      player.classList.add('is-playing');
      video.controls = true;

      var streamUrl = source.getAttribute('src');
      var nativeType = 'application/vnd.apple.mpegurl';

      if (video.canPlayType(nativeType)) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = streamUrl;
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', start);
    }

    player.addEventListener('click', function (event) {
      if (!started && (event.target === player || event.target === video)) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
