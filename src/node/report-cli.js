const model = require('./model/classes.js')
const clc = require('cli-color');
const Pie = require("cli-pie");
const fs = require('fs');
const CryptoJS = require("crypto-js");


function breakLines(times) {
    let count = 1
    do {
        console.log("====================================================")
    } while (++count <= times)

}

function main() {
    let transactions = new model.Transactions()

    var formatter = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'BRL',
    });

    console.log("Building budget report....")
    breakLines(2)

    // Generate a new pie, with radius 5 characters
    let pieChart = new Pie(5, [], {
        legend: true,
        flat: true
    });

    transactions.expensesGroup.forEach(expenseGroup => {

        breakLines()
        // prints detailed report when it is a specific group
        if (expenseGroup.name == "Mercado" || expenseGroup.name == "Outros" || expenseGroup.name == "Compras") {
            console.log(clc.italic(clc.blackBright(`${expenseGroup.name} details`)))
            breakLines()
            expenseGroup.getExpenses().forEach(expense => {
                console.log(clc.blackBright(expense.date) + " " + clc.cyan(expense.description) + "  " + clc.blackBright(expense.value))
            })
            breakLines()
        }
        console.log(clc.bold(clc.blueBright(expenseGroup.name)))
        console.log(clc.blackBright("Valor disponível: " + clc.yellowBright(formatter.format((expenseGroup.getAvailableValue())))))
        console.log(clc.blackBright("Valor utilizado: " + formatter.format((expenseGroup.getExpensesSum() * -1)) + "  | " + clc.magentaBright(expenseGroup.getExpenseSumPercentage() + "% (used)") + "  | " + (expenseGroup.getAvailableValuePercentage() >= 0 ? clc.greenBright(expenseGroup.getAvailableValuePercentage() + "% (free)") : clc.redBright(expenseGroup.getAvailableValuePercentage() + "% (free)"))))
        console.log(clc.blackBright("Valor limite: " + formatter.format(expenseGroup.limit)))

        // Add a new item
        pieChart.add({
            label: expenseGroup.name,
            value: expenseGroup.limit + parseFloat(expenseGroup.getAvailableValue() >= 0 ? 0 : (expenseGroup.getAvailableValue() * -1)),
            color: expenseGroup.color
        });
    })

    breakLines()
    breakLines()
    console.log(clc.cyanBright("Saldo Total: " + formatter.format(transactions.getTotalBalance())));
    console.log(clc.red("Despesas restantes: " + formatter.format(transactions.getGroupAvailableValueSum())));
    console.log(clc.greenBright.bold("Total disponível: " + formatter.format(transactions.getIncomingsSum() - (transactions.getGroupAvailableValueSum() - transactions.getGroupExpensesSum()))));
    console.log(clc.blackBright("Total gasto: " + formatter.format(transactions.getGroupExpensesSum())));
    console.log(clc.blackBright("Despesa prevista: " + formatter.format(transactions.getLimitSum())));
    console.log(clc.blackBright("Despesa em curso: " + formatter.format(transactions.getGroupAvailableValueSum() - transactions.getGroupExpensesSum())));
    breakLines()
    console.log(clc.magentaBright("Saldo CC: " + formatter.format(transactions.balance)));
    if (transactions.ticketBalance != "") {
        console.log(clc.yellowBright("Saldo Ticket: " + formatter.format(transactions.ticketBalance)));
    }

    pieChart.add({
        label: "Saldo",
        value: transactions.getTotalSaved(),
        color: [80, 200, 200]
    });

    // Enable the ansi styles
    console.log(pieChart.toString());


    // Export transactions as encripted JSON format. This JSON will be read by a static web app
    var encriptedJSON = CryptoJS.AES.encrypt(JSON.stringify(transactions.toJSON()), process.env.alfredo_json_crypto_key);
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