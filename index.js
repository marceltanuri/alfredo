const util = require('util');
const exec = util.promisify(require('child_process').exec);
const cron = require('node-cron');
const fs = require('fs');
const buildTransactionsFile = require('./src/node/src/controller/ReportController.js')
const startServer = require('./src/node/src/server.js')
require('log-timestamp');

async function main() {
  await startServer()
  console.log("Completed")

}

if (process.env.cron) {
  console.log("scheduled execution is enabled")
  cron.schedule(process.env.cron, function () {
    console.log("running a task with cron " + process.env.cron);
    main()
  });
}

main()
