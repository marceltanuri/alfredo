const Transaction = require("./Transaction")

module.exports = class Transactions {

    totalBalance = 0.0
    transactions = []

    constructor(totalBalance, transactions){
        this.totalBalance = totalBalance
        if(transactions!=undefined)
            this.transactions = transactions
    }

    addTransaction(transaction){
        if(transaction instanceof Transaction)
            this.transactions.push(transaction)
    }

}