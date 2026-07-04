import json
import re


def remove_urls(text):
    return re.sub(r"https?://\S+|www\.\S+", "", text)


search_term = input("Search term, or press Enter to skip: ").strip().lower()
year_filter = input("Year, or press Enter to skip: ").strip()

with open("data/episodes.json", "r", encoding="utf-8") as file:
    episodes = json.load(file)

matches = []

for episode in episodes:
    title = episode["title"].lower()
    description = remove_urls(episode["description"].lower())
    release_date = episode["release_date"]

    if search_term:
        pattern = r"\b" + re.escape(search_term) + r"\b"
        term_matches = re.search(pattern, title) or re.search(pattern, description)
    else:
        term_matches = True

    if year_filter:
        year_matches = release_date.startswith(year_filter)
    else:
        year_matches = True

    if term_matches and year_matches:
        matches.append(episode)

print()
print("Matches found:", len(matches))
print("-" * 60)

for episode in matches:
    print(episode["title"])
    print(episode["release_date"], "-", episode["duration_minutes"], "mins")
    print(episode["spotify_url"])
    print(episode["description"][:250] + "...")
    print("-" * 60)
