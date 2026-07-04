@echo off
REM Launches the Podcast Finder web app from Windows.
REM Starts the local server inside WSL, then opens the app in your default browser.
REM To stop the server later, close the WSL console window it opens, or run
REM inside WSL: fuser -k 8123/tcp

start "Podcast Finder server" wsl.exe -e bash /home/gav/podcasts-finder/scripts/start_web_app.sh
timeout /t 2 /nobreak >nul
start "" http://localhost:8123/web/index.html
