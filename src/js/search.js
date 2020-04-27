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
    const api = new GhostContentAPI({
      url: 'https://bitsofcode.ghost.io',
      key: '78111c135ca4238e88a63c5f48',
      version: "v3"
    });
    
    return api.posts
      .browse({
        limit: 'all', 
        include: 'tags',
        fields: "title,published_at,html,url,slug"
      })
      .then((posts) => {
        console.log(posts)
        this.posts = posts
      });
};

SearchGhost.prototype.searchPosts = function (query) {
    const regex = new RegExp(query, "gi");
    
    const priority1 = [];
    const priority2 = [];
    const priority3 = [];

    this.posts.forEach((post) => {
        const titleMatch = post.title.match(regex);
        const tagsMatch = post.tags ? post.tags.some((tag) => tag.name.match(regex)) : false;
        const contentMatch = post.html.match(regex);

        if (titleMatch) priority1.push(post);
        else if (tagsMatch) return priority2.push(post);
        else if (contentMatch) return priority3.push(post);
    });

    return [ ...priority1, ...priority2, ...priority3 ];
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
        if (!tags || tags.length == 0) return "";
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
