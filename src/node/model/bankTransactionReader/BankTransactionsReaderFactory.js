const Itau = require("./impl/itau/Itau.js");

module.exports = class BankTransactionsReaderFactory{

    static getBankTransactionsReader(){

        switch (process.env.alfredo_bank_name) {
            case "itau":
                return new Itau()
            default:
                throw "No BankTransactionReader implementation found. Unknown bank name"
        }

    }

}