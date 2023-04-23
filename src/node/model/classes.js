const e = require('express');
const fs = require('fs');
const Itau = require('./bankTransactionReader/impl/itau/Itau');
const BankTransactionsReaderFactory = require('./bankTransactionReader/BankTransactionsReaderFactory');

class ReportDataBuilder {

    budget = {}
    transactionsSources = []
    balance = 0.0
    expensesGroup = []

    #setBudget(jsonFile) {
        this.budget = JSON.parse(jsonFile);
    }

    async init() {

        const budgetFile = __dirname + '/../../config/budget.json';
        this.#setBudget(fs.readFileSync(budgetFile))

        const bankTransactionsReader = BankTransactionsReaderFactory.getBankTransactionsReader()

        let bankTransactions = await bankTransactionsReader.init()
            .then(res => res.doAuth()
                .then(res => res.getBalance()))

        bankTransactionsReader.close()

        this.transactionsSources.push({ "bank": bankTransactions })
        
        // TODO filter transactions according to the report period (startDate - endDate)
        console.log(this.transactionsSources)

        // TODO add ticketTransactions to transactionsSource
        // this.transactionsSources.push({ "ticket": ticketTransactions })

        // incomings
        this.estimatedIncomings = this.budget.incomings
        this.incomings = []

        // load expensesGroup based on budget data
        this.expensesGroup = []
        this.budget.data.forEach(cat => {
            this.expensesGroup.push(new ExpenseGroup(cat))
        })

        for (const transactionsSource of this.transactionsSources) {

            let transactionsSourceValue = Object.values(transactionsSource)[0]

            console.log(transactionsSourceValue)

            transactionsSourceValue.transactions.filter(transaction => transaction.type === "expense").forEach(debtTransaction => {
                this.addExpenseToExpenseGroupUsingExpDescriptionAndGroupRegexConfig(debtTransaction.description, debtTransaction.date, debtTransaction.value)
            })

            transactionsSourceValue.transactions.filter(transaction => transaction.type === "incoming").forEach(creditTransaction => {
                this.addIncoming(creditTransaction.description, creditTransaction.date, creditTransaction.value)
            })

        }

        console.log(this.expensesGroup)
        return this
    }

    getIncomingsSum() {
        let sum = 0
        this.incomings.forEach(incoming => {
            sum += parseFloat(incoming.value)
        })

        // reads estimatedIncomings and even if it's not paid yet its value is considered in the sum
        this.getEstimatedIncomings().forEach(estimatedIncoming => {
            if (!estimatedIncoming.paid) {
                sum += estimatedIncoming.value
            }
        })

        return sum
    }

    /**
     * 
     * @returns Incomings sorted by date
     */
    getIncomings() {
        const sortedIncomings = this.incomings.slice().sort((a, b) => (new Date(a.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")) - new Date(b.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))))
        return sortedIncomings
    }

    /**
     * Adds the expense the correct expenseGroup based on expense description
     * @param {*} description 
     * @param {*} date 
     * @param {*} value 
     */
    addExpenseToExpenseGroupUsingExpDescriptionAndGroupRegexConfig(description, date, value) {

        let expenseGroup = this.expensesGroup.find(_expenseGroup => {
            return _expenseGroup.regex.find(rgx => {
                return description.indexOf(rgx) >= 0
            })
        })

        if (expenseGroup == null) {
            expenseGroup = this.expensesGroup.find(_expenseGroup => {
                return _expenseGroup.default === true
            })
        }

        if (expenseGroup != null) {
            expenseGroup.addExpense(description, date, value)
        }
    }

    addIncoming(description, date, value) {
        this.incomings.push(new Incoming(description, date, value))
    }

    getGroupAvailableValueSum() {
        let sum = 0.0
        this.expensesGroup.forEach(elm => {
            let avl = elm.getAvailableValue()
            if (avl > 0) {
                sum += avl
            }
        })
        return sum;
    }

    getGroupExpensesSum() {
        let sum = 0.0
        this.expensesGroup.forEach(elm => {
            sum = sum + elm.getExpensesSum()
        })
        return sum;
    }

    getTotalSaved() {
        let totalSaved = parseFloat(this.balance)

        if (this.ticketBalance != "") {
            totalSaved += parseFloat(this.ticketBalance)
        }

        totalSaved -= (this.getGroupAvailableValueSum())

        return totalSaved
    }

    getBalances(formatter) {

        let balances = { sources: [] }
        let sum = 0.0

        for (const transactionsSource of this.transactionsSources) {
            let transactionsSourceName = Object.keys(transactionsSource)[0]
            let transactionsSourceValue = Object.values(transactionsSource)[0]

            balances.sources.push({ "name": transactionsSourceName, "total": formatter.format(transactionsSourceValue.totalBalance) })
            sum += parseFloat(transactionsSourceValue.totalBalance)
        }

        balances.sum = formatter.format(sum)

        return balances
    }

    getLimitSum() {
        let sum = 0.0
        this.expensesGroup.forEach(elm => { sum += parseFloat(elm.limit) })
        return sum
    }

    getEstimatedIncomings() {

        this.estimatedIncomings.forEach(estimatedIncoming => {
            estimatedIncoming.paid = (this.incomings.some(incoming => {
                return incoming.description.includes(estimatedIncoming.regex)
            }))
        })

        return this.estimatedIncomings

    }

    toJSON() {
        var formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        let json = {}

        json.expensesGroup = []

        this.expensesGroup.forEach(expenseGroup => {
            let _expenseGroup = expenseGroup
            _expenseGroup.availableValue = expenseGroup.getAvailableValue()
            _expenseGroup.expensesSum = expenseGroup.getExpensesSum()
            _expenseGroup.expenseSumPercentage = expenseGroup.getExpenseSumPercentage()
            _expenseGroup.availableValuePercentage = expenseGroup.getAvailableValuePercentage()
            _expenseGroup.expenses = expenseGroup.getExpenses()
            _expenseGroup.fixedExpenses = expenseGroup.getFixedExpenses()
            json.expensesGroup.push(_expenseGroup)
        })

        json.totals = {}

        json.totals.pendingExpenses = formatter.format(this.getGroupAvailableValueSum())
        json.totals.available = formatter.format(this.getIncomingsSum() - (this.getGroupAvailableValueSum() - this.getGroupExpensesSum()))
        json.totals.gross = formatter.format(this.getGroupExpensesSum())
        json.totals.previewedExpenses = formatter.format(this.getLimitSum())
        json.totals.realExpenses = formatter.format(this.getGroupAvailableValueSum() - this.getGroupExpensesSum())
        json.totals.balances = this.getBalances(formatter)

        console.log(json.totals)

        json.incomings = {}
        json.estimatedIncomings = this.getEstimatedIncomings()
        json.incomings.data = this.getIncomings()
        json.incomings.sum = formatter.format(this.getIncomingsSum())

        return json
    }
}

class ExpenseGroup {
    constructor(cat) {
        this.name = cat.desc
        this.default = cat.default
        this.regex = cat.regex
        if (cat.limit != undefined)
            this.limit = cat.limit
        if (cat.fixed_expenses != undefined) {
            this.fixedExpenses = cat.fixed_expenses
            let limit = 0
            cat.fixed_expenses.forEach(exp => {
                limit += parseFloat(exp.value)
            })
            this.limit = limit
        }

        this.expenses = []
    }

    addExpense(desc, date, value) {
        this.expenses.push(new Expense(this.name, desc, date, value))
    }

    /**
     * 
     * @returns FixedExpenses enhanced list containing the boolean value isPaid
     */
    getFixedExpenses() {
        if (this.fixedExpenses != undefined) {
            let _fixedExpenses = this.fixedExpenses
            _fixedExpenses.forEach(fixexp => {
                fixexp.paid = this.isFixedExpensePaid(fixexp)
            })
            return _fixedExpenses
        }
    }

    /**
     * 
     * @param {*} fixedExpense 
     * @returns true if FixedExpense value is equals to any expense value and at least one word of FixedExpense name is found in any expense description.
     */
    isFixedExpensePaid(fixedExpense) {

        this.expenses.filter(exp => {
            return exp.value == (fixedExpense.value * -1)
        })

        let _paid = false
        this.expenses.forEach(exp => {
            if (exp.value == (fixedExpense.value * -1)) {
                let _words = fixedExpense.name.toLowerCase().split(" ")
                _words.forEach(word => {
                    if (exp.description.toLowerCase().includes(word.toLowerCase())) {
                        _paid = true
                        return _paid
                    }
                })
            }
        })
        return _paid
    }

    getExpensesSum() {
        let sum = 0.0
        this.expenses.forEach(elm => { sum = sum + parseFloat(elm.value) })
        return sum
    }

    getExpenseSumPercentage() {
        return Math.round((this.getExpensesSum() * -1) / this.limit * 100).toPrecision(3)
    }

    getAvailableValuePercentage() {
        return Math.round(100 - (this.getExpensesSum() * -1) / this.limit * 100).toPrecision(3)
    }

    // returns expenses list sorted by date
    getExpenses() {
        const sortedExpeneses = this.expenses.slice().sort((a, b) => (new Date(a.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")) - new Date(b.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))))
        return sortedExpeneses
    }

    getAvailableValue() {
        return parseFloat(this.limit) + this.getExpensesSum()
    }
}
class Expense {
    constructor(group, description, date, value) {
        this.group = group
        this.description = description
        this.date = date
        this.value = value
    }
}

class Incoming {
    constructor(description, date, value) {
        this.description = description
        this.date = date
        this.value = value
    }
}

module.exports.Transactions = ReportDataBuilder;