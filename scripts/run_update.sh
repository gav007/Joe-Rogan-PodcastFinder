#!/bin/bash

cd /home/gav/podcasts-finder || exit 1

source /home/gav/.spotify_env
source venv/bin/activate

python3 scripts/update_dataset.py >> logs/update.log 2>&1
