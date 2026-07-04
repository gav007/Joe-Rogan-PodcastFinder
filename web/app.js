let allEpisodes = [];

const searchInput = document.getElementById("searchInput");
const yearSelect = document.getElementById("yearSelect");
const limitSelect = document.getElementById("limitSelect");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");
const episodesDiv = document.getElementById("episodes");
const summaryDiv = document.getElementById("summary");

function removeUrls(text) {
    return text.replace(/https?:\/\/\S+|www\.\S+/g, "");
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normaliseText(text) {
    return removeUrls(text)
        .toLowerCase()
        .replace(/[“”]/g, '"')
        .replace(/[’]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function exactPhraseMatch(text, searchTerm) {
    const safeTerm = escapeRegex(searchTerm);
    const pattern = new RegExp(`(^|[^a-z0-9])${safeTerm}([^a-z0-9]|$)`, "i");
    return pattern.test(text);
}


fetch("../data/episodes.json")
    .then(response => response.json())
    .then(data => {
        allEpisodes = data;
        fillYearDropdown();
        displayEpisodes(allEpisodes.slice(-25).reverse());
    });

function fillYearDropdown() {
    const years = new Set();

    allEpisodes.forEach(episode => {
        const year = episode.release_date.slice(0, 4);
        years.add(year);
    });

    Array.from(years).sort().reverse().forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

function searchEpisodes() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedYear = yearSelect.value;
    const limit = limitSelect.value;

    let results = allEpisodes.filter(episode => {
        const title = normaliseText(episode.title);
        const description = normaliseText(episode.description);
        const combinedText = `${title} ${description}`;
        const year = episode.release_date.slice(0, 4);

        const matchesSearch =
        searchTerm === "" ||
        exactPhraseMatch(combinedText, searchTerm);

        const matchesYear =
            selectedYear === "" ||
            year === selectedYear;

        return matchesSearch && matchesYear;
    });

    results = results.reverse();

    if (limit !== "all") {
        results = results.slice(0, Number(limit));
    }

    displayEpisodes(results);
}

function displayEpisodes(episodes) {
    episodesDiv.innerHTML = "";

    summaryDiv.textContent = `Showing ${episodes.length} episode(s).`;

    episodes.forEach(episode => {
        const card = document.createElement("article");
        card.className = "card";

        card.innerHTML = `
            <img src="${episode.image_url}" alt="Episode artwork">
            <div class="card-content">
                <h2>${episode.title}</h2>
                <div class="meta">
                    ${episode.release_date} • ${episode.duration_minutes} mins
                </div>
                <p class="description">
                    ${episode.description.slice(0, 260)}...
                </p>
                <a href="${episode.spotify_url}" target="_blank">Open in Spotify</a>
            </div>
        `;

        episodesDiv.appendChild(card);
    });
}

searchButton.addEventListener("click", searchEpisodes);

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    yearSelect.value = "";
    limitSelect.value = "25";
    displayEpisodes(allEpisodes.slice(-25).reverse());
});
