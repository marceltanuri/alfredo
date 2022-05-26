#!/usr/bin/env bash
BASEDIR=$(dirname "$0")

rm -rf $BASEDIR/temp/*
py $BASEDIR/src/py/getTransactions.py && 
py $BASEDIR/src/py/getTransactionsTicket.py && 
py $BASEDIR/src/py/writeJSON.py && 
node $BASEDIR/src/node/report.js
node $BASEDIR/src/node/server.js &
cp -R $BASEDIR/src/node/public/* ../alfredo-static/
echo "Publishing static content to GitPages..."
cd ../alfredo-static/
git commit -a -m'update site content'
git push