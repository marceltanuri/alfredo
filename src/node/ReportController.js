const model = require('./model/classes.js')
const CryptoJS = require("crypto-js");
const fs = require('fs');

module.exports = async function buildTransactionsFile() {

    await new model.Transactions().init().then(t => {

        // Export transactions as encripted JSON format. This JSON will be read by a static web app
        var encriptedJSON = CryptoJS.AES.encrypt(JSON.stringify(t.toJSON()), process.env.alfredo_json_crypto_key);
        let jsonVariable = `const transactions = "${encriptedJSON}"`
        console.log("Exporting report as static content...")
        fs.writeFile(__dirname + '/public/data/transactions.js', jsonVariable, err => {
            if (err) {
                console.error(err);
            }
        });

        let buildtime = `const buildTime = "${new Date().toGMTString()}"`
        fs.writeFile(__dirname + '/public/data/buildTime.js', buildtime, err => {
            if (err) {
                console.error(err);
            }
        });


    })
}
