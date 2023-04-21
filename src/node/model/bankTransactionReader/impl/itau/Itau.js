const puppeteer = require('puppeteer');
const CampoTeclado = require('./CampoTeclado.js');
const Transactions = require('../../../Transactions.js');
const Transaction = require('../../../Transaction.js');
const BankTransactionReader = require('../../BankTransactionReader.js');

module.exports = class Itau extends BankTransactionReader{

    #AUTH_START_PAGE_URL = "https://www.itau.com.br/contas/conta-corrente"
    #TRANSACTION_PERIOD_IN_DAYS = "60";

    browser = null
    page = null

    async init() {
        this.browser = await puppeteer.launch(
            {
                headless: false,
                defaultViewport: null,
                args: ['--start-maximized', '--no-sandbox']
            })


        this.page = await this.browser.newPage();
        return this
    }

    async doAuth() {
        console.log("Authenticating...")
        await this.page.goto(this.#AUTH_START_PAGE_URL);
        await this.#skipCookiesPolicyDialog()
        await this.#submitAccountForm()
        await this.#submitPasswordChallengeForm()

        return this
    }

    async #skipCookiesPolicyDialog() {
        console.log("Checking for cookies policy dialog...")
        try {
            await this.page.waitForSelector('#marco-civil-btn-ok');
            await this.page.click('#marco-civil-btn-ok');
        } catch (e) {
            console.info("No cookies policy dialog found to skip")
        }
    }

    async #submitAccountForm() {
        console.log("Inputing account number...")
        await this.page.waitForSelector('#agencia');
        await this.page.waitForTimeout(500)
        await this.page.type('#agencia', process.env.alfredo_bank_ag);

        await this.page.waitForTimeout(500)

        await this.page.waitForSelector('#conta');
        await this.page.type('#conta', process.env.alfredo_bank_account);

        await this.#waitAndClick('.login_button[type="submit"]')

    }

    async #waitAndClick(selector) {
        await this.page.waitForFunction(
          `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
          { visible: true },
        );
        await this.page.evaluate((selector) => document.querySelector(selector).click(), selector)
      }

      async #waitAndSelect(selector, option) {
        await this.page.waitForFunction(
          `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
          { visible: true },
        )

        await this.page.evaluate((option, selector) => {
            let selectElem = document.querySelector(selector)
            let optionElem = document.querySelector(selector + ` > option[value='${option}']`)
            optionElem.selected = true;
            const event = new Event('change', {bubbles: true});
            selectElem.dispatchEvent(event);
        }, option, selector);
      }

      async #waitAndReturn(selector) {
        await this.page.waitForFunction(
          `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
          { visible: true },
        );
        return await this.page.$$(selector)
      }

    async #submitPasswordChallengeForm() {

        console.log("Resolving password challenge...")
        let camposTeclado = await this.#getCamposTeclado()
        console.log(camposTeclado)

        const password = Array.from(process.env.alfredo_bank_pw)
        let passwordChallenge = ""

        for (const passwordChar of password) {
            camposTeclado.forEach(async campoTeclado => {
                if (campoTeclado instanceof CampoTeclado) {
                    if (campoTeclado.includes(passwordChar)) {
                        passwordChallenge += campoTeclado.getIdSufix()
                    }
                }
            })
        }

        await this.page.$eval('#placeHolderSenhaTeclado', el => el.value = "")

        await this.page.$eval('#senha', el => el.type = "password")
        await this.page.$eval('#senha', (el, pw) => el.value = pw, passwordChallenge)
        console.log('Password challenge resolved')

        await this.page.waitForTimeout(500)
        await this.#waitAndClick('#acessar')
    }

    async #getCamposTeclado() {
        let campos = []
        const camposTeclado = await this.#waitAndReturn('a.campoTeclado')

        for (const campoTeclado of camposTeclado) {
            let id = await (await campoTeclado.getProperty("rel")).jsonValue()
            let value = await (await campoTeclado.getProperty("innerText")).jsonValue()
            campos.push(new CampoTeclado(id, value))
        }

        return campos
    }

    async getBalance() {
        console.log(`Extracting transactions (last ${this.#TRANSACTION_PERIOD_IN_DAYS} days)...`)
        await this.#waitAndClick('#saldo-extrato-card-accordion')
        await this.#waitAndClick('button[aria-label="ver extrato"]')

        await this.#waitAndSelect("#select-78",this.#TRANSACTION_PERIOD_IN_DAYS)

        const transactionsSelector = '#corpoTabela-gridLancamentos-pessoa-fisica > tr:not(.linha-descricao-mes-ano, .linha-tabela-lancamentos-pf-saldo-dia)'
        await this.page.waitForSelector(transactionsSelector);
        const transactionsRows = await this.page.$$(transactionsSelector)

        const totalBalanceSelector = '#cor-valor-saldo-box'
        await this.page.waitForSelector(totalBalanceSelector);
        
        let totalBalance = await (await (await this.page.$(totalBalanceSelector)).getProperty("innerText")).jsonValue()
        totalBalance = totalBalance.replace("R$ ", "").replace(".","").replace(",",".")

        let transactionsObj = new Transactions(totalBalance)

        for (const transaction of transactionsRows) {
            let data = await transaction.$$("td")

            let date = await (await data[0].getProperty("innerText")).jsonValue()
            let desc = await (await data[1].getProperty("innerText")).jsonValue()
            
            let value = await (await data[2].getProperty("innerText")).jsonValue()
            value = value.replace(".","").replace(",",".")

            console.log(`adding transaction: date: ${date}, desc: ${desc}, value: ${value}`)
            transactionsObj.addTransaction(new Transaction(date, desc, value))
        }

        return transactionsObj;
    }

    async close(){
        await this.browser.close()
    }

}
