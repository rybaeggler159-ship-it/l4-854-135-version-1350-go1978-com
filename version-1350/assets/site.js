(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var root = qs('[data-hero-slider]');

    if (!root) {
      return;
    }

    var slides = qsa('.hero-slide', root);
    var dots = qsa('[data-hero-dot]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
        show(nextIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFiltering() {
    var scope = qs('[data-filter-scope]');
    var list = qs('[data-card-list]');

    if (!scope || !list) {
      return;
    }

    var searchInput = qs('[data-card-search]', scope);
    var typeSelect = qs('[data-card-type]', scope);
    var categorySelect = qs('[data-card-category]', scope);
    var sortSelect = qs('[data-card-sort]', scope);
    var countNode = qs('[data-result-count]');
    var noResults = qs('[data-no-results]');
    var cards = qsa('[data-filter-card]', list);
    var originalOrder = cards.slice();

    if (scope.hasAttribute('data-search-page') && searchInput) {
      var query = new URLSearchParams(window.location.search).get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    function cardMatches(card) {
      var query = searchInput ? normalize(searchInput.value) : '';
      var type = typeSelect ? typeSelect.value : 'all';
      var category = categorySelect ? categorySelect.value : 'all';
      var text = normalize(card.getAttribute('data-search'));
      var cardType = card.getAttribute('data-type') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var queryOK = !query || text.indexOf(query) !== -1;
      var typeOK = type === 'all' || cardType === type;
      var categoryOK = category === 'all' || cardCategory === category;

      return queryOK && typeOK && categoryOK;
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (mode === 'default') {
        sorted = originalOrder.slice();
      }

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }

      if (mode === 'heat-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
        });
      }

      if (mode === 'score-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    function applyFilters() {
      var visibleCount = 0;

      sortCards();

      cards.forEach(function (card) {
        var visible = cardMatches(card);
        card.classList.toggle('is-hidden-by-filter', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }

      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }
    }

    [searchInput, typeSelect, categorySelect, sortSelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function setupCopyLink() {
    qsa('[data-copy-link]').forEach(function (button) {
      button.addEventListener('click', function () {
        var url = window.location.href;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '已复制';
            window.setTimeout(function () {
              button.textContent = '复制链接';
            }, 1600);
          });
          return;
        }

        window.prompt('复制链接', url);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroSlider();
    setupFiltering();
    setupCopyLink();
  });
})();
