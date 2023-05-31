const puppeteer = require('puppeteer');
const fs = require('fs')

async function main() {
    const browser = await puppeteer.launch(
        {
            headless: false,
            userDataDir: __dirname + '/chrome_data',
            defaultViewport: null,
            args: ['--start-maximized']
        });

    const authPage = await browser.newPage();

    authPage.on('response', async (response) => {
        if (response.url().includes("BCP.SDC.FEP.Foundation.Presentation/Login.aspx")) {
            let loginPostData = response.request().postData()
            try {

                var dir = __dirname + '/../../.postData';

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                fs.writeFileSync(dir + "/loginPostData.txt", loginPostData)
                //file written successfully
            } catch (err) {
                console.error(err)
            }
        }
    })

    await authPage.goto("https://ind.millenniumbcp.pt/pt/particulares/Pages/Welcome.aspx");
    try {
        await authPage.waitForSelector('#btnAcceptS1CookiesV2');
        await authPage.click('#btnAcceptS1CookiesV2');
    } catch (e) {

    }
    await authPage.waitForSelector('#iUserCode');
    console.log(await authPage.$('#iUserCode'))
    await authPage.type('#iUserCode', process.env.alfredo_bank_account);

    await authPage.waitForSelector('#aLogin');
    await authPage.click('#aLogin');

    console.log("waiting for authentication...")
    await authPage.waitForSelector('#lblPosition_1');
    const lblPosition_1 = await authPage.$('#lblPosition_1')
    const lblPosition_2 = await authPage.$('#lblPosition_2')
    const lblPosition_3 = await authPage.$('#lblPosition_3')

    await authPage.evaluate(el => el.textContent, lblPosition_1).then(val => {
        let index = parseInt(val.substring(0, 1)) - 1
        const value = process.env.alfredo_bank_pw.charAt(index);
        console.log("1: " + value)
        authPage.type('#txtPosition_1', value);

    })

    await authPage.waitForTimeout(200);


    await authPage.evaluate(el => el.textContent, lblPosition_2).then(val => {
        let index = parseInt(val.substring(0, 1)) - 1
        const value = process.env.alfredo_bank_pw.charAt(index);
        console.log("2: " + value)
        authPage.type('#txtPosition_2', value);
    })

    await authPage.waitForTimeout(200);

    await authPage.evaluate(el => el.textContent, lblPosition_3).then(val => {
        let index = parseInt(val.substring(0, 1)) - 1
        const value = process.env.alfredo_bank_pw.charAt(index);
        console.log("3: " + value)
        authPage.type('#txtPosition_3', value);
    })

    await authPage.waitForSelector('#btnValidate');
    await authPage.click('#btnValidate');
    await authPage.waitForTimeout(1000);

    return;
    await authPage.waitForSelector("a[href='/pt/Accounts/Pages/Contas.aspx?trxid=1510003']");
    await authPage.goto('https://ind.millenniumbcp.pt/pt/Accounts/Pages/Contas.aspx?trxid=1510003')
    
    await authPage.waitForTimeout(1000);
    await authPage.waitForSelector("#ctl00_ctl00_PlaceHolderMainBase_PlaceHolderMain__bcpTransactionContainer_ctl01_prtControl_hdnExportFilterFields")
    const jsonFilter = await authPage.$('#ctl00_ctl00_PlaceHolderMainBase_PlaceHolderMain__bcpTransactionContainer_ctl01_prtControl_hdnExportFilterFields')
    await authPage.evaluate(el => el.value, jsonFilter).then(val => {
        console.log("jsonFilter" + val)
    })
    
}

main();
