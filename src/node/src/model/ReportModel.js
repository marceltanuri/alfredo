const ExpenseGroup = require("./ExpenseGroup")
const Incoming = require("./Incoming")

module.exports = class ReportModel {

    budget = {}
    transactionsSources = []
    balance = 0.0
    expensesGroup = []
    incomings = []
    estimatedIncomings = []



    setBudget(budget) {
        this.budget = budget
    }

    setTransactionsSources (transactionsSources) {
        this.transactionsSources = transactionsSources
    }


    classifyExpensesAndIncomings() {
        this.expensesGroup = []
        this.incomings = []

        this.budget.data.forEach(cat => {
            this.expensesGroup.push(new ExpenseGroup(cat))
        })

        this.estimatedIncomings = this.budget.incomings

        for (const transactionsSource of this.transactionsSources) {

            let transactionsSourceValue = Object.values(transactionsSource)[0]

            transactionsSourceValue.transactions.filter(transaction => transaction.type === "expense").forEach(debtTransaction => {
                this.addExpenseToExpenseGroupUsingExpDescriptionAndGroupRegexConfig(debtTransaction.description, debtTransaction.date, debtTransaction.value)
            })

            transactionsSourceValue.transactions.filter(transaction => transaction.type === "incoming").forEach(creditTransaction => {
                this.addIncoming(creditTransaction.description, creditTransaction.date, creditTransaction.value)
            })

        }
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

        console.log(json.totals.balances)

        json.incomings = {}
        json.estimatedIncomings = this.getEstimatedIncomings()
        json.incomings.data = this.getIncomings()
        json.incomings.sum = formatter.format(this.getIncomingsSum())

        return json
    }
}