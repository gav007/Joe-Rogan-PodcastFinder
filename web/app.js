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

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// "#2522 - Tony Hinchcliffe" -> badge "#2522" + title "Tony Hinchcliffe"
function splitTitle(title) {
    const match = title.match(/^#\s*(\d+)\s*[-–—:]\s*(.+)$/);
    if (match) {
        return { badge: `#${match[1]}`, name: match[2] };
    }
    return { badge: null, name: title };
}

function truncate(text, maxLength = 230) {
    const clean = removeUrls(text).replace(/\s+/g, " ").trim();
    if (clean.length <= maxLength) {
        return clean;
    }
    const cut = clean.slice(0, maxLength);
    return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

summaryDiv.innerHTML = `<span class="caption">Loading episodes…</span>`;

fetch("../data/episodes.json")
    .then(response => response.json())
    .then(data => {
        allEpisodes = data;
        fillYearDropdown();
        displayEpisodes(allEpisodes.slice(-25).reverse());
    })
    .catch(() => {
        summaryDiv.innerHTML = `<span class="caption">Could not load episodes!</span>`;
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

function updateSummary(count) {
    const label = count === 1 ? "1 episode" : `${count} episodes`;
    summaryDiv.innerHTML = `<span class="caption">Showing ${label}</span>`;
    // retrigger the pop animation on every new search
    const caption = summaryDiv.firstElementChild;
    void caption.offsetWidth;
    caption.classList.add("pop");
}

function displayEpisodes(episodes) {
    episodesDiv.innerHTML = "";
    updateSummary(episodes.length);

    if (episodes.length === 0) {
        episodesDiv.innerHTML = `
            <div class="empty">
                <h2>No dice!</h2>
                <p>Nothing matched that search — try another guest, topic, or year.</p>
            </div>
        `;
        return;
    }

    episodes.forEach((episode, index) => {
        const card = document.createElement("article");
        card.className = "card";
        card.style.animationDelay = `${Math.min(index * 45, 600)}ms`;

        const { badge, name } = splitTitle(episode.title);

        card.innerHTML = `
            <div class="card-art">
                <img src="${episode.image_url || "favicon.svg"}" alt="Episode artwork" loading="lazy">
                ${badge ? `<span class="ep-badge">${escapeHtml(badge)}</span>` : ""}
            </div>
            <div class="card-content">
                <h2>${escapeHtml(name)}</h2>
                <div class="meta">
                    <span class="chip date">${episode.release_date}</span>
                    <span class="chip duration">${episode.duration_minutes} mins</span>
                </div>
                <p class="description">${escapeHtml(truncate(episode.description))}</p>
                <a class="listen" href="${episode.spotify_url}" target="_blank" rel="noopener">Listen &#9654;</a>
            </div>
        `;

        episodesDiv.appendChild(card);
    });
}

searchButton.addEventListener("click", searchEpisodes);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchEpisodes();
    }
});

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    yearSelect.value = "";
    limitSelect.value = "25";
    displayEpisodes(allEpisodes.slice(-25).reverse());
});
