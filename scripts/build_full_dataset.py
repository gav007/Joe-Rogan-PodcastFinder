import os
import json
import time
import requests


CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

SHOW_ID = "4rOoJ6Egrf8K2IrywzwOMk"  # Joe Rogan Experience
OUTPUT_FILE = "data/episodes.json"


def get_access_token():
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("Missing Spotify client ID or secret.")

    response = requests.post(
        "https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        auth=(CLIENT_ID, CLIENT_SECRET),
    )

    response.raise_for_status()
    return response.json()["access_token"]


def fetch_episode_page(token, offset, limit=50):
    headers = {
        "Authorization": f"Bearer {token}"
    }

    params = {
        "market": "IE",
        "limit": limit,
        "offset": offset
    }

    response = requests.get(
        f"https://api.spotify.com/v1/shows/{SHOW_ID}/episodes",
        headers=headers,
        params=params,
    )

    response.raise_for_status()
    return response.json()


def clean_episode(episode):
    return {
        "id": episode["id"],
        "title": episode["name"],
        "description": episode.get("description", ""),
        "html_description": episode.get("html_description", ""),
        "release_date": episode["release_date"],
        "duration_minutes": round(episode["duration_ms"] / 1000 / 60),
        "spotify_url": episode["external_urls"]["spotify"],
        "image_url": episode["images"][0]["url"] if episode.get("images") else None,
        "explicit": episode["explicit"],
        "is_playable": episode["is_playable"],
        "uri": episode["uri"],
    }


def main():
    token = get_access_token()

    all_episodes = []
    offset = 0
    limit = 50

    while True:
        print(f"Fetching offset {offset}...")

        page = fetch_episode_page(token, offset, limit)
        items = page["items"]

        if not items:
            break

        for episode in items:
            all_episodes.append(clean_episode(episode))

        offset += limit

        if page["next"] is None:
            break

        time.sleep(0.2)

    # Remove duplicates, just in case Spotify does anything weird.
    unique_episodes = {}

    for episode in all_episodes:
        unique_episodes[episode["id"]] = episode

    final_episodes = list(unique_episodes.values())

    # Save oldest first, newest last.
    final_episodes.sort(key=lambda episode: episode["release_date"])

    os.makedirs("data", exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(final_episodes, file, indent=4, ensure_ascii=False)

    print()
    print("Done.")
    print("Episodes saved:", len(final_episodes))
    print("File:", OUTPUT_FILE)


if __name__ == "__main__":
    main()
