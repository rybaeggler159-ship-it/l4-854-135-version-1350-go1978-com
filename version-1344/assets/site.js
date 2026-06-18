(function () {
    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function createResultCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card card-compact";

        var href = movie.url || ("details/movie-" + movie.id + ".html");
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join("\n");

        article.innerHTML = [
            '<a class="card-poster-link" href="' + href + '">',
            '    <div class="poster poster-theme-' + (((Number(movie.id) || 1) % 12) + 1) + '">',
            '        <div class="poster-no">' + escapeHtml(movie.id) + '</div>',
            '        <div class="poster-title">' + escapeHtml(movie.title) + '</div>',
            '        <div class="poster-year">' + escapeHtml(movie.year) + '</div>',
            '    </div>',
            '</a>',
            '<div class="card-body">',
            '    <p class="card-meta">' + escapeHtml([movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ")) + '</p>',
            '    <h2><a href="' + href + '">' + escapeHtml(movie.title) + '</a></h2>',
            '    <p class="card-desc">' + escapeHtml(movie.oneLine || "") + '</p>',
            '    <div class="tag-row">' + tags + '</div>',
            '</div>'
        ].join("\n");

        return article;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function filterMovies() {
        var input = document.querySelector("[data-search-input]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var output = document.querySelector("[data-search-results]");
        var counter = document.querySelector("[data-result-count]");

        if (!input || !output || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }

        var query = normalize(input.value);
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var tokens = query.split(/\s+/).filter(Boolean);

        var results = window.MOVIE_INDEX.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" "));

            var matchedQuery = tokens.every(function (token) {
                return haystack.indexOf(token) !== -1;
            });
            var matchedYear = !year || String(movie.year) === year;
            var matchedType = !type || String(movie.type).indexOf(type) !== -1;

            return matchedQuery && matchedYear && matchedType;
        }).slice(0, 80);

        output.innerHTML = "";
        if (counter) {
            counter.textContent = "找到 " + results.length + " 条结果";
        }

        if (!results.length) {
            var empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "没有找到匹配影片，请尝试更短的关键词。";
            output.appendChild(empty);
            return;
        }

        var grid = document.createElement("div");
        grid.className = "movie-grid";
        results.forEach(function (movie) {
            grid.appendChild(createResultCard(movie));
        });
        output.appendChild(grid);
    }

    function initSearchPage() {
        var input = document.querySelector("[data-search-input]");
        if (!input) {
            return;
        }

        var controls = document.querySelectorAll("[data-search-input], [data-year-filter], [data-type-filter]");
        controls.forEach(function (control) {
            control.addEventListener("input", filterMovies);
            control.addEventListener("change", filterMovies);
        });
        filterMovies();
    }

    document.addEventListener("DOMContentLoaded", initSearchPage);
})();
