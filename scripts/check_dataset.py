import json
from collections import Counter


with open("data/episodes.json", "r", encoding="utf-8") as file:
    episodes = json.load(file)

print("Total episodes:", len(episodes))
print("First episode:", episodes[0]["title"], episodes[0]["release_date"])
print("Last episode:", episodes[-1]["title"], episodes[-1]["release_date"])

years = []

for episode in episodes:
    year = episode["release_date"][:4]
    years.append(year)

year_counts = Counter(years)

print("\nEpisodes by year:")
for year, count in sorted(year_counts.items()):
    print(year, count)
