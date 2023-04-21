# Alfredo Budget Report

### Budget control using docker, python and nodeJS.
- It automates bank and ticket transactions report reading
- Converts original reports in JSON structured data
- Organizes the expenses in categories based on transaction description regex
- Uses a configurable `budget.json` file to set the budget and description regex for each category. 
- Builds an expenses report with budget control




## Configure and start your container

```
sudo docker run -p 3000:3000 --name alfredo -d \
    -e alfredo_bank_ag="0000" \
    -e alfredo_bank_account="123456-7" \
    -e alfredo_bank_pw="myPass" \
    -e alfredo_json_crypto_key="pass123" \
    -e alfredo_bank_name="itau" \
    -e alfredo_budget_start_day="16" \
    -v <your budget.json file>:/usr/src/app/src/config/budget.json \
    marceltanuri/alfredo-budget-report 
```

## Tips

* alfredo_budget_start_day : `day of month you want to set as start date of your budget control`

* alfredo_json_crypto_key : `a password to protected your json data`

* alfredo_bank_account : `bank account number`

* alfredo_bank_ag : `bank ag (if exists)`

* alfredo_bank_pw: `homebanking password`

* alfredo_bank_name: `bank name, e.g (itau, santander, nubank) ::Only itau is supported so far::`

* Don't forget to create your own `budget.json` you can follow the example of the default file: `src/config/budget.json`



## You report will available at localhost:3000


### Docker image
https://hub.docker.com/repository/docker/marceltanuri/alfredo-budget-report/tags?page=1&ordering=last_updated


