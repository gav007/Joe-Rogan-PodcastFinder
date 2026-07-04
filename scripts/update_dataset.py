import os
import json
import requests
from datetime import datetime

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SHOW_ID = "4rOoJ6Egrf8K2IrywzwOMk"
DATA_FILE = "data/episodes.json"


def get_token():
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET),
    )
    response.raise_for_status()
    return response.json()["access_token"]


def fetch_latest(token):
    response = requests.get(
        f"https://api.spotify.com/v1/shows/{SHOW_ID}/episodes",
        headers={"Authorization": f"Bearer {token}"},
        params={"market": "IE", "limit": 50, "offset": 0},
    )
    response.raise_for_status()
    return response.json()["items"]


def clean_episode(ep):
    return {
        "id": ep["id"],
        "title": ep["name"],
        "description": ep.get("description", ""),
        "html_description": ep.get("html_description", ""),
        "release_date": ep["release_date"],
        "duration_minutes": round(ep["duration_ms"] / 1000 / 60),
        "spotify_url": ep["external_urls"]["spotify"],
        "image_url": ep["images"][0]["url"] if ep.get("images") else None,
        "explicit": ep["explicit"],
        "is_playable": ep["is_playable"],
        "uri": ep["uri"],
    }


def main():
    print("Update started:", datetime.now())

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        existing = json.load(file)

    existing_ids = {ep["id"] for ep in existing}

    token = get_token()
    latest = fetch_latest(token)

    new_episodes = []

    for ep in latest:
        if ep["id"] not in existing_ids:
            new_episodes.append(clean_episode(ep))

    if not new_episodes:
        print("No new episodes found.")
        return

    updated = existing + new_episodes
    updated.sort(key=lambda ep: ep["release_date"])

    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(updated, file, indent=4, ensure_ascii=False)

    print("New episodes added:", len(new_episodes))
    print("Total episodes now:", len(updated))


if __name__ == "__main__":
    main()
