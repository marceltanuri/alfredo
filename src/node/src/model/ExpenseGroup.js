const Expense = require("./Expense")

module.exports = class ExpenseGroup {
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