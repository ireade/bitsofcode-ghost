function SearchGhost(options) {

    this.searchForm = options.searchForm;
    this.messageEl = options.messageEl;
    this.resultsEl = options.resultsEl;

    this.getPosts().catch(() => {
        this.messageEl.classList.remove("message--default");
        this.messageEl.classList.add("message--danger");
        this.messageEl.textContent = `Unable to fetch posts to search.`;
    });

    this.searchForm.addEventListener("submit", this.onSubmit.bind(this));
}

SearchGhost.prototype.getPosts = function () {
    function get(url) {
        return new Promise(function (resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                req.status == 200 ? resolve(JSON.parse(req.response)) : reject(Error(req.statusText))
            };
            req.onerror = function () { reject(Error("Network Error")); };
            req.send();
        });
    }

    const url = ghost.url.api("posts", {
        limit: "all",
        include: "tags",
        fields: "title,published_at,html,url,slug"
    });

    return get(url).then((res) => this.posts = res.posts)
};

SearchGhost.prototype.searchPosts = function (query) {
    const regex = new RegExp(query, "gi");
    
    const priority1 = [];
    const priroty2 = [];
    const priroty3 = [];

    this.posts.forEach((post) => {
        const titleMatch = post.title.match(regex);
        const tagsMatch = post.tags.some((tag) => tag.name.match(regex));
        const contentMatch = post.html.match(regex);

        if (titleMatch) priority1.push(post);
        else if (tagsMatch) return priroty2.push(post);
        else if (contentMatch) return priroty3.push(post);
    });

    return [ ...priority1, ...priroty2, ...priroty3 ];
};

SearchGhost.prototype.buildPostExcerpt = function (post, query) {

    function highlightQuery(string) {
        const regex = new RegExp(query, "gi");
        return string.replace(regex, (match) => `<mark>${match}</mark>`);
    }

    function getExcerpt(html) {
        const cleanHTML = html.replace(/<(?:.|\n)*?>/gm, "");
        const excerpt = highlightQuery(cleanHTML.substring(0, 300));
        return excerpt + "...";
    }

    function getPrettyDate(published_at) {
        const prettyMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const date = published_at.split("T")[0];
        const year = date.split("-")[0];
        const month = prettyMonths[parseInt(date.split("-")[1]) - 1];
        const day = date.split("-")[2];

        return `<em>${month} ${day}, ${year}</em>`;
    }

    function getTags(tags) {
        if (tags.length == 0) return "";
        return `<em>
            ${tags.map((tag) => ` <a href="/tag/${tag.slug}">${highlightQuery(tag.name)}</a>`)}
        </em>`;
    }

    return `
    <article class="excerpt m-b-md p-b-md">
        <header class="excerpt__header m-b-sm">
            <h2 class="excerpt__title h2 no-ul">
                <a href="${post.url}">${highlightQuery(post.title)}</a>
            </h2>
            <div class="post__meta">
                ${getPrettyDate(post.published_at)}
                ${getTags(post.tags)}
            </div>
        </header>
        <div class="excerpt__body">
            ${getExcerpt(post.html)}
        </div>
    </article>`;
};

SearchGhost.prototype.onSubmit = function (e) {

    e.preventDefault();

    const query = e.target.querySelector("[name='query']").value;

    if (!query) {
        this.messageEl.textContent = "Please enter a search query";
        return false;
    }

    this.messageEl.textContent = `Searching for posts related to "${query}"...`;

    const relevantPosts = this.searchPosts(query);
    const postExcerpts = relevantPosts.map((post) => this.buildPostExcerpt(post, query)).join("");

    this.messageEl.classList.remove("message--default");
    this.messageEl.classList.add("message--count");
    this.messageEl.innerHTML = `<span>${relevantPosts.length} posts</span> were found.`;

    this.resultsEl.innerHTML = postExcerpts;
}

new SearchGhost({
    searchForm: document.getElementById("search-form"),
    messageEl: document.getElementById("search-results-message"),
    resultsEl: document.getElementById("search-results")
});
