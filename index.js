const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cron = require('node-cron');
const fs = require('fs');
require('log-timestamp');


let configRawdata = fs.readFileSync(__dirname + '/src/config/config.json');
let config = JSON.parse(configRawdata);

async function main() {
  await _exec(`rm -rf ${__dirname}/temp/*`)
  await _exec(`python ${__dirname}/src/py/getTransactions.py`)
  await _exec(`python ${__dirname}/src/py/getTransactionsTicket.py`)
  await _exec(`python ${__dirname}/src/py/writeJSON.py`)
  await _exec(`node ${__dirname}/src/node/report.js`)
  _exec(`node ${__dirname}/src/node/server.js`)
  await _exec(`cp -R ${__dirname}/src/node/public/*  ${config.staticContentDir}`)
  await _exec(`sh ${__dirname}/publish.sh  ${config.staticContentDir}`)
  console.log("Completed")
}

async function _exec(cmd) {
  try {
    const { stdout, stderr } = await exec(cmd);
    console.log(stdout);
    if (stderr)
      console.log(stderr);
  } catch (e) {
    console.error(e);
  }
}

if(config.cron){
  console.log("scheduled execution is enabled")
  cron.schedule(config.cron, function() {
      console.log("running a task with cron " + config.cron);
      main()
    });
}

main()