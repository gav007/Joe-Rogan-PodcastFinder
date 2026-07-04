# Joe Rogan Podcast Finder

## Demo Video

[Watch the Podcast Finder demo](screenshots/demo.mp4)

A local web app for searching Joe Rogan Experience episodes by year, guest,
topic, or description, backed by a dataset pulled from the Spotify API.

![Podcast Finder dashboard](screenshots/dashboard.png)

## Running the web app manually

The app is a static page (`web/index.html`) that fetches `data/episodes.json`
via a relative path, so it must be served by an HTTP server started from the
project root — opening `index.html` directly in a browser will not work.

```bash
cd /home/gav/podcasts-finder
./scripts/start_web_app.sh
```

Then open **http://localhost:8123/web/index.html**.

- To stop it: press `Ctrl+C` in that terminal, or from another terminal run
  `fuser -k 8123/tcp`.
- To restart it: stop it as above, then run the script again.
- If port 8123 is already in use, the script detects this, tells you the app
  is likely already running, and exits without erroring.

## Windows launcher

Double-click `launch_podcast_finder.bat` (or point a desktop shortcut at it).
It runs `scripts/start_web_app.sh` inside WSL in its own console window, waits
a couple of seconds, then opens `http://localhost:8123/web/index.html` in your
default browser. Close that WSL console window (or run `fuser -k 8123/tcp`
inside WSL) to stop the server.

## Weekly auto-updater

A Windows Task Scheduler task named `PodcastFinderWeeklyUpdate` runs every
**Friday at 19:00**, executing:

```
wsl.exe -e bash /home/gav/podcasts-finder/scripts/run_update.sh
```

`run_update.sh` activates the project's virtualenv, loads Spotify credentials
from `~/.spotify_env`, and runs `scripts/update_dataset.py`, which fetches the
latest episodes from Spotify, appends only the ones not already in
`data/episodes.json` (matched by episode id), and rewrites the file sorted by
release date. Output is logged to `logs/update.log` (not committed to git).

## Spotify secrets

Never commit Spotify credentials. `CLIENT_ID`/`CLIENT_SECRET` are read from
environment variables set in `~/.spotify_env` (outside the repo, sourced by
`run_update.sh`) — they must never be hardcoded in scripts or committed to
git. `.gitignore` already excludes `venv/`, `archive_old_start/`, and
`logs/*.log`; keep it that way and double-check `git status` before
committing if you ever touch env/secret files.

## Other scripts

- `scripts/build_full_dataset.py` — rebuilds `data/episodes.json` from
  scratch (full history).
- `scripts/check_dataset.py` — prints basic stats about the dataset.
- `scripts/search.py` — interactive command-line search.

## Icon

`web/favicon.svg` is an original placeholder icon (a simple microphone badge)
and is **not** official Joe Rogan Experience or Spotify artwork.
