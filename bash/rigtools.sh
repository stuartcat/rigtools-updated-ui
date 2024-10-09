#!/bin/bash

# PUT THIS IN THE MAIN FOLDER WITH MAIN.MJS IT WILL NOT WORK IF YOU RUN IT HERE!
# This is a script that runs rigtools. Every 10 minutes it scans for updates on the repo, if it detects an update it updates itself.

BRANCH="main"

npm start &

NPM_PID=$!

while true
do
  git fetch origin $BRANCH
  LOCAL_COMMIT=$(git rev-parse HEAD)
  REMOTE_COMMIT=$(git rev-parse origin/$BRANCH)

  if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    kill $NPM_PID
    git pull origin $BRANCH
    npm install
    npm start &
    NPM_PID=$!
  fi

  sleep 600
done
