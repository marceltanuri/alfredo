const { exec } = require("child_process");
var cron = require('node-cron');

function main(){
  exec("sh " +  __dirname + "/run.sh > alfredo.log", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
}

cron.schedule("*/30 * * * *", function() {
    console.log("running a task every 30 minute");
    main()
  });
  main()