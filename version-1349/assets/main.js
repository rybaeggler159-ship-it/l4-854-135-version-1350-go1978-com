(function () {
    var doc = document;

    function all(selector, root) {
        return Array.prototype.slice.call((root || doc).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || doc).querySelector(selector);
    }

    function initMenu() {
        var toggle = one('.menu-toggle');
        var panel = one('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!opened));
            panel.hidden = opened;
        });
    }

    function initHero() {
        var slider = one('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = all('.hero-slide', slider);
        var dots = all('.hero-dot', slider);
        var prev = one('[data-hero-prev]', slider);
        var next = one('[data-hero-next]', slider);
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function uniqueValues(cards, attr) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(attr) || '';
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = doc.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        var grid = one('.js-filter-grid');
        if (!grid) {
            return;
        }
        var cards = all('[data-card]', grid);
        var search = one('.js-grid-search');
        var region = one('.js-filter-region');
        var year = one('.js-filter-year');
        var type = one('.js-filter-type');
        var sort = one('.js-sort');
        var empty = one('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        fillSelect(region, uniqueValues(cards, 'data-region'));
        fillSelect(year, uniqueValues(cards, 'data-year'));
        fillSelect(type, uniqueValues(cards, 'data-type'));

        if (search && query) {
            search.value = query;
        }

        function matches(card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            return (!keyword || text.indexOf(keyword) !== -1) &&
                (!regionValue || card.getAttribute('data-region') === regionValue) &&
                (!yearValue || card.getAttribute('data-year') === yearValue) &&
                (!typeValue || card.getAttribute('data-type') === typeValue);
        }

        function compareCards(a, b) {
            var value = sort ? sort.value : 'default';
            if (value === 'rating') {
                return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
            }
            if (value === 'views') {
                return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
            }
            if (value === 'year') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            return cards.indexOf(a) - cards.indexOf(b);
        }

        function apply() {
            var shown = 0;
            cards.slice().sort(compareCards).forEach(function (card) {
                grid.appendChild(card);
                var visible = matches(card);
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [search, region, year, type, sort].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });

        apply();
    }

    function initPlayers() {
        all('.js-player').forEach(function (player) {
            var video = one('video', player);
            var centerButton = one('.js-player-button', player);
            var state = one('.js-player-state', player);
            var toggle = one('.js-player-toggle', player);
            var mute = one('.js-player-mute', player);
            var fullscreen = one('.js-player-fullscreen', player);
            var prepared = false;
            var stream;
            var hlsInstance;

            if (!video) {
                return;
            }

            stream = video.getAttribute('data-stream') || '';

            function setState(text) {
                if (state) {
                    state.textContent = text;
                }
            }

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                setState('正在载入影片');
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setState('点击开始播放');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setState('影片载入失败，请稍后重试');
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function play() {
                prepare();
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setState('点击开始播放');
                    });
                }
            }

            function togglePlay() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            }

            if (centerButton) {
                centerButton.addEventListener('click', togglePlay);
            }
            if (toggle) {
                toggle.addEventListener('click', togglePlay);
            }
            video.addEventListener('click', togglePlay);

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
                if (toggle) {
                    toggle.textContent = '暂停';
                }
            });

            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
                if (toggle) {
                    toggle.textContent = '播放';
                }
            });

            video.addEventListener('waiting', function () {
                setState('正在缓冲');
            });

            video.addEventListener('playing', function () {
                setState('');
            });

            if (mute) {
                mute.addEventListener('click', function () {
                    video.muted = !video.muted;
                    mute.textContent = video.muted ? '取消静音' : '静音';
                });
            }

            if (fullscreen) {
                fullscreen.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
