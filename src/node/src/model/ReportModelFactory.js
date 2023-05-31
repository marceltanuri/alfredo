const fs = require('fs');
const BankTransactionsReaderFactory = require('./bankTransactionReader/BankTransactionsReaderFactory');
const ReportModel = require('./ReportModel');
const ExpenseGroup = require('./ExpenseGroup');

module.exports = class ReportModelFactory {

    async createReport(budgetFile) {
        let reportModel = new ReportModel()
        reportModel.setBudget(budgetFile)
        reportModel.transactionsSources = await this.#loadTransactions()
        reportModel.classifyExpensesAndIncomings()
        return reportModel
    }

    async updateReportBudget(report, budgetFile){
        if(report instanceof ReportModel){
            report.setBudget(budgetFile)
            report.classifyExpensesAndIncomings()
            return report
        }
    }

    async reclassifyReportCategories(report){
        if(report instanceof ReportModel){
            report.classifyExpensesAndIncomings()
            return report
        }
    }

    async #loadTransactions() {

        let transactionsSources = []

        const bankTransactionsReader = BankTransactionsReaderFactory.getBankTransactionsReader()

        let bankTransactions = await bankTransactionsReader.init()
            .then(res => res.doAuth()
                .then(res => res.getBalance()))

        bankTransactionsReader.close()

        transactionsSources.push({ "bank": bankTransactions })

        return transactionsSources

        // TODO filter transactions according to the report period (startDate - endDate)

        // TODO add ticketTransactions to transactionsSource
        // this.transactionsSources.push({ "ticket": ticketTransactions })

    }

}