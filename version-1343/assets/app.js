(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupNavigation() {
        var button = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function() {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('is-open', !expanded);
        });
    }

    function setupHero() {
        var slides = selectAll('.hero-slide');
        var dots = selectAll('.hero-dot');
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var target = Number(dot.getAttribute('data-target')) || 0;
                show(target);
                start();
            });
        });

        var slider = document.querySelector('.hero-slider');
        if (slider) {
            slider.addEventListener('mouseenter', stop);
            slider.addEventListener('mouseleave', start);
        }
        start();
    }

    function fillSelect(select, templateId) {
        var template = document.getElementById(templateId);
        if (!select || !template) {
            return;
        }
        select.appendChild(template.content.cloneNode(true));
    }

    function setupSearch() {
        var grid = document.querySelector('.searchable-grid');
        var input = document.getElementById('movieSearch');
        var year = document.getElementById('yearFilter');
        var region = document.getElementById('regionFilter');
        var type = document.getElementById('typeFilter');
        if (!grid || !input) {
            return;
        }

        fillSelect(year, 'yearOptions');
        fillSelect(region, 'regionOptions');
        fillSelect(type, 'typeOptions');

        var cards = selectAll('[data-search]', grid);
        var query = new URLSearchParams(window.location.search).get('q');
        if (query) {
            input.value = query;
        }

        function matches(card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var needle = input.value.trim().toLowerCase();
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var typeValue = type ? type.value : '';
            if (needle && text.indexOf(needle) === -1 && title.indexOf(needle) === -1) {
                return false;
            }
            if (yearValue && card.getAttribute('data-year') !== yearValue) {
                return false;
            }
            if (regionValue && card.getAttribute('data-region') !== regionValue) {
                return false;
            }
            if (typeValue && card.getAttribute('data-type') !== typeValue) {
                return false;
            }
            return true;
        }

        function apply() {
            cards.forEach(function(card) {
                card.classList.toggle('is-filtered-out', !matches(card));
            });
        }

        [input, year, region, type].forEach(function(control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function() {
        setupNavigation();
        setupHero();
        setupSearch();
    });
})();
