(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one("[data-menu-toggle]");
    var menu = one("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = all(".hero-slide");
    var dots = all(".hero-dot");
    var prev = one("[data-hero-prev]");
    var next = one("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 6200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupFilters() {
    var inputs = all(".js-search");
    var selects = all(".js-kind-filter");
    var cards = all("[data-card]");
    var empty = one("[data-no-results]");
    if (!cards.length) {
      return;
    }

    function filter() {
      var keyword = "";
      inputs.forEach(function (input) {
        if (input.value.trim()) {
          keyword = input.value.trim().toLowerCase();
        }
      });

      var kind = "";
      selects.forEach(function (select) {
        if (select.value) {
          kind = select.value;
        }
      });

      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-meta") || ""
        ].join(" ").toLowerCase();
        var cardKind = card.getAttribute("data-kind") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedKind = !kind || cardKind.indexOf(kind) !== -1;
        var showCard = matchedKeyword && matchedKind;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", filter);
    });

    selects.forEach(function (select) {
      select.addEventListener("change", filter);
    });
  }

  function setupLazyImages() {
    all(".lazy-load-image").forEach(function (img) {
      if (img.complete) {
        img.classList.add("loaded");
      }
      img.addEventListener("load", function () {
        img.classList.add("loaded");
      });
    });
  }

  window.setupPlayer = function (streamUrl) {
    var video = one("#movie-player");
    var cover = one("[data-player-cover]");
    var trigger = one("[data-player-trigger]");
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;
    var hls = null;
    var playAfterReady = false;

    function requestPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function prepare() {
      if (loaded) {
        requestPlay();
        return;
      }

      loaded = true;
      playAfterReady = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playAfterReady) {
            requestPlay();
          }
        });
      } else {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        video.load();
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }
    }

    [cover, trigger].forEach(function (element) {
      if (element) {
        element.addEventListener("click", prepare);
      }
    });

    video.addEventListener("click", function () {
      if (!loaded) {
        prepare();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupLazyImages();
  });
})();
