const model = require('./model/classes.js')
const CryptoJS = require("crypto-js");
const fs = require('fs');

function main() {
    
    let transactions = new model.Transactions()

    // Export transactions as encripted JSON format. This JSON will be read by a static web app
    let configRawdata = fs.readFileSync(__dirname + '/../config/config.json');
    let config = JSON.parse(configRawdata);
    var encriptedJSON = CryptoJS.AES.encrypt(JSON.stringify(transactions.toJSON()), config.cryptoKey);
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

}

main();