const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cron = require('node-cron');
const fs = require('fs');
const buildTransactionsFile = require('./src/node/ReportController.js')
const startServer = require('./src/node/server.js')
require('log-timestamp');


async function main() {
  await buildTransactionsFile()
  startServer()
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

if (process.env.cron) {
  console.log("scheduled execution is enabled")
  cron.schedule(process.env.cron, function () {
    console.log("running a task with cron " + process.env.cron);
    main()
  });
}

main()
