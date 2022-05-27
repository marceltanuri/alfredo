#!/usr/bin/env bash

echo "Publishing static content to GitPages..."
cd $1
git checkout --orphan latest_branch
git add -A
git commit -a -m'update site content'
git branch -D main
git branch -m main
git push -f origin main