const searchFormEl = document.getElementById("search-form");
const searchResultsEl = document.getElementById("search-results");
const searchResultsMessageEl = document.getElementById("search-results-message");

const get = function (e) {
    return new Promise(function (t, s) {
        var n = new XMLHttpRequest;
        n.open("GET", e), n.onload = function () {
            200 == n.status ? t(JSON.parse(n.response)) : s(Error(n.statusText))
        }, n.onerror = function () {
            s(Error("Network Error"))
        }, n.send()
    })
};

const createExcerptEl = function (e) {
    function getExcerpt(e) {
        var t = e;
        return t = t.replace(/<(?:.|\n)*?>/gm, ""), t = t.substring(0, 300)
    }

    function getPrettyDate(e) {
        var t = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            s = e.split("T")[0],
            n = s.split("-")[0],
            o = t[parseInt(s.split("-")[1]) - 1],
            r = s.split("-")[2];
        return o + " " + r + ", " + n
    }

    return `
    <article class="excerpt m-b-md p-b-md">
        <header class="excerpt__header m-b-sm">
            <h2 class="excerpt__title h2 no-ul">
                <a href="${e.url}">${e.title}</a>
            </h2>
            <div class="post__meta">
                <em>${getPrettyDate(e.published_at)}</em>
            </div>
        </header>
    
        <div class="excerpt__body">
            ${getExcerpt(e.html)}...
        </div>
    </article>`;
};

const getPosts = function (e) {

    function filterArticles(t) {
        var s = [];
        return t.forEach(function (t) {
            t.title.toLowerCase().indexOf(e.toLowerCase()) > -1 && s.push(t)
        }), s
    }

    function updatePage(e) {
        var excerpts = filterArticles(e.posts).map((post) => createExcerptEl(post))
        
        searchResultsMessageEl.classList.remove("message--default");
        searchResultsMessageEl.classList.add("message--count");
        searchResultsMessageEl.innerHTML = `<span>${excerpts.length} posts</span> were found.`;

        searchResultsEl.insertAdjacentHTML("beforeend", excerpts.join(""));
    }

    function handleError(e) {
        searchResultsMessageEl.classList.remove("message--default");
        searchResultsMessageEl.classList.add("message--error");
        searchResultsMessageEl.textContent = `Oops! There was an error searching for "${e}"`;
    }

    var options = {
        limit: "all",
        include: "tags"
    };
    get(ghost.url.api("posts", options)).then(updatePage).catch(handleError);
};

searchFormEl.addEventListener("submit", function (e) {
    e.preventDefault();
    
    searchResultsMessageEl.textContent = 'Searching...';

    const searchText = document.getElementById("search-form__input").value;
    if (searchText) getPosts(searchText);
});
