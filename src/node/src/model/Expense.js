module.exports = class Expense {
    constructor(group, description, date, value) {
        this.group = group
        this.description = description
        this.date = date
        this.value = parseFloat(value) * -1
    }
}