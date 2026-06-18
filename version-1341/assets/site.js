(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    forms.forEach(function (form) {
      var scope = form.closest("main") || document;
      var input = form.querySelector("[data-filter-input]");
      var select = form.querySelector("[data-filter-type]");
      var list = scope.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var type = normalize(select ? select.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.dataset.category
          ].join(" "));
          var matchesQuery = query === "" || haystack.indexOf(query) !== -1;
          var matchesType = type === "" || haystack.indexOf(type) !== -1;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesType));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function initPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      var source = video.dataset.source;
      var hls = null;
      var initialized = false;

      function bindSource() {
        if (initialized || !source) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          return;
        }
        video.src = source;
      }

      function playVideo() {
        bindSource();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        bindSource();
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
