const express = require('express');
const CryptoJS = require("crypto-js")
const fs = require('fs')
const ReportModelFactory = require("../model/ReportModelFactory");
const ReportModel = require('../model/ReportModel');
require('log-timestamp')
const router = express.Router();

const BUDGET_FILE_PATH = __dirname + '/../../../config/budget.json';
module.exports = class ReportController {

    constructor() {
        this.report = null
        this.lastReportUpdate = null
        this.budgetFile = fs.readFileSync(BUDGET_FILE_PATH)
        this.setRoutes()
        this.router = router
    }

    async initCache(){
        await this.#getTransactions()
        return this
    }

    setRoutes() {
        const instance = this

        router.get("/transactions", async function (req, res) {
            res.send(await instance.#getTransactions())
        })

        router.get("/lastReportUpdate", async function (req, res) {
            res.send(`{"lastReportUpdate":"${instance.lastReportUpdate}"}`)
        })

        router.get("/budget", async function (req, res) {
            res.send(await instance.#getBudget())
        })

        router.get("/categories", async function (req, res) {
            res.send(await instance.#createReportWithoutTransactions_OnlyBudgetCategories())
        })

        router.post("/transactions/refresh", async function (req, res) {
            instance.#refreshTransactions().then(res.sendStatus(200))
        })

        router.post("/budget/refresh", async function (req, res) {
            instance.#refreshBudget().then(res.sendStatus(200))
        })

        router.post("/categories/refresh", async function (req, res) {
            instance.#refreshCategories().then(res.sendStatus(200))
        })
    }

    async #createReportWithoutTransactions_OnlyBudgetCategories() {
        let _report = new ReportModel()
        _report.setBudget(JSON.parse(fs.readFileSync(BUDGET_FILE_PATH)))
        _report.classifyExpensesAndIncomings()
        return _report.toJSON()

    }

    async #getBudget() {
        if (this.report instanceof ReportModel) {
            return this.report.budget
        }
    }


    async #getTransactions() {
        if (this.report == null) {
            this.report = await new ReportModelFactory().createReport(JSON.parse(this.budgetFile))
            this.lastReportUpdate = new Date().toGMTString()
        }
        return this.report.toJSON()
    }


    async #refreshTransactions() {
        this.report = await new ReportModelFactory().createReport(this.budgetFile)
        this.lastReportUpdate = new Date().toGMTString()
    }

    async #refreshBudget() {
        if (this.report == null) {
            this.report = new ReportModel()
        }
        this.report.setBudget(JSON.parse(fs.readFileSync(BUDGET_FILE_PATH)))
    }

    async #refreshCategories() {
        if (this.report == null) {
            this.report = new ReportModel()
        }
        this.report.classifyExpensesAndIncomings()
    }

}


