#!/usr/bin/env bash

echo "Publishing static content to GitPages..."
cd $1
git commit -a -m'update site content'
git push